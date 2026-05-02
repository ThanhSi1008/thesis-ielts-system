# Phase 2 — Listening & Reading Score Tables

> **Goal**: Build interactive score conversion tables for Listening and Reading, where entering a raw score OR band score highlights the corresponding row.

---

## Prerequisites
- Phase 1 complete (route and tabs working)

---

## Step 1: Create Data Constants

**File**: `frontend-web/src/lib/calculator-data.ts`

Define all score mapping data as named constants. **No hardcoding in components.**

```ts
// ─── Types ───
export interface ScoreRow {
  /** e.g. [39, 40] means "39–40" */
  rawRange: [number, number];
  /** Display label, e.g. "39–40" */
  rawLabel: string;
  band: number;
}

// ─── Listening Score Table ───
export const LISTENING_SCORE_TABLE: ScoreRow[] = [
  { rawRange: [39, 40], rawLabel: "39–40", band: 9 },
  { rawRange: [37, 38], rawLabel: "37–38", band: 8.5 },
  { rawRange: [35, 36], rawLabel: "35–36", band: 8 },
  { rawRange: [32, 34], rawLabel: "32–34", band: 7.5 },
  { rawRange: [30, 31], rawLabel: "30–31", band: 7 },
  { rawRange: [26, 29], rawLabel: "26–29", band: 6.5 },
  { rawRange: [23, 25], rawLabel: "23–25", band: 6 },
  { rawRange: [18, 22], rawLabel: "18–22", band: 5.5 },
  { rawRange: [16, 17], rawLabel: "16–17", band: 5 },
  { rawRange: [13, 15], rawLabel: "13–15", band: 4.5 },
  { rawRange: [11, 12], rawLabel: "11–12", band: 4 },
  { rawRange: [8, 10],  rawLabel: "8–10",  band: 3.5 },
  { rawRange: [6, 7],   rawLabel: "6–7",   band: 3 },
  { rawRange: [4, 5],   rawLabel: "4–5",   band: 2.5 },
  { rawRange: [2, 3],   rawLabel: "2–3",   band: 2 },
  { rawRange: [1, 1],   rawLabel: "1",     band: 1.5 },
  { rawRange: [0, 0],   rawLabel: "0",     band: 0 },
];

// ─── Reading Score Table (Academic) ───
export const READING_ACADEMIC_SCORE_TABLE: ScoreRow[] = [
  { rawRange: [39, 40], rawLabel: "39–40", band: 9 },
  { rawRange: [37, 38], rawLabel: "37–38", band: 8.5 },
  { rawRange: [35, 36], rawLabel: "35–36", band: 8 },
  { rawRange: [33, 34], rawLabel: "33–34", band: 7.5 },
  { rawRange: [30, 32], rawLabel: "30–32", band: 7 },
  { rawRange: [27, 29], rawLabel: "27–29", band: 6.5 },
  { rawRange: [23, 26], rawLabel: "23–26", band: 6 },
  { rawRange: [19, 22], rawLabel: "19–22", band: 5.5 },
  { rawRange: [15, 18], rawLabel: "15–18", band: 5 },
  { rawRange: [13, 14], rawLabel: "13–14", band: 4.5 },
  { rawRange: [10, 12], rawLabel: "10–12", band: 4 },
  { rawRange: [8, 9],   rawLabel: "8–9",   band: 3.5 },
  { rawRange: [6, 7],   rawLabel: "6–7",   band: 3 },
  { rawRange: [4, 5],   rawLabel: "4–5",   band: 2.5 },
  { rawRange: [2, 3],   rawLabel: "2–3",   band: 2 },
  { rawRange: [1, 1],   rawLabel: "1",     band: 1.5 },
  { rawRange: [0, 0],   rawLabel: "0",     band: 0 },
];

// ─── Reading Score Table (General Training) ───
export const READING_GENERAL_SCORE_TABLE: ScoreRow[] = [
  { rawRange: [40, 40], rawLabel: "40",    band: 9 },
  { rawRange: [39, 39], rawLabel: "39",    band: 8.5 },
  { rawRange: [38, 38], rawLabel: "38",    band: 8 },
  { rawRange: [36, 37], rawLabel: "36–37", band: 7.5 },
  { rawRange: [34, 35], rawLabel: "34–35", band: 7 },
  { rawRange: [32, 33], rawLabel: "32–33", band: 6.5 },
  { rawRange: [30, 31], rawLabel: "30–31", band: 6 },
  { rawRange: [27, 29], rawLabel: "27–29", band: 5.5 },
  { rawRange: [23, 26], rawLabel: "23–26", band: 5 },
  { rawRange: [19, 22], rawLabel: "19–22", band: 4.5 },
  { rawRange: [15, 18], rawLabel: "15–18", band: 4 },
  { rawRange: [12, 14], rawLabel: "12–14", band: 3.5 },
  { rawRange: [9, 11],  rawLabel: "9–11",  band: 3 },
  { rawRange: [6, 8],   rawLabel: "6–8",   band: 2.5 },
  { rawRange: [3, 5],   rawLabel: "3–5",   band: 2 },
  { rawRange: [1, 2],   rawLabel: "1–2",   band: 1.5 },
  { rawRange: [0, 0],   rawLabel: "0",     band: 0 },
];
```

