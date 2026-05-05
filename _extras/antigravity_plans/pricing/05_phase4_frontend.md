# Phase 4 — Frontend Pricing & Subscription UI

> **Goal:** Pricing page, SubscriptionContext, FeatureLock overlay, UpgradeModal, API service.
> **Dependencies:** Phase 1-3. **Effort:** ~4-5 hours.

---

## Step 1: TypeScript Types

**File:** `frontend-web/src/types/index.ts` — append at end:

```typescript
// ==================== SUBSCRIPTION ====================

export type SubscriptionTier = "FREE" | "PREMIUM" | "PRO";
export type SubscriptionStatus = "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELED" | "EXPIRED";

export interface PricingPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  description: string | null;
  priceAmount: number;  // cents
  currency: string;
  interval: "month" | "year";
  intervalCount: number;
  features: string[];
  isActive: boolean;
  order: number;
}

export interface UserSubscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  canceledAt: string | null;
  trialEndsAt: string | null;
  trialUsed: boolean;
  usage: Record<string, { used: number; limit: number }>;
  limits: Record<string, unknown>;
}

export interface SubscriptionError {
  statusCode: 403;
  error: "SUBSCRIPTION_REQUIRED" | "QUOTA_EXCEEDED" | "DECK_LIMIT_REACHED" | "CARD_LIMIT_REACHED" | "DAILY_QUOTA_EXCEEDED";
  message: string;
  requiredTier?: SubscriptionTier;
  currentTier?: SubscriptionTier;
  upgradeUrl?: string;
}
```

---

## Step 2: API Client

**File:** `frontend-web/src/services/subscriptions.api.ts` (create new)

```typescript
import api from '@/lib/api';
import type { PricingPlan, UserSubscription } from '@/types';

export const subscriptionsApi = {
  getPlans: async () => {
    const { data } = await api.get<PricingPlan[]>('/subscriptions/plans');
    return data;
  },

  getMySubscription: async () => {
    const { data } = await api.get<UserSubscription>('/subscriptions/me');
    return data;
  },

  getUsage: async () => {
    const { data } = await api.get<Record<string, { used: number; limit: number }>>('/subscriptions/usage');
    return data;
  },

  checkout: async (planId: string) => {
    const { data } = await api.post('/subscriptions/checkout', { planId });
    return data;
  },

  startTrial: async () => {
    const { data } = await api.post('/subscriptions/start-trial');
    return data;
  },

  cancel: async (reason?: string) => {
    const { data } = await api.post('/subscriptions/cancel', { reason });
    return data;
  },

  getPayments: async () => {
    const { data } = await api.get('/subscriptions/payments');
    return data;
  },
};
```

---

## Step 3: SubscriptionContext

**File:** `frontend-web/src/contexts/SubscriptionContext.tsx` (create new)

Provides subscription state to the entire app. Fetches on auth change.

```typescript
"use client";
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { subscriptionsApi } from "@/services/subscriptions.api";
import { useAuth } from "@/contexts/AuthContext";
import type { SubscriptionTier, SubscriptionStatus } from "@/types";

interface SubscriptionState {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  trialUsed: boolean;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  usage: Record<string, { used: number; limit: number }>;
  loading: boolean;
  isPremiumOrAbove: boolean;
  isPro: boolean;
  isTrial: boolean;
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionState>({
  tier: "FREE",
  status: "ACTIVE",
  trialUsed: false,
  trialEndsAt: null,
  currentPeriodEnd: null,
  usage: {},
  loading: true,
  isPremiumOrAbove: false,
  isPro: false,
  isTrial: false,
  refresh: async () => {},
});

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tier, setTier] = useState<SubscriptionTier>("FREE");
  const [status, setStatus] = useState<SubscriptionStatus>("ACTIVE");
  const [trialUsed, setTrialUsed] = useState(false);
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);
  const [usage, setUsage] = useState<Record<string, { used: number; limit: number }>>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setTier("FREE");
      setLoading(false);
      return;
    }
    try {
      const sub = await subscriptionsApi.getMySubscription();
      setTier(sub.tier);
      setStatus(sub.status);
      setTrialUsed(sub.trialUsed);
      setTrialEndsAt(sub.trialEndsAt);
      setCurrentPeriodEnd(sub.currentPeriodEnd);
      setUsage(sub.usage);
    } catch {
      setTier("FREE");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const isPremiumOrAbove = tier === "PREMIUM" || tier === "PRO";
  const isPro = tier === "PRO";
  const isTrial = status === "TRIALING";

  return (
    <SubscriptionContext.Provider value={{
      tier, status, trialUsed, trialEndsAt, currentPeriodEnd,
      usage, loading, isPremiumOrAbove, isPro, isTrial, refresh,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext);
```

