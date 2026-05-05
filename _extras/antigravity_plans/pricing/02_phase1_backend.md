# Phase 1 — Backend Foundation

> **Goal:** Create Prisma models, SubscriptionsService, seed pricing plans, and controller.
> **Dependencies:** None. **Effort:** ~4-5 hours.

---

## Step 1: Prisma Schema

**File:** `backend-core/prisma/schema.prisma`

### 1.1 — Add enums after existing enums (~line 540, after CardState)

```prisma
// ============================================================
// SUBSCRIPTION & PRICING
// ============================================================

enum SubscriptionTier {
  FREE
  PREMIUM
  PRO
}

enum SubscriptionStatus {
  ACTIVE
  TRIALING
  PAST_DUE
  CANCELED
  EXPIRED
}

enum PaymentProvider {
  MOCK       // Thesis demo — simulated payments
  STRIPE     // Future — real payment processing
  MANUAL     // Admin-granted subscriptions
}
```

### 1.2 — Add models at end of file (after PostBookmark model, ~line 1229)

```prisma
// ============================================================
// SUBSCRIPTION & PRICING
// ============================================================

model Subscription {
  id                 String             @id @default(uuid())
  userId             String             @unique
  tier               SubscriptionTier   @default(FREE)
  status             SubscriptionStatus @default(ACTIVE)
  provider           PaymentProvider?
  providerSubId      String?            // Provider-specific subscription ID
  currentPeriodStart DateTime?
  currentPeriodEnd   DateTime?
  canceledAt         DateTime?
  trialEndsAt        DateTime?
  trialUsed          Boolean            @default(false)
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt

  user           User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  payments       Payment[]
  usageRecords   UsageRecord[]

  @@map("subscriptions")
}

model Payment {
  id             String          @id @default(uuid())
  subscriptionId String
  amount         Int             // In cents (999 = $9.99)
  currency       String          @default("USD")
  provider       PaymentProvider
  providerPayId  String?         // Provider-specific payment/transaction ID
  status         String          // "succeeded", "failed", "pending", "refunded"
  metadata       Json?
  createdAt      DateTime        @default(now())

  subscription Subscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)

  @@index([subscriptionId])
  @@map("payments")
}

model UsageRecord {
  id             String   @id @default(uuid())
  subscriptionId String
  feature        String   // "AI_WRITING_GRADING", "AI_SPEAKING_GRADING", "AI_CARD_GEN", "PRONUNCIATION_ATTEMPT"
  count          Int      @default(0)
  periodStart    DateTime
  periodEnd      DateTime
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  subscription Subscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)

  @@unique([subscriptionId, feature, periodStart])
  @@map("usage_records")
}

model PricingPlan {
  id            String           @id @default(uuid())
  tier          SubscriptionTier
  name          String           // "Premium Monthly", "Pro Annual"
  description   String?
  priceAmount   Int              // In cents (999 = $9.99)
  currency      String           @default("USD")
  interval      String           // "month" | "year"
  intervalCount Int              @default(1)
  features      Json             // Array of feature strings for display
  isActive      Boolean          @default(true)
  order         Int              @default(0)
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  @@map("pricing_plans")
}
```

### 1.3 — Add to User model relations (~line 59, after `bookmarks`)

```prisma
  subscription       Subscription?
```

### 1.4 — Run migration

```bash
cd backend-core
npx prisma db push
npx prisma generate
```

---

## Step 2: Constants — Feature Limits

**File:** `backend-core/src/modules/subscriptions/constants/feature-limits.ts` (create new)

This file defines all quota/tier limits in one place. All guards and services reference this — no magic numbers scattered across the codebase.

