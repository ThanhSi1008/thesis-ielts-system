# Phase 9 — Page Entry Point

## Target File
`frontend-web/src/app/ielts/dashboard/page.tsx` (OVERWRITE existing)

## Purpose
Update the page entry point to use the new `DashboardContent` component. This replaces the current implementation that only shows embedded `StatisticsContent`.

## Current Code (to be replaced)
```tsx
"use client";

import React from "react";
import StatisticsContent from "@/app/ielts/statistics/StatisticsContent";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      <StatisticsContent embedded hideCharts={true} />
      <div className="px-4 sm:px-8 max-w-6xl w-full mx-auto pb-8 -mt-6">
        <Link href="/ielts/statistics" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-slate-800 text-white font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-slate-700 transition-all shadow-sm">
          VIEW PROGRESS
        </Link>
      </div>
    </div>
  );
}
```

## New Code

```tsx
// frontend-web/src/app/ielts/dashboard/page.tsx

"use client";

import React from "react";
import DashboardContent from "./DashboardContent";

export default function DashboardPage() {
  return <DashboardContent />;
}
```

---

## Notes

1. The page file is kept minimal — it just imports and renders `DashboardContent`. This follows Next.js conventions where `page.tsx` is a thin wrapper.
2. `StatisticsContent` is no longer embedded in the dashboard. Users access statistics via the dedicated `/ielts/statistics` page or the feature card link on the dashboard.
3. The `"use client"` directive is kept because `DashboardContent` uses hooks.

---

## Post-Implementation Verification

After implementing all 9 phases, verify:

1. **Navigate to `/ielts/dashboard`** — should show the new dashboard
2. **Hero section** — personalized greeting if logged in
3. **Quick stats bar** — shows counts (or dashes for unavailable data)
4. **4 Stage cards** — each with sub-items, counts, and working links:
   - Foundation → Vocabulary, Grammar, Pronunciation links work
   - Basic → `/ielts/basic` link works
   - Advanced → `/ielts/advanced` link works
   - Intensive → `/ielts/intensive` link works
5. **Stage connectors** — visible on desktop between stage cards
6. **Feature cards** — all 4 features with working links:
   - Roadmap → `/ielts/roadmap`
   - Calculator → `/ielts/calculator`
   - Student/Teacher → `/ielts/student-teacher`
   - Statistics → `/ielts/statistics`
7. **Dark mode** — toggle dark mode and verify all sections render correctly
8. **Mobile responsive** — resize to mobile and verify layout stacks properly
9. **Loading state** — skeleton cards appear while data loads

---

## File Summary

After all phases are implemented, the file structure should be:

```
frontend-web/src/app/ielts/dashboard/
├── page.tsx                                    ← Phase 9 (overwritten)
├── DashboardContent.tsx                        ← Phase 8
├── _components/
│   ├── HeroSection.tsx                         ← Phase 6
│   ├── RoadmapTimeline.tsx                     ← Phase 4
│   ├── StageCard.tsx                           ← Phase 3
│   ├── FeatureCard.tsx                         ← Phase 5
│   └── QuickStatsBar.tsx                       ← Phase 7
├── _hooks/
│   └── useDashboardData.ts                     ← Phase 2
└── _constants/
    └── dashboard.constants.ts                  ← Phase 1
```

Total: **9 files**, each with a clear single responsibility.

---

## Checklist
- [ ] `page.tsx` overwritten with new minimal wrapper
- [ ] Old `StatisticsContent` import removed
- [ ] All 9 files exist and compile without errors
- [ ] Navigation from sidebar "Dashboard" link works
- [ ] All internal links navigate correctly
