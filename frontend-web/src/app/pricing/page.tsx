"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Shield, Zap, Crown, Gift } from "lucide-react";
import { subscriptionsApi } from "@/services/subscriptions.api";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import PricingCard from "./components/PricingCard";
import type { PricingPlan } from "@/types";

type BillingInterval = "month" | "year";

const TIER_LEVEL: Record<string, number> = { FREE: 0, PREMIUM: 1, PRO: 2 };

const TIER_ICON: Record<string, React.ReactNode> = {
  FREE: <Shield className="w-5 h-5" />,
  PREMIUM: <Crown className="w-5 h-5" />,
  PRO: <Zap className="w-5 h-5" />,
};

export default function PricingPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [billing, setBilling] = useState<BillingInterval>("month");
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const { tier, trialUsed, refresh } = useSubscription();
  const { user } = useAuth();
  const router = useRouter();

  const fetchPlans = useCallback(async () => {
    try {
      const data = await subscriptionsApi.getPlans();

      const freePlan: PricingPlan = {
        id: "free-plan-id",
        tier: "FREE",
        name: "Basic",
        description: "Essential tools to get started with TOEIC Master AI",
        priceAmount: 0,
        currency: "USD",
        interval: "month",
        intervalCount: 1,
        features: [
          "Limited Vocabulary & Grammar books",
          "5 Pronunciation checks/day",
          "Basic IELTS lessons & exercises",
          "5 Shadowing & Dictation lessons",
          "3 Vocab Lab decks (max 50 cards)",
          "Community access (can post)",
          "Save up to 3 past exams",
        ],
        isActive: true,
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setPlans([freePlan, ...data]);
    } catch {
      // plans stay empty
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Free plan shows on both tabs; paid plans filter by billing interval
  const visiblePlans = plans.filter(
    (p) => p.priceAmount === 0 || p.interval === billing,
  );

  const formatPrice = (plan: PricingPlan) => {
    if (plan.priceAmount === 0) return "Free";
    return `$${(plan.priceAmount / 100).toFixed(2)}`;
  };

  const formatInterval = (plan: PricingPlan) => {
    if (plan.priceAmount === 0) return "";
    return plan.interval === "year" ? "/year" : "/month";
  };

  const getCtaLabel = (plan: PricingPlan) => {
    if (plan.tier === tier) return "Current Plan";
    if (plan.priceAmount === 0) return "Downgrade to Free";
    if (!user) return "Get Started";
    if (plan.tier === "PREMIUM" && !trialUsed && tier === "FREE") return "Start Free Trial";
    if (TIER_LEVEL[plan.tier] > TIER_LEVEL[tier]) return "Upgrade Now";
    return "Switch Plan";
  };

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

  const annualSavings = (monthlyAmount: number) =>
    Math.round(((monthlyAmount * 12 - monthlyAmount * 10) / (monthlyAmount * 12)) * 100);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-8 pb-8 overflow-x-hidden">
      {/* Hero */}
      <div className="text-center mb-14 px-4">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-semibold px-4 py-2 rounded-full mb-6">
          <Sparkles className="w-4 h-4" />
          Unlock Your Full Potential
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Choose the plan that fits your learning goals. Upgrade or downgrade at any time.
        </p>

        {/* Billing toggle */}
        <div className="mt-8 inline-flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full p-1 shadow-sm">
          <button
            onClick={() => setBilling("month")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${billing === "month"
                ? "bg-primary text-gray-900 shadow"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("year")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${billing === "year"
                ? "bg-primary text-gray-900 shadow"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
          >
            Annual
            <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              Save 33%
            </span>
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-6xl mx-auto px-4">
        {visiblePlans.length === 0 ? (
          /* Skeleton while loading */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-96 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {visiblePlans.map((plan) => (
              <PricingCard
                key={plan.id}
                tier={plan.tier}
                name={plan.name}
                price={formatPrice(plan)}
                interval={formatInterval(plan)}
                description={plan.description}
                features={plan.features}
                isCurrentPlan={plan.tier === tier}
                isPopular={plan.tier === "PREMIUM"}
                onSelect={() => handleSelect(plan)}
                ctaLabel={getCtaLabel(plan)}
                loading={loadingPlanId === plan.id}
                disabled={loadingPlanId !== null && loadingPlanId !== plan.id}
              />
            ))}
          </div>
        )}

        {/* Trial note */}
        {!trialUsed && tier === "FREE" && user && (
          <p className="flex items-center justify-center gap-2 mt-10 text-sm text-gray-500 dark:text-gray-400">
            <Gift className="w-4 h-4 text-primary" />
            <span>
              Start with a{" "}
              <span className="font-semibold text-primary">7-day free PREMIUM trial</span> — no credit
              card required.
            </span>
          </p>
        )}

        {/* Feature comparison table */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-10">
            Compare All Features
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left py-4 px-6 text-gray-500 dark:text-gray-400 font-medium w-1/2">
                    Feature
                  </th>
                  {["FREE", "PREMIUM", "PRO"].map((t) => (
                    <th
                      key={t}
                      className={`py-4 px-6 text-center font-bold ${t === tier
                          ? "text-primary"
                          : "text-gray-900 dark:text-white"
                        }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        {TIER_ICON[t]}
                        {t}
                        {t === tier && (
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-normal">
                            Current
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {[
                  { label: "Vocabulary Books", free: "2 books", premium: "Unlimited", pro: "Unlimited" },
                  { label: "Grammar Levels", free: "Elementary only", premium: "All levels", pro: "All levels" },
                  { label: "Pronunciation Checks", free: "5/day", premium: "Unlimited", pro: "Unlimited" },
                  { label: "IELTS Advanced", free: "✗", premium: "✓", pro: "✓" },
                  { label: "AI Writing Grading", free: "✗", premium: "10/month", pro: "Unlimited" },
                  { label: "AI Speaking Grading", free: "✗", premium: "10/month", pro: "Unlimited" },
                  { label: "Shadowing Lessons", free: "5 lessons", premium: "Unlimited", pro: "Unlimited" },
                  { label: "Dictation Lessons", free: "5 lessons", premium: "Unlimited", pro: "Unlimited" },
                  { label: "YouTube Import", free: "✗", premium: "✓", pro: "✓" },
                  { label: "Vocab Lab Decks", free: "3 decks", premium: "Unlimited", pro: "Unlimited" },
                  { label: "AI Card Generation", free: "✗", premium: "50/month", pro: "Unlimited" },
                  { label: "Community Marketplace", free: "✗", premium: "✓", pro: "✓" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                    <td className="py-3.5 px-6 text-gray-700 dark:text-gray-300 font-medium">
                      {row.label}
                    </td>
                    {[row.free, row.premium, row.pro].map((val, j) => (
                      <td key={j} className="py-3.5 px-6 text-center">
                        {val === "✓" ? (
                          <span className="text-green-500 font-bold text-base">✓</span>
                        ) : val === "✗" ? (
                          <span className="text-gray-300 dark:text-gray-600">✗</span>
                        ) : (
                          <span className="text-gray-600 dark:text-gray-400">{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ blurb */}
        <p className="text-center mt-12 text-sm text-gray-400 dark:text-gray-500">
          All prices in USD. Cancel anytime. Questions?{" "}
          <a href="mailto:support@ieltsmaster.ai" className="text-primary underline">
            Contact us
          </a>
        </p>
      </div>
    </div>
  );
}