```typescript
/**
 * Feature limit configuration per subscription tier.
 * Values: number = max per period, Infinity = unlimited, 0 = blocked.
 */

export const TIER_LIMITS = {
  FREE: {
    // Foundation
    VOCABULARY_BOOKS: 2,           // First 2 books only
    GRAMMAR_LEVELS: ["Elementary"], // Only elementary level
    PRONUNCIATION_ATTEMPT: 5,      // Per day

    // IELTS
    IELTS_BASIC_LESSONS_PER_SKILL: 3,
    IELTS_BASIC_EXERCISES_PER_SKILL: 2,
    IELTS_ADVANCED_ACCESS: false,
    AI_WRITING_GRADING: 0,         // Per month
    AI_SPEAKING_GRADING: 0,        // Per month
    EXAM_HISTORY_LIMIT: 3,

    // Skills
    SHADOWING_SYSTEM_LESSONS: 5,
    DICTATION_SYSTEM_LESSONS: 5,
    YOUTUBE_IMPORT: false,

    // Vocab Lab
    MAX_DECKS: 3,
    MAX_CARDS_PER_DECK: 50,
    AI_CARD_GEN: 0,                // Per month
    MARKETPLACE_IMPORT: false,
    MARKETPLACE_PUBLISH: false,
  },

  PREMIUM: {
    VOCABULARY_BOOKS: Infinity,
    GRAMMAR_LEVELS: ["Elementary", "Intermediate", "Advanced"],
    PRONUNCIATION_ATTEMPT: Infinity,

    IELTS_BASIC_LESSONS_PER_SKILL: Infinity,
    IELTS_BASIC_EXERCISES_PER_SKILL: Infinity,
    IELTS_ADVANCED_ACCESS: true,
    AI_WRITING_GRADING: 10,
    AI_SPEAKING_GRADING: 10,
    EXAM_HISTORY_LIMIT: Infinity,

    SHADOWING_SYSTEM_LESSONS: Infinity,
    DICTATION_SYSTEM_LESSONS: Infinity,
    YOUTUBE_IMPORT: true,

    MAX_DECKS: Infinity,
    MAX_CARDS_PER_DECK: Infinity,
    AI_CARD_GEN: 50,
    MARKETPLACE_IMPORT: true,
    MARKETPLACE_PUBLISH: true,
  },

  PRO: {
    VOCABULARY_BOOKS: Infinity,
    GRAMMAR_LEVELS: ["Elementary", "Intermediate", "Advanced"],
    PRONUNCIATION_ATTEMPT: Infinity,

    IELTS_BASIC_LESSONS_PER_SKILL: Infinity,
    IELTS_BASIC_EXERCISES_PER_SKILL: Infinity,
    IELTS_ADVANCED_ACCESS: true,
    AI_WRITING_GRADING: Infinity,
    AI_SPEAKING_GRADING: Infinity,
    EXAM_HISTORY_LIMIT: Infinity,

    SHADOWING_SYSTEM_LESSONS: Infinity,
    DICTATION_SYSTEM_LESSONS: Infinity,
    YOUTUBE_IMPORT: true,

    MAX_DECKS: Infinity,
    MAX_CARDS_PER_DECK: Infinity,
    AI_CARD_GEN: Infinity,
    MARKETPLACE_IMPORT: true,
    MARKETPLACE_PUBLISH: true,
  },
} as const;

/**
 * Features that are tracked with monthly usage counters.
 * These use the UsageRecord model.
 */
export const QUOTA_FEATURES = [
  "AI_WRITING_GRADING",
  "AI_SPEAKING_GRADING",
  "AI_CARD_GEN",
] as const;

/**
 * Features tracked with daily counters (reset at midnight).
 */
export const DAILY_QUOTA_FEATURES = [
  "PRONUNCIATION_ATTEMPT",
] as const;

export type QuotaFeature = (typeof QUOTA_FEATURES)[number];
export type DailyQuotaFeature = (typeof DAILY_QUOTA_FEATURES)[number];
export type TierKey = keyof typeof TIER_LIMITS;
```

---

## Step 3: DTOs

**File:** `backend-core/src/modules/subscriptions/dto/subscriptions.dto.ts` (create new)

```typescript
import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";

export class CheckoutDto {
  @IsString()
  planId: string; // PricingPlan ID
}

export class AdminGrantDto {
  @IsUUID()
  userId: string;

  @IsString()
  tier: string; // "PREMIUM" | "PRO"

  @IsOptional()
  @IsString()
  durationDays?: string; // Default: 30
}

export class CancelSubscriptionDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
```

---

## Step 4: SubscriptionsService

**File:** `backend-core/src/modules/subscriptions/subscriptions.service.ts` (create new)

