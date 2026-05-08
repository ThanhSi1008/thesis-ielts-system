"use client";

import React, { useState } from "react";
import { LayoutDashboard, BookOpen, Layers, Target, Activity } from "lucide-react";
import OverviewTab from "./_components/overview/OverviewTab";
import FoundationTab from "./_components/foundation/FoundationTab";
import BasicTab from "./_components/basic/BasicTab";
import AdvancedTab from "./_components/advanced/AdvancedTab";
import IntensiveTab from "./_components/intensive/IntensiveTab";

const TABS = [
  { id: "overview",    label: "Overview",    icon: LayoutDashboard, accent: "#6366f1" },
  { id: "foundation",  label: "Foundation",  icon: BookOpen,        accent: "#10b981" },
  { id: "basic",       label: "Basic",       icon: Layers,          accent: "#3b82f6" },
  { id: "advanced",    label: "Advanced",    icon: Target,          accent: "#8b5cf6" },
  { id: "intensive",   label: "Intensive",   icon: Activity,        accent: "#f59e0b" },
] as const;

type TabId = typeof TABS[number]["id"];

export default function StatisticsContent() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [animKey, setAnimKey] = useState(0);

  const activeAccent = TABS.find(t => t.id === activeTab)?.accent ?? "#6366f1";

  function switchTab(id: TabId) {
    setActiveTab(id);
    setAnimKey(k => k + 1);
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 pt-6 pb-16 px-4">
      <div className="max-w-6xl mx-auto space-y-5">

        {/* ── Premium Tab Bar ── */}
        <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-1.5 flex items-center gap-1 shadow-sm">
          {/* Glow line below active */}
          <div
            className="absolute bottom-0 left-0 right-0 h-px rounded-full opacity-40 blur-sm transition-all duration-500"
            style={{ background: `linear-gradient(90deg, transparent, ${activeAccent}, transparent)` }}
          />
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "text-white shadow-md"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
                style={isActive ? {
                  background: `linear-gradient(135deg, ${tab.accent}ee, ${tab.accent}99)`,
                  boxShadow: `0 4px 14px ${tab.accent}50`,
                } : {}}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Tab Content ── */}
        <div
          key={animKey}
          className="animate-in fade-in slide-in-from-bottom-3 duration-400"
        >
          {activeTab === "overview"   && <OverviewTab />}
          {activeTab === "foundation" && <FoundationTab />}
          {activeTab === "basic"      && <BasicTab />}
          {activeTab === "advanced"   && <AdvancedTab />}
          {activeTab === "intensive"  && <IntensiveTab />}
        </div>
      </div>
    </div>
  );
}
