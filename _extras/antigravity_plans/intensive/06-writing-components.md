# Phase 6: Writing Question-Type Components

## Objective
Build 2 Writing question-type components + shared Writing utilities (Editor, WordCounter, Renderer).

## Prerequisites
- Phase 3 (API) completed.

## Location
```
frontend-web/src/app/ielts/intensive/_components/writing/
├── WritingTask1.tsx
├── WritingTask2Essay.tsx
├── WritingEditor.tsx
├── WritingWordCounter.tsx
└── WritingQuestionRenderer.tsx
```

## Component Specifications

### `WritingTask1`
- **Visual layout (top to bottom):**
  1. Time advice badge ("You should spend about 20 minutes on this task")
  2. Prompt text (the question/description)
  3. Image (chart/map/diagram/graph) — displayed prominently, zoomable
  4. Word count requirement badge ("Write at least 150 words")
  5. `<WritingEditor>` — rich text area
  6. `<WritingWordCounter>` — live word count, turns green when ≥ 150
- **Data:** `question.questionText` = prompt, `question.imageUrl` = visual, `question.options.minWords` = 150, `question.options.taskType` = data subtype (for analytics)

### `WritingTask2Essay`
- **Visual layout (top to bottom):**
  1. Time advice badge ("You should spend about 40 minutes on this task")
  2. Instruction text ("Write about the following topic:")
  3. Prompt text (the essay topic — displayed in a styled card/quote block)
  4. Word count requirement badge ("Write at least 250 words")
  5. `<WritingEditor>` — rich text area
  6. `<WritingWordCounter>` — live word count, turns green when ≥ 250
- **Data:** No image. `question.questionText` = prompt, `question.options.minWords` = 250

### `WritingEditor`
- Large textarea (min height 400px)
- Support basic formatting: bold, italic, underline (optional — IELTS writing is plain text)
- Auto-save draft to localStorage every 30 seconds
- Character/word count passed up to parent
- `onChange(text: string)` callback

### `WritingWordCounter`
- Show current word count / minimum required
- Color: red if below minimum, yellow if near, green if met
- Format: "142 / 150 words"

### `WritingQuestionRenderer`
```typescript
const WRITING_REGISTRY = {
  task_1_visual: WritingTask1,
  task_2_essay: WritingTask2Essay,
};
```

## Props Interface
```typescript
interface WritingQuestionProps {
  question: {
    questionNumber: number;
    questionText: string;
    imageUrl?: string;
    options?: { minWords?: number; taskType?: string };
  };
  answer: string;
  onAnswer: (text: string) => void;
  mode: 'take' | 'review';
  feedback?: { // AI grading result in review mode
    band: number;
    taskAchievement: number;
    coherenceCohesion: number;
    lexicalResource: number;
    grammaticalRange: number;
    comments: string;
  };
}
```

## Review Mode
In review mode, show:
- User's submitted text (read-only)
- AI feedback panel with band scores per criterion
- Overall band score in a prominent badge
- Highlighted suggestions/corrections (if available from AI feedback)

## Validation
- Task 1 shows image prominently with prompt and editor
- Task 2 shows prompt text (no image) with editor
- Word counter updates live as user types
- Draft saves to localStorage
- Review mode displays AI feedback with band scores
