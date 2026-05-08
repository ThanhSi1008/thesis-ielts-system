"use client";

import React, { useEffect, useState } from "react";

interface BandGapRingProps {
  estimatedBand: number | null;
  targetBand: number | null;
}

function getBandColor(estimated: number, target: number): string {
  const ratio = estimated / target;
  if (ratio >= 0.95) return "#22c55e"; // green
  if (ratio >= 0.80) return "#3b82f6"; // blue
  if (ratio >= 0.65) return "#f59e0b"; // amber
  return "#ef4444"; // red
}

export default function BandGapRing({ estimatedBand, targetBand }: BandGapRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const SIZE = 200;
  const STROKE = 14;
  const RADIUS = (SIZE - STROKE) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  const progress = estimatedBand && targetBand ? Math.min(estimatedBand / targetBand, 1) : 0;
  const color = estimatedBand && targetBand ? getBandColor(estimatedBand, targetBand) : "#6366f1";

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);
    return () => clearTimeout(timeout);
  }, [progress]);

  const strokeDashoffset = CIRCUMFERENCE * (1 - animatedProgress);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        {/* Glow layer */}
        <svg
          width={SIZE}
          height={SIZE}
          className="absolute inset-0 opacity-30 blur-md"
          style={{ filter: `drop-shadow(0 0 12px ${color})` }}
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - animatedProgress)}
            strokeLinecap="round"
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
          />
        </svg>

        {/* Track */}
        <svg width={SIZE} height={SIZE} className="absolute inset-0">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE}
            className="text-slate-100 dark:text-slate-800"
          />
        </svg>

        {/* Progress arc */}
        <svg width={SIZE} height={SIZE} className="absolute inset-0">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black tracking-tight" style={{ color }}>
            {estimatedBand !== null ? estimatedBand.toFixed(1) : "—"}
          </span>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
            Est. Band
          </span>
        </div>
      </div>

      {/* Target info */}
      <div className="flex items-center gap-3 text-sm">
        <div className="text-center">
          <div className="font-bold text-slate-700 dark:text-slate-300">
            {targetBand !== null ? targetBand.toFixed(1) : "—"}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400">Target</div>
        </div>
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
        <div className="text-center">
          <div className="font-bold" style={{ color }}>
            {estimatedBand !== null && targetBand !== null
              ? `+${Math.max(0, targetBand - estimatedBand).toFixed(1)}`
              : "—"}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400">Gap</div>
        </div>
      </div>
    </div>
  );
}
