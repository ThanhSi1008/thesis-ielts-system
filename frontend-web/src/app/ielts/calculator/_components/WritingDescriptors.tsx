"use client";

import React, { useState } from "react";
import {
  WRITING_TASK_1_CRITERIA_LABELS,
  WRITING_TASK_1_CRITERIA_KEYS,
  WRITING_TASK_1_DESCRIPTORS,
  WRITING_TASK_2_CRITERIA_LABELS,
  WRITING_TASK_2_CRITERIA_KEYS,
  WRITING_TASK_2_DESCRIPTORS,
} from "@/lib/calculator-data";
import BandDescriptorTable from "./BandDescriptorTable";
import { Layout } from "lucide-react";

type WritingSubTab = "task1" | "task2";

const SUB_TAB_CONFIG: Record<
  WritingSubTab,
  {
    label: string;
    criteriaLabels: string[];
    criteriaKeys: string[];
    descriptors: typeof WRITING_TASK_1_DESCRIPTORS;
  }
> = {
  task1: {
    label: "Writing Task 1",
    criteriaLabels: WRITING_TASK_1_CRITERIA_LABELS,
    criteriaKeys: WRITING_TASK_1_CRITERIA_KEYS,
    descriptors: WRITING_TASK_1_DESCRIPTORS,
  },
  task2: {
    label: "Writing Task 2",
    criteriaLabels: WRITING_TASK_2_CRITERIA_LABELS,
    criteriaKeys: WRITING_TASK_2_CRITERIA_KEYS,
    descriptors: WRITING_TASK_2_DESCRIPTORS,
  },
};

export default function WritingDescriptors() {
  const [subTab, setSubTab] = useState<WritingSubTab>("task1");
  const [highlightedBand, setHighlightedBand] = useState<number | null>(null);

  const handleSubTabChange = (tab: WritingSubTab) => {
    setSubTab(tab);
    setHighlightedBand(null);
  };

  const config = SUB_TAB_CONFIG[subTab];

  return (
    <div className="flex flex-col gap-8">
      {/* Task 1 / Task 2 toggle */}
      <div className="flex flex-col gap-2.5">
        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
          <Layout className="w-4 h-4 text-slate-400" />
          Task Type
        </label>
        <div className="flex bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1.5 rounded-2xl max-w-sm shadow-sm">
          {(["task1", "task2"] as WritingSubTab[]).map((tab) => {
            const isActive = subTab === tab;
            return (
              <button
                key={tab}
                onClick={() => handleSubTabChange(tab)}
                className={`flex-1 py-3 px-6 text-sm font-black rounded-xl transition-all duration-300 uppercase tracking-wider ${
                  isActive
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md border border-slate-200 dark:border-slate-600 scale-[1.02]"
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"
                }`}
              >
                {tab === "task1" ? "Task 1" : "Task 2"}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-2">
        <BandDescriptorTable
          criteriaLabels={config.criteriaLabels}
          criteriaKeys={config.criteriaKeys}
          descriptors={config.descriptors}
          highlightedBand={highlightedBand}
          onBandSelect={setHighlightedBand}
        />
      </div>
    </div>
  );
}

