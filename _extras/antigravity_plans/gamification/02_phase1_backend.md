# Phase 1 — Backend Foundation

> **Goal:** Create Prisma models, GamificationService (XP + achievements), seed data, and controller.
> **Dependencies:** None. **Effort:** ~4-5 hours.

---

## Step 1: Prisma Schema

**File:** `backend-core/prisma/schema.prisma`

### 1.1 — Add models after the Community Posts section (~end of file)

```prisma
// ============================================================
// GAMIFICATION
// ============================================================

model Achievement {
  id          String   @id @default(uuid())
  key         String   @unique
  name        String
  description String
  icon        String
  category    String
  tier        Int      @default(1)
  xpReward    Int      @default(0)
  order       Int      @default(0)
  createdAt   DateTime @default(now())

  userAchievements UserAchievement[]
  @@map("achievements")
}

model UserAchievement {
  id            String   @id @default(uuid())
  userId        String
  achievementId String
  earnedAt      DateTime @default(now())

  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievement Achievement @relation(fields: [achievementId], references: [id], onDelete: Cascade)

  @@unique([userId, achievementId])
  @@map("user_achievements")
}

model XpLog {
  id        String   @id @default(uuid())
  userId    String
  amount    Int
  reason    String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@map("xp_logs")
}
```

### 1.2 — Add to IeltsProfile model (~line 1020)

```prisma
  totalXp     Int @default(0)
  level       Int @default(0)
```

### 1.3 — Add to User model relations (~line 52)

```prisma
  userAchievements   UserAchievement[]
  xpLogs             XpLog[]
```

### 1.4 — Run migration

```bash
cd backend-core
npx prisma db push
npx prisma generate
```

---

## Step 2: Achievement Seed Script

