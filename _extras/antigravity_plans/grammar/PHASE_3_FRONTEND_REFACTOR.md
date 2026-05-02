# Phase 3: Frontend Refactor — API-Driven + Component Decomposition

## Objective

1. **Remove hardcoded data** — Stop importing from `@/app/grammar/data.ts` and fetch everything from the backend API.
2. **Decompose the 347-line `GrammarLessonClient.tsx`** into focused components (SRP: max ~120 lines each).
3. **Server-side progress** — Replace `localStorage` with API calls to `PUT /grammar/progress`.

## Current State

### Problem: Hardcoded Data Flow

```
data.ts (hardcoded) ──┐
                      ├──> GrammarContent.tsx (book list)
                      ├──> [topicSlug]/page.tsx (unit list)
                      └──> GrammarLessonClient.tsx (theory + exercises)
```

### Target: API-Driven Data Flow

```
Backend API ──> grammarApi ──┐
                             ├──> GrammarContent.tsx (fetches books)
                             ├──> [topicSlug]/page.tsx (fetches book + progress)
                             └──> GrammarLessonClient.tsx (fetches unit content + submits progress)
```

### Problem: GrammarLessonClient.tsx is a 347-Line Monolith

This single component currently handles:
- Theory HTML rendering (L232-245)
- Exercise rendering with fill-blank + match types (L249-340)
- Answer state management (L21, L44-46)
- Answer checking logic with scoring (L48-100)
- Dev tool: fill correct answers (L102-124)
- Progress tracking via localStorage (L24-42)
- Result modal rendering (L134-180)
- Sidebar lesson navigation (L186-214)

**This violates SRP.** Each of these responsibilities should be a separate component or hook.

---

## Step 1: Create Custom Hook — `useGrammarUnit`

**File:** `frontend-web/src/app/ielts/grammar/[topicSlug]/[lessonSlug]/_hooks/useGrammarUnit.ts`

This hook abstracts data fetching and progress management.

```ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { grammarApi } from '@/services/learning.api';
import type { GrammarUnitWithContent } from '@/types';

interface UseGrammarUnitReturn {
  unit: GrammarUnitWithContent | null;
  isLoading: boolean;
  error: string | null;
  progress: { theoryCompleted: boolean; exerciseCompleted: boolean };
  markTheoryDone: () => Promise<void>;
  submitExerciseResult: (correct: number, total: number) => Promise<void>;
}

export function useGrammarUnit(bookSlug: string, unitOrder: number): UseGrammarUnitReturn {
  const [unit, setUnit] = useState<GrammarUnitWithContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ theoryCompleted: false, exerciseCompleted: false });

  useEffect(() => {
    const fetchUnit = async () => {
      try {
        setIsLoading(true);
        const data = await grammarApi.getUnitByOrder(bookSlug, unitOrder);
        setUnit(data);
      } catch {
        setError('Failed to load unit content.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUnit();
  }, [bookSlug, unitOrder]);

  const markTheoryDone = useCallback(async () => {
    if (!unit) return;
    await grammarApi.updateProgress({ unitId: unit.id, theoryCompleted: true });
    setProgress(prev => ({ ...prev, theoryCompleted: true }));
  }, [unit]);

  const submitExerciseResult = useCallback(async (correct: number, total: number) => {
    if (!unit) return;
    await grammarApi.updateProgress({ unitId: unit.id, exerciseScore: correct, exerciseTotal: total });
    setProgress(prev => ({ ...prev, exerciseCompleted: correct === total }));
  }, [unit]);

  return { unit, isLoading, error, progress, markTheoryDone, submitExerciseResult };
}
```

---

## Step 2: Create Sub-Components

### 2a. TheoryView

**File:** `frontend-web/src/app/ielts/grammar/[topicSlug]/[lessonSlug]/_components/TheoryView.tsx`

Renders the theory HTML and the "Finish Theory" button. ~40 lines.

```tsx
'use client';

interface TheoryViewProps {
  htmlContent: string;
  onFinish: () => void;
}

export default function TheoryView({ htmlContent, onFinish }: TheoryViewProps) {
  return (
    <div className="animate-in fade-in duration-300">
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      <div className="mt-12 pt-8 border-t border-gray-100 flex justify-center">
        <button
          onClick={onFinish}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-12 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-3 active:scale-95"
        >
          Finish Theory & Start Exercises
          <span className="text-xl">→</span>
        </button>
      </div>
    </div>
  );
}
```

### 2b. ExerciseView

**File:** `frontend-web/src/app/ielts/grammar/[topicSlug]/[lessonSlug]/_components/ExerciseView.tsx`

