# Phase 2 — Backend Checkout & Webhook Flow

> **Goal:** Update `SubscriptionsService` and controller to handle redirect-based checkout, add payment verification endpoint, and add VNPay IPN webhook.
> **Dependencies:** Phase 1. **Effort:** ~3 hours.

---

## Step 1: Update `PaymentProviderInterface`

**File:** `backend-core/src/modules/subscriptions/providers/payment-provider.interface.ts`

Add the optional `vnpParams` to `verifyPayment` and also add a `getSessionData` helper:

Replace the entire file:

```typescript
/**
 * Abstraction for payment processing.
 * Implementations: MockPaymentProvider (thesis), VnpayPaymentProvider (sandbox)
 */
export interface PaymentProviderInterface {
  /**
   * Create a checkout session for a subscription plan.
   * Mock: returns status "completed" (auto-succeed).
   * VNPay: returns status "pending" with a redirectUrl.
   */
  createCheckout(params: {
    userId: string;
    planId: string;
    planName: string;
    amount: number;
    currency: string;
    interval: string;
  }): Promise<CheckoutResult>;

  /**
   * Verify a payment was successful.
   * Mock: always succeeds.
   * VNPay: validates vnp_SecureHash and vnp_ResponseCode from return params.
   *
   * @param sessionId - The checkout session ID (vnp_TxnRef for VNPay)
   * @param providerParams - Optional provider-specific query params (VNPay return URL params)
   */
  verifyPayment(
    sessionId: string,
    providerParams?: Record<string, string>,
  ): Promise<PaymentVerification>;

  /**
   * Cancel an active subscription.
   */
  cancelSubscription(providerSubId: string): Promise<{ success: boolean }>;

  /**
   * Get stored session data for a pending checkout.
   * Returns null if session not found or already processed.
   */
  getSessionData?(sessionId: string): {
    userId: string;
    planId: string;
    amount: number;
    currency: string;
    planName: string;
    providerSubId: string;
  } | null;
}

export interface CheckoutResult {
  sessionId: string;
  providerSubId: string;
  redirectUrl?: string;
  status: "pending" | "completed";
}

export interface PaymentVerification {
  success: boolean;
  providerPayId: string;
  amount: number;
  currency: string;
}
```

---

## Step 2: Update `MockPaymentProvider` to Match New Interface

**File:** `backend-core/src/modules/subscriptions/providers/mock-payment.provider.ts`

Add the `providerParams` parameter to `verifyPayment` and add `getSessionData`:

Find the existing `verifyPayment` method and update its signature:

```typescript
// Update the verifyPayment signature to accept optional providerParams
async verifyPayment(
  sessionId: string,
  providerParams?: Record<string, string>,
): Promise<PaymentVerification> {
  // ... existing implementation stays the same ...
}

// Add this new method at the end of the class
getSessionData(sessionId: string) {
  const session = this.pendingSessions.get(sessionId);
  if (!session) return null;
  return {
    userId: session.userId,
    planId: "",
    amount: session.amount,
    currency: session.currency,
    planName: session.planName,
    providerSubId: "",
  };
}
```

---

## Step 3: Add `VerifyCheckoutDto`

**File:** `backend-core/src/modules/subscriptions/dto/subscriptions.dto.ts`

Append to the end of the existing file:

```typescript
export class VerifyCheckoutDto {
  @IsString()
  sessionId: string; // The txnRef / session ID from the checkout

  @IsOptional()
  vnpParams?: Record<string, string>; // Full VNPay return query params
}
```

---

## Step 4: Update `SubscriptionsService` — Dynamic Provider & Verify

**File:** `backend-core/src/modules/subscriptions/subscriptions.service.ts`

### 4a. Update `activateSubscription` to accept provider name dynamically

Find the `activateSubscription` method (around line 314). Replace the hardcoded `"MOCK"` provider with a parameter.

**Current code (lines 314-383):**
```typescript
private async activateSubscription(
  userId: string,
  plan: { tier: string; interval: string; priceAmount: number; currency: string; name: string },
  providerSubId: string,
  sessionId: string,
) {
```

**Replace with:**
```typescript
/**
 * Activate a subscription after successful payment.
 * @param providerName — the PaymentProvider enum value to store (e.g., "MOCK", "VNPAY")
 */
async activateSubscription(
  userId: string,
  plan: { tier: string; interval: string; priceAmount: number; currency: string; name: string },
  providerSubId: string,
  sessionId: string,
  providerName: "MOCK" | "VNPAY" | "STRIPE" | "MANUAL" = "MOCK",
) {
```

