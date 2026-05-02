# Phase 3 — Writing Band Descriptors

> **Goal**: Build the Writing tab with Task 1 & Task 2 sub-tabs, each showing a full band descriptor table. Selecting a band highlights the entire row across all 4 criteria columns.

---

## Prerequisites
- Phase 1 complete (routing and tabs)
- Phase 2 complete (`calculator-data.ts` exists)

---

## Step 1: Add Writing Descriptor Data

**File**: `frontend-web/src/lib/calculator-data.ts` (append to existing)

### Type Definition

```ts
export interface BandDescriptorRow {
  band: number;
  criteria: {
    [criterionKey: string]: string;
  };
}

export interface DescriptorTableConfig {
  title: string;
  criteriaLabels: string[];
  criteriaKeys: string[];
  rows: BandDescriptorRow[];
}
```

### Writing Task 1 Data

```ts
export const WRITING_TASK_1_CRITERIA_LABELS = [
  "Task Achievement",
  "Coherence & Cohesion",
  "Lexical Resource",
  "Grammatical Range & Accuracy",
];

export const WRITING_TASK_1_CRITERIA_KEYS = [
  "taskAchievement",
  "coherenceCohesion",
  "lexicalResource",
  "grammaticalRange",
];

export const WRITING_TASK_1_DESCRIPTORS: BandDescriptorRow[] = [
  {
    band: 9,
    criteria: {
      taskAchievement: "fully satisfies all the requirements of the task; clearly presents a fully developed response",
      coherenceCohesion: "uses cohesion in such a way that it attracts no attention; skilfully manages paragraphing",
      lexicalResource: "uses a wide range of vocabulary with very natural and sophisticated control of lexical features; rare minor errors occur only as 'slips'",
      grammaticalRange: "uses a wide range of structures with full flexibility and accuracy; rare minor errors occur only as 'slips'",
    },
  },
  {
    band: 8,
    criteria: {
      taskAchievement: "covers all requirements of the task sufficiently; presents, highlights and illustrates key features/bullet points clearly and appropriately",
      coherenceCohesion: "sequences information and ideas logically; manages all aspects of cohesion well; uses paragraphing sufficiently and appropriately",
      lexicalResource: "uses a wide range of vocabulary fluently and flexibly to convey precise meanings; skilfully uses uncommon lexical items but there may be occasional inaccuracies in word choice and collocation; produces rare errors in spelling and/or word formation",
      grammaticalRange: "uses a wide range of structures; the majority of sentences are error-free; makes only very occasional errors or inappropriacies",
    },
  },
  {
    band: 7,
    criteria: {
      taskAchievement: "covers the requirements of the task; (A) presents a clear overview of main trends, differences or stages; (GT) presents a clear purpose, with the tone consistent and appropriate; clearly presents and highlights key features/bullet points but could be more fully extended",
      coherenceCohesion: "logically organises information and ideas; there is clear progression throughout; uses a range of cohesive devices appropriately although there may be some under-/over-use",
      lexicalResource: "uses a sufficient range of vocabulary to allow some flexibility and precision; uses less common lexical items with some awareness of style and collocation; may produce occasional errors in word choice, spelling and/or word formation",
      grammaticalRange: "uses a variety of complex structures; produces frequent error-free sentences; has good control of grammar and punctuation but may make a few errors",
    },
  },
  {
    band: 6,
    criteria: {
      taskAchievement: "addresses the requirements of the task; (A) presents an overview with information appropriately selected; (GT) presents a purpose that is generally clear; there may be inconsistencies in tone; presents and adequately highlights key features/bullet points but details may be irrelevant, inappropriate or inaccurate",
      coherenceCohesion: "arranges information and ideas coherently and there is a clear overall progression; uses cohesive devices effectively, but cohesion within and/or between sentences may be faulty or mechanical; may not always use referencing clearly or appropriately",
      lexicalResource: "uses an adequate range of vocabulary for the task; attempts to use less common vocabulary but with some inaccuracy; makes some errors in spelling and/or word formation, but they do not impede communication",
      grammaticalRange: "uses a mix of simple and complex sentence forms; makes some errors in grammar and punctuation but they rarely reduce communication",
    },
  },
  {
    band: 5,
    criteria: {
      taskAchievement: "generally addresses the task; the format may be inappropriate in places; (A) recounts detail mechanically with no clear overview; there may be no data to support the description; (GT) may present a purpose for the letter that is unclear at times; the tone may be variable and sometimes inappropriate; presents, but inadequately covers, key features/bullet points; there may be a tendency to focus on details",
      coherenceCohesion: "presents information with some organisation but there may be a lack of overall progression; makes inadequate, inaccurate or over-use of cohesive devices; may be repetitive because of lack of referencing and substitution",
      lexicalResource: "uses a limited range of vocabulary, but this is minimally adequate for the task; may make noticeable errors in spelling and/or word formation that may cause some difficulty for the reader",
      grammaticalRange: "uses only a limited range of structures; attempts complex sentences but these tend to be less accurate than simple sentences; may make frequent grammatical errors and punctuation may be faulty; errors can cause some difficulty for the reader",
    },
  },
  {
    band: 4,
    criteria: {
      taskAchievement: "attempts to address the task but does not cover all key features/bullet points; the format may be inappropriate; (GT) fails to clearly explain the purpose of the letter; the tone may be inappropriate; may confuse key features/bullet points with detail; parts may be unclear, irrelevant, repetitive or inaccurate",
      coherenceCohesion: "presents information and ideas but these are not arranged coherently and there is no clear progression in the response; uses some basic cohesive devices but these may be inaccurate or repetitive",
      lexicalResource: "uses only basic vocabulary which may be used repetitively or which may be inappropriate for the task; has limited control of word formation and/or spelling; errors may cause strain for the reader",
      grammaticalRange: "uses only a very limited range of structures with only rare use of subordinate clauses; some structures are accurate but errors predominate, and punctuation is often faulty",
    },
  },
  {
    band: 3,
    criteria: {
      taskAchievement: "fails to address the task, which may have been completely misunderstood; presents limited ideas which may be largely irrelevant/repetitive",
      coherenceCohesion: "does not organise ideas logically; may use a very limited range of cohesive devices, and those used may not indicate a logical relationship between ideas",
      lexicalResource: "uses only a very limited range of words and expressions with very limited control of word formation and/or spelling; errors may severely distort the message",
      grammaticalRange: "attempts sentence forms but errors in grammar and punctuation predominate and distort the meaning",
    },
  },
  {
    band: 2,
    criteria: {
      taskAchievement: "answer is barely related to the task",
      coherenceCohesion: "has very little control of organisational features",
      lexicalResource: "uses an extremely limited range of vocabulary; essentially no control of word formation and/or spelling",
      grammaticalRange: "cannot use sentence forms except in memorised phrases",
    },
  },
  {
    band: 1,
    criteria: {
      taskAchievement: "answer is completely unrelated to the task; does not attend; does not attempt the task in any way; writes a totally memorised response",
      coherenceCohesion: "fails to communicate any message",
      lexicalResource: "can only use a few isolated words",
      grammaticalRange: "cannot use sentence forms at all",
    },
  },
  {
    band: 0,
    criteria: {
      taskAchievement: "did not attempt the task",
      coherenceCohesion: "did not attempt the task",
      lexicalResource: "did not attempt the task",
      grammaticalRange: "did not attempt the task",
    },
  },
];
```