Orchestrates all exercises, manages answer state, and handles submission. ~100 lines.

```tsx
'use client';

import { useState } from 'react';
import FillBlankExercise from './FillBlankExercise';
import MatchExercise from './MatchExercise';
import ResultModal from './ResultModal';
import type { GrammarExercise } from '@/types';

interface ExerciseViewProps {
  exercises: GrammarExercise[];
  onComplete: (correct: number, total: number) => void;
}

export default function ExerciseView({ exercises, onComplete }: ExerciseViewProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ correct: number; total: number; errors: any[] } | null>(null);

  const handleInputChange = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const checkAnswers = () => {
    // ... scoring logic (extracted from current GrammarLessonClient L48-100)
    // Call onComplete(correct, total) after scoring
  };

  return (
    <div className="animate-in fade-in duration-300 space-y-12">
      {exercises.map(ex => {
        if (ex.type === 'match') {
          return <MatchExercise key={ex.id} exercise={ex} answers={answers} onAnswerChange={handleInputChange} />;
        }
        return <FillBlankExercise key={ex.id} exercise={ex} answers={answers} onAnswerChange={handleInputChange} />;
      })}

      <div className="pt-12 flex justify-end">
        <button onClick={checkAnswers} className="bg-primary ...">Submit Answers</button>
      </div>

      {result && <ResultModal result={result} onClose={() => setResult(null)} />}
    </div>
  );
}
```

### 2c. FillBlankExercise

**File:** `frontend-web/src/app/ielts/grammar/[topicSlug]/[lessonSlug]/_components/FillBlankExercise.tsx`

Renders a single fill-in-the-blank exercise section. ~60 lines.

```tsx
interface FillBlankExerciseProps {
  exercise: GrammarExercise;
  answers: Record<string, string>;
  onAnswerChange: (id: string, value: string) => void;
}

export default function FillBlankExercise({ exercise, answers, onAnswerChange }: FillBlankExerciseProps) {
  // Extract from current GrammarLessonClient L251-280
  // Render exercise question, verb list, and input fields
}
```

### 2d. MatchExercise

**File:** `frontend-web/src/app/ielts/grammar/[topicSlug]/[lessonSlug]/_components/MatchExercise.tsx`

Renders a single matching exercise section. ~60 lines.

```tsx
interface MatchExerciseProps {
  exercise: GrammarExercise;
  answers: Record<string, string>;
  onAnswerChange: (id: string, value: string) => void;
}

export default function MatchExercise({ exercise, answers, onAnswerChange }: MatchExerciseProps) {
  // Extract from current GrammarLessonClient L282-320
  // Render left/right columns with answer inputs
}
```

### 2e. ResultModal

**File:** `frontend-web/src/app/ielts/grammar/[topicSlug]/[lessonSlug]/_components/ResultModal.tsx`

Renders the score results overlay. ~50 lines.

```tsx
interface ResultModalProps {
  result: { correct: number; total: number; errors: any[] };
  onClose: () => void;
}

export default function ResultModal({ result, onClose }: ResultModalProps) {
  // Extract from current GrammarLessonClient L134-180
}
```

### 2f. LessonSidebar

**File:** `frontend-web/src/app/ielts/grammar/[topicSlug]/[lessonSlug]/_components/LessonSidebar.tsx`

Renders the Theory/Exercise tab navigation with progress indicators. ~50 lines.

```tsx
interface LessonSidebarProps {
  activeTab: 'theory' | 'exercise';
  onTabChange: (tab: 'theory' | 'exercise') => void;
  progress: { theoryCompleted: boolean; exerciseCompleted: boolean };
}

export default function LessonSidebar({ activeTab, onTabChange, progress }: LessonSidebarProps) {
  // Extract from current GrammarLessonClient L186-214
}
```

---

## Step 3: Rewrite GrammarLessonClient

**File:** `frontend-web/src/app/ielts/grammar/[topicSlug]/[lessonSlug]/GrammarLessonClient.tsx`

The new version should be a thin orchestrator that composes the sub-components:

