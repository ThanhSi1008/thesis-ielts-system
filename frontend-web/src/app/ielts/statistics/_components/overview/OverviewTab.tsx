"use client";

import React, { useEffect, useState } from "react";
import { ieltsStatisticsApi } from "@/services/ielts-statistics.api";
import type { IeltsOverviewStats } from "@/types";
import BandGapRing from "./BandGapRing";
import ActivityHeatmap from "./ActivityHeatmap";
import DailyGoalTracker from "./DailyGoalTracker";
import ExamCountdown from "./ExamCountdown";
import { TrendingUp, Sparkles, Activity } from "lucide-react";
import { BAND_TONE_STYLES, getBandTone } from "../../_utils/band-tone";

function StatCard({ label, value, subValue, icon: Icon, tone }: { label: string, value: string, subValue: string, icon: any, tone: any }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm flex items-center gap-5 border border-slate-200/40 dark:border-slate-800/40">
      <div className={`w-14 h-14 rounded-2xl ${tone.softBg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-7 h-7 ${tone.text}`} />
      </div>
      <div>
        <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</div>
        <div className="text-xl font-black text-slate-900 dark:text-white leading-none">{value}</div>
        <div className="text-[11px] font-bold text-slate-400 mt-1.5">{subValue}</div>
      </div>
    </div>
  );
}

export default function OverviewTab({ studentId }: { studentId?: string }) {
  const [data, setData] = useState<IeltsOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ieltsStatisticsApi.getOverview(studentId).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <OverviewSkeleton />;

  const overviewTone = BAND_TONE_STYLES[getBandTone(data?.estimatedBand)];

  return (
    <div className="space-y-8">

      {/* ── Top Row: Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Estimated Band"
          value={data?.estimatedBand?.toFixed(1) || "—"}
          subValue={`Target: ${data?.targetBand?.toFixed(1) || "—"}`}
          icon={TrendingUp}
          tone={overviewTone}
        />
        <StatCard
          label="Practice Time"
          value={`${data?.dailyMinutesPracticed || 0}m`}
          subValue={`Goal: ${data?.dailyCommitmentMins || 30}m today`}
          icon={Activity}
          tone={BAND_TONE_STYLES.info}
        />
        <StatCard
          label="Tests Taken"
          value={String(data?.testsTaken ?? 0)}
          subValue={`+${data?.testsThisWeek ?? 0} this week`}
          icon={Sparkles}
          tone={BAND_TONE_STYLES.success}
        />
        <StatCard
          label="Exam Prep"
          value={data?.readinessScore ? `${data.readinessScore}%` : "—"}
          subValue={data?.daysToExam ? `${data.daysToExam} days left` : "No exam date"}
          icon={TrendingUp}
          tone={BAND_TONE_STYLES.warning}
        />
      </div>

      {/* ── Middle Row: Trends & Distribution ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Chart Area (2/3) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200/40 dark:border-slate-800/40">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 tracking-tight">Progress Over Time</h3>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Last 6 Months</div>
          </div>
          {/* Bar Chart from real data */}
          <div className="h-[240px] flex items-end justify-between gap-4 px-2">
            {(data?.progressOverTime ?? []).map((pt: any, i: number) => {
              const maxBand = 9;
              const hPct = pt.band != null ? Math.round((pt.band / maxBand) * 100) : 0;
              const hasData = pt.band != null && pt.count > 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                  <div className="w-full relative flex flex-col items-center justify-end" style={{ height: '100%' }}>
                    {hasData && (
                      <div className="text-[10px] font-bold text-slate-500 mb-1">
                        {pt.band.toFixed(1)}
                      </div>
                    )}
                    <div 
                      className={`w-full rounded-t-xl transition-all duration-500 group-hover:opacity-80 ${hasData ? overviewTone.bg : "bg-slate-100 dark:bg-slate-800"}`} 
                      style={{ height: `${hPct}%`, minHeight: hasData ? 8 : 4 }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    {pt.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Skill Balance (1/3) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200/40 dark:border-slate-800/40 flex flex-col items-center">
          <div className="w-full mb-8">
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 tracking-tight">Current Level</h3>
          </div>
          {data?.estimatedBand != null
            ? <BandGapRing estimatedBand={data.estimatedBand} targetBand={data.targetBand} />
            : <EmptyBandState />}
        </div>
      </div>

      {/* ── Bottom Row: Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Heatmap (2/3) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200/40 dark:border-slate-800/40">
          <div className="flex items-center gap-3 mb-8">
            <div className={`w-8 h-8 rounded-lg ${overviewTone.softBg} flex items-center justify-center`}>
              <Activity className={`w-4 h-4 ${overviewTone.text}`} />
            </div>
            <span className="font-black text-slate-800 dark:text-slate-200 text-sm tracking-tight">Learning Activity</span>
          </div>
          <ActivityHeatmap heatmap={data?.heatmap ?? []} />
        </div>

        {/* Recent Feed (1/3) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200/40 dark:border-slate-800/40">
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 tracking-tight mb-8">Recent History</h3>
          {data?.recentActivity && data.recentActivity.length > 0 ? (
            <div className="space-y-6">
              {data.recentActivity.slice(0, 4).map((item: any, i: number) => (
                <div key={i} className="flex gap-4">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${overviewTone.bg}`} />
                  <div>
                    <div className="text-[13px] font-bold text-slate-800 dark:text-slate-200 leading-tight">{item.label}</div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">{item.date}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm font-bold text-slate-500">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 rounded-3xl bg-slate-200 dark:bg-slate-800" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 rounded-3xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-80 rounded-3xl bg-slate-200 dark:bg-slate-800" />
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
