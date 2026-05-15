# IELTS Basic Speaking — Requirements & Suggestions

## Context: What We Already Have

| Layer | Current Status |
|-------|---------------|
| **Skill Record** | `IeltsBasicSkill` row exists (`name: "Speaking"`, `order: 4`) — but has **zero lessons and zero exercises** |
| **Schema** | No `IeltsBasicSpeakingExercise` model exists. `IeltsBasicProgress` has no `speakingExerciseId` field |
| **Seeder** | `ielts-basic.seeder.ts` iterates `["listening", "reading", "writing"]` — "speaking" is excluded |
| **Frontend** | `ExerciseDetailContent.tsx` handles `isListening`, `isReading`, `isWriting` — no `isSpeaking` branch |
| **UI Containers** | 3 layout files exist: `ListeningExerciseLayout`, `ReadingExerciseLayout`, `WritingClozeLayout` — no Speaking layout |

---

## 1. The IELTS Speaking Test — What It Actually Is

The real IELTS Speaking exam is a **live face-to-face interview** (11-14 minutes) with 3 parts:

| Part | Name | Duration | What Happens |
|------|------|----------|-------------|
| 1 | **Introduction & Interview** | 4-5 min | Examiner asks familiar questions about yourself, home, work, studies, hobbies |
| 2 | **Individual Long Turn (Cue Card)** | 3-4 min | You receive a topic card, get 1 min to prepare, then speak for 1-2 minutes non-stop |
| 3 | **Two-way Discussion** | 4-5 min | Examiner asks deeper, more abstract follow-up questions related to Part 2's topic |

### Scoring Criteria (4 equally weighted)
1. **Fluency & Coherence** — Speak at length without hesitation; use linking words
2. **Lexical Resource** — Use varied, natural vocabulary; avoid repetition
3. **Grammatical Range & Accuracy** — Mix simple and complex structures correctly
4. **Pronunciation** — Stress, intonation, individual sounds (not accent!)

---

## 2. The Core Problem: How to Practice Speaking in a Web App?

> [!IMPORTANT]
> Unlike Listening (audio playback), Reading (passage display), and Writing (cloze fill), Speaking requires **production**. The user must *generate* language, not just *select* it. This is the hardest skill to build self-study exercises for.

### 2.1 Approaches (Ranked by Feasibility)

| Approach | Complexity | Audio Required? | Auto-Gradable? | Recommendation |
|----------|-----------|----------------|----------------|----------------|
| **A. MCQ-based theory + vocabulary drill** | 🟢 Low | No | Yes | ✅ Phase 1 — ship immediately |
| **B. Cue card + model answer (read-along)** | 🟢 Low | Optional TTS | No (self-assess) | ✅ Phase 1 — ship immediately |
| **C. Sentence ordering / discourse structuring** | 🟡 Medium | No | Yes | ✅ Phase 1 — good interactive exercise |
| **D. Voice recording + self-comparison** | 🟡 Medium | Yes (record) | No (self-assess) | ⚠️ Phase 2 — needs MediaRecorder API |
| **E. AI-powered pronunciation scoring** | 🔴 High | Yes (record + analyze) | Partial | ❌ Out of scope for Basic module |

### 2.2 Recommended Strategy

**Phase 1 (Text-based, auto-gradable — fits existing architecture):**
- Theory lessons following the same 3-section + Quiz pattern
- Exercises using existing auto-gradable question types

**Phase 2 (Audio-based, self-assessed — requires new UI):**
- Cue card practice with timer + voice recording
- Model answer audio playback for self-comparison

---

## 3. Content Layer — Theory Lessons (6 lessons)

Each lesson follows the existing `writing_theory.txt` format:
`- Content → Task Achievement + Grammar & Cohesion + Lexical Resource → Quiz`

