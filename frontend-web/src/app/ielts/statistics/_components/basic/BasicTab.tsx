"use client";

import React, { useEffect, useState } from "react";
import { ieltsStatisticsApi } from "@/services/ielts-statistics.api";
import type { IeltsBasicStats, IeltsBasicSkillStats } from "@/types";
import { Headphones, BookOpen, PenTool, Mic, Award, ChevronDown } from "lucide-react";

const SKILL_CONFIG: Record<string, { gradient: string; glow: string; icon: React.ElementType }> = {
  Listening: { gradient: "from-pink-500 to-rose-400",    glow: "rgba(236,72,153,0.35)",  icon: Headphones },
  Reading:   { gradient: "from-blue-500 to-sky-400",     glow: "rgba(59,130,246,0.35)",  icon: BookOpen },
  Writing:   { gradient: "from-amber-500 to-yellow-400", glow: "rgba(245,158,11,0.35)",  icon: PenTool },
  Speaking:  { gradient: "from-violet-500 to-purple-400",glow: "rgba(139,92,246,0.35)",  icon: Mic },
};

// ---------------------------------------------------------------------------
// Readiness Badge
// ---------------------------------------------------------------------------
function ReadinessBadge({ pct }: { pct: number }) {
  const tier = pct >= 90
    ? { label: "Gold",   gradient: "from-yellow-300 via-amber-400 to-yellow-500", glow: "#f59e0b", text: "text-amber-900" }
    : pct >= 60
    ? { label: "Silver", gradient: "from-slate-300 via-slate-400 to-slate-300",   glow: "#94a3b8", text: "text-slate-700" }
    : { label: "Bronze", gradient: "from-orange-300 via-orange-400 to-amber-600", glow: "#f97316", text: "text-orange-900" };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm flex items-center gap-5">
      {/* Subtle glow background */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 0% 50%, ${tier.glow}18, transparent 60%)` }} />
      <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center shadow-lg shrink-0`}
        style={{ boxShadow: `0 8px 24px ${tier.glow}50` }}>
        <Award className={`w-8 h-8 ${tier.text}`} />
      </div>
      <div className="relative flex-1">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
          Basic Readiness
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-slate-800 dark:text-white">{pct}%</span>
          <span className={`text-sm font-bold ${pct >= 90 ? "text-amber-500" : pct >= 60 ? "text-slate-400" : "text-orange-500"}`}>
            {tier.label}
          </span>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div className={`h-full rounded-full bg-gradient-to-r ${tier.gradient} transition-all duration-1000`}
            style={{ width: `${pct}%`, boxShadow: `0 0 10px ${tier.glow}` }} />
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
  const cfg = SKILL_CONFIG[skill.skillName] ?? SKILL_CONFIG["Reading"];
  const Icon = cfg.icon;
  const pct = skill.completionRate;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm group transition-all duration-200 hover:shadow-md">
      <button
        className="w-full flex items-center gap-4 p-5 text-left"
        onClick={() => setOpen(o => !o)}
      >
        {/* Icon with gradient bg */}
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shrink-0 shadow-md`}
          style={{ boxShadow: `0 4px 12px ${cfg.glow}` }}>
          <Icon size={18} className="text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{skill.skillName}</span>
            <span className="text-sm font-black text-slate-800 dark:text-white">{pct}%</span>
          </div>
          {/* Shimmer bar */}
          <div className="relative h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${cfg.gradient} transition-all duration-1000`}
              style={{ width: `${pct}%`, boxShadow: `0 0 8px ${cfg.glow}` }} />
            {pct > 0 && (
              <div className="absolute inset-y-0 left-0 rounded-full animate-shimmer"
                style={{ width: `${pct}%`, background: "linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.4) 50%,transparent 100%)", backgroundSize: "200% 100%" }} />
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-1.5 font-medium">
            {skill.completedItems} of {skill.totalItems} items completed
          </div>
        </div>

        <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Accordion */}
      <div className="overflow-hidden transition-all duration-500 ease-in-out" style={{ maxHeight: open ? 120 : 0 }}>
        <div className="px-5 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/60">
          <div className="grid grid-cols-3 gap-4 pt-2">
            {[
              { label: "Completed", value: String(skill.completedItems) },
              { label: "Total Items", value: String(skill.totalItems) },
              { label: "Completion", value: `${pct}%` },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-lg font-black text-slate-800 dark:text-white">{s.value}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">{s.label}</div>
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
    <div className="space-y-3 animate-pulse">
      <div className="h-28 rounded-3xl bg-slate-100 dark:bg-slate-800" />
      {[1, 2, 3, 4].map(i => <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800" />)}
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
  if (!data) return <div className="text-center py-16 text-slate-400 text-sm">Could not load Basic stats.</div>;

  return (
    <div className="space-y-4">
      <ReadinessBadge pct={data.overallReadiness} />

      <div className="flex items-center justify-between pt-1">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Skill Progress</div>
        <span className="text-[11px] text-slate-400">Click to expand details</span>
      </div>

      <div className="space-y-3">
        {data.skills.map(skill => <SkillRow key={skill.skillId} skill={skill} />)}
      </div>
    </div>
  );
}
