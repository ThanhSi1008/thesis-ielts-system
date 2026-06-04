import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import * as dayjs from "dayjs";

// ── IELTS Band Conversion (same as frontend bands.ts) ──
function rawToBand(score: number, type: "LISTENING" | "READING" = "LISTENING"): number {
  if (score >= 39) return 9.0;
  if (score >= 37) return 8.5;
  if (score >= 35) return 8.0;
  if (score >= 32) return 7.5;
  if (score >= 30) return 7.0;
  if (score >= 26) return 6.5;
  if (score >= 23) return 6.0;
  if (score >= 18) return 5.5;
  if (score >= 16) return 5.0;
  if (score >= 13) return 4.5;
  if (score >= 10) return 4.0;
  if (score >= 8) return 3.5;
  if (score >= 6) return 3.0;
  if (score >= 4) return 2.5;
  if (score >= 2) return 2.0;
  return 1.0;
}

@Injectable()
export class IeltsStatisticsService {
  private readonly logger = new Logger(IeltsStatisticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getOverviewStats(userId: string) {
    // ── Profile ──
    const profile = await this.prisma.ieltsProfile.findUnique({
      where: { userId },
    });

    // ── All completed mock sessions with results ──
    const completedMocks = await this.prisma.ieltsIntensiveSession.findMany({
      where: {
        userId,
        status: { in: ["COMPLETED", "GRADED"] },
        ieltsIntensiveResult: { isNot: null },
      },
      include: {
        ieltsIntensiveResult: true,
        ieltsIntensiveExam: { select: { type: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // ── 1.1 Estimated Band ──
    // Convert raw scores to IELTS bands, then average the latest result per exam
    let estimatedBand: number | null = null;
    const latestByExamType = new Map<string, number>(); // per exam type, keep latest band
    for (const mock of completedMocks) {
      const result = mock.ieltsIntensiveResult;
      if (!result) continue;
      const examType = mock.ieltsIntensiveExam.type;
      if (latestByExamType.has(examType)) continue; // already have the latest for this type

      let band: number;
      if (examType === "LISTENING" || examType === "READING") {
        band = rawToBand(result.totalScore, examType as any);
      } else {
        // Writing/Speaking: totalScore is already the band score (float)
        band = result.totalScore;
      }
      latestByExamType.set(examType, band);
    }
    if (latestByExamType.size > 0) {
      const bands = [...latestByExamType.values()];
      estimatedBand = Math.round((bands.reduce((s, b) => s + b, 0) / bands.length) * 2) / 2; // round to nearest 0.5
    }

    const targetBand = profile?.targetBand || null;
    const bandGap = targetBand && estimatedBand ? Math.max(0, +(targetBand - estimatedBand).toFixed(1)) : null;

    // ── 1.2 Daily Practice Time ──
    const today = dayjs().startOf("day").toDate();
    const advancedWritingToday = await this.prisma.ieltsAdvancedWritingSession.aggregate({
      where: { userId, createdAt: { gte: today } },
      _sum: { timeTaken: true },
    });
    const advancedSpeakingToday = await this.prisma.ieltsAdvancedSpeakingSession.aggregate({
      where: { userId, createdAt: { gte: today } },
      _sum: { timeTaken: true },
    });
    const intensiveToday = await this.prisma.ieltsIntensiveSession.findMany({
      where: { userId, status: { in: ["COMPLETED", "GRADED"] }, submittedAt: { gte: today } },
      select: { timeTaken: true },
    });
    const intensiveTimeSec = intensiveToday.reduce((s, m) => s + (m.timeTaken || 0), 0);

    const dailyMinutesPracticed = Math.floor(
      ((advancedWritingToday._sum.timeTaken || 0) +
        (advancedSpeakingToday._sum.timeTaken || 0) +
        intensiveTimeSec) / 60,
    );
    const dailyCommitmentMins = profile?.dailyCommitmentMins || 30;

    // ── 1.3 Tests Taken ──
    const testsTaken = completedMocks.length;
    const weekAgo = dayjs().subtract(7, "day").toDate();
    const testsThisWeek = completedMocks.filter(
      (m) => m.submittedAt && new Date(m.submittedAt) >= weekAgo,
    ).length;

    // ── 1.4 Weekly Activity Heatmap ──
    const heatmap = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = dayjs().subtract(i, "day").startOf("day").toDate();
      const dayEnd = dayjs().subtract(i, "day").endOf("day").toDate();

      const sessionsForDay = await this.prisma.ieltsIntensiveSession.findMany({
        where: {
          userId,
          status: { in: ["COMPLETED", "GRADED"] },
          submittedAt: { gte: dayStart, lte: dayEnd },
        },
        select: { timeTaken: true },
      });
      const minutes = Math.floor(
        sessionsForDay.reduce((s, m) => s + (m.timeTaken || 0), 0) / 60,
      );
      heatmap.push({
        date: dayjs().subtract(i, "day").format("YYYY-MM-DD"),
        minutes,
      });
    }

    // ── 1.5 Recent Activity ──
    const recentActivity = completedMocks.slice(0, 5).map((m) => {
      const result = m.ieltsIntensiveResult;
      const examType = m.ieltsIntensiveExam.type;
      let band: number | null = null;
      if (result) {
        if (examType === "LISTENING" || examType === "READING") {
          band = rawToBand(result.totalScore, examType as any);
        } else {
          band = result.totalScore;
        }
      }
      return {
        label: `${m.ieltsIntensiveExam.title} — Band ${band?.toFixed(1) || "?"}`,
        date: dayjs(m.submittedAt || m.createdAt).format("MMM D, YYYY"),
      };
    });

    // ── 1.6 Exam Countdown ──
    const examDate = profile?.examDate;
    const daysToExam = examDate ? dayjs(examDate).diff(dayjs(), "day") : null;
    const readinessScore =
      estimatedBand && targetBand
        ? Math.min(100, Math.round((estimatedBand / targetBand) * 100))
        : null;

    // ── 1.7 Progress Over Time (monthly averages for last 6 months) ──
    const progressOverTime = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = dayjs().subtract(i, "month").startOf("month").toDate();
      const monthEnd = dayjs().subtract(i, "month").endOf("month").toDate();
      const monthMocks = completedMocks.filter((m) => {
        const d = m.submittedAt || m.createdAt;
        return d >= monthStart && d <= monthEnd;
      });

      let avgBand: number | null = null;
      if (monthMocks.length > 0) {
        const bands = monthMocks.map((m) => {
          const result = m.ieltsIntensiveResult!;
          const type = m.ieltsIntensiveExam.type;
          return type === "LISTENING" || type === "READING"
            ? rawToBand(result.totalScore, type as any)
            : result.totalScore;
        });
        avgBand = bands.reduce((s, b) => s + b, 0) / bands.length;
      }

      progressOverTime.push({
        month: dayjs().subtract(i, "month").format("MMM"),
        band: avgBand,
        count: monthMocks.length,
      });
    }

    return {
      estimatedBand,
      targetBand,
      bandGap,
      dailyMinutesPracticed,
      dailyCommitmentMins,
      testsTaken,
      testsThisWeek,
      heatmap,
      recentActivity,
      daysToExam,
      readinessScore,
      progressOverTime,
    };
  }

  async getFoundationStats(userId: string) {
    // 2.1 Vocabulary Mastery Flow
    const vocabProgress = await this.prisma.foundationVocabProgress.aggregate({
      where: { userId },
      _sum: { wordsLearned: true, totalWords: true },
    });
    const wordsLearned = vocabProgress._sum.wordsLearned || 0;
    const totalWords = vocabProgress._sum.totalWords || 0;

    // 2.2 Grammar Completion Metrics
    const grammarUnits = await this.prisma.foundationGrammarUnit.count();
    const grammarCompleted = await this.prisma.foundationGrammarProgress.count({
      where: { userId, completedAt: { not: null } },
    });

    // 2.3 Pronunciation Articulation Stats
    const pronunciationMastered = await this.prisma.foundationPronunciationProgress.count({
      where: { userId, status: "MASTERED" },
    });
    const pronunciationPracticing = await this.prisma.foundationPronunciationProgress.count({
      where: { userId, status: "PRACTICING" },
    });
    const pronunciationNew = await this.prisma.foundationPronunciationProgress.count({
      where: { userId, status: "NEW" },
    });
    
    return {
      vocabulary: { wordsLearned, totalWords },
      grammar: { completedUnits: grammarCompleted, totalUnits: grammarUnits },
      pronunciation: { mastered: pronunciationMastered, practicing: pronunciationPracticing, new: pronunciationNew },
      averageAccuracy: 85, // Placeholder
      timeBalance: { vocab: 40, grammar: 35, pronunciation: 25 }, // Placeholder
    };
  }

  async getBasicStats(userId: string) {
    // 3.1 - 3.4 Curriculum Progress for L/R/W/S
    const skills = await this.prisma.ieltsBasicSkill.findMany({
      include: {
        _count: {
          select: { lessons: true, listeningExercises: true, readingExercises: true, writingExercises: true, speakingExercises: true },
        },
      },
    });

    const progress = await this.prisma.ieltsBasicProgress.findMany({
      where: { userId, isCompleted: true },
      include: {
        lesson: { select: { skillId: true } },
        listeningExercise: { select: { skillId: true } },
        readingExercise: { select: { skillId: true } },
        writingExercise: { select: { skillId: true } },
        speakingExercise: { select: { skillId: true } },
      },
    });

    // Aggregate progress per skill
    const skillStats = skills.map((skill) => {
      const completedItems = progress.filter((p) =>
        p.lesson?.skillId === skill.id ||
        p.listeningExercise?.skillId === skill.id ||
        p.readingExercise?.skillId === skill.id ||
        p.writingExercise?.skillId === skill.id ||
        p.speakingExercise?.skillId === skill.id
      ).length;

      const totalItems = skill._count.lessons + skill._count.listeningExercises + skill._count.readingExercises + skill._count.writingExercises + skill._count.speakingExercises;

      return {
        skillId: skill.id,
        skillName: skill.name,
        completedItems,
        totalItems,
        completionRate: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
      };
    });

    const totalCompleted = skillStats.reduce((sum, s) => sum + s.completedItems, 0);
    const totalAvailable = skillStats.reduce((sum, s) => sum + s.totalItems, 0);
    const overallReadiness = totalAvailable > 0 ? Math.round((totalCompleted / totalAvailable) * 100) : 0;

    return {
      skills: skillStats,
      overallReadiness,
    };
  }

  async getAdvancedStats(userId: string) {
    return {
      heatmap: [],
      weakSpots: [],
      scoreTrend: [],
      writingFeedbackSummary: {},
      speakingFeedbackSummary: {},
    };
  }

  async getIntensiveStats(userId: string) {
    const completedMocks = await this.prisma.ieltsIntensiveSession.findMany({
      where: {
        userId,
        status: { in: ["COMPLETED", "GRADED"] },
        ieltsIntensiveResult: { isNot: null },
      },
      include: {
        ieltsIntensiveResult: true,
        ieltsIntensiveExam: { select: { type: true, title: true, duration: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    // ── Per-skill trends (array of { date, band } for each skill) ──
    const skillTrends: Record<string, { date: string; band: number }[]> = {
      listening: [],
      reading: [],
      writing: [],
      speaking: [],
    };

    const bandCounts = new Map<number, number>();

    for (const mock of completedMocks) {
      const result = mock.ieltsIntensiveResult;
      if (!result) continue;
      const type = mock.ieltsIntensiveExam.type.toLowerCase();

      let band: number;
      if (type === "listening" || type === "reading") {
        band = rawToBand(result.totalScore, type.toUpperCase() as any);
      } else {
        band = result.totalScore;
      }

      if (skillTrends[type]) {
        skillTrends[type].push({
          date: dayjs(mock.submittedAt || mock.createdAt).format("MMM D"),
          band: Math.round(band * 2) / 2,
        });
      }

      // Count for distribution
      const roundedBand = Math.round(band * 2) / 2;
      bandCounts.set(roundedBand, (bandCounts.get(roundedBand) || 0) + 1);
    }

    // ── Score Distribution ──
    const scoreDistribution: { band: number; count: number }[] = [];
    for (let b = 1; b <= 9; b += 0.5) {
      const count = bandCounts.get(b) || 0;
      if (count > 0 || (b >= 2 && b <= 9)) {
        scoreDistribution.push({ band: b, count });
      }
    }

    // ── Time Management ──
    const timeTakenValues = completedMocks
      .map((m) => m.timeTaken)
      .filter((t): t is number => t != null && t > 0);
    const averageTimeTaken =
      timeTakenValues.length > 0
        ? Math.round(timeTakenValues.reduce((s, t) => s + t, 0) / timeTakenValues.length)
        : 0;

    // ── Skill Gap: best vs worst average band ──
    const skillAvgs: Record<string, { sum: number; count: number }> = {};
    for (const [skill, points] of Object.entries(skillTrends)) {
      if (points.length > 0) {
        skillAvgs[skill] = {
          sum: points.reduce((s, p) => s + p.band, 0),
          count: points.length,
        };
      }
    }

    let bestSkill = "—";
    let worstSkill = "—";
    let bestAvg = 0;
    let worstAvg = 9;

    for (const [skill, { sum, count }] of Object.entries(skillAvgs)) {
      const avg = sum / count;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestSkill = skill.charAt(0).toUpperCase() + skill.slice(1);
      }
      if (avg < worstAvg) {
        worstAvg = avg;
        worstSkill = skill.charAt(0).toUpperCase() + skill.slice(1);
      }
    }

    const gap = Object.keys(skillAvgs).length >= 2
      ? Math.round((bestAvg - worstAvg) * 2) / 2
      : 0;

    // ── Overall Band Trend ──
    const overallTrend = completedMocks.map((mock) => {
      const result = mock.ieltsIntensiveResult!;
      const type = mock.ieltsIntensiveExam.type;
      let band: number;
      if (type === "LISTENING" || type === "READING") {
        band = rawToBand(result.totalScore, type as any);
      } else {
        band = result.totalScore;
      }
      return {
        date: dayjs(mock.submittedAt || mock.createdAt).format("MMM D"),
        band: Math.round(band * 2) / 2,
      };
    });

    return {
      overallTrend,
      skillTrends,
      scoreDistribution,
      timeManagement: { averageTimeTaken, optimalTime: 2400 }, // 40min optimal
      skillGap: { bestSkill, worstSkill, gap },
    };
  }
}

