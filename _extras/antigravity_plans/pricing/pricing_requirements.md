# 💰 Pricing & Monetization — Requirements Document

## IELTS Master AI — Subscription Model

---

## 1. Executive Summary

This document outlines the requirements to add a **Freemium subscription model** to IELTS Master AI. The strategy balances **free access for student engagement** with **premium tiers for advanced AI-powered features**, maximizing both user acquisition and revenue.

---

## 2. Proposed Pricing Tiers

### Tier Matrix

| Feature | 🆓 Free | ⭐ Premium | 💎 Pro |
|:--------|:--------|:-----------|:-------|
| **Price** | $0 | ~$9.99/month | ~$19.99/month |
| **Annual Price** | — | ~$79.99/year (save 33%) | ~$159.99/year (save 33%) |
| **Target Audience** | Casual learners, trial users | Serious IELTS candidates | Power users, tutors |

### 2.1. Foundation Modules

| Feature | 🆓 Free | ⭐ Premium | 💎 Pro |
|:--------|:--------|:-----------|:-------|
| Vocabulary Books | First 2 books only | All books | All books |
| Grammar Books | Elementary only | All levels | All levels |
| Pronunciation IPA Chart | Full access | Full access | Full access |
| Pronunciation AI Recording | 5 attempts/day | Unlimited | Unlimited |

### 2.2. IELTS Modules

| Feature | 🆓 Free | ⭐ Premium | 💎 Pro |
|:--------|:--------|:-----------|:-------|
| IELTS Basic Lessons | First 3 lessons/skill | All lessons | All lessons |
| IELTS Basic Exercises | 2 exercises/skill | All exercises | All exercises |
| IELTS Advanced Practice | ❌ Locked | All Cambridge parts | All Cambridge parts |
| IELTS Writing — AI Grading | ❌ Locked | 10 gradings/month | Unlimited |
| IELTS Speaking — AI Grading | ❌ Locked | 10 gradings/month | Unlimited |
| Exam History & Analytics | Last 3 results only | Full history | Full history + export |

### 2.3. Skills Practice

| Feature | 🆓 Free | ⭐ Premium | 💎 Pro |
|:--------|:--------|:-----------|:-------|
| Shadowing Lessons | 5 system lessons | All + custom upload | All + custom upload |
| Dictation Lessons | 5 system lessons | All + custom upload | All + custom upload |
| Custom YouTube Import | ❌ Locked | ✅ Unlimited | ✅ Unlimited |

### 2.4. Vocab Lab (Flashcards)

| Feature | 🆓 Free | ⭐ Premium | 💎 Pro |
|:--------|:--------|:-----------|:-------|
| Decks | Max 3 decks | Unlimited | Unlimited |
| Cards per Deck | Max 50 cards | Unlimited | Unlimited |
| AI Card Generation | ❌ Locked | 50 cards/month | Unlimited |
| Community Marketplace | Browse only | Browse + Import + Publish | Browse + Import + Publish |
| Custom Card Types | ❌ Locked | ✅ | ✅ |

### 2.5. Community & Gamification

| Feature | 🆓 Free | ⭐ Premium | 💎 Pro |
|:--------|:--------|:-----------|:-------|
| Community Posts | Read only | Full read/write | Full read/write |
| Comments & Likes | ✅ | ✅ | ✅ |
| Gamification (XP, Streak, Achievements) | ✅ | ✅ + Premium badge | ✅ + Pro badge |
| Leaderboard | View only | Full participation | Full participation |
| Profile Customization | Basic | Premium themes | Pro themes + custom banner |

### 2.6. Pro-Exclusive Features

| Feature | 💎 Pro Only |
|:--------|:------------|
| Priority AI Processing | Queue priority for grading jobs |
| Study Plan Generator | AI-generated personalized study plan |
| Progress Reports (PDF Export) | Weekly/monthly analytics export |
| Teacher Dashboard Access | Link students & view their progress |
| Ad-Free Experience | Remove all promotional banners |
| Early Access to New Features | Beta features before general release |

---

## 3. Business Logic Requirements

