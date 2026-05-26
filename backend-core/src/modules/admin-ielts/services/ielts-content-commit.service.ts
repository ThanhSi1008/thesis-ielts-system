import {
  Injectable,
  UnprocessableEntityException,
  ConflictException,
  NotFoundException,
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
            const ans =
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
              
              if (typeof obj.question_number === "number" && ans !== undefined) {
                const key = String(obj.question_number);
                ansMap.set(key, ans);
                if (obj.type) typeMap.set(key, String(obj.type));
              } else if (Array.isArray(obj.question_numbers) && ans !== undefined) {
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
        if (correct === undefined || correct === null || String(correct).trim() === "") {
          throw new UnprocessableEntityException(
            `Invalid answer key for question(s) [${key}]: Answer cannot be empty.`
          );
        }

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
  async commit(jobId: string, overwrite = false, isPublished = false, userId?: string): Promise<string> {
    const job = await this.prisma.contentImportJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException(`Import job with ID ${jobId} not found.`);
    }

    if (
      job.status !== ContentImportStatus.AWAITING_REVIEW &&
      job.status !== ContentImportStatus.FAILED
    ) {
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
          questions: structuredJson,
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

    // Lock gate: ensure no job is currently in progress
    const activeStates: ContentImportStatus[] = [
      ContentImportStatus.PENDING,
      ContentImportStatus.SCRAPING,
      ContentImportStatus.EXTRACTING,
    ];
    const unfinishedJobs = jobs.filter((j) => activeStates.includes(j.status));
    if (unfinishedJobs.length > 0) {
      throw new ConflictException(
        "Cannot commit group. Some parts of the test are still in progress (scraping/extracting)."
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

      const provenance = (listeningJob.provenance as any) || {};
      const source = provenance.source || "imported";
      const bookNumber = provenance.bookNumber !== undefined ? Number(provenance.bookNumber) : null;
      const testNumber = provenance.testNumber !== undefined ? Number(provenance.testNumber) : null;
      const quarter = provenance.quarter || null;
      const year = provenance.year !== undefined ? Number(provenance.year) : null;
      const title = provenance.title || `${source} - Full Mock Test ${bookNumber ? "Book " + bookNumber : ""} ${testNumber ? "Test " + testNumber : ""}`;

      const mergedQuestions = {
        type: "full_test",
        listening: listeningJob.structuredJson,
        reading: readingJob.structuredJson,
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
          const liveId = await this.commit(j.id, true, isPublished, userId);
          examIds.push(liveId);
        } else if (j.committedEntityId) {
          examIds.push(j.committedEntityId);
        }
      }
    }

    return { examIds };
  }
}
