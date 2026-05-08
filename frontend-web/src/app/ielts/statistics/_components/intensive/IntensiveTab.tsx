"use client";

import React, { useEffect, useState } from "react";
import { ieltsStatisticsApi } from "@/services/ielts-statistics.api";
import type { IeltsIntensiveStats } from "@/types";
import { Gauge, BarChart2, ArrowUp, ArrowDown } from "lucide-react";

const SKILL_COLORS: Record<string, { line: string; stop: string }> = {
  listening: { line: "#ec4899", stop: "#fb7185" },
  reading:   { line: "#3b82f6", stop: "#60a5fa" },
  writing:   { line: "#f59e0b", stop: "#fcd34d" },
  speaking:  { line: "#8b5cf6", stop: "#c4b5fd" },
};

// ---------------------------------------------------------------------------
// Band Trend SVG
// ---------------------------------------------------------------------------
function BandTrendChart({ points, label, color, stop }: { points: any[]; label: string; color: string; stop: string }) {
  if (!points || points.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-20 text-slate-300 dark:text-slate-700 text-xs">
        No data
      </div>
    );
  }

  const W = 240; const H = 80; const P = { t: 8, r: 8, b: 18, l: 24 };
  const cW = W - P.l - P.r; const cH = H - P.t - P.b;
  const vals = points.map((p: any) => p.band ?? p);
  const xs = vals.map((_: number, i: number) => P.l + (i / Math.max(vals.length - 1, 1)) * cW);
  const ys = vals.map((v: number) => P.t + cH - ((v - 1) / 8) * cH);
  const pathD = vals.map((_: number, i: number) => `${i === 0 ? "M" : "L"}${xs[i]},${ys[i]}`).join(" ");
  const areaD = `${pathD} L${xs[xs.length - 1]},${P.t + cH} L${xs[0]},${P.t + cH} Z`;
  const latest = vals[vals.length - 1] ?? 0;
  const gradId = `g-${label}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        <span className="text-base font-black" style={{ color }}>{latest.toFixed(1)}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 72 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#${gradId})`} />
        <path d={pathD} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 5px ${color}90)` }} />
        {vals.map((v: number, i: number) => (
          <circle key={i} cx={xs[i]} cy={ys[i]} r="3" fill={color} stroke="white" strokeWidth="1.5"
            style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
        ))}
        {[3, 6, 9].map(b => {
          const y = P.t + cH - ((b - 1) / 8) * cH;
          return <text key={b} x={P.l - 4} y={y + 3} textAnchor="end" fontSize="8" fill="#94a3b8">{b}</text>;
        })}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Score Histogram
// ---------------------------------------------------------------------------
function ScoreDistribution({ distribution }: { distribution: any[] }) {
  if (!distribution || distribution.length === 0) {
    return <div className="text-center py-10 text-slate-400 text-xs">Complete mock tests to see score distribution.</div>;
  }

  const maxCount = Math.max(...distribution.map((d: any) => d.count), 1);
  return (
    <div className="flex items-end gap-1.5 h-28 px-1">
      {distribution.map((d: any) => {
        const hPct = (d.count / maxCount) * 100;
        const color = d.band >= 7 ? "#22c55e" : d.band >= 5.5 ? "#3b82f6" : "#f59e0b";
        return (
          <div key={d.band} className="flex-1 flex flex-col items-center gap-1" title={`Band ${d.band}: ${d.count}x`}>
            <div className="w-full flex flex-col justify-end" style={{ height: 88 }}>
              <div className="w-full rounded-t-lg transition-all duration-700 relative"
                style={{ height: `${hPct}%`, minHeight: d.count > 0 ? 6 : 0, background: `linear-gradient(180deg, ${color}, ${color}80)`, boxShadow: `0 -4px 10px ${color}50` }}>
                <div className="absolute -top-1.5 inset-x-0 h-1.5 rounded-t-sm opacity-60"
                  style={{ background: color, filter: "brightness(1.4)" }} />
              </div>
            </div>
            <span className="text-[9px] font-bold text-slate-400">{d.band}</span>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gauge
// ---------------------------------------------------------------------------
function TimeGauge({ avgSeconds, optimalSeconds }: { avgSeconds: number; optimalSeconds: number }) {
  const ratio = optimalSeconds > 0 ? Math.min(avgSeconds / optimalSeconds, 1.5) : 0;
  const degrees = Math.min(ratio * 120, 180);
  const color = ratio <= 0.8 ? "#22c55e" : ratio <= 1.0 ? "#f59e0b" : "#ef4444";
  const CX = 80; const CY = 72; const R = 56;
  const toRad = (d: number) => ((d - 180) * Math.PI) / 180;
  const nx = CX + R * Math.cos(toRad(degrees));
  const ny = CY + R * Math.sin(toRad(degrees));
  const avgMins = Math.floor(avgSeconds / 60);
  const avgSecs = avgSeconds % 60;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 160 90" className="w-full" style={{ maxWidth: 180 }}>
        <path d={`M${CX - R},${CY} A${R},${R} 0 0 1 ${CX + R},${CY}`}
          fill="none" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" className="dark:stroke-slate-700" />
        <path d={`M${CX - R},${CY} A${R},${R} 0 0 1 ${nx},${ny}`}
          fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color}80)`, transition: "all 1s ease" }} />
        <line x1={CX} y1={CY} x2={nx} y2={ny} stroke={color} strokeWidth="2.5" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${color})`, transition: "all 1s ease" }} />
        <circle cx={CX} cy={CY} r="5" fill={color} />
        <text x={CX - R - 2} y={CY + 15} fontSize="8" fill="#94a3b8" textAnchor="middle">Fast</text>
        <text x={CX + R + 2} y={CY + 15} fontSize="8" fill="#94a3b8" textAnchor="middle">Slow</text>
      </svg>
      <div className="text-center">
        <div className="text-2xl font-black" style={{ color }}>
          {avgSeconds > 0 ? `${avgMins}m ${avgSecs}s` : "—"}
        </div>
        <div className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-wider">Avg time / test</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skill Gap
// ---------------------------------------------------------------------------
function SkillGapCard({ skillGap }: { skillGap: IeltsIntensiveStats["skillGap"] }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm flex items-center gap-6 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(34,197,94,0.05), transparent 60%)" }} />
      <div className="flex flex-col items-center gap-1.5 relative">
        <div className="w-11 h-11 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center shadow-sm">
          <ArrowUp className="w-5 h-5 text-green-500" />
        </div>
        <div className="text-[10px] text-slate-400 uppercase tracking-wide">Best</div>
        <div className="text-sm font-black text-green-500">{skillGap.bestSkill}</div>
      </div>
      <div className="flex-1 text-center relative">
        <div className="text-4xl font-black text-slate-800 dark:text-white">{skillGap.gap.toFixed(1)}</div>
        <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-bold">Band Gap</div>
      </div>
      <div className="flex flex-col items-center gap-1.5 relative">
        <div className="w-11 h-11 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center shadow-sm">
          <ArrowDown className="w-5 h-5 text-red-500" />
        </div>
        <div className="text-[10px] text-slate-400 uppercase tracking-wide">Worst</div>
        <div className="text-sm font-black text-red-500">{skillGap.worstSkill}</div>
      </div>
    </div>
  );
}

function IntensiveSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-40 rounded-2xl bg-slate-100 dark:bg-slate-800" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-52 rounded-3xl bg-slate-100 dark:bg-slate-800" />
        <div className="h-52 rounded-3xl bg-slate-100 dark:bg-slate-800" />
      </div>
      <div className="h-24 rounded-3xl bg-slate-100 dark:bg-slate-800" />
    </div>
  );
}

export default function IntensiveTab() {
  const [data, setData] = useState<IeltsIntensiveStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ieltsStatisticsApi.getIntensive().then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  if (loading) return <IntensiveSkeleton />;

  return (
    <div className="space-y-4">
      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Band Score Trends</div>

      {/* 4 Skill charts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(["listening", "reading", "writing", "speaking"] as const).map(skill => {
          const c = SKILL_COLORS[skill];
          return (
            <div key={skill}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm overflow-hidden relative"
              style={{ borderTopWidth: 3, borderTopColor: c.line }}>
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 100% 0%, ${c.line}10, transparent 60%)` }} />
              <div className="relative">
                <BandTrendChart points={data?.skillTrends[skill] ?? []}
                  label={skill.charAt(0).toUpperCase() + skill.slice(1)} color={c.line} stop={c.stop} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Distribution + Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-green-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Score Distribution</span>
          </div>
          <ScoreDistribution distribution={data?.scoreDistribution ?? []} />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
              <Gauge className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Time Management</span>
          </div>
          <TimeGauge avgSeconds={data?.timeManagement.averageTimeTaken ?? 0} optimalSeconds={data?.timeManagement.optimalTime ?? 10800} />
        </div>
      </div>

      {/* Skill Gap */}
      <SkillGapCard skillGap={data?.skillGap ?? { bestSkill: "—", worstSkill: "—", gap: 0 }} />
    </div>
  );
}