```typescript
import { Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { TIER_LIMITS, QUOTA_FEATURES, DAILY_QUOTA_FEATURES, TierKey, QuotaFeature } from "./constants/feature-limits";

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  // ==================== QUERIES ====================

  /**
   * Get or create subscription for user. Every user has a subscription row.
   */
  async getOrCreateSubscription(userId: string) {
    let sub = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!sub) {
      sub = await this.prisma.subscription.create({
        data: { userId, tier: "FREE", status: "ACTIVE" },
      });
    }

    // Check if trial has expired
    if (sub.status === "TRIALING" && sub.trialEndsAt && new Date() > sub.trialEndsAt) {
      sub = await this.prisma.subscription.update({
        where: { id: sub.id },
        data: { tier: "FREE", status: "EXPIRED", trialEndsAt: null },
      });
      this.logger.log(`Trial expired for user ${userId}, downgraded to FREE`);
    }

    // Check if subscription period has ended
    if (sub.status === "ACTIVE" && sub.currentPeriodEnd && new Date() > sub.currentPeriodEnd) {
      sub = await this.prisma.subscription.update({
        where: { id: sub.id },
        data: { tier: "FREE", status: "EXPIRED" },
      });
      this.logger.log(`Subscription expired for user ${userId}, downgraded to FREE`);
    }

    return sub;
  }

  /**
   * Get user's subscription with current usage stats.
   */
  async getMySubscription(userId: string) {
    const sub = await this.getOrCreateSubscription(userId);
    const usage = await this.getCurrentUsage(sub.id);
    const limits = TIER_LIMITS[sub.tier as TierKey];

    return {
      ...sub,
      usage,
      limits,
    };
  }

  /**
   * List all active pricing plans.
   */
  async getPlans() {
    return this.prisma.pricingPlan.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }],
    });
  }

  // ==================== USAGE TRACKING ====================

  /**
   * Get current period usage for a subscription.
   */
  async getCurrentUsage(subscriptionId: string) {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const records = await this.prisma.usageRecord.findMany({
      where: {
        subscriptionId,
        periodStart: { gte: periodStart },
      },
    });

    const usage: Record<string, { used: number; limit: number }> = {};

    for (const feature of QUOTA_FEATURES) {
      const record = records.find((r) => r.feature === feature);
      const sub = await this.prisma.subscription.findUnique({
        where: { id: subscriptionId },
        select: { tier: true },
      });
      const limit = TIER_LIMITS[(sub?.tier ?? "FREE") as TierKey][feature];

      usage[feature] = {
        used: record?.count ?? 0,
        limit: limit === Infinity ? -1 : (limit as number), // -1 = unlimited
      };
    }

    return usage;
  }

  /**
   * Increment usage for a quota-tracked feature.
   * Returns true if usage is within limits, false if quota exceeded.
   */
  async incrementUsage(userId: string, feature: QuotaFeature): Promise<boolean> {
    const sub = await this.getOrCreateSubscription(userId);
    const limit = TIER_LIMITS[sub.tier as TierKey][feature];

    // Unlimited
    if (limit === Infinity) return true;

    // Blocked (0 limit)
    if (limit === 0) return false;

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const record = await this.prisma.usageRecord.upsert({
      where: {
        subscriptionId_feature_periodStart: {
          subscriptionId: sub.id,
          feature,
          periodStart,
        },
      },
      update: { count: { increment: 1 } },
      create: {
        subscriptionId: sub.id,
        feature,
        count: 1,
        periodStart,
        periodEnd,
      },
    });

    if (record.count > (limit as number)) {
      // Rollback the increment
      await this.prisma.usageRecord.update({
        where: { id: record.id },
        data: { count: { decrement: 1 } },
      });
      return false;
    }

    // Notify at 80% usage
    const percentUsed = record.count / (limit as number);
    if (percentUsed >= 0.8 && percentUsed < 1.0) {
      await this.notifications.create({
        userId,
        type: "SYSTEM_ANNOUNCEMENT",
        title: "⚠️ Usage Approaching Limit",
        body: `You've used ${record.count}/${limit} ${feature.replace(/_/g, " ").toLowerCase()} this month.`,
        icon: "⚠️",
        link: "/pricing",
      });
    }

    return true;
  }

  /**
   * Check daily usage (e.g., pronunciation attempts).
   */
  async checkDailyUsage(userId: string, feature: string): Promise<{ allowed: boolean; used: number; limit: number }> {
    const sub = await this.getOrCreateSubscription(userId);
    const tierLimits = TIER_LIMITS[sub.tier as TierKey];
    const limit = (tierLimits as Record<string, unknown>)[feature];

    if (limit === Infinity || limit === true) {
      return { allowed: true, used: 0, limit: -1 };
    }

    // Count today's usage from the relevant table
    // For pronunciation: count PronunciationAttempt records created today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    let used = 0;
    if (feature === "PRONUNCIATION_ATTEMPT") {
      used = await this.prisma.pronunciationAttempt.count({
        where: {
          userId,
          createdAt: { gte: startOfDay },
        },
      });
    }

    return {
      allowed: used < (limit as number),
      used,
      limit: limit as number,
    };
  }

  /**
   * Check if user's tier allows access to a feature (boolean check).
   */
  async hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
    const sub = await this.getOrCreateSubscription(userId);
    const tierLimits = TIER_LIMITS[sub.tier as TierKey];
    const value = (tierLimits as Record<string, unknown>)[feature];

    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value > 0 || value === Infinity;
    return true;
  }

  /**
   * Get user's effective tier (considering trial status).
   */
  async getEffectiveTier(userId: string): Promise<TierKey> {
    const sub = await this.getOrCreateSubscription(userId);
    return sub.tier as TierKey;
  }

  // ==================== ADMIN ====================

  /**
   * Admin grants subscription to a user.
   */
  async adminGrant(userId: string, tier: string, durationDays: number = 30) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setDate(periodEnd.getDate() + durationDays);

    const sub = await this.prisma.subscription.upsert({
      where: { userId },
      update: {
        tier: tier as "PREMIUM" | "PRO",
        status: "ACTIVE",
        provider: "MANUAL",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
      create: {
        userId,
        tier: tier as "PREMIUM" | "PRO",
        status: "ACTIVE",
        provider: "MANUAL",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });

    await this.notifications.create({
      userId,
      type: "SYSTEM_ANNOUNCEMENT",
      title: `🎉 ${tier} Subscription Activated!`,
      body: `You now have ${tier} access for ${durationDays} days. Enjoy!`,
      icon: tier === "PRO" ? "💎" : "⭐",
      link: "/profile",
    });

    return sub;
  }
}
```

---

## Step 5: Controller

**File:** `backend-core/src/modules/subscriptions/subscriptions.controller.ts` (create new)

```typescript
import { Controller, Get, Post, Body, UseGuards, Request } from "@nestjs/common";
import { SubscriptionsService } from "./subscriptions.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { AdminGrantDto } from "./dto/subscriptions.dto";

