"use client";

import React, { useState } from "react";
import { LayoutDashboard, BookOpen, Layers, Target, Activity } from "lucide-react";
import OverviewTab from "./_components/overview/OverviewTab";
import FoundationTab from "./_components/foundation/FoundationTab";
import BasicTab from "./_components/basic/BasicTab";
import AdvancedTab from "./_components/advanced/AdvancedTab";
import IntensiveTab from "./_components/intensive/IntensiveTab";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "foundation", label: "Foundation", icon: BookOpen },
  { id: "basic", label: "Basic", icon: Layers },
  { id: "advanced", label: "Advanced", icon: Target },
  { id: "intensive", label: "Intensive", icon: Activity },
] as const;

type TabId = typeof TABS[number]["id"];

export default function StatisticsContent() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [animKey, setAnimKey] = useState(0);

  function switchTab(id: TabId) {
    setActiveTab(id);
    setAnimKey(k => k + 1);
  }

  return (
    <div className="pt-6 pb-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ── Professional Tab Bar ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-1.5 flex items-center gap-1 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className={`relative flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap ${isActive
                    ? "bg-primary text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
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
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "foundation" && <FoundationTab />}
          {activeTab === "basic" && <BasicTab />}
          {activeTab === "advanced" && <AdvancedTab />}
          {activeTab === "intensive" && <IntensiveTab />}
        </div>
      </div>
    </div>
  );
}
