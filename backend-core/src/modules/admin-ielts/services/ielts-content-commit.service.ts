import {
  Injectable,
  UnprocessableEntityException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { AdminAuditLogService } from "./admin-audit-log.service";
import {
  ContentImportStatus,
  ContentImportSkill,
  ContentImportTargetSystem,
  IeltsIntensiveExamType,
  Difficulty,
} from "@prisma/client";

@Injectable()
export class IeltsContentCommitService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AdminAuditLogService
  ) {}

  /**
   * Asserts that the structured JSON is fully compatible with the AI grader and database shape.
   */
  assertGraderCompatible(json: any, skill: ContentImportSkill, targetSystem: ContentImportTargetSystem): void {
    if (!json) {
      throw new UnprocessableEntityException("JSON content is empty.");
    }

    if (skill === ContentImportSkill.LISTENING || skill === ContentImportSkill.READING) {
      const ansMap = new Map<string, any>();
      const typeMap = new Map<string, string>();

      const whitelistedTypes = new Set([
        "multiple_choice",
        "multiple_choice_multiple",
        "short_answer",
        "form_completion",
        "note_completion",
        "sentence_completion",
        "summary_completion",
        "matching",
        "matching_features",
        "matching_information",
        "matching_headings",
        "table_completion",
        "true_false_not_given",
        "yes_no_not_given",
        "fill_blank"
      ]);

      // Recursive answer and type extractor identical to the grader's logic
      const extract = (obj: any) => {
        if (obj && typeof obj === "object") {
          if (Array.isArray(obj)) {
            obj.forEach(extract);
          } else {
            // BUG-07: matching answers in group.answers
            if (
              typeof obj.type === "string" &&
              obj.type.startsWith("matching") &&
              obj.answers &&
              typeof obj.answers === "object"
            ) {
              for (const [k, v] of Object.entries(obj.answers)) {
                const letter = (v as any)?.letter ?? v;
                if (letter !== undefined && letter !== null) {
                  ansMap.set(`match:${k}`, letter);
                  typeMap.set(`match:${k}`, obj.type);
                }
              }
            }

            // BUG-07: table_completion answers in rows[].questions[qNum].answer
            if (Array.isArray(obj.rows)) {
              for (const row of obj.rows) {
                if (row?.questions && typeof row.questions === "object") {
                  for (const [qNum, cell] of Object.entries(row.questions)) {
                    const cellAns = (cell as any)?.answer;
                    if (cellAns !== undefined && cellAns !== null) {
                      ansMap.set(String(qNum), cellAns);
                      typeMap.set(String(qNum), "fill_blank");
                    }
                  }
                }
              }
            }

            let ans =
              obj.correct_answer !== undefined
                ? obj.correct_answer
                : obj.answer !== undefined
                  ? obj.answer
                  : obj.correct_answers;
            
            const hasQNum = typeof obj.question_number === "number" || Array.isArray(obj.question_numbers);
            
            if (hasQNum) {
              const qType = String(obj.type || "").toLowerCase().trim();
              if (qType && !whitelistedTypes.has(qType)) {
                throw new UnprocessableEntityException(
                  `Invalid question type "${obj.type}" detected. Must be an official whitelisted IELTS question type.`
                );
              }
              
              if (ans === undefined || ans === null || String(ans).trim() === "") {
                throw new UnprocessableEntityException(
                  `Invalid answer key for question(s) [${obj.question_number || (obj.question_numbers && obj.question_numbers.join(',')) || 'unknown'}]: Answer cannot be empty.`
                );
              }

              // Strict Server-Side Normalization
              let ansStr = String(ans).trim();
              const isCompletion = 
                qType.includes("completion") || 
                qType.includes("short_answer") || 
                qType.includes("fill_blank");
              
              const isTrueFalse = 
                qType.includes("true_false_not_given") || 
                qType.includes("yes_no_not_given");

              if (isCompletion) {
                ansStr = ansStr.toLowerCase();
              } else if (isTrueFalse) {
                ansStr = ansStr.toUpperCase();
                if (
                  ansStr !== "TRUE" && ansStr !== "FALSE" && ansStr !== "NOT GIVEN" &&
                  ansStr !== "YES" && ansStr !== "NO"
                ) {
                  throw new UnprocessableEntityException(
                    `Invalid evaluation answer "${ansStr}" for type "${obj.type}". Must be TRUE, FALSE, YES, NO or NOT GIVEN.`
                  );
                }
              }

              // Update the mutable object so that the committed DB questions payload is clean and fully normalized!
              if (obj.correct_answer !== undefined) {
                obj.correct_answer = ansStr;
              }
              if (obj.answer !== undefined) {
                obj.answer = ansStr;
              }
              ans = ansStr;

              if (typeof obj.question_number === "number") {
                const key = String(obj.question_number);
                ansMap.set(key, ans);
                if (obj.type) typeMap.set(key, String(obj.type));
              } else if (Array.isArray(obj.question_numbers)) {
                const key = (obj.question_numbers as number[]).join(",");
                ansMap.set(key, ans);
                if (obj.type) typeMap.set(key, String(obj.type));
              }
            } else {
              Object.values(obj).forEach(extract);
            }
          }
        }
      };

      extract(json);

      if (ansMap.size === 0) {
        throw new UnprocessableEntityException(
          "Invalid questions format: No correct answers could be parsed from the JSON schema. Grader will not be able to score attempts."
        );
      }

      // Check answer format (parentheses, slashes, blanks)
      for (const [key, correct] of ansMap.entries()) {
        const ansStr = String(correct);

        // 1. Verify Balanced Parentheses for optional spellings like "colo(u)r"
        let parenCount = 0;
        for (let i = 0; i < ansStr.length; i++) {
          if (ansStr[i] === '(') parenCount++;
          else if (ansStr[i] === ')') {
            parenCount--;
            if (parenCount < 0) {
              throw new UnprocessableEntityException(
                `Malformed answer key on question(s) [${key}]: Unbalanced parentheses in "${ansStr}"`
              );
            }
          }
        }
        if (parenCount !== 0) {
          throw new UnprocessableEntityException(
            `Malformed answer key on question(s) [${key}]: Unbalanced parentheses in "${ansStr}"`
          );
        }

        // 2. Verify Correct Slashes for alternates like "answer1/answer2"
        if (ansStr.includes("//") || ansStr.startsWith("/") || ansStr.endsWith("/")) {
          throw new UnprocessableEntityException(
            `Malformed answer key on question(s) [${key}]: Invalid slash formatting in "${ansStr}"`
          );
        }
      }
    }
  }

  /**
   * Commits a single ContentImportJob to the live tables.
   */
  async commit(jobId: string, overwrite = false, _unusedIsPublished = false, userId?: string, _fromGroup = false): Promise<string> {
    const job = await this.prisma.contentImportJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException(`Import job with ID ${jobId} not found.`);
    }

    if (job.groupId && !_fromGroup) {
      throw new ConflictException(
        "Job belongs to a FULL_TEST group — please use the group commit endpoint."
      );
    }

    if (job.status === ContentImportStatus.FAILED) {
      throw new BadRequestException(job.error || "Job has failed extraction. Please retry.");
    }

    if (job.status !== ContentImportStatus.AWAITING_REVIEW && job.status !== ContentImportStatus.COMMITTED) {
      throw new ConflictException(
        `Job cannot be committed. Current status is: ${job.status}`
      );
    }

    const structuredJson = job.structuredJson as any;
    if (!structuredJson) {
      throw new UnprocessableEntityException(
        "Structured JSON is missing. Run extraction first."
      );
    }

    // 1. Assert grader compatibility
    this.assertGraderCompatible(structuredJson, job.skill, job.targetSystem);

    const provenance = (job.provenance as any) || {};
    const source = provenance.source || "imported";
    const bookNumber = provenance.bookNumber !== undefined ? Number(provenance.bookNumber) : null;
    const testNumber = provenance.testNumber !== undefined ? Number(provenance.testNumber) : null;
    const quarter = provenance.quarter || null;
    const year = provenance.year !== undefined ? Number(provenance.year) : null;
    const title = structuredJson.title || provenance.title || `${source} - ${job.skill} Job ${job.id.substring(0, 8)}`;

    let liveId = "";

    // Run inside database transaction for safety
    await this.prisma.$transaction(async (tx) => {
      if (job.targetSystem === ContentImportTargetSystem.INTENSIVE) {
        // --- INTENSIVE MOCK EXAM BRANCH ---
        const intensiveSkillMap: Record<ContentImportSkill, IeltsIntensiveExamType> = {
          [ContentImportSkill.LISTENING]: IeltsIntensiveExamType.LISTENING,
          [ContentImportSkill.READING]: IeltsIntensiveExamType.READING,
          [ContentImportSkill.WRITING]: IeltsIntensiveExamType.WRITING,
          [ContentImportSkill.SPEAKING]: IeltsIntensiveExamType.SPEAKING,
          [ContentImportSkill.FULL_TEST]: IeltsIntensiveExamType.FULL_TEST,
        };

        const type = intensiveSkillMap[job.skill];

        // Anti-duplicate check
        const existing = await tx.ieltsIntensiveExam.findFirst({
          where: { title, type },
        });

        if (existing && !overwrite) {
          throw new ConflictException({
            message: `An intensive exam with title "${title}" and skill "${job.skill}" already exists.`,
            existingId: existing.id,
          });
        }

        const data: any = {
          title,
          description: structuredJson.description || null,
          imageUrl: structuredJson.imageUrl || null,
          duration: structuredJson.duration ? Number(structuredJson.duration) : 60,
          type,
          difficulty: (structuredJson.difficulty?.toUpperCase() as Difficulty) || Difficulty.ADVANCED,
          isPublished: false, // Default isPublished to false during admin commit
          questions: (type === IeltsIntensiveExamType.READING || type === IeltsIntensiveExamType.LISTENING)
            ? this.transformToPartsFormat(structuredJson, job.skill, title, job.audioUrls)
            : structuredJson,
          source,
          bookNumber,
          testNumber,
          quarter,
          year,
          importJobId: job.id,
        };

        if (existing && overwrite) {
          const updated = await tx.ieltsIntensiveExam.update({
            where: { id: existing.id },
            data,
          });
          liveId = updated.id;
        } else {
          const created = await tx.ieltsIntensiveExam.create({
            data,
          });
          liveId = created.id;
        }
      } else {
        // --- ADVANCED BANK BRANCH ---
        if (job.skill === ContentImportSkill.LISTENING) {
          const partNumber = Number(structuredJson.partNumber || 1);
          const existing = await tx.ieltsAdvancedListeningPart.findFirst({
            where: { source, bookNumber, testNumber, partNumber },
          });

          if (existing && !overwrite) {
            throw new ConflictException({
              message: `An advanced listening part for source ${source} book ${bookNumber} test ${testNumber} part ${partNumber} already exists.`,
              existingId: existing.id,
            });
          }

          const data = {
            title,
            partNumber,
            audioUrl: structuredJson.audioUrl || "",
            transcript: structuredJson.transcript || {},
            content: structuredJson.content || {},
            questionTypes: structuredJson.questionTypes || [],
            source,
            bookNumber,
            testNumber,
            isPublished: false,
            importJobId: job.id,
          };

          if (existing && overwrite) {
            const updated = await tx.ieltsAdvancedListeningPart.update({
              where: { id: existing.id },
              data,
            });
            liveId = updated.id;
          } else {
            const created = await tx.ieltsAdvancedListeningPart.create({
              data,
            });
            liveId = created.id;
          }
        } else if (job.skill === ContentImportSkill.READING) {
          const partNumber = Number(structuredJson.partNumber || 1);
          const existing = await tx.ieltsAdvancedReadingPart.findFirst({
            where: { source, bookNumber, testNumber, partNumber },
          });

          if (existing && !overwrite) {
            throw new ConflictException({
              message: `An advanced reading part for source ${source} book ${bookNumber} test ${testNumber} part ${partNumber} already exists.`,
              existingId: existing.id,
            });
          }

          const data = {
            title,
            partNumber,
            passage: structuredJson.passage || "",
            passageWithLocations: structuredJson.passageWithLocations || {},
            content: structuredJson.content || {},
            questionTypes: structuredJson.questionTypes || [],
            source,
            bookNumber,
            testNumber,
            isPublished: false,
            importJobId: job.id,
          };

          if (existing && overwrite) {
            const updated = await tx.ieltsAdvancedReadingPart.update({
              where: { id: existing.id },
              data,
            });
            liveId = updated.id;
          } else {
            const created = await tx.ieltsAdvancedReadingPart.create({
              data,
            });
            liveId = created.id;
          }
        } else if (job.skill === ContentImportSkill.WRITING) {
          const engnovateSlug = structuredJson.engnovateSlug || null;
          let existing = null;
          if (engnovateSlug) {
            existing = await tx.ieltsAdvancedWritingPrompt.findUnique({
              where: { engnovateSlug },
            });
          } else {
            existing = await tx.ieltsAdvancedWritingPrompt.findFirst({
              where: { source, bookNumber, testNumber, taskType: structuredJson.taskType || "TASK_1" },
            });
          }

          if (existing && !overwrite) {
            throw new ConflictException({
              message: `An advanced writing prompt with slug "${engnovateSlug}" already exists.`,
              existingId: existing.id,
            });
          }

          const data = {
            taskType: structuredJson.taskType || "TASK_1",
            subType: structuredJson.subType || "essay",
            source: structuredJson.source || source,
            category: structuredJson.category || "cambridge-academic",
            bookNumber,
            testNumber,
            title,
            prompt: structuredJson.prompt || "",
            imageUrl: structuredJson.imageUrl || null,
            minimumWords: structuredJson.minimumWords ? Number(structuredJson.minimumWords) : 150,
            suggestedTime: structuredJson.suggestedTime ? Number(structuredJson.suggestedTime) : 20,
            difficulty: structuredJson.difficulty || "medium",
            engnovateSlug,
            isPublished: false,
            importJobId: job.id,
          };

          if (existing && overwrite) {
            const updated = await tx.ieltsAdvancedWritingPrompt.update({
              where: { id: existing.id },
              data,
            });
            liveId = updated.id;
          } else {
            const created = await tx.ieltsAdvancedWritingPrompt.create({
              data,
            });
            liveId = created.id;
          }
        } else if (job.skill === ContentImportSkill.SPEAKING) {
          const partNumber = Number(structuredJson.partNumber || 1);
          const engnovateSlug = structuredJson.engnovateSlug || null;
          let existing = null;
          if (engnovateSlug) {
            existing = await tx.ieltsAdvancedSpeakingPart.findUnique({
              where: { engnovateSlug_partNumber: { engnovateSlug, partNumber } },
            });
          } else {
            existing = await tx.ieltsAdvancedSpeakingPart.findFirst({
              where: { source, bookNumber, testNumber, partNumber },
            });
          }

          if (existing && !overwrite) {
            throw new ConflictException({
              message: `An advanced speaking part with slug "${engnovateSlug}" and part ${partNumber} already exists.`,
              existingId: existing.id,
            });
          }

          const data = {
            partNumber,
            partType: structuredJson.partType || "interview",
            topic: structuredJson.topic || "",
            source: structuredJson.source || source,
            category: structuredJson.category || "cambridge-academic",
            bookNumber,
            testNumber,
            title,
            questions: structuredJson.questions || [],
            engnovateSlug,
            isPublished: false,
            importJobId: job.id,
          };

          if (existing && overwrite) {
            const updated = await tx.ieltsAdvancedSpeakingPart.update({
              where: { id: existing.id },
              data,
            });
            liveId = updated.id;
          } else {
            const created = await tx.ieltsAdvancedSpeakingPart.create({
              data,
            });
            liveId = created.id;
          }
        }
      }

      // 3. Mark the staging job as committed
      await tx.contentImportJob.update({
        where: { id: jobId },
        data: {
          status: ContentImportStatus.COMMITTED,
          committedEntityId: liveId,
        },
      });
    });

    if (userId) {
      await this.auditLogService.log(
        userId,
        "COMMIT",
        job.targetSystem === ContentImportTargetSystem.INTENSIVE ? "INTENSIVE_EXAM" : "ADVANCED_PART",
        liveId,
        { jobId: job.id, skill: job.skill, targetSystem: job.targetSystem, title }
      );
    }

    return liveId;
  }

  /**
   * Commits a full group of jobs (typically 4 skills for a FULL_TEST).
   */
  async commitGroup(groupId: string, isPublished = false, userId?: string): Promise<{ examIds: string[] }> {
    const jobs = await this.prisma.contentImportJob.findMany({
      where: { groupId },
    });

    if (jobs.length === 0) {
      throw new NotFoundException(`No staging jobs found under groupId: ${groupId}`);
    }

    // Lock gate: ensure no job is currently in progress or failed
    const activeStates: ContentImportStatus[] = [
      ContentImportStatus.PENDING,
      ContentImportStatus.SCRAPING,
      ContentImportStatus.EXTRACTING,
      ContentImportStatus.FAILED,
    ];
    const unfinishedJobs = jobs.filter((j) => activeStates.includes(j.status));
    if (unfinishedJobs.length > 0) {
      const failedJob = unfinishedJobs.find((j) => j.status === ContentImportStatus.FAILED);
      if (failedJob && failedJob.error) {
        throw new BadRequestException(
          `Cannot commit the exam group because the (${failedJob.skill}) part failed: ${failedJob.error}`
        );
      }
      throw new ConflictException(
        "Cannot commit group. Some parts of the test are still in progress or failed (retry or discard them first)."
      );
    }

    // Filter committed/reviewable jobs
    const reviewableJobs = jobs.filter(
      (j) => j.status === ContentImportStatus.AWAITING_REVIEW || j.status === ContentImportStatus.COMMITTED
    );

    if (reviewableJobs.length === 0) {
      throw new UnprocessableEntityException("All jobs in the group are discarded or failed.");
    }

    const examIds: string[] = [];

    if (reviewableJobs.length === 4) {
      // Merging 4-skills into a unified FULL_TEST mock exam
      const listeningJob = reviewableJobs.find((j) => j.skill === ContentImportSkill.LISTENING);
      const readingJob = reviewableJobs.find((j) => j.skill === ContentImportSkill.READING);
      const writingJob = reviewableJobs.find((j) => j.skill === ContentImportSkill.WRITING);
      const speakingJob = reviewableJobs.find((j) => j.skill === ContentImportSkill.SPEAKING);

      if (!listeningJob || !readingJob || !writingJob || !speakingJob) {
        throw new UnprocessableEntityException("Group requires exactly 4 skills (L, R, W, S) to merge.");
      }

      // Assert grader compatibility for all 4 skills before merging!
      for (const j of [listeningJob, readingJob, writingJob, speakingJob]) {
        this.assertGraderCompatible(j.structuredJson, j.skill, ContentImportTargetSystem.INTENSIVE);
      }

      const provenance = (listeningJob.provenance as any) || {};
      const source = provenance.source || "imported";
      const bookNumber = provenance.bookNumber !== undefined ? Number(provenance.bookNumber) : null;
      const testNumber = provenance.testNumber !== undefined ? Number(provenance.testNumber) : null;
      const quarter = provenance.quarter || null;
      const year = provenance.year !== undefined ? Number(provenance.year) : null;
      const title = provenance.title || `${source} - Full Mock Test ${bookNumber ? "Book " + bookNumber : ""} ${testNumber ? "Test " + testNumber : ""}`;

      const mergedQuestions = {
        type: "full_test",
        listening: this.transformToPartsFormat(listeningJob.structuredJson, ContentImportSkill.LISTENING, `${title} - Listening`, listeningJob.audioUrls),
        reading: this.transformToPartsFormat(readingJob.structuredJson, ContentImportSkill.READING, `${title} - Reading`),
        writing: writingJob.structuredJson,
        speaking: speakingJob.structuredJson,
      };

      await this.prisma.$transaction(async (tx) => {
        // Create full test mock exam
        const created = await tx.ieltsIntensiveExam.create({
          data: {
            title,
            description: `Full IELTS exam including Listening, Reading, Writing, and Speaking compiled from Group Job ${groupId}`,
            duration: 175, // 40 (L) + 60 (R) + 60 (W) + 15 (S)
            type: IeltsIntensiveExamType.FULL_TEST,
            difficulty: Difficulty.ADVANCED,
            isPublished: false,
            questions: mergedQuestions,
            source,
            bookNumber,
            testNumber,
            quarter,
            year,
            importJobId: listeningJob.id, // Reference listening job ID as anchor
          },
        });

        examIds.push(created.id);

        // Update all jobs in the group to COMMITTED
        for (const j of reviewableJobs) {
          await tx.contentImportJob.update({
            where: { id: j.id },
            data: {
              status: ContentImportStatus.COMMITTED,
              committedEntityId: created.id,
            },
          });
        }
      });

      if (userId) {
        await this.auditLogService.log(
          userId,
          "COMMIT_GROUP",
          "INTENSIVE_EXAM",
          examIds[0],
          { groupId, skill: ContentImportSkill.FULL_TEST, title }
        );
      }
    } else {
      // 1-3 skills committed -> Commit them as multiple single-skill exams!
      for (const j of reviewableJobs) {
        if (j.status !== ContentImportStatus.COMMITTED) {
          const liveId = await this.commit(j.id, true, isPublished, userId, true);
          examIds.push(liveId);
        } else if (j.committedEntityId) {
          examIds.push(j.committedEntityId);
        }
      }
    }

    return { examIds };
  }

  transformToPartsFormat(flatJson: any, skill: ContentImportSkill, title: string, audioUrls?: string[]): any {
    if (!flatJson) return flatJson;
    
    // If it already has parts, check if they are in the AI format or player format
    if (Array.isArray(flatJson.parts)) {
      // If the first part already has question_groups, it's already in the correct player format!
      if (flatJson.parts.length > 0 && Array.isArray(flatJson.parts[0].question_groups)) {
        return flatJson;
      }

      // Otherwise, transform each AI part into the player format
      const transformedParts = flatJson.parts.map((p: any, idx: number) => {
        const content = p.content || [];
        const questionGroups: any[] = [];
        let currentGroup: any = null;

        for (const q of content) {
          const qType = String(q.type || "").toLowerCase().trim();
          let mappedType = "Short Answer";
          let instructions = "Answer the questions below.";
          
          if (qType.includes("multiple_choice")) {
            mappedType = "Multiple Choice";
            instructions = "Choose the correct letter, A, B, C or D.";
          } else if (qType.includes("true_false_not_given")) {
            mappedType = "True/False/Not Given";
            instructions = "Do the following statements agree with the information given in the Reading Passage? Write TRUE, FALSE or NOT GIVEN.";
          } else if (qType.includes("yes_no_not_given")) {
            mappedType = "Yes/No/Not Given";
            instructions = "Do the following statements agree with the claims of the writer? Write YES, NO or NOT GIVEN.";
          } else if (qType.includes("matching")) {
            mappedType = "Matching";
            instructions = "Match the correct options.";
          } else if (qType.includes("sentence_completion")) {
            mappedType = "Sentence Completion";
            instructions = "Complete the sentences below. Choose ONE WORD ONLY from the passage.";
          } else if (qType.includes("note_completion")) {
            mappedType = "Note Completion";
            instructions = "Complete the notes below. Choose ONE WORD ONLY from the passage.";
          } else if (qType.includes("summary_completion")) {
            mappedType = "Summary Completion";
            instructions = "Complete the summary below. Choose ONE WORD ONLY from the passage.";
          } else if (qType.includes("table_completion")) {
            mappedType = "Table Completion";
            instructions = "Complete the table below. Choose ONE WORD ONLY from the passage.";
          } else if (qType.includes("form_completion")) {
            mappedType = "Form Completion";
            instructions = "Complete the form below. Choose ONE WORD ONLY from the passage.";
          }

          let formattedOptions: any = null;
          if (Array.isArray(q.options)) {
            formattedOptions = {};
            for (const opt of q.options) {
              const optStr = String(opt).trim();
              const dotIdx = optStr.indexOf(".");
              if (dotIdx > 0) {
                const letter = optStr.substring(0, dotIdx).trim().toUpperCase();
                const val = optStr.substring(dotIdx + 1).trim();
                formattedOptions[letter] = val;
              } else {
                const letter = optStr.substring(0, 1).toUpperCase();
                const val = optStr.substring(1).trim();
                formattedOptions[letter] = val;
              }
            }
          }

          const item: any = {
            question_number: q.question_number,
            question_text: q.question_text || q.text || "",
            answer: q.correct_answer || q.answer || "",
            explanation: q.explanation || null,
          };
          if (formattedOptions) {
            item.options = formattedOptions;
          }

          // Matching groups split on options fingerprint so matching_information (A-G)
          // and matching_features (A. TSI Cut…) are never merged into one group.
          const isMatchingGroup = mappedType === "Matching";
          const groupKey = isMatchingGroup
            ? `${mappedType}::${JSON.stringify(formattedOptions)}`
            : mappedType;

          if (!currentGroup || (currentGroup as any)._groupKey !== groupKey) {
            currentGroup = {
              question_type: mappedType,
              instructions: instructions,
              questions: "",
              items: [],
            } as any;
            if (isMatchingGroup && formattedOptions && Object.keys(formattedOptions).length > 0) {
              (currentGroup as any).options_box = { options: formattedOptions };
            }
            (currentGroup as any)._groupKey = groupKey;
            questionGroups.push(currentGroup);
          }

          currentGroup.items.push(item);
        }

        for (const g of questionGroups) {
          delete (g as any)._groupKey;
          const qNums = g.items.map((i: any) => i.question_number).filter((n: any) => typeof n === "number");
          if (qNums.length > 0) {
            const min = Math.min(...qNums);
            const max = Math.max(...qNums);
            g.questions = min === max ? `${min}` : `${min}–${max}`;
          }
        }

        const transformedPart: any = {
          part_number: p.partNumber || p.part_number || 1,
          part_type: skill === ContentImportSkill.READING ? "Reading Passage" : "Listening Part",
          topic: p.title || p.topic || title,
          question_groups: questionGroups
        };

        if (skill === ContentImportSkill.READING) {
          transformedPart.passage_text = p.passage || p.passage_text || "";
        } else {
          transformedPart.transcript = p.transcript || [];
          // Preserve audio URL so the mobile player can load the track.
          // AI pipeline produces camelCase (audioUrl); seed data uses snake_case (audio_url).
          transformedPart.audio_url = p.audioUrl || p.audio_url || (audioUrls && audioUrls[idx]) || null;
        }

        return transformedPart;
      });

      return {
        test_title: flatJson.title || title,
        section: skill === ContentImportSkill.READING ? "Reading" : "Listening",
        parts: transformedParts
      };
    }

    const content = flatJson.content || [];
    if (content.length === 0) return flatJson;

    // Group consecutive questions by their type
    const questionGroups: any[] = [];
    let currentGroup: any = null;

    for (const q of content) {
      const qType = String(q.type || "").toLowerCase().trim();
      
      // Determine the group type and instructions based on the question type
      let mappedType = "Short Answer";
      let instructions = "Answer the questions below.";
      
      if (qType.includes("multiple_choice")) {
        mappedType = "Multiple Choice";
        instructions = "Choose the correct letter, A, B, C or D.";
      } else if (qType.includes("true_false_not_given")) {
        mappedType = "True/False/Not Given";
        instructions = "Do the following statements agree with the information given in the Reading Passage? Write TRUE, FALSE or NOT GIVEN.";
      } else if (qType.includes("yes_no_not_given")) {
        mappedType = "Yes/No/Not Given";
        instructions = "Do the following statements agree with the claims of the writer? Write YES, NO or NOT GIVEN.";
      } else if (qType.includes("matching")) {
        mappedType = "Matching";
        instructions = "Match the correct options.";
      } else if (qType.includes("sentence_completion")) {
        mappedType = "Sentence Completion";
        instructions = "Complete the sentences below. Choose ONE WORD ONLY from the passage.";
      } else if (qType.includes("note_completion")) {
        mappedType = "Note Completion";
        instructions = "Complete the notes below. Choose ONE WORD ONLY from the passage.";
      } else if (qType.includes("summary_completion")) {
        mappedType = "Summary Completion";
        instructions = "Complete the summary below. Choose ONE WORD ONLY from the passage.";
      } else if (qType.includes("table_completion")) {
        mappedType = "Table Completion";
        instructions = "Complete the table below. Choose ONE WORD ONLY from the passage.";
      } else if (qType.includes("form_completion")) {
        mappedType = "Form Completion";
        instructions = "Complete the form below. Choose ONE WORD ONLY from the passage.";
      }

      // Format options from array ["A. Text", "B. Text"] into record {"A": "Text", "B": "Text"} if multiple_choice
      let formattedOptions: any = null;
      if (Array.isArray(q.options)) {
        formattedOptions = {};
        for (const opt of q.options) {
          const optStr = String(opt).trim();
          const dotIdx = optStr.indexOf(".");
          if (dotIdx > 0) {
            const letter = optStr.substring(0, dotIdx).trim().toUpperCase();
            const val = optStr.substring(dotIdx + 1).trim();
            formattedOptions[letter] = val;
          } else {
            const letter = optStr.substring(0, 1).toUpperCase();
            const val = optStr.substring(1).trim();
            formattedOptions[letter] = val;
          }
        }
      }

      const item: any = {
        question_number: q.question_number,
        question_text: q.question_text || q.text || "",
        answer: q.correct_answer || q.answer || "",
        explanation: q.explanation || null,
      };
      if (formattedOptions) {
        item.options = formattedOptions;
      }

      const isMatchingGroup = mappedType === "Matching";
      const groupKey = isMatchingGroup
        ? `${mappedType}::${JSON.stringify(formattedOptions)}`
        : mappedType;

      if (!currentGroup || (currentGroup as any)._groupKey !== groupKey) {
        currentGroup = {
          question_type: mappedType,
          instructions: instructions,
          questions: "",
          items: [],
        } as any;
        if (isMatchingGroup && formattedOptions && Object.keys(formattedOptions).length > 0) {
          (currentGroup as any).options_box = { options: formattedOptions };
        }
        (currentGroup as any)._groupKey = groupKey;
        questionGroups.push(currentGroup);
      }

      currentGroup.items.push(item);
    }

    // Calculate question range string for each group (e.g. "1-6")
    for (const g of questionGroups) {
      delete (g as any)._groupKey;
      const qNums = g.items.map((i: any) => i.question_number).filter((n: any) => typeof n === "number");
      if (qNums.length > 0) {
        const min = Math.min(...qNums);
        const max = Math.max(...qNums);
        g.questions = min === max ? `${min}` : `${min}–${max}`;
      }
    }

    const part: any = {
      part_number: flatJson.partNumber || 1,
      part_type: skill === ContentImportSkill.READING ? "Reading Passage" : "Listening Part",
      topic: flatJson.topic || flatJson.title || title,
      question_groups: questionGroups
    };

    if (skill === ContentImportSkill.READING) {
      part.passage_text = flatJson.passage || "";
    } else {
      part.transcript = flatJson.transcript || [];
      // Preserve audio URL so the mobile player can load the track.
      part.audio_url = flatJson.audioUrl || flatJson.audio_url || (audioUrls && audioUrls[0]) || null;
    }

    return {
      test_title: title,
      section: skill === ContentImportSkill.READING ? "Reading" : "Listening",
      parts: [part]
    };
  }
}