| # | Lesson Title | Content Focus |
|---|---|---|
| 1 | **Introduction to Speaking** | Test structure (3 parts), timing, scoring criteria, common mistakes, how to prepare |
| 2 | **Part 1 — Personal Questions** | How to give extended answers (not one-word), the AREA method (Answer → Reason → Example → Add-on) |
| 3 | **Part 2 — The Cue Card** | How to read the card, 1-minute planning technique, how to structure 2 minutes of speech, signposting |
| 4 | **Part 3 — Abstract Discussion** | How to discuss abstract ideas, giving balanced opinions, speculating about the future |
| 5 | **Fluency & Coherence Mastery** | Fillers that work vs fillers that hurt, self-correction techniques, discourse markers |
| 6 | **Pronunciation & Lexical Resource** | Word stress patterns, intonation for questions vs statements, collocations, paraphrasing |

---

## 4. Exercise Layer — What Format?

> [!IMPORTANT]
> The key insight: Speaking exercises in a web app must test the **knowledge** that enables good speaking, not the speaking itself. We test: vocabulary selection, discourse structure, and strategic awareness.

### 4.1 Exercise Types (All auto-gradable, no audio needed)

#### Type 1: Vocabulary Cloze (Reuse `WritingClozeLayout`)
Fill in blanks in model answers with appropriate speaking vocabulary.

**Example — Part 1 question: "What do you do in your free time?"**
```
"Well, to be ___[honest/frank/truthful/serious], I'm quite into outdoor 
activities. I ___[particularly/especially/specifically/mainly] enjoy hiking 
because it helps me ___[unwind/relax/decompress/destress] after a long week."
```
> **Rationale:** This directly reuses the existing cloze engine and `WritingClozeLayout`. Minimal new code required.

#### Type 2: Sentence Ordering (New question type)
Given a scrambled model answer, put sentences in the correct order to form a coherent response.

**Example — Part 2 cue card: "Describe a book you enjoyed reading"**
```
Drag into correct order:
[ ] "What made it so special was the way the author depicted..."
[ ] "The book I'd like to talk about is '1984' by George Orwell."  
[ ] "I first read it during my university years..."
[ ] "Overall, I'd say this book completely changed my perspective on..."
```
> **Rationale:** Tests discourse structure (introduction → detail → reflection → conclusion) which is the core skill in Part 2.

#### Type 3: Best Response MCQ (New question type)
Given an examiner question, select the best response from 4 options.

**Example — Part 1: "Do you enjoy cooking?"**
```
A) "Yes."  ← too short
B) "Yes, I love cooking. I cook every day. Cooking is my hobby." ← repetitive  
C) "Well, actually I'm quite passionate about cooking. I particularly enjoy 
    experimenting with Thai cuisine because..." ← natural, extended, uses range
D) "I think cooking is very important for health." ← doesn't answer the question
```
> **Rationale:** Teaches *what a good answer sounds like* — extended, natural, with examples. Auto-gradable via single correct answer.

#### Type 4: Cue Card Planning (Structured fill-in)
Given a Part 2 cue card, fill in a planning template.

**Cue Card:**
```
Describe a place you have visited that you found very beautiful.
You should say:
- where it was
- when you went there  
- what you did there
- and explain why you found it beautiful.
```

**Planning template (fill in the blanks):**
```
Where:    ___[Ha Long Bay / Tokyo / Paris / My hometown]
When:     ___[last summer / two years ago / last month / yesterday]  
What did: ___[took a boat tour / went shopping / visited museums / stayed home]
Why beautiful: ___[stunning limestone islands / modern architecture / ...]
```
> **Rationale:** Teaches the critical 1-minute planning phase. Auto-gradable since answers must be contextually consistent.

### 4.2 Exercise Count Suggestion

| Essay Type / Part | Exercises | Format |
|---|---|---|
| Part 1 — Personal Questions | 6 | Cloze (vocabulary in model answers) |
| Part 2 — Cue Card Practice | 5 | Sentence Ordering + Cue Card Planning |
| Part 3 — Discussion | 4 | Best Response MCQ |
| Mixed — Fluency & Lexical | 3 | Cloze (discourse markers & collocations) |
| **Total** | **18** | |

---

## 5. Schema Changes Required

### Option A: Reuse `IeltsBasicWritingExercise` with `taskType` expansion
Since speaking cloze exercises share the exact same data shape (prompt + modelAnswer JSON), we could add `taskType: 3` for speaking. **Pros:** Zero schema migration. **Cons:** Semantically confusing — "WritingExercise" holding speaking data.

