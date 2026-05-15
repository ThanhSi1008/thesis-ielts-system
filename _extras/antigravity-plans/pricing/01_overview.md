# Pricing & Subscription — Master Plan

> **Entry point** for implementing freemium subscriptions in the IELTS Master AI platform.
> Each phase is in its own file for independent implementation.
> **Decisions already made** — see section below.

---

## Decisions (Locked)

| Question | Answer |
|----------|--------|
| Currency | **USD** (cents for storage, e.g. 999 = $9.99) |
| Payment provider | **Mock** (thesis demo) — architecture supports swapping to Stripe later |
| Trial | **Manually triggered** by user (button on pricing page), 7 days of Premium |
| Community posting | **All tiers** can post (Free included) |
| Grandfathering | **No** — existing users start on Free |
| Mobile billing | **Later** — web-only for now |
| Billing intervals | **Monthly + Annual** from day one |

---

## Current Architecture Snapshot

| Layer | Technology | Key Files |
|-------|-----------|-----------|
| **Backend** | NestJS + Prisma + PostgreSQL | `backend-core/src/modules/` |
| **Frontend** | Next.js 14 (App Router) | `frontend-web/src/app/` |
| **Auth** | JWT + Passport | `backend-core/src/modules/auth/` |
| **Notifications** | `NotificationsService` | `backend-core/src/modules/notifications/` |
| **Gamification** | `GamificationService` | `backend-core/src/modules/gamification/` |

### Existing Module Pattern
- Backend: `module.ts` → `controller.ts` → `service.ts` → `dto/*.dto.ts`
- Frontend API: `frontend-web/src/services/*.api.ts` using `api` from `@/lib/api`
- Types: `frontend-web/src/types/index.ts`
- State: Zustand stores in `frontend-web/src/stores/`

---

## Feature Summary

### Phase 1 — Backend Foundation
Prisma schema (Subscription, Payment, UsageRecord, PricingPlan), SubscriptionsService, seed data for pricing plans, controller + DTOs.

### Phase 2 — Guards & Feature Gating
SubscriptionGuard, @RequiresTier() decorator, UsageQuotaGuard, wire guards into existing modules.

### Phase 3 — Mock Payment & Trial
MockPaymentProvider, checkout flow, trial activation, cancel/downgrade logic, admin grant.

### Phase 4 — Frontend Pricing & Subscription UI
Pricing page, SubscriptionContext, FeatureLock overlay, UpgradeModal, UsageIndicator, subscription management in profile.

### Phase 5 — Frontend Feature Gating & Polish
Wire FeatureLock into every gated page, subscription badge in community, admin dashboard.

---

## Pricing Tiers

### Tier Prices

| Tier | Monthly | Annual | Annual Savings |
|------|---------|--------|----------------|
| Free | $0 | — | — |
| Premium | $9.99/mo | $79.99/yr | ~33% |
| Pro | $19.99/mo | $159.99/yr | ~33% |

### Feature Gating Matrix

| Feature | Free | Premium | Pro |
|---------|------|---------|-----|
| Vocabulary Books | First 2 books | All | All |
| Grammar Books | Elementary only | All levels | All levels |
| Pronunciation IPA Chart | ✅ Full | ✅ Full | ✅ Full |
| Pronunciation Recording | 5/day | Unlimited | Unlimited |
| IELTS Basic Lessons | First 3/skill | All | All |
| IELTS Basic Exercises | 2/skill | All | All |
| IELTS Advanced Practice | ❌ Locked | ✅ All | ✅ All |
| AI Writing Grading | ❌ Locked | 10/month | Unlimited |
| AI Speaking Grading | ❌ Locked | 10/month | Unlimited |
| Shadowing Lessons | 5 system | All + upload | All + upload |
| Dictation Lessons | 5 system | All + upload | All + upload |
| YouTube Import | ❌ Locked | ✅ | ✅ |
| Vocab Lab Decks | Max 3 | Unlimited | Unlimited |
| Vocab Lab Cards/Deck | Max 50 | Unlimited | Unlimited |
| AI Card Generation | ❌ Locked | 50/month | Unlimited |
| Marketplace Import/Publish | Browse only | Full | Full |
| Community Posts | ✅ Can post | ✅ + Badge | ✅ + Badge |
| Comments & Likes | ✅ | ✅ | ✅ |
| Exam History | Last 3 | Full | Full + export |
| Priority AI Processing | — | — | ✅ |

---

## Prisma Models (New)

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
  MOCK       // Thesis demo
  STRIPE     // Future
  MANUAL     // Admin-granted
}

model Subscription {
  id                 String             @id @default(uuid())
  userId             String             @unique
  tier               SubscriptionTier   @default(FREE)
  status             SubscriptionStatus @default(ACTIVE)
  provider           PaymentProvider?
  providerSubId      String?
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
  providerPayId  String?
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
  priceAmount   Int              // Cents (999 = $9.99)
  currency      String           @default("USD")
  interval      String           // "month", "year"
  intervalCount Int              @default(1)
  features      Json             // Feature list for display
  isActive      Boolean          @default(true)
  order         Int              @default(0)
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  @@map("pricing_plans")
}
```

### User model addition
```prisma
// Add to existing User model relations
subscription Subscription?
```

---

## Usage Quota Limits

| Feature Key | Free | Premium | Pro |
|-------------|------|---------|-----|
| `PRONUNCIATION_ATTEMPT` | 5/day | ∞ | ∞ |
| `AI_WRITING_GRADING` | 0 | 10/month | ∞ |
| `AI_SPEAKING_GRADING` | 0 | 10/month | ∞ |
| `AI_CARD_GEN` | 0 | 50/month | ∞ |

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/subscriptions/me` | JWT | Current subscription + usage |
| `GET` | `/api/v1/subscriptions/plans` | Public | Available pricing plans |
| `POST` | `/api/v1/subscriptions/checkout` | JWT | Create checkout (mock payment) |
| `POST` | `/api/v1/subscriptions/start-trial` | JWT | Start 7-day Premium trial |
| `POST` | `/api/v1/subscriptions/cancel` | JWT | Cancel subscription |
| `GET` | `/api/v1/subscriptions/usage` | JWT | Usage stats for current period |
| `POST` | `/api/v1/subscriptions/admin/grant` | Admin | Admin grant subscription |

