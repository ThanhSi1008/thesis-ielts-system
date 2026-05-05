"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { subscriptionsApi } from "@/services/subscriptions.api";
import { useAuth } from "@/contexts/AuthContext";
import type { SubscriptionTier, SubscriptionStatus } from "@/types";

interface SubscriptionState {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  trialUsed: boolean;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  usage: Record<string, { used: number; limit: number }>;
  loading: boolean;
  isPremiumOrAbove: boolean;
  isPro: boolean;
  isTrial: boolean;
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionState>({
  tier: "FREE",
  status: "ACTIVE",
  trialUsed: false,
  trialEndsAt: null,
  currentPeriodEnd: null,
  usage: {},
  loading: true,
  isPremiumOrAbove: false,
  isPro: false,
  isTrial: false,
  refresh: async () => {},
});

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tier, setTier] = useState<SubscriptionTier>("FREE");
  const [status, setStatus] = useState<SubscriptionStatus>("ACTIVE");
  const [trialUsed, setTrialUsed] = useState(false);
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);
  const [usage, setUsage] = useState<Record<string, { used: number; limit: number }>>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setTier("FREE");
      setLoading(false);
      return;
    }
    try {
      const sub = await subscriptionsApi.getMySubscription();
      setTier(sub.tier);
      setStatus(sub.status);
      setTrialUsed(sub.trialUsed);
      setTrialEndsAt(sub.trialEndsAt);
      setCurrentPeriodEnd(sub.currentPeriodEnd);
      setUsage(sub.usage ?? {});
    } catch {
      setTier("FREE");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isPremiumOrAbove = tier === "PREMIUM" || tier === "PRO";
  const isPro = tier === "PRO";
  const isTrial = status === "TRIALING";

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        status,
        trialUsed,
        trialEndsAt,
        currentPeriodEnd,
        usage,
        loading,
        isPremiumOrAbove,
        isPro,
        isTrial,
        refresh,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext);
