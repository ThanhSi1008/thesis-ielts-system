# 💳 Real Payment Integration — Requirements & Suggestions

> **Context:** The pricing/subscription system is fully implemented with a `MockPaymentProvider`. This document outlines what's needed to replace the mock with real payment processing.

---

## Current State (What You Already Have)

| Component | Status |
|:----------|:-------|
| `PaymentProviderInterface` | ✅ Abstraction in place |
| `MockPaymentProvider` | ✅ Auto-succeeds all payments |
| `SubscriptionsService` (checkout, trial, cancel) | ✅ Fully wired |
| `SubscriptionsController` (REST endpoints) | ✅ Working |
| `SubscriptionGuard` + `UsageQuotaGuard` | ✅ Gating modules |
| Frontend Pricing Page + PricingCard | ✅ Renders plans, calls checkout |
| Prisma: `Subscription`, `Payment`, `UsageRecord`, `PricingPlan` | ✅ Schema ready |
| `PaymentProvider` enum | ✅ `MOCK`, `STRIPE`, `MANUAL` |

**Gap:** The `MockPaymentProvider` always returns `status: "completed"` immediately — no real money flows, no redirect, no webhook verification.

---

## Recommended Payment Providers for Vietnam

### Option A: VNPay (⭐ Recommended for Thesis)