### 3.1. Trial Period

| Requirement | Detail |
|:------------|:-------|
| Free trial duration | 7 days of Premium features |
| Auto-trigger | On first registration |
| Trial-to-paid conversion | Prompt upgrade modal on day 5 and day 7 |
| Post-trial behavior | Gracefully downgrade to Free tier |
| One trial per account | Enforce via `trialUsedAt` timestamp on User |

### 3.2. Usage Quota Tracking

```
For rate-limited features (AI grading, pronunciation attempts, AI card generation):
- Track usage per billing cycle (calendar month)
- Reset counters on the 1st of each month (or subscription renewal date)
- Show remaining quota in UI (e.g., "3/10 AI gradings used this month")
- Send notification at 80% and 100% usage
- At 100%: show upgrade CTA, block feature with friendly message
```

### 3.3. Grace Period & Downgrade

| Scenario | Behavior |
|:---------|:---------|
| Payment fails | 3-day grace period, then downgrade to Free |
| User cancels | Access continues until end of billing period |
| Downgrade overflow | If user has 10 decks and downgrades to Free (max 3), keep all data but mark excess as read-only |

### 3.4. Upgrade / Downgrade Flow

```
Upgrade:  Immediate access to new tier features
Downgrade: Access retained until end of billing period
Refund:   No partial refunds (standard SaaS practice)
Switch:   Monthly ↔ Annual prorated at switch time
```

---

## 4. Database Schema Additions

> [!IMPORTANT]
> All new models follow existing Prisma conventions: UUID PKs, `@@map()` snake_case tables, `camelCase` fields.

### 4.1. New Enums

```prisma
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
  STRIPE
  MOMO
  VNPAY
  MANUAL   // Admin-granted
}
```

### 4.2. New Models

```prisma
model Subscription {
  id                String             @id @default(uuid())
  userId            String             @unique
  tier              SubscriptionTier   @default(FREE)
  status            SubscriptionStatus @default(ACTIVE)
  provider          PaymentProvider?
  providerSubId     String?            // Stripe subscription ID, etc.
  currentPeriodStart DateTime?
  currentPeriodEnd   DateTime?
  canceledAt        DateTime?
  trialEndsAt       DateTime?
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt

  user              User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  payments          Payment[]
  usageRecords      UsageRecord[]

  @@map("subscriptions")
}

model Payment {
  id              String   @id @default(uuid())
  subscriptionId  String
  amount          Int      // In smallest currency unit (cents / VND)
  currency        String   @default("VND")
  provider        PaymentProvider
  providerPayId   String?  // Stripe payment intent ID, MoMo transaction ID
  status          String   // "succeeded", "failed", "pending", "refunded"
  metadata        Json?
  createdAt       DateTime @default(now())

  subscription    Subscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)

  @@index([subscriptionId])
  @@map("payments")
}

model UsageRecord {
  id              String   @id @default(uuid())
  subscriptionId  String
  feature         String   // "AI_WRITING_GRADING", "AI_SPEAKING_GRADING", "AI_CARD_GEN", "PRONUNCIATION_ATTEMPT"
  count           Int      @default(0)
  periodStart     DateTime
  periodEnd       DateTime
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  subscription    Subscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)

  @@unique([subscriptionId, feature, periodStart])
  @@map("usage_records")
}

model PricingPlan {
  id              String   @id @default(uuid())
  tier            SubscriptionTier
  name            String   // "Premium Monthly", "Pro Annual"
  description     String?
  priceAmount     Int      // Smallest unit
  currency        String   @default("VND")
  interval        String   // "month", "year"
  intervalCount   Int      @default(1)
  features        Json     // Feature list for display
  isActive        Boolean  @default(true)
  order           Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("pricing_plans")
}
```

### 4.3. User Model Update

```diff
model User {
  // ... existing fields ...
+ subscription    Subscription?
}
```

---

## 5. Backend Architecture

### 5.1. New Module: `subscriptions`