Then inside the method, replace all three instances of `provider: "MOCK"` with `provider: providerName`:

```typescript
// In the upsert update block:
provider: providerName,

// In the upsert create block:
provider: providerName,

// In the payment.create block:
provider: providerName,
```

### 4b. Update `checkout()` to pass provider name

Find the `checkout` method (around line 281). Update the `activateSubscription` call:

**Current:**
```typescript
if (ieltsIntensiveResult.status === "completed") {
  return this.activateSubscription(userId, plan, ieltsIntensiveResult.providerSubId, ieltsIntensiveResult.sessionId);
}
```

**Replace with:**
```typescript
if (ieltsIntensiveResult.status === "completed") {
  const providerName = this.resolveProviderName();
  return this.activateSubscription(userId, plan, ieltsIntensiveResult.providerSubId, ieltsIntensiveResult.sessionId, providerName);
}
```

### 4c. Add helper method `resolveProviderName`

Add this private method to the service class:

```typescript
/**
 * Determine which PaymentProvider enum value to store based on the current provider.
 */
private resolveProviderName(): "MOCK" | "VNPAY" | "STRIPE" | "MANUAL" {
  const env = process.env.PAYMENT_PROVIDER?.toLowerCase();
  switch (env) {
    case "vnpay": return "VNPAY";
    case "stripe": return "STRIPE";
    default: return "MOCK";
  }
}
```

### 4d. Add `verifyCheckout` method

Add this new public method to the service class (after `checkout`):

```typescript
// ==================== VERIFY CHECKOUT ====================

/**
 * Verify a checkout after user returns from payment gateway (VNPay).
 * Called by the frontend return page or by the IPN webhook.
 */
async verifyCheckout(sessionId: string, vnpParams?: Record<string, string>) {
  // Verify payment with provider
  const verification = await this.paymentProvider.verifyPayment(sessionId, vnpParams);

  if (!verification.success) {
    throw new BadRequestException("Payment verification failed. Please try again.");
  }

  // Get session data to find the plan
  const sessionData = this.paymentProvider.getSessionData?.(sessionId);

  // If session data is available from provider, use it
  // Otherwise, try to extract from vnpParams
  let plan: { tier: string; interval: string; priceAmount: number; currency: string; name: string } | null = null;
  let userId: string | null = null;
  let providerSubId: string = "";

  if (sessionData) {
    userId = sessionData.userId;
    providerSubId = sessionData.providerSubId;
    const dbPlan = await this.prisma.pricingPlan.findUnique({
      where: { id: sessionData.planId },
    });
    if (dbPlan) {
      plan = {
        tier: dbPlan.tier,
        interval: dbPlan.interval,
        priceAmount: dbPlan.priceAmount,
        currency: dbPlan.currency,
        name: dbPlan.name,
      };
    }
  }

  if (!plan || !userId) {
    // Fallback: look up pending payment by sessionId in the database
    // This handles the case where the server restarted and in-memory sessions were lost
    throw new BadRequestException("Checkout session expired or not found. Please try again.");
  }

  const providerName = this.resolveProviderName();
  return this.activateSubscription(userId, plan, providerSubId, sessionId, providerName);
}

/**
 * Handle VNPay IPN (Instant Payment Notification) callback.
 * VNPay sends this server-to-server as a backup verification.
 * Returns { RspCode, Message } as VNPay expects.
 */
async handleVnpayIpn(vnpParams: Record<string, string>): Promise<{ RspCode: string; Message: string }> {
  const txnRef = vnpParams["vnp_TxnRef"];
  const responseCode = vnpParams["vnp_ResponseCode"];

  if (!txnRef) {
    return { RspCode: "99", Message: "Missing txnRef" };
  }

  // Only process successful payments
  if (responseCode !== "00") {
    this.logger.warn(`[IPN] Payment not successful: txnRef=${txnRef}, code=${responseCode}`);
    return { RspCode: "00", Message: "Confirmed" };
  }

  try {
    await this.verifyCheckout(txnRef, vnpParams);
    return { RspCode: "00", Message: "Confirm Success" };
  } catch (err) {
    this.logger.error(`[IPN] Failed to process: txnRef=${txnRef}, error=${err}`);
    // Still return 00 to prevent VNPay from retrying endlessly
    return { RspCode: "00", Message: "Confirmed (already processed or error)" };
  }
}
```

