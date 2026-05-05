# Phase 2 — Guards & Feature Gating

> **Goal:** Create SubscriptionGuard, @RequiresTier() decorator, UsageQuotaGuard, wire into existing modules.
> **Dependencies:** Phase 1 completed. **Effort:** ~3-4 hours.

---

## Step 1: @RequiresTier() Decorator

**File:** `backend-core/src/modules/subscriptions/decorators/requires-tier.decorator.ts` (create new)

```typescript
import { SetMetadata } from "@nestjs/common";

export const SUBSCRIPTION_TIER_KEY = "requiredTier";

/**
 * Decorator to mark endpoints that require a minimum subscription tier.
 * Usage: @RequiresTier("PREMIUM") or @RequiresTier("PRO")
 *
 * Tier hierarchy: FREE < PREMIUM < PRO
 */
export const RequiresTier = (tier: "PREMIUM" | "PRO") =>
  SetMetadata(SUBSCRIPTION_TIER_KEY, tier);
```

---

## Step 2: @RequiresQuota() Decorator

**File:** `backend-core/src/modules/subscriptions/decorators/requires-quota.decorator.ts` (create new)

```typescript
import { SetMetadata } from "@nestjs/common";

export const USAGE_QUOTA_KEY = "requiredQuota";

export interface QuotaMetadata {
  feature: string;
}

/**
 * Decorator to mark endpoints that consume a tracked quota feature.
 * Usage: @RequiresQuota("AI_WRITING_GRADING")
 *
 * The guard will:
 * 1. Check if the user's tier allows this feature at all
 * 2. Check if the user has remaining quota
 * 3. Increment usage on success
 */
export const RequiresQuota = (feature: string) =>
  SetMetadata(USAGE_QUOTA_KEY, { feature } as QuotaMetadata);
```

---

## Step 3: SubscriptionGuard

**File:** `backend-core/src/modules/subscriptions/guards/subscription.guard.ts` (create new)

```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { SubscriptionsService } from "../subscriptions.service";
import { SUBSCRIPTION_TIER_KEY } from "../decorators/requires-tier.decorator";

const TIER_HIERARCHY: Record<string, number> = {
  FREE: 0,
  PREMIUM: 1,
  PRO: 2,
};

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredTier = this.reflector.getAllAndOverride<string>(
      SUBSCRIPTION_TIER_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No tier requirement → allow
    if (!requiredTier) return true;

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      throw new ForbiddenException("Authentication required");
    }

    const effectiveTier = await this.subscriptionsService.getEffectiveTier(userId);
    const userTierLevel = TIER_HIERARCHY[effectiveTier] ?? 0;
    const requiredTierLevel = TIER_HIERARCHY[requiredTier] ?? 0;

    if (userTierLevel < requiredTierLevel) {
      throw new ForbiddenException({
        statusCode: 403,
        error: "SUBSCRIPTION_REQUIRED",
        message: `This feature requires a ${requiredTier} subscription`,
        requiredTier,
        currentTier: effectiveTier,
        upgradeUrl: "/pricing",
      });
    }

    return true;
  }
}
```

---

## Step 4: UsageQuotaGuard

**File:** `backend-core/src/modules/subscriptions/guards/usage-quota.guard.ts` (create new)

