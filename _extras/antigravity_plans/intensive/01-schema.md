# Phase 1: Database Schema Normalization

## Objective
Add new Prisma models to replace the monolithic `Exam.questions: Json` column with a normalized relational hierarchy for IELTS Intensive.

## Prerequisites
- None (first phase)

## Context
- Current schema: `backend-core/prisma/schema.prisma`
- Current `Exam` model is at line 62, uses `questions Json` for all data
- Existing IELTS models start at line 774 (IeltsSkill, IeltsLesson, etc. — these are for IELTS Basic, NOT Intensive)
- IELTS Advanced practice models at line 912 (`IeltsPracticeListeningPart`, `IeltsPracticeReadingPart`) — these already have `content Json` and `transcript Json`
- **DO NOT modify or remove any existing models.** Only ADD new models.

## New Models to Create

Add these models at the end of `schema.prisma`, before the closing of the file. Add a section comment `// IELTS INTENSIVE NORMALIZED MODELS`.

### 1. `IeltsIntensiveExam`
```prisma
model IeltsIntensiveExam {
  id              String   @id @default(uuid())
  title           String   // "Cambridge IELTS 17 - Listening Test 1"
  skill           IeltsIntensiveSkill
  difficulty      Difficulty  // Reuse existing enum
  durationMinutes Int
  imageUrl        String?
  isPublished     Boolean  @default(false)
  metadata        Json?    // Speaking: { examiner: { name, role, avatarUrl } }
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  parts           IeltsIntensivePart[]

  @@map("ielts_intensive_exams")
}

enum IeltsIntensiveSkill {
  LISTENING
  READING
  WRITING
  SPEAKING
}
```

### 2. `IeltsIntensivePart`
```prisma
model IeltsIntensivePart {
  id         String  @id @default(uuid())
  examId     String
  partNumber Int     // 1, 2, 3, 4
  partType   String  // "Basic Conversation", "Short Monologue", "Reading Passage", etc.
  topic      String?
  audioUrl   String? // Listening only
  transcript Json?   // Listening only — [{ speaker, text, question_number?, highlight_text? }]
  order      Int

  exam           IeltsIntensiveExam     @relation(fields: [examId], references: [id], onDelete: Cascade)
  passage        IeltsIntensivePassage?
  questionGroups IeltsIntensiveQuestionGroup[]

  @@map("ielts_intensive_parts")
}
```

### 3. `IeltsIntensivePassage`
```prisma
model IeltsIntensivePassage {
  id             String @id @default(uuid())
  partId         String @unique
  passageTitle   String?
  passageText    String @db.Text  // Full reading passage markdown/text

  part           IeltsIntensivePart @relation(fields: [partId], references: [id], onDelete: Cascade)

  @@map("ielts_intensive_passages")
}
```

### 4. `IeltsIntensiveQuestionGroup`
```prisma
model IeltsIntensiveQuestionGroup {
  id               String  @id @default(uuid())
  partId           String
  questionType     String  // Discriminator slug: "note_completion", "mcq_single", "matching", etc.
  questionRange    String  // "1-5", "27-31"
  instructions     String  @db.Text  // "Complete the notes below. Write ONE WORD ONLY..."
  optionsBox       Json?   // For matching/word-bank: { title, options: { A: "...", B: "..." } }
  tableStructure   Json?   // For table_completion: { headers: [...] }
  contentStructure Json?   // For note_completion: [{ heading, subheading, staticPoints }]
  order            Int

  part             IeltsIntensivePart       @relation(fields: [partId], references: [id], onDelete: Cascade)
  questions        IeltsIntensiveQuestion[]

  @@map("ielts_intensive_question_groups")
}
```

### 5. `IeltsIntensiveQuestion`
```prisma
model IeltsIntensiveQuestion {
  id               String  @id @default(uuid())
  groupId          String
  questionNumber   Int
  questionText     String? @db.Text  // Stem, sentence with blank, statement, cue card text, or essay prompt
  answer           String?           // Correct answer (Listening/Reading ONLY). NULL for Writing/Speaking.
  options          Json?             // Listening/Reading MCQ: { A: "...", B: "...", C: "..." }
                                     // Writing: { minWords: 150, taskType: "map" }
                                     // Speaking: { video: "url", video2: "url" }
  prompt           String?           // Matching: left-side label (e.g., "dairy", "large barn")
  timestampSeconds Int?              // Listening: audio sync point in seconds
  gradingNote      String?           // e.g., "IN EITHER ORDER"
  imageUrl         String?           // Writing Task 1 chart/map image, Reading diagram label image
  order            Int

  group            IeltsIntensiveQuestionGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)

  @@map("ielts_intensive_questions")
}
```

> **How `options` Json is used per skill:**
> - **Listening/Reading MCQ:** `{ "A": "option text", "B": "option text", "C": "option text" }`
> - **Writing Task 1:** `{ "minWords": 150, "taskType": "map" }` — taskType for analytics tagging
> - **Writing Task 2:** `{ "minWords": 250 }`
> - **Speaking Part 1/3:** `{ "video": "examiner_video_url" }` — per-question examiner video
> - **Speaking Part 2:** `{ "video": "intro_video_url", "video2": "followup_video_url" }`

