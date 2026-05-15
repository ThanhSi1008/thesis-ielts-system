# Phase 5: Reading Question-Type Components

## Objective
Build 16 dedicated Reading question-type components + PassagePanel + ReadingQuestionGroupRenderer.

## Prerequisites
- Phase 3 (API) completed.

## Location
```
frontend-web/src/app/ielts/intensive/_components/reading/
├── ReadingTfng.tsx
├── ReadingYnng.tsx
├── ReadingMcqSingle.tsx
├── ReadingMcqMulti.tsx
├── ReadingMatchingInformation.tsx
├── ReadingMatchingHeadings.tsx
├── ReadingMatchingFeatures.tsx
├── ReadingMatchingSentenceEndings.tsx
├── ReadingSentenceCompletion.tsx
├── ReadingNoteCompletion.tsx
├── ReadingTableCompletion.tsx
├── ReadingFlowchartCompletion.tsx
├── ReadingSummaryCompletionFree.tsx
├── ReadingSummaryCompletionWordbank.tsx
├── ReadingDiagramLabel.tsx
├── ReadingShortAnswer.tsx
├── ReadingPassagePanel.tsx
└── ReadingQuestionGroupRenderer.tsx
```

## Key Difference from Listening
Reading uses a **split-screen layout**:
- **Left panel:** `ReadingPassagePanel` — scrollable passage text (can be very long)
- **Right panel:** Question groups rendered vertically

The passage panel must support:
- Paragraph labeling (A, B, C, ...) for matching questions
- Search/highlight within passage
- Sticky scroll — stays in view while scrolling questions
- Responsive: on mobile, passage above questions (not side-by-side)

## Component Specifications

### 1. `ReadingTfng` (True/False/Not Given)
- **Visual:** Statement text + **3 buttons**: TRUE, FALSE, NOT GIVEN.
- **Active state:** Selected button is highlighted (primary color).
- **Review:** Correct = green, wrong = red, show correct answer.
- **Data:** `questions[].questionText` = statement, `answer` = "TRUE"|"FALSE"|"NOT GIVEN"

### 2. `ReadingYnng` (Yes/No/Not Given)
- **Visual:** Same as TFNG but buttons labeled YES, NO, NOT GIVEN.
- **Data:** `answer` = "YES"|"NO"|"NOT GIVEN"

### 3. `ReadingMcqSingle`
- Radio buttons A/B/C/D (Reading often has 4 options, not 3 like Listening).

### 4. `ReadingMcqMulti`
- Checkboxes. Often "Choose TWO letters" or "Choose THREE".

### 5. `ReadingMatchingInformation`
- **Visual:** "Which paragraph contains the following information?" Each statement has a **dropdown** to select paragraph letter (A–G).
- **Note:** Multiple questions may have the same paragraph as the answer. Show "NB: You may use any letter more than once" if applicable.

### 6. `ReadingMatchingHeadings`
- **Visual:** List of headings (roman numerals: i, ii, iii, ...) displayed in a box. Below, each paragraph has a dropdown to select a heading.
- **Data:** `optionsBox` has `{ options: { i: "...", ii: "..." } }`, `questions[].prompt` = paragraph label.
- **Note:** Once a heading is used, it should be visually dimmed (but still selectable — some headings can be distractors).

### 7. `ReadingMatchingFeatures`
- **Visual:** Options box showing categories (people/dates/organizations). Each question statement has a dropdown to select the matching category.
- **Data:** Same shape as Listening matching.

### 8. `ReadingMatchingSentenceEndings`
- **Visual:** Two columns. Left: sentence beginnings. Right: list of endings (A–G). Each beginning has a dropdown to select its ending.
- **Data:** `optionsBox` has endings, `questions[].questionText` = sentence beginning.

### 9–12. Completion Types
Same visual patterns as Listening equivalents but rendered in the right panel alongside the passage:
- `ReadingSentenceCompletion` — sentences with blanks
- `ReadingNoteCompletion` — bullets under headings with blanks
- `ReadingTableCompletion` — table grid with blanks
- `ReadingFlowchartCompletion` — connected boxes with blanks

### 13. `ReadingSummaryCompletionFree`
- **Visual:** Paragraph with inline `<input>` text fields. No word bank.
- **Instruction:** "Complete the summary using words from the passage."

### 14. `ReadingSummaryCompletionWordbank`
- **Visual:** Word bank box displayed above the paragraph. Paragraph has inline **dropdowns** (not text inputs) selecting from the word bank.
- **Data:** `optionsBox` contains the word bank options.
- **Key difference from #13:** Dropdowns instead of text inputs.

### 15. `ReadingDiagramLabel`
- **Visual:** Image displayed with numbered arrows. Below: text inputs for each label.
- **Data:** `imageUrl`, `questions[]` with `questionNumber` and `answer`.

### 16. `ReadingShortAnswer`
- **Visual:** Question text + text input below.

### `ReadingPassagePanel`
```typescript
interface ReadingPassagePanelProps {
  passage: { passageTitle?: string; passageText: string };
  highlightParagraph?: string; // e.g., "C" — highlight when user is on a matching question
}
```
- Render passage as formatted HTML/markdown
- Auto-label paragraphs A, B, C, ... in left margin
- Support text selection for reference

### `ReadingQuestionGroupRenderer`
Same registry pattern as Listening but with 16 types:
```typescript
const READING_REGISTRY = {
  tfng: ReadingTfng,
  ynng: ReadingYnng,
  mcq_single: ReadingMcqSingle,
  mcq_multi: ReadingMcqMulti,
  matching_information: ReadingMatchingInformation,
  matching_headings: ReadingMatchingHeadings,
  matching_features: ReadingMatchingFeatures,
  matching_sentence_endings: ReadingMatchingSentenceEndings,
  sentence_completion: ReadingSentenceCompletion,
  note_completion: ReadingNoteCompletion,
  table_completion: ReadingTableCompletion,
  flowchart_completion: ReadingFlowchartCompletion,
  summary_completion_free: ReadingSummaryCompletionFree,
  summary_completion_wordbank: ReadingSummaryCompletionWordbank,
  diagram_label: ReadingDiagramLabel,
  short_answer: ReadingShortAnswer,
};
```

## Layout: Split Screen
```tsx
<div className="flex h-full">
  <div className="w-1/2 overflow-y-auto border-r">
    <ReadingPassagePanel passage={part.passage} />
  </div>
  <div className="w-1/2 overflow-y-auto p-6 space-y-8">
    {part.questionGroups.map(g => (
      <ReadingQuestionGroupRenderer key={g.id} group={g} ... />
    ))}
  </div>
</div>
```

## Validation
- Split-screen renders passage on left, questions on right
- All 16 question types render their distinct visual layouts
- Dropdowns, radio buttons, checkboxes, text inputs all work
- Review mode shows correct/incorrect feedback
