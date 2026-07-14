"use client";

import React, { useEffect, useState } from "react";
import { ieltsStatisticsApi } from "@/services/ielts-statistics.api";
import type { IeltsIntensiveStats } from "@/types";
import { Gauge, BarChart2, ArrowUp, ArrowDown } from "lucide-react";
import { BAND_TONE_STYLES, getBandTone } from "../../_utils/band-tone";

// ---------------------------------------------------------------------------
// Band Trend SVG
// ---------------------------------------------------------------------------
function BandTrendChart({ points, label }: { points: any[]; label: string }) {
  if (!points || points.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-20 text-slate-400 text-xs">
        No data
      </div>
    );
  }

  const W = 240; const H = 80; const P = { t: 8, r: 8, b: 18, l: 24 };
  const cW = W - P.l - P.r; const cH = H - P.t - P.b;
  const vals = points.map((p: any) => p.band ?? p);
  const latest = vals[vals.length - 1] ?? 0;
  const tone = BAND_TONE_STYLES[getBandTone(latest)];
  const color = tone.hex;
  const xs = vals.map((_: number, i: number) => P.l + (i / Math.max(vals.length - 1, 1)) * cW);
  const ys = vals.map((v: number) => P.t + cH - ((v - 1) / 8) * cH);
  const pathD = vals.map((_: number, i: number) => `${i === 0 ? "M" : "L"}${xs[i]},${ys[i]}`).join(" ");
  const areaD = `${pathD} L${xs[xs.length - 1]},${P.t + cH} L${xs[0]},${P.t + cH} Z`;
  const gradId = `g-${label}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <span className={`text-base font-black ${tone.text}`}>{latest.toFixed(1)}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 72 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#${gradId})`} />
        <path d={pathD} stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {vals.map((v: number, i: number) => (
          <circle key={i} cx={xs[i]} cy={ys[i]} r="3" fill="white" stroke={color} strokeWidth="1.5" />
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
    return <div className="text-center py-10 text-slate-500 text-xs">Complete mock tests to see score distribution.</div>;
  }

  const maxCount = Math.max(...distribution.map((d: any) => d.count), 1);
  return (
    <div className="flex items-end gap-2 h-28 px-1">
      {distribution.map((d: any) => {
        const hPct = (d.count / maxCount) * 100;
        const tone = BAND_TONE_STYLES[getBandTone(Number(d.band))];
        return (
          <div key={d.band} className="flex-1 flex flex-col items-center gap-1 group" title={`Band ${d.band}: ${d.count}x`}>
            <div className="w-full flex flex-col justify-end" style={{ height: 88 }}>
              <div
                className={`w-full rounded-t-md transition-colors duration-300 ${tone.bg} group-hover:opacity-80`}
                style={{ height: `${hPct}%`, minHeight: d.count > 0 ? 6 : 0 }} />
            </div>
            <span className={`text-[10px] font-bold ${tone.text}`}>{d.band}</span>
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
  const gaugeTone = ratio <= 0.8 ? BAND_TONE_STYLES.success : ratio <= 1.0 ? BAND_TONE_STYLES.warning : BAND_TONE_STYLES.danger;
  const color = gaugeTone.hex;
  const CX = 80; const CY = 72; const R = 56;
  const toRad = (d: number) => ((d - 180) * Math.PI) / 180;
  const nx = CX + R * Math.cos(toRad(degrees));
  const ny = CY + R * Math.sin(toRad(degrees));
  const avgMins = Math.floor(avgSeconds / 60);
  const avgSecs = avgSeconds % 60;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 160 90" className="w-full" style={{ maxWidth: 180 }}>
        <path d={`M${CX - R},${CY} A${R},${R} 0 0 1 ${CX + R},${CY}`}
          fill="none" stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round" className="dark:stroke-slate-800" />
        <path d={`M${CX - R},${CY} A${R},${R} 0 0 1 ${nx},${ny}`}
          fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          style={{ transition: "all 1s ease" }} />
        <circle cx={CX} cy={CY} r="6" fill={color} />
        <text x={CX - R - 2} y={CY + 15} fontSize="9" fill="#94a3b8" textAnchor="middle" fontWeight="bold">Fast</text>
        <text x={CX + R + 2} y={CY + 15} fontSize="9" fill="#94a3b8" textAnchor="middle" fontWeight="bold">Slow</text>
      </svg>
      <div className="text-center">
        <div className="text-2xl font-black text-slate-800 dark:text-white">
          {avgSeconds > 0 ? `${avgMins}m ${avgSecs}s` : "—"}
        </div>
        <div className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-wider">Avg time / test</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skill Gap
// ---------------------------------------------------------------------------
function SkillGapCard({ skillGap }: { skillGap: IeltsIntensiveStats["skillGap"] }) {
  const gapTone = skillGap.gap >= 1.5 ? BAND_TONE_STYLES.danger : skillGap.gap >= 0.8 ? BAND_TONE_STYLES.warning : BAND_TONE_STYLES.success;

  return (
    <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 flex items-center gap-6 overflow-hidden">
      <div className="flex flex-col items-center gap-2">
        <div className={`w-10 h-10 rounded-lg ${BAND_TONE_STYLES.success.softBg} flex items-center justify-center`}>
          <ArrowUp className={`w-5 h-5 ${BAND_TONE_STYLES.success.text}`} />
        </div>
        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Best</div>
        <div className="text-sm font-bold text-slate-800 dark:text-white">{skillGap.bestSkill}</div>
      </div>
      <div className="flex-1 text-center relative px-4">
        <div className="h-px bg-slate-200 dark:bg-slate-800 absolute top-1/2 left-0 right-0 -z-10" />
        <div className="bg-white dark:bg-slate-900 inline-block px-4">
          <div className={`text-3xl font-black ${gapTone.text}`}>{skillGap.gap.toFixed(1)}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-bold">Band Gap</div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className={`w-10 h-10 rounded-lg ${BAND_TONE_STYLES.danger.softBg} flex items-center justify-center`}>
          <ArrowDown className={`w-5 h-5 ${BAND_TONE_STYLES.danger.text}`} />
        </div>
        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Worst</div>
        <div className="text-sm font-bold text-slate-800 dark:text-white">{skillGap.worstSkill}</div>
      </div>
    </div>
  );
}

function IntensiveSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

export default function IntensiveTab({ studentId }: { studentId?: string }) {
  const [data, setData] = useState<IeltsIntensiveStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ieltsStatisticsApi.getIntensive(studentId).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <IntensiveSkeleton />;

  const latestBands = (["listening", "reading", "writing", "speaking"] as const)
    .map((skill) => {
      const trend = data?.skillTrends[skill] ?? [];
      const latestPoint = trend[trend.length - 1];
      return latestPoint?.band ?? latestPoint ?? null;
    })
    .filter((v): v is number => typeof v === "number");
  const avgBand = latestBands.length > 0
    ? latestBands.reduce((sum, val) => sum + val, 0) / latestBands.length
    : null;
  const sectionTone = BAND_TONE_STYLES[getBandTone(avgBand)];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">Band Score Trends</h3>
      </div>

      {/* 4 Skill charts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(["listening", "reading", "writing", "speaking"] as const).map(skill => (
          <div key={skill} className="relative bg-white dark:bg-slate-900 rounded-2xl p-5 overflow-hidden">
            <BandTrendChart points={data?.skillTrends[skill] ?? []}
              label={skill.charAt(0).toUpperCase() + skill.slice(1)} />
          </div>
        ))}
      </div>

      {/* Distribution + Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-8 h-8 rounded-lg ${sectionTone.softBg} flex items-center justify-center`}>
              <BarChart2 className={`w-4 h-4 ${sectionTone.text}`} />
            </div>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Score Distribution</span>
          </div>
          <ScoreDistribution distribution={data?.scoreDistribution ?? []} />
        </div>

        <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-8 h-8 rounded-lg ${sectionTone.softBg} flex items-center justify-center`}>
              <Gauge className={`w-4 h-4 ${sectionTone.text}`} />
            </div>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Time Management</span>
          </div>
          <TimeGauge avgSeconds={data?.timeManagement.averageTimeTaken ?? 0} optimalSeconds={data?.timeManagement.optimalTime ?? 10800} />
        </div>
      </div>

      {/* Skill Gap */}
      <SkillGapCard skillGap={data?.skillGap ?? { bestSkill: "—", worstSkill: "—", gap: 0 }} />
    </div>
  );
}
