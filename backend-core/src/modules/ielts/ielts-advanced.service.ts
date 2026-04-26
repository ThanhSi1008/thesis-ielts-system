import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { StreakService } from "./streak.service";

@Injectable()
export class IeltsAdvancedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly streakService: StreakService,
  ) {}

  async getListeningParts(questionType?: string) {
    const where = questionType ? { questionTypes: { has: questionType } } : {};
    return this.prisma.ieltsPracticeListeningPart.findMany({
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
    const part = await this.prisma.ieltsPracticeListeningPart.findUnique({
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

    const session = await this.prisma.ieltsPracticeSession.create({
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

    return session;
  }

  async getStatistics(userId: string) {
    const sessions = await this.prisma.ieltsPracticeSession.findMany({
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

    return this.prisma.ieltsPracticeSession.findMany({
      where: whereClause,
      include: {
        part: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getHistoryDetail(userId: string, sessionId: string) {
    const session = await this.prisma.ieltsPracticeSession.findUnique({
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
    return this.prisma.ieltsPracticeReadingPart.findMany({
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
    const part = await this.prisma.ieltsPracticeReadingPart.findUnique({
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

    const session = await this.prisma.ieltsPracticeReadingSession.create({
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

    return session;
  }

  async getReadingHistory(userId: string, partId?: string) {
    const whereClause: any = { userId };
    if (partId) whereClause.partId = partId;

    return this.prisma.ieltsPracticeReadingSession.findMany({
      where: whereClause,
      include: {
        part: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getReadingHistoryDetail(userId: string, sessionId: string) {
    const session = await this.prisma.ieltsPracticeReadingSession.findUnique({
      where: { id: sessionId },
      include: { part: true },
    });
    if (!session || session.userId !== userId)
      throw new NotFoundException("Session not found");
    return session;
  }
}
