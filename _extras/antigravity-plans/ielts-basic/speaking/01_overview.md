# IELTS Basic Speaking — Master Plan

> **Entry point** for adding Speaking lessons (theory) and exercises (cloze + MCQ) to the IELTS Basic module.
> Each phase is in its own file for independent implementation.

---

## Current Architecture Snapshot

| Layer | Technology | Key Files |
|-------|-----------|-----------| 
| **Backend** | NestJS + Prisma + PostgreSQL | `backend-core/src/modules/ielts/` |
| **Frontend** | Next.js 14 (App Router) | `frontend-web/src/app/ielts/basic/` |
| **Seeder** | ts-node script | `backend-core/prisma/seeders/ielts-basic.seeder.ts` |
| **Data Files** | TXT (theory) + JSON (exercises) | `backend-core/prisma/data/ielts-basic-compiled/` |
| **Converter** | Node.js script | `backend-core/prisma/data/convert_cloze.js` |

### Current Speaking Status
- `IeltsBasicSkill` row exists (`name: "Speaking"`, `order: 4`) — but has **zero lessons and zero exercises**
- **No** `IeltsBasicSpeakingExercise` model in the Prisma schema
- **No** `speakingExerciseId` in `IeltsBasicProgress`
- Seeder iterates `["listening", "reading", "writing"]` — "speaking" is excluded
- `ExerciseDetailContent.tsx` handles `isListening`, `isReading`, `isWriting` — **no** `isSpeaking` branch
- Exercise layout containers: `ListeningExerciseLayout`, `ReadingExerciseLayout`, `WritingClozeLayout` — **no** Speaking layout

### Existing Module Pattern (for reference)
- Theory files: TXT with nested indentation (`- LessonTitle` → `- Content` → `- Quiz`)
- Exercise files: TXT parsed by converter into JSON, then read by seeder
- Seeder: `ielts-basic.seeder.ts` reads both theory + exercise files in sequence
- Frontend: `ExerciseDetailContent.tsx` routes to layout component based on skill type

---

## Design Decisions (Already Agreed)

| # | Decision | Chosen Option |
|---|----------|---------------|
| 1 | Separate model or reuse WritingExercise? | **New model** — `IeltsBasicSpeakingExercise` |
| 2 | Include audio in Phase 1? | **No** — text-only, audio deferred to Phase 2 |
| 3 | Exercise types in Phase 1? | **Cloze + MCQ** — two auto-gradable formats |
| 4 | Theory section naming? | **Speaking-specific** — "Fluency & Coherence", "Grammar & Pronunciation", "Lexical Resource" |

---

## The IELTS Speaking Test — Reference

The real IELTS Speaking exam is a **live 11-14 minute interview** with 3 parts:

| Part | Name | Duration | What Happens |
|------|------|----------|-------------|
| 1 | **Introduction & Interview** | 4-5 min | Familiar questions about yourself, home, work, studies, hobbies |
| 2 | **Individual Long Turn (Cue Card)** | 3-4 min | Receive a topic card → 1 min prep → speak for 1-2 min non-stop |
| 3 | **Two-way Discussion** | 4-5 min | Deeper, abstract follow-up questions related to Part 2's topic |

### Scoring Criteria (4 equally weighted)
1. **Fluency & Coherence** — Speak at length without hesitation; use linking words
2. **Lexical Resource** — Use varied, natural vocabulary; avoid repetition
3. **Grammatical Range & Accuracy** — Mix simple and complex structures correctly
4. **Pronunciation** — Stress, intonation, individual sounds (not accent!)

---

## Feature Summary

### Phase 1 — Content Authoring
Write `speaking_theory.txt` with 6 lessons (Intro + Part 1 + Part 2 + Part 3 + Fluency & Coherence + Pronunciation & Lexical Resource), each with Content (3 sub-blocks) + Quiz.

### Phase 2 — Exercise Data
Write `speaking_exercises.txt` with 18 exercises (cloze model answers + MCQ best-response), then convert to `speaking_cloze_auto.json` using an extended converter script with speaking-specific distractor dictionary.

### Phase 3 — Schema + Seeder + Backend
Create `IeltsBasicSpeakingExercise` model, add `speakingExerciseId` to `IeltsBasicProgress`, update seeder to read speaking files, add API endpoints.

### Phase 4 — Frontend UI
Create `SpeakingExerciseLayout.tsx` with cloze + MCQ modes, update `ExerciseDetailContent.tsx` to add `isSpeaking` branch, wire up navigation and progress tracking.

---

## Exercise Types

### Type 1: Vocabulary Cloze (reuses WritingClozeLayout pattern)
Fill in blanks in model spoken answers with appropriate speaking vocabulary.

```
"Well, to be ___[honest/frank/truthful/serious], I'm quite into outdoor
activities. I ___[particularly/especially/specifically/mainly] enjoy hiking
because it helps me ___[unwind/relax/decompress/destress] after a long week."
```

### Type 2: Best Response MCQ
Given an examiner question, select the best response from 4 options.

```
Examiner: "Do you enjoy cooking?"

A) "Yes."                             ← too short
B) "Yes, I love cooking. I cook       ← repetitive, no depth
    every day. Cooking is my hobby."
C) "Well, actually I'm quite          ← natural, extended, uses range ✓
    passionate about cooking..."
D) "I think cooking is very            ← doesn't answer the question
    important for health."
```

---

## Exercise Distribution

| Part / Category | # of Exercises | Format |
|---|---|---|
| Part 1 — Personal Questions | 6 | Cloze (vocabulary in model answers) |
| Part 2 — Cue Card Responses | 4 | Cloze (discourse structure in model answers) |
| Part 3 — Abstract Discussion | 4 | Cloze (opinion/argument vocabulary) |
| Mixed — Best Response | 4 | MCQ (select the best answer) |
| **Total** | **18** | |

