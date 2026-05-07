# Phase 3 — Schema + Seeder + Backend API

> **Goal:** Create `IeltsBasicSpeakingExercise` model, update `IeltsBasicProgress`, update seeder and API.
> **Dependencies:** Phase 2 (needs `speaking_cloze_auto.json`). **Effort:** ~2 hours.

---

## Step 1: Schema Changes

**File:** `backend-core/prisma/schema.prisma`

### 1.1 — Create `IeltsBasicSpeakingExercise` model

Add after `IeltsBasicWritingAnswer` (around line 964):

```prisma
model IeltsBasicSpeakingExercise {
  id            String      @id @default(uuid())
  skillId       String
  lessonId      String?
  topic         String                    // e.g., "Part 1 — Hobbies"
  partType      Int                       // 1, 2, or 3
  questionType  String      @default("cloze")  // "cloze" | "mcq"
  instructions  String?
  prompt        String      @db.Text
  content       Json?                     // For MCQ: { question, options, correctAnswer }
  modelAnswer   Json?                     // For cloze: same format as writing { paragraphs: [...] }
  order         Int
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  skill    IeltsBasicSkill   @relation(fields: [skillId], references: [id], onDelete: Cascade)
  lesson   IeltsBasicLesson? @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  progress IeltsBasicProgress[]

  @@map("ielts_speaking_exercises")
}
```

### 1.2 — Update `IeltsBasicProgress`

Add `speakingExerciseId` field:

```prisma
model IeltsBasicProgress {
  id                  String   @id @default(uuid())
  userId              String
  lessonId            String?
  listeningExerciseId String?
  readingExerciseId   String?
  writingExerciseId   String?
  speakingExerciseId  String?              // ← ADD THIS
  isCompleted         Boolean  @default(false)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  user              User                    @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson            IeltsBasicLesson?            @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  listeningExercise IeltsBasicListeningExercise? @relation(fields: [listeningExerciseId], references: [id], onDelete: Cascade)
  readingExercise   IeltsBasicReadingExercise?   @relation(fields: [readingExerciseId], references: [id], onDelete: Cascade)
  writingExercise   IeltsBasicWritingExercise?   @relation(fields: [writingExerciseId], references: [id], onDelete: Cascade)
  speakingExercise  IeltsBasicSpeakingExercise?  @relation(fields: [speakingExerciseId], references: [id], onDelete: Cascade)  // ← ADD THIS

  @@unique([userId, lessonId, listeningExerciseId, readingExerciseId, writingExerciseId, speakingExerciseId], name: "user_item_unique")  // ← UPDATE THIS (add speakingExerciseId)
  @@map("ielts_basic_progress")
}
```

### 1.3 — Update `IeltsBasicSkill`

Add the relation:

```prisma
model IeltsBasicSkill {
  // ... existing fields ...
  speakingExercises IeltsBasicSpeakingExercise[]  // ← ADD THIS
}
```

Also add to `IeltsBasicLesson`:
```prisma
model IeltsBasicLesson {
  // ... existing fields ...
  speakingExercises IeltsBasicSpeakingExercise[]  // ← ADD THIS
}
```

### 1.4 — Run Migration

> **IMPORTANT:** Stop the backend dev server FIRST on Windows.

```bash
cd backend-core
npx prisma db push
npx prisma generate
```

---

## Step 2: Update the Seeder

**File:** `backend-core/prisma/seeders/ielts-basic.seeder.ts`

### 2.1 — Add speaking to the clean-up section

Find the cleanup block (around line 10-13):

```typescript
await prisma.ieltsBasicListeningExercise.deleteMany({});
await prisma.ieltsBasicReadingExercise.deleteMany({});
await prisma.ieltsBasicWritingExercise.deleteMany({});
```

Add:
```typescript
await prisma.ieltsBasicSpeakingExercise.deleteMany({});
```

### 2.2 — Add speaking theory seeding

After the Writing Task 2 theory section, add:

```typescript
// 6. Parse Speaking Theory
const speakingTheoryPath = path.join(baseDir, "speaking_theory.txt");
if (fs.existsSync(speakingTheoryPath)) {
  console.log("  Seeding Speaking Theory...");
  const speakingSkill = await prisma.ieltsBasicSkill.findUnique({
    where: { name: "Speaking" },
  });

  if (speakingSkill) {
    const speakingTheoryArr = getTheoryLessons(speakingTheoryPath);
    let order = 1;
    for (const theory of speakingTheoryArr) {
      const lesson = await prisma.ieltsBasicLesson.create({
        data: {
          skillId: speakingSkill.id,
          chapter: `Chapter ${String(order).padStart(2, "0")}`,
          title: theory.title,
          content: theory.content,
          quiz: theory.quiz,
          order: order++,
        },
      });
      console.log(`    -> Created Speaking lesson: ${lesson.title}`);
    }
  }
}
```

