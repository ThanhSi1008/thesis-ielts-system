# V4 Feature: Per-Sentence Accuracy Score + Attempt Tracking

> **Scope**: Dictation + Shadowing  
> **Risk**: LOW — backward-compatible schema additions  
> **Estimated Effort**: Medium (2–3 sessions)  
> **Dependencies**: None — builds on existing progress system

---

## 1. Problem Statement

### Current State

| Aspect | Dictation | Shadowing |
|:---|:---|:---|
| **Score** | `checkAnswers()` returns `boolean` — no granularity | No score at all — user self-marks "Done" |
| **Attempts** | `retry()` resets `isChecked` with zero history | N/A — no retry concept |
| **Backend stores** | `completedSentences: Int[]` (indices only) | `completedSentences: Int[]` (indices only) |
| **Completion** | Binary: done or not done | Binary: done or not done |

**Impact:** A student who gets 2/10 words right on attempt #5 and one who gets 10/10 on attempt #1 are recorded identically. Progress metrics are meaningless.

### Target State

Both Dictation and Shadowing persist **per-sentence scores and attempt counts**, enabling:
- Meaningful progress analytics on the completion screen
- Quality-weighted XP rewards
- Foundation for future adaptive difficulty & review queues

---

## 2. Data Model Changes

### 2.1 Prisma Schema

**File:** `backend-core/prisma/schema.prisma`

```prisma
model DictationProgress {
  // ... existing fields (id, userId, lessonId, completedSentences, difficulty, timestamps)
  sentenceScores  Json?  // NEW — see shape below
}

model ShadowingProgress {
  // ... existing fields (id, userId, lessonId, completedSentences, timestamps)
  sentenceScores  Json?  // NEW — see shape below
}
```

### 2.2 `sentenceScores` JSON Shape

```typescript
// Shared type for both Dictation and Shadowing
type SentenceScores = Record<number, SentenceScoreEntry>;

interface SentenceScoreEntry {
  score: number;       // 0–100 (percentage of correct words)
  attempts: number;    // total check/record attempts on this sentence
  bestScore: number;   // highest score achieved across attempts
  lastAttemptAt: string; // ISO timestamp
}

// Example value:
{
  "0": { "score": 100, "attempts": 1, "bestScore": 100, "lastAttemptAt": "2026-05-08T15:00:00Z" },
  "1": { "score": 70,  "attempts": 3, "bestScore": 70,  "lastAttemptAt": "2026-05-08T15:02:00Z" },
  "2": { "score": 90,  "attempts": 2, "bestScore": 90,  "lastAttemptAt": "2026-05-08T15:04:00Z" }
}
```

> [!NOTE]
> Using `Json?` (nullable) ensures full backward compatibility — existing rows with `null` work as before.

---

## 3. Backend Changes

### 3.1 DTOs

**File:** `backend-core/src/modules/dictation/dto/upsert-dictation-progress.dto.ts`

Add optional field:
```typescript
@IsOptional()
sentenceScores?: Record<number, { score: number; attempts: number; bestScore: number; lastAttemptAt: string }>;
```

**File:** `backend-core/src/modules/shadowing/dto/upsert-shadowing-progress.dto.ts`

Add same optional field:
```typescript
@IsOptional()
sentenceScores?: Record<number, { score: number; attempts: number; bestScore: number; lastAttemptAt: string }>;
```

### 3.2 Progress Services — Upsert Logic

**Files:**
- `backend-core/src/modules/dictation/services/dictation-progress.service.ts`
- `backend-core/src/modules/shadowing/services/shadowing-progress.service.ts`

Changes to `upsert()` method:

1. **Merge `sentenceScores`** — don't overwrite blindly; merge incoming scores with existing scores, keeping `bestScore` as the max:

```typescript
// Pseudocode for merge logic
const existingScores = (existing?.sentenceScores as SentenceScores) ?? {};
const incomingScores = dto.sentenceScores ?? {};

const mergedScores: SentenceScores = { ...existingScores };
for (const [idx, entry] of Object.entries(incomingScores)) {
  const prev = mergedScores[idx];
  mergedScores[idx] = {
    score: entry.score,
    attempts: (prev?.attempts ?? 0) + entry.attempts,
    bestScore: Math.max(prev?.bestScore ?? 0, entry.score),
    lastAttemptAt: entry.lastAttemptAt,
  };
}
```

2. **Pass `mergedScores`** into the Prisma `upsert` update/create.

### 3.3 Progress Services — Read Logic

**`findByLesson()` method** — return `sentenceScores` alongside existing fields:

```typescript
return {
  completedSentences: (row?.completedSentences as number[]) ?? [],
  difficulty: row?.difficulty ?? "Intermediate",  // dictation only
  sentenceScores: (row?.sentenceScores as SentenceScores) ?? {},  // NEW
};
```

### 3.4 Gamification — Quality-Weighted XP

