import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { subscriptionsApi } from '@/services/features.api';
import { useAuth } from './AuthContext';
import { SubscriptionTier, SubscriptionStatus } from '@/types';

interface SubscriptionState {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  trialUsed: boolean;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  usage: Record<string, { used: number; limit: number }>;
  loading: boolean;
  isPremium: boolean;
  isPremiumOrAbove: boolean;
  isPro: boolean;
  isTrial: boolean;
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionState>({
  tier: 'FREE',
  status: 'ACTIVE',
  trialUsed: false,
  trialEndsAt: null,
  currentPeriodEnd: null,
  usage: {},
  loading: true,
  isPremium: false,
  isPremiumOrAbove: false,
  isPro: false,
  isTrial: false,
  refresh: async () => {},
});

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tier, setTier] = useState<SubscriptionTier>('FREE');
  const [status, setStatus] = useState<SubscriptionStatus>('ACTIVE');
  const [trialUsed, setTrialUsed] = useState(false);
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);
  const [usage, setUsage] = useState<Record<string, { used: number; limit: number }>>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setTier('FREE');
      setStatus('ACTIVE');
      setTrialUsed(false);
      setTrialEndsAt(null);
      setCurrentPeriodEnd(null);
      setUsage({});
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const sub = await subscriptionsApi.getMySubscription();
      setTier(sub.tier);
      setStatus(sub.status);
      setTrialUsed(sub.trialUsed);
      setTrialEndsAt(sub.trialEndsAt);
      setCurrentPeriodEnd(sub.currentPeriodEnd);
      setUsage(sub.usage ?? {});
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
      setTier('FREE');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // AppState Listener: Refresh when coming to foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && user) {
        refresh();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [user, refresh]);

  const isPremiumOrAbove = tier === 'PREMIUM' || tier === 'PRO';
  const isPro = tier === 'PRO';
  const isTrial = status === 'TRIALING';

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
        isPremium: isPremiumOrAbove,
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

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