**Wire into layout:** In `frontend-web/src/app/layout.tsx`, wrap children with `<SubscriptionProvider>` inside `<AuthProvider>`.

```tsx
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";

// Inside RootLayout, wrap after AuthProvider:
<AuthProvider>
  <SubscriptionProvider>
    {/* ... existing providers and children ... */}
  </SubscriptionProvider>
</AuthProvider>
```

---

## Step 4: FeatureLock Component

**File:** `frontend-web/src/components/FeatureLock.tsx` (create new)

Overlay shown on locked features. Renders children blurred with an upgrade CTA on top.

```typescript
"use client";
import { Lock, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSubscription } from "@/contexts/SubscriptionContext";
import type { SubscriptionTier } from "@/types";

interface FeatureLockProps {
  requiredTier: SubscriptionTier;
  featureName: string;
  children: React.ReactNode;
}

export default function FeatureLock({ requiredTier, featureName, children }: FeatureLockProps) {
  const { tier, trialUsed } = useSubscription();
  const router = useRouter();

  const TIER_LEVEL: Record<string, number> = { FREE: 0, PREMIUM: 1, PRO: 2 };
  const hasAccess = TIER_LEVEL[tier] >= TIER_LEVEL[requiredTier];

  if (hasAccess) return <>{children}</>;

  return (
    <div className="relative">
      {/* Blurred preview */}
      <div className="blur-sm pointer-events-none select-none opacity-60">
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-black/20 backdrop-blur-[2px] rounded-2xl">
        <div className="text-center p-8 max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {featureName}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            This feature requires a {requiredTier} subscription
          </p>
          <button
            onClick={() => router.push("/pricing")}
            className="inline-flex items-center gap-2 bg-primary hover:bg-yellow-400 text-gray-900 font-semibold py-3 px-6 rounded-full transition-all shadow-md hover:shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            Upgrade Now
          </button>
          {!trialUsed && (
            <p className="mt-3 text-xs text-gray-400">
              Or <button onClick={() => router.push("/pricing")} className="text-primary underline">start a free trial</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Step 5: UpgradeModal Component

**File:** `frontend-web/src/components/UpgradeModal.tsx` (create new)

Modal triggered when a user hits a limit (403 from API). Reusable across the app.

```typescript
"use client";
import { X, Sparkles, Crown } from "lucide-react";
import { useRouter } from "next/navigation";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  requiredTier?: string;
}

