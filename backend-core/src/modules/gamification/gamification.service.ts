import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";

const LEVEL_XP_PER = 100; // XP to reach level N = 100 * N

export interface GamificationEvent {
  xp: number;
  reason: string;
  achievementKeys?: string[]; // Achievement keys to check
}

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * Main entry point — called from every service after a gamifiable action.
   */
  async onEvent(userId: string, event: GamificationEvent) {
    try {
      // 1. Award XP
      if (event.xp > 0) {
        await this.awardXp(userId, event.xp, event.reason);
      }

      // 2. Check specific achievements
      if (event.achievementKeys?.length) {
        await this.checkCountAchievements(userId, event.achievementKeys);
      }
    } catch (error: any) {
      // Non-blocking — gamification should never break core flows
      this.logger.error(`Gamification error for ${userId}: ${error.message}`);
    }
  }

  // ==================== XP ====================

  private async awardXp(userId: string, amount: number, reason: string) {
    // Log the XP event
    await this.prisma.xpLog.create({
      data: { userId, amount, reason },
    });

    // Update total XP and recalculate level
    const profile = await this.prisma.ieltsProfile.findUnique({
      where: { userId },
      select: { id: true, totalXp: true, level: true },
    });

    if (!profile) return;

    const newTotalXp = profile.totalXp + amount;
    const newLevel = this.calculateLevel(newTotalXp);
    const leveledUp = newLevel > profile.level;

    await this.prisma.ieltsProfile.update({
      where: { id: profile.id },
      data: { totalXp: newTotalXp, level: newLevel },
    });

    // Notify on level-up
    if (leveledUp) {
      await this.notifications.create({
        userId,
        type: "ACHIEVEMENT",
        title: `Level ${newLevel} Reached!`,
        body: `You've reached Level ${newLevel}! Keep up the great work.`,
        icon: "level_up",
        link: "/profile?tab=gamification",
      });

      // Check level-based achievements
      if (newLevel >= 10) {
        await this.tryGrantAchievement(userId, "XM_DEDICATED");
      }
    }
  }

  private calculateLevel(totalXp: number): number {
    // Level N requires 100*N cumulative XP
    // Sum(1..N) * 100 = N*(N+1)/2 * 100
    // Solve for N: N = floor((-1 + sqrt(1 + 8*totalXp/100)) / 2)
    let level = 0;
    let xpNeeded = 0;
    while (xpNeeded + (level + 1) * LEVEL_XP_PER <= totalXp) {
      level++;
      xpNeeded += level * LEVEL_XP_PER;
    }
    return level;
  }

  // ==================== ACHIEVEMENTS ====================

  async tryGrantAchievement(userId: string, achievementKey: string) {
    // Check if already earned
    const existing = await this.prisma.userAchievement.findFirst({
      where: {
        userId,
        achievement: { key: achievementKey },
      },
    });
    if (existing) return; // Already earned

    // Find achievement definition
    const achievement = await this.prisma.achievement.findUnique({
      where: { key: achievementKey },
    });
    if (!achievement) return;

    // Grant it
    await this.prisma.userAchievement.create({
      data: { userId, achievementId: achievement.id },
    });

    // Award XP reward
    if (achievement.xpReward > 0) {
      await this.awardXp(userId, achievement.xpReward, `ACHIEVEMENT_${achievementKey}`);
    }

    // Send notification
    await this.notifications.create({
      userId,
      type: "ACHIEVEMENT",
      title: `Achievement Unlocked!`,
      body: `${achievement.name} — ${achievement.description}`,
      icon: "achievement",
      link: "/profile?tab=gamification",
    });

    this.logger.log(`🏆 ${achievementKey} granted to ${userId}`);
  }

  /**
   * Check count-based achievement thresholds before granting.
   * Called by onEvent when achievementKeys include count-based badges.
   */
  async checkCountAchievements(userId: string, keys: string[]) {
    for (const key of keys) {
      const existing = await this.prisma.userAchievement.findFirst({
        where: { userId, achievement: { key } },
      });
      if (existing) continue;

      let shouldGrant = false;

      switch (key) {
        // Vocab Foundation
        case "FV_FIRST_WORDS":
          shouldGrant = (await this.prisma.foundationVocabProgress.count({ where: { userId, isCompleted: true } })) >= 1;
          break;
        case "FV_BOOKWORM": {
          // Check if any book has all units completed
          const books = await this.prisma.foundationVocabBook.findMany({ include: { units: true } });
          for (const book of books) {
            const completed = await this.prisma.foundationVocabProgress.count({
              where: { userId, isCompleted: true, unitId: { in: book.units.map((u) => u.id) } },
            });
            if (completed === book.units.length && book.units.length > 0) { shouldGrant = true; break; }
          }
          break;
        }

        // Grammar
        case "FG_STARTER":
          shouldGrant = (await this.prisma.foundationGrammarProgress.count({ where: { userId, theoryCompleted: true, exerciseScore: { not: null } } })) >= 1;
          break;

        // Pronunciation
        case "FP_SHARP_EAR":
          shouldGrant = (await this.prisma.foundationPronunciationProgress.count({ where: { userId, status: "MASTERED" } })) >= 10;
          break;
        case "FP_NATIVE": {
          const totalSounds = await this.prisma.foundationPronunciationSound.count();
          const masteredSounds = await this.prisma.foundationPronunciationProgress.count({ where: { userId, status: "MASTERED" } });
          shouldGrant = totalSounds > 0 && masteredSounds === totalSounds;
          break;
        }

        // IELTS Basic
        case "IB_LESSON_5":
          shouldGrant = (await this.prisma.ieltsBasicProgress.count({ where: { userId, isCompleted: true, lessonId: { not: null } } })) >= 5;
          break;
        case "IB_LISTENING_3":
          shouldGrant = (await this.prisma.ieltsBasicProgress.count({ where: { userId, isCompleted: true, listeningExerciseId: { not: null } } })) >= 3;
          break;
        case "IB_READING_3":
          shouldGrant = (await this.prisma.ieltsBasicProgress.count({ where: { userId, isCompleted: true, readingExerciseId: { not: null } } })) >= 3;
          break;
        case "IB_WRITING_3":
          shouldGrant = (await this.prisma.ieltsBasicWritingAnswer.count({ where: { userId } })) >= 3;
          break;

        // IELTS Advanced
        case "IA_LISTENER_5":
          shouldGrant = (await this.prisma.ieltsAdvancedListeningSession.count({ where: { userId } })) >= 5;
          break;
        case "IA_READER_5":
          shouldGrant = (await this.prisma.ieltsAdvancedReadingSession.count({ where: { userId } })) >= 5;
          break;

        // IELTS Intensive
        case "II_FIRST_EXAM":
          shouldGrant = (await this.prisma.ieltsIntensiveSession.count({ where: { userId, status: { in: ["COMPLETED", "GRADED"] } } })) >= 1;
          break;
        case "II_VETERAN":
          shouldGrant = (await this.prisma.ieltsIntensiveSession.count({ where: { userId, status: { in: ["COMPLETED", "GRADED"] } } })) >= 10;
          break;

        // Shadowing
        case "SH_ECHO":
          shouldGrant = true; // Triggered only when a full foundationVocabLesson is completed
          break;
        case "SH_PARROT":
          shouldGrant = (await this.prisma.shadowingProgress.count({ where: { userId, completedSentences: { isEmpty: false } } })) >= 10; // Simple approximation if array not empty, since full check requires fetching the video sentence length
          break;

        // Dictation
        case "DI_FIRST":
          shouldGrant = true; // Triggered only when a full foundationVocabLesson is completed
          break;
        case "DI_REGULAR":
          shouldGrant = (await this.prisma.dictationProgress.count({ where: { userId, completedSentences: { isEmpty: false } } })) >= 10;
          break;

        // Vocab Lab
        case "VL_DECK_BUILDER":
          shouldGrant = (await this.prisma.deck.count({ where: { userId } })) >= 1;
          break;
        case "VL_COLLECTOR":
          shouldGrant = (await this.prisma.flashcard.count({ where: { deck: { userId } } })) >= 100;
          break;
        case "VL_MEMORY_MASTER":
          shouldGrant = (await this.prisma.flashcard.count({ where: { deck: { userId }, cardState: "REVIEW" } })) >= 50;
          break;
        case "VL_PUBLISHER":
          shouldGrant = (await this.prisma.sharedDeck.count({ where: { publisherId: userId } })) >= 1;
          break;

        // Community
        case "CM_FIRST_POST":
          shouldGrant = (await this.prisma.post.count({ where: { authorId: userId } })) >= 1;
          break;
        case "CM_CONVERSATIONALIST":
          shouldGrant = (await this.prisma.comment.count({ where: { authorId: userId } })) >= 10;
          break;

        // Streak
        case "XM_ON_FIRE":
        case "XM_MARATHON":
        case "XM_UNSTOPPABLE":
        case "XM_DEDICATED":
          shouldGrant = true; // Triggered only at the right streak count
          break;

        default:
          shouldGrant = true; // For score-based achievements already checked by caller
      }

      if (shouldGrant) {
        await this.tryGrantAchievement(userId, key);
      }
    }
  }

  // ==================== QUERIES ====================

  async getProfile(userId: string) {
    const profile = await this.prisma.ieltsProfile.findUnique({
      where: { userId },
      select: { totalXp: true, level: true },
    });

    const xpForCurrentLevel = profile ? this.xpForLevel(profile.level) : 0;
    const xpForNextLevel = profile ? this.xpForLevel(profile.level + 1) : 100;
    const currentLevelXp = profile ? profile.totalXp - xpForCurrentLevel : 0;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;

    const achievementCount = await this.prisma.userAchievement.count({
      where: { userId },
    });
    const totalAchievements = await this.prisma.achievement.count();

    return {
      totalXp: profile?.totalXp ?? 0,
      level: profile?.level ?? 0,
      currentLevelXp,
      xpNeeded,
      achievementCount,
      totalAchievements,
    };
  }

  private xpForLevel(level: number): number {
    // Cumulative XP for level N = sum(1..N) * 100 = N*(N+1)/2 * 100
    return (level * (level + 1) / 2) * LEVEL_XP_PER;
  }

  async getAchievements(userId: string) {
    const all = await this.prisma.achievement.findMany({
      orderBy: [{ category: "asc" }, { order: "asc" }],
      include: {
        userAchievements: {
          where: { userId },
          select: { earnedAt: true },
        },
      },
    });

    return all.map((a) => ({
      id: a.id,
      key: a.key,
      name: a.name,
      description: a.description,
      icon: a.icon,
      category: a.category,
      tier: a.tier,
      earned: a.userAchievements.length > 0,
      earnedAt: a.userAchievements[0]?.earnedAt ?? null,
    }));
  }

  async getLeaderboard(type: string = "xp_weekly", limit: number = 20) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    if (type === "xp_weekly") {
      const results = await this.prisma.xpLog.groupBy({
        by: ["userId"],
        where: { createdAt: { gte: startOfWeek } },
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
        take: limit,
      });

      const userIds = results.map((r) => r.userId);
      const users = await this.prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, firstName: true, lastName: true, avatar: true },
      });

      const userMap = new Map(users.map((u) => [u.id, u]));

      return results.map((r, i) => ({
        rank: i + 1,
        userId: r.userId,
        name: (() => {
          const u = userMap.get(r.userId);
          return u?.firstName && u?.lastName ? `${u.firstName} ${u.lastName}` : "Anonymous";
        })(),
        avatar: userMap.get(r.userId)?.avatar ?? null,
        value: r._sum.amount ?? 0,
      }));
    }

    if (type === "streak") {
      const results = await this.prisma.ieltsProfile.findMany({
        where: { currentStreak: { gt: 0 } },
        orderBy: { currentStreak: "desc" },
        take: limit,
        select: {
          userId: true,
          currentStreak: true,
          user: { select: { firstName: true, lastName: true, avatar: true } },
        },
      });

      return results.map((r, i) => ({
        rank: i + 1,
        userId: r.userId,
        name: r.user.firstName && r.user.lastName ? `${r.user.firstName} ${r.user.lastName}` : "Anonymous",
        avatar: r.user.avatar,
        value: r.currentStreak,
      }));
    }

    return [];
  }

  async getXpHistory(userId: string, limit: number = 20) {
    return this.prisma.xpLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}
