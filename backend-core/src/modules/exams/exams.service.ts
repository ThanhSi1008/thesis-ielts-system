import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import {
  CreateExamDto,
  UpdateExamDto,
  CreateSessionDto,
  SubmitSessionDto,
  WritingResultCallbackDto,
} from "./dto/exams.dto";
import { IeltsIntensiveExam, IeltsIntensiveSession, IeltsIntensiveExamType, IeltsIntensiveSessionStatus } from "@prisma/client";
import { AiClientService } from "../ai-client/ai-client.service";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";

@Injectable()
export class ExamsService {
  constructor(
    private prisma: PrismaService,
    private aiClientService: AiClientService,
    private subscriptionsService: SubscriptionsService,
  ) {}

  private parseCambridgeTitle(input: string): {
    groupId: string;
    groupTitle: string;
    testNumber: number;
    skill: IeltsIntensiveExamType;
  } | null {
    // Expected examples:
    // "Cambridge IELTS 17 - Listening Test 1"
    // "Cambridge IELTS 16 - Reading Test 4"
    const re =
      /^Cambridge IELTS\s*(\d+)\s*-\s*(Listening|Reading|Writing|Speaking)\s*Test\s*(\d+)\s*$/i;
    const m = input.trim().match(re);
    if (!m) return null;
    const bookNumber = Number(m[1]);
    const rawSkill = m[2].toLowerCase();
    const testNumber = Number(m[3]);

    const skillMap: Record<string, IeltsIntensiveExamType> = {
      listening: IeltsIntensiveExamType.LISTENING,
      reading: IeltsIntensiveExamType.READING,
      writing: IeltsIntensiveExamType.WRITING,
      speaking: IeltsIntensiveExamType.SPEAKING,
    };

    const skill = skillMap[rawSkill];
    if (!skill || !Number.isFinite(bookNumber) || !Number.isFinite(testNumber))
      return null;

    return {
      groupId: `cambridge-${bookNumber}`,
      groupTitle: `Cambridge IELTS ${bookNumber}`,
      testNumber,
      skill,
    };
  }

  private normalizeSkill(skill?: string): IeltsIntensiveExamType {
    const s = (skill || "").toUpperCase().trim();
    const allowed = new Set<IeltsIntensiveExamType>([
      IeltsIntensiveExamType.LISTENING,
      IeltsIntensiveExamType.READING,
      IeltsIntensiveExamType.WRITING,
      IeltsIntensiveExamType.SPEAKING,
    ]);
    if (!s) return IeltsIntensiveExamType.READING; // screenshot default is Reading tab selected
    if (!allowed.has(s as IeltsIntensiveExamType)) {
      throw new BadRequestException(
        `Invalid skill. Expected one of: LISTENING, READING, WRITING, SPEAKING`,
      );
    }
    return s as IeltsIntensiveExamType;
  }