export default function UpgradeModal({ isOpen, onClose, title, message, requiredTier = "PREMIUM" }: UpgradeModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-100 dark:border-gray-800" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-primary/20 to-amber-200/30 flex items-center justify-center">
            <Crown className="w-10 h-10 text-primary" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {title ?? "Upgrade Required"}
          </h2>

          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {message ?? `This feature requires a ${requiredTier} subscription. Upgrade to unlock all features!`}
          </p>

          <button
            onClick={() => { onClose(); router.push("/pricing"); }}
            className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-yellow-400 text-gray-900 font-bold py-3.5 px-6 rounded-full transition-all shadow-md hover:shadow-lg mb-3"
          >
            <Sparkles className="w-5 h-5" />
            View Plans
          </button>

          <button onClick={onClose} className="w-full text-sm text-gray-400 hover:text-gray-600 py-2">
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Step 6: UsageIndicator Component

**File:** `frontend-web/src/components/UsageIndicator.tsx` (create new)

Small progress bar showing quota usage (e.g., "3/10 AI gradings used").

```typescript
"use client";
interface UsageIndicatorProps {
  label: string;
  used: number;
  limit: number; // -1 = unlimited
}

export default function UsageIndicator({ label, used, limit }: UsageIndicatorProps) {
  if (limit === -1) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span>{label}:</span>
        <span className="text-green-500 font-medium">Unlimited</span>
      </div>
    );
  }

  const percent = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const isNearLimit = percent >= 80;
  const isAtLimit = percent >= 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500 dark:text-gray-400">{label}</span>
        <span className={`font-medium ${isAtLimit ? "text-red-500" : isNearLimit ? "text-amber-500" : "text-gray-600 dark:text-gray-300"}`}>
          {used}/{limit}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isAtLimit ? "bg-red-500" : isNearLimit ? "bg-amber-400" : "bg-primary"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
```

---

## Step 7: SubscriptionBadge Component

**File:** `frontend-web/src/components/SubscriptionBadge.tsx` (create new)

```typescript
import { Crown, Gem } from "lucide-react";
import type { SubscriptionTier } from "@/types";

interface SubscriptionBadgeProps {
  tier: SubscriptionTier;
  size?: "sm" | "md";
}

export default function SubscriptionBadge({ tier, size = "sm" }: SubscriptionBadgeProps) {
  if (tier === "FREE") return null;

  const config = tier === "PRO"
    ? { icon: Gem, label: "PRO", bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-600 dark:text-violet-400" }
    : { icon: Crown, label: "PREMIUM", bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-400" };

  const Icon = config.icon;
  const sizeClass = size === "sm" ? "text-[10px] px-1.5 py-0.5 gap-0.5" : "text-xs px-2 py-1 gap-1";

  return (
    <span className={`inline-flex items-center font-bold rounded-full ${config.bg} ${config.text} ${sizeClass}`}>
      <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      {config.label}
    </span>
  );
}
```

---

## Step 8: Pricing Page

**File:** `frontend-web/src/app/pricing/page.tsx` (create new)

Build a pricing page with tier comparison cards. This is a **public page** (no auth required to view).

**Key structure:**
- Toggle for Monthly / Annual billing
- 3 PricingCard components (Free, Premium, Pro)
- Each card lists features from PricingPlan.features JSON
- CTA buttons: "Current Plan" (disabled) | "Start Free Trial" | "Upgrade Now"
- Fetch plans from `GET /subscriptions/plans` on mount
- Use `useSubscription()` to highlight current tier

**Props for PricingCard child component:**

```typescript
// frontend-web/src/app/pricing/components/PricingCard.tsx
interface PricingCardProps {
  tier: string;
  name: string;
  price: string;        // Formatted: "$9.99"
  interval: string;     // "/month" or "/year"
  features: string[];
  isCurrentPlan: boolean;
  isPopular?: boolean;  // Premium gets "Most Popular" badge
  onSelect: () => void;
  ctaLabel: string;     // "Current Plan" | "Start Trial" | "Upgrade"
  disabled?: boolean;
}
```

**Styling guidelines:**
- Container: `min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-16`
- Cards: `bg-white dark:bg-gray-900 border rounded-2xl p-8 shadow-sm`
- Popular card: `ring-2 ring-primary shadow-lg scale-105` with "Most Popular" badge
- Feature checkmarks: `text-green-500` for included, `text-gray-300` for excluded
- CTA: Primary button style matching existing app design

---

## Step 9: Verify

1. **Pricing page** → Visit `/pricing` → see 3 tier cards with monthly/annual toggle
2. **Free user** → "Start Free Trial" button visible, "Upgrade" on paid tiers
3. **Click "Start Trial"** → calls API → subscription context refreshes → badge appears
4. **Feature lock** → Wrap a section with `<FeatureLock requiredTier="PREMIUM">` → shows blurred overlay for Free users
5. **Upgrade modal** → Triggers on 403 API response → shows modal with "View Plans" CTA
6. **Usage indicator** → Shows quota progress bars on relevant pages

---

## Files Created/Modified

| Action | File |
|--------|------|
| **Modified** | `frontend-web/src/types/index.ts` — subscription types |
| **Created** | `frontend-web/src/services/subscriptions.api.ts` |
| **Created** | `frontend-web/src/contexts/SubscriptionContext.tsx` |
| **Modified** | `frontend-web/src/app/layout.tsx` — SubscriptionProvider |
| **Created** | `frontend-web/src/components/FeatureLock.tsx` |
| **Created** | `frontend-web/src/components/UpgradeModal.tsx` |
| **Created** | `frontend-web/src/components/UsageIndicator.tsx` |
| **Created** | `frontend-web/src/components/SubscriptionBadge.tsx` |
| **Created** | `frontend-web/src/app/pricing/page.tsx` |
| **Created** | `frontend-web/src/app/pricing/components/PricingCard.tsx` |