**Current** (dictation-progress.service.ts L69-76):
```typescript
// Flat 2 XP per new sentence regardless of quality
if (newCount > existingCount) {
  this.gamificationService.onEvent(userId, {
    xp: 2 * (newCount - existingCount),
    reason: "DICTATION_SENTENCE",
  });
}
```

**New** — bonus XP for high accuracy and first-attempt success:

```typescript
if (newCount > existingCount && dto.sentenceScores) {
  let totalXp = 0;
  for (const idx of newSentenceIndices) {
    const entry = dto.sentenceScores[idx];
    if (!entry) { totalXp += 2; continue; }

    // Base: 2 XP
    let sentenceXp = 2;
    // Accuracy bonus: +1 if score >= 80, +2 if score === 100
    if (entry.score === 100) sentenceXp += 2;
    else if (entry.score >= 80) sentenceXp += 1;
    // First-attempt bonus: +1 if attempts === 1
    if (entry.attempts === 1) sentenceXp += 1;

    totalXp += sentenceXp;
  }

  this.gamificationService.onEvent(userId, {
    xp: totalXp,
    reason: "DICTATION_SENTENCE",
  });
}
```

Same pattern applies to `shadowing-progress.service.ts`.

---

## 4. Frontend Changes

### 4.1 API Types

**File:** `frontend-web/src/services/dictation.api.ts`

```typescript
export interface SentenceScoreEntry {
  score: number;
  attempts: number;
  bestScore: number;
  lastAttemptAt: string;
}

export interface DictationProgressData {
  completedSentences: number[];
  difficulty: string;
  sentenceScores: Record<number, SentenceScoreEntry>;  // NEW
}
```

**File:** `frontend-web/src/services/shadowing.api.ts`

```typescript
export interface SentenceScoreEntry {
  score: number;
  attempts: number;
  bestScore: number;
  lastAttemptAt: string;
}

export interface ShadowingProgressData {
  completedSentences: number[];
  sentenceScores: Record<number, SentenceScoreEntry>;  // NEW
}
```

Update `upsertProgress` DTO type in both API files to include optional `sentenceScores`.

### 4.2 Dictation Hook — Score Calculation

**File:** `frontend-web/src/app/shadowing-dictation/dictation/_hooks/useDictation.ts`

Current `checkAnswers()` returns `boolean`. Change to return a **score object**:

```typescript
interface CheckResult {
  isAllCorrect: boolean;
  score: number;         // 0–100
  correctCount: number;
  totalHidden: number;
}

const checkAnswers = (): CheckResult => {
  if (!currentSentence?.words) return { isAllCorrect: false, score: 0, correctCount: 0, totalHidden: 0 };

  let correctCount = 0;
  const totalHidden = hiddenIndices.size;

  currentSentence.words.forEach((word, idx) => {
    if (hiddenIndices.has(idx) && normalizeWord(userInputs[idx]) === normalizeWord(word)) {
      correctCount++;
    }
  });

  const score = totalHidden > 0 ? Math.round((correctCount / totalHidden) * 100) : 100;
  const isAllCorrect = correctCount === totalHidden;

  setIsChecked(true);
  setIsAllCorrect(isAllCorrect);
  return { isAllCorrect, score, correctCount, totalHidden };
};
```

### 4.3 Dictation Hook — Attempt Counter

**File:** `frontend-web/src/app/shadowing-dictation/dictation/_hooks/useDictation.ts`

Add `attemptCount` state:

```typescript
const [attemptCount, setAttemptCount] = useState(0);

// Reset on sentence change (inside existing useEffect)
setAttemptCount(0);

// Increment on each check
const checkAnswers = (): CheckResult => {
  setAttemptCount(prev => prev + 1);
  // ... existing logic
};

// Return attemptCount from hook
return { ..., attemptCount };
```

### 4.4 Progress Hook — Persist Scores

**File:** `frontend-web/src/app/shadowing-dictation/dictation/_hooks/useDictationProgress.ts`

Add `sentenceScores` state and update `markCompleted` to accept score data:

```typescript
const [sentenceScores, setSentenceScores] = useState<Record<number, SentenceScoreEntry>>({});

// Load from server in fetchProgress
if (progress.sentenceScores) {
  setSentenceScores(progress.sentenceScores);
}

// Updated markCompleted signature
const markCompleted = useCallback(
  (index: number, scoreEntry?: { score: number; attempts: number }) => {
    // ... existing completedSentences logic ...

    // Merge score entry
    const newScores = { ...sentenceScores };
    if (scoreEntry) {
      const prev = newScores[index];
      newScores[index] = {
        score: scoreEntry.score,
        attempts: (prev?.attempts ?? 0) + scoreEntry.attempts,
        bestScore: Math.max(prev?.bestScore ?? 0, scoreEntry.score),
        lastAttemptAt: new Date().toISOString(),
      };
      setSentenceScores(newScores);
    }

    // Send to backend
    dictationApi.upsertProgress({
      lessonId,
      completedSentences: next,
      difficulty,
      sentenceScores: newScores,
    });
  },
  [lessonId, difficulty, sentenceScores]
);

return { ..., sentenceScores };
```

