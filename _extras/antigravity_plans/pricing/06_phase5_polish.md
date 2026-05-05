# Phase 5 — Feature Gating UI & Polish

> **Goal:** Wire FeatureLock into gated pages, add subscription badges, profile subscription section, admin dashboard.
> **Dependencies:** Phase 4. **Effort:** ~3-4 hours.

---

## Step 1: Wire FeatureLock Into Gated Pages

Wrap locked sections with `<FeatureLock>` in existing pages. The component renders children blurred with an upgrade overlay for Free users.

### 1.1 — IELTS Advanced Practice

**File:** `frontend-web/src/app/ielts/advanced/page.tsx` (or wherever advanced practice is rendered)

```tsx
import FeatureLock from "@/components/FeatureLock";

// Wrap the entire advanced practice content:
<FeatureLock requiredTier="PREMIUM" featureName="IELTS Advanced Practice">
  {/* Existing advanced practice content */}
</FeatureLock>
```

### 1.2 — Shadowing YouTube Import

In the Shadowing page, wrap the "Import from YouTube" button/section:

```tsx
import FeatureLock from "@/components/FeatureLock";

<FeatureLock requiredTier="PREMIUM" featureName="YouTube Import">
  <ImportFromYouTubeButton />
</FeatureLock>
```

### 1.3 — Dictation YouTube Import

Same pattern as shadowing.

### 1.4 — Vocab Lab — Marketplace Import/Publish

In the Vocab Lab community tab, wrap import/publish buttons:

```tsx
<FeatureLock requiredTier="PREMIUM" featureName="Community Marketplace">
  <PublishDeckButton />
  <ImportDeckButton />
</FeatureLock>
```

### 1.5 — Vocabulary Books (Soft Lock)

For vocabulary books, don't use FeatureLock overlay. Instead, add a lock icon on locked book cards:

```tsx
// In VocabularyBookCard component:
{book.isLocked && (
  <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center cursor-pointer"
    onClick={() => router.push("/pricing")}>
    <Lock className="w-8 h-8 text-white/80" />
  </div>
)}
```

### 1.6 — Grammar Books (Soft Lock)

Same lock icon pattern for grammar books above Elementary level.

---

## Step 2: Handle 403 Subscription Errors Globally

**File:** `frontend-web/src/lib/api.ts` (or wherever axios interceptors are configured)

Add a response interceptor that detects subscription-related 403 errors and triggers the UpgradeModal:

```typescript
import { AxiosError } from "axios";

// Create a global event emitter for upgrade prompts
export const subscriptionEvents = {
  listeners: [] as ((error: any) => void)[],
  on(cb: (error: any) => void) { this.listeners.push(cb); },
  off(cb: (error: any) => void) { this.listeners = this.listeners.filter(l => l !== cb); },
  emit(error: any) { this.listeners.forEach(l => l(error)); },
};

// In axios response error interceptor:
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 403) {
      const data = error.response.data as any;
      if (data?.error === "SUBSCRIPTION_REQUIRED" || data?.error === "QUOTA_EXCEEDED" ||
          data?.error === "DECK_LIMIT_REACHED" || data?.error === "CARD_LIMIT_REACHED" ||
          data?.error === "DAILY_QUOTA_EXCEEDED") {
        subscriptionEvents.emit(data);
      }
    }
    return Promise.reject(error);
  },
);
```

**File:** `frontend-web/src/app/layout.tsx`

Add a global UpgradeModal listener:

```tsx
"use client";
import { useEffect, useState } from "react";
import UpgradeModal from "@/components/UpgradeModal";
import { subscriptionEvents } from "@/lib/api";

function GlobalUpgradeModal() {
  const [modalData, setModalData] = useState<{ title: string; message: string; requiredTier: string } | null>(null);

  useEffect(() => {
    const handler = (error: any) => {
      setModalData({
        title: error.error === "QUOTA_EXCEEDED" ? "Quota Reached" : "Upgrade Required",
        message: error.message,
        requiredTier: error.requiredTier ?? error.currentTier ?? "PREMIUM",
      });
    };
    subscriptionEvents.on(handler);
    return () => subscriptionEvents.off(handler);
  }, []);

  return (
    <UpgradeModal
      isOpen={!!modalData}
      onClose={() => setModalData(null)}
      title={modalData?.title}
      message={modalData?.message}
      requiredTier={modalData?.requiredTier}
    />
  );
}

// Add <GlobalUpgradeModal /> inside the layout, after <Toaster />
```

---

## Step 3: Subscription Section in Profile

**File:** `frontend-web/src/app/profile/_components/SubscriptionSection.tsx` (create new)

Shows current subscription status, tier badge, period dates, and manage/upgrade buttons.

**Props:**
```typescript
interface SubscriptionSectionProps {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
  isTrial: boolean;
}
```

**Layout:**
```
┌────────────────────────────────────────────────┐
│  ⭐ Premium Plan                  TRIALING     │
│  Your trial ends on May 12, 2026               │
│                                                │
│  [Manage Subscription]   [Upgrade to Pro]      │
└────────────────────────────────────────────────┘
```

**Key behavior:**
- Show tier badge using `<SubscriptionBadge />`
- For trialing: show trial end date with countdown
- For active: show next billing date
- For canceled: show "Access until" date
- Buttons: "Manage" → shows cancel option, "Upgrade" → `/pricing`

**Integration:** In `ProfileContent.tsx`, add after the gamification section:

