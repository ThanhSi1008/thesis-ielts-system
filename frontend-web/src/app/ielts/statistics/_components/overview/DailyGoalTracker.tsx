"use client";

import React from "react";
import { Clock } from "lucide-react";

interface DailyGoalTrackerProps {
  practiced: number;
  goal: number;
}

export default function DailyGoalTracker({ practiced, goal }: DailyGoalTrackerProps) {
  const ratio = goal > 0 ? Math.min(practiced / goal, 1) : 0;
  const pct = Math.round(ratio * 100);
  const met = pct >= 100;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${met ? "bg-green-100 dark:bg-green-900/30" : "bg-primary/10"}`}>
            <Clock className={`w-4 h-4 ${met ? "text-green-500" : "text-primary"}`} />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Daily IELTS Goal</div>
            <div className="text-xs text-slate-400">{practiced} / {goal} min today</div>
          </div>
        </div>
        <div className={`text-lg font-black ${met ? "text-green-500" : "text-primary"}`}>
          {pct}%
        </div>
      </div>

      {/* Track */}
      <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${met ? "bg-green-400" : "bg-primary"}`}
          style={{
            width: `${pct}%`,
            boxShadow: met
              ? "0 0 12px rgba(34,197,94,0.6)"
              : "0 0 12px rgba(99,102,241,0.5)",
          }}
        />
      </div>

      {met && (
        <div className="text-xs font-semibold text-green-500 text-center animate-in fade-in">
          🎉 Daily goal achieved!
        </div>
      )}
    </div>
  );
}