```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { SubscriptionsService } from "../subscriptions.service";
import { USAGE_QUOTA_KEY, QuotaMetadata } from "../decorators/requires-quota.decorator";
import { QuotaFeature } from "../constants/feature-limits";

@Injectable()
export class UsageQuotaGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const quota = this.reflector.getAllAndOverride<QuotaMetadata>(
      USAGE_QUOTA_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No quota requirement → allow
    if (!quota) return true;

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      throw new ForbiddenException("Authentication required");
    }

    const allowed = await this.subscriptionsService.incrementUsage(
      userId,
      quota.feature as QuotaFeature,
    );

    if (!allowed) {
      const sub = await this.subscriptionsService.getOrCreateSubscription(userId);
      throw new ForbiddenException({
        statusCode: 403,
        error: "QUOTA_EXCEEDED",
        message: `You've reached your ${quota.feature.replace(/_/g, " ").toLowerCase()} limit for this month`,
        feature: quota.feature,
        currentTier: sub.tier,
        upgradeUrl: "/pricing",
      });
    }

    return true;
  }
}
```

---

## Step 5: Export Guards from Module

**File:** Update `backend-core/src/modules/subscriptions/subscriptions.module.ts`

Replace the entire file:

```typescript
import { Module } from "@nestjs/common";
import { SubscriptionsController } from "./subscriptions.controller";
import { SubscriptionsService } from "./subscriptions.service";
import { SubscriptionGuard } from "./guards/subscription.guard";
import { UsageQuotaGuard } from "./guards/usage-quota.guard";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [NotificationsModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, SubscriptionGuard, UsageQuotaGuard],
  exports: [SubscriptionsService, SubscriptionGuard, UsageQuotaGuard],
})
export class SubscriptionsModule {}
```

---

## Step 6: Wire Guards Into Existing Modules

### 6.1 — IELTS Advanced Practice (Tier Gate)

**File:** `backend-core/src/modules/ielts/ielts.module.ts`

Add `SubscriptionsModule` to imports:

```typescript
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";

@Module({
  imports: [NotificationsModule, GamificationModule, SubscriptionsModule],
  // ... rest
})
```

**File:** `backend-core/src/modules/ielts/ielts-advanced.service.ts`

Inject `SubscriptionsService` and add tier check before returning advanced practice data:

```typescript
import { SubscriptionsService } from "../subscriptions/subscriptions.service";

// In constructor:
constructor(
  private readonly prisma: PrismaService,
  private readonly subscriptionsService: SubscriptionsService,
  // ... existing deps
) {}

// At the start of methods that return advanced content
// (e.g., getListeningParts, getReadingParts):
async getListeningParts(userId: string) {
  // Tier check
  const hasAccess = await this.subscriptionsService.hasFeatureAccess(userId, "IELTS_ADVANCED_ACCESS");
  if (!hasAccess) {
    throw new ForbiddenException({
      statusCode: 403,
      error: "SUBSCRIPTION_REQUIRED",
      message: "IELTS Advanced Practice requires a Premium subscription",
      requiredTier: "PREMIUM",
      upgradeUrl: "/pricing",
    });
  }

  // ... existing logic
}
```

**Alternative approach using guard decorator on controller:**

```typescript
// In ielts controller, for advanced endpoints:
import { SubscriptionGuard } from "../subscriptions/guards/subscription.guard";
import { RequiresTier } from "../subscriptions/decorators/requires-tier.decorator";

@Get("advanced/listening")
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequiresTier("PREMIUM")
async getAdvancedListening(@Request() req: any) {
  return this.ieltsAdvancedService.getListeningParts();
}
```

**Choose one approach per endpoint.** Guard decorator is preferred for full-page blocks; service-level check is preferred for partial data filtering.

---

### 6.2 — Vocab Lab (Deck/Card Limits)

**File:** `backend-core/src/modules/vocab-lab/vocab-lab.module.ts`

Add `SubscriptionsModule` to imports:

```typescript
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";

@Module({
  imports: [GamificationModule, SubscriptionsModule],
  // ... rest
})
```

**File:** `backend-core/src/modules/vocab-lab/vocab-lab.service.ts`

Inject `SubscriptionsService` and add limit checks:

```typescript
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { TIER_LIMITS, TierKey } from "../subscriptions/constants/feature-limits";

// In constructor:
constructor(
  private readonly prisma: PrismaService,
  private readonly subscriptionsService: SubscriptionsService,
  // ... existing deps
) {}

