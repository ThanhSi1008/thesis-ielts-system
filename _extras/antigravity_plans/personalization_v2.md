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
> **Writing stage uses cloze/gap-fill** since the existing writing exercises are free-text (no auto-scoring). The diagnostic writing section will be a hardcoded academic paragraph with blanks where the user selects the correct academic word from options.

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

**a) Update `processOnboarding()` to accept and store per-skill scores.**

**b) Update `generateRoadmap()` to reduce exercise volume based on per-skill placement scores.**

The key change is in how exercises are added to the roadmap queue per skill. Currently every exercise under a lesson is pushed. The new logic applies a **per-skill reduction ratio**:

#### Roadmap Exercise Reduction Strategy

| Per-skill Score | Lessons | Exercises per Lesson |
|---|---|---|
| **≥ 90%** | Skip (auto-completed) | Skip (auto-completed) |
| **70–89%** | Keep all | Keep only **1** exercise per lesson |
| **50–69%** | Keep all | Keep **half** of exercises per lesson (min 1) |
| **< 50%** | Keep all | Keep **all** exercises (full path) |

**How "keep N exercises" works in the roadmap builder:**

Currently the code does:
```typescript
const exercises = await this.prisma.ieltsListeningExercise.findMany({
  where: { lessonId: lesson.id },
  orderBy: { order: 'asc' },
});
exercises.forEach((ex) => { q.push(...); });
```

With the new logic, we apply a `take` slice based on placement score:
```typescript
const exercises = await this.prisma.ieltsListeningExercise.findMany({
  where: { lessonId: lesson.id },
  orderBy: { order: 'asc' },
});

// Determine how many exercises to include
const skillScore = getSkillScore(profile, skill.name); // e.g., profile.placementListening
let exercisesToInclude: typeof exercises;

if (skillScore >= 90) {
  exercisesToInclude = []; // fully skipped
} else if (skillScore >= 70) {
  exercisesToInclude = exercises.slice(0, 1); // just 1
} else if (skillScore >= 50) {
  exercisesToInclude = exercises.slice(0, Math.max(1, Math.ceil(exercises.length / 2))); // half
} else {
  exercisesToInclude = exercises; // all
}

exercisesToInclude.forEach((ex) => { q.push(...); });
```

For **≥ 90%**, we also skip lessons — the lesson itself is not pushed to the queue either.

**Example with a Listening lesson that has 4 exercises:**

| Score | Lesson in roadmap? | Exercises in roadmap |
|---|---|---|
| 95% | ❌ (skipped) | 0 of 4 |
| 75% | ✅ | 1 of 4 |
| 55% | ✅ | 2 of 4 |
| 30% | ✅ | 4 of 4 |

> [!NOTE]
> For the **≥ 90%** tier, we also auto-mark lessons + exercises as completed in `processOnboarding()` so they appear as "done" rather than invisible. For the **70-89%** and **50-69%** tiers, nothing is marked completed — the roadmap simply generates fewer items.

#### [MODIFY] [ielts.controller.ts](file:///c:/Users/Admin/Desktop/thesis/my%20videos/thesis-toeic-system/backend-core/src/modules/ielts/ielts.controller.ts)

Update the `@Body()` type of `processOnboarding` to include per-skill scores.

---

### 3. Backend — New Endpoint for Placement Exercises

#### [MODIFY] [ielts.controller.ts](file:///c:/Users/Admin/Desktop/thesis/my%20videos/thesis-toeic-system/backend-core/src/modules/ielts/ielts.controller.ts)

Add endpoint:

```typescript
@UseGuards(JwtAuthGuard)
@Get("placement-exercises")
async getPlacementExercises() {
  return this.ieltsService.getPlacementExercises();
}
```

#### [MODIFY] [ielts.service.ts](file:///c:/Users/Admin/Desktop/thesis/my%20videos/thesis-toeic-system/backend-core/src/modules/ielts/ielts.service.ts)

Add method that returns one exercise per skill (first by order):

```typescript
async getPlacementExercises() {
  const listening = await this.prisma.ieltsListeningExercise.findFirst({
    orderBy: { order: 'asc' },
  });
  const reading = await this.prisma.ieltsReadingExercise.findFirst({
    orderBy: { order: 'asc' },
  });
  return { listening, reading, writing: null };
}
```

---

### 4. Frontend — Diagnostic Quiz Component

