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
