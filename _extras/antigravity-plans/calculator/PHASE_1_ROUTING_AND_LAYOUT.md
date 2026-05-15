# Phase 1 — Routing, Sidebar Integration & Layout Shell

> **Goal**: Register the `/ielts/calculator` route, add a "Calculator" entry in the IELTS sidebar, and build the page shell with a 4-tab navigation.

---

## Prerequisites
- Familiarity with Phase 0 Overview (`PHASE_0_OVERVIEW.md`)
- Running dev server (`npm run web:dev` from root)

---

## Step 1: Add Sidebar Nav Item

**File**: `frontend-web/src/app/ielts/_components/IeltsSidebar.tsx`

Add a new item to the `NAV_ITEMS` array (insert it between "Statistics" and "Student/Teacher"):

```ts
{
  key: "calculator",
  label: "Calculator",
  shortLabel: "Calc.",
  href: "/ielts/calculator",
  match: (p: string) => p.startsWith("/ielts/calculator"),
  icon: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="10" x2="10" y2="10" />
      <line x1="14" y1="10" x2="16" y2="10" />
      <line x1="8" y1="14" x2="10" y2="14" />
      <line x1="14" y1="14" x2="16" y2="14" />
      <line x1="8" y1="18" x2="16" y2="18" />
    </svg>
  ),
},
```

> **Location**: Insert after the `statistics` item (around line 119) and before the `student-teacher` item (around line 120).

---

## Step 2: Create Route Page

**File**: `frontend-web/src/app/ielts/calculator/page.tsx`

```tsx
"use client";

import React from "react";
import CalculatorContent from "./_components/CalculatorContent";

export default function CalculatorPage() {
  return <CalculatorContent />;
}
```

> **Pattern**: Follows the same pattern as `grammar/page.tsx` — a thin page file that delegates to a Content component. This follows SRP (page only mounts, Content handles logic).

---

## Step 3: Create CalculatorContent Shell

**File**: `frontend-web/src/app/ielts/calculator/_components/CalculatorContent.tsx`

This is the main container. It renders:
1. A page header
2. A 4-tab pill navigation (Listening, Reading, Writing, Speaking)
3. The active tab's child component (placeholder `<div>` for now — real components come in Phases 2–4)

### Implementation Requirements

```tsx
"use client";

import React, { useState } from "react";

// ─── Tab Configuration (OCP: add new tabs here without modifying rendering logic) ───
const CALCULATOR_TABS = [
  { key: "listening", label: "Listening", icon: /* Headphones SVG or lucide-react Headphones */ },
  { key: "reading",   label: "Reading",   icon: /* BookOpen SVG or lucide-react BookOpen */ },
  { key: "writing",   label: "Writing",   icon: /* PenTool SVG or lucide-react PenTool */ },
  { key: "speaking",  label: "Speaking",  icon: /* Mic SVG or lucide-react Mic */ },
] as const;

type TabKey = (typeof CALCULATOR_TABS)[number]["key"];
```

### Tab Navigation UI Spec
- Use a pill-style tab bar similar to `StatisticsContent.tsx` line ~608–618
- Container: `flex bg-slate-50 border border-slate-100 p-1 rounded-lg max-w-lg`
- Active tab: `bg-white border border-slate-200 text-slate-900 shadow-sm`
- Inactive tab: `text-slate-500 hover:text-slate-700`
- Each tab shows its icon + label text
- State: `const [activeTab, setActiveTab] = useState<TabKey>("listening")`

### Page Header Spec
- Title: "IELTS Calculator" (h1, `text-2xl font-bold text-slate-900`)
- Subtitle: "Score conversion tables and band descriptors" (`text-sm text-slate-500 mt-1`)

### Content Area
- Below tabs, render a conditional block:
  ```tsx
  {activeTab === "listening" && <div className="p-8 text-center text-slate-400">Listening Calculator — Phase 2</div>}
  {activeTab === "reading"   && <div className="p-8 text-center text-slate-400">Reading Calculator — Phase 2</div>}
  {activeTab === "writing"   && <div className="p-8 text-center text-slate-400">Writing Descriptors — Phase 3</div>}
  {activeTab === "speaking"  && <div className="p-8 text-center text-slate-400">Speaking Descriptors — Phase 4</div>}
  ```

### Full Container Wrapper
- `<div className="w-full bg-white overflow-y-auto px-4 sm:px-8 py-6 min-h-screen">`
- Inner: `<div className="max-w-6xl mx-auto flex flex-col gap-6">`
- This matches the StatisticsContent pattern (line ~371)

---

## Step 4: Create Directory Structure

Ensure the following directory exists (it will be auto-created by Next.js on file creation):

```
frontend-web/src/app/ielts/calculator/
  page.tsx
  _components/
    CalculatorContent.tsx
```

---

## ✅ Acceptance Criteria

- [ ] Clicking "Calculator" in the IELTS sidebar navigates to `/ielts/calculator`
- [ ] The sidebar item highlights when on the `/ielts/calculator` route
- [ ] The page renders with a heading "IELTS Calculator"
- [ ] 4 tabs (Listening, Reading, Writing, Speaking) are visible and clickable
- [ ] Switching tabs updates the content area with the placeholder text
- [ ] The page layout matches the existing IELTS module aesthetic (white bg, slate borders, consistent spacing)
- [ ] No TypeScript errors

---

## 🚫 Out of Scope
- Actual score table data / rendering (Phase 2)
- Band descriptors (Phase 3–4)
- Animations (Phase 5)
