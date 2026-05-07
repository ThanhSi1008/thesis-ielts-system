# IELTS Writing Task 2 — Master Plan

> **Entry point** for adding Writing Task 2 lessons (theory) and exercises (cloze) to the IELTS Basic module.
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

### Existing Writing Task 1 Pattern
- **Theory:** `writing_theory.txt` — 6 lessons (Intro, Change Over Time, No Change Over Time, Mixed Charts, Maps, Process)
- **Each lesson has:** Content (with 3 sub-blocks: Task Achievement, Grammar + Coherence & Cohesion, Lexical Resource), Quiz (MCQ)
- **Exercises:** `writing_task_1_cloze_auto.json` — 20 exercises, auto-generated from TXT via `convert_cloze.js`
- **Schema:** `IeltsBasicWritingExercise` (prompt, diagramUrl, modelAnswer as JSON, order)
- **UI:** `WritingClozeLayout.tsx` — Two-pane: left = prompt + diagram, right = fill-in-the-blank cloze paragraphs
- **Theory Modals:** 3 buttons (Target=Task Achievement 🟢, Link=Grammar & Cohesion 🔗, BookOpen=Lexical Resource 📖)

### Existing Module Pattern
- Theory files: TXT with nested indentation (`- LessonTitle` → `- Content` → `- Quiz`)
- Exercise files: TXT parsed by `convert_cloze.js` into JSON, then read by seeder
- Seeder: `ielts-basic.seeder.ts` reads both theory + exercise files in sequence
- Frontend: `ExerciseDetailContent.tsx` routes to layout component based on skill type

---

## Feature Summary

### Phase 1 — Content Authoring
Write the `writing_task_2_theory.txt` with 6 lessons (Intro + 5 essay types), each with Content (3 sub-blocks) + Quiz.

### Phase 2 — Exercise Data
Write `writing_task_2_exercises.txt` with 17 model essays, then convert to `writing_task_2_cloze_auto.json` using an extended converter script with Task 2 distractor dictionary.

### Phase 3 — Schema + Seeder + Backend
Add `taskType` field to schema, update seeder to read Task 2 files, update backend API to support filtering by taskType.

### Phase 4 — Frontend UI
Adapt `WritingClozeLayout` for no-diagram layout, update sidebar/navigation to separate Task 1 vs Task 2.

---

## Task 2 Question Types (5 total)

| # | Type | Prompt Pattern |
|---|------|---------------|
| 1 | **Opinion Essay** (Agree/Disagree) | "To what extent do you agree or disagree?" |
| 2 | **Discussion Essay** (Both Views) | "Discuss both views and give your own opinion." |
| 3 | **Problem & Solution** | "What are the problems/causes? What solutions can you suggest?" |
| 4 | **Advantages & Disadvantages** | "Do the advantages outweigh the disadvantages?" |
| 5 | **Two-Part Question** | "Why is this happening? Is this positive or negative?" |

---

## Task 2 Essay Structure (4 paragraphs)

| Paragraph | Task 1 | Task 2 |
|-----------|--------|--------|
| 1 | Introduction (paraphrase prompt) | Introduction (paraphrase + thesis statement) |
| 2 | Overview (main trends) | Body 1 (first argument / view / cause) |
| 3 | Body 1 (detail group) | Body 2 (second argument / view / solution) |
| 4 | Body 2 (detail group) | Conclusion (summarize + restate opinion) |

**Key difference:** Task 2 has NO diagram/chart. The left pane should show only the essay prompt.

---

## Exercise Cloze Data Structure

Identical to Task 1 with one addition (`taskType`):

```json
{
  "theme": "Opinion Essay",
  "subCategory": "Education",
  "prompt": "Some people believe that university education should be free. To what extent do you agree or disagree?",
  "diagramUrl": null,
  "taskType": 2,
  "modelAnswer": {
    "paragraphs": [
      {
        "number": 1,
        "title": "Introduction",
        "segments": [
          { "type": "text", "value": "It is often " },
          { "type": "blank", "id": "b1", "correctAnswer": "argued", "options": ["argued", "denied", "proven", "forgotten"] },
          { "type": "text", "value": " that higher education should be free." }
        ]
      },
      { "number": 2, "title": "Body 1", "segments": [...] },
      { "number": 3, "title": "Body 2", "segments": [...] },
      { "number": 4, "title": "Conclusion", "segments": [...] }
    ]
  }
}
```