@Controller("subscriptions")
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  /**
   * GET /api/v1/subscriptions/plans — Public, list pricing plans
   */
  @Get("plans")
  async getPlans() {
    return this.subscriptionsService.getPlans();
  }

  /**
   * GET /api/v1/subscriptions/me — Get current user's subscription + usage
   */
  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getMySubscription(@Request() req: any) {
    return this.subscriptionsService.getMySubscription(req.user.id);
  }

  /**
   * GET /api/v1/subscriptions/usage — Get current period usage stats
   */
  @Get("usage")
  @UseGuards(JwtAuthGuard)
  async getUsage(@Request() req: any) {
    const sub = await this.subscriptionsService.getOrCreateSubscription(req.user.id);
    return this.subscriptionsService.getCurrentUsage(sub.id);
  }

  /**
   * POST /api/v1/subscriptions/admin/grant — Admin grants subscription
   */
  @Post("admin/grant")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async adminGrant(@Body() dto: AdminGrantDto) {
    const days = dto.durationDays ? parseInt(dto.durationDays) : 30;
    return this.subscriptionsService.adminGrant(dto.userId, dto.tier, days);
  }
}
```

---

## Step 6: Module

**File:** `backend-core/src/modules/subscriptions/subscriptions.module.ts` (create new)

```typescript
import { Module } from "@nestjs/common";
import { SubscriptionsController } from "./subscriptions.controller";
import { SubscriptionsService } from "./subscriptions.service";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [NotificationsModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService], // Other modules will inject for tier/usage checks
})
export class SubscriptionsModule {}
```

---

## Step 7: Register in AppModule

**File:** `backend-core/src/app.module.ts`

Add import (after GamificationModule import, ~line 25):
```typescript
import { SubscriptionsModule } from "./modules/subscriptions/subscriptions.module";
```

Add to imports array (after `GamificationModule`, ~line 64):
```typescript
    GamificationModule,
    SubscriptionsModule,