### Writing Task 2 Data

Define `WRITING_TASK_2_CRITERIA_LABELS`, `WRITING_TASK_2_CRITERIA_KEYS`, and `WRITING_TASK_2_DESCRIPTORS` with the same structure. The criteria labels are:

```ts
export const WRITING_TASK_2_CRITERIA_LABELS = [
  "Task Response",
  "Coherence & Cohesion",
  "Lexical Resource",
  "Grammatical Range & Accuracy",
];
```

> **Note**: Task 2 uses "Task Response" instead of "Task Achievement". The descriptor text for each band differs from Task 1 — see the user-provided image for Task 2. Transcribe all text accurately from the image.

---

## Step 2: Build WritingDescriptors Component

**File**: `frontend-web/src/app/ielts/calculator/_components/WritingDescriptors.tsx`

### UI Layout

```
┌─────────────────────────────────────────────────────────┐
│  ✍️ Writing Band Descriptors                            │
│                                                         │
│  ┌──────────┐┌──────────┐                               │
│  │ Task 1   ││ Task 2   │  ← sub-tab toggle             │
│  └──────────┘└──────────┘                               │
│                                                         │
│  Band: [ dropdown 0–9 ▼ ]   or  click a row             │
│                                                         │
│  ┌──────┬──────────┬──────────┬──────────┬──────────┐   │
│  │ Band │ Task     │ Cohesion │ Lexical  │ Grammar  │   │
│  │      │ Achieve  │          │ Resource │ Range    │   │
│  ├──────┼──────────┼──────────┼──────────┼──────────┤   │
│  │  9   │ ...      │ ...      │ ...      │ ...      │ ← highlighted │
│  │  8   │ ...      │ ...      │ ...      │ ...      │   │
│  │ ...  │ ...      │ ...      │ ...      │ ...      │   │
│  └──────┴──────────┴──────────┴──────────┴──────────┘   │
└─────────────────────────────────────────────────────────┘
```