### 4.5 Practice Page — Wire Score into markCompleted

**File:** `frontend-web/src/app/shadowing-dictation/dictation/[id]/page.tsx`

Update `handleNext()`:

```typescript
const handleNext = () => {
  if (!currentSentence) return;
  if (isChecked) {
    // Pass score data to markCompleted
    markCompleted(currentIndex, {
      score: lastCheckResult.score,    // from useDictation
      attempts: attemptCount,          // from useDictation
    });
  }
  if (currentIndex < totalSentences - 1) {
    setCurrentIndex(currentIndex + 1);
  }
};
```

### 4.6 Shadowing — Score from Speech Recognition

**File:** `frontend-web/src/app/shadowing-dictation/shadowing/[id]/page.tsx`

Calculate a score from `spokenWords` vs sentence words before marking complete:

```typescript
const calculateShadowingScore = (): number => {
  if (!currentSentence?.words || spokenWords.length === 0) return 0;
  const total = currentSentence.words.length;
  let correct = 0;
  currentSentence.words.forEach((word, idx) => {
    if (normalizeWord(spokenWords[idx] || '') === normalizeWord(word)) correct++;
  });
  return Math.round((correct / total) * 100);
};

const handleNext = () => {
  if (!currentSentence) return;
  const score = calculateShadowingScore();
  markCompleted(currentIndex, { score, attempts: 1 });
  // ... rest of existing logic
};
```

### 4.7 Completion Screen — Session Stats

**Files:**
- `frontend-web/src/app/shadowing-dictation/dictation/_components/DictationCompletionScreen.tsx`
- `frontend-web/src/app/shadowing-dictation/shadowing/_components/ShadowingCompletionScreen.tsx`

Add new props and render stats:

```typescript
interface CompletionScreenProps {
  // ... existing props
  sentenceScores: Record<number, SentenceScoreEntry>;  // NEW
  totalSentences: number;                               // NEW
}
```

Display:
- **Average Score**: mean of all `score` values
- **First-Attempt Rate**: count of entries where `attempts === 1` / total
- **Hardest Sentences**: bottom 3 by `bestScore`
- **Perfect Sentences**: count where `bestScore === 100`

---

## 5. File Change Summary

| Layer | File | Change Type |
|:---|:---|:---|
| **DB** | `schema.prisma` | Add `sentenceScores Json?` to 2 models |
| **Backend** | `upsert-dictation-progress.dto.ts` | Add optional `sentenceScores` field |
| **Backend** | `upsert-shadowing-progress.dto.ts` | Add optional `sentenceScores` field |
| **Backend** | `dictation-progress.service.ts` | Merge scores in upsert, return in read, quality XP |
| **Backend** | `shadowing-progress.service.ts` | Merge scores in upsert, return in read, quality XP |
| **Frontend** | `dictation.api.ts` | Add `SentenceScoreEntry` type, update DTO |
| **Frontend** | `shadowing.api.ts` | Add `SentenceScoreEntry` type, update DTO |
| **Frontend** | `useDictation.ts` | Return score + correctCount + attemptCount |
| **Frontend** | `useDictationProgress.ts` | Store/persist/load sentenceScores |
| **Frontend** | `useShadowingProgress.ts` | Store/persist/load sentenceScores |
| **Frontend** | `dictation/[id]/page.tsx` | Pass score data to markCompleted |
| **Frontend** | `shadowing/[id]/page.tsx` | Calculate shadowing score, pass to markCompleted |
| **Frontend** | `DictationCompletionScreen.tsx` | Render session statistics |
| **Frontend** | `ShadowingCompletionScreen.tsx` | Render session statistics |

---

## 6. Migration Plan

```bash
# 1. Generate migration
npx prisma migrate dev --name add-sentence-scores

# 2. Verify existing data unaffected (sentenceScores = null for all rows)
# 3. Deploy backend changes
# 4. Deploy frontend changes
```

---

## 7. Acceptance Criteria

- [ ] `sentenceScores Json?` column exists on both `DictationProgress` and `ShadowingProgress`
- [ ] Migration runs without errors on existing data
- [ ] Dictation `checkAnswers()` returns `{ isAllCorrect, score, correctCount, totalHidden }`
- [ ] Each dictation check increments `attemptCount` (visible in hook return)
- [ ] `markCompleted()` accepts and persists `{ score, attempts }` per sentence
- [ ] Backend merges incoming scores (cumulative attempts, max bestScore)
- [ ] Shadowing calculates word-match score from `spokenWords` before marking complete
- [ ] Completion screen shows: avg score, first-attempt rate, hardest sentences, perfect count
- [ ] XP awards scale with accuracy: base 2 + up to 3 bonus per sentence
- [ ] Existing users with `null` sentenceScores see no regressions
- [ ] All existing API endpoints remain backward-compatible