```tsx
'use client';

import { useState } from 'react';
import { useGrammarUnit } from './_hooks/useGrammarUnit';
import LessonSidebar from './_components/LessonSidebar';
import TheoryView from './_components/TheoryView';
import ExerciseView from './_components/ExerciseView';

interface GrammarLessonClientProps {
  bookSlug: string;
  unitOrder: number;
}

export default function GrammarLessonClient({ bookSlug, unitOrder }: GrammarLessonClientProps) {
  const { unit, isLoading, error, progress, markTheoryDone, submitExerciseResult } = useGrammarUnit(bookSlug, unitOrder);
  const [activeTab, setActiveTab] = useState<'theory' | 'exercise'>('theory');

  if (isLoading) return <LoadingSpinner />;
  if (error || !unit) return <ErrorState message={error} />;

  const handleFinishTheory = () => {
    markTheoryDone();
    setActiveTab('exercise');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12">
      <LessonSidebar activeTab={activeTab} onTabChange={setActiveTab} progress={progress} />

      <div className="flex-1 bg-white min-h-[600px] border-l border-gray-100 pl-0 lg:pl-12">
        <div className="border-b border-gray-200 pb-4 mb-8">
          <h2 className="text-xl font-bold">Unit {unitOrder}: {unit.title}</h2>
        </div>

        {activeTab === 'theory' && unit.theoryContent && (
          <TheoryView htmlContent={unit.theoryContent} onFinish={handleFinishTheory} />
        )}

        {activeTab === 'exercise' && (
          <ExerciseView exercises={unit.exercises} onComplete={submitExerciseResult} />
        )}
      </div>
    </div>
  );
}
```

This is now ~50 lines instead of 347.

---

## Step 4: Update Page Components to Fetch from API

### 4a. Book List Page

**File:** `frontend-web/src/app/ielts/grammar/page.tsx`

Replace the hardcoded import with API fetch:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { grammarApi } from '@/services/learning.api';
import type { GrammarBook } from '@/types';
import Link from 'next/link';

export default function IeltsGrammarPage() {
  const [books, setBooks] = useState<GrammarBook[]>([]);

  useEffect(() => {
    grammarApi.getBooks().then(setBooks);
  }, []);

  return (
    <div className="flex-1 min-w-0 bg-white overflow-y-auto p-6 md:p-8 w-full h-full shrink-0">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {books.map(book => (
          <Link key={book.id} href={`/ielts/grammar/${book.slug}`} className="block h-full group">
            {/* Book card — same UI as current GrammarContent.tsx */}
          </Link>
        ))}
      </div>
    </div>
  );
}
```

### 4b. Topic Page (Unit List)

**File:** `frontend-web/src/app/ielts/grammar/[topicSlug]/page.tsx`

Replace hardcoded `grammarBooks.find()` with API call:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { grammarApi } from '@/services/learning.api';
import type { GrammarBookWithUnits, GrammarUnitProgress } from '@/types';
import UnitListClient from './UnitListClient';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function BookPage() {
  const { topicSlug } = useParams<{ topicSlug: string }>();
  const [book, setBook] = useState<GrammarBookWithUnits | null>(null);
  const [progress, setProgress] = useState<GrammarUnitProgress[]>([]);

  useEffect(() => {
    grammarApi.getBook(topicSlug).then(setBook);
    grammarApi.getProgress(topicSlug).then(setProgress).catch(() => {});
  }, [topicSlug]);

  if (!book) return null; // or loading spinner

  return (
    <>
      <div className="container mx-auto max-w-screen-xl px-4 py-8">
        <div className="mb-8">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 opacity-80 mb-2">
            <Link href="/ielts/grammar" className="hover:text-slate-900 transition-colors">Grammar</Link>
            <span className="opacity-30">/</span>
            <span className="text-slate-900">{book.level}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{book.name}</h1>
        </div>
        <UnitListClient units={book.units} topicSlug={topicSlug} bookColor={book.color} bookLevel={book.level} progress={progress} />
      </div>
    </>
  );
}
```

### 4c. Lesson Page

**File:** `frontend-web/src/app/ielts/grammar/[topicSlug]/[lessonSlug]/page.tsx`

Pass `bookSlug` + `unitOrder` to `GrammarLessonClient` instead of resolved data:

```tsx
'use client';

import { useParams } from 'next/navigation';
import GrammarLessonClient from './GrammarLessonClient';
import Link from 'next/link';

export default function UnitPage() {
  const { topicSlug, lessonSlug } = useParams<{ topicSlug: string; lessonSlug: string }>();
  const unitOrder = parseInt(lessonSlug.replace('unit', ''), 10);

  return (
    <div className="container mx-auto max-w-screen-xl px-4 py-8">
      <div className="mb-8">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 opacity-80 mb-2">
          <Link href="/ielts/grammar" className="hover:text-slate-900 transition-colors">Grammar</Link>
          <span className="opacity-30">/</span>
          <Link href={`/ielts/grammar/${topicSlug}`} className="hover:text-slate-900 transition-colors">{topicSlug}</Link>
          <span className="opacity-30">/</span>
          <span className="text-slate-900">Unit {unitOrder}</span>
        </div>
      </div>
      <GrammarLessonClient bookSlug={topicSlug} unitOrder={unitOrder} />
    </div>
  );
}
```