---

## Exercise Distribution

| Question Type | # of Exercises |
|---|---|
| Opinion (Agree/Disagree) | 4 |
| Discussion (Both Views) | 4 |
| Problem & Solution | 3 |
| Advantages & Disadvantages | 3 |
| Two-Part Question | 3 |
| **Total** | **17** |

---

## Phase Map

```
Phase 1 (Content) ──▶ Phase 2 (Exercise Data) ──▶ Phase 3 (Schema + Seeder) ──▶ Phase 4 (Frontend)
```

| Phase | File | Scope | Dependencies |
|-------|------|-------|-------------|
| **Phase 1** | `02_phase1_content.md` | Write `writing_task_2_theory.txt` with 6 lessons | None |
| **Phase 2** | `03_phase2_exercises.md` | Write exercises TXT, extend converter, generate JSON | Phase 1 (for theme alignment) |
| **Phase 3** | `04_phase3_backend.md` | Schema migration, seeder update, API changes | Phase 2 (needs JSON file) |
| **Phase 4** | `05_phase4_frontend.md` | UI layout adaptation, sidebar navigation | Phase 3 (needs API) |

---

## Files Created/Modified Summary

### Phase 1
| Action | File |
|--------|------|
| **Created** | `backend-core/prisma/data/ielts-basic-compiled/writing_task_2_theory.txt` |

### Phase 2
| Action | File |
|--------|------|
| **Created** | `backend-core/prisma/data/ielts-basic-compiled/writing_task_2_exercises.txt` |
| **Modified** | `backend-core/prisma/data/convert_cloze.js` — add Task 2 distractor dictionary + parser |
| **Created** | `backend-core/prisma/data/ielts-basic-compiled/writing_task_2_cloze_auto.json` (auto-generated) |

### Phase 3
| Action | File |
|--------|------|
| **Modified** | `backend-core/prisma/schema.prisma` — add `taskType` field to `IeltsBasicWritingExercise` |
| **Modified** | `backend-core/prisma/seeders/ielts-basic.seeder.ts` — add Task 2 seeding section |
| **Modified** | `backend-core/src/modules/ielts/ielts.service.ts` — add taskType filter to queries |
| **Modified** | `backend-core/src/modules/ielts/ielts.controller.ts` — add taskType query param |

### Phase 4
| Action | File |
|--------|------|
| **Modified** | `frontend-web/src/app/ielts/basic/[skill]/exercises/[exerciseId]/_components/containers/WritingClozeLayout.tsx` — responsive layout for no-diagram |
| **Modified** | `frontend-web/src/app/ielts/basic/[skill]/SkillDetailContent.tsx` — separate Task 1 / Task 2 sections |

---

## Reference: Existing Theory TXT Format

The theory TXT uses nested indentation. Here is the exact pattern from `writing_theory.txt`:

```
- writing + theory
    - Lesson Title
        - Content
            (markdown content with tables, images, sub-sections)
            
            - Task Achievement
                (content)
            - Grammar + Coherence & Cohesion
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

The seeder parses this into `IeltsBasicLesson` records with `content` (JSON array of blocks with type: "traps" | "strategy" | "tips") and `quiz` (JSON array of MCQ objects).

## Reference: Existing Writing Exercise TXT Format

```
- writing + exercise
    - Theme Name
        - Sub Category
            - Exercise N
                - Question
                    - Prompt
                        (prompt text)
                    - Diagram Image Link
                        (url or empty for Task 2)
                - Answer
                    - Introduction
                        (paragraph text)
                    - Overview    ← Task 1 only
                        (paragraph text)
                    - Body 1
                        (paragraph text)
                    - Body 2
                        (paragraph text)
                    - Conclusion  ← Task 2 only (replaces Overview)
                        (paragraph text)
```
