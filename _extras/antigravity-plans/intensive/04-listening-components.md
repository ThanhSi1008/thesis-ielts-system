# Phase 4: Listening Question-Type Components

## Objective
Build 11 dedicated Listening question-type components + 3 shared Listening UI pieces (AudioPlayer, TranscriptPanel, QuestionGroupRenderer).

## Prerequisites
- Phase 3 (API) completed — `GET /ielts-intensive/:examId` returns normalized exam data.

## Location
```
frontend-web/src/app/ielts/intensive/_components/listening/
├── ListeningFormCompletion.tsx
├── ListeningNoteCompletion.tsx
├── ListeningTableCompletion.tsx
├── ListeningFlowchartCompletion.tsx
├── ListeningSummaryCompletion.tsx
├── ListeningSentenceCompletion.tsx
├── ListeningShortAnswer.tsx
├── ListeningMcqSingle.tsx
├── ListeningMcqMulti.tsx
├── ListeningMatching.tsx
├── ListeningPlanMapDiagram.tsx
├── ListeningAudioPlayer.tsx
├── ListeningTranscriptPanel.tsx
└── ListeningQuestionGroupRenderer.tsx
```

## Shared Props Interface

```typescript
interface ListeningQuestionGroupProps {
  group: {
    id: string;
    questionType: string;
    questionRange: string;
    instructions: string;
    optionsBox?: { title: string; options: Record<string, string> };
    tableStructure?: { headers: string[] };
    contentStructure?: Array<{ heading?: string; subheading?: string; points: any[] }>;
    questions: Array<{
      id: string;
      questionNumber: number;
      questionText?: string;
      options?: Record<string, string>;
      prompt?: string;
      timestampSeconds?: number;
      answer?: string; // Only in review mode
    }>;
  };
  answers: Record<number, string>;
  onAnswer: (questionNumber: number, value: string) => void;
  mode: 'take' | 'review';
  currentTimestamp?: number; // For audio sync highlighting
}
```

## Component Specifications

### 1. `ListeningFormCompletion`
- **Visual:** Labeled form layout — each row has a label on the left and an input field on the right.
- **Data:** `contentStructure` contains `[{ label: "Name", questionNumber: 1, ... }]`
- **Interaction:** User types into input fields. In review mode, show correct answer with green/red indicator.

### 2. `ListeningNoteCompletion`
- **Visual:** Heading hierarchy with bullet points. Each point is text with an inline `___` blank replaced by an `<input>`.
- **Data:** `contentStructure` with `heading`, `points[]` containing mix of static text and question items.
- **Interaction:** Inline text input. Highlight current question based on audio timestamp.

### 3. `ListeningTableCompletion`
- **Visual:** HTML `<table>` with column headers from `tableStructure.headers`. Cells are either static text or `<input>` blanks.
- **Data:** `tableStructure.headers`, questions mapped to specific cells.
- **Note:** Must render the full table grid — use `contentStructure` or a `rows` field to know cell layout.

### 4. `ListeningFlowchartCompletion`
- **Visual:** Sequential boxes connected by arrows (→). Each box contains text with optional `<input>` blanks.
- **Data:** Steps array with `text` and optional `questionNumber`.
- **CSS:** Use flexbox/grid with arrow dividers between boxes.

### 5. `ListeningSummaryCompletion`
- **Visual:** Continuous paragraph text with inline `<input>` blanks.
- **Data:** Paragraph string with blank markers + questions array.

### 6. `ListeningSentenceCompletion`
- **Visual:** Each sentence on its own line, with one `<input>` blank per sentence.
- **Data:** `questions[]` where each has `questionText` containing "......"

### 7. `ListeningShortAnswer`
- **Visual:** A question (ending with "?") followed by an `<input>` answer field below.
- **Data:** `questions[]` with `questionText` as the question.

### 8. `ListeningMcqSingle`
- **Visual:** Question text + radio button group (A, B, C).
- **Data:** `questions[].options: { A: "...", B: "...", C: "..." }`, `answer: "A"`
- **Interaction:** Click radio to select. In review mode: correct = green, wrong selection = red.

### 9. `ListeningMcqMulti`
- **Visual:** Question text + checkbox group. Shows "Choose TWO letters" instruction.
- **Data:** `questions[].options: { A–E }`, `answer: ["D", "E"]`, `gradingNote: "IN EITHER ORDER"`
- **Interaction:** Checkboxes. Limit selection count based on question count.

### 10. `ListeningMatching`
- **Visual:** Two-column layout. Left: list of prompts (e.g., "Medical terminology"). Right: options box (A–F). Each prompt has a dropdown/select to choose the letter.
- **Data:** `optionsBox.options`, `questions[].prompt`
- **Interaction:** Dropdown select per prompt row.

### 11. `ListeningPlanMapDiagram`
- **Visual:** Image (map/diagram) displayed prominently. Below/beside: numbered labels with dropdown to select from options list.
- **Data:** `imageUrl` (on group or question), `optionsBox`, `questions[]`
- **Interaction:** Dropdowns to assign labels to numbered positions.

### `ListeningAudioPlayer`
- Play/pause, seek bar, current time display
- Accept `audioUrl` and expose `currentTimestamp` for sync
- Auto-play controls, speed selector (0.75x, 1x, 1.25x, 1.5x)

### `ListeningTranscriptPanel`
- Collapsible panel showing transcript
- Highlight current speaker turn based on `currentTimestamp`
- Color-code different speakers

### `ListeningQuestionGroupRenderer`
```typescript
const LISTENING_REGISTRY: Record<string, React.ComponentType<ListeningQuestionGroupProps>> = {
  form_completion: ListeningFormCompletion,
  note_completion: ListeningNoteCompletion,
  table_completion: ListeningTableCompletion,
  flowchart_completion: ListeningFlowchartCompletion,
  summary_completion: ListeningSummaryCompletion,
  sentence_completion: ListeningSentenceCompletion,
  short_answer: ListeningShortAnswer,
  mcq_single: ListeningMcqSingle,
  mcq_multi: ListeningMcqMulti,
  matching: ListeningMatching,
  plan_map_diagram: ListeningPlanMapDiagram,
};

export function ListeningQuestionGroupRenderer({ group, ...props }: Props) {
  const Component = LISTENING_REGISTRY[group.questionType];
  if (!Component) return <div>Unknown: {group.questionType}</div>;
  return <Component group={group} {...props} />;
}
```

## Design Rules
- Follow the existing dark mode support pattern (use `dark:` Tailwind classes)
- Each component must be under ~120 lines (SRP rule)
- Use `onAnswer(questionNumber, value)` callback — never manage state internally
- In review mode: correct answers = green bg, wrong answers = red bg, show correct answer text
- Use existing color tokens: `text-primary`, `bg-primary/10`, `text-gray-900 dark:text-white`, etc.

## Validation
- Render a Listening Test 1 exam and verify all 4 parts display correctly
- Each question type renders its unique visual layout
- Answers can be selected/typed and are passed up via `onAnswer`
- Review mode shows correct/incorrect with green/red styling
