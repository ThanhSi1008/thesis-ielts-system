# Phase 7 — QuickStatsBar Component

## Target File
`frontend-web/src/app/ielts/dashboard/_components/QuickStatsBar.tsx`

## Purpose
A compact horizontal bar showing key summary metrics at a glance. Provides a quick snapshot of what's available in the system.

## Dependencies
- `lucide-react`
- Counts from `useDashboardData` (passed as props)

---

## Code

```tsx
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
      icon: <FileText className="w-4 h-4 text-blue-500" />,
      label: "IPA Sounds",
      value: pronunciationCount !== null ? String(pronunciationCount) : "44",
    },
    {
      icon: <Headphones className="w-4 h-4 text-violet-500" />,
      label: "Advanced Items",
      value: advancedTotal > 0 ? String(advancedTotal) : "—",
    },
    {
      icon: <Zap className="w-4 h-4 text-orange-500" />,
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
```

---

## Design Notes

1. **4-column grid** on desktop, 2-column on mobile.
2. **Dividers** between items for visual separation.
3. **Graceful null handling** — shows "—" when data is unavailable.
4. **Color-coded icons** match the stage colors (emerald, blue, violet, orange).
5. Component is **under 90 lines** (SRP).

---

## Checklist
- [ ] File created at `frontend-web/src/app/ielts/dashboard/_components/QuickStatsBar.tsx`
- [ ] Pure presentational (SRP)
- [ ] Receives `counts` record (ISP — no full API objects)
- [ ] Under 120 lines
