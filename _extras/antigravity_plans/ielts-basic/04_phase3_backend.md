# Phase 3 — Schema + Seeder + Backend API

> **Goal:** Add `taskType` to the Prisma schema, update the seeder to read Task 2 data, update backend API to support filtering.
> **Dependencies:** Phase 2 (needs `writing_task_2_cloze_auto.json`). **Effort:** ~1-2 hours.

---

## Step 1: Schema Migration

**File:** `backend-core/prisma/schema.prisma`

### 1.1 — Add `taskType` field to `IeltsBasicWritingExercise`

Find the model (around line 927):

```prisma
model IeltsBasicWritingExercise {
  id           String      @id @default(uuid())
  skillId      String
  lessonId     String?
  topic        String
  instructions String?
  prompt       String      @db.Text
  diagramUrl   String?
  modelAnswer  Json
  order        Int
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
```

Add `taskType` field AFTER `order`:

```prisma
  order        Int
  taskType     Int         @default(1)  // 1 = Task 1, 2 = Task 2
  createdAt    DateTime    @default(now())
```

### 1.2 — Run Migration

> **IMPORTANT:** Stop the backend dev server FIRST on Windows to avoid file-locking issues.

```bash
cd backend-core
npx prisma db push
npx prisma generate
```

---

## Step 2: Update the Seeder

**File:** `backend-core/prisma/seeders/ielts-basic.seeder.ts`

### 2.1 — Find the existing Task 1 seeding section

Look for this block (around line 154):

```typescript
  // 3. Parse Writing Task 1 Exercises (Auto-Generated Cloze format)
  const writingTask1ExercisesPath = path.join(
    baseDir,
    "writing_task_1_cloze_auto.json",
  );
```

### 2.2 — Add Task 2 seeding section AFTER the Task 1 block

Insert after the closing `}` of the Task 1 section (around line 195):

```typescript
  // 4. Parse Writing Task 2 Exercises (Auto-Generated Cloze format)
  const writingTask2ExercisesPath = path.join(
    baseDir,
    "writing_task_2_cloze_auto.json",
  );
  if (fs.existsSync(writingTask2ExercisesPath)) {
    console.log("  Seeding Writing Task 2 Exercises (Cloze Auto)...");
    const task2Text = fs.readFileSync(writingTask2ExercisesPath, "utf-8");
    const task2Exercises = JSON.parse(task2Text);

    const writingSkillRecord = await prisma.ieltsBasicSkill.findUnique({
      where: { name: "Writing" },
    });

    if (writingSkillRecord) {
      let exOrder = 100; // Start at 100 to avoid collision with Task 1 orders
      for (const exObj of task2Exercises) {
        const { theme, subCategory, prompt, diagramUrl, modelAnswer } = exObj;
        const topicName = subCategory ? `${theme} - ${subCategory}` : theme;

        // Try to match to a Task 2 lesson
        const lesson = await prisma.ieltsBasicLesson.findFirst({
          where: { skillId: writingSkillRecord.id, title: theme },
        });

        await prisma.ieltsBasicWritingExercise.create({
          data: {
            skillId: writingSkillRecord.id,
            lessonId: lesson ? lesson.id : null,
            topic: topicName,
            instructions:
              "Write about the following topic. Give reasons for your answer and include any relevant examples from your own knowledge or experience.",
            prompt: prompt || "",
            diagramUrl: diagramUrl || null,
            modelAnswer: modelAnswer,
            taskType: 2,
            order: exOrder++,
          },
        });
        console.log(`    Created Task 2 writing exercise: ${topicName}`);
      }
    }
  }
```

### 2.3 — Also seed Task 2 Theory Lessons

The existing seeder already handles theory via the `getTheoryLessons()` function at the top of the file. However, it currently only reads `writing_theory.txt`. We need it to ALSO read `writing_task_2_theory.txt`.

Find where `activeSkills` is defined (around line 32):

```typescript
const activeSkills = ["listening", "reading", "writing"];
```

