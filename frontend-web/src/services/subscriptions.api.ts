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

  checkout: async (planId: string) => {
    const { data } = await api.post("/subscriptions/checkout", { planId });
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