---

## Phase Map

```
Phase 1 (Schema + Service) ──▶ Phase 2 (Guards) ──▶ Phase 3 (Payment + Trial)
                                                         │
Phase 4 (Frontend UI) ◀────────────────────────────────────┘
         │
Phase 5 (Feature Gating UI + Polish)
```

| Phase | File | Scope | Dependencies |
|-------|------|-------|-------------|
| **Phase 1** | `02_phase1_backend.md` | Schema, seed, SubscriptionsService, controller | None |
| **Phase 2** | `03_phase2_guards.md` | SubscriptionGuard, @RequiresTier, UsageQuotaGuard, wire to modules | Phase 1 |
| **Phase 3** | `04_phase3_payment_trial.md` | MockPaymentProvider, checkout, trial, cancel, admin grant | Phase 1 + 2 |
| **Phase 4** | `05_phase4_frontend.md` | Pricing page, SubscriptionContext, FeatureLock, UpgradeModal | Phase 1-3 |
| **Phase 5** | `06_phase5_polish.md` | Wire locks to pages, badges, admin dashboard, notifications | Phase 4 |

---

## Files Created/Modified Summary

### Phase 1 — Backend Foundation
| Action | File |
|--------|------|
| **Modified** | `schema.prisma` — add Subscription, Payment, UsageRecord, PricingPlan + enums |
| **Modified** | `schema.prisma` — add `subscription` relation to User model |
| **Created** | `modules/subscriptions/subscriptions.module.ts` |
| **Created** | `modules/subscriptions/subscriptions.service.ts` |
| **Created** | `modules/subscriptions/subscriptions.controller.ts` |
| **Created** | `modules/subscriptions/dto/subscriptions.dto.ts` |
| **Created** | `prisma/seed-plans.ts` — seed pricing plans |
| **Modified** | `app.module.ts` — register SubscriptionsModule |

### Phase 2 — Guards & Feature Gating
| Action | File |
|--------|------|
| **Created** | `modules/subscriptions/guards/subscription.guard.ts` |
| **Created** | `modules/subscriptions/guards/usage-quota.guard.ts` |
| **Created** | `modules/subscriptions/decorators/requires-tier.decorator.ts` |
| **Created** | `modules/subscriptions/decorators/requires-quota.decorator.ts` |
| **Created** | `modules/subscriptions/constants/feature-limits.ts` |
| **Modified** | `modules/ielts/ielts-advanced.service.ts` — tier check |
| **Modified** | `modules/vocab-lab/vocab-lab.service.ts` — deck/card limits |
| **Modified** | `modules/shadowing/shadowing.controller.ts` — upload gate |
| **Modified** | `modules/dictation/dictation.controller.ts` — upload gate |

### Phase 3 — Mock Payment & Trial
| Action | File |
|--------|------|
| **Created** | `modules/subscriptions/providers/payment-provider.interface.ts` |
| **Created** | `modules/subscriptions/providers/mock-payment.provider.ts` |
| **Modified** | `modules/subscriptions/subscriptions.service.ts` — checkout, trial, cancel logic |
| **Modified** | `modules/subscriptions/subscriptions.controller.ts` — checkout, trial, cancel endpoints |

### Phase 4 — Frontend UI
| Action | File |
|--------|------|
| **Modified** | `frontend-web/src/types/index.ts` — subscription types |
| **Created** | `frontend-web/src/services/subscriptions.api.ts` |
| **Created** | `frontend-web/src/contexts/SubscriptionContext.tsx` |
| **Created** | `frontend-web/src/app/pricing/page.tsx` |
| **Created** | `frontend-web/src/app/pricing/components/PricingCard.tsx` |
| **Created** | `frontend-web/src/components/FeatureLock.tsx` |
| **Created** | `frontend-web/src/components/UpgradeModal.tsx` |
| **Created** | `frontend-web/src/components/UsageIndicator.tsx` |
| **Created** | `frontend-web/src/components/SubscriptionBadge.tsx` |
| **Modified** | `frontend-web/src/app/layout.tsx` — wrap with SubscriptionProvider |

### Phase 5 — Polish
| Action | File |
|--------|------|
| **Created** | `frontend-web/src/app/profile/_components/SubscriptionSection.tsx` |
| **Modified** | `frontend-web/src/app/profile/ProfileContent.tsx` — add subscription section |
| **Modified** | `frontend-web/src/app/community/components/PostCard.tsx` — subscription badge |
| **Modified** | `frontend-web/src/components/Navbar.tsx` — tier indicator |
| **Created** | `frontend-web/src/app/admin/subscriptions/page.tsx` |