The theory parsing loop uses `${skillName}_theory.txt` as the filename. Since Task 2 theory has a different filename, add a special case AFTER the main skill loop:

```typescript
  // 4.5 Seed Writing Task 2 Theory (separate file)
  const task2TheoryPath = path.join(baseDir, "writing_task_2_theory.txt");
  if (fs.existsSync(task2TheoryPath)) {
    console.log("  Seeding Writing Task 2 Theory...");
    const writingSkillRecord = await prisma.ieltsBasicSkill.findUnique({
      where: { name: "Writing" },
    });

    if (writingSkillRecord) {
      const task2TheoryArr = getTheoryLessons(task2TheoryPath);
      let order = 100; // Start at 100 to separate from Task 1 lessons
      for (const theory of task2TheoryArr) {
        const lesson = await prisma.ieltsBasicLesson.create({
          data: {
            skillId: writingSkillRecord.id,
            chapter: `Task 2 - Chapter ${String(order - 99).padStart(2, "0")}`,
            title: theory.title,
            content: theory.content,
            quiz: theory.quiz,
            order: order++,
          },
        });
        console.log(`    -> Created Task 2 lesson: ${lesson.title}`);
      }
    }
  }
```

---

## Step 3: Update Backend API

### 3.1 — Update Service

**File:** `backend-core/src/modules/ielts/ielts.service.ts`

Find the method that retrieves writing exercises (search for `writingExercise` or `getWritingExercises`).

Add `taskType` filter support:

```typescript
async getWritingExercises(skillId: string, taskType?: number) {
  return this.prisma.ieltsBasicWritingExercise.findMany({
    where: {
      skillId,
      ...(taskType !== undefined ? { taskType } : {}),
    },
    orderBy: { order: "asc" },
  });
}
```

If there's a method that lists ALL writing exercises for a skill page, update it similarly:

```typescript
// Before:
where: { skillId },
// After:
where: { skillId, ...(taskType ? { taskType: parseInt(taskType) } : {}) },
```

### 3.2 — Update Controller

**File:** `backend-core/src/modules/ielts/ielts.controller.ts`

Find the endpoint that serves writing exercises. Add `taskType` as an optional query parameter:

```typescript
@Get('writing-exercises')
async getWritingExercises(
  @Query('skillId') skillId: string,
  @Query('taskType') taskType?: string,
) {
  return this.ieltsService.getWritingExercises(
    skillId,
    taskType ? parseInt(taskType) : undefined,
  );
}
```

---

## Step 4: Re-Seed and Verify

```bash
cd backend-core

# Stop backend first (Windows file lock)
# Then:
npm run prisma:seed

# Expected output should include:
# Seeding Writing Task 1 Exercises (Cloze Auto)...
#     Created writing exercise: Change Over Time - Standard 4 categories
#     ... (20 exercises)
# Seeding Writing Task 2 Theory...
#     -> Created Task 2 lesson: Introduction to Writing Task 2
#     ... (6 lessons)
# Seeding Writing Task 2 Exercises (Cloze Auto)...
#     Created Task 2 writing exercise: Opinion Essay - Education
#     ... (17 exercises)
```

### Verify via API

```bash
# Get all writing exercises (both Task 1 and Task 2)
curl http://localhost:3000/api/v1/ielts/writing-exercises?skillId=<SKILL_ID>

# Get only Task 1 exercises
curl http://localhost:3000/api/v1/ielts/writing-exercises?skillId=<SKILL_ID>&taskType=1

# Get only Task 2 exercises
curl http://localhost:3000/api/v1/ielts/writing-exercises?skillId=<SKILL_ID>&taskType=2

# Get a single Task 2 exercise (verify taskType=2, diagramUrl=null, paragraphs have Conclusion)
curl http://localhost:3000/api/v1/ielts/writing-exercises/<EXERCISE_ID>
```

---

## Step 5: Commit

```bash
git add -A
git commit -m "feat(ielts): add Writing Task 2 schema, seeder, and API support"
```