```

---

## Step 8: Seed Pricing Plans

**File:** `backend-core/prisma/seed-plans.ts` (create new)

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PLANS = [
  {
    tier: "PREMIUM" as const,
    name: "Premium Monthly",
    description: "Full access to all learning modules with AI grading",
    priceAmount: 999,  // $9.99
    currency: "USD",
    interval: "month",
    intervalCount: 1,
    order: 1,
    features: [
      "All Vocabulary & Grammar books",
      "Unlimited pronunciation practice",
      "All IELTS lessons & exercises",
      "IELTS Advanced Practice (Cambridge)",
      "10 AI Writing gradings/month",
      "10 AI Speaking gradings/month",
      "Unlimited Shadowing & Dictation",
      "Custom YouTube import",
      "Unlimited Vocab Lab decks & cards",
      "50 AI-generated cards/month",
      "Community Marketplace access",
      "Full exam history",
      "Premium badge",
    ],
  },
  {
    tier: "PREMIUM" as const,
    name: "Premium Annual",
    description: "Full access — save 33% with annual billing",
    priceAmount: 7999, // $79.99
    currency: "USD",
    interval: "year",
    intervalCount: 1,
    order: 2,
    features: [
      "Everything in Premium Monthly",
      "Save 33% vs monthly billing",
    ],
  },
  {
    tier: "PRO" as const,
    name: "Pro Monthly",
    description: "Unlimited everything with priority AI processing",
    priceAmount: 1999, // $19.99
    currency: "USD",
    interval: "month",
    intervalCount: 1,
    order: 3,
    features: [
      "Everything in Premium",
      "Unlimited AI Writing gradings",
      "Unlimited AI Speaking gradings",
      "Unlimited AI card generation",
      "Priority AI processing queue",
      "Progress reports (PDF export)",
      "Teacher dashboard access",
      "Pro badge",
      "Early access to new features",
    ],
  },
  {
    tier: "PRO" as const,
    name: "Pro Annual",
    description: "Unlimited everything — save 33% with annual billing",
    priceAmount: 15999, // $159.99
    currency: "USD",
    interval: "year",
    intervalCount: 1,
    order: 4,
    features: [
      "Everything in Pro Monthly",
      "Save 33% vs monthly billing",
    ],
  },
];

async function main() {
  console.log("Seeding pricing plans...");

  for (const plan of PLANS) {
    // Use name as the unique identifier for upsert (since no unique field in schema)
    const existing = await prisma.pricingPlan.findFirst({
      where: { name: plan.name },
    });

    if (existing) {
      await prisma.pricingPlan.update({
        where: { id: existing.id },
        data: plan,
      });
      console.log(`  Updated: ${plan.name}`);
    } else {
      await prisma.pricingPlan.create({ data: plan });
      console.log(`  Created: ${plan.name}`);
    }
  }

  console.log(`✅ Seeded ${PLANS.length} pricing plans`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run with: `npx ts-node prisma/seed-plans.ts`

---

## Step 9: Verify

1. Run migration: `npx prisma db push` then `npx prisma generate`
2. Seed plans: `npx ts-node prisma/seed-plans.ts`
3. Restart backend: `npm run backend:dev`
4. Test endpoints:

```bash
# Get pricing plans (public)
curl http://localhost:3000/api/v1/subscriptions/plans
# Expected: Array of 4 plans (Premium Monthly, Premium Annual, Pro Monthly, Pro Annual)

# Get current subscription (requires auth)
curl http://localhost:3000/api/v1/subscriptions/me -H "Authorization: Bearer <TOKEN>"
# Expected: { tier: "FREE", status: "ACTIVE", usage: {...}, limits: {...} }

# Get usage stats
curl http://localhost:3000/api/v1/subscriptions/usage -H "Authorization: Bearer <TOKEN>"
# Expected: { AI_WRITING_GRADING: { used: 0, limit: 0 }, ... }

# Admin grant (requires ADMIN role)
curl -X POST http://localhost:3000/api/v1/subscriptions/admin/grant \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"userId": "<USER_ID>", "tier": "PREMIUM", "durationDays": "30"}'
# Expected: Updated subscription object with tier: "PREMIUM"
```