### Helper: Find Row by Raw Score
```ts
export function findRowByRawScore(table: ScoreRow[], rawScore: number): ScoreRow | null {
  return table.find(row => rawScore >= row.rawRange[0] && rawScore <= row.rawRange[1]) ?? null;
}

export function findRowByBandScore(table: ScoreRow[], band: number): ScoreRow | null {
  return table.find(row => row.band === band) ?? null;
}
```

---

## Step 2: Build ListeningCalculator Component

**File**: `frontend-web/src/app/ielts/calculator/_components/ListeningCalculator.tsx`

### UI Layout

```
┌─────────────────────────────────────────┐
│  🎧 Listening Score Converter           │
│                                         │
│  ┌──────────────┐  ┌──────────────┐     │
│  │ Raw Score     │  │ Band Score   │     │
│  │ [___________] │  │ [dropdown__] │     │
│  └──────────────┘  └──────────────┘     │
│                                         │
│  ┌───────────────┬───────────────┐      │
│  │  Raw Score    │  Band Score   │      │
│  ├───────────────┼───────────────┤      │
│  │  39–40        │     9.0       │ ← highlighted │
│  │  37–38        │     8.5       │      │
│  │  35–36        │     8.0       │      │
│  │  ...          │     ...       │      │
│  └───────────────┴───────────────┘      │
└─────────────────────────────────────────┘
```

### State
```ts
const [rawScoreInput, setRawScoreInput] = useState<string>("");
const [selectedBand, setSelectedBand] = useState<number | null>(null);
```

### Interaction Logic
1. **When user types a raw score** (number input, 0–40):
   - Find the matching row using `findRowByRawScore`
   - Set `selectedBand` to that row's band (this auto-syncs the band dropdown)
   - Highlight that row in the table
2. **When user selects a band from the dropdown**:
   - Find the matching row using `findRowByBandScore`
   - Set `rawScoreInput` to the midpoint of that row's range (for display convenience)
   - Highlight that row in the table
3. **Clearing**: If either input is cleared, remove the highlight

### Table Rendering
- Use `LISTENING_SCORE_TABLE.map()` to render `<tr>` elements
- Determine `isHighlighted` by comparing `row.band === selectedBand`
- Highlighted row classes:
  ```
  bg-primary/15 border-l-4 border-l-primary font-semibold
  transition-all duration-300
  ```
- Non-highlighted row: standard alternating rows per DESIGN_SYSTEM
- Add `scroll-into-view` behavior: when a row becomes highlighted, smooth-scroll it into the table's visible area

### Input Spec
- Raw Score input: `<input type="number" min="0" max="40" />` with label
- Band Score dropdown: `<select>` with all unique band values from `LISTENING_SCORE_TABLE`
- Both inputs should be styled per design system (border-slate-200, focus:ring-primary)

---

## Step 3: Build ReadingCalculator Component

**File**: `frontend-web/src/app/ielts/calculator/_components/ReadingCalculator.tsx`

### Same as ListeningCalculator BUT with:
1. **Academic / General Training toggle** at the top:
   ```tsx
   const [readingType, setReadingType] = useState<"ACADEMIC" | "GENERAL">("ACADEMIC");
   const scoreTable = readingType === "ACADEMIC"
     ? READING_ACADEMIC_SCORE_TABLE
     : READING_GENERAL_SCORE_TABLE;
   ```
2. Toggle UI: Two-button pill toggle similar to the Submission Volume tabs in Statistics
3. When switching type, **reset** the highlight state (clear inputs)

### Reuse Pattern
Since Listening and Reading share 90% of the logic:
- Extract a shared `ScoreConversionTable` component:
  ```tsx
  interface ScoreConversionTableProps {
    data: ScoreRow[];
    highlightedBand: number | null;
  }
  ```
- Both `ListeningCalculator` and `ReadingCalculator` use this shared table
- This follows **OCP** — the table renders any `ScoreRow[]` data

---

## Step 4: Wire Into CalculatorContent

**File**: `frontend-web/src/app/ielts/calculator/_components/CalculatorContent.tsx`

Replace the Phase 1 placeholders:
```tsx
{activeTab === "listening" && <ListeningCalculator />}
{activeTab === "reading"   && <ReadingCalculator />}
```

---

## ✅ Acceptance Criteria

- [ ] Listening tab shows a full score conversion table with all 17 rows
- [ ] Typing a raw score (e.g., 35) highlights the "35–36 → 8.0" row
- [ ] Selecting a band from dropdown highlights the corresponding row
- [ ] Inputs sync bidirectionally (entering raw score updates band dropdown, and vice versa)
- [ ] Reading tab shows Academic table by default
- [ ] Toggling to General Training shows a different mapping
- [ ] Highlighted row has `bg-primary/15` background and left border accent
- [ ] Highlighted row auto-scrolls into view
- [ ] Invalid scores (negative, >40) are gracefully handled (no highlight, no crash)
- [ ] All data lives in `calculator-data.ts` — components have zero hardcoded scores

---

## 🚫 Out of Scope
- Writing/Speaking descriptors (Phase 3–4)
- Animations beyond basic highlight transition (Phase 5)
