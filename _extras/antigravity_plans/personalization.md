# Add IELTS Diagnostic Placement Test (3-Stage: Listening → Reading → Writing)

Replace the DEV placeholder in onboarding Step 3 with an actual multi-stage placement test that reuses real IELTS Basic exercises from the database.

## Current State

- **Step 1**: Target band + daily commitment ✅
- **Step 2**: "Take Short Placement Test" pitch ✅
- **Step 3**: DEV placeholder with simulated scores → **needs replacement**
- **Backend**: `processOnboarding` accepts `placementScore` (0–100) and auto-completes first 3 lessons+exercises when > 80 (too simplistic — needs rework)

## User Review Required

> [!IMPORTANT]
> **Per-skill scoring changes the backend.** To make the roadmap react intelligently to placement results, we need to store per-skill scores and rewrite the `processOnboarding` logic. The frontend sends `{ listeningScore, readingScore, writingScore }` instead of a single `placementScore`. This requires a **Prisma schema migration** (3 new Int? columns on `IeltsProfile`).

> [!WARNING]
> **Writing stage uses cloze/gap-fill** since the existing writing exercises are free-text (no auto-scoring). The diagnostic writing section will be a hardcoded paragraph with blanks where the user selects the correct academic word from options — much simpler to score automatically.

---

## Proposed Changes

### 1. Database Schema

#### [MODIFY] [schema.prisma](file:///c:/Users/Admin/Desktop/thesis/my%20videos/thesis-toeic-system/backend-core/prisma/schema.prisma)

Add per-skill placement scores to `IeltsProfile`:

```diff
 model IeltsProfile {
   id                  String   @id @default(uuid())
   userId              String   @unique

   targetBand          Float?
   dailyCommitmentMins Int?     @default(30)
   placementScore      Int?
+  placementListening  Int?     // 0–100
+  placementReading    Int?     // 0–100
+  placementWriting    Int?     // 0–100
   onboardingCompleted Boolean  @default(false)
   ...
 }
```

Run `npx prisma migrate dev`.

---

### 2. Backend — Enhanced Onboarding Logic

#### [MODIFY] [ielts-roadmap.service.ts](file:///c:/Users/Admin/Desktop/thesis/my%20videos/thesis-toeic-system/backend-core/src/modules/ielts/ielts-roadmap.service.ts)

**a) Update `processOnboarding()` to accept per-skill scores:**

```typescript
data: {
  targetBand: number;
  dailyCommitmentMins: number;
  takePlacement: boolean;
  placementScore?: number;        // overall (computed on frontend)
  placementListening?: number;    // 0-100
  placementReading?: number;      // 0-100
  placementWriting?: number;      // 0-100
}
```

**b) Replace the current "skip first 3 lessons" approach with per-skill completion logic:**

| Per-skill Score | Action |
|---|---|
| **≥ 80% (Excellent)** | Auto-complete ALL lessons + exercises for that skill. User starts at next skill or advanced content. |
| **50–79% (Intermediate)** | Auto-complete lessons only (mark as read). Keep exercises unlocked for practice. |
| **< 50% (Beginner)** | No auto-skip. User starts from Day 1 for this skill. |

This means a user who scores 90% on Listening but 30% on Reading will skip Listening lessons entirely but start Reading from scratch.

#### [MODIFY] [ielts.controller.ts](file:///c:/Users/Admin/Desktop/thesis/my%20videos/thesis-toeic-system/backend-core/src/modules/ielts/ielts.controller.ts)

Update the `@Body()` type of `processOnboarding` to include per-skill scores.

---

### 3. Backend — New Endpoint for Placement Exercises

#### [MODIFY] [ielts.controller.ts](file:///c:/Users/Admin/Desktop/thesis/my%20videos/thesis-toeic-system/backend-core/src/modules/ielts/ielts.controller.ts)

Add a **public** (no auth guard for simplicity, or use existing auth) endpoint:

```typescript
@Get("placement-exercises")
async getPlacementExercises() {
  return this.ieltsService.getPlacementExercises();
}
```

#### [MODIFY] [ielts.service.ts](file:///c:/Users/Admin/Desktop/thesis/my%20videos/thesis-toeic-system/backend-core/src/modules/ielts/ielts.service.ts)

Add method that returns one exercise per skill from the first lesson:

```typescript
async getPlacementExercises() {
  // Fetch the FIRST listening exercise (order: 'asc', take: 1)
  const listening = await this.prisma.ieltsListeningExercise.findFirst({
    orderBy: { order: 'asc' },
  });
  // Fetch the FIRST reading exercise
  const reading = await this.prisma.ieltsReadingExercise.findFirst({
    orderBy: { order: 'asc' },
  });
  // No writing exercise is usable for auto-scoring, so return null
  return { listening, reading, writing: null };
}
```

---

### 4. Frontend — Diagnostic Quiz Component

#### [NEW] [DiagnosticQuiz.tsx](file:///c:/Users/Admin/Desktop/thesis/my%20videos/thesis-toeic-system/frontend-web/src/app/ielts/basic/onboarding/DiagnosticQuiz.tsx)

Main orchestrator component with a **horizontal stepper** (matching the image: `Listening → Reading → Writing → Finish`).

**Design:**
- Stepper bar at top with circle nodes + connecting lines
- Completed stages show ✓ checkmark (blue fill)
- Current stage is highlighted (blue outline)
- Future stages are grayed out

