# Phase 4 — Renewal Cron, Expiry Notifications & Payment History UI

> **Goal:** Add automated subscription lifecycle management (renewal reminders, auto-downgrade on expiry) and enhance the frontend with payment history display.
> **Dependencies:** Phase 1 + 2 + 3. **Effort:** ~4 hours.

---

## Step 1: Install NestJS Schedule Package

The cron job needs `@nestjs/schedule`:

```bash
cd backend-core
npm install @nestjs/schedule
```

Then register `ScheduleModule` in `app.module.ts`:

**File:** `backend-core/src/app.module.ts`

Add the import at the top:

```typescript
import { ScheduleModule } from "@nestjs/schedule";
```

Add `ScheduleModule.forRoot()` to the `imports` array:

```typescript
@Module({
  imports: [
    ScheduleModule.forRoot(), // <-- Add this
    // ... existing imports ...
  ],
})
```

---

## Step 2: Create Subscription Cron Service

**File:** `backend-core/src/modules/subscriptions/subscriptions.cron.ts` (create new)

This cron job runs daily and handles:
1. **Expiry notifications** — warn users 7, 3, and 1 day before subscription expires
2. **Auto-downgrade** — downgrade expired subscriptions after a 3-day grace period
3. **Trial expiry** — downgrade expired trials immediately

```typescript
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../../common/prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";

// ─── Constants ─────────────────────────────────────────────
const GRACE_PERIOD_DAYS = 3;
const REMINDER_DAYS = [7, 3, 1]; // Days before expiry to send reminders

@Injectable()
export class SubscriptionsCronService {
  private readonly logger = new Logger(SubscriptionsCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * Runs every day at 2:00 AM.
   * Checks for expiring/expired subscriptions and sends notifications.
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleSubscriptionLifecycle() {
    this.logger.log("Running subscription lifecycle cron...");

    await this.sendExpiryReminders();
    await this.downgradeExpiredSubscriptions();
    await this.downgradeExpiredTrials();

    this.logger.log("Subscription lifecycle cron complete.");
  }

  /**
   * Send reminder notifications to users whose subscriptions are about to expire.
   */
  private async sendExpiryReminders() {
    const now = new Date();

    for (const daysBefore of REMINDER_DAYS) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + daysBefore);

      // Find subscriptions expiring on this target date (±12 hours window)
      const windowStart = new Date(targetDate);
      windowStart.setHours(0, 0, 0, 0);
      const windowEnd = new Date(targetDate);
      windowEnd.setHours(23, 59, 59, 999);

      const expiringSubs = await this.prisma.subscription.findMany({
        where: {
          status: "ACTIVE",
          tier: { in: ["PREMIUM", "PRO"] },
          currentPeriodEnd: {
            gte: windowStart,
            lte: windowEnd,
          },
        },
        select: { userId: true, tier: true, currentPeriodEnd: true },
      });

      for (const sub of expiringSubs) {
        const expiryDate = sub.currentPeriodEnd?.toLocaleDateString() ?? "soon";

        await this.notifications.create({
          userId: sub.userId,
          type: "SYSTEM_ANNOUNCEMENT",
          title:
            daysBefore === 1
              ? "⚠️ Subscription Expires Tomorrow!"
              : `📅 Subscription Expires in ${daysBefore} Days`,
          body: `Your ${sub.tier} subscription expires on ${expiryDate}. Renew now to keep your premium features.`,
          icon: daysBefore === 1 ? "⚠️" : "📅",
          link: "/pricing",
        });
      }

      if (expiringSubs.length > 0) {
        this.logger.log(
          `Sent ${daysBefore}-day expiry reminders to ${expiringSubs.length} users`,
        );
      }
    }
  }

  /**
   * Downgrade subscriptions that have expired past the grace period.
   */
  private async downgradeExpiredSubscriptions() {
    const now = new Date();
    const graceDeadline = new Date(now);
    graceDeadline.setDate(graceDeadline.getDate() - GRACE_PERIOD_DAYS);

    // Find ACTIVE subscriptions whose period ended before the grace deadline
    const expiredSubs = await this.prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        tier: { in: ["PREMIUM", "PRO"] },
        currentPeriodEnd: { lt: graceDeadline },
      },
    });

    for (const sub of expiredSubs) {
      await this.prisma.subscription.update({
        where: { id: sub.id },
        data: {
          tier: "FREE",
          status: "EXPIRED",
        },
      });

      await this.notifications.create({
        userId: sub.userId,
        type: "SYSTEM_ANNOUNCEMENT",
        title: "😔 Subscription Expired",
        body: `Your ${sub.tier} subscription has expired. Upgrade again to restore your premium features.`,
        icon: "😔",
        link: "/pricing",
      });
    }

    if (expiredSubs.length > 0) {
      this.logger.log(`Downgraded ${expiredSubs.length} expired subscriptions`);
    }
  }

  /**
   * Downgrade trials that have ended.
   */
  private async downgradeExpiredTrials() {
    const now = new Date();

    const expiredTrials = await this.prisma.subscription.findMany({
      where: {
        status: "TRIALING",
        trialEndsAt: { lt: now },
      },
    });

    for (const sub of expiredTrials) {
      await this.prisma.subscription.update({
        where: { id: sub.id },
        data: {
          tier: "FREE",
          status: "EXPIRED",
          trialEndsAt: null,
        },
      });

      await this.notifications.create({
        userId: sub.userId,
        type: "SYSTEM_ANNOUNCEMENT",
        title: "⏰ Free Trial Ended",
        body: "Your 7-day Premium trial has ended. Upgrade to keep access to all features!",
        icon: "⏰",
        link: "/pricing",
      });
    }

    if (expiredTrials.length > 0) {
      this.logger.log(`Downgraded ${expiredTrials.length} expired trials`);
    }
  }
}
```

