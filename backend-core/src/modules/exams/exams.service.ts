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
import { Exam, ExamSession, ExamType, SessionStatus } from "@prisma/client";
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
    skill: ExamType;
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

    const skillMap: Record<string, ExamType> = {
      listening: ExamType.LISTENING,
      reading: ExamType.READING,
      writing: ExamType.WRITING,
      speaking: ExamType.SPEAKING,
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

  private normalizeSkill(skill?: string): ExamType {
    const s = (skill || "").toUpperCase().trim();
    const allowed = new Set<ExamType>([
      ExamType.LISTENING,
      ExamType.READING,
      ExamType.WRITING,
      ExamType.SPEAKING,
    ]);
    if (!s) return ExamType.READING; // screenshot default is Reading tab selected
    if (!allowed.has(s as ExamType)) {
      throw new BadRequestException(
        `Invalid skill. Expected one of: LISTENING, READING, WRITING, SPEAKING`,
      );
    }
    return s as ExamType;
  }

  async getIntensiveCatalog(params: { userId: string; skill?: string }) {
    const skill = this.normalizeSkill(params.skill);

    const exams = await this.prisma.exam.findMany({
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
    const sessions = await this.prisma.examSession.findMany({
      where: { examId: { in: examIds } },
      select: { examId: true, userId: true, status: true },
    });

    const participantsByExam = new Map<string, Set<string>>();
    const completedByExam = new Map<string, number>();

    for (const s of sessions) {
      const set = participantsByExam.get(s.examId) ?? new Set<string>();
      set.add(s.userId);
      participantsByExam.set(s.examId, set);

      if (s.status === SessionStatus.COMPLETED) {
        completedByExam.set(s.examId, (completedByExam.get(s.examId) ?? 0) + 1);
      }
    }

    // Results drive "myScore" (latest ieltsIntensiveResult per ieltsIntensiveExam for current user).
    const myResults = await this.prisma.result.findMany({
      where: {
        userId: params.userId,
        session: { examId: { in: examIds } },
      },
      select: {
        totalScore: true,
        gradedAt: true,
        session: { select: { examId: true, submittedAt: true } },
      },
      orderBy: { gradedAt: "desc" },
    });

    const myScoreByExam = new Map<
      string,
      { score: number; gradedAt: Date; submittedAt: Date | null }
    >();

    for (const r of myResults) {
      const existing = myScoreByExam.get(r.session.examId);
      if (!existing) {
        myScoreByExam.set(r.session.examId, {
          score: r.totalScore,
          gradedAt: r.gradedAt,
          submittedAt: r.session.submittedAt,
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

    const exams = await this.prisma.exam.findMany({
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
    const sessions = (await (this.prisma.examSession as any).findMany({
      where: { examId: { in: examIds }, practicePart: { not: null } },
      select: {
        id: true,
        examId: true,
        userId: true,
        status: true,
        practicePart: true,
        result: true,
      },
      orderBy: { createdAt: "desc" },
    })) as Array<{
      id: string;
      examId: string;
      userId: string;
      status: string;
      practicePart: number | null;
      result: any;
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
          (s) => s.status === SessionStatus.COMPLETED,
        );

        let highestScore = 0;
        for (const cs of completedSessions) {
          if (cs.result?.totalScore && cs.result.totalScore > highestScore) {
            highestScore = cs.result.totalScore;
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

  async create(createExamDto: CreateExamDto): Promise<Exam> {
    return this.prisma.exam.create({
      data: createExamDto,
    });
  }

  async findAll(): Promise<Exam[]> {
    return this.prisma.exam.findMany({
      where: { isPublished: true },
    });
  }

  async findOne(id: string): Promise<Exam | null> {
    return this.prisma.exam.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateExamDto: UpdateExamDto): Promise<Exam> {
    return this.prisma.exam.update({
      where: { id },
      data: updateExamDto,
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.prisma.exam.delete({
      where: { id },
    });
    return { message: "IeltsIntensiveExam deleted successfully" };
  }
  async getHistory(userId: string) {
    const sessions = await this.prisma.examSession.findMany({
      where: { userId, status: "COMPLETED" },
      include: {
        exam: {
          select: { title: true, type: true, duration: true, difficulty: true },
        },
        result: true,
      },
      orderBy: { submittedAt: "desc" },
    });

    return sessions.map((s) => ({
      id: s.id,
      examId: s.examId,
      examTitle: s.exam.title,
      skill: s.exam.type,
      difficulty: s.exam.difficulty,
      dateTaken: s.submittedAt ?? s.createdAt,
      durationMinutes: s.exam.duration,
      timeTaken: s.timeTaken ?? null,
      rawScore: s.result?.totalScore ?? 0,
      writingScore: s.result?.writingScore ?? null,
      maxScore: 40,
      practicePart: (s as any).practicePart ?? null,
    }));
  }

  async createSession(
    examId: string,
    createSessionDto: CreateSessionDto,
  ): Promise<ExamSession> {
    return (this.prisma.examSession as any).create({
      data: {
        examId,
        userId: createSessionDto.userId,
        answers: {},
        status: "IN_PROGRESS",
        practicePart: createSessionDto.practicePart ?? null,
      },
    }) as Promise<ExamSession>;
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
  ): Promise<ExamSession & { result?: any }> {
    // 1. Fetch the existing session and ieltsIntensiveExam details
    const existing = await this.prisma.examSession.findUnique({
      where: { id: sessionId },
      include: { exam: true },
    });

    if (!existing) {
      throw new BadRequestException("IeltsIntensiveExam session not found.");
    }

    let status: SessionStatus = "SUBMITTED";
    let totalScore = 0;
    let graded = false;

    // 2. Synchronous grading for IELTS LISTENING and READING
    if (
      existing.exam.type === ExamType.LISTENING ||
      existing.exam.type === ExamType.READING
    ) {
      const ansMap = new Map<string, any>();
      this.extractCorrectAnswers(existing.exam.questions, ansMap);

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
    }

    // 2b. WRITING & SPEAKING: AI grading
    const isWriting = existing.exam.type === ExamType.WRITING;
    const isSpeaking = existing.exam.type === ExamType.SPEAKING;
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
    const session = await this.prisma.examSession.update({
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
        totalScore,
        listeningScore:
          existing.exam.type === ExamType.LISTENING ? totalScore : null,
        readingScore:
          existing.exam.type === ExamType.READING ? totalScore : null,
        gradedAt: new Date(),
      };

      resultRecord = await this.prisma.result.upsert({
        where: { sessionId: existing.id },
        update: resultData,
        create: resultData,
      });
    }

    // 5. Asynchronous AI grader for Writing & Speaking via RabbitMQ
    if (isWriting || isSpeaking) {
      await this.aiClientService.publishGradingTask({
        sessionId: session.id,
        examType: existing.exam.type,
        userId: existing.userId,
        answers: submitDto.answers,
        questions: existing.exam.questions,
      });
      // The status remains 'SUBMITTED', the consumer will update it to 'GRADED'
    }

    const updatedSession = await this.prisma.examSession.update({
      where: { id: sessionId },
      data: {
        status,
      },
      include: { result: true },
    });

    return updatedSession;
  }

  async getSession(sessionId: string) {
    const session = await this.prisma.examSession.findUnique({
      where: { id: sessionId },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            duration: true,
            type: true,
            questions: true,
          },
        },
        result: true,
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
    const session = await this.prisma.examSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      throw new BadRequestException("Session not found.");
    }

    // Delete associated ieltsIntensiveResult first (if any)
    await this.prisma.result.deleteMany({
      where: { sessionId },
    });

    // Delete the session
    await this.prisma.examSession.delete({
      where: { id: sessionId },
    });

    return { success: true };
  }
}
