# Stage 6 — Module Deep Dives

> Each section traces one module from database → backend → frontend, showing the full-stack slice.

---

## Module 1: Vocabulary (4000 Essential English Words)

### What It Does
Users learn vocabulary through 6 books × 30 units. Each unit has ~20 words with images/audio, fill-in exercises, and a reading comprehension passage.

### Database Models
- `VocabularyBook` → `VocabularyUnit` → `VocabularyWord` / `VocabularyExercise` / `VocabularyReadingPassage`
- `VocabularyProgress` (per user per unit)

### Backend Flow
- `VocabularyService.getUnitDetail(slug)` → returns unit with all words, exercises, reading passage via Prisma includes
- `VocabularyService.updateProgress(userId, unitId, data)` → upserts progress

### Frontend Pages
- `/ielts/vocabulary` → Book selector (VocabularyContent.tsx)
- `/ielts/vocabulary/[bookSlug]` → Unit list with progress bars
- `/ielts/vocabulary/[bookSlug]/[unitSlug]` → Unit learning page with tabs:
  - **Word List** — Flip cards with audio, images, definitions
  - **Exercises** — Fill-in-the-blank + multiple choice
  - **Reading** — Split-pane: passage on left, questions on right (50/50)
  - **Summary** — Progress bar + score
- Users can add any word to Vocab Lab via `GlobalVocabFab` → `AddCardModal`

### Key Files
```
backend-core/src/modules/vocabulary/
frontend-web/src/app/ielts/vocabulary/
frontend-web/src/services/learning.api.ts
backend-core/prisma/data/vocabulary.ts (seed data)
```

---

## Module 2: Grammar (145 Units)

### What It Does
145 grammar lessons organized by topic (e.g., "Tenses", "Articles", "Conditionals"). Each lesson has structured content (explanations + examples) and interactive exercises.

### Database Models
- `GrammarTopic` → `GrammarLesson` (content + exercises as JSON)
- `GrammarProgress` (per user per lesson)

### Frontend Pages
- `/ielts/grammar` → Topic list (grouped visually)
- `/ielts/grammar/[topicSlug]` → Lessons within a topic
- `/ielts/grammar/[topicSlug]/[lessonSlug]` → Lesson with content + exercises

### Key Files
```
backend-core/src/modules/grammar/
frontend-web/src/app/ielts/grammar/
backend-core/prisma/data/grammar-topics.ts, grammar-lessons.ts
```

---

## Module 3: Pronunciation (IPA Sounds + AI)

### What It Does
Teaches all 44 English IPA sounds. Users listen to examples, view mouth diagrams, practice individual words, and record themselves for AI scoring.

### Data Flow (AI scoring)
```
User records audio → POST /pronunciation/check (multipart)
  → PronunciationService creates attempt, uploads audio to MinIO
  → Publishes to pronunciation-check-queue
  → pronunciation_consumer.py → Whisper STT → scoring → DB update
  → Frontend polls for result
```

### Database Models
- `PronunciationSound` — IPA catalog (44 sounds)
- `PronunciationAttempt` — Individual recording attempts
- `PronunciationProgress` — Per-user per-sound mastery (with wordProgress JSON)

### Frontend Pages
- `/ielts/pronunciation` → Sound grid (vowels, consonants, diphthongs)
- `/ielts/pronunciation/sounds/[symbol]` → Sound detail + practice + recording
- `/pronunciation/[lessonSlug]` → Foundation pronunciation (simplified)

### Key Files
```
backend-core/src/modules/pronunciation/
backend-ai/app/consumers/pronunciation_consumer.py
backend-ai/app/services/transcription_service.py, pronunciation_service.py
frontend-web/src/app/ielts/pronunciation/
frontend-web/src/components/pronunciation/
```

---

## Module 4: Shadowing & Dictation

### What It Does
Users practice listening and speaking by shadowing YouTube videos subtitle-by-subtitle. Also includes dictation mode where users type what they hear.