**File:** `backend-core/prisma/seed-achievements.ts` (create new)

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ACHIEVEMENTS = [
  // ── FOUNDATION: VOCABULARY ──
  { key: "FV_FIRST_WORDS", name: "First Words", description: "Complete your first vocabulary unit", icon: "📖", category: "FOUNDATION_VOCAB", tier: 1, xpReward: 20, order: 1 },
  { key: "FV_BOOKWORM", name: "Bookworm", description: "Complete all units in one vocabulary book", icon: "📗", category: "FOUNDATION_VOCAB", tier: 2, xpReward: 50, order: 2 },
  { key: "FV_PERFECT", name: "Perfect Vocab", description: "Score 100% on any vocabulary exercise", icon: "💯", category: "FOUNDATION_VOCAB", tier: 2, xpReward: 30, order: 3 },

  // ── FOUNDATION: GRAMMAR ──
  { key: "FG_STARTER", name: "Grammar Starter", description: "Complete your first grammar unit", icon: "✏️", category: "FOUNDATION_GRAMMAR", tier: 1, xpReward: 20, order: 10 },
  { key: "FG_GRADUATE", name: "Grammar Graduate", description: "Complete all units in one grammar book", icon: "📘", category: "FOUNDATION_GRAMMAR", tier: 2, xpReward: 50, order: 11 },

  // ── FOUNDATION: PRONUNCIATION ──
  { key: "FP_FIRST_SOUND", name: "First Sound", description: "Practice any pronunciation sound", icon: "🔤", category: "FOUNDATION_PRONUNCIATION", tier: 1, xpReward: 10, order: 20 },
  { key: "FP_SHARP_EAR", name: "Sharp Ear", description: "Master 10 pronunciation sounds", icon: "🎯", category: "FOUNDATION_PRONUNCIATION", tier: 2, xpReward: 40, order: 21 },
  { key: "FP_NATIVE", name: "Native Speaker", description: "Master all IPA sounds", icon: "👄", category: "FOUNDATION_PRONUNCIATION", tier: 3, xpReward: 100, order: 22 },

  // ── IELTS BASIC ──
  { key: "IB_LESSON_5", name: "Lesson Learner", description: "Complete 5 IELTS basic lessons", icon: "📗", category: "IELTS_BASIC", tier: 1, xpReward: 30, order: 30 },
  { key: "IB_LISTENING_3", name: "Listening Rookie", description: "Complete 3 listening exercises", icon: "🎧", category: "IELTS_BASIC", tier: 1, xpReward: 25, order: 31 },
  { key: "IB_READING_3", name: "Reading Rookie", description: "Complete 3 reading exercises", icon: "📖", category: "IELTS_BASIC", tier: 1, xpReward: 25, order: 32 },
  { key: "IB_WRITING_3", name: "Writing Rookie", description: "Submit 3 writing exercises", icon: "✍️", category: "IELTS_BASIC", tier: 1, xpReward: 25, order: 33 },

  // ── IELTS ADVANCED ──
  { key: "IA_LISTENER_5", name: "Cambridge Listener", description: "Complete 5 advanced listening sessions", icon: "🎧", category: "IELTS_ADVANCED", tier: 2, xpReward: 40, order: 40 },
  { key: "IA_READER_5", name: "Cambridge Reader", description: "Complete 5 advanced reading sessions", icon: "📖", category: "IELTS_ADVANCED", tier: 2, xpReward: 40, order: 41 },
  { key: "IA_HIGH_ACHIEVER", name: "High Achiever", description: "Score ≥80% on any advanced practice", icon: "🏅", category: "IELTS_ADVANCED", tier: 2, xpReward: 30, order: 42 },

  // ── IELTS INTENSIVE ──
  { key: "II_FIRST_EXAM", name: "First Exam", description: "Submit your first full IELTS exam", icon: "📝", category: "IELTS_INTENSIVE", tier: 1, xpReward: 30, order: 50 },
  { key: "II_BAND_6", name: "Band 6", description: "Score ≥6.0 on any exam", icon: "🎯", category: "IELTS_INTENSIVE", tier: 1, xpReward: 40, order: 51 },
  { key: "II_BAND_7", name: "Band 7", description: "Score ≥7.0 on any exam", icon: "⭐", category: "IELTS_INTENSIVE", tier: 2, xpReward: 60, order: 52 },
  { key: "II_BAND_8", name: "Band 8", description: "Score ≥8.0 on any exam", icon: "💎", category: "IELTS_INTENSIVE", tier: 3, xpReward: 100, order: 53 },
  { key: "II_VETERAN", name: "Exam Veteran", description: "Complete 10 full exams", icon: "🏆", category: "IELTS_INTENSIVE", tier: 2, xpReward: 50, order: 54 },

  // ── SHADOWING ──
  { key: "SH_ECHO", name: "Echo", description: "Complete your first shadowing lesson", icon: "🎙️", category: "SHADOWING", tier: 1, xpReward: 20, order: 60 },
  { key: "SH_PARROT", name: "Parrot", description: "Complete 10 shadowing lessons", icon: "🗣️", category: "SHADOWING", tier: 2, xpReward: 40, order: 61 },
  { key: "SH_VOICE_ACTOR", name: "Voice Actor", description: "Complete 30 shadowing lessons", icon: "🎤", category: "SHADOWING", tier: 3, xpReward: 80, order: 62 },

  // ── DICTATION ──
  { key: "DI_FIRST", name: "First Dictation", description: "Complete your first dictation lesson", icon: "🎧", category: "DICTATION", tier: 1, xpReward: 20, order: 70 },
  { key: "DI_REGULAR", name: "Dictation Regular", description: "Complete 10 dictation lessons", icon: "📝", category: "DICTATION", tier: 2, xpReward: 40, order: 71 },
  { key: "DI_EXPERT", name: "Dictation Expert", description: "Complete a lesson on Expert difficulty", icon: "🏆", category: "DICTATION", tier: 3, xpReward: 60, order: 72 },

  // ── VOCAB LAB ──
  { key: "VL_DECK_BUILDER", name: "Deck Builder", description: "Create your first deck", icon: "📦", category: "VOCAB_LAB", tier: 1, xpReward: 10, order: 80 },
  { key: "VL_COLLECTOR", name: "Card Collector", description: "Create 100 flashcards", icon: "📚", category: "VOCAB_LAB", tier: 2, xpReward: 40, order: 81 },
  { key: "VL_MEMORY_MASTER", name: "Memory Master", description: "Have 50 cards in REVIEW state", icon: "🧠", category: "VOCAB_LAB", tier: 2, xpReward: 50, order: 82 },
  { key: "VL_PUBLISHER", name: "Deck Publisher", description: "Publish a deck to the Marketplace", icon: "🏪", category: "VOCAB_LAB", tier: 1, xpReward: 20, order: 83 },

  // ── COMMUNITY ──
  { key: "CM_FIRST_POST", name: "First Post", description: "Create your first community post", icon: "✍️", category: "COMMUNITY", tier: 1, xpReward: 10, order: 90 },
  { key: "CM_CONVERSATIONALIST", name: "Conversationalist", description: "Leave 10 comments", icon: "💬", category: "COMMUNITY", tier: 1, xpReward: 20, order: 91 },
  { key: "CM_CROWD_FAVORITE", name: "Crowd Favorite", description: "Receive 25 total likes", icon: "❤️", category: "COMMUNITY", tier: 2, xpReward: 40, order: 92 },

  // ── CROSS-MODULE ──
  { key: "XM_ON_FIRE", name: "On Fire", description: "Reach a 7-day streak", icon: "🔥", category: "CROSS_MODULE", tier: 1, xpReward: 30, order: 100 },
  { key: "XM_MARATHON", name: "Marathon", description: "Reach a 30-day streak", icon: "🏔️", category: "CROSS_MODULE", tier: 2, xpReward: 80, order: 101 },
  { key: "XM_UNSTOPPABLE", name: "Unstoppable", description: "Reach a 100-day streak", icon: "🌋", category: "CROSS_MODULE", tier: 3, xpReward: 200, order: 102 },
  { key: "XM_DEDICATED", name: "Dedicated Learner", description: "Reach Level 10", icon: "🎓", category: "CROSS_MODULE", tier: 2, xpReward: 50, order: 103 },
];