### Option B: Create `IeltsBasicSpeakingExercise` (Recommended)

```prisma
model IeltsBasicSpeakingExercise {
  id            String   @id @default(uuid())
  skillId       String
  lessonId      String?
  topic         String                    // e.g., "Part 1 - Hobbies"
  partType      Int                       // 1, 2, or 3
  questionType  String                    // "cloze" | "ordering" | "mcq" | "planning"
  instructions  String?
  prompt        String   @db.Text         // The examiner question or cue card text
  content       Json                      // Question-type-specific data (blanks, options, order)
  modelAnswer   Json?                     // For cloze: same format as writing. For ordering: correct sequence.
  order         Int
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  skill    IeltsBasicSkill   @relation(fields: [skillId], references: [id], onDelete: Cascade)
  lesson   IeltsBasicLesson? @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  progress IeltsBasicProgress[]

  @@map("ielts_speaking_exercises")
}
```

Also need:
- Add `speakingExerciseId String?` to `IeltsBasicProgress`
- Add the relation to `IeltsBasicSpeakingExercise`
- Update the `@@unique` constraint

---

## 6. Frontend Changes Required

### 6.1 Exercise Layout

Create `SpeakingExerciseLayout.tsx` with conditional rendering based on `questionType`:

| `questionType` | UI Component |
|---|---|
| `"cloze"` | Reuse `WritingClozeLayout` internals (no diagram pane, full-width prompt) |
| `"ordering"` | New drag-and-drop sentence ordering component |
| `"mcq"` | New radio-button MCQ component (similar to theory quiz) |
| `"planning"` | New structured grid with dropdowns per bullet point |

### 6.2 Navigation
- Update `ExerciseDetailContent.tsx` to add `isSpeaking` branch
- Update `exercises/page.tsx` to fetch from `speaking-exercises` endpoint
- Update `ClientExerciseListGroup.tsx` progress tracking for speaking

### 6.3 Theory Button Icons
For Speaking, the 3 theory sections map to:
| Section | Icon | Color |
|---|---|---|
| **Fluency & Coherence** | `MessageCircle` | 🟢 Green |
| **Grammar & Pronunciation** | `Volume2` | 🔵 Blue |
| **Lexical Resource** | `BookOpen` | 🟡 Yellow |

---

## 7. Implementation Priority

> [!TIP]
> Ship in **2 phases** to get value fast without blocking on audio features.

### Phase 1 — Text-Based (fits existing architecture)
1. Author `speaking_theory.txt` (6 lessons, same format as writing)
2. Create `speaking_exercises.txt` → `convert_speaking_cloze.js` → `speaking_cloze_auto.json`
3. Add `IeltsBasicSpeakingExercise` to schema
4. Update seeder, service, controller
5. Create `SpeakingExerciseLayout.tsx` (cloze + MCQ modes)
6. Wire up navigation and progress tracking

### Phase 2 — Audio-Based (future enhancement)
1. Add `MediaRecorder` API integration for voice recording
2. Cue card timer component (1 min prep → 2 min speak)
3. Audio playback for model answers (native speaker recordings or TTS)
4. Self-assessment rubric UI (rate yourself on 4 criteria)

---

## 8. Key Design Decisions to Make

| # | Decision | Options | My Recommendation |
|---|----------|---------|-------------------|
| 1 | Separate model or reuse WritingExercise? | A) Reuse with `taskType:3` / B) New model | **B** — cleaner separation, supports `partType` + `questionType` fields |
| 2 | Include audio in Phase 1? | A) Yes (TTS) / B) No | **B** — text-only first, audio in Phase 2 |
| 3 | How many exercise types in Phase 1? | A) Cloze only / B) Cloze + MCQ / C) All 4 types | **B** — Cloze + MCQ. Save ordering & planning for Phase 2 |
| 4 | How to name theory sections? | A) Same as Writing / B) Speaking-specific | **B** — "Fluency & Coherence", "Grammar & Pronunciation", "Lexical Resource" |
