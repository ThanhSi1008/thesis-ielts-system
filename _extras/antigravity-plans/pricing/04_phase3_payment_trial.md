# Phase 3 — Mock Payment & Trial

> **Goal:** Implement PaymentProvider abstraction, MockPaymentProvider, checkout flow, trial activation, cancel/downgrade logic.
> **Dependencies:** Phase 1 + 2. **Effort:** ~3-4 hours.

---

## Step 1: PaymentProvider Interface

**File:** `backend-core/src/modules/subscriptions/providers/payment-provider.interface.ts` (create new)

This abstraction allows swapping MockPayment → Stripe later without changing service code (DIP).

```typescript
/**
 * Abstraction for payment processing.
 * Implementations: MockPaymentProvider (thesis), StripePaymentProvider (production)
 */
export interface PaymentProviderInterface {
  /**
   * Create a checkout session for a subscription plan.
   * Returns a checkout result with session ID and (optional) redirect URL.
   */
  createCheckout(params: {
    userId: string;
    planId: string;
    planName: string;
    amount: number;   // cents
    currency: string;
    interval: string; // "month" | "year"
  }): Promise<CheckoutResult>;

  /**
   * Verify a payment was successful (called after mock confirmation or webhook).
   */
  verifyPayment(sessionId: string): Promise<PaymentVerification>;

  /**
   * Cancel an active subscription.
   */
  cancelSubscription(providerSubId: string): Promise<{ success: boolean }>;
}

export interface CheckoutResult {
  sessionId: string;        // Unique checkout session identifier
  providerSubId: string;    // Provider's subscription ID
  redirectUrl?: string;     // URL to redirect user to (Stripe checkout page, etc.)
  status: "pending" | "completed"; // Mock can return "completed" immediately
}

export interface PaymentVerification {
  success: boolean;
  providerPayId: string;    // Transaction/payment ID
  amount: number;
  currency: string;
}
```

---

## Step 2: MockPaymentProvider

**File:** `backend-core/src/modules/subscriptions/providers/mock-payment.provider.ts` (create new)

This simulates payment processing for the thesis demo. All payments auto-succeed after a 1-second delay.

```typescript
import { Injectable, Logger } from "@nestjs/common";
import {
  PaymentProviderInterface,
  CheckoutResult,
  PaymentVerification,
} from "./payment-provider.interface";
import { v4 as uuidv4 } from "uuid";

/**
 * Mock payment provider for thesis demo.
 * Simulates payment flow — all transactions auto-succeed.
 * No real money is processed.
 */
@Injectable()
export class MockPaymentProvider implements PaymentProviderInterface {
  private readonly logger = new Logger(MockPaymentProvider.name);

  // In-memory store of pending checkouts (would be Redis/DB in production)
  private pendingSessions = new Map<string, {
    userId: string;
    amount: number;
    currency: string;
    planName: string;
  }>();

  async createCheckout(params: {
    userId: string;
    planId: string;
    planName: string;
    amount: number;
    currency: string;
    interval: string;
  }): Promise<CheckoutResult> {
    const sessionId = `mock_session_${uuidv4()}`;
    const providerSubId = `mock_sub_${uuidv4()}`;

    this.pendingSessions.set(sessionId, {
      userId: params.userId,
      amount: params.amount,
      currency: params.currency,
      planName: params.planName,
    });

    this.logger.log(
      `[MOCK] Checkout created: ${sessionId} for ${params.planName} ($${(params.amount / 100).toFixed(2)}/${params.interval})`,
    );

    // Mock auto-completes immediately (no redirect needed)
    return {
      sessionId,
      providerSubId,
      status: "completed",
    };
  }

  async verifyPayment(sessionId: string): Promise<PaymentVerification> {
    const session = this.pendingSessions.get(sessionId);

    if (!session) {
      return {
        success: false,
        providerPayId: "",
        amount: 0,
        currency: "USD",
      };
    }

    const providerPayId = `mock_pay_${uuidv4()}`;

    this.logger.log(
      `[MOCK] Payment verified: ${providerPayId} for $${(session.amount / 100).toFixed(2)}`,
    );

    // Clean up
    this.pendingSessions.delete(sessionId);

    return {
      success: true,
      providerPayId,
      amount: session.amount,
      currency: session.currency,
    };
  }

  async cancelSubscription(providerSubId: string): Promise<{ success: boolean }> {
    this.logger.log(`[MOCK] Subscription canceled: ${providerSubId}`);
    return { success: true };
  }
}
```