### 2.3 — Add speaking exercise seeding

```typescript
// 7. Parse Speaking Exercises (Auto-Generated Cloze + MCQ)
const speakingExercisesPath = path.join(baseDir, "speaking_cloze_auto.json");
if (fs.existsSync(speakingExercisesPath)) {
  console.log("  Seeding Speaking Exercises...");
  const speakingText = fs.readFileSync(speakingExercisesPath, "utf-8");
  const speakingExercises = JSON.parse(speakingText);

  const speakingSkill = await prisma.ieltsBasicSkill.findUnique({
    where: { name: "Speaking" },
  });

  if (speakingSkill) {
    let exOrder = 1;
    for (const exObj of speakingExercises) {
      const { theme, subCategory, prompt, partType, questionType, modelAnswer, content } = exObj;
      const topicName = subCategory ? `${theme} - ${subCategory}` : theme;

      const lesson = await prisma.ieltsBasicLesson.findFirst({
        where: { skillId: speakingSkill.id, title: theme },
      });

      await prisma.ieltsBasicSpeakingExercise.create({
        data: {
          skillId: speakingSkill.id,
          lessonId: lesson ? lesson.id : null,
          topic: topicName,
          partType: partType || 1,
          questionType: questionType || "cloze",
          instructions: questionType === "mcq"
            ? "Select the best response to the examiner's question."
            : "Complete the model answer by selecting the most appropriate word or phrase.",
          prompt: prompt || "",
          content: content || null,
          modelAnswer: modelAnswer || null,
          order: exOrder++,
        },
      });
      console.log(`    Created speaking exercise: ${topicName}`);
    }
  }
}
```

### 2.4 — Update `getTheoryLessons()` for Speaking sub-blocks

Find the section in `getTheoryLessons()` that maps block names to types (look for `task achievement` or `"traps"`). Add a check for "fluency":

```typescript
// Existing:
if (sectionName.toLowerCase().includes("task achievement")) {
  currentContentType = "traps";
// Add:
} else if (sectionName.toLowerCase().includes("fluency")) {
  currentContentType = "traps";
```

The existing checks for "grammar" → "strategy" and "lexical" → "tips" will already match the speaking sub-block names.

---

## Step 3: Update Backend Service

**File:** `backend-core/src/modules/ielts/ielts.service.ts`

### 3.1 — Add Speaking CRUD methods

```typescript
// ── Speaking ──────────────────────────────────────────────────────────

async findSpeakingExercisesByLesson(lessonId: string) {
  return this.prisma.ieltsBasicSpeakingExercise.findMany({
    where: { lessonId },
    orderBy: { order: "asc" },
    select: { id: true, topic: true, order: true, partType: true, questionType: true },
  });
}

async findSpeakingExerciseById(exerciseId: string) {
  const exercise = await this.prisma.ieltsBasicSpeakingExercise.findUnique({
    where: { id: exerciseId },
  });

  if (!exercise) {
    throw new NotFoundException(
      `Speaking exercise with ID ${exerciseId} not found`,
    );
  }

  return exercise;
}
```

### 3.2 — Update `markItemCompleted` to accept `speakingExerciseId`

Add `speakingExerciseId?: string` to the data parameter type and include it in the findFirst/create queries.

### 3.3 — Update `getLibraryStats` to count speaking exercises

Add speaking exercise counting alongside the existing listening/reading/writing counts.

---

## Step 4: Update Backend Controller

**File:** `backend-core/src/modules/ielts/ielts.controller.ts`

Add speaking endpoints after the writing section:

```typescript
// ── Speaking exercises ──────────────────────────────────────────────────

@Get("lessons/:id/speaking-exercises")
async getSpeakingExercisesByLesson(@Param("id") id: string) {
  return this.ieltsService.findSpeakingExercisesByLesson(id);
}

@Get("speaking-exercises/:id")
async getSpeakingExercise(@Param("id") id: string) {
  return this.ieltsService.findSpeakingExerciseById(id);
}
```

---

## Step 5: Re-Seed and Verify

```bash
cd backend-core
# Stop backend first (Windows file lock)
npx prisma db push
npx prisma generate
npm run prisma:seed

# Expected output:
# Seeding Speaking Theory...
#     -> Created Speaking lesson: Introduction to Speaking
#     ... (6 lessons)
# Seeding Speaking Exercises...
#     Created speaking exercise: Part 1 — Personal Questions - Hobbies
#     ... (18 exercises)
```

### Verify via API

```bash
# Get speaking exercises for a lesson
curl http://localhost:3000/api/v1/ielts/lessons/<LESSON_ID>/speaking-exercises

# Get a single speaking exercise
curl http://localhost:3000/api/v1/ielts/speaking-exercises/<EXERCISE_ID>
```