---

## Step 3: Register Cron in Module

**File:** `backend-core/src/modules/subscriptions/subscriptions.module.ts`

Add the cron service import and register it:

```typescript
import { SubscriptionsCronService } from "./subscriptions.cron";
```

Add `SubscriptionsCronService` to the `providers` array:

```typescript
providers: [
  SubscriptionsService,
  SubscriptionsCronService, // <-- Add this
  SubscriptionGuard,
  UsageQuotaGuard,
  {
    provide: "PAYMENT_PROVIDER",
    useClass: resolvePaymentProvider(),
  },
],
```

---

## Step 4: Update Frontend — Payment History in Profile

**File:** `frontend-web/src/app/profile/_components/SubscriptionSection.tsx`

This component likely already exists from the pricing implementation. Add a payment history section to it. If the file structure differs, adapt accordingly.

Add the following component at the end of the file or as a separate component:

```tsx
"use client";

import { useEffect, useState } from "react";
import { CreditCard, Calendar, ChevronRight } from "lucide-react";
import { subscriptionsApi } from "@/services/subscriptions.api";

interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  provider: string;
  status: string;
  createdAt: string;
  metadata?: { planName?: string };
}

export function PaymentHistory() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    subscriptionsApi
      .getPayments()
      .then((data) => setPayments(data as PaymentRecord[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl"
          />
        ))}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 dark:text-gray-600">
        <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No payment history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {payments.map((payment) => (
        <div
          key={payment.id}
          className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {payment.metadata?.planName ?? "Subscription Payment"}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                <Calendar className="w-3 h-3" />
                {new Date(payment.createdAt).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
                <span className="text-gray-300 dark:text-gray-700">•</span>
                <span className="uppercase">{payment.provider}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {formatCurrency(payment.amount, payment.currency)}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                payment.status === "succeeded"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : payment.status === "failed"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
              }`}
            >
              {payment.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatCurrency(amount: number, currency: string): string {
  if (currency === "VND") {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }
  // USD — stored in cents
  return `$${(amount / 100).toFixed(2)}`;
}
```

Then import and use `<PaymentHistory />` in the `SubscriptionSection` component, inside a collapsible or tabbed section:

```tsx
{/* Add below the existing subscription info */}
<div className="mt-8">
  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
    Payment History
  </h3>
  <PaymentHistory />
</div>
```

---

## Step 5: Add "Renew" Button to Subscription Section

If the user's subscription is `CANCELED` or close to expiry, show a renewal button in the profile subscription section.

Add this logic to the existing `SubscriptionSection`:

```tsx
{/* Show renew button if subscription is about to expire or canceled */}
{(status === "CANCELED" || isExpiringSoon) && (
  <a
    href="/pricing"
    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-gray-900 font-bold rounded-xl hover:opacity-90 transition-all text-sm"
  >
    Renew Subscription
    <ChevronRight className="w-4 h-4" />
  </a>
)}
```

Where `isExpiringSoon` is computed:

```tsx
const isExpiringSoon = useMemo(() => {
  if (!currentPeriodEnd) return false;
  const daysLeft = Math.ceil(
    (new Date(currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  return daysLeft <= 7 && daysLeft > 0;
}, [currentPeriodEnd]);
```

---

## Step 6: Verify

```bash
# 1. Backend cron test — manually trigger
# In the NestJS app, you can call the cron method directly for testing:
# Add a temporary admin endpoint or use the NestJS REPL

# 2. Verify notifications are created
# Check the notifications table in the database after running the cron

# 3. Frontend payment history
# Navigate to /profile after making a VNPay payment
# Should see the payment in the history list

# 4. Renewal flow
# Cancel a subscription via /profile
# See the "Renew Subscription" button appear
# Click it → goes to /pricing → checkout again
```

---

## Files Created/Modified

| Action | File |
|--------|------|
| **Modified** | `backend-core/src/app.module.ts` — add `ScheduleModule.forRoot()` |
| **Created** | `backend-core/src/modules/subscriptions/subscriptions.cron.ts` — daily lifecycle cron |
| **Modified** | `backend-core/src/modules/subscriptions/subscriptions.module.ts` — register `SubscriptionsCronService` |
| **Modified** | `frontend-web/src/app/profile/_components/SubscriptionSection.tsx` — add `PaymentHistory` component and renewal button |

---

## Important Notes for Implementor

1. **`@nestjs/schedule` installation**: Make sure to run `npm install @nestjs/schedule` in `backend-core/` before implementing. The `ScheduleModule.forRoot()` must be in the root `AppModule`.

2. **Cron timing**: The cron runs at 2 AM server time (`CronExpression.EVERY_DAY_AT_2AM`). For testing, temporarily change it to `CronExpression.EVERY_30_SECONDS` and revert before deploying.

3. **Grace period**: The 3-day grace period means users keep access for 3 extra days after their `currentPeriodEnd` before being downgraded. This is standard SaaS practice and is hardcoded as `GRACE_PERIOD_DAYS`.

4. **Currency formatting**: The `formatCurrency` helper supports both VND (whole numbers) and USD (cents ÷ 100). It uses the `Intl.NumberFormat` API with Vietnamese locale for VND.

5. **Notification flood prevention**: The current implementation sends reminders every day the cron runs within the reminder window. To prevent duplicate notifications, consider adding a `lastReminderSentAt` field to the subscription or checking existing notifications before creating new ones.