---

## Step 3: Register Provider in Module

**File:** Update `backend-core/src/modules/subscriptions/subscriptions.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { SubscriptionsController } from "./subscriptions.controller";
import { SubscriptionsService } from "./subscriptions.service";
import { SubscriptionGuard } from "./guards/subscription.guard";
import { UsageQuotaGuard } from "./guards/usage-quota.guard";
import { MockPaymentProvider } from "./providers/mock-payment.provider";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [NotificationsModule],
  controllers: [SubscriptionsController],
  providers: [
    SubscriptionsService,
    SubscriptionGuard,
    UsageQuotaGuard,
    // Payment provider — swap MockPaymentProvider with StripePaymentProvider in production
    {
      provide: "PAYMENT_PROVIDER",
      useClass: MockPaymentProvider,
    },
  ],
  exports: [SubscriptionsService, SubscriptionGuard, UsageQuotaGuard],
})
export class SubscriptionsModule {}
```

---

## Step 4: Add Checkout, Trial, Cancel to Service

**File:** Update `backend-core/src/modules/subscriptions/subscriptions.service.ts`

Add these methods to the existing `SubscriptionsService` class (append after the existing methods):

```typescript
import { Inject } from "@nestjs/common";
import { PaymentProviderInterface } from "./providers/payment-provider.interface";

// Update constructor to inject payment provider:
constructor(
  private readonly prisma: PrismaService,
  private readonly notifications: NotificationsService,
  @Inject("PAYMENT_PROVIDER")
  private readonly paymentProvider: PaymentProviderInterface,
) {}

// ==================== CHECKOUT ====================

/**
 * Create a checkout session for a pricing plan.
 * In mock mode, this auto-completes the payment.
 */
async checkout(userId: string, planId: string) {
  const plan = await this.prisma.pricingPlan.findUnique({
    where: { id: planId },
  });

  if (!plan) throw new NotFoundException("Plan not found");
  if (!plan.isActive) throw new BadRequestException("This plan is no longer available");

  // Create checkout via provider
  const checkout = await this.paymentProvider.createCheckout({
    userId,
    planId: plan.id,
    planName: plan.name,
    amount: plan.priceAmount,
    currency: plan.currency,
    interval: plan.interval,
  });

  // For mock provider, payment auto-completes
  if (checkout.status === "completed") {
    return this.activateSubscription(userId, plan, checkout.providerSubId, checkout.sessionId);
  }

  // For real providers (Stripe), return redirect URL
  return {
    sessionId: checkout.sessionId,
    redirectUrl: checkout.redirectUrl,
  };
}

/**
 * Activate a subscription after successful payment.
 */
private async activateSubscription(
  userId: string,
  plan: { tier: string; interval: string; priceAmount: number; currency: string; name: string },
  providerSubId: string,
  sessionId: string,
) {
  const now = new Date();
  const periodEnd = new Date(now);

  if (plan.interval === "year") {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }

  // Upsert subscription
  const sub = await this.prisma.subscription.upsert({
    where: { userId },
    update: {
      tier: plan.tier as "PREMIUM" | "PRO",
      status: "ACTIVE",
      provider: "MOCK",
      providerSubId,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      canceledAt: null,
    },
    create: {
      userId,
      tier: plan.tier as "PREMIUM" | "PRO",
      status: "ACTIVE",
      provider: "MOCK",
      providerSubId,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    },
  });

  // Verify and record payment
  const verification = await this.paymentProvider.verifyPayment(sessionId);

  if (verification.success) {
    await this.prisma.payment.create({
      data: {
        subscriptionId: sub.id,
        amount: verification.amount,
        currency: verification.currency,
        provider: "MOCK",
        providerPayId: verification.providerPayId,
        status: "succeeded",
        metadata: { planName: plan.name },
      },
    });
  }

  // Send notification
  await this.notifications.create({
    userId,
    type: "SYSTEM_ANNOUNCEMENT",
    title: `🎉 ${plan.tier} Subscription Activated!`,
    body: `Welcome to ${plan.name}! Your subscription is active until ${periodEnd.toLocaleDateString()}.`,
    icon: plan.tier === "PRO" ? "💎" : "⭐",
    link: "/profile",
  });

  this.logger.log(`Subscription activated: ${userId} → ${plan.tier} (${plan.interval})`);

  return {
    subscription: sub,
    message: `${plan.name} activated successfully!`,
  };
}

// ==================== TRIAL ====================

/**
 * Start a 7-day Premium trial. Only once per user.
 */
async startTrial(userId: string) {
  const sub = await this.getOrCreateSubscription(userId);

  if (sub.trialUsed) {
    throw new BadRequestException("You have already used your free trial");
  }

  if (sub.tier !== "FREE") {
    throw new BadRequestException("You already have an active subscription");
  }

  const now = new Date();
  const trialEnd = new Date(now);
  trialEnd.setDate(trialEnd.getDate() + 7);

  const updated = await this.prisma.subscription.update({
    where: { id: sub.id },
    data: {
      tier: "PREMIUM",
      status: "TRIALING",
      trialEndsAt: trialEnd,
      trialUsed: true,
      currentPeriodStart: now,
      currentPeriodEnd: trialEnd,
    },
  });

  await this.notifications.create({
    userId,
    type: "SYSTEM_ANNOUNCEMENT",
    title: "🎉 Free Trial Started!",
    body: `Enjoy 7 days of Premium features! Your trial ends on ${trialEnd.toLocaleDateString()}.`,
    icon: "⭐",
    link: "/pricing",
  });

  this.logger.log(`Trial started: ${userId} → PREMIUM trial until ${trialEnd.toISOString()}`);

  return {
    subscription: updated,
    trialEndsAt: trialEnd,
    message: "7-day Premium trial activated!",
  };
}

// ==================== CANCEL ====================

/**
 * Cancel subscription. Access continues until end of billing period.
 */
async cancelSubscription(userId: string, reason?: string) {
  const sub = await this.getOrCreateSubscription(userId);

  if (sub.tier === "FREE") {
    throw new BadRequestException("You don't have an active subscription to cancel");
  }

  const updated = await this.prisma.subscription.update({
    where: { id: sub.id },
    data: {
      status: "CANCELED",
      canceledAt: new Date(),
    },
  });

  // Cancel with provider
  if (sub.providerSubId) {
    await this.paymentProvider.cancelSubscription(sub.providerSubId);
  }

  await this.notifications.create({
    userId,
    type: "SYSTEM_ANNOUNCEMENT",
    title: "Subscription Canceled",
    body: `Your ${sub.tier} access will continue until ${sub.currentPeriodEnd?.toLocaleDateString() ?? "end of period"}.`,
    icon: "ℹ️",
    link: "/profile",
  });

  this.logger.log(`Subscription canceled: ${userId} (reason: ${reason ?? "none"})`);

  return {
    subscription: updated,
    accessUntil: sub.currentPeriodEnd,
    message: `Subscription canceled. You'll keep ${sub.tier} access until ${sub.currentPeriodEnd?.toLocaleDateString()}.`,
  };
}

