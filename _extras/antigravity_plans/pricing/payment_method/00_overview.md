# 💳 Real Payment (VNPay) — Master Plan

> **Goal:** Replace the `MockPaymentProvider` with VNPay sandbox to demonstrate real payment gateway integration for the thesis.
> Each phase file is self-contained — an LLM agent can implement any phase independently.

---

## Decisions (Locked)

| Question | Answer |
|----------|--------|
| Payment provider | **VNPay** sandbox (thesis demo — no real money) |
| Currency | **VND** (no decimal units, e.g. `99000` = 99,000₫) |
| Provider switching | **ENV-based** (`PAYMENT_PROVIDER=vnpay` or `mock`) |
| Keep mock? | **Yes** — mock remains as default fallback for dev |
| Recurring billing | **Manual** renewal (VNPay has no auto-recurring) |
| Webhook/IPN | **Yes** — VNPay sends server-to-server IPN callback |
| Frontend callback | Redirect-based return URL |

---

## Current Architecture (Already Implemented)

```
PaymentProviderInterface          ← abstraction (DIP)
├── MockPaymentProvider           ← auto-succeeds, no redirect
└── (NEW) VnpayPaymentProvider    ← redirect-based, hash-verified
```

### Key Existing Files

| File | Purpose |
|------|---------|
| `backend-core/src/modules/subscriptions/providers/payment-provider.interface.ts` | `PaymentProviderInterface` with `createCheckout()`, `verifyPayment()`, `cancelSubscription()` |
| `backend-core/src/modules/subscriptions/providers/mock-payment.provider.ts` | `MockPaymentProvider` — all payments auto-succeed |
| `backend-core/src/modules/subscriptions/subscriptions.module.ts` | Registers `PAYMENT_PROVIDER` injection token with `useClass: MockPaymentProvider` |
| `backend-core/src/modules/subscriptions/subscriptions.service.ts` | `checkout()` calls `paymentProvider.createCheckout()`, handles `status: "completed"` (mock) or `redirectUrl` (real) |
| `backend-core/src/modules/subscriptions/subscriptions.controller.ts` | REST endpoints: `POST /checkout`, `POST /start-trial`, `POST /cancel`, `GET /payments` |
| `backend-core/src/modules/subscriptions/dto/subscriptions.dto.ts` | `CheckoutDto`, `AdminGrantDto`, `CancelSubscriptionDto` |
| `backend-core/prisma/schema.prisma` | `PaymentProvider` enum: `MOCK`, `STRIPE`, `MANUAL` |
| `frontend-web/src/services/subscriptions.api.ts` | `subscriptionsApi.checkout(planId)`, `.startTrial()`, `.cancel()`, `.getPayments()` |
| `frontend-web/src/app/pricing/page.tsx` | Pricing page — calls `subscriptionsApi.checkout(plan.id)` then `router.push("/profile")` |
| `frontend-web/src/contexts/SubscriptionContext.tsx` | React context providing `tier`, `trialUsed`, `refresh()` |

---

## Phase Map

```
Phase 1 (VNPay Provider) ──▶ Phase 2 (Backend Checkout+Webhook) ──▶ Phase 3 (Frontend Return Page)
                                                                            │
                                                     Phase 4 (Renewal + Polish) ◀──┘
```

| Phase | File | Scope | Est. Effort |
|-------|------|-------|-------------|
| **Phase 1** | `01_phase1_vnpay_provider.md` | VNPay provider class, env config, Prisma enum update, module registration | ~3h |
| **Phase 2** | `02_phase2_backend_flow.md` | Update service `activateSubscription()`, add verify + IPN endpoints, new DTO | ~3h |
| **Phase 3** | `03_phase3_frontend.md` | Redirect handling in pricing page, VNPay return page, updated subscription API | ~3h |
| **Phase 4** | `04_phase4_renewal_polish.md` | Renewal cron, expiry notifications, payment history UI, admin dashboard additions | ~4h |

---

## Files Created/Modified Summary

### Phase 1 — VNPay Provider
| Action | File |
|--------|------|
| **Modified** | `backend-core/prisma/schema.prisma` — add `VNPAY` to `PaymentProvider` enum |
| **Created** | `backend-core/src/modules/subscriptions/providers/vnpay-payment.provider.ts` |
| **Modified** | `backend-core/src/modules/subscriptions/subscriptions.module.ts` — env-based provider switch |
| **Modified** | `backend-core/.env` — add VNPay config vars |

### Phase 2 — Backend Checkout + Webhook Flow
| Action | File |
|--------|------|
| **Modified** | `backend-core/src/modules/subscriptions/subscriptions.service.ts` — `activateSubscription()` uses dynamic provider, add `verifyCheckout()` |
| **Modified** | `backend-core/src/modules/subscriptions/subscriptions.controller.ts` — add `POST /checkout/verify`, `POST /webhook/vnpay` |
| **Modified** | `backend-core/src/modules/subscriptions/dto/subscriptions.dto.ts` — add `VerifyCheckoutDto` |

### Phase 3 — Frontend
| Action | File |
|--------|------|
| **Modified** | `frontend-web/src/services/subscriptions.api.ts` — add `verifyCheckout()` method |
| **Created** | `frontend-web/src/app/payment/vnpay-return/page.tsx` — VNPay return handler page |
| **Modified** | `frontend-web/src/app/pricing/page.tsx` — handle `redirectUrl` response from checkout |

### Phase 4 — Renewal & Polish
| Action | File |
|--------|------|
| **Created** | `backend-core/src/modules/subscriptions/subscriptions.cron.ts` — daily renewal/expiry check |
| **Modified** | `backend-core/src/modules/subscriptions/subscriptions.module.ts` — register cron |
| **Modified** | `frontend-web/src/app/profile/_components/SubscriptionSection.tsx` — payment history + renewal |

---

## VNPay Sandbox Credentials

Register at [https://sandbox.vnpayment.vn/](https://sandbox.vnpayment.vn/) to get:

```env
PAYMENT_PROVIDER=vnpay
VNPAY_TMN_CODE=<your_terminal_code>
VNPAY_HASH_SECRET=<your_hash_secret>
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3001/payment/vnpay-return
VNPAY_IPN_URL=http://localhost:3000/api/v1/subscriptions/webhook/vnpay
```

Test card for sandbox:
- Card number: `9704198526191432198`
- Name: `NGUYEN VAN A`
- Expiry: `07/15`
- OTP: `123456`
