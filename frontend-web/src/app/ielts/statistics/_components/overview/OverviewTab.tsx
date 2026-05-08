"use client";

import React, { useEffect, useState } from "react";
import { ieltsStatisticsApi } from "@/services/ielts-statistics.api";
import type { IeltsOverviewStats } from "@/types";
import BandGapRing from "./BandGapRing";
import ActivityHeatmap from "./ActivityHeatmap";
import DailyGoalTracker from "./DailyGoalTracker";
import ExamCountdown from "./ExamCountdown";
import { TrendingUp, Sparkles, Activity } from "lucide-react";

function OverviewSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

function EmptyBandState() {
  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <TrendingUp className="w-8 h-8 text-slate-400 dark:text-slate-500" />
      </div>
      <p className="text-sm font-medium text-slate-500 text-center max-w-[160px] leading-relaxed">
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
    <div className="space-y-6">

      {/* ── Professional Hero Card ── */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col md:flex-row items-center gap-10">
          {/* Left: Band Gap Ring */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Current Level</div>
            {data?.estimatedBand != null
              ? <BandGapRing estimatedBand={data.estimatedBand} targetBand={data.targetBand} />
              : <EmptyBandState />}
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px self-stretch bg-slate-200 dark:bg-slate-800" />

          {/* Right: Goals and Countdown */}
          <div className="flex-1 w-full space-y-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">IELTS Progress Dashboard</h3>
            </div>

            <ExamCountdown daysToExam={data?.daysToExam ?? null} readinessScore={data?.readinessScore ?? null} />

            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-6">
              <DailyGoalTracker practiced={data?.dailyMinutesPracticed ?? 0} goal={data?.dailyCommitmentMins ?? 30} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Activity Heatmap Card ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Activity className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">Learning Activity (7 Days)</span>
        </div>
        <ActivityHeatmap heatmap={data?.heatmap ?? []} />
      </div>

      {/* ── Recent Activity Feed ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">Recent Activity</span>
        </div>

        {data?.recentActivity && data.recentActivity.length > 0 ? (
          <ol className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-6">
            {data.recentActivity.map((item: any, i: number) => (
              <li key={i} className="ml-6">
                <div className="absolute -left-[9px] mt-1.5 w-4 h-4 rounded-full bg-primary border-2 border-white dark:border-slate-900" />
                <time className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{item.date}</time>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{item.label}</div>
                {item.detail && <div className="text-xs text-slate-500 mt-1">{item.detail}</div>}
              </li>
            ))}
          </ol>
        ) : (
          <div className="text-center py-10">
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No activity yet</p>
            <p className="text-xs text-slate-500 mt-1">Complete a lesson or mock test to see your feed.</p>
          </div>
        )}
      </div>
    </div>
  );
}