**Flow:**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Listening   │ →  │  Reading     │ →  │  Writing     │ →  │  Finish      │
│  (real ex.)  │    │  (real ex.)  │    │  (cloze)     │    │  (summary)   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

**Props:**
```typescript
interface DiagnosticQuizProps {
  onComplete: (scores: { listening: number; reading: number; writing: number; overall: number }) => void;
  isSubmitting: boolean;
}
```

**Stage 1 — Listening:** Fetches a real `IeltsListeningExercise` from backend via `GET /ielts/placement-exercises`. Renders the existing `ListeningQuestionsPanel` + `AudioPlayer`. When user submits → calculates score using existing `calcScore()` → stores percentage → moves to Stage 2.

**Stage 2 — Reading:** Same approach with `ReadingExercise`. Renders `ReadingPassagePanel` + `ReadingQuestionsPanel`. Submit → score → Stage 3.

**Stage 3 — Writing (Cloze/Gap-Fill):** Since writing exercises can't be auto-scored, this stage uses a **hardcoded academic paragraph** with blanks. Example:

> *"The graph **_____(1)** the changes in population between 2000 and 2020. **_____(2)**, the urban population rose **_____(3)** while rural areas experienced a **_____(4)** decline."*

Each blank has 4 options (MCQ), testing academic vocabulary and collocations:
1. illustrates / tells / says / writes
2. Overall / But / And / Because  
3. significantly / slow / bad / never
4. gradual / fast / big / more

~6-8 blanks, fully hardcoded in a static file. Uses the same MCQ scoring approach.

**Stage 4 — Finish:** Results summary card showing:
- Per-skill scores with visual bars
- Qualitative labels per skill
- Overall placement percentage
- "Continue to Roadmap →" button → calls `onComplete(scores)`

---

### 5. Frontend — Writing Cloze Data

#### [NEW] [writingClozeData.ts](file:///c:/Users/Admin/Desktop/thesis/my%20videos/thesis-toeic-system/frontend-web/src/app/ielts/basic/onboarding/writingClozeData.ts)

Static data file with 1 IELTS-style paragraph containing 6 blanks. Each blank is an MCQ with 4 options and a correct answer.

---

### 6. Frontend — Onboarding Page Integration

#### [MODIFY] [page.tsx](file:///c:/Users/Admin/Desktop/thesis/my%20videos/thesis-toeic-system/frontend-web/src/app/ielts/basic/onboarding/page.tsx)

- Replace Step 3 DEV placeholder with `<DiagnosticQuiz />`
- Update `handleComplete` to send per-skill scores:

```typescript
const handleComplete = async (
  takePlacement: boolean,
  scores?: { listening: number; reading: number; writing: number; overall: number }
) => {
  await api.post("/ielts/onboarding", {
    targetBand,
    dailyCommitmentMins: dailyCommitment,
    takePlacement,
    placementScore: scores?.overall ?? 0,
    placementListening: scores?.listening,
    placementReading: scores?.reading,
    placementWriting: scores?.writing,
  });
  window.location.href = "/ielts/basic";
};
```

---

## Roadmap Generation — Scoring Suggestions

> [!IMPORTANT]  
> Here are my proposed strategies on how placement scores affect the generated roadmap. Please review and pick a preference.

### Option A: "Skip by Skill" (Recommended)

Each skill is evaluated independently. Per-skill scoring affects only that skill's lessons/exercises:

| Score Range | Skill Impact |
|---|---|
| **≥ 80%** | Auto-complete all lessons AND exercises for that skill — they disappear from the roadmap (marked completed). User effectively "tested out" of that skill's basics. |
| **50–79%** | Auto-complete lessons (theory) only. Exercises remain unlocked and visible in the roadmap for practice. This means "you know the theory but need practice." |
| **< 50%** | Nothing skipped. Full beginner path for this skill. |

**Example:** A user scores Listening=90%, Reading=60%, Writing=30%:
- Listening lessons + exercises → all marked completed (skipped)
- Reading lessons → marked completed, but reading exercises remain
- Writing → everything starts from Day 1

### Option B: "Reduce Volume"

Instead of binary skip/keep, reduce the number of items shown based on score:

| Score Range | Items per skill in roadmap |
|---|---|
| **≥ 80%** | 0 items (fully skipped) |
| **60–79%** | Only exercises (skip lessons) |
| **40–59%** | Skip first N lessons (based on score), keep all exercises |
| **< 40%** | Full content |

### Option C: "Hybrid" — Skip lessons, keep exercises, add a label

All exercises stay in the roadmap, but lessons that would be skipped get a visual "Review" badge instead of being hidden — the user can optionally revisit them but they're not required for progression.

---

## Verification Plan

### Automated Tests
1. Run `npx prisma migrate dev` — verify migration succeeds
2. Restart `npm run web:dev` and backend
3. Navigate to `/ielts/basic/onboarding` → complete Step 1 → Step 2 → click "Take Placement Test"
4. Verify stepper UI renders with Listening → Reading → Writing → Finish
5. Complete all three stages → verify results card shows per-skill breakdown
6. Verify backend receives per-skill scores via `POST /ielts/onboarding`
7. Check `IeltsProfile` in DB has per-skill scores populated
8. Verify roadmap generation reflects the placement scores (e.g., high listening score → listening lessons skipped)

### Manual Verification
- Test edge cases: all correct (100%), all wrong (0%), mixed results
- Verify audio playback works in listening stage
- Verify reading passage renders correctly in reading stage
- Verify writing cloze blanks are interactive and score correctly