---

## Phase Map

```
Phase 1 (Content) ──▶ Phase 2 (Exercise Data) ──▶ Phase 3 (Schema + Seeder) ──▶ Phase 4 (Frontend)
```

| Phase | File | Scope | Dependencies |
|-------|------|-------|-------------|
| **Phase 1** | `02_phase1_content.md` | Write `speaking_theory.txt` with 6 lessons | None |
| **Phase 2** | `03_phase2_exercises.md` | Write exercises TXT, extend converter, generate JSON | Phase 1 (for theme alignment) |
| **Phase 3** | `04_phase3_backend.md` | New schema model, seeder update, API endpoints | Phase 2 (needs JSON file) |
| **Phase 4** | `05_phase4_frontend.md` | UI layouts, navigation, progress tracking | Phase 3 (needs API) |

---

## Files Created/Modified Summary

### Phase 1
| Action | File |
|--------|------|
| **Created** | `backend-core/prisma/data/ielts-basic-compiled/speaking_theory.txt` |

### Phase 2
| Action | File |
|--------|------|
| **Created** | `backend-core/prisma/data/ielts-basic-compiled/speaking_exercises.txt` |
| **Modified** | `backend-core/prisma/data/convert_cloze.js` — add speaking distractor dictionary + parser |
| **Created** | `backend-core/prisma/data/ielts-basic-compiled/speaking_cloze_auto.json` (auto-generated) |

### Phase 3
| Action | File |
|--------|------|
| **Modified** | `backend-core/prisma/schema.prisma` — add `IeltsBasicSpeakingExercise` model + update `IeltsBasicProgress` |
| **Modified** | `backend-core/prisma/seeders/ielts-basic.seeder.ts` — add speaking seeding section |
| **Modified** | `backend-core/src/modules/ielts/ielts.service.ts` — add speaking exercise CRUD methods |
| **Modified** | `backend-core/src/modules/ielts/ielts.controller.ts` — add speaking exercise API endpoints |

### Phase 4
| Action | File |
|--------|------|
| **Created** | `frontend-web/src/app/ielts/basic/[skill]/exercises/[exerciseId]/_components/containers/SpeakingExerciseLayout.tsx` |
| **Modified** | `frontend-web/src/app/ielts/basic/[skill]/exercises/[exerciseId]/ExerciseDetailContent.tsx` — add `isSpeaking` branch |
| **Modified** | `frontend-web/src/app/ielts/basic/[skill]/exercises/page.tsx` — fetch from `speaking-exercises` endpoint |
| **Modified** | `frontend-web/src/app/ielts/basic/[skill]/exercises/ClientExerciseListGroup.tsx` — track speaking progress |

---

## Reference: Theory TXT Format

The theory TXT uses nested indentation. Speaking uses the same pattern but with **different sub-block names**:

```
- speaking + theory
    - Lesson Title
        - Content
            (markdown content)
            
            - Fluency & Coherence
                (content)
            - Grammar & Pronunciation
                (content)
            - Lexical Resource
                (content)
        - Quiz
            1. Question text
            A) Option A
            B) Option B
            C) Option C
            D) Option D
            **Hint:** hint text
            **Answer:** B
            **Why:** explanation
```

> **IMPORTANT:** The seeder maps sub-block names to modal types:
> - "Fluency & Coherence" → type `"traps"` (green Target icon)
> - "Grammar & Pronunciation" → type `"strategy"` (blue Volume2 icon)  
> - "Lexical Resource" → type `"tips"` (yellow BookOpen icon)
>
> The seeder's `getTheoryLessons()` function identifies these by parsing `- BlockName` at the 12-space indent level. The block names in the TXT file **must** match what the seeder expects. See Phase 1 for the exact mapping.

## Reference: Exercise Data Structure

### Cloze Exercise JSON
```json
{
  "theme": "Part 1 — Personal Questions",
  "subCategory": "Hobbies",
  "partType": 1,
  "questionType": "cloze",
  "prompt": "Do you have any hobbies?",
  "modelAnswer": {
    "paragraphs": [
      {
        "number": 1,
        "title": "Model Response",
        "segments": [
          { "type": "text", "value": "Well, to be " },
          { "type": "blank", "id": "b1", "correctAnswer": "honest,", "options": ["honest,", "frank,", "serious,", "truthful,"] },
          { "type": "text", "value": " I'm quite into outdoor activities." }
        ]
      }
    ]
  }
}
```

### MCQ Exercise JSON
```json
{
  "theme": "Best Response Practice",
  "subCategory": "Part 1",
  "partType": 1,
  "questionType": "mcq",
  "prompt": "Examiner asks: \"Do you enjoy cooking?\"",
  "content": {
    "question": "Which response would score highest?",
    "options": [
      { "id": "A", "text": "Yes.", "feedback": "Too short — the examiner expects extended answers." },
      { "id": "B", "text": "Yes, I love cooking. I cook every day. Cooking is my hobby.", "feedback": "Repetitive — uses 'cooking' 3 times with no variety." },
      { "id": "C", "text": "Well, actually I'm quite passionate about cooking. I particularly enjoy experimenting with Thai cuisine because the combination of flavours is incredibly diverse.", "feedback": "Excellent — extended, natural, uses range, gives a specific example." },
      { "id": "D", "text": "I think cooking is very important for health.", "feedback": "Doesn't directly answer whether YOU enjoy cooking." }
    ],
    "correctAnswer": "C"
  }
}
```