---

## Step 5: Clean Up Dead Code

After all pages are API-driven:

1. **Delete** `frontend-web/src/app/grammar/data.ts` — No longer needed
2. **Delete** `frontend-web/src/app/grammar/GrammarContent.tsx` — Replaced by inline code in `page.tsx`
3. **Delete** `frontend-web/src/app/grammar/page.tsx` and `frontend-web/src/app/grammar/layout.tsx` — Old route, replaced by `/ielts/grammar/`
4. **Remove** `intermediateUnitContent` import from `GrammarLessonClient.tsx`

---

## Component Architecture Summary

```
[topicSlug]/[lessonSlug]/
├── page.tsx                         # Route shell, passes bookSlug + unitOrder
├── GrammarLessonClient.tsx          # Orchestrator (~50 lines)
├── _hooks/
│   └── useGrammarUnit.ts            # Data fetching + progress (~50 lines)
└── _components/
    ├── TheoryView.tsx               # Theory HTML renderer (~40 lines)
    ├── ExerciseView.tsx             # Exercise orchestrator (~100 lines)
    ├── FillBlankExercise.tsx         # Fill-blank renderer (~60 lines)
    ├── MatchExercise.tsx            # Match renderer (~60 lines)
    ├── ResultModal.tsx              # Score results overlay (~50 lines)
    └── LessonSidebar.tsx            # Theory/Exercise tabs (~50 lines)
```

## Verification Checklist

- [ ] `/ielts/grammar` loads book cards from API (not hardcoded)
- [ ] `/ielts/grammar/intermediate` loads units from API with server progress
- [ ] `/ielts/grammar/intermediate/unit1` loads theory + exercises from API
- [ ] Completing theory calls `PUT /grammar/progress` with `theoryCompleted: true`
- [ ] Submitting exercises calls `PUT /grammar/progress` with scores
- [ ] Progress persists across page refreshes (server-side, not localStorage)
- [ ] Unit list shows completion badges from server progress
- [ ] No imports remain from `@/app/grammar/data.ts`
- [ ] `GrammarLessonClient.tsx` is ≤120 lines
- [ ] All sub-components are ≤120 lines

## Files to Create/Modify

| File | Action |
|------|--------|
| `frontend-web/src/app/ielts/grammar/page.tsx` | **REWRITE** — Fetch from API |
| `frontend-web/src/app/ielts/grammar/[topicSlug]/page.tsx` | **REWRITE** — Fetch from API |
| `frontend-web/src/app/ielts/grammar/[topicSlug]/[lessonSlug]/page.tsx` | **REWRITE** — Pass slugs to client |
| `frontend-web/src/app/ielts/grammar/[topicSlug]/[lessonSlug]/GrammarLessonClient.tsx` | **REWRITE** — Thin orchestrator |
| `frontend-web/src/app/ielts/grammar/[topicSlug]/[lessonSlug]/_hooks/useGrammarUnit.ts` | **CREATE** |
| `frontend-web/src/app/ielts/grammar/[topicSlug]/[lessonSlug]/_components/TheoryView.tsx` | **CREATE** |
| `frontend-web/src/app/ielts/grammar/[topicSlug]/[lessonSlug]/_components/ExerciseView.tsx` | **CREATE** |
| `frontend-web/src/app/ielts/grammar/[topicSlug]/[lessonSlug]/_components/FillBlankExercise.tsx` | **CREATE** |
| `frontend-web/src/app/ielts/grammar/[topicSlug]/[lessonSlug]/_components/MatchExercise.tsx` | **CREATE** |
| `frontend-web/src/app/ielts/grammar/[topicSlug]/[lessonSlug]/_components/ResultModal.tsx` | **CREATE** |
| `frontend-web/src/app/ielts/grammar/[topicSlug]/[lessonSlug]/_components/LessonSidebar.tsx` | **CREATE** |
| `frontend-web/src/app/grammar/data.ts` | **DELETE** |
| `frontend-web/src/app/grammar/GrammarContent.tsx` | **DELETE** |
| `frontend-web/src/app/grammar/page.tsx` | **DELETE** |
| `frontend-web/src/app/grammar/layout.tsx` | **DELETE** |

## Dependencies

- **Requires Phase 1 complete**: Seed data must exist in DB for API to return content.
- **Requires Phase 2 complete**: Backend endpoints must exist for frontend to call.
