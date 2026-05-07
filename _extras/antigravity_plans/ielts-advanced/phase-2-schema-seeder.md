# Phase 2: Database Schema & Seeder

> **Goal**: Add `IeltsAdvancedWritingPrompt` and `IeltsAdvancedWritingSession` models to Prisma, run migration, and create a seeder that ingests the JSON from Phase 1.

> **Depends on**: Phase 1 output (`writing-prompts.json`)

---

## 1. Prisma Schema Changes

File: `backend-core/prisma/schema.prisma`

Add after the existing `IeltsAdvancedReadingSession` model (around line 1059):

```prisma
// ── IELTS ADVANCED WRITING ──

model IeltsAdvancedWritingPrompt {
  id            String   @id @default(uuid())
  taskType      String   // "TASK_1" or "TASK_2"
  subType       String   // e.g. "line_graph", "bar_chart", "opinion", "discussion"
  source        String   @default("engnovate") // "cambridge_13", "forecast", etc.
  category      String   @default("cambridge-academic") // category slug
  bookNumber    Int?
  testNumber    Int?
  title         String
  prompt        String   @db.Text
  imageUrl      String?
  minimumWords  Int      @default(150)
  suggestedTime Int      @default(20) // minutes
  difficulty    String   @default("medium")
  engnovateSlug String?  @unique
  isPublished   Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  sessions IeltsAdvancedWritingSession[]

  @@map("ielts_advanced_writing_prompts")
}

model IeltsAdvancedWritingSession {
  id         String   @id @default(uuid())
  userId     String
  promptId   String
  essay      String?  @db.Text
  draftEssay String?  @db.Text  // auto-saved draft
  timeTaken  Int?     // seconds spent writing
  status     String   @default("IN_PROGRESS") // IN_PROGRESS | SUBMITTED | GRADING | GRADED | GRADING_FAILED
  feedback   Json?    // AI grading result (same shape as existing WritingFeedback)
  bandScore  Float?   // overall band score
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  user   User                       @relation(fields: [userId], references: [id], onDelete: Cascade)
  prompt IeltsAdvancedWritingPrompt @relation(fields: [promptId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([promptId])
  @@map("ielts_advanced_writing_sessions")
}
```

### 1.1. User Model Update

Add this relation to the existing `User` model:

```prisma
// Inside the User model, add:
advancedWritingSessions IeltsAdvancedWritingSession[]
```

---

## 2. Run Migration

```bash
cd backend-core
npx prisma migrate dev --name add-ielts-advanced-writing
```

Verify with:
```bash
npx prisma studio
```

Check that `ielts_advanced_writing_prompts` and `ielts_advanced_writing_sessions` tables exist.

---

## 3. Seeder Implementation

File: `backend-core/prisma/seeders/ielts-advanced.seeder.ts`

**Modify the existing seeder** to add writing prompt seeding at the end. Add a new function:

```typescript
// Add this function AFTER the existing seedIeltsAdvanced function body

async function seedWritingPrompts(prisma: PrismaClient) {
  console.log("  Seeding IELTS Advanced Writing Prompts...");

  const jsonPath = path.join(
    __dirname,
    "..",
    "data",
    "ielts-advanced-compiled",
    "writing-prompts.json",
  );

  if (!fs.existsSync(jsonPath)) {
    console.error("  writing-prompts.json not found — skipping writing seeder");
    return;
  }

  const prompts = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  // Clear existing writing prompts
  await (prisma as any).ieltsAdvancedWritingPrompt.deleteMany({});

  let seeded = 0;
  for (const p of prompts) {
    await (prisma as any).ieltsAdvancedWritingPrompt.create({
      data: {
        taskType: p.taskType,
        subType: p.subType,
        source: p.source,
        category: p.category,
        bookNumber: p.bookNumber ?? null,
        testNumber: p.testNumber ?? null,
        title: p.title,
        prompt: p.prompt,
        imageUrl: p.imageUrl ?? null,
        minimumWords: p.minimumWords,
        suggestedTime: p.suggestedTime,
        difficulty: p.difficulty,
        engnovateSlug: p.engnovateSlug ?? null,
      },
    });
    seeded++;
  }

  console.log(`    Seeded ${seeded} writing prompts`);
}
```

Then call it from the main `seedIeltsAdvanced` function:

```typescript
export async function seedIeltsAdvanced(prisma: PrismaClient) {
  // ... existing listening + reading seeding ...

  // Add at the end:
  await seedWritingPrompts(prisma);
}
```

---

## 4. Verification

After running the seeder:

```bash
npx prisma studio
# Navigate to ielts_advanced_writing_prompts table
# Verify:
# - All prompts have non-empty `prompt` text
# - TASK_1 prompts have imageUrl
# - TASK_2 prompts have null imageUrl
# - Count matches expected (~80-143 prompts)
```

---

## 5. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| `engnovateSlug` as `@unique` | Prevents duplicate imports on re-seeding |
| `status` as String (not enum) | Flexible for adding new states without migration |
| `feedback` as Json | Matches existing pattern from `IeltsIntensive` sessions |
| `draftEssay` separate from `essay` | `essay` is the final submitted text, `draftEssay` is auto-saved |
| `bandScore` denormalized | Avoids parsing JSON to sort/filter by score |
| `@@index([userId])` | Fast query for user's writing history |
| `@@index([promptId])` | Fast query for prompt completion stats |

---

## 6. Files Modified

| File | Change |
|------|--------|
| `backend-core/prisma/schema.prisma` | Add 2 new models + User relation |
| `backend-core/prisma/seeders/ielts-advanced.seeder.ts` | Add `seedWritingPrompts` function |
