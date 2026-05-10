// frontend-web/src/app/ielts/dashboard/_components/QuickStatsBar.tsx

"use client";

import React from "react";
import { BookOpen, Headphones, FileText, Zap } from "lucide-react";

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatItem({ icon, label, value }: StatItemProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-lg font-extrabold text-gray-900 dark:text-white leading-none">
          {value}
        </div>
        <div className="text-[11px] font-medium text-gray-400 dark:text-slate-500 mt-0.5">
          {label}
        </div>
      </div>
    </div>
  );
}

interface QuickStatsBarProps {
  counts: Record<string, number | null>;
  loading: boolean;
}

export default function QuickStatsBar({ counts, loading }: QuickStatsBarProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-2 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-gray-50 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const vocabCount = counts.vocabularyBookCount;
  const pronunciationCount = counts.pronunciationSoundCount;
  const advancedTotal =
    (counts.advancedListeningCount ?? 0) + (counts.advancedReadingCount ?? 0);
  const intensiveTotal =
    (counts.intensiveListeningCount ?? 0) + (counts.intensiveReadingCount ?? 0);

  const stats: StatItemProps[] = [
    {
      icon: <BookOpen className="w-4 h-4 text-emerald-500" />,
      label: "Vocab Books",
      value: vocabCount !== null ? String(vocabCount) : "—",
    },
    {
      icon: <FileText className="w-4 h-4 text-teal-500" />,
      label: "IPA Sounds",
      value: pronunciationCount !== null ? String(pronunciationCount) : "44",
    },
    {
      icon: <Headphones className="w-4 h-4 text-amber-500" />,
      label: "Advanced Items",
      value: advancedTotal > 0 ? String(advancedTotal) : "—",
    },
    {
      icon: <Zap className="w-4 h-4 text-red-500" />,
      label: "Mock Tests",
      value: intensiveTotal > 0 ? String(intensiveTotal) : "—",
    },
  ];

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 dark:divide-slate-800">
        {stats.map((stat) => (
          <StatItem key={stat.label} {...stat} />
        ))}
      </div>
    </section>
  );
}
