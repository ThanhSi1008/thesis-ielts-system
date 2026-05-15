# Phase 8 — DashboardContent (Main Orchestrator)

## Target File
`frontend-web/src/app/ielts/dashboard/DashboardContent.tsx`

## Purpose
The main layout component that **composes** all sub-components together. This is the orchestrator — it calls the hook and distributes data to child components.

## Dependencies
- `useDashboardData` from Phase 2
- `STAGES`, `FEATURES` from Phase 1
- `HeroSection` from Phase 6
- `QuickStatsBar` from Phase 7
- `RoadmapTimeline` from Phase 4
- `FeatureCard` from Phase 5

---

## Code

```tsx
// frontend-web/src/app/ielts/dashboard/DashboardContent.tsx

"use client";

import React from "react";
import { useDashboardData } from "./_hooks/useDashboardData";
import { STAGES, FEATURES } from "./_constants/dashboard.constants";
import HeroSection from "./_components/HeroSection";
import QuickStatsBar from "./_components/QuickStatsBar";
import RoadmapTimeline from "./_components/RoadmapTimeline";
import FeatureCard from "./_components/FeatureCard";

export default function DashboardContent() {
  const { counts, loading, error } = useDashboardData();

  return (
    <div className="pt-6 pb-16 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* ── Hero Section ── */}
        <HeroSection />

        {/* ── Quick Stats ── */}
        <QuickStatsBar counts={counts} loading={loading} />

        {/* ── Error Banner (graceful) ── */}
        {error && (
          <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 rounded-xl p-4 text-sm font-medium">
            Some data couldn't be loaded. Counts may be incomplete.
          </div>
        )}

        {/* ── Learning Roadmap (4 Stages) ── */}
        <RoadmapTimeline stages={STAGES} counts={counts} loading={loading} />

        {/* ── Additional Features ── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 rounded-full bg-gradient-to-b from-amber-400 to-violet-500" />
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Tools & Features
              </h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Additional tools to enhance your IELTS preparation
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEATURES.map((feature) => (
              <FeatureCard
                key={feature.id}
                title={feature.title}
                description={feature.description}
                href={feature.href}
                iconKey={feature.iconKey}
                accentColor={feature.accentColor}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
```

---

## Design Notes

1. **Single data source** — `useDashboardData()` is called once here and distributed to children. No child fetches data independently.
2. **Error handling** — A non-blocking amber banner appears if some data fails. The rest of the dashboard still renders.
3. **Consistent spacing** — `space-y-8` between major sections, matching the Statistics page's layout (`StatisticsContent.tsx` uses `space-y-8`).
4. **Max width** — `max-w-5xl` for comfortable reading width, slightly wider than statistics page's `max-w-6xl`.
5. Component is **under 60 lines** — pure orchestration (SRP).

---

## Layout Structure

```
┌─────────────────────────────────────────┐
│             HeroSection                  │
│  (Welcome, description, CTAs)            │
├─────────────────────────────────────────┤
│            QuickStatsBar                 │
│  [ Vocab Books | IPA | Advanced | Mock ] │
├─────────────────────────────────────────┤
│         RoadmapTimeline                  │
│  ┌─── Stage 1: Foundation ───┐           │
│  │ Vocab | Grammar | Pronun. │           │
│  └───────────────────────────┘           │
│              ↓                           │
│  ┌─── Stage 2: Basic ────────┐           │
│  │ L | R | W | S             │           │
│  └───────────────────────────┘           │
│              ↓                           │
│  ┌─── Stage 3: Advanced ─────┐           │
│  │ L | R | W | S             │           │
│  └───────────────────────────┘           │
│              ↓                           │
│  ┌─── Stage 4: Intensive ────┐           │
│  │ L | R | W | S             │           │
│  └───────────────────────────┘           │
├─────────────────────────────────────────┤
│         Tools & Features                 │
│  ┌──────────┐  ┌──────────────┐          │
│  │ Roadmap  │  │ Calculator   │          │
│  └──────────┘  └──────────────┘          │
│  ┌──────────┐  ┌──────────────┐          │
│  │ S/T      │  │ Statistics   │          │
│  └──────────┘  └──────────────┘          │
└─────────────────────────────────────────┘
```

---

## Checklist
- [ ] File created at `frontend-web/src/app/ielts/dashboard/DashboardContent.tsx`
- [ ] Calls `useDashboardData()` once (SRP)
- [ ] Distributes data to children via props (DIP — children don't import APIs)
- [ ] Imports from `_constants` for STAGES and FEATURES (OCP)
- [ ] Under 120 lines