// ==================== PAYMENT HISTORY ====================

/**
 * Get payment history for a user.
 */
async getPaymentHistory(userId: string) {
  const sub = await this.prisma.subscription.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!sub) return [];

  return this.prisma.payment.findMany({
    where: { subscriptionId: sub.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}
```

---

## Step 5: Update Controller with New Endpoints

**File:** Update `backend-core/src/modules/subscriptions/subscriptions.controller.ts`

Add these endpoints (append to existing controller class):

```typescript
import { CheckoutDto, CancelSubscriptionDto } from "./dto/subscriptions.dto";

/**
 * POST /api/v1/subscriptions/checkout — Create checkout session
 */
@Post("checkout")
@UseGuards(JwtAuthGuard)
async checkout(@Request() req: any, @Body() dto: CheckoutDto) {
  return this.subscriptionsService.checkout(req.user.id, dto.planId);
}

/**
 * POST /api/v1/subscriptions/start-trial — Start 7-day Premium trial
 */
@Post("start-trial")
@UseGuards(JwtAuthGuard)
async startTrial(@Request() req: any) {
  return this.subscriptionsService.startTrial(req.user.id);
}

/**
 * POST /api/v1/subscriptions/cancel — Cancel subscription
 */
@Post("cancel")
@UseGuards(JwtAuthGuard)
async cancelSubscription(@Request() req: any, @Body() dto: CancelSubscriptionDto) {
  return this.subscriptionsService.cancelSubscription(req.user.id, dto.reason);
}

/**
 * GET /api/v1/subscriptions/payments — Payment history
 */
@Get("payments")
@UseGuards(JwtAuthGuard)
async getPaymentHistory(@Request() req: any) {
  return this.subscriptionsService.getPaymentHistory(req.user.id);
}
```

---

## Step 6: Verify

Test the full flow:

```bash
# 1. List plans
curl http://localhost:3000/api/v1/subscriptions/plans

# 2. Start trial (user must be on FREE)
curl -X POST http://localhost:3000/api/v1/subscriptions/start-trial \
  -H "Authorization: Bearer <TOKEN>"
# Expected: { subscription: { tier: "PREMIUM", status: "TRIALING" }, trialEndsAt: "...", message: "..." }

# 3. Check subscription
curl http://localhost:3000/api/v1/subscriptions/me \
  -H "Authorization: Bearer <TOKEN>"
# Expected: tier: "PREMIUM", status: "TRIALING"

# 4. Cancel trial
curl -X POST http://localhost:3000/api/v1/subscriptions/cancel \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Testing"}'
# Expected: { subscription: { status: "CANCELED" }, accessUntil: "..." }

# 5. Reset to FREE (wait for period to end, or manually update DB for testing)

# 6. Checkout with mock payment
curl -X POST http://localhost:3000/api/v1/subscriptions/checkout \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"planId": "<PREMIUM_MONTHLY_PLAN_ID>"}'
# Expected: { subscription: { tier: "PREMIUM", status: "ACTIVE" }, message: "Premium Monthly activated!" }

# 7. Check payment history
curl http://localhost:3000/api/v1/subscriptions/payments \
  -H "Authorization: Bearer <TOKEN>"
# Expected: Array with the mock payment record

# 8. Verify IELTS Advanced access works now
curl http://localhost:3000/api/v1/ielts/advanced/listening \
  -H "Authorization: Bearer <TOKEN>"
# Expected: 200 with data (was 403 before)
```

---

## Files Created/Modified

| Action | File |
|--------|------|
| **Created** | `modules/subscriptions/providers/payment-provider.interface.ts` |
| **Created** | `modules/subscriptions/providers/mock-payment.provider.ts` |
| **Modified** | `modules/subscriptions/subscriptions.module.ts` — register MockPaymentProvider |
| **Modified** | `modules/subscriptions/subscriptions.service.ts` — checkout, trial, cancel, payment history |
| **Modified** | `modules/subscriptions/subscriptions.controller.ts` — new endpoints |