### Database Models
- `ShadowingVideo` — YouTube video with timestamped subtitles (JSON)
- `ShadowingFolder` — User-created folders
- `ShadowingDictationProgress` — Per-subtitle-line progress with score

### Frontend Pages
- `/shadowing-dictation` → Video list with folders
- `/shadowing-dictation/[videoId]` → Video player + subtitle-by-subtitle practice

### Key Files
```
backend-core/src/modules/shadowing/
frontend-web/src/app/shadowing-dictation/
frontend-web/src/services/shadowing.api.ts
backend-core/prisma/data/shadowing-lessons.ts
```

---

## Module 5: Vocab Lab (Anki-style SRS)

### What It Does
Full-featured flashcard system with FSRS scheduling algorithm. Users create decks, add cards (manually or from vocabulary module), study with spaced repetition, and track detailed statistics.

### FSRS Algorithm
- Rating: 1=Again, 2=Hard, 3=Good, 4=Easy
- Updates: stability, difficulty, scheduledDays, reps, lapses, due date
- States: NEW → LEARNING → REVIEW (and RELEARNING on lapses)

### Database Models
- `Deck` → `Flashcard` → `FlashcardReview`
- `CardType` → `CardTypeField` / `CardTemplate` (custom card type system)

### Frontend Structure (sidebar tabs)
- **Decks** — List + create decks, study due cards
- **Add** — Card creation form with card type selection
- **Browse** — 3-panel layout: filters | card list (searchable, sortable) | card editor
- **Stats** — Analytics dashboard: KPI cards, review activity chart, donut charts, forecast, hourly activity

### Key Files
```
backend-core/src/modules/vocab-lab/
frontend-web/src/app/vocab-lab/
frontend-web/src/services/vocabLab.api.ts
```

---

## Module 6: IELTS Exams (Intensive Practice)

### What It Does
Full IELTS exam practice with real Cambridge test materials. Listening parts with audio, reading passages with questions, writing tasks with AI grading, speaking tasks with audio recording + AI grading.

### Exam Types
- **Listening** — Audio + form completion, multiple choice, matching
- **Reading** — Passages + TRUE/FALSE/NOT GIVEN, matching headings, summary completion
- **Writing** — Task 1 (describe data) + Task 2 (essay) → Gemini AI grading
- **Speaking** — Parts 1/2/3 with prompts → audio recording → Whisper + Gemini grading

### Database Models
- `IeltsPracticeListeningPart` / `IeltsPracticeReadingPart` — Question banks
- `IeltsPracticeSession` / `IeltsPracticeReadingSession` — User attempts
- `IeltsWritingUserAnswer` — Writing submissions with AI feedback
- `IeltsBasicProgress` — Basic lesson tracking

### Frontend Pages
- `/ielts/intensive` → Catalog of all practice parts
- `/ielts/intensive/[examId]` → Exam-taking interface
- `/ielts/intensive/[examId]/result/[sessionId]` → Result review

### Key Files
```
backend-core/src/modules/ielts/
backend-core/src/modules/exams/
backend-ai/app/services/writing_grader.py, speaking_grader.py
frontend-web/src/app/ielts/intensive/
frontend-web/src/components/WritingTaskBoard.tsx, SpeakingTaskBoard.tsx
```

---

## Module 7: Dashboard & Profile

### What It Does
Central hub showing study streaks, target band score, overall progress across modules, and a study roadmap.

### Database Models
- `IeltsProfile` — Target band, daily commitment, streak tracking
- All progress models feed into dashboard statistics

### Frontend Pages
- `/ielts/dashboard` — Overview with streak, progress cards, daily targets
- `/ielts/roadmap` — Study plan with milestones
- `/ielts/statistics` — Detailed analytics across all modules
- `/ielts/calculator` — IELTS band score calculator
- `/ielts/student-teacher` — Student-teacher linking interface
