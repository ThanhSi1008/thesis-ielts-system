"use client";

import React, { useEffect, useState } from "react";
import { ieltsStatisticsApi } from "@/services/ielts-statistics.api";
import type { IeltsAdvancedStats } from "@/types";
import { AlertTriangle, ChevronRight, TrendingUp, PenLine, Mic2, Target } from "lucide-react";
import { BAND_TONE_STYLES } from "../../_utils/band-tone";

// ---------------------------------------------------------------------------
// Accuracy Dot Heatmap (Question Type × Recent Attempts)
// ---------------------------------------------------------------------------
function AccuracyHeatmap({ heatmap }: { heatmap: any[] }) {
  if (!heatmap || heatmap.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-sm">
        <Target className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
        Complete Advanced sessions to see your heatmap.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto no-scrollbar">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left font-bold text-slate-500 uppercase tracking-widest pb-3 pr-4 min-w-[140px]">
              Question Type
            </th>
            {heatmap[0]?.attempts?.map((_: any, i: number) => (
              <th key={i} className="text-center font-bold text-slate-500 uppercase tracking-widest pb-3 px-1">
                #{i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {heatmap.map((row: any) => (
            <tr key={row.type} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td className="py-2.5 pr-4 font-semibold text-slate-700 dark:text-slate-300 capitalize">
                {row.type.replace(/_/g, " ")}
              </td>
              {row.attempts?.map((pct: number, i: number) => {
                const isHigh = pct >= 80;
                const isMed = pct >= 60;
                const bg = isHigh ? "bg-slate-800 dark:bg-slate-200" : isMed ? "bg-slate-400" : pct >= 40 ? "bg-primary" : "bg-red-500";
                const textColor = isHigh ? "text-white dark:text-slate-900" : (pct >= 40 && pct < 60) ? "text-slate-900" : "text-white";

                return (
                  <td key={i} className="py-2.5 px-1 text-center">
                    <div
                      className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center font-bold text-[10px] ${bg} ${textColor}`}
                      title={`${pct}% accuracy`}
                    >
                      {pct}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Weak Spots Alert Cards
// ---------------------------------------------------------------------------
function WeakSpotsAlert({ weakSpots }: { weakSpots: any[] }) {
  if (!weakSpots || weakSpots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-slate-500 text-sm">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
          <AlertTriangle className="w-5 h-5 text-slate-400 dark:text-slate-500" />
        </div>
        No weak spots detected yet. Keep practicing!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {weakSpots.slice(0, 3).map((spot: any) => (
        <div
          key={spot.type}
          className="group flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-900"
        >
          <div className="relative w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>

          <div className="relative flex-1 min-w-0">
            <div className="font-bold text-slate-800 dark:text-slate-200 text-sm capitalize truncate">
              {spot.type?.replace(/_/g, " ")}
            </div>
            <div className="text-xs font-bold text-slate-500 tracking-wide mt-0.5">{spot.accuracy}% Accuracy</div>
          </div>

          <button className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            Practice
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Score Trend Line Chart (SVG)
// ---------------------------------------------------------------------------
function ScoreTrendChart({ trend }: { trend: any[] }) {
  if (!trend || trend.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-slate-500 text-sm">
        Need at least 2 sessions to draw a trend.
      </div>
    );
  }

  const W = 500; const H = 140; const PAD = { t: 16, r: 16, b: 24, l: 36 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;
  const maxV = Math.max(...trend.map((p: any) => p.accuracy));
  const minV = Math.min(...trend.map((p: any) => p.accuracy));

  const xs = trend.map((_: any, i: number) => PAD.l + (i / (trend.length - 1)) * cW);
  const ys = trend.map((p: any) =>
    PAD.t + cH - ((p.accuracy - minV) / Math.max(maxV - minV, 1)) * cH
  );

  const pathD = trend.map((_: any, i: number) => `${i === 0 ? "M" : "L"}${xs[i]},${ys[i]}`).join(" ");
  const areaD = `${pathD} L${xs[xs.length - 1]},${PAD.t + cH} L${xs[0]},${PAD.t + cH} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full min-h-[140px]">
      <defs>
        <linearGradient id="adv-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#adv-grad)" />
      <path d={pathD} stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {trend.map((p: any, i: number) => (
        <circle key={i} cx={xs[i]} cy={ys[i]} r="4" fill="white" stroke="#475569" strokeWidth="2" />
      ))}
      {/* Dashed baseline */}
      <line x1={PAD.l} y1={PAD.t + cH} x2={W - PAD.r} y2={PAD.t + cH} stroke="#cbd5e1" strokeDasharray="4 4" strokeWidth="1" className="dark:stroke-slate-700" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Feedback Summary Card
// ---------------------------------------------------------------------------
function FeedbackSummary({ title, icon, summary }: { title: string; icon: React.ReactNode; summary: any }) {
  const isEmpty = !summary || Object.keys(summary).length === 0;
  return (
    <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 overflow-hidden">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
          {icon}
        </div>
        <span className="font-bold text-slate-800 dark:text-slate-200">{title}</span>
      </div>

      {isEmpty ? (
        <p className="text-sm text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
          Submit a graded session to see AI feedback insights here.
        </p>
      ) : (
        <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl h-32 overflow-y-auto no-scrollbar">
          <pre className="whitespace-pre-wrap font-sans">
            {JSON.stringify(summary, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------
function AdvancedSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-56 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-56 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main AdvancedTab
// ---------------------------------------------------------------------------
export default function AdvancedTab() {
  const [data, setData] = useState<IeltsAdvancedStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ieltsStatisticsApi
      .getAdvanced()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdvancedSkeleton />;
  const warningTone = BAND_TONE_STYLES.warning;
  const infoTone = BAND_TONE_STYLES.info;
  const dangerTone = BAND_TONE_STYLES.danger;
  const successTone = BAND_TONE_STYLES.success;
  const primaryTone = BAND_TONE_STYLES.primary;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${warningTone.softBg} flex items-center justify-center`}>
            <Target className={`w-5 h-5 ${warningTone.text}`} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Advanced Diagnostics</h3>
            <p className="text-xs text-slate-500">Deep-dive into accuracy, trends, and AI feedback</p>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 overflow-hidden">
        <div className="flex items-center gap-2 mb-6">
          <div className={`w-8 h-8 rounded-lg ${infoTone.softBg} flex items-center justify-center`}>
            <Target className={`w-4 h-4 ${infoTone.text}`} />
          </div>
          <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Question Type Accuracy</div>
        </div>
        <AccuracyHeatmap heatmap={data?.heatmap ?? []} />
      </div>

      {/* Weak Spots + Score Trend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 overflow-hidden">
          <div className="flex items-center gap-2 mb-6">
            <div className={`w-8 h-8 rounded-lg ${dangerTone.softBg} flex items-center justify-center`}>
              <AlertTriangle className={`w-4 h-4 ${dangerTone.text}`} />
            </div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Urgent Weak Spots</div>
          </div>
          <WeakSpotsAlert weakSpots={data?.weakSpots ?? []} />
        </div>

        <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg ${successTone.softBg} flex items-center justify-center`}>
                <TrendingUp className={`w-4 h-4 ${successTone.text}`} />
              </div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Score Trend</div>
            </div>
          </div>
          <div className="flex-1 flex items-center">
            <ScoreTrendChart trend={data?.scoreTrend ?? []} />
          </div>
        </div>
      </div>

      {/* AI Feedback Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeedbackSummary
          title="Writing AI Feedback"
          icon={<PenLine className={`w-5 h-5 ${primaryTone.text}`} />}
          summary={data?.writingFeedbackSummary}
        />
        <FeedbackSummary
          title="Speaking AI Feedback"
          icon={<Mic2 className={`w-5 h-5 ${warningTone.text}`} />}
          summary={data?.speakingFeedbackSummary}
        />
      </div>
    </div>
  );
}