```
src/modules/subscriptions/
├── subscriptions.module.ts
├── subscriptions.controller.ts      // REST endpoints
├── subscriptions.service.ts         // Core business logic
├── guards/
│   └── subscription.guard.ts       // @RequiresTier(PREMIUM) decorator
├── decorators/
│   └── requires-tier.decorator.ts  // Custom decorator
└── dto/
    └── subscriptions.dto.ts
```

### 5.2. API Endpoints

| Method | Route | Auth | Description |
|:-------|:------|:-----|:------------|
| `GET` | `/api/v1/subscriptions/me` | JWT | Get current user's subscription status |
| `GET` | `/api/v1/subscriptions/plans` | Public | List available pricing plans |
| `POST` | `/api/v1/subscriptions/checkout` | JWT | Create payment checkout session |
| `POST` | `/api/v1/subscriptions/webhook` | Provider | Payment webhook (Stripe/MoMo) |
| `POST` | `/api/v1/subscriptions/cancel` | JWT | Cancel subscription |
| `GET` | `/api/v1/subscriptions/usage` | JWT | Get current period usage stats |
| `POST` | `/api/v1/subscriptions/admin/grant` | Admin | Admin manually grant subscription |

### 5.3. Subscription Guard (Feature Gating)

```typescript
// Usage in controllers:
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequiresTier(SubscriptionTier.PREMIUM)
@Get('advanced-practice')
getAdvancedPractice() { ... }

// For quota-limited features:
@UseGuards(JwtAuthGuard, UsageQuotaGuard)
@RequiresQuota('AI_WRITING_GRADING', 10) // max 10/month for PREMIUM
@Post('grade-writing')
gradeWriting() { ... }
```

### 5.4. Middleware Integration Points

Existing modules that need gating:

| Module | Gated Feature | Gate Type |
|:-------|:--------------|:----------|
| `ielts` | Advanced practice access | Tier check |
| `ai-client` | Writing/Speaking grading | Tier + quota |
| `pronunciation` | Recording attempts | Quota (Free tier) |
| `vocab-lab` | Deck/card limits, AI generation | Tier + quota |
| `shadowing` | Custom upload | Tier check |
| `dictation` | Custom upload | Tier check |
| `posts` | Create posts | Tier check |

---

## 6. Frontend Requirements

### 6.1. New Pages

| Route | Description |
|:------|:------------|
| `/pricing` | Public pricing page with tier comparison |
| `/profile/subscription` | User subscription management |
| `/admin/subscriptions` | Admin subscription overview |

### 6.2. UI Components

| Component | Purpose |
|:----------|:--------|
| `PricingCard` | Individual tier card with features & CTA |
| `PricingTable` | Comparison table of all tiers |
| `UpgradeModal` | In-app upgrade prompt when hitting limits |
| `UsageIndicator` | Progress bar showing quota usage |
| `SubscriptionBadge` | Premium/Pro badge on user profile & posts |
| `FeatureLock` | Overlay component for locked features |
| `PaymentForm` | Checkout form (embedded or redirect) |

### 6.3. Feature Lock UX Pattern

```
When a Free user tries to access a locked feature:
1. Show the feature in a "preview" state (blurred/greyed out)
2. Display a FeatureLock overlay with:
   - Icon: 🔒
   - Message: "This feature requires Premium"
   - CTA: "Upgrade Now" → navigates to /pricing
   - Secondary: "Start Free Trial" (if trial not used)
3. NEVER show a blank page or error — always show what they're missing
```

### 6.4. Zustand Store Addition

```typescript
// stores/useSubscriptionStore.ts
interface SubscriptionState {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  usage: Record<string, { used: number; limit: number }>;
  trialEndsAt: string | null;
  canAccess: (feature: string) => boolean;
  fetchSubscription: () => Promise<void>;
}
```

---

## 7. Payment Provider Options

> [!TIP]
> For a thesis project in Vietnam, starting with **MoMo** or **VNPay** for local payments + **Stripe** for international is recommended.

### Option A: Stripe (International)

| Pros | Cons |
|:-----|:-----|
| Best developer experience | Not popular in Vietnam |
| Webhooks, subscriptions built-in | Requires business verification |
| Excellent documentation | Higher fees for VND |