```tsx
import SubscriptionSection from "./_components/SubscriptionSection";
import { useSubscription } from "@/contexts/SubscriptionContext";

const { tier, status, currentPeriodEnd, trialEndsAt, isTrial } = useSubscription();

// In JSX:
<SubscriptionSection
  tier={tier}
  status={status}
  currentPeriodEnd={currentPeriodEnd}
  trialEndsAt={trialEndsAt}
  isTrial={isTrial}
/>
```

---

## Step 4: Subscription Badge in Community Posts

**File:** `frontend-web/src/app/community/components/PostCard.tsx`

Add `<SubscriptionBadge />` next to the author's name:

```tsx
import SubscriptionBadge from "@/components/SubscriptionBadge";

// Next to author name display:
<span className="font-semibold">{post.author.name}</span>
{post.author.subscriptionTier && post.author.subscriptionTier !== "FREE" && (
  <SubscriptionBadge tier={post.author.subscriptionTier} size="sm" />
)}
```

**Backend change needed:** In `PostsService.findAll()`, include the user's subscription tier in the response:

```typescript
// In posts.service.ts, when fetching posts:
include: {
  author: {
    select: {
      id: true, firstName: true, lastName: true, avatar: true,
      subscription: { select: { tier: true } },  // Add this
    },
  },
}
```

---

## Step 5: Tier Indicator in Navbar

**File:** `frontend-web/src/components/Navbar.tsx`

Add a small tier badge next to the user's profile button:

```tsx
import { useSubscription } from "@/contexts/SubscriptionContext";
import SubscriptionBadge from "@/components/SubscriptionBadge";

const { tier } = useSubscription();

// Next to user display name in navbar:
<SubscriptionBadge tier={tier} size="sm" />
```

---

## Step 6: Admin Subscription Dashboard

**File:** `frontend-web/src/app/admin/subscriptions/page.tsx` (create new)

A simple admin page to view and manage subscriptions.

**Features:**
- Table of all users with their subscription tier/status
- "Grant Premium/Pro" button per user (calls `POST /subscriptions/admin/grant`)
- Filter by tier (Free / Premium / Pro)
- Show total revenue from Payment records

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│  📊 Subscription Management                         │
│                                                      │
│  Stats: 45 Free | 12 Premium | 3 Pro | $234 Revenue │
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │ User         │ Tier    │ Status  │ Actions   │    │
│  │ john@a.com   │ FREE    │ ACTIVE  │ [Grant ▼] │    │
│  │ jane@b.com   │ PREMIUM │ ACTIVE  │ [Grant ▼] │    │
│  └──────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

**Backend endpoint needed:** Add to SubscriptionsController:

```typescript
@Get("admin/overview")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
async getAdminOverview() {
  return this.subscriptionsService.getAdminOverview();
}
```

Add to SubscriptionsService:

```typescript
async getAdminOverview() {
  const [freeCount, premiumCount, proCount, totalRevenue, recentSubs] = await Promise.all([
    this.prisma.subscription.count({ where: { tier: "FREE" } }),
    this.prisma.subscription.count({ where: { tier: "PREMIUM" } }),
    this.prisma.subscription.count({ where: { tier: "PRO" } }),
    this.prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "succeeded" } }),
    this.prisma.subscription.findMany({
      take: 50,
      orderBy: { updatedAt: "desc" },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
    }),
  ]);

  return {
    stats: { free: freeCount, premium: premiumCount, pro: proCount, totalRevenue: totalRevenue._sum.amount ?? 0 },
    subscriptions: recentSubs,
  };
}
```

---

## Step 7: Verify End-to-End

1. **New user registers** → tier = FREE, no trial used
2. **Visit `/pricing`** → see 3 tiers, "Start Free Trial" button visible
3. **Click "Start Trial"** → tier becomes PREMIUM, badge appears in navbar
4. **Visit IELTS Advanced** → content loads (was locked before)
5. **Visit Vocab Lab** → can create unlimited decks (was max 3)
6. **Cancel trial** → status = CANCELED, access continues until trial end
7. **Trial expires** → auto-downgrades to FREE, advanced content locked again
8. **Checkout Premium Monthly** → mock payment succeeds, tier = PREMIUM
9. **Community posts** → Premium badge visible next to author name
10. **Admin dashboard** → shows user counts per tier, grant button works

---

## Files Created/Modified

| Action | File |
|--------|------|
| **Modified** | `frontend-web/src/lib/api.ts` — subscription error interceptor |
| **Modified** | `frontend-web/src/app/layout.tsx` — GlobalUpgradeModal |
| **Modified** | `frontend-web/src/app/ielts/advanced/*` — FeatureLock wrapper |
| **Modified** | `frontend-web/src/app/shadowing/*` — FeatureLock on YouTube import |
| **Modified** | `frontend-web/src/app/vocab-lab/*` — FeatureLock on marketplace actions |
| **Created** | `frontend-web/src/app/profile/_components/SubscriptionSection.tsx` |
| **Modified** | `frontend-web/src/app/profile/ProfileContent.tsx` — integrate subscription section |
| **Modified** | `frontend-web/src/app/community/components/PostCard.tsx` — subscription badge |
| **Modified** | `frontend-web/src/components/Navbar.tsx` — tier badge |
| **Created** | `frontend-web/src/app/admin/subscriptions/page.tsx` |
| **Modified** | `backend-core/modules/subscriptions/subscriptions.controller.ts` — admin overview |
| **Modified** | `backend-core/modules/subscriptions/subscriptions.service.ts` — admin overview |
| **Modified** | `backend-core/modules/posts/posts.service.ts` — include subscription tier in posts |