### State

```ts
const [subTab, setSubTab] = useState<"task1" | "task2">("task1");
const [highlightedBand, setHighlightedBand] = useState<number | null>(null);
```

### Interaction Logic

1. **Band dropdown**: User selects a band (0–9) → the entire row for that band highlights
2. **Row click**: Clicking any row toggles that row's highlight (and updates the dropdown)
3. **Sub-tab switch**: Switching between Task 1 and Task 2 resets the highlight

### Table Rendering

- First column: Band number (centered, bold, `w-16`)
- Remaining 4 columns: Descriptor text for each criterion
- Each criterion column should have a **minimum width** to prevent text overflow: `min-w-[200px]`
- The table should be **horizontally scrollable** on smaller screens:
  ```tsx
  <div className="overflow-x-auto">
    <table className="min-w-[900px] w-full ...">
  ```
- Highlighted row styling (same as Listening/Reading):
  ```
  bg-primary/15 border-l-4 border-l-primary
  transition-all duration-300
  ```
- Descriptor text: `text-[13px] leading-relaxed text-slate-700`
- Band column: `text-lg font-bold text-slate-900`
- Table header: uppercase, small font, tracking-wider, bg-slate-50

### Sub-Tab Toggle
- Same pill-toggle style as ReadingCalculator's Academic/General toggle
- Two buttons: "Task 1" | "Task 2"

---

## Step 3: Wire Into CalculatorContent

Replace the Phase 1 placeholder for writing:

```tsx
{activeTab === "writing" && <WritingDescriptors />}
```

---

## ✅ Acceptance Criteria

- [ ] Writing tab shows Task 1 descriptors by default
- [ ] Switching to Task 2 shows different descriptor text (especially "Task Response" vs "Task Achievement")
- [ ] Selecting band 7 from dropdown highlights the Band 7 row across all 4 criteria
- [ ] Clicking a row toggles the highlight and updates the dropdown
- [ ] Table scrolls horizontally on mobile/narrow screens
- [ ] All descriptor text is accurately transcribed from the official IELTS band descriptors
- [ ] Band 0 row shows "did not attempt the task" for all criteria
- [ ] No data is hardcoded in the component — all data comes from `calculator-data.ts`

---

## 🚫 Out of Scope
- Speaking descriptors (Phase 4)
- Animations beyond highlight transition (Phase 5)
