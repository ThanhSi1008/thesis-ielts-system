"use client";

import React, { useEffect, useState } from "react";
import { ieltsStatisticsApi } from "@/services/ielts-statistics.api";
import type { IeltsBasicStats, IeltsBasicSkillStats } from "@/types";
import { Headphones, BookOpen, PenTool, Mic, Award, ChevronDown } from "lucide-react";

const SKILL_ICONS: Record<string, React.ElementType> = {
  Listening: Headphones,
  Reading: BookOpen,
  Writing: PenTool,
  Speaking: Mic,
};

// ---------------------------------------------------------------------------
// Readiness Badge
// ---------------------------------------------------------------------------
function ReadinessBadge({ pct }: { pct: number }) {
  const tier = pct >= 90
    ? { label: "Gold", colorClass: "text-amber-500", bgClass: "bg-amber-500", iconColor: "text-amber-600" }
    : pct >= 60
      ? { label: "Silver", colorClass: "text-slate-500", bgClass: "bg-slate-500", iconColor: "text-slate-600" }
      : { label: "Bronze", colorClass: "text-orange-500", bgClass: "bg-orange-500", iconColor: "text-orange-600" };

  return (
    <div className="relative rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex items-center gap-5">
      <div className={`w-14 h-14 rounded-xl ${tier.bgClass} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center shrink-0`}>
        <Award className={`w-7 h-7 ${tier.iconColor}`} />
      </div>
      <div className="relative flex-1">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
          Basic Readiness
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-800 dark:text-white">{pct}%</span>
          <span className={`text-sm font-bold ${tier.colorClass}`}>
            {tier.label}
          </span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div className={`h-full rounded-full bg-primary transition-all duration-1000`}
            style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skill Row
// ---------------------------------------------------------------------------
function SkillRow({ skill }: { skill: IeltsBasicSkillStats }) {
  const [open, setOpen] = useState(false);
  const Icon = SKILL_ICONS[skill.skillName] ?? BookOpen;
  const pct = skill.completionRate;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all duration-200">
      <button
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
          <Icon size={18} className="text-slate-600 dark:text-slate-300" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{skill.skillName}</span>
            <span className="text-sm font-bold text-slate-800 dark:text-white">{pct}%</span>
          </div>
          <div className="relative h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-1000"
              style={{ width: `${pct}%` }} />
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-medium uppercase tracking-wider">
            {skill.completedItems} / {skill.totalItems} completed
          </div>
        </div>

        <ChevronDown size={18} className={`text-slate-400 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Accordion */}
      <div className="overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: open ? 120 : 0 }}>
        <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Completed", value: String(skill.completedItems) },
              { label: "Total", value: String(skill.totalItems) },
              { label: "Rate", value: `${pct}%` },
            ].map(s => (
              <div key={s.label} className="text-center bg-slate-50 dark:bg-slate-800/50 py-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <div className="text-base font-bold text-slate-800 dark:text-white">{s.value}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BasicSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      {[1, 2, 3, 4].map(i => <div key={i} className="h-24 rounded-xl bg-slate-200 dark:bg-slate-800" />)}
    </div>
  );
}

export default function BasicTab() {
  const [data, setData] = useState<IeltsBasicStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ieltsStatisticsApi.getBasic().then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  if (loading) return <BasicSkeleton />;
  if (!data) return <div className="text-center py-16 text-slate-500 text-sm">Could not load Basic stats.</div>;

  return (
    <div className="space-y-6">
      <ReadinessBadge pct={data.overallReadiness} />

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Skill Progress</h3>
        <span className="text-[11px] text-slate-500 uppercase tracking-wider">Expand for details</span>
      </div>

      <div className="space-y-3">
        {data.skills.map(skill => <SkillRow key={skill.skillId} skill={skill} />)}
      </div>
    </div>
  );
}
