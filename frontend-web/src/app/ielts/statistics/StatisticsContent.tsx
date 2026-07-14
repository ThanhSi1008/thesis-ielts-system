"use client";

import React, { useState } from "react";
import { LayoutDashboard, BookOpen, Layers, Target, Activity } from "lucide-react";
import OverviewTab from "./_components/overview/OverviewTab";
import FoundationTab from "./_components/foundation/FoundationTab";
import BasicTab from "./_components/basic/BasicTab";
import AdvancedTab from "./_components/advanced/AdvancedTab";
import IntensiveTab from "./_components/intensive/IntensiveTab";
import { BAND_TONE_STYLES, type BandTone } from "./_utils/band-tone";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, tone: "primary" as BandTone },
  { id: "foundation", label: "Foundation", icon: BookOpen, tone: "success" as BandTone },
  { id: "basic", label: "Basic", icon: Layers, tone: "info" as BandTone },
  { id: "advanced", label: "Advanced", icon: Target, tone: "warning" as BandTone },
  { id: "intensive", label: "Intensive", icon: Activity, tone: "danger" as BandTone },
] as const;

type TabId = typeof TABS[number]["id"];

export default function StatisticsContent({
  embedded,
  studentId,
}: {
  embedded?: boolean;
  studentId?: string;
} = {}) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [animKey, setAnimKey] = useState(0);

  function switchTab(id: TabId) {
    setActiveTab(id);
    setAnimKey(k => k + 1);
  }

  return (
    <div className="min-h-full bg-slate-50/50 dark:bg-slate-950/50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-16 space-y-8">
        
        {/* ── Header Area ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Statistics
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Analyze your IELTS performance and track your progress.
            </p>
          </div>

          {/* ── Modern Tab Bar ── */}
          <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200/50 dark:border-slate-800 rounded-2xl p-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const tone = BAND_TONE_STYLES[tab.tone];
              return (
                <button
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
                  className={`relative flex items-center justify-center gap-2 py-2 px-5 rounded-xl text-[13px] font-bold transition-all duration-200 whitespace-nowrap ${isActive
                      ? `${tone.bg} ${tone.text} shadow-sm`
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div
          key={animKey}
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          {activeTab === "overview" && <OverviewTab studentId={studentId} />}
          {activeTab === "foundation" && <FoundationTab studentId={studentId} />}
          {activeTab === "basic" && <BasicTab studentId={studentId} />}
          {activeTab === "advanced" && <AdvancedTab studentId={studentId} />}
          {activeTab === "intensive" && <IntensiveTab studentId={studentId} />}
        </div>
      </div>
    </div>
  );
}
