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

const TIER_LEVEL: Record<string, number> = { FREE: 0, PREMIUM: 1, PRO: 2 };

export default function FeatureLock({ requiredTier, featureName, children }: FeatureLockProps) {
  const { tier, trialUsed } = useSubscription();
  const router = useRouter();

  const hasAccess = TIER_LEVEL[tier] >= TIER_LEVEL[requiredTier];
  if (hasAccess) return <>{children}</>;

  return (
    <div className="relative">
      {/* Blurred preview */}
      <div className="blur-sm pointer-events-none select-none opacity-60">{children}</div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-black/20 backdrop-blur-[2px] rounded-2xl">
        <div className="text-center p-8 max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{featureName}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            This feature requires a <span className="font-semibold">{requiredTier}</span> subscription
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
              Or{" "}
              <button
                onClick={() => router.push("/pricing")}
                className="text-primary underline hover:text-primary/80"
              >
                start a free trial
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