async function main() {
  console.log("Seeding achievements...");
  for (const a of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { key: a.key },
      update: { ...a },
      create: { ...a },
    });
  }
  console.log(`✅ Seeded ${ACHIEVEMENTS.length} achievements`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run with: `npx ts-node prisma/seed-achievements.ts`

---

## Step 3: GamificationService

**File:** `backend-core/src/modules/gamification/gamification.service.ts` (create new)

```typescript
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
        for (const key of event.achievementKeys) {
          await this.tryGrantAchievement(userId, key);
        }
      }
    } catch (error) {
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
        title: `🎉 Level ${newLevel}!`,
        body: `You've reached Level ${newLevel}! Keep up the great work.`,
        icon: "🎉",
        link: "/profile",
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
      title: `${achievement.icon} Achievement Unlocked!`,
      body: `${achievement.name} — ${achievement.description}`,
      icon: achievement.icon,
      link: "/profile",
    });

    this.logger.log(`🏆 ${achievementKey} granted to ${userId}`);
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
```

---

## Step 4: Controller

**File:** `backend-core/src/modules/gamification/gamification.controller.ts` (create new)

```typescript
import { Controller, Get, Query, UseGuards, Request } from "@nestjs/common";
import { GamificationService } from "./gamification.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("gamification")
@UseGuards(JwtAuthGuard)
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get("profile")
  async getProfile(@Request() req: any) {
    return this.gamificationService.getProfile(req.user.id);
  }

  @Get("achievements")
  async getAchievements(@Request() req: any) {
    return this.gamificationService.getAchievements(req.user.id);
  }

  @Get("leaderboard")
  async getLeaderboard(
    @Query("type") type: string = "xp_weekly",
    @Query("limit") limit: string = "20",
  ) {
    return this.gamificationService.getLeaderboard(type, parseInt(limit));
  }

  @Get("xp-history")
  async getXpHistory(@Request() req: any) {
    return this.gamificationService.getXpHistory(req.user.id);
  }
}
```

---

## Step 5: Module

**File:** `backend-core/src/modules/gamification/gamification.module.ts` (create new)

```typescript
import { Module } from "@nestjs/common";
import { GamificationController } from "./gamification.controller";
import { GamificationService } from "./gamification.service";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [NotificationsModule],
  controllers: [GamificationController],
  providers: [GamificationService],
  exports: [GamificationService],  // Other modules will inject this
})
export class GamificationModule {}
```

---

## Step 6: Register in AppModule

**File:** `backend-core/src/app.module.ts`

Add import:
```typescript
import { GamificationModule } from "./modules/gamification/gamification.module";
```

Add to imports array after `PostsModule`:
```typescript
    PostsModule,
    GamificationModule,
```

---

## Step 7: Verify

1. Run migration: `npx prisma db push` then `npx prisma generate`
2. Seed achievements: `npx ts-node prisma/seed-achievements.ts`
3. Restart backend: `npm run backend:dev`
4. Test endpoints:

```bash
# Get gamification profile
curl http://localhost:3000/api/v1/gamification/profile -H "Authorization: Bearer <TOKEN>"
# Expected: { totalXp: 0, level: 0, currentLevelXp: 0, xpNeeded: 100, achievementCount: 0, totalAchievements: 35 }

# Get all achievements
curl http://localhost:3000/api/v1/gamification/achievements -H "Authorization: Bearer <TOKEN>"
# Expected: Array of 35 achievements, all with earned: false

# Get leaderboard
curl "http://localhost:3000/api/v1/gamification/leaderboard?type=streak" -H "Authorization: Bearer <TOKEN>"
```