### Option B: MoMo (Vietnam)

| Pros | Cons |
|:-----|:-----|
| Most popular e-wallet in VN | Limited API docs |
| QR code payments | Manual subscription management needed |
| Low fees | No built-in recurring billing |

### Option C: VNPay (Vietnam)

| Pros | Cons |
|:-----|:-----|
| Bank transfer + card support | Complex integration |
| Popular with VN users | Poor documentation |
| Supports recurring | Needs business license |

### Recommendation for Thesis

> [!NOTE]
> For a thesis demo, consider implementing a **mock payment provider** that simulates the payment flow without real transactions. The architecture should support swapping in real providers later (DIP principle).

```
PaymentProvider Interface → MockPaymentService (thesis demo)
                          → StripePaymentService (production)
                          → MoMoPaymentService (production)
```

---

## 8. Implementation Roadmap

### Phase 1: Schema & Core Logic (1-2 weeks)
- [ ] Add `Subscription`, `Payment`, `UsageRecord`, `PricingPlan` models
- [ ] Create `subscriptions` module (service, controller, DTOs)
- [ ] Implement `SubscriptionGuard` and `@RequiresTier()` decorator
- [ ] Seed default pricing plans
- [ ] Add subscription relation to User

### Phase 2: Feature Gating (1 week)
- [ ] Add guards to existing IELTS Advanced endpoints
- [ ] Add guards to AI grading endpoints (writing/speaking)
- [ ] Add quota tracking for rate-limited features
- [ ] Add deck/card limits in vocab-lab service
- [ ] Gate custom YouTube import in shadowing/dictation

### Phase 3: Frontend — Pricing Page (1 week)
- [ ] Create `/pricing` page with tier comparison
- [ ] Build `PricingCard` and `PricingTable` components
- [ ] Create `FeatureLock` overlay component
- [ ] Add `UpgradeModal` for in-app prompts
- [ ] Add `UsageIndicator` to relevant pages

### Phase 4: Payment Integration (1-2 weeks)
- [ ] Implement `PaymentProvider` abstraction interface
- [ ] Build mock payment service for thesis demo
- [ ] Create checkout flow (frontend + backend)
- [ ] Implement webhook handler for status updates
- [ ] Add subscription management to user profile

### Phase 5: Polish & Admin (1 week)
- [ ] Admin panel: subscription overview & manual grants
- [ ] Email/notification on trial expiry, payment failure
- [ ] Premium/Pro badges in community posts
- [ ] Usage analytics dashboard for admin
- [ ] Comprehensive testing of upgrade/downgrade flows

---

## 9. Key Design Decisions to Make

> [!WARNING]
> These questions need answers before implementation begins:

1. **Currency**: VND only, or multi-currency (VND + USD)?
2. **Payment provider**: Mock only (thesis), or integrate a real provider?
3. **Trial**: 7-day trial on signup, or triggered manually by user?
4. **Community gating**: Should Free users be able to post, or read-only?
5. **Grandfathering**: Do existing users get any free Premium period?
6. **Mobile**: Will the mobile app share the same subscription, or use App Store/Play Store billing?
7. **Annual pricing**: Include annual plans from day one, or start monthly-only?

---

## 10. Revenue Estimate (for Thesis Report)

| Scenario | Free Users | Premium | Pro | Est. Monthly Revenue |
|:---------|:-----------|:--------|:----|:---------------------|
| Conservative | 1000 | 50 (5%) | 10 (1%) | ~$700 |
| Moderate | 5000 | 400 (8%) | 50 (1%) | ~$5,000 |
| Optimistic | 10000 | 1200 (12%) | 200 (2%) | ~$16,000 |

> [!NOTE]
> These numbers are illustrative for a thesis business analysis section. Actual conversion rates for EdTech freemium apps typically range from 2-8%.

---

*Document generated based on analysis of the current IELTS Master AI codebase — 17 backend modules, 11 frontend routes, 1230-line Prisma schema with gamification, community, and AI grading features.*
