# Phase 1 — VNPay Payment Provider

> **Goal:** Create `VnpayPaymentProvider` class implementing `PaymentProviderInterface`, update Prisma enum, and register via env-based switch.
> **Dependencies:** None. **Effort:** ~3 hours.

---

## Step 1: Update Prisma `PaymentProvider` Enum

**File:** `backend-core/prisma/schema.prisma`

Find the existing `PaymentProvider` enum (around line 563) and add `VNPAY`:

```prisma
enum PaymentProvider {
  MOCK     // Thesis demo — simulated payments
  VNPAY    // VNPay payment gateway (sandbox)
  STRIPE   // Future — real payment processing
  MANUAL   // Admin-granted subscriptions
}
```

Then run the migration:

```bash
cd backend-core
npx prisma migrate dev --name add-vnpay-provider
```

---

## Step 2: Add VNPay Environment Variables

**File:** `backend-core/.env` (append at the end)

```env
# ─── Payment Provider ───
PAYMENT_PROVIDER=mock

# ─── VNPay Sandbox Config ───
VNPAY_TMN_CODE=YOUR_SANDBOX_TMN_CODE
VNPAY_HASH_SECRET=YOUR_SANDBOX_HASH_SECRET
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3001/payment/vnpay-return
VNPAY_IPN_URL=http://localhost:3000/api/v1/subscriptions/webhook/vnpay
```