  async getIntensiveCatalog(params: { userId: string; skill?: string }) {
    const skill = this.normalizeSkill(params.skill);

    const exams = await this.prisma.ieltsIntensiveExam.findMany({
      where: {
        isPublished: true,
        type: skill,
      },
      select: {
        id: true,
        title: true,
        duration: true,
        imageUrl: true,
        difficulty: true,
        type: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const parsed = exams
      .map((e) => ({ ieltsIntensiveExam: e, meta: this.parseCambridgeTitle(e.title) }))
      .filter(
        (x) => x.meta !== null && x.meta.groupId !== "cambridge-13",
      ) as Array<{
      ieltsIntensiveExam: (typeof exams)[number];
      meta: NonNullable<ReturnType<ExamsService["parseCambridgeTitle"]>>;
    }>;

    const examIds = parsed.map((p) => p.ieltsIntensiveExam.id);

    // Participants: count distinct userId per ieltsIntensiveExam from sessions.
    const sessions = await this.prisma.ieltsIntensiveSession.findMany({
      where: { examId: { in: examIds } },
      select: { examId: true, userId: true, status: true },
    });

    const participantsByExam = new Map<string, Set<string>>();
    const completedByExam = new Map<string, number>();

    for (const s of sessions) {
      const set = participantsByExam.get(s.examId) ?? new Set<string>();
      set.add(s.userId);
      participantsByExam.set(s.examId, set);

      if (s.status === IeltsIntensiveSessionStatus.COMPLETED) {
        completedByExam.set(s.examId, (completedByExam.get(s.examId) ?? 0) + 1);
      }
    }

    // Results drive "myScore" (latest ieltsIntensiveResult per ieltsIntensiveExam for current user).
    const myResults = await this.prisma.ieltsIntensiveResult.findMany({
      where: {
        userId: params.userId,
        ieltsIntensiveSession: { examId: { in: examIds } },
      },
      select: {
        totalScore: true,
        gradedAt: true,
        ieltsIntensiveSession: { select: { examId: true, submittedAt: true } },
      },
      orderBy: { gradedAt: "desc" },
    });

    const myScoreByExam = new Map<
      string,
      { score: number; gradedAt: Date; submittedAt: Date | null }
    >();

    for (const r of myResults) {
      const existing = myScoreByExam.get(r.ieltsIntensiveSession.examId);
      if (!existing) {
        myScoreByExam.set(r.ieltsIntensiveSession.examId, {
          score: r.totalScore,
          gradedAt: r.gradedAt,
          submittedAt: r.ieltsIntensiveSession.submittedAt,
        });
      }
    }

    // Group into Cambridge sets.
    const groupsMap = new Map<
      string,
      {
        id: string;
        title: string;
        imageUrl?: string;
        participantsCount: number;
        completedCount: number;
        tests: Array<{
          examId: string;
          testNumber: number;
          durationMinutes: number;
          difficulty: string;
          myScore?: number;
          participantsCount: number;
          completedCount: number;
        }>;
      }
    >();

    for (const p of parsed) {
      const g = groupsMap.get(p.meta.groupId) ?? {
        id: p.meta.groupId,
        title: p.meta.groupTitle,
        imageUrl: p.ieltsIntensiveExam.imageUrl || undefined,
        participantsCount: 0,
        completedCount: 0,
        tests: [],
      };

      const participantsCount = participantsByExam.get(p.ieltsIntensiveExam.id)?.size ?? 0;
      const completedCount = completedByExam.get(p.ieltsIntensiveExam.id) ?? 0;
      const myScore = myScoreByExam.get(p.ieltsIntensiveExam.id)?.score;

      g.tests.push({
        examId: p.ieltsIntensiveExam.id,
        testNumber: p.meta.testNumber,
        durationMinutes: p.ieltsIntensiveExam.duration,
        difficulty: p.ieltsIntensiveExam.difficulty,
        myScore,
        participantsCount,
        completedCount,
      });

      g.participantsCount += participantsCount;
      g.completedCount += completedCount;

      groupsMap.set(p.meta.groupId, g);
    }

    const groups = Array.from(groupsMap.values())
      .map((g) => ({
        ...g,
        tests: g.tests.sort((a, b) => a.testNumber - b.testNumber),
      }))
      .sort((a, b) => {
        // Sort by book number desc when possible.
        const an = Number(a.id.replace("cambridge-", ""));
        const bn = Number(b.id.replace("cambridge-", ""));
        if (Number.isFinite(an) && Number.isFinite(bn)) return bn - an;
        return a.title.localeCompare(b.title);
      });

    return { skill, groups };
  }

  async getPracticeCatalog(params: { userId: string; skill?: string }) {
    const skill = this.normalizeSkill(params.skill);

    const exams = await this.prisma.ieltsIntensiveExam.findMany({
      where: {
        isPublished: true,
        type: skill,
      },
      select: {
        id: true,
        title: true,
        type: true,
        questions: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const parsed = exams
      .map((e) => ({ ieltsIntensiveExam: e, meta: this.parseCambridgeTitle(e.title) }))
      .filter(
        (x) => x.meta !== null && x.meta.groupId === "cambridge-13",
      ) as Array<{
      ieltsIntensiveExam: (typeof exams)[number];
      meta: NonNullable<ReturnType<ExamsService["parseCambridgeTitle"]>>;
    }>;

    const examIds = parsed.map((p) => p.ieltsIntensiveExam.id);

    // Get all sessions for these exams that have a practicePart
    const sessions = (await (this.prisma.ieltsIntensiveSession as any).findMany({
      where: { examId: { in: examIds }, practicePart: { not: null } },
      select: {
        id: true,
        examId: true,
        userId: true,
        status: true,
        practicePart: true,
        ieltsIntensiveResult: true,
      },
      orderBy: { createdAt: "desc" },
    })) as Array<{
      id: string;
      examId: string;
      userId: string;
      status: string;
      practicePart: number | null;
      ieltsIntensiveResult: { totalScore: number } | null;
    }>;

    const practiceItems: any[] = [];

    for (const p of parsed) {
      const q: any = p.ieltsIntensiveExam.questions || {};
      const partsArr = Array.isArray(q.parts)
        ? q.parts
        : Array.isArray(q.passages)
          ? q.passages
          : Array.isArray(q.tasks)
            ? q.tasks
            : [];

      if (partsArr.length === 0) {
        // Fallback if no parts found
        continue;
      }

      for (const part of partsArr) {
        const partNumber =
          part.part_number || part.passage_number || part.task_number || 1;

        // Find sessions for this part
        const partSessions = sessions.filter(
          (s) => s.examId === p.ieltsIntensiveExam.id && s.practicePart === partNumber,
        );

        const mySessions = partSessions.filter(
          (s) => s.userId === params.userId,
        );
        const completedSessions = mySessions.filter(
          (s) => s.status === IeltsIntensiveSessionStatus.COMPLETED,
        );

        let highestScore = 0;
        for (const cs of completedSessions) {
          if (cs.ieltsIntensiveResult?.totalScore && cs.ieltsIntensiveResult.totalScore > highestScore) {
            highestScore = cs.ieltsIntensiveResult.totalScore;
          }
        }

        const latestSession = mySessions.length > 0 ? mySessions[0] : null;

        let totalQ = 10;
        if (typeof part.questions === "string") {
          const match = part.questions.match(/(\d+)\s*[-–]\s*(\d+)/);
          if (match) {
            totalQ = parseInt(match[2]) - parseInt(match[1]) + 1;
          }
        }

        practiceItems.push({
          id: `${p.ieltsIntensiveExam.id}-${partNumber}`,
          examId: p.ieltsIntensiveExam.id,
          testTitle: `${p.meta.groupTitle} Test ${p.meta.testNumber}`,
          partNumber,
          partType:
            part.part_type ||
            part.passage_type ||
            part.task_type ||
            `Part ${partNumber}`,
          topic: part.topic || part.title || `Topic ${partNumber}`,
          totalQuestions: totalQ,
          myScore: completedSessions.length > 0 ? highestScore : undefined,
          practicesCompleted: completedSessions.length,
          latestSessionId: latestSession?.id,
          latestSessionStatus: latestSession?.status,
        });
      }
    }

    return { skill, items: practiceItems };
  }

  async create(createExamDto: CreateExamDto): Promise<IeltsIntensiveExam> {
    return this.prisma.ieltsIntensiveExam.create({
      data: createExamDto,
    });
  }

  async findAll(): Promise<IeltsIntensiveExam[]> {
    return this.prisma.ieltsIntensiveExam.findMany({
      where: { isPublished: true },
    });
  }

  async findOne(id: string): Promise<IeltsIntensiveExam | null> {
    return this.prisma.ieltsIntensiveExam.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateExamDto: UpdateExamDto): Promise<IeltsIntensiveExam> {
    return this.prisma.ieltsIntensiveExam.update({
      where: { id },
      data: updateExamDto,
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.prisma.ieltsIntensiveExam.delete({
      where: { id },
    });
    return { message: "IeltsIntensiveExam deleted successfully" };
  }
  async getHistory(userId: string) {
    const sessions = await this.prisma.ieltsIntensiveSession.findMany({
      where: { userId, status: { in: ["COMPLETED", "GRADED", "SUBMITTED", "GRADING", "GRADING_FAILED"] } },
      include: {
        ieltsIntensiveExam: {
          select: { title: true, type: true, duration: true, difficulty: true },
        },
        ieltsIntensiveResult: true,
      },
      orderBy: { submittedAt: "desc" },
    });

    return sessions.map((s) => ({
      id: s.id,
      examId: s.examId,
      examTitle: s.ieltsIntensiveExam.title,
      skill: s.ieltsIntensiveExam.type,
      difficulty: s.ieltsIntensiveExam.difficulty,
      dateTaken: s.submittedAt ?? s.createdAt,
      durationMinutes: s.ieltsIntensiveExam.duration,
      timeTaken: s.timeTaken ?? null,
      rawScore: s.ieltsIntensiveResult?.totalScore ?? 0,
      writingScore: s.ieltsIntensiveResult?.writingScore ?? null,
      speakingScore: s.ieltsIntensiveResult?.speakingScore ?? null,
      status: s.status,
      maxScore: 40,
      practicePart: (s as any).practicePart ?? null,
    }));
  }

  async createSession(
    examId: string,
    createSessionDto: CreateSessionDto,
  ): Promise<IeltsIntensiveSession> {
    return (this.prisma.ieltsIntensiveSession as any).create({
      data: {
        examId,
        userId: createSessionDto.userId,
        answers: {},
        status: "IN_PROGRESS",
        practicePart: createSessionDto.practicePart ?? null,
      },
    }) as Promise<IeltsIntensiveSession>;
  }

  private parseIELTSAnswer(correct: string): string[] {
    const parts = correct.split("/").map((p) => p.trim());
    const results: string[] = [];

    for (const part of parts) {
      if (part.includes("(") && part.includes(")")) {
        const match = part.match(/(.*)\((.*?)\)(.*)/);
        if (match) {
          const [, prefix, optional, suffix] = match;
          results.push((prefix + suffix).trim());
          results.push((prefix + optional + suffix).trim());
        } else {
          results.push(part);
        }
      } else {
        results.push(part);
      }
    }
    return results.map((s) => s.toLowerCase().replace(/[^a-z0-9]/g, ""));
  }

  private isAnswerCorrect(userAns: string, correctAns: any): boolean {
    if (!userAns || String(userAns).trim() === "") return false;
    const userNormalized = String(userAns)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    const correctArr = Array.isArray(correctAns)
      ? correctAns
      : [String(correctAns)];

    for (const c of correctArr) {
      const validSet = this.parseIELTSAnswer(String(c));
      if (validSet.includes(userNormalized)) return true;
    }
    return false;
  }

  private extractCorrectAnswers(obj: any, ansMap: Map<string, any>) {
    if (obj && typeof obj === "object") {
      if (Array.isArray(obj)) {
        obj.forEach((x) => this.extractCorrectAnswers(x, ansMap));
      } else {
        // Extract matching-type answers
        if (typeof obj.type === "string" && obj.type.startsWith("matching") && obj.answers && typeof obj.answers === "object") {
          for (const [k, v] of Object.entries(obj.answers)) {
            const letter = (v as any)?.letter ?? v;
            if (letter !== undefined && letter !== null) {
              ansMap.set(`match:${k}`, letter);
            }
          }
        }

        // Extract table_completion answers
        if (Array.isArray(obj.rows)) {
          for (const row of obj.rows) {
            if (row?.questions && typeof row.questions === "object") {
              for (const [qNum, cell] of Object.entries(row.questions)) {
                const cellAns = (cell as any)?.answer;
                if (cellAns !== undefined && cellAns !== null) {
                  ansMap.set(String(qNum), cellAns);
                }
              }
            }
          }
        }

        // Some nodes have "question_number," others "question_numbers"
        const ans =
          obj.correct_answer !== undefined
            ? obj.correct_answer
            : obj.answer !== undefined
              ? obj.answer
              : obj.correct_answers;
        if (typeof obj.question_number === "number" && ans !== undefined) {
          ansMap.set(String(obj.question_number), ans);
        } else if (Array.isArray(obj.question_numbers) && ans !== undefined) {
          const key = (obj.question_numbers as number[]).join(",");
          ansMap.set(key, ans);
        } else {
          Object.values(obj).forEach((x) =>
            this.extractCorrectAnswers(x, ansMap),
          );
        }
      }
    }
  }

  async submitSession(
    sessionId: string,
    submitDto: SubmitSessionDto,
  ): Promise<IeltsIntensiveSession & { result?: any }> {
    // 1. Fetch the existing session and ieltsIntensiveExam details
    const existing = await this.prisma.ieltsIntensiveSession.findUnique({
      where: { id: sessionId },
      include: { ieltsIntensiveExam: true },
    });

    if (!existing) {
      throw new BadRequestException("IeltsIntensiveExam session not found.");
    }

    let status: IeltsIntensiveSessionStatus = "SUBMITTED";
    let totalScore = 0;
    let graded = false;

    // 2. Synchronous grading for IELTS LISTENING, READING, and FULL_TEST (Listening/Reading sub-sections)
    let listeningScore: number | null = null;
    let readingScore: number | null = null;
    let hasWritingAnswers = false;
    let hasSpeakingAnswers = false;

    if (
      existing.ieltsIntensiveExam.type === IeltsIntensiveExamType.LISTENING ||
      existing.ieltsIntensiveExam.type === IeltsIntensiveExamType.READING
    ) {
      const ansMap = new Map<string, any>();
      this.extractCorrectAnswers(existing.ieltsIntensiveExam.questions, ansMap);

      for (const [key, correct] of ansMap.entries()) {
        const userAns = submitDto.answers[key];

        if (key.includes(",")) {
          // Multi-select / multi-question mapping (e.g. "21,22")
          const qCount = key.split(",").length;
          const correctArr = Array.isArray(correct)
            ? correct
            : [String(correct)];
          const userArr = key
            .split(",")
            .map((k) => String(submitDto.answers[k] || ""))
            .filter((v) => v.trim() !== "");

          let multiScore = 0;
          const correctNorm = correctArr.flatMap((c) =>
            this.parseIELTSAnswer(String(c)),
          );
          for (const ua of userArr) {
            const uan = String(ua)
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "");
            const idx = correctNorm.indexOf(uan);
            if (idx !== -1) {
              multiScore++;
              correctNorm.splice(idx, 1);
            }
          }
          totalScore += Math.min(multiScore, qCount);
        } else {
          // Exact single question
          if (this.isAnswerCorrect(String(userAns || ""), correct)) {
            totalScore++;
          }
        }
      }

      status = "COMPLETED";
      graded = true;
    } else if (existing.ieltsIntensiveExam.type === IeltsIntensiveExamType.FULL_TEST) {
      const examQuestions = existing.ieltsIntensiveExam.questions as any;

      if (examQuestions?.listening) {
        const listenAnsMap = new Map<string, any>();
        this.extractCorrectAnswers(examQuestions.listening, listenAnsMap);
        let lScore = 0;
        for (const [key, correct] of listenAnsMap.entries()) {
          const userAns = submitDto.answers["L" + key] !== undefined ? submitDto.answers["L" + key] : submitDto.answers[key];
          if (key.includes(",")) {
            const qCount = key.split(",").length;
            const correctArr = Array.isArray(correct) ? correct : [String(correct)];
            const userArr = key.split(",").map((k) => {
              const val = submitDto.answers["L" + k] !== undefined ? submitDto.answers["L" + k] : submitDto.answers[k];
              return String(val || "");
            }).filter((v) => v.trim() !== "");
            let multiScore = 0;
            const correctNorm = correctArr.flatMap((c) => this.parseIELTSAnswer(String(c)));
            for (const ua of userArr) {
              const uan = String(ua).toLowerCase().replace(/[^a-z0-9]/g, "");
              const idx = correctNorm.indexOf(uan);
              if (idx !== -1) {
                multiScore++;
                correctNorm.splice(idx, 1);
              }
            }
            lScore += Math.min(multiScore, qCount);
          } else {
            if (this.isAnswerCorrect(String(userAns || ""), correct)) {
              lScore++;
            }
          }
        }
        listeningScore = lScore;
      }

      if (examQuestions?.reading) {
        const readAnsMap = new Map<string, any>();
        this.extractCorrectAnswers(examQuestions.reading, readAnsMap);
        let rScore = 0;
        for (const [key, correct] of readAnsMap.entries()) {
          const userAns = submitDto.answers["R" + key] !== undefined ? submitDto.answers["R" + key] : submitDto.answers[key];
          if (key.includes(",")) {
            const qCount = key.split(",").length;
            const correctArr = Array.isArray(correct) ? correct : [String(correct)];
            const userArr = key.split(",").map((k) => {
              const val = submitDto.answers["R" + k] !== undefined ? submitDto.answers["R" + k] : submitDto.answers[k];
              return String(val || "");
            }).filter((v) => v.trim() !== "");
            let multiScore = 0;
            const correctNorm = correctArr.flatMap((c) => this.parseIELTSAnswer(String(c)));
            for (const ua of userArr) {
              const uan = String(ua).toLowerCase().replace(/[^a-z0-9]/g, "");
              const idx = correctNorm.indexOf(uan);
              if (idx !== -1) {
                multiScore++;
                correctNorm.splice(idx, 1);
              }
            }
            rScore += Math.min(multiScore, qCount);
          } else {
            if (this.isAnswerCorrect(String(userAns || ""), correct)) {
              rScore++;
            }
          }
        }
        readingScore = rScore;
      }

      hasWritingAnswers = examQuestions?.writing && Object.keys(submitDto.answers).some(k => k.toLowerCase().startsWith("w"));
      hasSpeakingAnswers = examQuestions?.speaking && Object.keys(submitDto.answers).some(k => k.toLowerCase().startsWith("s"));

      if (hasWritingAnswers) {
        const allowed = await this.subscriptionsService.incrementUsage(existing.userId, "AI_WRITING_GRADING");
        if (!allowed) {
          const sub = await this.subscriptionsService.getOrCreateSubscription(existing.userId);
          throw new ForbiddenException({
            statusCode: 403,
            error: "QUOTA_EXCEEDED",
            message: "You've reached your writing grading limit for this month",
            feature: "AI_WRITING_GRADING",
            currentTier: sub.tier,
            upgradeUrl: "/pricing",
          });
        }
      }

      if (hasSpeakingAnswers) {
        const allowed = await this.subscriptionsService.incrementUsage(existing.userId, "AI_SPEAKING_GRADING");
        if (!allowed) {
          const sub = await this.subscriptionsService.getOrCreateSubscription(existing.userId);
          throw new ForbiddenException({
            statusCode: 403,
            error: "QUOTA_EXCEEDED",
            message: "You've reached your speaking grading limit for this month",
            feature: "AI_SPEAKING_GRADING",
            currentTier: sub.tier,
            upgradeUrl: "/pricing",
          });
        }
      }

      status = (hasWritingAnswers || hasSpeakingAnswers) ? "SUBMITTED" : "COMPLETED";
      graded = true;
    }

    // 2b. WRITING & SPEAKING: AI grading
    const isWriting = existing.ieltsIntensiveExam.type === IeltsIntensiveExamType.WRITING;
    const isSpeaking = existing.ieltsIntensiveExam.type === IeltsIntensiveExamType.SPEAKING;
    if (isWriting || isSpeaking) {
      const feature = isWriting ? "AI_WRITING_GRADING" : "AI_SPEAKING_GRADING";
      const allowed = await this.subscriptionsService.incrementUsage(existing.userId, feature);
      
      if (!allowed) {
        const sub = await this.subscriptionsService.getOrCreateSubscription(existing.userId);
        throw new ForbiddenException({
          statusCode: 403,
          error: "QUOTA_EXCEEDED",
          message: `You've reached your ${feature.replace(/_/g, " ").toLowerCase()} limit for this month`,
          feature,
          currentTier: sub.tier,
          upgradeUrl: "/pricing",
        });
      }
      
      status = "SUBMITTED";
    }

    // 3. Update session with answers and status
    const session = await this.prisma.ieltsIntensiveSession.update({
      where: { id: sessionId },
      data: {
        answers: submitDto.answers,
        timeTaken: submitDto.timeTaken,
        status,
        submittedAt: new Date(),
      },
    });

    // 4. Create or Update IeltsIntensiveResult if graded
    let resultRecord: any = null;
    if (graded) {
      const resultData = {
        userId: existing.userId,
        sessionId: existing.id,
        totalScore:
          existing.ieltsIntensiveExam.type === IeltsIntensiveExamType.FULL_TEST
            ? (listeningScore || 0) + (readingScore || 0)
            : totalScore,
        listeningScore:
          existing.ieltsIntensiveExam.type === IeltsIntensiveExamType.LISTENING
            ? totalScore
            : existing.ieltsIntensiveExam.type === IeltsIntensiveExamType.FULL_TEST
              ? listeningScore
              : null,
        readingScore:
          existing.ieltsIntensiveExam.type === IeltsIntensiveExamType.READING
            ? totalScore
            : existing.ieltsIntensiveExam.type === IeltsIntensiveExamType.FULL_TEST
              ? readingScore
              : null,
        gradedAt: new Date(),
      };

      resultRecord = await this.prisma.ieltsIntensiveResult.upsert({
        where: { sessionId: existing.id },
        update: resultData,
        create: resultData,
      });
    }

    // 5. Asynchronous AI grader for Writing & Speaking via RabbitMQ
    const isFullTestWithAi = existing.ieltsIntensiveExam.type === IeltsIntensiveExamType.FULL_TEST && (hasWritingAnswers || hasSpeakingAnswers);
    if (isWriting || isSpeaking || isFullTestWithAi) {
      await this.aiClientService.publishGradingTask({
        sessionId: session.id,
        examType: existing.ieltsIntensiveExam.type,
        userId: existing.userId,
        answers: submitDto.answers,
        questions: existing.ieltsIntensiveExam.questions,
      });
      // The status remains 'SUBMITTED', the consumer will update it to 'GRADED'
    }

    const updatedSession = await this.prisma.ieltsIntensiveSession.update({
      where: { id: sessionId },
      data: {
        status,
      },
      include: { ieltsIntensiveResult: true },
    });

    return updatedSession;
  }

  async getSession(sessionId: string) {
    const session = await this.prisma.ieltsIntensiveSession.findUnique({
      where: { id: sessionId },
      include: {
        ieltsIntensiveExam: {
          select: {
            id: true,
            title: true,
            duration: true,
            type: true,
            questions: true,
          },
        },
        ieltsIntensiveResult: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!session) {
      throw new BadRequestException("Session not found.");
    }

    return session;
  }

  async deleteSession(sessionId: string) {
    const session = await this.prisma.ieltsIntensiveSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      throw new BadRequestException("Session not found.");
    }

    // Delete associated ieltsIntensiveResult first (if any)
    await this.prisma.ieltsIntensiveResult.deleteMany({
      where: { sessionId },
    });

    // Delete the session
    await this.prisma.ieltsIntensiveSession.delete({
      where: { id: sessionId },
    });

    return { success: true };
  }
}
