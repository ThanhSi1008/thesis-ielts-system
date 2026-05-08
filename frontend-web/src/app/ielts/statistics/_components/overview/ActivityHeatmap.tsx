"use client";

import React, { useState } from "react";

interface HeatmapDay {
  date: string;
  minutes: number;
}

interface ActivityHeatmapProps {
  heatmap: HeatmapDay[];
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getIntensityClass(minutes: number): string {
  if (minutes === 0) return "bg-slate-100 dark:bg-slate-800";
  if (minutes < 15) return "bg-primary/20";
  if (minutes < 30) return "bg-primary/40";
  if (minutes < 60) return "bg-primary/70";
  return "bg-primary";
}

export default function ActivityHeatmap({ heatmap }: ActivityHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ day: HeatmapDay; x: number; y: number } | null>(null);

  return (
    <div className="relative">
      <div className="flex gap-2 items-center">
        {heatmap.map((day, i) => (
          <div key={day.date} className="flex flex-col items-center gap-1.5 flex-1">
            <div
              onMouseEnter={(e) => {
                const rect = (e.target as HTMLElement).getBoundingClientRect();
                setTooltip({ day, x: rect.left + rect.width / 2, y: rect.top });
              }}
              onMouseLeave={() => setTooltip(null)}
              className={`w-full h-8 rounded-full transition-all duration-300 cursor-default hover:scale-110 hover:brightness-110 ${getIntensityClass(day.minutes)}`}
            />
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
              {DAY_LABELS[i % 7]}
            </span>
          </div>
        ))}
      </div>

      {/* Floating glass tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y - 8,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-xl text-xs">
            <div className="font-bold text-slate-800 dark:text-white">
              {new Date(tooltip.day.date).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </div>
            <div className="text-slate-500 dark:text-slate-400 mt-0.5">
              {tooltip.day.minutes > 0
                ? `${tooltip.day.minutes} min studied`
                : "No activity"}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-[10px] text-slate-400">Less</span>
        {[0, 15, 30, 60, 90].map((v) => (
          <div
            key={v}
            className={`w-4 h-4 rounded-full ${getIntensityClass(v)}`}
          />
        ))}
        <span className="text-[10px] text-slate-400">More</span>
      </div>
    </div>
  );
}
