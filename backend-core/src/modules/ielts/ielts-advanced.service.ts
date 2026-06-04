import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { StreakService } from "./streak.service";
import { GamificationService } from "../gamification/gamification.service";
import { AiClientService } from "../ai-client/ai-client.service";

@Injectable()
export class IeltsAdvancedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly streakService: StreakService,
    private readonly gamificationService: GamificationService,
    private readonly aiClientService: AiClientService,
  ) {}

  async getListeningParts(questionType?: string) {
    const where = questionType ? { questionTypes: { has: questionType } } : {};
    return this.prisma.ieltsAdvancedListeningPart.findMany({
      where,
      orderBy: { partNumber: "asc" },
      select: {
        id: true,
        title: true,
        partNumber: true,
        questionTypes: true,
        createdAt: true,
      },
    });
  }

  async getListeningPartDetail(partId: string) {
    const part = await this.prisma.ieltsAdvancedListeningPart.findUnique({
      where: { id: partId },
    });
    if (!part) {
      throw new NotFoundException("Practice part not found");
    }
    return part;
  }

  async submitListeningPart(
    userId: string,
    partId: string,
    payload: { answers: Record<string, string> },
  ) {
    const part = await this.getListeningPartDetail(partId);

    // Evaluate
    let totalScore = 0;
    let totalQuestions = 0;
    const scoreData: Record<string, { correct: number; total: number }> = {};

    const contentArray = part.content as any[];

    for (const group of contentArray) {
      const type = group.type || "unknown";
      if (!scoreData[type]) {
        scoreData[type] = { correct: 0, total: 0 };
      }

      // Handle simple questions arrays (used in form_completion, short_answer etc.)
      const questionsToEvaluate = [];
      if (group.points) questionsToEvaluate.push(...group.points); // FormCompletion
      if (group.questions) questionsToEvaluate.push(...group.questions); // ShortAnswer, MC
      if (group.type === "matching" && group.items) {
        group.items.forEach((item) => {
          const correctData = group.answers[item.id];
          const correctLetter = correctData?.letter || correctData || "";
          questionsToEvaluate.push({
            question_number: item.id,
            answer: correctLetter,
          });
        });
      }
      if (group.type === "multiple_choice_multiple" && group.question_numbers) {
        const groupIdx = contentArray.indexOf(group);
        const key = `mcm-${groupIdx}`;
        const selections = (payload.answers[key] || "")
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean);

        group.question_numbers.forEach((qNum, i) => {
          const correct = (group.answers[i] || "")
            .toString()
            .toLowerCase()
            .trim();
          // Map the multi-selection to individual question IDs for the scoring loop
          if (selections.includes(correct)) {
            payload.answers[qNum] = correct;
          } else {
            payload.answers[qNum] = selections[i] || "";
          }
          questionsToEvaluate.push({ question_number: qNum, answer: correct });
        });
      }
      if (group.rows) {
        // TableCompletion
        group.rows.forEach((row) => {
          if (row.questions) {
            Object.entries(row.questions).forEach(([k, v]) => {
              questionsToEvaluate.push({ question_number: k, ...(v as any) });
            });
          }
        });
      }

      for (const q of questionsToEvaluate) {
        if (!q.question_number) continue;
        const qNum = q.question_number;
        const userAnswer = (payload.answers[qNum] || "")
          .toString()
          .trim()
          .toLowerCase();

        let isCorrect = false;

        if (q.acceptable_answers) {
          isCorrect = q.acceptable_answers
            .map((a) => a.toLowerCase().trim())
            .includes(userAnswer);
        } else if (q.answer) {
          isCorrect = q.answer.toString().trim().toLowerCase() === userAnswer;
        }

        scoreData[type].total += 1;
        totalQuestions += 1;
        if (isCorrect) {
          scoreData[type].correct += 1;
          totalScore += 1;
        }
      }
    }

    const session = await this.prisma.ieltsAdvancedListeningSession.create({
      data: {
        userId,
        partId,
        answers: payload.answers as any,
        scoreData: scoreData as any,
        totalScore,
        totalQuestions,
      },
    });

    // Record streak activity
    await this.streakService.recordActivity(userId);

    // Gamification
    this.gamificationService
      .onEvent(userId, {
        xp: 20,
        reason: "IELTS_ADVANCED_SUBMIT",
        achievementKeys: ["IA_LISTENER_5"],
      })
      .catch(() => {});

    if (totalScore / totalQuestions >= 0.8) {
      this.gamificationService
        .onEvent(userId, {
          xp: 10,
          reason: "IELTS_ADVANCED_HIGH_SCORE",
          achievementKeys: ["IA_HIGH_ACHIEVER"],
        })
        .catch(() => {});
    }

    return session;
  }

  async getStatistics(userId: string) {
    const sessions = await this.prisma.ieltsAdvancedListeningSession.findMany({
      where: { userId },
      select: { scoreData: true },
    });

    const aggregated: Record<
      string,
      { correct: number; total: number; attempted: number }
    > = {};

    for (const session of sessions) {
      const data = session.scoreData as Record<
        string,
        { correct: number; total: number }
      >;
      if (!data) continue;

      for (const [type, stats] of Object.entries(data)) {
        if (!aggregated[type]) {
          aggregated[type] = { correct: 0, total: 0, attempted: 0 };
        }
        aggregated[type].correct += stats.correct;
        aggregated[type].total += stats.total;
        aggregated[type].attempted += stats.total; // Simplified "attempted" definition
      }
    }

    return aggregated;
  }

  async getHistory(userId: string, partId?: string) {
    const whereClause: any = { userId };
    if (partId) whereClause.partId = partId;

    return this.prisma.ieltsAdvancedListeningSession.findMany({
      where: whereClause,
      include: {
        part: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getHistoryDetail(userId: string, sessionId: string) {
    const session = await this.prisma.ieltsAdvancedListeningSession.findUnique({
      where: { id: sessionId },
      include: { part: true },
    });
    if (!session || session.userId !== userId)
      throw new NotFoundException("Session not found");
    return session;
  }

  // --- READING ENDPOINTS ---

  async getReadingParts(questionType?: string) {
    const where = questionType ? { questionTypes: { has: questionType } } : {};
    return this.prisma.ieltsAdvancedReadingPart.findMany({
      where,
      orderBy: { partNumber: "asc" },
      select: {
        id: true,
        title: true,
        partNumber: true,
        questionTypes: true,
        createdAt: true,
      },
    });
  }

  async getReadingPartDetail(partId: string) {
    const part = await this.prisma.ieltsAdvancedReadingPart.findUnique({
      where: { id: partId },
    });
    if (!part) {
      throw new NotFoundException("Practice part not found");
    }
    return part;
  }

  async submitReadingPart(
    userId: string,
    partId: string,
    payload: { answers: Record<string, string> },
  ) {
    const part = await this.getReadingPartDetail(partId);

    let totalScore = 0;
    let totalQuestions = 0;
    const scoreData: Record<string, { correct: number; total: number }> = {};

    const contentArray = part.content as any[];

    for (const group of contentArray) {
      const type = group.type || "unknown";
      if (!scoreData[type]) {
        scoreData[type] = { correct: 0, total: 0 };
      }

      const questionsToEvaluate = [];
      if (group.questions) questionsToEvaluate.push(...group.questions);
      // Reading typically stores its components inside `group.questions` across most component types

      for (const q of questionsToEvaluate) {
        if (!q.question_number) continue;
        const qNum = q.question_number;
        const userAnswer = (payload.answers[qNum] || "")
          .toString()
          .trim()
          .toLowerCase();

        let isCorrect = false;
        if (q.acceptable_answers) {
          isCorrect = q.acceptable_answers
            .map((a: string) => a.toLowerCase().trim())
            .includes(userAnswer);
        } else if (q.answer) {
          isCorrect = q.answer.toString().trim().toLowerCase() === userAnswer;
        }

        scoreData[type].total += 1;
        totalQuestions += 1;
        if (isCorrect) {
          scoreData[type].correct += 1;
          totalScore += 1;
        }
      }
    }

    const session = await this.prisma.ieltsAdvancedReadingSession.create({
      data: {
        userId,
        partId,
        answers: payload.answers as any,
        scoreData: scoreData as any,
        totalScore,
        totalQuestions,
      },
    });

    // Record streak activity
    await this.streakService.recordActivity(userId);

    // Gamification
    this.gamificationService
      .onEvent(userId, {
        xp: 20,
        reason: "IELTS_ADVANCED_SUBMIT",
        achievementKeys: ["IA_READER_5"],
      })
      .catch(() => {});

    if (totalScore / totalQuestions >= 0.8) {
      this.gamificationService
        .onEvent(userId, {
          xp: 10,
          reason: "IELTS_ADVANCED_HIGH_SCORE",
          achievementKeys: ["IA_HIGH_ACHIEVER"],
        })
        .catch(() => {});
    }

    return session;
  }

  async getReadingHistory(userId: string, partId?: string) {
    const whereClause: any = { userId };
    if (partId) whereClause.partId = partId;

    return this.prisma.ieltsAdvancedReadingSession.findMany({
      where: whereClause,
      include: {
        part: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getReadingHistoryDetail(userId: string, sessionId: string) {
    const session = await this.prisma.ieltsAdvancedReadingSession.findUnique({
      where: { id: sessionId },
      include: { part: true },
    });
    if (!session || session.userId !== userId)
      throw new NotFoundException("Session not found");
    return session;
  }

  // --- WRITING ENDPOINTS ---

  async getWritingPrompts(
    userId: string,
    filters: {
      taskType?: string;
      subType?: string;
      category?: string;
      page: number;
      limit: number;
    },
  ) {
    const where: any = { isPublished: true };
    if (filters.taskType) where.taskType = filters.taskType;
    if (filters.subType) where.subType = filters.subType;
    if (filters.category) where.category = filters.category;

    const [prompts, total] = await Promise.all([
      this.prisma.ieltsAdvancedWritingPrompt.findMany({
        where,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: [
          { bookNumber: "asc" },
          { testNumber: "asc" },
          { taskType: "asc" },
        ],
        select: {
          id: true,
          taskType: true,
          subType: true,
          source: true,
          category: true,
          bookNumber: true,
          testNumber: true,
          title: true,
          imageUrl: true,
          minimumWords: true,
          suggestedTime: true,
          difficulty: true,
          sessions: {
            where: { userId, status: "GRADED" },
            select: { bandScore: true, createdAt: true },
            orderBy: { bandScore: "desc" },
            take: 1,
          },
        },
      }),
      this.prisma.ieltsAdvancedWritingPrompt.count({ where }),
    ]);

    const data = prompts.map((p) => ({
      ...p,
      bestScore: p.sessions[0]?.bandScore ?? null,
      lastAttempt: p.sessions[0]?.createdAt ?? null,
      sessions: undefined,
    }));

    return {
      data,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  async getWritingPromptDetail(userId: string, promptId: string) {
    const prompt = await this.prisma.ieltsAdvancedWritingPrompt.findUniqueOrThrow({
      where: { id: promptId },
      include: {
        sessions: {
          where: { userId },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            bandScore: true,
            timeTaken: true,
            createdAt: true,
          },
        },
      },
    });

    const activeSession = await this.prisma.ieltsAdvancedWritingSession.findFirst({
      where: { userId, promptId, status: "IN_PROGRESS" },
      select: { id: true, draftEssay: true, createdAt: true },
    });

    return { ...prompt, activeSession };
  }

  async createWritingSession(userId: string, promptId: string) {
    await this.prisma.ieltsAdvancedWritingPrompt.findUniqueOrThrow({
      where: { id: promptId },
    });

    const existing = await this.prisma.ieltsAdvancedWritingSession.findFirst({
      where: { userId, promptId, status: "IN_PROGRESS" },
    });

    if (existing) return existing;

    return this.prisma.ieltsAdvancedWritingSession.create({
      data: { userId, promptId },
    });
  }

  async saveWritingDraft(userId: string, sessionId: string, draftEssay: string) {
    const session = await this.prisma.ieltsAdvancedWritingSession.findFirst({
      where: { id: sessionId, userId, status: "IN_PROGRESS" },
    });

    if (!session) throw new NotFoundException("Session not found or already submitted");

    return this.prisma.ieltsAdvancedWritingSession.update({
      where: { id: sessionId },
      data: { draftEssay },
    });
  }

  async submitWritingSession(
    userId: string,
    sessionId: string,
    essay: string,
    timeTaken?: number,
  ) {
    const session = await this.prisma.ieltsAdvancedWritingSession.findFirst({
      where: { id: sessionId, userId, status: "IN_PROGRESS" },
      include: { prompt: true },
    });

    if (!session) throw new NotFoundException("Session not found or already submitted");

    const updated = await this.prisma.ieltsAdvancedWritingSession.update({
      where: { id: sessionId },
      data: {
        essay,
        timeTaken: timeTaken ?? null,
        status: "GRADING",
      },
    });

    await this.aiClientService.publishGradingTask({
      jobId: session.id,
      type: "ADVANCED_WRITING",
      sessionId: session.id,
      userId,
      taskType: session.prompt.taskType,
      prompt: session.prompt.prompt,
      essay,
      imageUrl: session.prompt.imageUrl || "",
    });

    // Record streak activity
    await this.streakService.recordActivity(userId);

    // Gamification
    this.gamificationService
      .onEvent(userId, {
        xp: 20,
        reason: "IELTS_ADVANCED_WRITING_SUBMIT",
        achievementKeys: ["ADV_WRITING_FIRST", "ADV_WRITING_10"],
      })
      .catch(() => {});

    return updated;
  }

  async getWritingSession(userId: string, sessionId: string) {
    const session = await this.prisma.ieltsAdvancedWritingSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        prompt: {
          select: {
            id: true,
            title: true,
            taskType: true,
            prompt: true,
            imageUrl: true,
          },
        },
      },
    });

    if (!session) throw new NotFoundException("Session not found");
    return session;
  }

  async getWritingSessionsByPrompt(userId: string, promptId: string) {
    return this.prisma.ieltsAdvancedWritingSession.findMany({
      where: { userId, promptId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        bandScore: true,
        timeTaken: true,
        essay: true,
        createdAt: true,
      },
    });
  }

  async getWritingHistory(userId: string) {
    return this.prisma.ieltsAdvancedWritingSession.findMany({
      where: { userId, status: { not: "IN_PROGRESS" } },
      include: {
        prompt: {
          select: {
            id: true,
            title: true,
            taskType: true,
            subType: true,
            source: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  // --- SPEAKING ENDPOINTS ---

  async getSpeakingParts(
    userId: string,
    filters: {
      partNumber?: number;
      category?: string;
      topic?: string;
      page: number;
      limit: number;
    },
  ) {
    const where: any = { isPublished: true };
    if (filters.partNumber) where.partNumber = filters.partNumber;
    if (filters.category) where.category = filters.category;
    if (filters.topic) {
      where.topic = { contains: filters.topic, mode: "insensitive" };
    }

    const [parts, total] = await Promise.all([
      this.prisma.ieltsAdvancedSpeakingPart.findMany({
        where,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: [{ bookNumber: "asc" }, { testNumber: "asc" }, { partNumber: "asc" }],
        select: {
          id: true,
          partNumber: true,
          partType: true,
          topic: true,
          source: true,
          category: true,
          bookNumber: true,
          testNumber: true,
          title: true,
          questions: true,
          sessions: {
            where: { userId, status: "GRADED" },
            select: { bandScore: true, createdAt: true },
            orderBy: { bandScore: "desc" },
            take: 1,
          },
        },
      }),
      this.prisma.ieltsAdvancedSpeakingPart.count({ where }),
    ]);

    const data = parts.map((p) => ({
      ...p,
      bestScore: p.sessions[0]?.bandScore ?? null,
      lastAttempt: p.sessions[0]?.createdAt ?? null,
      sessions: undefined,
    }));

    return {
      data,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  async getSpeakingPartDetail(userId: string, partId: string) {
    const part = await this.prisma.ieltsAdvancedSpeakingPart.findUniqueOrThrow({
      where: { id: partId },
    });

    const activeSession = await this.prisma.ieltsAdvancedSpeakingSession.findFirst({
      where: { userId, partId, status: "IN_PROGRESS" },
      select: { id: true, createdAt: true },
    });

    return { ...part, activeSession };
  }

  async getSpeakingSessionsByPart(userId: string, partId: string) {
    return this.prisma.ieltsAdvancedSpeakingSession.findMany({
      where: { userId, partId },
      select: {
        id: true,
        status: true,
        bandScore: true,
        timeTaken: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async createSpeakingSession(userId: string, partId: string) {
    await this.prisma.ieltsAdvancedSpeakingPart.findUniqueOrThrow({
      where: { id: partId },
    });

    const existing = await this.prisma.ieltsAdvancedSpeakingSession.findFirst({
      where: { userId, partId, status: "IN_PROGRESS" },
    });

    if (existing) return existing;

    return this.prisma.ieltsAdvancedSpeakingSession.create({
      data: { userId, partId },
    });
  }

  async submitSpeakingSession(
    userId: string,
    sessionId: string,
    audioAnswers: Record<string, string>,
    timeTaken?: number,
  ) {
    const session = await this.prisma.ieltsAdvancedSpeakingSession.findFirst({
      where: { id: sessionId, userId, status: "IN_PROGRESS" },
      include: { part: true },
    });

    if (!session) {
      throw new NotFoundException("Session not found or already submitted");
    }

    const hasAudio = Object.values(audioAnswers || {}).some(
      (value) => typeof value === "string" && value.trim().length > 0,
    );
    if (!hasAudio) {
      throw new BadRequestException(
        "Please record at least one response before submitting.",
      );
    }

    const updated = await this.prisma.ieltsAdvancedSpeakingSession.update({
      where: { id: sessionId },
      data: {
        audioUrls: audioAnswers as any,
        timeTaken: timeTaken ?? null,
        status: "GRADING",
      },
    });

    const questions = ((session.part.questions as any[]) || []).map((q: any) => q.text);

    await this.aiClientService.publishGradingTask({
      jobId: session.id,
      type: "ADVANCED_SPEAKING",
      sessionId: session.id,
      userId,
      partNumber: session.part.partNumber,
      partType: session.part.partType,
      questions,
      audioAnswers,
    });

    await this.streakService.recordActivity(userId);

    this.gamificationService
      .onEvent(userId, {
        xp: 20,
        reason: "IELTS_ADVANCED_SPEAKING_SUBMIT",
        achievementKeys: ["ADV_SPEAKING_FIRST", "ADV_SPEAKING_10"],
      })
      .catch(() => {});

    return updated;
  }

  async getSpeakingStatsForUser(userId: string) {
    const sessions = await this.prisma.ieltsAdvancedSpeakingSession.findMany({
      where: { userId, status: "GRADED" },
      include: {
        part: { select: { title: true, partNumber: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return sessions.map((s) => ({
      id: s.id,
      partId: s.partId,
      skill: "SPEAKING" as const,
      title: s.part.title,
      examTitle: s.part.title,
      writingScore: s.bandScore,
      rawScore: null,
      source: "advanced",
      dateTaken: s.createdAt.toISOString(),
      createdAt: s.createdAt.toISOString(),
    }));
  }

  async getSpeakingSession(userId: string, sessionId: string) {
    const session = await this.prisma.ieltsAdvancedSpeakingSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        part: {
          select: {
            id: true,
            title: true,
            partNumber: true,
            partType: true,
            topic: true,
            questions: true,
          },
        },
      },
    });

    if (!session) throw new NotFoundException("Session not found");
    return session;
  }

  async getSpeakingHistory(userId: string) {
    return this.prisma.ieltsAdvancedSpeakingSession.findMany({
      where: { userId, status: { not: "IN_PROGRESS" } },
      include: {
        part: {
          select: {
            id: true,
            title: true,
            partNumber: true,
            partType: true,
            topic: true,
            source: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }
}
