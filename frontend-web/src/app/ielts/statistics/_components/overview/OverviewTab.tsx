"use client";

import React, { useEffect, useState } from "react";
import { ieltsStatisticsApi } from "@/services/ielts-statistics.api";
import type { IeltsOverviewStats } from "@/types";
import BandGapRing from "./BandGapRing";
import ActivityHeatmap from "./ActivityHeatmap";
import DailyGoalTracker from "./DailyGoalTracker";
import ExamCountdown from "./ExamCountdown";
import { TrendingUp, Sparkles } from "lucide-react";

function OverviewSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-72 rounded-3xl bg-slate-100 dark:bg-slate-800/60" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-44 rounded-3xl bg-slate-100 dark:bg-slate-800/60" />
        <div className="h-44 rounded-3xl bg-slate-100 dark:bg-slate-800/60" />
      </div>
    </div>
  );
}

function EmptyBandState() {
  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
        <TrendingUp className="w-8 h-8 text-indigo-300 dark:text-indigo-700" />
      </div>
      <p className="text-sm font-medium text-slate-400 text-center max-w-[160px] leading-relaxed">
        Complete a mock test to see your estimated band
      </p>
    </div>
  );
}

export default function OverviewTab() {
  const [data, setData] = useState<IeltsOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ieltsStatisticsApi.getOverview().then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  if (loading) return <OverviewSkeleton />;

  return (
    <div className="space-y-4">

      {/* ── Glassmorphic Hero ── */}
      <div className="relative overflow-hidden rounded-3xl p-px"
        style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.4), rgba(139,92,246,0.2), rgba(99,102,241,0.1))" }}>
        <div className="relative rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-6 md:p-8 overflow-hidden">
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)" }} />
          <div className="pointer-events-none absolute -bottom-20 -left-20 w-56 h-56 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(139,92,246,0.10), transparent 70%)" }} />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-10">
            {/* Band Gap Ring */}
            <div className="shrink-0">
              {data?.estimatedBand != null
                ? <BandGapRing estimatedBand={data.estimatedBand} targetBand={data.targetBand} />
                : <EmptyBandState />}
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px self-stretch bg-gradient-to-b from-transparent via-slate-200 dark:via-slate-700 to-transparent" />

            {/* Right side */}
            <div className="flex-1 w-full space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/40">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">IELTS Progress Dashboard</span>
              </div>

              <ExamCountdown daysToExam={data?.daysToExam ?? null} readinessScore={data?.readinessScore ?? null} />

              <div className="border-t border-slate-100 dark:border-slate-800/60 pt-5">
                <DailyGoalTracker practiced={data?.dailyMinutesPracticed ?? 0} goal={data?.dailyCommitmentMins ?? 30} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Activity Heatmap Card ── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          </div>
          <span className="font-bold text-slate-800 dark:text-white text-sm tracking-tight">IELTS Activity — Last 7 Days</span>
        </div>
        <ActivityHeatmap heatmap={data?.heatmap ?? []} />
      </div>

      {/* ── Recent Activity Feed ── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-7 h-7 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
          </div>
          <span className="font-bold text-slate-800 dark:text-white text-sm tracking-tight">Recent Activity</span>
        </div>

        {data?.recentActivity && data.recentActivity.length > 0 ? (
          <ol className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 space-y-5">
            {data.recentActivity.map((item: any, i: number) => (
              <li key={i} className="ml-5">
                <div className="absolute -left-[9px] mt-1.5 w-4 h-4 rounded-full bg-violet-500 border-2 border-white dark:border-slate-900 shadow-md shadow-violet-500/30" />
                <time className="text-[11px] text-slate-400 font-medium">{item.date}</time>
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{item.label}</div>
                {item.detail && <div className="text-xs text-slate-400 mt-0.5">{item.detail}</div>}
              </li>
            ))}
          </ol>
        ) : (
          <div className="text-center py-10 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto">
              <Activity className="w-6 h-6 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-sm font-medium text-slate-400">No activity yet</p>
            <p className="text-xs text-slate-300 dark:text-slate-600">Complete a lesson or mock test to see your feed</p>
          </div>
        )}
      </div>
    </div>
  );
}
