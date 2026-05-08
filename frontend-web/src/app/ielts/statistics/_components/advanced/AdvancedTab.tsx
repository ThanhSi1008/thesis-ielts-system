"use client";

import React, { useEffect, useState } from "react";
import { ieltsStatisticsApi } from "@/services/ielts-statistics.api";
import type { IeltsAdvancedStats } from "@/types";
import { AlertTriangle, ChevronRight, TrendingUp, PenLine, Mic2 } from "lucide-react";

// ---------------------------------------------------------------------------
// Accuracy Dot Heatmap (Question Type × Recent Attempts)
// ---------------------------------------------------------------------------
function AccuracyHeatmap({ heatmap }: { heatmap: any[] }) {
  if (!heatmap || heatmap.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400 text-sm">
        Complete Advanced practice sessions to see your heatmap.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left font-semibold text-slate-400 pb-2 pr-4 min-w-[140px]">
              Question Type
            </th>
            {heatmap[0]?.attempts?.map((_: any, i: number) => (
              <th key={i} className="text-center font-medium text-slate-300 pb-2 px-1">
                #{i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {heatmap.map((row: any) => (
            <tr key={row.type}>
              <td className="py-2 pr-4 font-medium text-slate-600 dark:text-slate-300 capitalize">
                {row.type.replace(/_/g, " ")}
              </td>
              {row.attempts?.map((pct: number, i: number) => {
                const bg =
                  pct >= 80 ? "#22c55e" : pct >= 60 ? "#3b82f6" : pct >= 40 ? "#f59e0b" : "#ef4444";
                return (
                  <td key={i} className="py-2 px-1 text-center">
                    <div
                      className="w-7 h-7 mx-auto rounded-lg flex items-center justify-center text-white font-bold text-[10px]"
                      style={{ backgroundColor: bg + "90" }}
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
      <div className="text-center py-6 text-slate-400 text-sm">
        No weak spots detected yet. Keep practicing!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {weakSpots.slice(0, 3).map((spot: any) => (
        <div
          key={spot.type}
          className="flex items-center gap-4 p-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/60 dark:bg-red-900/10 relative overflow-hidden"
          style={{ boxShadow: "0 0 0 1px rgba(239,68,68,0.15)" }}
        >
          {/* Pulsating border */}
          <div className="absolute inset-0 rounded-xl animate-pulse opacity-20 border border-red-400 pointer-events-none" />
          <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-700 dark:text-slate-200 text-sm capitalize">
              {spot.type?.replace(/_/g, " ")}
            </div>
            <div className="text-xs text-red-500 font-medium">{spot.accuracy}% accuracy</div>
          </div>
          <button className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600 whitespace-nowrap hover:underline">
            Practice <ChevronRight className="w-3 h-3" />
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
      <div className="text-center py-10 text-slate-400 text-sm">
        Need at least 2 sessions to draw a trend.
      </div>
    );
  }

  const W = 500; const H = 120; const PAD = { t: 16, r: 16, b: 24, l: 36 };
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
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 120 }}>
      <defs>
        <linearGradient id="adv-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#adv-grad)" />
      <path d={pathD} stroke="#6366f1" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {trend.map((p: any, i: number) => (
        <circle key={i} cx={xs[i]} cy={ys[i]} r="4" fill="#6366f1" stroke="white" strokeWidth="2" />
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Feedback Summary Card
// ---------------------------------------------------------------------------
function FeedbackSummary({ title, icon, summary }: { title: string; icon: React.ReactNode; summary: any }) {
  const isEmpty = !summary || Object.keys(summary).length === 0;
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
          {icon}
        </div>
        <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{title}</span>
      </div>
      {isEmpty ? (
        <p className="text-xs text-slate-400">
          Submit a graded session to see AI feedback insights here.
        </p>
      ) : (
        <pre className="text-xs text-slate-500 dark:text-slate-400 whitespace-pre-wrap">
          {JSON.stringify(summary, null, 2)}
        </pre>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------
function AdvancedSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800" />
        <div className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800" />
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-5 rounded-full bg-indigo-500" />
        <h3 className="font-bold text-slate-800 dark:text-white text-sm tracking-wide uppercase">
          Advanced Diagnostics
        </h3>
      </div>

      {/* Heatmap */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Question Type Accuracy Heatmap
        </div>
        <AccuracyHeatmap heatmap={data?.heatmap ?? []} />
      </div>

      {/* Weak Spots + Score Trend side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            ⚠️ Weak Spots
          </div>
          <WeakSpotsAlert weakSpots={data?.weakSpots ?? []} />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Score Trend (Last 10 Sessions)
            </div>
          </div>
          <ScoreTrendChart trend={data?.scoreTrend ?? []} />
        </div>
      </div>

      {/* AI Feedback Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FeedbackSummary
          title="Writing AI Feedback"
          icon={<PenLine className="w-4 h-4 text-indigo-500" />}
          summary={data?.writingFeedbackSummary}
        />
        <FeedbackSummary
          title="Speaking AI Feedback"
          icon={<Mic2 className="w-4 h-4 text-indigo-500" />}
          summary={data?.speakingFeedbackSummary}
        />
      </div>
    </div>
  );
}
