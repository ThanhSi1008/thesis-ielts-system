import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import * as dayjs from "dayjs";

@Injectable()
export class IeltsStatisticsService {
  private readonly logger = new Logger(IeltsStatisticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getOverviewStats(userId: string) {
    // 1.1 Estimated Overall Band & Target Gap
    // Computed from Intensive mock history vs IeltsProfile.targetBand
    const profile = await this.prisma.ieltsProfile.findUnique({
      where: { userId },
    });

    const recentMocks = await this.prisma.ieltsIntensiveSession.findMany({
      where: {
        userId,
        status: "COMPLETED",
        ieltsIntensiveResult: { isNot: null },
      },
      include: { ieltsIntensiveResult: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    let estimatedBand = null;
    if (recentMocks.length > 0) {
      const bands = recentMocks.map((mock: any) => {
        const result = mock.ieltsIntensiveResult;
        return result?.totalScore || 0;
      }).filter((band: number) => band > 0);
      if (bands.length > 0) {
        estimatedBand = bands.reduce((sum, b) => sum + b, 0) / bands.length;
      }
    }

    const targetBand = profile?.targetBand || null;
    const bandGap = targetBand && estimatedBand ? Math.max(0, targetBand - estimatedBand) : null;

    // 1.2 IELTS-Specific Daily Goal Tracker
    const today = dayjs().startOf("day").toDate();
    // Calculate total time taken today across all IELTS modules
    const advancedWritingToday = await this.prisma.ieltsAdvancedWritingSession.aggregate({
      where: { userId, createdAt: { gte: today } },
      _sum: { timeTaken: true },
    });
    const advancedSpeakingToday = await this.prisma.ieltsAdvancedSpeakingSession.aggregate({
      where: { userId, createdAt: { gte: today } },
      _sum: { timeTaken: true },
    });
    // This is an approximation, we can expand later
    const dailyMinutesPracticed = Math.floor(
      ((advancedWritingToday._sum.timeTaken || 0) +
        (advancedSpeakingToday._sum.timeTaken || 0)) /
        60,
    );
    const dailyCommitmentMins = profile?.dailyCommitmentMins || 30;

    // 1.3 Weekly IELTS Activity Heatmap
    // Placeholder implementation for heatmap data
    const heatmap = [];
    for (let i = 6; i >= 0; i--) {
      heatmap.push({
        date: dayjs().subtract(i, "day").format("YYYY-MM-DD"),
        minutes: Math.floor(Math.random() * 60), // TODO: implement real query
      });
    }

    // 1.4 Recent IELTS Activity Feed
    // Placeholder
    const recentActivity = [];

    // 1.5 IeltsIntensiveExam Countdown & Readiness Score
    const examDate = profile?.examDate;
    const daysToExam = examDate ? dayjs(examDate).diff(dayjs(), "day") : null;
    const readinessScore = estimatedBand && targetBand ? Math.min(100, Math.round((estimatedBand / targetBand) * 100)) : null;

    return {
      estimatedBand,
      targetBand,
      bandGap,
      dailyMinutesPracticed,
      dailyCommitmentMins,
      heatmap,
      recentActivity,
      daysToExam,
      readinessScore,
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

    // 2.4 Average Foundation Accuracy
    // 2.5 Foundation Time Balance
    
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
    // 4.1 Question Type Accuracy Heatmap
    // 4.2 Weak Spots Identification
    // 4.3 Advanced Score Trend Line
    // 4.4 Writing AI Feedback Summary
    // 4.5 Speaking AI Feedback Summary
    
    // Returning dummy data for now
    return {
      heatmap: [],
      weakSpots: [],
      scoreTrend: [],
      writingFeedbackSummary: {},
      speakingFeedbackSummary: {},
    };
  }

  async getIntensiveStats(userId: string) {
    // 5.1 Overall Mock Band Trend
    // 5.2 Individual Skill Band Trends
    // 5.3 Score Distribution Histogram
    // 5.4 Time Management Analytics
    // 5.5 Best vs Worst Skill Gap
    
    // Returning dummy data for now
    return {
      overallTrend: [],
      skillTrends: { listening: [], reading: [], writing: [], speaking: [] },
      scoreDistribution: [],
      timeManagement: { averageTimeTaken: 0, optimalTime: 10800 },
      skillGap: { bestSkill: "Reading", worstSkill: "Writing", gap: 1.5 },
    };
  }
}
