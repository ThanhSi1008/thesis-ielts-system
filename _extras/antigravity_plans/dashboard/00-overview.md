# IELTS Dashboard — Implementation Overview

## Purpose

Replace the current minimal `/ielts/dashboard` page (which only embeds `StatisticsContent`) with a **full-featured landing dashboard** that acts as the primary entry point for all IELTS features.

The dashboard should:
1. **Showcase the 4-stage learning roadmap** (Foundation → IELTS Basic → IELTS Advanced → IELTS Intensive) in a visual roadmap format.
2. **Surface additional feature modules** (Roadmap, Calculator, Student/Teacher, Statistics) with descriptive cards.
3. Be **descriptive** — each section tells the user *what's in it*, *how many items*, and provides a *link to go there*.

---

## Target File

**`frontend-web/src/app/ielts/dashboard/page.tsx`** — Currently 19 lines, just wraps `<StatisticsContent embedded hideCharts={true} />` with a "VIEW PROGRESS" link. This will be **completely replaced**.

---

## Architecture

The dashboard page will be refactored into:

```
frontend-web/src/app/ielts/dashboard/
├── page.tsx                        ← Entry, imports DashboardContent
├── DashboardContent.tsx            ← Main layout orchestrator
├── _components/
│   ├── HeroSection.tsx             ← Welcome banner with user info
│   ├── RoadmapTimeline.tsx         ← 4-stage visual roadmap
│   ├── StageCard.tsx               ← Reusable card for each stage
│   ├── FeatureCard.tsx             ← Card for additional features
│   └── QuickStatsBar.tsx           ← Mini stats strip
├── _hooks/
│   └── useDashboardData.ts         ← Data fetching hook (SRP)
└── _constants/
    └── dashboard.constants.ts      ← All config, labels, routes
```

---

## Implementation Phases

| Phase | File | Description |
|-------|------|-------------|
| **Phase 1** | `dashboard.constants.ts` | All static configuration — stage definitions, feature definitions, routes, labels, icon keys |
| **Phase 2** | `useDashboardData.ts` | Custom hook that fetches summary counts from existing APIs (vocab books count, grammar topics count, pronunciation sounds, basic lessons/exercises, advanced parts, intensive exams) |
| **Phase 3** | `StageCard.tsx` | Reusable card component for each learning stage (Foundation, Basic, Advanced, Intensive) |
| **Phase 4** | `RoadmapTimeline.tsx` | The visual 4-stage roadmap with connecting lines and progression indicators |
| **Phase 5** | `FeatureCard.tsx` | Reusable card component for additional features (Roadmap, Calculator, Student/Teacher, Statistics) |
| **Phase 6** | `HeroSection.tsx` | Welcome banner at top of dashboard |
| **Phase 7** | `QuickStatsBar.tsx` | Compact stats strip showing key metrics |
| **Phase 8** | `DashboardContent.tsx` | Main layout orchestrator that composes all components |
| **Phase 9** | `page.tsx` | Final page entry point update |

---

## Key Design Decisions

1. **No new API endpoints needed** — All data comes from existing APIs already used by the individual pages.
2. **SRP enforced** — `useDashboardData` hook handles all fetching; components only render.
3. **Config-driven** — All stage/feature definitions live in constants file (OCP-friendly: add a new feature by adding to the array, no component changes).
4. **ISP enforced** — Components receive only the fields they need, not entire API response objects.
5. **DIP enforced** — Components never call `fetch` or `api` directly; everything flows through the hook.

---

## Existing Routes Referenced

| Route | Purpose |
|-------|---------|
| `/ielts/vocabulary` | Foundation: Vocabulary books |
| `/ielts/grammar` | Foundation: Grammar topics |
| `/ielts/pronunciation` | Foundation: IPA pronunciation chart |
| `/ielts/basic` | IELTS Basic: Lessons & exercises (Listening, Reading, Writing, Speaking) |
| `/ielts/advanced` | IELTS Advanced: Practice by skill (Listening, Reading, Writing, Speaking) |
| `/ielts/intensive` | IELTS Intensive: Full mock tests from Cambridge IELTS books |
| `/ielts/roadmap` | Personalized learning roadmap |
| `/ielts/calculator` | Band score calculator |
| `/ielts/student-teacher` | Student/Teacher connection |
| `/ielts/statistics` | Detailed statistics dashboard |

---

## Proceed

Read the phase files in order: `01-constants.md` → `02-hook.md` → ... → `09-page.md`.
Each file is self-contained with exact code to write and the target file path.
