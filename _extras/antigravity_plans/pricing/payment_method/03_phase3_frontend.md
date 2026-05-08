# Phase 3 — Frontend: Redirect Checkout & VNPay Return Page

> **Goal:** Update the pricing page to handle redirect-based checkout, create a VNPay return page that verifies payment, and update the subscription API client.
> **Dependencies:** Phase 1 + 2. **Effort:** ~3 hours.

---

## Step 1: Update Frontend Subscription API Client

**File:** `frontend-web/src/services/subscriptions.api.ts`

Add the `verifyCheckout` method. Replace the entire file:

```typescript
import api from "@/lib/api";
import type { PricingPlan, UserSubscription } from "@/types";

export const subscriptionsApi = {
  getPlans: async (): Promise<PricingPlan[]> => {
    const { data } = await api.get<PricingPlan[]>("/subscriptions/plans");
    return data;
  },

  getMySubscription: async (): Promise<UserSubscription> => {
    const { data } = await api.get<UserSubscription>("/subscriptions/me");
    return data;
  },

  getUsage: async (): Promise<Record<string, { used: number; limit: number }>> => {
    const { data } = await api.get<Record<string, { used: number; limit: number }>>(
      "/subscriptions/usage",
    );
    return data;
  },

  /**
   * Create a checkout session. Returns either:
   * - Mock: { subscription, message } (auto-completed)
   * - VNPay: { sessionId, redirectUrl } (needs redirect)
   */
  checkout: async (planId: string) => {
    const { data } = await api.post("/subscriptions/checkout", { planId });
    return data;
  },

  /**
   * Verify a checkout after returning from the payment gateway.
   * @param sessionId - The txnRef / session ID
   * @param vnpParams - Full VNPay return URL query parameters
   */
  verifyCheckout: async (sessionId: string, vnpParams?: Record<string, string>) => {
    const { data } = await api.post("/subscriptions/checkout/verify", {
      sessionId,
      vnpParams,
    });
    return data;
  },

  startTrial: async () => {
    const { data } = await api.post("/subscriptions/start-trial");
    return data;
  },

  cancel: async (reason?: string) => {
    const { data } = await api.post("/subscriptions/cancel", { reason });
    return data;
  },

  getPayments: async () => {
    const { data } = await api.get("/subscriptions/payments");
    return data;
  },
};
```

---

## Step 2: Update Pricing Page — Handle Redirect Response

**File:** `frontend-web/src/app/pricing/page.tsx`

Find the `handleSelect` function (around line 91). Currently it calls `subscriptionsApi.checkout(plan.id)` and immediately navigates to `/profile`. Update it to handle the redirect case.

**Current code (lines 91-113):**
```typescript
const handleSelect = async (plan: PricingPlan) => {
  if (!user) {
    router.push("/login");
    return;
  }
  if (plan.tier === tier) return;

  setLoadingPlanId(plan.id);
  try {
    if (plan.tier === "PREMIUM" && !trialUsed && tier === "FREE") {
      await subscriptionsApi.startTrial();
    } else if (plan.priceAmount > 0) {
      await subscriptionsApi.checkout(plan.id);
    }
    await refresh();
    router.push("/profile");
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? "Something went wrong. Please try again.";
    alert(msg);
  } finally {
    setLoadingPlanId(null);
  }
};
```

**Replace with:**
```typescript
const handleSelect = async (plan: PricingPlan) => {
  if (!user) {
    router.push("/login");
    return;
  }
  if (plan.tier === tier) return;

  setLoadingPlanId(plan.id);
  try {
    if (plan.tier === "PREMIUM" && !trialUsed && tier === "FREE") {
      await subscriptionsApi.startTrial();
      await refresh();
      router.push("/profile");
      return;
    }

    if (plan.priceAmount > 0) {
      const result = await subscriptionsApi.checkout(plan.id);

      // If provider returns a redirect URL (VNPay), redirect the user
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
        return; // User leaves the page — no further action
      }

      // If mock provider (auto-completed), go to profile
      await refresh();
      router.push("/profile");
      return;
    }

    // Free plan or downgrade
    await refresh();
    router.push("/profile");
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? "Something went wrong. Please try again.";
    alert(msg);
  } finally {
    setLoadingPlanId(null);
  }
};
```

