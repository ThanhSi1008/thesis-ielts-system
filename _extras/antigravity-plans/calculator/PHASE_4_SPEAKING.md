# Phase 4 — Speaking Band Descriptors

> **Goal**: Build the Speaking tab showing the full speaking band descriptor table. Selecting a band highlights the entire row across all 4 criteria columns.

---

## Prerequisites
- Phase 1 complete (routing and tabs)
- Phase 2 complete (`calculator-data.ts` exists with types)
- Phase 3 recommended (for reuse patterns)

---

## Step 1: Add Speaking Descriptor Data

**File**: `frontend-web/src/lib/calculator-data.ts` (append to existing)

### Criteria

```ts
export const SPEAKING_CRITERIA_LABELS = [
  "Fluency & Coherence",
  "Lexical Resource",
  "Grammatical Range & Accuracy",
  "Pronunciation",
];

export const SPEAKING_CRITERIA_KEYS = [
  "fluencyCoherence",
  "lexicalResource",
  "grammaticalRange",
  "pronunciation",
];
```

### Descriptor Data

```ts
export const SPEAKING_DESCRIPTORS: BandDescriptorRow[] = [
  {
    band: 9,
    criteria: {
      fluencyCoherence: "speaks fluently with only rare repetition or self-correction; any hesitation is content-related rather than to find words or grammar; speaks coherently with fully appropriate cohesive features; develops topics fully and appropriately",
      lexicalResource: "uses vocabulary with full flexibility and precision in all topics; uses idiomatic language naturally and accurately",
      grammaticalRange: "uses a full range of structures naturally and appropriately; produces consistently accurate structures apart from 'slips' characteristic of native speaker speech",
      pronunciation: "uses a full range of pronunciation features with precision and subtlety; sustains flexible use of features throughout; is effortless to understand",
    },
  },
  {
    band: 8,
    criteria: {
      fluencyCoherence: "speaks fluently with only occasional repetition or self-correction; hesitation is usually content-related and only rarely to search for language; develops topics coherently and appropriately",
      lexicalResource: "uses a wide vocabulary resource readily and flexibly to convey precise meaning; uses less common and idiomatic vocabulary skilfully, with occasional inaccuracies; uses paraphrase effectively as required",
      grammaticalRange: "uses a wide range of structures flexibly; produces a majority of error-free sentences with only very occasional inappropriacies or basic/non-systematic errors",
      pronunciation: "uses a wide range of pronunciation features; sustains flexible use of features, with only occasional lapses; is easy to understand throughout; L1 accent has minimal effect on intelligibility",
    },
  },
  {
    band: 7,
    criteria: {
      fluencyCoherence: "speaks at length without noticeable effort or loss of coherence; may demonstrate language-related hesitation at times, or some repetition and/or self-correction; uses a range of connectives and discourse markers with some flexibility",
      lexicalResource: "uses vocabulary resource flexibly to discuss a variety of topics; uses some less common and idiomatic vocabulary and shows some awareness of style and collocation, with some inappropriate choices; uses paraphrase effectively",
      grammaticalRange: "uses a range of complex structures with some flexibility; frequently produces error-free sentences, though some grammatical mistakes persist",
      pronunciation: "shows all the positive features of Band 6 and some, but not all, of the positive features of Band 8",
    },
  },
  {
    band: 6,
    criteria: {
      fluencyCoherence: "is willing to speak at length, though may lose coherence at times due to occasional repetition, self-correction or hesitation; uses a range of connectives and discourse markers but not always appropriately",
      lexicalResource: "has a wide enough vocabulary to discuss topics at length and make meaning clear in spite of inappropriacies; generally paraphrases successfully",
      grammaticalRange: "uses a mix of simple and complex structures, but with limited flexibility; may make frequent mistakes with complex structures, though these rarely cause comprehension problems",
      pronunciation: "uses a range of pronunciation features with mixed control; shows some effective use of features but this is not sustained; can generally be understood throughout, though mispronunciation of individual words or sounds reduces clarity at times",
    },
  },
  {
    band: 5,
    criteria: {
      fluencyCoherence: "usually maintains flow of speech but uses repetition, self-correction and/or slow speech to keep going; may over-use certain connectives and discourse markers; produces simple speech fluently, but more complex communication causes fluency problems",
      lexicalResource: "manages to talk about familiar and unfamiliar topics but uses vocabulary with limited flexibility; attempts to use paraphrase but with mixed success",
      grammaticalRange: "produces basic sentence forms with reasonable accuracy; uses a limited range of more complex structures, but these usually contain errors and may cause some comprehension problems",
      pronunciation: "shows all the positive features of Band 4 and some, but not all, of the positive features of Band 6",
    },
  },
  {
    band: 4,
    criteria: {
      fluencyCoherence: "cannot respond without noticeable pauses and may speak slowly, with frequent repetition and self-correction; links basic sentences but with repetitious use of simple connectives and some breakdowns in coherence",
      lexicalResource: "is able to talk about familiar topics but can only convey basic meaning on unfamiliar topics and makes frequent errors in word choice; rarely attempts paraphrase",
      grammaticalRange: "produces basic sentence forms and some correct simple sentences but subordinate structures are rare; errors are frequent and may lead to misunderstanding",
      pronunciation: "uses a limited range of pronunciation features; attempts to control features but lapses are frequent; mispronunciations are frequent and cause some difficulty for the listener",
    },
  },
  {
    band: 3,
    criteria: {
      fluencyCoherence: "speaks with long pauses; has limited ability to link simple sentences; gives only simple responses and is frequently unable to convey basic message",
      lexicalResource: "uses simple vocabulary to convey personal information; has insufficient vocabulary for less familiar topics",
      grammaticalRange: "attempts basic sentence forms but with limited success, or relies on apparently memorised utterances; makes numerous errors except in memorised expressions",
      pronunciation: "shows some of the features of Band 2 and some, but not all, of the positive features of Band 4",
    },
  },
  {
    band: 2,
    criteria: {
      fluencyCoherence: "pauses lengthily before most words; little communication possible",
      lexicalResource: "only produces isolated words or memorised utterances",
      grammaticalRange: "cannot produce basic sentence forms",
      pronunciation: "speech is often unintelligible",
    },
  },
  {
    band: 1,
    criteria: {
      fluencyCoherence: "no communication possible; no rateable language",
      lexicalResource: "",
      grammaticalRange: "",
      pronunciation: "does not attend",
    },
  },
  {
    band: 0,
    criteria: {
      fluencyCoherence: "does not attend",
      lexicalResource: "does not attend",
      grammaticalRange: "does not attend",
      pronunciation: "does not attend",
    },
  },
];
```