// In createDeck() method — before creating:
async createDeck(userId: string, name: string) {
  const tier = await this.subscriptionsService.getEffectiveTier(userId);
  const maxDecks = TIER_LIMITS[tier].MAX_DECKS;

  if (maxDecks !== Infinity) {
    const deckCount = await this.prisma.deck.count({ where: { userId } });
    if (deckCount >= maxDecks) {
      throw new ForbiddenException({
        statusCode: 403,
        error: "DECK_LIMIT_REACHED",
        message: `Free plan allows max ${maxDecks} decks. Upgrade to create more.`,
        currentTier: tier,
        upgradeUrl: "/pricing",
      });
    }
  }

  // ... existing create logic
}

// In createFlashcard() method — before creating:
async createFlashcard(userId: string, deckId: string, data: any) {
  const tier = await this.subscriptionsService.getEffectiveTier(userId);
  const maxCards = TIER_LIMITS[tier].MAX_CARDS_PER_DECK;

  if (maxCards !== Infinity) {
    const cardCount = await this.prisma.flashcard.count({ where: { deckId } });
    if (cardCount >= maxCards) {
      throw new ForbiddenException({
        statusCode: 403,
        error: "CARD_LIMIT_REACHED",
        message: `Free plan allows max ${maxCards} cards per deck. Upgrade for unlimited.`,
        currentTier: tier,
        upgradeUrl: "/pricing",
      });
    }
  }

  // ... existing create logic
}
```

---

### 6.3 — Shadowing & Dictation (Content Limits + Upload Gate)

**File:** `backend-core/src/modules/shadowing/shadowing.module.ts`

Add `SubscriptionsModule` to imports.

**File:** `backend-core/src/modules/shadowing/shadowing.service.ts`

```typescript
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { TIER_LIMITS, TierKey } from "../subscriptions/constants/feature-limits";

// In constructor: inject SubscriptionsService

// In method that lists lessons — filter by limit for Free tier:
async getLessons(userId: string) {
  const tier = await this.subscriptionsService.getEffectiveTier(userId);
  const limit = TIER_LIMITS[tier].SHADOWING_SYSTEM_LESSONS;

  let lessons = await this.prisma.shadowingVideo.findMany({
    where: { userId: null }, // System lessons only
    orderBy: { createdAt: "asc" },
  });

  // For Free users, only show first N system lessons
  if (limit !== Infinity) {
    // Return all but mark excess as locked
    lessons = lessons.map((lesson, index) => ({
      ...lesson,
      isLocked: index >= (limit as number),
    }));
  }

  return lessons;
}

// In YouTube import method — block Free users:
async importFromYouTube(userId: string, data: any) {
  const hasAccess = await this.subscriptionsService.hasFeatureAccess(userId, "YOUTUBE_IMPORT");
  if (!hasAccess) {
    throw new ForbiddenException({
      statusCode: 403,
      error: "SUBSCRIPTION_REQUIRED",
      message: "YouTube import requires a Premium subscription",
      requiredTier: "PREMIUM",
      upgradeUrl: "/pricing",
    });
  }

  // ... existing import logic
}
```

Apply the **same pattern** to `DictationModule` / `DictationService` using `DICTATION_SYSTEM_LESSONS` and `YOUTUBE_IMPORT`.

---

### 6.4 — AI Grading (Quota Gate)

For AI grading endpoints (writing/speaking), use the `@RequiresQuota()` decorator on the controller:

**File:** Relevant IELTS or AI-client controller endpoints

```typescript
import { UsageQuotaGuard } from "../subscriptions/guards/usage-quota.guard";
import { RequiresQuota } from "../subscriptions/decorators/requires-quota.decorator";
import { SubscriptionGuard } from "../subscriptions/guards/subscription.guard";
import { RequiresTier } from "../subscriptions/decorators/requires-tier.decorator";

// Writing grading endpoint:
@Post("writing/grade")
@UseGuards(JwtAuthGuard, SubscriptionGuard, UsageQuotaGuard)
@RequiresTier("PREMIUM")
@RequiresQuota("AI_WRITING_GRADING")
async gradeWriting(@Request() req: any, @Body() dto: any) {
  // ... existing logic
}

