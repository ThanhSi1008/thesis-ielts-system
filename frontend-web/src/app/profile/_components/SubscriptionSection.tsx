"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, Gem, Loader2, AlertCircle, CalendarDays, Zap } from "lucide-react";
import SubscriptionBadge from "@/components/SubscriptionBadge";
import { subscriptionsApi } from "@/services/subscriptions.api";
import { useSubscription } from "@/contexts/SubscriptionContext";
import type { SubscriptionTier, SubscriptionStatus } from "@/types";

interface SubscriptionSectionProps {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
  isTrial: boolean;
}

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—";

const daysLeft = (d: string | null) => {
  if (!d) return null;
  const diff = new Date(d).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export default function SubscriptionSection({
  tier,
  status,
  currentPeriodEnd,
  trialEndsAt,
  isTrial,
}: SubscriptionSectionProps) {
  const router = useRouter();
  const { refresh } = useSubscription();
  const [canceling, setCanceling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCancel = async () => {
    setCanceling(true);
    try {
      await subscriptionsApi.cancel("User requested cancellation");
      await refresh();
      setShowConfirm(false);
    } catch {
      // silently ignore — GlobalUpgradeModal handles 403s
    } finally {
      setCanceling(false);
    }
  };

  const isFree = tier === "FREE";
  const isCanceled = status === "CANCELED";
  const endDate = isTrial ? trialEndsAt : currentPeriodEnd;
  const remaining = daysLeft(endDate);

  const statusLabel: Record<SubscriptionStatus, { label: string; color: string }> = {
    ACTIVE: { label: "Active", color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20" },
    TRIALING: { label: "Trial", color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" },
    CANCELED: { label: "Canceled", color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20" },
    PAST_DUE: { label: "Past Due", color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20" },
    EXPIRED: { label: "Expired", color: "text-gray-500 bg-gray-100 dark:bg-gray-800" },
  };

  const s = statusLabel[status];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        {tier === "PRO" ? (
          <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
            <Gem className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Crown className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
        )}
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
            Subscription
            <SubscriptionBadge tier={tier} size="md" />
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Manage your plan and billing</p>
        </div>
      </div>

      {/* Status row */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 mb-0.5 uppercase tracking-wider font-medium">Current Plan</p>
          <p className="font-bold text-gray-900 dark:text-white text-lg">
            {isFree ? "Free" : tier === "PRO" ? "Pro" : "Premium"}
          </p>
        </div>

        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${s.color}`}>
          {s.label}
        </span>

        {endDate && !isFree && (
          <div className="text-right">
            <p className="text-xs text-gray-400 flex items-center gap-1 justify-end mb-0.5">
              <CalendarDays className="w-3 h-3" />
              {isTrial ? "Trial ends" : isCanceled ? "Access until" : "Renews"}
            </p>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{formatDate(endDate)}</p>
            {remaining !== null && remaining <= 7 && (
              <p className="text-xs text-amber-500 font-medium mt-0.5">
                {remaining === 0 ? "Expires today" : `${remaining} day${remaining !== 1 ? "s" : ""} left`}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Trial warning */}
      {isTrial && remaining !== null && remaining <= 3 && (
        <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl mb-5 text-sm text-amber-700 dark:text-amber-300">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>Your trial ends in {remaining} day{remaining !== 1 ? "s" : ""}. Upgrade now to keep Premium access.</span>
        </div>
      )}

      {/* CTA Buttons */}
      <div className="flex flex-wrap gap-3">
        {isFree ? (
          <button
            onClick={() => router.push("/pricing")}
            className="flex items-center gap-2 bg-primary hover:bg-yellow-400 text-gray-900 font-semibold px-5 py-2.5 rounded-full text-sm transition-all shadow-sm hover:shadow-md"
          >
            <Zap className="w-4 h-4" />
            Upgrade Now
          </button>
        ) : (
          <>
            {!isCanceled && (
              <>
                <button
                  onClick={() => router.push("/pricing")}
                  className="flex items-center gap-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold px-5 py-2.5 rounded-full text-sm transition-all shadow-sm"
                >
                  Change Plan
                </button>
                <button
                  onClick={() => setShowConfirm(true)}
                  className="px-5 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-red-300 dark:hover:border-red-700 hover:text-red-500 dark:hover:text-red-400 text-sm font-medium transition-all"
                >
                  Cancel Subscription
                </button>
              </>
            )}
            {isCanceled && (
              <button
                onClick={() => router.push("/pricing")}
                className="flex items-center gap-2 bg-primary hover:bg-yellow-400 text-gray-900 font-semibold px-5 py-2.5 rounded-full text-sm transition-all shadow-sm"
              >
                Resubscribe
              </button>
            )}
          </>
        )}
      </div>

      {/* Cancel confirm dialog */}
      {showConfirm && (
        <div className="mt-5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl">
          <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Cancel subscription?</p>
          <p className="text-xs text-red-500 dark:text-red-400 mb-4">
            You'll keep access until {formatDate(currentPeriodEnd)}. You won't be charged again.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={canceling}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
            >
              {canceling && <Loader2 className="w-4 h-4 animate-spin" />}
              Yes, cancel
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Keep subscription
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