---

## Step 2: Build SpeakingDescriptors Component

**File**: `frontend-web/src/app/ielts/calculator/_components/SpeakingDescriptors.tsx`

### UI Layout

```
┌─────────────────────────────────────────────────────────┐
│  🎤 Speaking Band Descriptors                           │
│                                                         │
│  Band: [ dropdown 0–9 ▼ ]   or  click a row            │
│                                                         │
│  ┌──────┬──────────┬──────────┬──────────┬──────────┐   │
│  │ Band │ Fluency  │ Lexical  │ Grammar  │ Pronunc. │   │
│  │      │ & Cohere │ Resource │ Range    │          │   │
│  ├──────┼──────────┼──────────┼──────────┼──────────┤   │
│  │  9   │ ...      │ ...      │ ...      │ ...      │   │
│  │  8   │ ...      │ ...      │ ...      │ ...      │   │
│  │ ...  │ ...      │ ...      │ ...      │ ...      │   │
│  └──────┴──────────┴──────────┴──────────┴──────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Reuse from Phase 3

This component is **structurally identical** to `WritingDescriptors` minus the sub-tab toggle. To maximize reuse:

**Option A (Recommended)**: Extract a shared `BandDescriptorTable` component:

```tsx
// frontend-web/src/app/ielts/calculator/_components/BandDescriptorTable.tsx

