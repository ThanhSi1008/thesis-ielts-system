# Phase 4 — Frontend UI

> **Goal:** Create `SpeakingExerciseLayout.tsx` with cloze + MCQ modes, update routing, wire navigation and progress.
> **Dependencies:** Phase 3 (needs API). **Effort:** ~2-3 hours.

---

## Step 1: Create `SpeakingExerciseLayout.tsx`

**File:** `frontend-web/src/app/ielts/basic/[skill]/exercises/[exerciseId]/_components/containers/SpeakingExerciseLayout.tsx` (create new)

### 1.1 — Component Structure

The layout renders differently based on `exercise.questionType`:

```tsx
export function SpeakingExerciseLayout({ exercise, lessonBlocks, onComplete, onNext }) {
  if (exercise.questionType === "mcq") {
    return <SpeakingMCQView exercise={exercise} ... />;
  }
  // Default: cloze
  return <SpeakingClozeView exercise={exercise} ... />;
}
```

### 1.2 — Cloze View

Reuse the same pattern as `WritingClozeLayout` but with these differences:
- **No diagram pane** — always full-width prompt on top, cloze below (like Task 2 writing)
- **Header** shows `Part X` badge based on `exercise.partType`
- **Paragraph title** is "Model Response" instead of "Introduction / Body 1 / Body 2"
- **Theory buttons** use speaking-specific icons:
  - Fluency & Coherence → `MessageCircle` (green)
  - Grammar & Pronunciation → `Volume2` (blue)
  - Lexical Resource → `BookOpen` (yellow)

### 1.3 — MCQ View

New component for best-response selection:

```tsx
function SpeakingMCQView({ exercise, onComplete, onNext }) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const content = exercise.content; // { question, options, correctAnswer }

  return (
    <div className="flex flex-col h-[90vh] bg-[#F9F6F0] rounded-3xl border ...">
      {/* Header with Part badge */}
      {/* Examiner Question (prompt) */}
      {/* Radio options A-D */}
      {/* On submit: highlight correct green, wrong red, show feedback */}
      {/* Footer: Check Answer / Next buttons */}
    </div>
  );
}
```

**MCQ UI spec:**
- Show the examiner question at the top in a styled card
- 4 radio-button options (A/B/C/D) below
- Each option is a card with the response text
- "Check Answer" button at bottom
- On check: correct option turns green, wrong selection turns red
- Show feedback text below each option explaining why it's good/bad
- "Next Exercise →" button appears after checking

### 1.4 — Theory Button Icons

Import and use speaking-specific icons:

```tsx
import { MessageCircle, Volume2, BookOpen } from "lucide-react";

// In the header:
<button title="Fluency & Coherence">
  <MessageCircle size={18} className="text-green-700" />
</button>
<button title="Grammar & Pronunciation">
  <Volume2 size={18} className="text-blue-600" />
</button>
<button title="Lexical Resource">
  <BookOpen size={18} className="text-yellow-700" />
</button>
```

Pass matching `customTheme` to `TheoryPopup` (same pattern as `WritingClozeLayout`).

---

## Step 2: Update `ExerciseDetailContent.tsx`

**File:** `frontend-web/src/app/ielts/basic/[skill]/exercises/[exerciseId]/ExerciseDetailContent.tsx`

### 2.1 — Add isSpeaking detection

```typescript
const isSpeaking = skill?.toLowerCase() === "speaking";
```

### 2.2 — Add endpoint routing

Update the fetch logic:

```typescript
const endpoint = isReading ? "reading-exercises"
  : isWriting ? "writing-exercises"
  : isSpeaking ? "speaking-exercises"
  : "listening-exercises";
```

### 2.3 — Add layout routing

After the `isWriting` block:

```tsx
if (isSpeaking) {
  return <SpeakingExerciseLayout exercise={exercise as any} lessonBlocks={lessonBlocks} onComplete={onComplete} onNext={onNext} />;
}
```

Import at the top:
```typescript
import { SpeakingExerciseLayout } from "./_components/containers/SpeakingExerciseLayout";
```

---

## Step 3: Update Exercise List Page

**File:** `frontend-web/src/app/ielts/basic/[skill]/exercises/page.tsx`

The existing page already dynamically determines the endpoint:

```typescript
const endpoint = isListening ? "listening-exercises" : isWriting ? "writing-exercises" : "reading-exercises";
```

Add `isSpeaking` handling:

```typescript
const isSpeaking = params.skill.toLowerCase() === "speaking";

const endpoint = isListening ? "listening-exercises"
  : isWriting ? "writing-exercises"
  : isSpeaking ? "speaking-exercises"
  : "reading-exercises";
```

Also update the condition check:
```typescript
if (allLessons.length > 0 && (isListening || isReading || isWriting || isSpeaking)) {
```

---

## Step 4: Update Progress Tracking

**File:** `frontend-web/src/app/ielts/basic/[skill]/exercises/ClientExerciseListGroup.tsx`

### 4.1 — Update ProgressResponse interface

```typescript
interface ProgressResponse {
  // ... existing fields ...
  speakingExerciseId?: string | null;  // ← ADD
}
```

### 4.2 — Track speaking completion

```typescript
if (p.isCompleted) {
  if (p.listeningExerciseId) completedIds.add(p.listeningExerciseId);
  if (p.readingExerciseId) completedIds.add(p.readingExerciseId);
  if (p.writingExerciseId) completedIds.add(p.writingExerciseId);
  if (p.speakingExerciseId) completedIds.add(p.speakingExerciseId);  // ← ADD
}
```

---

## Step 5: Verify End-to-End

### 5.1 — Speaking Cloze Exercise

1. Navigate to Speaking → Part 1 — Personal Questions → any exercise
2. ✅ Full-width prompt on top (no diagram)
3. ✅ Cloze paragraph below with dropdown blanks
4. ✅ Blanks test speaking vocabulary (openers, connectors, adjectives)
5. ✅ Theory buttons show speaking-specific content
6. ✅ Save Progress and Check Answers work

### 5.2 — Speaking MCQ Exercise

1. Navigate to Speaking → Best Response Practice → any exercise
2. ✅ Examiner question displayed at top
3. ✅ 4 radio options shown as cards
4. ✅ "Check Answer" highlights correct/wrong
5. ✅ Feedback text appears for each option
6. ✅ Progress is tracked

### 5.3 — Navigation

1. ✅ Library page shows Speaking skill with lesson/exercise counts
2. ✅ Speaking exercise list groups exercises by lesson
3. ✅ Clicking an exercise opens the correct layout (cloze or MCQ)

---

## Post-Implementation Checklist

| Check | Status |
|-------|--------|
| Speaking theory lessons visible in lesson list | ☐ |
| Speaking cloze exercises work (fill blanks, check answers) | ☐ |
| Speaking MCQ exercises work (select, check, see feedback) | ☐ |
| Theory modals show speaking-specific content (Fluency, Grammar, Lexical) | ☐ |
| Progress tracking works for speaking exercises | ☐ |
| Library page counts speaking lessons + exercises | ☐ |
| No regressions in Listening, Reading, or Writing | ☐ |