// Speaking grading endpoint:
@Post("speaking/grade")
@UseGuards(JwtAuthGuard, SubscriptionGuard, UsageQuotaGuard)
@RequiresTier("PREMIUM")
@RequiresQuota("AI_SPEAKING_GRADING")
async gradeSpeaking(@Request() req: any, @Body() dto: any) {
  // ... existing logic
}
```

**Module change:** Add `SubscriptionsModule` to `AiClientModule` imports.

---

### 6.5 — Pronunciation (Daily Quota)

**File:** `backend-core/src/modules/pronunciation/pronunciation.module.ts`

Add `SubscriptionsModule` to imports.

**File:** `backend-core/src/modules/pronunciation/pronunciation.service.ts`

```typescript
import { SubscriptionsService } from "../subscriptions/subscriptions.service";

// In constructor: inject SubscriptionsService

// Before creating a pronunciation attempt:
async createAttempt(userId: string, data: any) {
  const dailyUsage = await this.subscriptionsService.checkDailyUsage(userId, "PRONUNCIATION_ATTEMPT");
  if (!dailyUsage.allowed) {
    throw new ForbiddenException({
      statusCode: 403,
      error: "DAILY_QUOTA_EXCEEDED",
      message: `You've used ${dailyUsage.used}/${dailyUsage.limit} pronunciation attempts today. Upgrade for unlimited.`,
      used: dailyUsage.used,
      limit: dailyUsage.limit,
      upgradeUrl: "/pricing",
    });
  }

  // ... existing create logic
}
```

---

### 6.6 — Vocabulary & Grammar (Content Limits)

These are soft-gated: service-level filtering, not hard blocks.

**Vocabulary Service:**

```typescript
// In method that lists books — Free users see only first 2:
async getBooks(userId: string) {
  const tier = await this.subscriptionsService.getEffectiveTier(userId);
  const maxBooks = TIER_LIMITS[tier].VOCABULARY_BOOKS;

  const books = await this.prisma.vocabularyBook.findMany({
    orderBy: { order: "asc" },
  });

  if (maxBooks !== Infinity) {
    return books.map((book, index) => ({
      ...book,
      isLocked: index >= (maxBooks as number),
    }));
  }

  return books;
}
```

**Grammar Service:**

```typescript
// In method that lists books — Free users see only Elementary:
async getBooks(userId: string) {
  const tier = await this.subscriptionsService.getEffectiveTier(userId);
  const allowedLevels = TIER_LIMITS[tier].GRAMMAR_LEVELS;

  const books = await this.prisma.grammarBook.findMany({
    orderBy: { id: "asc" },
  });

  return books.map((book) => ({
    ...book,
    isLocked: !(allowedLevels as readonly string[]).includes(book.level),
  }));
}
```

---

## Step 7: Module Import Summary

After wiring, these modules need `SubscriptionsModule` in their imports:

| Module | Import Added |
|--------|-------------|
| `IeltsModule` | `SubscriptionsModule` |
| `VocabLabModule` | `SubscriptionsModule` |
| `ShadowingModule` | `SubscriptionsModule` |
| `DictationModule` | `SubscriptionsModule` |
| `AiClientModule` | `SubscriptionsModule` |
| `PronunciationModule` | `SubscriptionsModule` |
| `VocabularyModule` | `SubscriptionsModule` |
| `GrammarModule` | `SubscriptionsModule` |

---

## Step 8: Verify

After wiring all guards:

1. **Without auth:** `GET /subscriptions/plans` returns 4 plans
2. **Free user → advanced:** `GET /ielts/advanced/listening` returns 403 with `SUBSCRIPTION_REQUIRED`
3. **Admin grants Premium:** `POST /subscriptions/admin/grant` → user gets PREMIUM
4. **Premium user → advanced:** `GET /ielts/advanced/listening` returns data
5. **Free user → create 4th deck:** returns 403 with `DECK_LIMIT_REACHED`
6. **Error shape:** All 403s include `{ error, message, currentTier, upgradeUrl }` for frontend handling
