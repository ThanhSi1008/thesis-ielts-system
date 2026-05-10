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
    title: "Payment Successful!",
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
