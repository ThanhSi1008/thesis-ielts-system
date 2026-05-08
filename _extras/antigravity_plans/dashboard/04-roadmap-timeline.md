# Phase 4 — RoadmapTimeline Component

## Target File
`frontend-web/src/app/ielts/dashboard/_components/RoadmapTimeline.tsx`

## Purpose
The **hero section of the dashboard** — a visual roadmap showing the 4-stage learning progression (Foundation → Basic → Advanced → Intensive) with connecting lines between stages. This is the primary visual that communicates the learning path.

## Dependencies
- `StageCard` from Phase 3
- Types from `dashboard.constants.ts`
- Counts data from `useDashboardData` (passed in as props, **not** fetched here)

---

## Props Interface

```typescript
interface RoadmapTimelineProps {
  stages: StageDefinition[];
  counts: Record<string, number | null>;
  loading: boolean;
}
```

---

## Code

```tsx
// frontend-web/src/app/ielts/dashboard/_components/RoadmapTimeline.tsx

"use client";

import React from "react";
import StageCard from "./StageCard";
import type { StageDefinition } from "../_constants/dashboard.constants";

interface RoadmapTimelineProps {
  stages: StageDefinition[];
  counts: Record<string, number | null>;
  loading: boolean;
}

function StageCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden animate-pulse">
      <div className="h-1.5 w-full bg-gray-200 dark:bg-slate-800" />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-800" />
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-gray-200 dark:bg-slate-800 rounded w-1/3" />
            <div className="h-3 bg-gray-100 dark:bg-slate-800/60 rounded w-1/2" />
          </div>
        </div>
        <div className="h-4 bg-gray-100 dark:bg-slate-800/60 rounded w-full" />
        <div className="h-4 bg-gray-100 dark:bg-slate-800/60 rounded w-3/4" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-50 dark:bg-slate-800/40 rounded-xl" />
          ))}
        </div>
        <div className="h-10 bg-gray-200 dark:bg-slate-800 rounded-xl w-40" />
      </div>
    </div>
  );
}

/**
 * Connector line between stages.
 * Only visible on desktop (≥ md). On mobile, stages stack vertically.
 */
function StageConnector({ gradientFrom, gradientTo }: { gradientFrom: string; gradientTo: string }) {
  return (
    <div className="hidden md:flex items-center justify-center py-2">
      <div className="flex flex-col items-center gap-1">
        <div className={`w-0.5 h-8 bg-gradient-to-b ${gradientFrom} ${gradientTo} opacity-40`} />
        <svg
          className="w-4 h-4 text-gray-300 dark:text-slate-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
        <div className={`w-0.5 h-8 bg-gradient-to-b ${gradientFrom} ${gradientTo} opacity-40`} />
      </div>
    </div>
  );
}

// Gradient pairs for connectors (between adjacent stages)
const CONNECTOR_GRADIENTS = [
  { from: "from-emerald-400", to: "to-blue-500" },
  { from: "from-blue-400", to: "to-violet-500" },
  { from: "from-violet-400", to: "to-orange-500" },
];

export default function RoadmapTimeline({ stages, counts, loading }: RoadmapTimelineProps) {
  return (
    <section>
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 rounded-full bg-gradient-to-b from-emerald-500 to-red-500" />
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Learning Roadmap
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Follow the 4-stage path from Foundation to IELTS Intensive
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {loading
          ? [1, 2, 3, 4].map((i) => (
              <React.Fragment key={i}>
                <StageCardSkeleton />
                {i < 4 && (
                  <div className="hidden md:flex items-center justify-center py-2">
                    <div className="w-0.5 h-16 bg-gray-200 dark:bg-slate-800 animate-pulse" />
                  </div>
                )}
              </React.Fragment>
            ))
          : stages.map((stage, index) => {
              // Build sub-items with counts injected
              const subItemsWithCounts = stage.subItems.map((sub) => ({
                ...sub,
                count: counts[sub.dataKey] ?? null,
              }));

              return (
                <React.Fragment key={stage.id}>
                  <StageCard
                    stageNumber={stage.stageNumber}
                    title={stage.title}
                    subtitle={stage.subtitle}
                    description={stage.description}
                    badge={stage.badge}
                    href={stage.href}
                    ctaLabel={stage.ctaLabel}
                    gradientClass={stage.gradientClass}
                    subItems={subItemsWithCounts}
                  />
                  {/* Connector between stages */}
                  {index < stages.length - 1 && (
                    <StageConnector
                      gradientFrom={CONNECTOR_GRADIENTS[index].from}
                      gradientTo={CONNECTOR_GRADIENTS[index].to}
                    />
                  )}
                </React.Fragment>
              );
            })}
      </div>
    </section>
  );
}
```

---

## Design Notes

1. **Vertical timeline layout** — stages stack vertically with arrow connectors between them. This naturally communicates the progression path.
2. **Connectors** are gradient lines transitioning from one stage's color to the next (emerald→blue→violet→orange).
3. **Mobile responsive** — connectors are hidden on mobile; stages simply stack.
4. **Loading state** — skeleton cards maintain layout stability.
5. The component **does not fetch data** — it receives `stages` (from constants) and `counts` (from hook) as props.

---

## Checklist
- [ ] File created at `frontend-web/src/app/ielts/dashboard/_components/RoadmapTimeline.tsx`
- [ ] Component only renders UI (SRP)
- [ ] Receives `counts` as a record, maps to sub-items (ISP — no large objects passed down)
- [ ] Under 120 lines