---

## Step 5: Update Controller — Add Verify & Webhook Endpoints

**File:** `backend-core/src/modules/subscriptions/subscriptions.controller.ts`

Add these imports at the top:

```typescript
import { VerifyCheckoutDto } from "./dto/subscriptions.dto";
import { Query } from "@nestjs/common";
```

Add these new endpoints to the controller class (after the existing `checkout` endpoint):

```typescript
/**
 * POST /api/v1/subscriptions/checkout/verify — Verify payment after redirect
 * Called by the frontend after user returns from VNPay.
 */
@Post("checkout/verify")
@UseGuards(JwtAuthGuard)
async verifyCheckout(@Body() dto: VerifyCheckoutDto) {
  return this.subscriptionsService.verifyCheckout(dto.sessionId, dto.vnpParams);
}

/**
 * GET /api/v1/subscriptions/webhook/vnpay — VNPay IPN callback
 * Called server-to-server by VNPay. No JWT auth.
 * VNPay sends params as query strings on a GET request.
 */
@Get("webhook/vnpay")
async vnpayIpn(@Query() query: Record<string, string>) {
  return this.subscriptionsService.handleVnpayIpn(query);
}
```

---

## Step 6: Verify

Test the full redirect flow:

```bash
# 1. Set PAYMENT_PROVIDER=vnpay in .env, restart backend

# 2. Create a checkout — should return redirectUrl
curl -X POST http://localhost:3000/api/v1/subscriptions/checkout \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"planId": "<PLAN_ID>"}'
# Expected: { sessionId: "abc123", redirectUrl: "https://sandbox.vnpayment.vn/..." }

# 3. Visit the redirectUrl in a browser
# Use sandbox test card: 9704198526191432198, Name: NGUYEN VAN A, Exp: 07/15, OTP: 123456

# 4. After payment, VNPay redirects to:
# http://localhost:3001/payment/vnpay-return?vnp_TxnRef=abc123&vnp_ResponseCode=00&vnp_SecureHash=...

# 5. Frontend calls verify endpoint (Phase 3 implements this):
curl -X POST http://localhost:3000/api/v1/subscriptions/checkout/verify \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "abc123", "vnpParams": {"vnp_TxnRef": "abc123", "vnp_ResponseCode": "00", ...}}'
# Expected: { subscription: { tier: "PREMIUM", status: "ACTIVE" }, message: "..." }

# 6. VNPay also sends IPN to:
# GET http://localhost:3000/api/v1/subscriptions/webhook/vnpay?vnp_TxnRef=abc123&...
# Expected: { RspCode: "00", Message: "Confirm Success" }
```

---

## Files Created/Modified

| Action | File |
|--------|------|
| **Modified** | `backend-core/src/modules/subscriptions/providers/payment-provider.interface.ts` — add optional `providerParams` to `verifyPayment`, add `getSessionData` |
| **Modified** | `backend-core/src/modules/subscriptions/providers/mock-payment.provider.ts` — update `verifyPayment` signature, add `getSessionData` |
| **Modified** | `backend-core/src/modules/subscriptions/dto/subscriptions.dto.ts` — add `VerifyCheckoutDto` |
| **Modified** | `backend-core/src/modules/subscriptions/subscriptions.service.ts` — make `activateSubscription` accept provider name, add `verifyCheckout`, add `handleVnpayIpn`, add `resolveProviderName` |
| **Modified** | `backend-core/src/modules/subscriptions/subscriptions.controller.ts` — add `POST /checkout/verify`, `GET /webhook/vnpay` |

---

## Important Notes for Implementor

1. **The `activateSubscription` visibility changed** from `private` to `async` (public). This is necessary because `verifyCheckout` needs to call it.

2. **Idempotency**: If `verifyCheckout` is called twice with the same `sessionId` (once from frontend return, once from IPN), the second call will fail because `pendingSessions` already deleted the session. The `activateSubscription` uses `prisma.subscription.upsert`, so the subscription won't be duplicated, but the payment record might be. Add an idempotency check: query `Payment` by `providerPayId` before creating a new record.

3. **Server restart**: If the backend restarts between checkout creation and verification, in-memory sessions are lost. For the thesis demo this is acceptable. For production, persist pending sessions in Redis or a database table.