**Key change:** When `result.redirectUrl` exists, we do `window.location.href = result.redirectUrl` to send the user to the VNPay payment page. The user will return via the VNPay return URL (Step 3).

---

## Step 3: Create VNPay Return Page

**File:** `frontend-web/src/app/payment/vnpay-return/page.tsx` (create new)

This page handles the redirect back from VNPay. VNPay appends query parameters like `vnp_TxnRef`, `vnp_ResponseCode`, `vnp_SecureHash`, etc.

```tsx
"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { subscriptionsApi } from "@/services/subscriptions.api";
import { useSubscription } from "@/contexts/SubscriptionContext";

type PaymentStatus = "verifying" | "success" | "failed";

const STATUS_CONFIG: Record<PaymentStatus, {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}> = {
  verifying: {
    icon: <Loader2 className="w-12 h-12 animate-spin text-primary" />,
    title: "Verifying Payment...",
    description: "Please wait while we confirm your payment with VNPay.",
    color: "text-primary",
  },
  success: {
    icon: <CheckCircle className="w-12 h-12 text-green-500" />,
    title: "Payment Successful! 🎉",
    description: "Your subscription has been activated. Enjoy your premium features!",
    color: "text-green-500",
  },
  failed: {
    icon: <XCircle className="w-12 h-12 text-red-500" />,
    title: "Payment Failed",
    description: "Something went wrong with your payment. Please try again.",
    color: "text-red-500",
  },
};

function VnpayReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refresh } = useSubscription();
  const [status, setStatus] = useState<PaymentStatus>("verifying");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const verifiedRef = useRef(false);

  useEffect(() => {
    // Prevent double-verification in React StrictMode
    if (verifiedRef.current) return;
    verifiedRef.current = true;

    const verifyPayment = async () => {
      // Extract VNPay params from URL query string
      const vnpParams: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        vnpParams[key] = value;
      });

      const txnRef = vnpParams["vnp_TxnRef"];
      const responseCode = vnpParams["vnp_ResponseCode"];

      // Early check: if VNPay already reported failure
      if (responseCode && responseCode !== "00") {
        setStatus("failed");
        setErrorMessage(getVnpayErrorMessage(responseCode));
        return;
      }

      if (!txnRef) {
        setStatus("failed");
        setErrorMessage("Missing transaction reference. Please contact support.");
        return;
      }

      try {
        await subscriptionsApi.verifyCheckout(txnRef, vnpParams);
        await refresh();
        setStatus("success");
      } catch (err: any) {
        setStatus("failed");
        setErrorMessage(
          err?.response?.data?.message ?? "Payment verification failed. Please try again."
        );
      }
    };

    verifyPayment();
  }, [searchParams, refresh]);

  const config = STATUS_CONFIG[status];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-10 shadow-lg">
          {/* Icon */}
          <div className="flex justify-center mb-6">{config.icon}</div>

          {/* Title */}
          <h1 className={`text-2xl font-bold mb-2 ${config.color}`}>
            {config.title}
          </h1>

          {/* Description */}
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {errorMessage || config.description}
          </p>

          {/* Actions */}
          {status === "success" && (
            <button
              onClick={() => router.push("/profile")}
              className="w-full py-3 px-6 bg-primary text-gray-900 font-bold rounded-xl hover:opacity-90 transition-all"
            >
              Go to Profile
            </button>
          )}

          {status === "failed" && (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push("/pricing")}
                className="w-full py-3 px-6 bg-primary text-gray-900 font-bold rounded-xl hover:opacity-90 transition-all"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full py-3 px-6 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                Back to Home
              </button>
            </div>
          )}

          {status === "verifying" && (
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Do not close this page.
            </p>
          )}
        </div>

        {/* Transaction details (for debugging / demo) */}
        {status !== "verifying" && searchParams.get("vnp_TxnRef") && (
          <div className="mt-6 text-xs text-gray-400 dark:text-gray-600">
            Transaction Ref: {searchParams.get("vnp_TxnRef")}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Map VNPay response codes to user-friendly messages.
 */
function getVnpayErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    "07": "Transaction suspected of fraud. Money deducted — contact your bank.",
    "09": "Your card/account is not registered for Internet Banking.",
    "10": "Verification failed. You have exceeded the allowed attempts (3 times).",
    "11": "Payment timeout. Please try again.",
    "12": "Your card/account has been locked.",
    "13": "Incorrect OTP. Please try again.",
    "24": "Transaction canceled by user.",
    "51": "Insufficient account balance.",
    "65": "Transaction limit exceeded for today.",
    "75": "Your bank is under maintenance.",
    "79": "Too many incorrect password attempts. Please try again later.",
    "99": "An unknown error occurred.",
  };
  return messages[code] ?? `Payment failed (error code: ${code}). Please try again.`;
}

export default function VnpayReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <VnpayReturnContent />
    </Suspense>
  );
}
```

