"use client";

import React from "react";
import { CalendarDays, Zap } from "lucide-react";

interface ExamCountdownProps {
  daysToExam: number | null;
  readinessScore: number | null;
}

function getReadinessColor(score: number): string {
  if (score >= 85) return "#22c55e";
  if (score >= 65) return "#3b82f6";
  if (score >= 45) return "#f59e0b";
  return "#ef4444";
}

export default function ExamCountdown({ daysToExam, readinessScore }: ExamCountdownProps) {
  const color = readinessScore !== null ? getReadinessColor(readinessScore) : "#6366f1";

  return (
    <div className="flex flex-col gap-4">
      {/* Exam Countdown */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
          <CalendarDays className="w-5 h-5 text-indigo-500" />
        </div>
        <div className="flex-1">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Exam Countdown</div>
          {daysToExam !== null && daysToExam > 0 ? (
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-slate-800 dark:text-white">{daysToExam}</span>
              <span className="text-sm font-medium text-slate-500">days left</span>
            </div>
          ) : daysToExam !== null && daysToExam <= 0 ? (
            <div className="text-sm font-bold text-green-500 mt-0.5">Exam day! Good luck 🎓</div>
          ) : (
            <div className="text-sm text-slate-400 mt-0.5">No exam date set</div>
          )}
        </div>
      </div>

      {/* Readiness Score */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5 text-amber-500" />
        </div>
        <div className="flex-1">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Readiness</div>
          {readinessScore !== null ? (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${readinessScore}%`,
                    backgroundColor: color,
                    boxShadow: `0 0 10px ${color}80`,
                  }}
                />
              </div>
              <span className="text-sm font-black" style={{ color }}>
                {readinessScore}%
              </span>
            </div>
          ) : (
            <div className="text-sm text-slate-400 mt-0.5">Complete a mock test to see readiness</div>
          )}
        </div>
      </div>
    </div>
  );
}
