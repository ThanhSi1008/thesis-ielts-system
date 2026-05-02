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
    <div className="flex flex-col gap-6">
      {/* Task 1 / Task 2 toggle */}
      <div className="flex bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-1 rounded-xl max-w-xs">
        {(Object.keys(SUB_TAB_CONFIG) as WritingSubTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => handleSubTabChange(tab)}
            className={`flex-1 py-2 px-4 text-sm font-semibold rounded-lg transition-all ${
              subTab === tab
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {tab === "task1" ? "Task 1" : "Task 2"}
          </button>
        ))}
      </div>

      <BandDescriptorTable
        criteriaLabels={config.criteriaLabels}
        criteriaKeys={config.criteriaKeys}
        descriptors={config.descriptors}
        highlightedBand={highlightedBand}
        onBandSelect={setHighlightedBand}
      />
    </div>
  );
}