> **Note:** Get sandbox credentials from [https://sandbox.vnpayment.vn/](https://sandbox.vnpayment.vn/).

---

## Step 3: Create `VnpayPaymentProvider`

**File:** `backend-core/src/modules/subscriptions/providers/vnpay-payment.provider.ts` (create new)

This class implements the same `PaymentProviderInterface` as `MockPaymentProvider`. The key difference is that `createCheckout()` returns `status: "pending"` with a `redirectUrl` instead of `status: "completed"`.

```typescript
import { Injectable, Logger } from "@nestjs/common";
import * as crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import {
  PaymentProviderInterface,
  CheckoutResult,
  PaymentVerification,
} from "./payment-provider.interface";

// ─── Constants ─────────────────────────────────────────────
const VNPAY_VERSION = "2.1.0";
const VNPAY_COMMAND = "pay";
const VNPAY_CURRENCY_CODE = "VND";
const VNPAY_LOCALE = "vn";
const VNPAY_ORDER_TYPE = "other";

/**
 * VNPay payment provider for sandbox/production.
 * Implements redirect-based checkout: user is sent to VNPay's payment page,
 * then redirected back to the app with query parameters for verification.
 */
@Injectable()
export class VnpayPaymentProvider implements PaymentProviderInterface {
  private readonly logger = new Logger(VnpayPaymentProvider.name);

  // In-memory store of pending checkouts (maps sessionId → checkout data).
  // In production, use Redis or database instead.
  private pendingSessions = new Map<
    string,
    {
      userId: string;
      planId: string;
      amount: number;
      currency: string;
      planName: string;
      providerSubId: string;
    }
  >();

  // ─── Config from ENV ───────────────────────────────────
  private get tmnCode(): string {
    return process.env.VNPAY_TMN_CODE ?? "";
  }

  private get hashSecret(): string {
    return process.env.VNPAY_HASH_SECRET ?? "";
  }

  private get vnpayUrl(): string {
    return process.env.VNPAY_URL ?? "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
  }

  private get returnUrl(): string {
    return process.env.VNPAY_RETURN_URL ?? "http://localhost:3001/payment/vnpay-return";
  }

  // ─── createCheckout ────────────────────────────────────
  async createCheckout(params: {
    userId: string;
    planId: string;
    planName: string;
    amount: number;   // In VND (e.g., 99000)
    currency: string;
    interval: string;
  }): Promise<CheckoutResult> {
    const sessionId = uuidv4().replace(/-/g, "").slice(0, 20); // VNPay TxnRef max ~20 chars
    const providerSubId = `vnp_sub_${uuidv4()}`;

    // Store session for later verification
    this.pendingSessions.set(sessionId, {
      userId: params.userId,
      planId: params.planId,
      amount: params.amount,
      currency: params.currency,
      planName: params.planName,
      providerSubId,
    });

    // Build VNPay payment URL
    const redirectUrl = this.buildPaymentUrl({
      txnRef: sessionId,
      amount: params.amount,
      orderInfo: `Subscribe ${params.planName} (${params.interval})`,
      ipAddr: "127.0.0.1", // In production, pass the real user IP
    });

    this.logger.log(
      `[VNPay] Checkout created: txnRef=${sessionId}, plan=${params.planName}, amount=${params.amount} VND`,
    );

    // VNPay is redirect-based — return "pending" with the URL
    return {
      sessionId,
      providerSubId,
      redirectUrl,
      status: "pending",
    };
  }

  // ─── verifyPayment ─────────────────────────────────────
  /**
   * Verify payment using VNPay return/IPN query parameters.
   * Called by the backend after user returns from VNPay or via IPN callback.
   *
   * @param sessionId - The vnp_TxnRef from the return query params
   * @param vnpParams - Optional: full query params from VNPay return URL for hash verification
   */
  async verifyPayment(
    sessionId: string,
    vnpParams?: Record<string, string>,
  ): Promise<PaymentVerification> {
    const session = this.pendingSessions.get(sessionId);

    if (!session) {
      this.logger.warn(`[VNPay] Session not found for txnRef: ${sessionId}`);
      return { success: false, providerPayId: "", amount: 0, currency: "VND" };
    }

    // If vnpParams provided, verify the secure hash
    if (vnpParams) {
      const isValid = this.verifyReturnHash(vnpParams);
      if (!isValid) {
        this.logger.error(`[VNPay] Hash verification FAILED for txnRef: ${sessionId}`);
        return { success: false, providerPayId: "", amount: 0, currency: "VND" };
      }

      const responseCode = vnpParams["vnp_ResponseCode"];
      if (responseCode !== "00") {
        this.logger.warn(`[VNPay] Payment failed with code: ${responseCode} for txnRef: ${sessionId}`);
        this.pendingSessions.delete(sessionId);
        return { success: false, providerPayId: "", amount: 0, currency: "VND" };
      }
    }

    const providerPayId = vnpParams?.["vnp_TransactionNo"] ?? `vnp_pay_${uuidv4()}`;

    this.logger.log(
      `[VNPay] Payment verified: txnRef=${sessionId}, transactionNo=${providerPayId}, amount=${session.amount} VND`,
    );

    // Clean up
    this.pendingSessions.delete(sessionId);

    return {
      success: true,
      providerPayId: String(providerPayId),
      amount: session.amount,
      currency: session.currency,
    };
  }

  // ─── cancelSubscription ────────────────────────────────
  async cancelSubscription(providerSubId: string): Promise<{ success: boolean }> {
    // VNPay does not manage subscriptions — cancellation is handled locally
    this.logger.log(`[VNPay] Subscription canceled locally: ${providerSubId}`);
    return { success: true };
  }

  // ─── getSessionData (helper for service) ───────────────
  getSessionData(sessionId: string) {
    return this.pendingSessions.get(sessionId) ?? null;
  }

  // ═══════════════════════════════════════════════════════
  // PRIVATE: VNPay URL Building & Hash Verification
  // ═══════════════════════════════════════════════════════

  /**
   * Build the VNPay payment redirect URL with HMAC-SHA512 signature.
   */
  private buildPaymentUrl(params: {
    txnRef: string;
    amount: number;
    orderInfo: string;
    ipAddr: string;
  }): string {
    const now = new Date();
    const createDate = this.formatDate(now);

    // VNPay expects amount × 100 (smallest monetary unit)
    const vnpAmount = params.amount * 100;

    const vnpParams: Record<string, string> = {
      vnp_Version: VNPAY_VERSION,
      vnp_Command: VNPAY_COMMAND,
      vnp_TmnCode: this.tmnCode,
      vnp_Locale: VNPAY_LOCALE,
      vnp_CurrCode: VNPAY_CURRENCY_CODE,
      vnp_TxnRef: params.txnRef,
      vnp_OrderInfo: params.orderInfo,
      vnp_OrderType: VNPAY_ORDER_TYPE,
      vnp_Amount: String(vnpAmount),
      vnp_ReturnUrl: this.returnUrl,
      vnp_IpAddr: params.ipAddr,
      vnp_CreateDate: createDate,
    };

    // Sort params alphabetically (VNPay requirement)
    const sortedKeys = Object.keys(vnpParams).sort();
    const queryParts = sortedKeys.map(
      (key) => `${key}=${encodeURIComponent(vnpParams[key])}`,
    );
    const signData = queryParts.join("&");

    // Create HMAC-SHA512 hash
    const hmac = crypto.createHmac("sha512", this.hashSecret);
    const secureHash = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    return `${this.vnpayUrl}?${signData}&vnp_SecureHash=${secureHash}`;
  }

  /**
   * Verify the secure hash from VNPay return URL or IPN callback.
   */
  private verifyReturnHash(params: Record<string, string>): boolean {
    const receivedHash = params["vnp_SecureHash"];
    if (!receivedHash) return false;

    // Remove hash-related fields before re-computing
    const verifyParams = { ...params };
    delete verifyParams["vnp_SecureHash"];
    delete verifyParams["vnp_SecureHashType"];

    // Sort and build sign data (same as buildPaymentUrl)
    const sortedKeys = Object.keys(verifyParams).sort();
    const queryParts = sortedKeys
      .filter((key) => verifyParams[key] !== "" && verifyParams[key] !== undefined)
      .map((key) => `${key}=${encodeURIComponent(verifyParams[key])}`);
    const signData = queryParts.join("&");

    // Compute expected hash
    const hmac = crypto.createHmac("sha512", this.hashSecret);
    const expectedHash = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    return receivedHash.toLowerCase() === expectedHash.toLowerCase();
  }

  /**
   * Format date as yyyyMMddHHmmss (VNPay format).
   */
  private formatDate(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
      `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
      `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
    );
  }
}
```

---

## Step 4: Update Module — Environment-Based Provider Switch

**File:** `backend-core/src/modules/subscriptions/subscriptions.module.ts`

Replace the entire file content:

```typescript
import { Module } from "@nestjs/common";
import { SubscriptionsController } from "./subscriptions.controller";
import { SubscriptionsService } from "./subscriptions.service";
import { SubscriptionGuard } from "./guards/subscription.guard";
import { UsageQuotaGuard } from "./guards/usage-quota.guard";
import { MockPaymentProvider } from "./providers/mock-payment.provider";
import { VnpayPaymentProvider } from "./providers/vnpay-payment.provider";
import { NotificationsModule } from "../notifications/notifications.module";

/**
 * Resolve payment provider class based on PAYMENT_PROVIDER env var.
 * Default: MockPaymentProvider (safe for dev/thesis demo).
 */
function resolvePaymentProvider() {
  const provider = process.env.PAYMENT_PROVIDER?.toLowerCase();

  switch (provider) {
    case "vnpay":
      return VnpayPaymentProvider;
    default:
      return MockPaymentProvider;
  }
}

@Module({
  imports: [NotificationsModule],
  controllers: [SubscriptionsController],
  providers: [
    SubscriptionsService,
    SubscriptionGuard,
    UsageQuotaGuard,
    // Payment provider — selected via PAYMENT_PROVIDER env var
    {
      provide: "PAYMENT_PROVIDER",
      useClass: resolvePaymentProvider(),
    },
  ],
  exports: [SubscriptionsService, SubscriptionGuard, UsageQuotaGuard],
})
export class SubscriptionsModule {}
```

---

## Step 5: Verify

```bash
# 1. Make sure migration ran successfully
cd backend-core
npx prisma migrate dev --name add-vnpay-provider

# 2. Start the backend with MOCK provider (default, nothing changes)
npm run backend:dev
# Check logs: should show MockPaymentProvider in use

# 3. Start the backend with VNPAY provider
# Set PAYMENT_PROVIDER=vnpay in .env, then restart
npm run backend:dev
# Check logs: should show VnpayPaymentProvider in use

# 4. Verify no runtime errors — the checkout endpoint should now return
# a { redirectUrl, sessionId } instead of an auto-completed subscription
curl -X POST http://localhost:3000/api/v1/subscriptions/checkout \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"planId": "<PREMIUM_PLAN_ID>"}'
# Expected: { sessionId: "...", redirectUrl: "https://sandbox.vnpayment.vn/..." }
```

---

## Files Created/Modified

| Action | File |
|--------|------|
| **Modified** | `backend-core/prisma/schema.prisma` — add `VNPAY` to `PaymentProvider` enum |
| **Created** | `backend-core/src/modules/subscriptions/providers/vnpay-payment.provider.ts` |
| **Modified** | `backend-core/src/modules/subscriptions/subscriptions.module.ts` — env-based provider switch |
| **Modified** | `backend-core/.env` — add VNPay sandbox config vars |

---

## Important Notes for Implementor

1. **`verifyPayment()` signature change**: The `VnpayPaymentProvider.verifyPayment()` accepts an optional second parameter `vnpParams` for hash verification. The `PaymentProviderInterface` currently defines `verifyPayment(sessionId: string)`. In Phase 2, we will update the interface to accept optional params. For now, the extra param is typed on the concrete class only.

2. **In-memory sessions**: The `pendingSessions` Map works for single-instance dev. For production with multiple instances, migrate to Redis or a database table.

3. **VNPay amount encoding**: VNPay expects `vnp_Amount = priceInVND × 100`. So 99,000₫ becomes `9900000`. This is handled in `buildPaymentUrl()`.