| Aspect | Detail |
|:-------|:-------|
| **Why** | Most widely used payment gateway in Vietnam; supports ATM cards, bank transfer, QR code, Visa/Mastercard |
| **Sandbox** | Free sandbox environment — perfect for thesis demo |
| **Flow** | Redirect-based (user goes to VNPay → pays → redirect back to your app with query params) |
| **Recurring** | ❌ No built-in recurring — you manage renewal manually |
| **Docs** | [https://sandbox.vnpayment.vn/apis/](https://sandbox.vnpayment.vn/apis/) |

### Option B: MoMo

| Aspect | Detail |
|:-------|:-------|
| **Why** | Most popular e-wallet in Vietnam |
| **Sandbox** | Available but limited |
| **Flow** | Deep link / QR code → MoMo app confirms → IPN callback |
| **Recurring** | ❌ No built-in recurring |
| **Docs** | [https://developers.momo.vn/](https://developers.momo.vn/) |

### Option C: Stripe (International)

| Aspect | Detail |
|:-------|:-------|
| **Why** | Best developer experience; built-in subscriptions, webhooks, customer portal |
| **Sandbox** | Full test mode with test cards |
| **Flow** | Stripe Checkout (hosted page) or Stripe Elements (embedded) |
| **Recurring** | ✅ Built-in subscription billing |
| **Docs** | [https://stripe.com/docs](https://stripe.com/docs) |
| **Caveat** | Requires business verification; not commonly used in Vietnam |

### 🎯 Thesis Recommendation

Use **VNPay Sandbox** for the demo. It gives you a real payment flow (redirect, hash verification, IPN callback) without needing a real merchant account or handling real money. Your thesis committee will see a real payment gateway interaction.

---

## Requirements for Real Payment Integration

### REQ-1: New `PaymentProvider` Enum Values

Update the Prisma `PaymentProvider` enum to include Vietnam-specific providers:

```prisma
enum PaymentProvider {
  MOCK     // Thesis demo — simulated payments
  VNPAY    // VNPay payment gateway
  MOMO     // MoMo e-wallet
  STRIPE   // International cards
  MANUAL   // Admin-granted subscriptions
}
```

### REQ-2: VNPay Payment Provider Implementation

Create `VnpayPaymentProvider` implementing `PaymentProviderInterface`:

| Method | VNPay Behavior |
|:-------|:---------------|
| `createCheckout()` | Build VNPay payment URL with HMAC-SHA512 hash → return `redirectUrl` + `status: "pending"` |
| `verifyPayment()` | Validate return URL query params (hash check) → confirm `vnp_ResponseCode === "00"` |
| `cancelSubscription()` | No VNPay API needed — just update local DB |

**Key Config Required:**
```env
VNPAY_TMN_CODE=your_terminal_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html  # sandbox
VNPAY_RETURN_URL=http://localhost:3001/payment/vnpay-return      # frontend callback
VNPAY_IPN_URL=http://your-server/api/v1/subscriptions/webhook/vnpay
```

### REQ-3: Redirect-Based Checkout Flow

The current mock flow auto-completes. Real providers need a **redirect** flow:

```
Current (Mock):
  Frontend → POST /checkout → service.checkout() → MockProvider returns "completed" → done

Required (VNPay):
  Frontend → POST /checkout → service.checkout() → VnpayProvider returns { redirectUrl, status: "pending" }
  Frontend → window.location.href = redirectUrl  (user pays on VNPay page)
  VNPay → redirects user back to VNPAY_RETURN_URL?vnp_TxnRef=...&vnp_ResponseCode=00
  Frontend → calls POST /checkout/verify with query params
  Backend → verifyPayment() → activateSubscription()
```

### REQ-4: Webhook / IPN Endpoint

VNPay sends an **Instant Payment Notification (IPN)** to your backend as a backup verification:

| Endpoint | `POST /api/v1/subscriptions/webhook/vnpay` |
|:---------|:-------------------------------------------|
| Auth | No JWT — VNPay calls this directly |
| Validation | Verify `vnp_SecureHash` using your `HASH_SECRET` |
| Action | If `vnp_ResponseCode === "00"` → activate subscription |
| Response | Return `{ RspCode: "00", Message: "Confirm Success" }` |

### REQ-5: Payment Return Page (Frontend)

Create a new frontend page to handle the redirect back from VNPay:

| Route | `/payment/vnpay-return` |
|:------|:------------------------|
| Params | VNPay appends `vnp_TxnRef`, `vnp_Amount`, `vnp_ResponseCode`, `vnp_SecureHash`, etc. |
| Success | Show "Payment Successful! 🎉" → redirect to `/profile` |
| Failure | Show "Payment Failed" with retry option → redirect to `/pricing` |
| Logic | Call `POST /api/v1/subscriptions/checkout/verify` with the query params |

### REQ-6: Currency Change (VND)

Your current system uses USD cents. For VNPay, switch to VND:

| Change | Detail |
|:-------|:-------|
| `PricingPlan.currency` | Default to `"VND"` instead of `"USD"` |
| `PricingPlan.priceAmount` | Store in VND (no decimals), e.g., `99000` = 99,000 VND |
| VNPay requirement | Amount × 100 (VNPay uses the smallest unit) |
| Frontend display | Format with `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })` |

**Suggested VND Pricing:**

| Tier | Monthly | Annual |
|:-----|:--------|:-------|
| Free | 0 | — |
| Premium | 99,000 VND (~$4) | 799,000 VND (~$32) |
| Pro | 199,000 VND (~$8) | 1,599,000 VND (~$64) |

### REQ-7: Transaction Security

| Requirement | Implementation |
|:------------|:---------------|
| Hash verification | HMAC-SHA512 with `VNPAY_HASH_SECRET` on all params |
| Idempotency | Use `vnp_TxnRef` (map to your `Payment.id`) to prevent double-processing |
| Replay protection | Store processed `vnp_TxnRef` values; reject duplicates |
| Amount validation | Verify `vnp_Amount` matches your `PricingPlan.priceAmount * 100` |

### REQ-8: Subscription Renewal (Manual)

Since VNPay doesn't support auto-recurring billing:

| Strategy | Detail |
|:---------|:-------|
| **Expiry check** | Cron job runs daily: find subscriptions where `currentPeriodEnd < now()` |
| **Grace period** | 3 days after expiry before downgrade |
| **Renewal reminder** | Send notification at 7 days, 3 days, and 1 day before expiry |
| **Renewal flow** | User clicks "Renew" → same checkout flow → extends `currentPeriodEnd` |
| **Auto-downgrade** | After grace period: set `tier = FREE`, `status = EXPIRED` |

### REQ-9: Payment History UI

Enhance the existing `/profile` subscription section:

| Feature | Detail |
|:--------|:-------|
| Payment list | Show all payments with date, amount, status, provider |
| Invoice download | Generate simple PDF receipt (optional for thesis) |
| Renewal button | Show "Renew Now" when subscription is about to expire |
| Cancel flow | Confirm dialog → cancel at end of period |

### REQ-10: Admin Payment Dashboard

Extend the admin panel:

| Feature | Detail |
|:--------|:-------|
| Revenue overview | Total revenue, monthly breakdown chart |
| Transaction list | All payments with filters (status, provider, date range) |
| Manual grant | Already implemented — keep as-is |
| Refund action | Mark payment as "refunded" and downgrade user |

---

## Implementation Priority

| Priority | Requirement | Effort |
|:---------|:------------|:-------|
| 🔴 P0 | REQ-2: VnpayPaymentProvider | ~4h |
| 🔴 P0 | REQ-3: Redirect checkout flow | ~2h |
| 🔴 P0 | REQ-5: Payment return page | ~2h |
| 🟡 P1 | REQ-4: Webhook/IPN endpoint | ~2h |
| 🟡 P1 | REQ-7: Transaction security | ~2h |
| 🟡 P1 | REQ-1: Prisma enum update | ~30m |
| 🟡 P1 | REQ-6: VND currency | ~1h |
| 🟢 P2 | REQ-8: Renewal cron + reminders | ~3h |
| 🟢 P2 | REQ-9: Payment history UI | ~2h |
| ⚪ P3 | REQ-10: Admin dashboard | ~3h |

**Total estimate: ~20 hours**

---

## Architecture Diagram

```
┌──────────────┐     POST /checkout      ┌──────────────────┐
│   Frontend   │ ──────────────────────▶  │  SubscriptionsAPI │
│  (Next.js)   │                          │   (NestJS)        │
│              │  ◀── { redirectUrl } ──  │                   │
└──────┬───────┘                          └────────┬──────────┘
       │                                           │
       │  redirect to VNPay                        │  createCheckout()
       ▼                                           ▼
┌──────────────┐                          ┌──────────────────┐
│  VNPay Page  │                          │ VnpayPayment     │
│  (Sandbox)   │                          │ Provider         │
│              │                          │ (implements      │
│  User pays   │                          │  interface)      │
└──────┬───────┘                          └──────────────────┘
       │                                           ▲
       │  redirect back + IPN                      │
       ▼                                           │
┌──────────────┐     POST /checkout/verify         │
│  /payment/   │ ──────────────────────────────────┘
│  vnpay-return│     verifyPayment()
│  (Frontend)  │     → activateSubscription()
└──────────────┘
```

---

## Key Principle: DIP Compliance

Your existing architecture already follows DIP perfectly:

```typescript
// subscriptions.module.ts — just swap the provider class
{
  provide: "PAYMENT_PROVIDER",
  useClass: process.env.PAYMENT_PROVIDER === "vnpay"
    ? VnpayPaymentProvider
    : MockPaymentProvider,
}
```

The `SubscriptionsService` never knows which provider it's using — it only depends on `PaymentProviderInterface`. Zero changes needed in the service layer.
