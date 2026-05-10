"use client";
import { useEffect, useState, useCallback } from "react";
import { Users, Crown, Gem, DollarSign, Loader2, ChevronDown } from "lucide-react";
import api from "@/lib/api";
import SubscriptionBadge from "@/components/SubscriptionBadge";
import type { SubscriptionTier } from "@/types";

interface AdminSub {
  id: string;
  tier: SubscriptionTier;
  status: string;
  updatedAt: string;
  currentPeriodEnd: string | null;
  user: { id: string; email: string; firstName: string | null; lastName: string | null };
}

interface Overview {
  stats: { free: number; premium: number; pro: number; totalRevenue: number };
  subscriptions: AdminSub[];
}

type TierFilter = "ALL" | SubscriptionTier;

export default function AdminSubscriptionsPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TierFilter>("ALL");
  const [grantingId, setGrantingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const { data: res } = await api.get<Overview>("/subscriptions/admin/overview");
      setData(res);
    } catch {
      // handled globally
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGrant = async (userId: string, tier: string) => {
    setGrantingId(userId);
    try {
      await api.post("/subscriptions/admin/grant", { userId, tier, durationDays: "30" });
      await fetchData();
    } finally {
      setGrantingId(null);
    }
  };

  const filtered = data?.subscriptions.filter(
    (s) => filter === "ALL" || s.tier === filter,
  ) ?? [];

  const formatRevenue = (cents: number) =>
    `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📊 Subscription Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Monitor user subscriptions and grant access manually.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: Users, label: "Free Users", value: data?.stats.free ?? 0, color: "text-gray-500" },
                { icon: Crown, label: "Premium", value: data?.stats.premium ?? 0, color: "text-amber-500" },
                { icon: Gem, label: "Pro", value: data?.stats.pro ?? 0, color: "text-violet-500" },
                {
                  icon: DollarSign,
                  label: "Revenue",
                  value: formatRevenue(data?.stats.totalRevenue ?? 0),
                  color: "text-green-500",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex items-center gap-4"
                >
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  <div>
                    <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 mb-4">
              {(["ALL", "FREE", "PREMIUM", "PRO"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                    filter === t
                      ? "bg-primary text-gray-900 shadow"
                      : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-primary/50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                    <th className="text-left py-3.5 px-6 font-semibold text-gray-500 dark:text-gray-400">User</th>
                    <th className="text-left py-3.5 px-6 font-semibold text-gray-500 dark:text-gray-400">Tier</th>
                    <th className="text-left py-3.5 px-6 font-semibold text-gray-500 dark:text-gray-400">Status</th>
                    <th className="text-left py-3.5 px-6 font-semibold text-gray-500 dark:text-gray-400">Period End</th>
                    <th className="text-right py-3.5 px-6 font-semibold text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-400 dark:text-gray-600">
                        No subscriptions found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((sub) => {
                      const name =
                        sub.user.firstName && sub.user.lastName
                          ? `${sub.user.firstName} ${sub.user.lastName}`
                          : sub.user.email;
                      return (
                        <tr key={sub.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                          <td className="py-4 px-6">
                            <p className="font-semibold text-gray-900 dark:text-white">{name}</p>
                            <p className="text-xs text-gray-400">{sub.user.email}</p>
                          </td>
                          <td className="py-4 px-6">
                            <SubscriptionBadge tier={sub.tier} size="md" />
                            {sub.tier === "FREE" && (
                              <span className="text-xs text-gray-400">Free</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                sub.status === "ACTIVE"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                  : sub.status === "TRIALING"
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                    : sub.status === "CANCELED"
                                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                                      : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {sub.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gray-500 dark:text-gray-400">
                            {sub.currentPeriodEnd
                              ? new Date(sub.currentPeriodEnd).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="inline-flex items-center gap-1 relative group">
                              <button
                                disabled={grantingId === sub.user.id}
                                className="flex items-center gap-1 text-xs font-semibold bg-primary/10 hover:bg-primary text-primary hover:text-gray-900 px-3 py-1.5 rounded-lg transition-all disabled:opacity-60"
                              >
                                {grantingId === sub.user.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                )}
                                Grant
                              </button>
                              <div className="absolute right-0 top-full mt-1 hidden group-focus-within:block group-hover:block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-10 min-w-[120px]">
                                {["PREMIUM", "PRO"].map((t) => (
                                  <button
                                    key={t}
                                    onClick={() => handleGrant(sub.user.id, t)}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                  >
                                    Grant {t}
                                  </button>
                                ))}
                                <button
                                  onClick={() => handleGrant(sub.user.id, "FREE")}
                                  className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                  Reset to FREE
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