---

## Step 4: Verify the Full Flow

```
1. User visits /pricing
2. Clicks "Upgrade Now" on Premium card
3. Frontend: POST /api/v1/subscriptions/checkout { planId }
4. Backend (VNPay mode): returns { sessionId, redirectUrl }
5. Frontend: window.location.href = redirectUrl
6. User is on VNPay sandbox page → enters test card details → pays
7. VNPay redirects to: /payment/vnpay-return?vnp_TxnRef=...&vnp_ResponseCode=00&...
8. VnpayReturnPage:
   a. Extracts all query params
   b. Calls POST /api/v1/subscriptions/checkout/verify { sessionId, vnpParams }
   c. Backend verifies hash → activates subscription → returns success
   d. Frontend shows "Payment Successful! 🎉"
   e. User clicks "Go to Profile" → sees PREMIUM tier
```

**Manual test steps:**

```bash
# Ensure PAYMENT_PROVIDER=vnpay in backend .env
# Ensure VNPAY_RETURN_URL=http://localhost:3001/payment/vnpay-return

# 1. Start both servers
npm run backend:dev
npm run web:dev

# 2. Login as a user, navigate to /pricing
# 3. Click "Upgrade Now" on Premium
# 4. Should redirect to VNPay sandbox page
# 5. Use test card: 9704198526191432198, NGUYEN VAN A, 07/15, OTP: 123456
# 6. After payment, should redirect to /payment/vnpay-return with success
# 7. Check /profile — tier should be PREMIUM
```

---

## Files Created/Modified

| Action | File |
|--------|------|
| **Modified** | `frontend-web/src/services/subscriptions.api.ts` — add `verifyCheckout()` |
| **Created** | `frontend-web/src/app/payment/vnpay-return/page.tsx` — VNPay return handler |
| **Modified** | `frontend-web/src/app/pricing/page.tsx` — handle `redirectUrl` in checkout response |

---

## Important Notes for Implementor

1. **`Suspense` boundary**: The `useSearchParams()` hook in Next.js App Router requires a Suspense boundary. The page wraps `VnpayReturnContent` in `<Suspense>`.

2. **Double-verification guard**: React StrictMode calls `useEffect` twice in dev. The `verifiedRef` prevents calling the verify API twice, which would fail on the second call (session already consumed).

3. **Error code mapping**: The `getVnpayErrorMessage` function maps VNPay's `vnp_ResponseCode` to user-friendly messages. Code `"00"` = success, code `"24"` = user canceled, etc.

4. **Mock mode still works**: When `PAYMENT_PROVIDER=mock`, the checkout returns `{ subscription, message }` (no `redirectUrl`), so the pricing page skips the redirect and goes directly to `/profile`. No breaking change.
