"use client";

import React, { useState } from "react";
import LiquidFill from "./LiquidFill";

interface FlipCardProps {
  color: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  percentage: number;
  statLabel: string;
  statValue: string;
  backContent: React.ReactNode;
}

export default function FlipCard({
  color,
  icon,
  title,
  subtitle,
  percentage,
  statLabel,
  statValue,
  backContent,
}: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="cursor-pointer"
      style={{ perspective: "1200px", height: 280 }}
      onClick={() => setFlipped((f) => !f)}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <div
        className="relative w-full h-full transition-transform duration-700"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ── FRONT ── */}
        <div
          className="absolute inset-0 rounded-2xl p-5 flex flex-col items-center justify-between bg-white dark:bg-slate-900 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-shadow"
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          {/* Header */}
          <div className="w-full flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: color + "18" }}
            >
              <span style={{ color }}>{icon}</span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800 dark:text-white">{title}</div>
              <div className="text-[11px] text-slate-400">{subtitle}</div>
            </div>
          </div>

          {/* Liquid ring */}
          <LiquidFill percentage={percentage} color={color} size={96} />

          {/* Bottom stat */}
          <div className="w-full text-center">
            <div className="text-xs text-slate-400 uppercase tracking-wider">{statLabel}</div>
            <div className="text-base font-bold mt-0.5" style={{ color }}>
              {statValue}
            </div>
          </div>

          {/* Flip hint */}
          <div className="text-[10px] text-slate-300 dark:text-slate-700 mt-1">
            Hover for details →
          </div>
        </div>

        {/* ── BACK ── */}
        <div
          className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-between bg-white dark:bg-slate-900 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Decorative accent top */}
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
            style={{ backgroundColor: color }}
          />

          <div className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-3">
            {title} — Details
          </div>

          <div className="flex-1 flex flex-col justify-center py-2">
            {backContent}
          </div>

          <div className="text-[10px] text-slate-300 dark:text-slate-700">
            ← Move away to flip back
          </div>
        </div>
      </div>
    </div>
  );
}