#### [NEW] [DiagnosticQuiz.tsx](file:///c:/Users/Admin/Desktop/thesis/my%20videos/thesis-toeic-system/frontend-web/src/app/ielts/basic/onboarding/DiagnosticQuiz.tsx)

Main orchestrator component with a **horizontal stepper** (matching the reference image: `Listening → Reading → Writing → Finish`).

**Stepper Design:**
```
  ✓────────────✓────────────○────────────○
Listening    Reading     Writing      Finish
```
- Completed stages: blue filled circle with ✓
- Current stage: blue outlined circle (active)
- Future stages: gray outlined circle

**Stage 1 — Listening:**
- Fetches real exercise via `GET /ielts/placement-exercises`
- Renders `AudioPlayer` + `ListeningQuestionsPanel` (reusing existing components)
- User submits → `calcScore()` → stores percentage → auto-advances to Stage 2

**Stage 2 — Reading:**
- Same — renders `ReadingPassagePanel` + `ReadingQuestionsPanel`
- Submit → score → advance to Stage 3

**Stage 3 — Writing (Cloze/Gap-Fill):**
- Hardcoded academic paragraph with ~6 blanks
- Each blank is MCQ with 4 options (testing vocabulary, collocations, grammar)
- Example: *"The graph **___** the changes in population..."* → `illustrates / tells / says / writes`
- Submit → score → advance to Finish

**Stage 4 — Finish (Results Summary):**
- Per-skill score bars (Listening: 80%, Reading: 60%, Writing: 40%)
- Qualitative labels per skill (Excellent / Good / Needs Work)
- Overall score
- What will happen in the roadmap (e.g., "Your Listening exercises will be reduced")
- "Continue to My Roadmap →" button → calls `onComplete(scores)`

---

### 5. Frontend — Writing Cloze Data

#### [NEW] [writingClozeData.ts](file:///c:/Users/Admin/Desktop/thesis/my%20videos/thesis-toeic-system/frontend-web/src/app/ielts/basic/onboarding/writingClozeData.ts)

Static data file: IELTS Task 1 style paragraph with 6 blanks.

```typescript
export const writingClozeData = {
  instructions: "Complete the paragraph by selecting the correct word for each blank.",
  paragraph: [
    { type: "text", content: "The bar chart " },
    { type: "blank", id: 1, options: ["illustrates", "tells", "says", "writes"], correct: 0 },
    { type: "text", content: " the number of students enrolled in three different courses between 2015 and 2020. " },
    { type: "blank", id: 2, options: ["Overall", "But", "And", "Because"], correct: 0 },
    { type: "text", content: ", the number of students in Science courses " },
    { type: "blank", id: 3, options: ["rose significantly", "went slow", "was bad", "never changed"], correct: 0 },
    // ... 3 more blanks
  ],
  totalBlanks: 6,
};
```

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

## File Change Summary

| Layer | File | Action |
|---|---|---|
| DB | `schema.prisma` | Add 3 columns to IeltsProfile |
| Backend | `ielts-roadmap.service.ts` | Rewrite `processOnboarding` + exercise reduction in `generateRoadmap` |
| Backend | `ielts.controller.ts` | Update body type + new `placement-exercises` endpoint |
| Backend | `ielts.service.ts` | Add `getPlacementExercises()` method |
| Frontend | `DiagnosticQuiz.tsx` | **NEW** — Stepper + 3 stages + results |
| Frontend | `writingClozeData.ts` | **NEW** — Hardcoded writing cloze data |
| Frontend | `onboarding/page.tsx` | Replace DEV placeholder, update handleComplete |

---

## Verification Plan

### Automated Tests
1. `npx prisma migrate dev` — verify migration succeeds
2. Restart backend + frontend
3. Navigate to `/ielts/basic/onboarding` → Step 1 → Step 2 → "Take Placement Test"
4. Verify stepper renders: Listening → Reading → Writing → Finish
5. Complete all three stages → check results card
6. Verify `IeltsProfile` in DB has per-skill scores
7. Check roadmap: for a skill scored ≥90%, lessons+exercises should all be marked completed
8. Check roadmap: for a skill scored 70-89%, all lessons appear but only 1 exercise per lesson
9. Check roadmap: for a skill scored 50-69%, all lessons appear but only half exercises per lesson
10. Check roadmap: for a skill scored <50%, full content appears