### 6. `IeltsIntensiveSession` and `IeltsIntensiveResult`
```prisma
model IeltsIntensiveSession {
  id          String   @id @default(uuid())
  userId      String
  examId      String
  status      SessionStatus @default(IN_PROGRESS)  // Reuse existing enum
  answers     Json     // Listening/Reading: { "1": "litter", "2": "B" }
                       // Writing: { "1": "full essay text...", "2": "full essay text..." }
                       // Speaking: { "1": "audio_blob_url", "2": "audio_blob_url" }
  timeTaken   Int?     // Seconds
  practicePart Int?    // If practicing a single part
  startedAt   DateTime @default(now())
  submittedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  exam        IeltsIntensiveExam @relation(fields: [examId], references: [id], onDelete: Cascade)
  result      IeltsIntensiveResult?

  @@map("ielts_intensive_sessions")
}

model IeltsIntensiveResult {
  id             String  @id @default(uuid())
  userId         String
  sessionId      String  @unique
  totalScore     Float   // Listening/Reading: raw score (0-40). Writing/Speaking: overall band (0-9)
  scoreByType    Json?   // Listening/Reading ONLY: { "note_completion": { correct: 5, total: 6 } }
  bandScores     Json?   // Writing/Speaking ONLY: per-criterion band scores
                         // Writing: { taskAchievement, coherenceCohesion, lexicalResource, grammaticalRange }
                         // Speaking: { fluencyCoherence, lexicalResource, grammaticalRange, pronunciation }
  feedback       Json?   // AI-generated textual feedback (comments, suggestions)
  gradedAt       DateTime @default(now())
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  session        IeltsIntensiveSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@map("ielts_intensive_results")
}
```

## Steps

1. **Add relation fields to `User` model** (around line 50, before `@@map("users")`):
   ```prisma
   ieltsIntensiveSessions     IeltsIntensiveSession[]
   ieltsIntensiveResults      IeltsIntensiveResult[]
   ```

2. **Add relation field to `IeltsIntensiveExam`**:
   ```prisma
   sessions IeltsIntensiveSession[]
   ```
   (Already shown in the model definition above)

3. **Add all 7 models** after the existing schema content (before the end of the file).

4. **Run migration**:
   ```bash
   cd backend-core
   npx prisma migrate dev --name add_ielts_intensive_normalized
   ```

5. **Generate client**:
   ```bash
   npx prisma generate
   ```

## Validation
- `npx prisma validate` should pass with no errors
- `npx prisma migrate dev` should create the migration successfully
- Check that the 7 new tables exist in the database:
  - `ielts_intensive_exams`
  - `ielts_intensive_parts`
  - `ielts_intensive_passages`
  - `ielts_intensive_question_groups`
  - `ielts_intensive_questions`
  - `ielts_intensive_sessions`
  - `ielts_intensive_results`

## Important Notes
- **DO NOT delete or modify the existing `Exam` model** — it's still used by the current system.
- The `SessionStatus` and `Difficulty` enums already exist — reuse them.
- The `IeltsIntensiveSkill` enum is NEW — do not confuse with existing `ExamType` enum.

## Per-Skill Field Mapping

This schema stores all 4 skills in the **same tables**. Here's exactly which fields are used by which skill:

### `IeltsIntensivePart` — per skill
| Field | LISTENING | READING | WRITING | SPEAKING |
|---|---|---|---|---|
| `partNumber` | 1-4 | 1-3 | 1-2 | 1-3 |
| `partType` | "Basic Conversation" etc. | "Reading Passage" | "Task 1" / "Task 2" | "Part 1: Interview" etc. |
| `topic` | ✅ | ✅ | ✅ | ✅ |
| `audioUrl` | ✅ required | ❌ null | ❌ null | ❌ null |
| `transcript` | ✅ required | ❌ null | ❌ null | ❌ null |
| `passage` (relation) | ❌ none | ✅ required | ❌ none | ❌ none |

### `IeltsIntensiveQuestion` — per skill
| Field | LISTENING | READING | WRITING | SPEAKING |
|---|---|---|---|---|
| `questionText` | Sentence with blank, MCQ stem | Statement, MCQ stem | Essay prompt | Speaking question text, cue card |
| `answer` | ✅ "litter", "B" | ✅ "TRUE", "C" | **null** (AI-graded) | **null** (AI-graded) |
| `options` | MCQ: `{A,B,C}` | MCQ: `{A,B,C,D}` | `{minWords, taskType}` | `{video, video2}` |
| `prompt` | Matching labels | Matching labels | ❌ null | ❌ null |
| `timestampSeconds` | ✅ audio sync | ❌ null | ❌ null | ❌ null |
| `imageUrl` | Rare (diagram) | Rare (diagram) | ✅ chart/map image | ❌ null |

### `IeltsIntensiveResult` — per skill
| Field | LISTENING | READING | WRITING | SPEAKING |
|---|---|---|---|---|
| `totalScore` | Raw 0-40 | Raw 0-40 | Band 0-9 | Band 0-9 |
| `scoreByType` | ✅ per question type | ✅ per question type | ❌ null | ❌ null |
| `bandScores` | ❌ null | ❌ null | ✅ 4 criteria | ✅ 4 criteria |
| `feedback` | ❌ null | ❌ null | ✅ AI comments | ✅ AI comments |

### Grading method
| Skill | Method | Timing |
|---|---|---|
| LISTENING | Exact-match against `question.answer` | Synchronous |
| READING | Exact-match against `question.answer` | Synchronous |
| WRITING | AI grades essay text via RabbitMQ | Async |
| SPEAKING | AI grades audio recording via RabbitMQ | Async |