interface BandDescriptorTableProps {
  title: string;
  criteriaLabels: string[];
  criteriaKeys: string[];
  descriptors: BandDescriptorRow[];
  highlightedBand: number | null;
  onBandSelect: (band: number | null) => void;
}
```

This component handles:
- The band dropdown input
- The descriptor table rendering
- Highlight logic (row click toggles)
- Scroll-into-view for highlighted row

Then both `WritingDescriptors` and `SpeakingDescriptors` become thin wrappers:

```tsx
// SpeakingDescriptors.tsx
export default function SpeakingDescriptors() {
  const [highlightedBand, setHighlightedBand] = useState<number | null>(null);
  
  return (
    <BandDescriptorTable
      title="Speaking Band Descriptors"
      criteriaLabels={SPEAKING_CRITERIA_LABELS}
      criteriaKeys={SPEAKING_CRITERIA_KEYS}
      descriptors={SPEAKING_DESCRIPTORS}
      highlightedBand={highlightedBand}
      onBandSelect={setHighlightedBand}
    />
  );
}
```

**Option B**: If the implementer already built Phase 3 without the shared component, they can duplicate and simplify. The key difference is Speaking has no sub-tabs.

### State
```ts
const [highlightedBand, setHighlightedBand] = useState<number | null>(null);
```

### Interaction Logic
- Same as Writing: dropdown selects band, row click toggles highlight
- No sub-tabs (Speaking has only one set of descriptors)

### Table Styling
- Same as Writing Phase 3 — horizontally scrollable, consistent column widths
- Highlighted row: `bg-primary/15 border-l-4 border-l-primary transition-all duration-300`

---

## Step 3: Refactor WritingDescriptors (Optional but Recommended)

If implementing the shared `BandDescriptorTable`, refactor `WritingDescriptors` to also use it:

```tsx
// WritingDescriptors.tsx (refactored)
export default function WritingDescriptors() {
  const [subTab, setSubTab] = useState<"task1" | "task2">("task1");
  const [highlightedBand, setHighlightedBand] = useState<number | null>(null);

  const config = subTab === "task1"
    ? { labels: WRITING_TASK_1_CRITERIA_LABELS, keys: WRITING_TASK_1_CRITERIA_KEYS, data: WRITING_TASK_1_DESCRIPTORS }
    : { labels: WRITING_TASK_2_CRITERIA_LABELS, keys: WRITING_TASK_2_CRITERIA_KEYS, data: WRITING_TASK_2_DESCRIPTORS };

  return (
    <div>
      {/* Sub-tab toggle */}
      <SubTabToggle value={subTab} onChange={(v) => { setSubTab(v); setHighlightedBand(null); }} />
      
      <BandDescriptorTable
        title={subTab === "task1" ? "Writing Task 1" : "Writing Task 2"}
        criteriaLabels={config.labels}
        criteriaKeys={config.keys}
        descriptors={config.data}
        highlightedBand={highlightedBand}
        onBandSelect={setHighlightedBand}
      />
    </div>
  );
}
```

---

## Step 4: Wire Into CalculatorContent

Replace the Phase 1 placeholder for speaking:

```tsx
{activeTab === "speaking" && <SpeakingDescriptors />}
```

---

## ✅ Acceptance Criteria

- [ ] Speaking tab shows a descriptor table with 10 rows (Band 0–9) and 4 criteria columns
- [ ] Selecting Band 7 highlights the entire Band 7 row across all 4 columns
- [ ] Clicking a row toggles its highlight
- [ ] Dropdown syncs with row selection
- [ ] Table scrolls horizontally on narrow screens
- [ ] All descriptor text matches the official IELTS speaking band descriptors
- [ ] If `BandDescriptorTable` is extracted, both Writing and Speaking use it (DRY)
- [ ] No data hardcoded in components

---

## 🚫 Out of Scope
- Animations beyond highlight transition (Phase 5)
- Overall band score calculator (Phase 5)
