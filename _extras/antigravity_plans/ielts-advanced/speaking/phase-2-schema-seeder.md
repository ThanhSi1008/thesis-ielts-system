# Phase 2: Database Schema & Seeder

> **Goal**: Add `IeltsAdvancedSpeakingPart` and `IeltsAdvancedSpeakingSession` models to Prisma, run migration, and create a seeder that ingests the JSON from Phase 1.

> **Depends on**: Phase 1 output (`speaking-parts.json`)

---

## 1. Prisma Schema Changes

File: `backend-core/prisma/schema.prisma`

Add after the existing `IeltsAdvancedWritingSession` model:

```prisma
// ── IELTS ADVANCED SPEAKING ──

model IeltsAdvancedSpeakingPart {
  id          String   @id @default(uuid())
  partNumber  Int      // 1, 2, or 3
  partType    String   // "interview" | "cue_card" | "discussion"
  topic       String   // e.g. "Personal Qualities", "News & Media"
  source      String   @default("engnovate")  // "cambridge_20", "forecast", etc.
  category    String   @default("cambridge-academic") // category slug
  bookNumber  Int?
  testNumber  Int?
  title       String
  questions   Json     // Array of { text: string }
  engnovateSlug String? // NOT unique — 3 parts share the same slug
  isPublished Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  sessions IeltsAdvancedSpeakingSession[]

  @@unique([engnovateSlug, partNumber]) // Unique combo: slug + part number
  @@map("ielts_advanced_speaking_parts")
}

model IeltsAdvancedSpeakingSession {
  id            String   @id @default(uuid())
  userId        String
  partId        String
  audioUrls     Json?    // Array of base64 audio strings (one per question)
  transcription Json?    // AI-generated transcription per question
  timeTaken     Int?     // total seconds spent
  status        String   @default("IN_PROGRESS")
  // Status values: IN_PROGRESS | SUBMITTED | GRADING | GRADED | GRADING_FAILED
  feedback      Json?    // AI grading result (same shape as existing SpeakingFeedback)
  bandScore     Float?   // overall band score
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user User                        @relation(fields: [userId], references: [id], onDelete: Cascade)
  part IeltsAdvancedSpeakingPart   @relation(fields: [partId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([partId])
  @@map("ielts_advanced_speaking_sessions")
}
```

> **Note on `engnovateSlug`**: Unlike the writing prompts where each slug is unique, speaking parts share a slug (3 parts per test). The `@@unique([engnovateSlug, partNumber])` compound uniqueness prevents duplicates on re-seeding.

### 1.1. User Model Update

Add this relation to the existing `User` model:

```prisma
// Inside the User model, add:
advancedSpeakingSessions IeltsAdvancedSpeakingSession[]
```

---

## 2. Run Migration

```bash
cd backend-core
npx prisma migrate dev --name add-ielts-advanced-speaking
```

Verify with:
```bash
npx prisma studio
```

Check that `ielts_advanced_speaking_parts` and `ielts_advanced_speaking_sessions` tables exist.

---

## 3. Seeder Implementation

File: `backend-core/prisma/seeders/ielts-advanced.seeder.ts`

**Add a new function** to the existing seeder file. Place it after `seedWritingPrompts`:

```typescript
async function seedSpeakingParts(prisma: PrismaClient) {
  console.log("  Seeding IELTS Advanced Speaking Parts...");

  const jsonPath = path.join(
    __dirname,
    "..",
    "data",
    "ielts-advanced-compiled",
    "speaking-parts.json",
  );

  if (!fs.existsSync(jsonPath)) {
    console.error("  speaking-parts.json not found — skipping speaking seeder");
    return;
  }

  const parts = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  // Clear existing speaking parts (cascades to sessions)
  await (prisma as any).ieltsAdvancedSpeakingSession.deleteMany({});
  await (prisma as any).ieltsAdvancedSpeakingPart.deleteMany({});

  let seeded = 0;
  for (const p of parts) {
    try {
      await (prisma as any).ieltsAdvancedSpeakingPart.create({
        data: {
          partNumber: p.partNumber,
          partType: p.partType,
          topic: p.topic,
          source: p.source,
          category: p.category,
          bookNumber: p.bookNumber ?? null,
          testNumber: p.testNumber ?? null,
          title: p.title,
          questions: p.questions,
          engnovateSlug: p.engnovateSlug ?? null,
        },
      });
      seeded++;
    } catch (err: any) {
      // Skip duplicates (compound unique violation)
      if (err.code === 'P2002') {
        console.warn(`    Skipping duplicate: ${p.engnovateSlug} part ${p.partNumber}`);
      } else {
        throw err;
      }
    }
  }

  console.log(`    Seeded ${seeded} speaking parts`);
}
```

Then call it from the main `seedIeltsAdvanced` function:

```typescript
export async function seedIeltsAdvanced(prisma: PrismaClient) {
  // ... existing listening + reading + writing seeding ...

  // Add at the end:
  await seedSpeakingParts(prisma);
}
```

---

## 4. Verification

After running the seeder:

```bash
cd backend-core
npx ts-node prisma/seeders/ielts-advanced.seeder.ts
npx prisma studio
# Navigate to ielts_advanced_speaking_parts table
```

Verify:
- All parts have non-empty `questions` JSON array
- Part 1 entries have `partType: "interview"` and 3-4 questions
- Part 2 entries have `partType: "cue_card"` and 1 question
- Part 3 entries have `partType: "discussion"` and 3-7 questions
- Count matches expected (~165-180 parts)

---

## 5. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| `@@unique([engnovateSlug, partNumber])` | 3 parts share the same slug — compound uniqueness prevents duplicates |
| `questions` as `Json` | Flexible array of `{ text: string }` — same shape for all part types |
| `audioUrls` as `Json` | Array of base64-encoded audio strings — one per question |
| `status` as String | Flexible for adding new states without migration |
| `feedback` as Json | Matches existing `SpeakingFeedback` pattern from Intensive module |
| `bandScore` denormalized | Fast sort/filter by score without parsing JSON |
| `@@index([userId])` | Fast query for user's speaking history |
| `@@index([partId])` | Fast query for part completion stats |

---

## 6. Files Modified

| File | Change |
|------|--------|
| `backend-core/prisma/schema.prisma` | Add 2 new models + User relation |
| `backend-core/prisma/seeders/ielts-advanced.seeder.ts` | Add `seedSpeakingParts` function |

---

## 7. Continue: Production-Ready Seeder Refinements

The baseline seeder above works, but use these refinements to make Phase 2 safer for repeated runs and future schema evolution.

### 7.1 Avoid `as any` with regenerated Prisma Client

After adding new Prisma models, regenerate Prisma client before running the seeder:

```bash
cd backend-core
npx prisma generate
```

Then use typed delegates directly:

```typescript
await prisma.ieltsAdvancedSpeakingSession.deleteMany({});
await prisma.ieltsAdvancedSpeakingPart.deleteMany({});
```

This gives compile-time safety and avoids hidden runtime mistakes in field names.

### 7.2 Prefer idempotent `upsert` over create+catch

Instead of `create()` wrapped in `P2002` handling, use `upsert()` with the compound unique key:

```typescript
await prisma.ieltsAdvancedSpeakingPart.upsert({
  where: {
    engnovateSlug_partNumber: {
      engnovateSlug: p.engnovateSlug ?? "",
      partNumber: p.partNumber,
    },
  },
  update: {
    partType: p.partType,
    topic: p.topic,
    source: p.source,
    category: p.category,
    bookNumber: p.bookNumber ?? null,
    testNumber: p.testNumber ?? null,
    title: p.title,
    questions: p.questions,
  },
  create: {
    partNumber: p.partNumber,
    partType: p.partType,
    topic: p.topic,
    source: p.source,
    category: p.category,
    bookNumber: p.bookNumber ?? null,
    testNumber: p.testNumber ?? null,
    title: p.title,
    questions: p.questions,
    engnovateSlug: p.engnovateSlug ?? "",
  },
});
```

> If you want to keep `engnovateSlug` nullable in schema, you must keep the create+catch path.
> If you want fully idempotent `upsert`, make `engnovateSlug` required (`String`) and normalize empty values at scrape time.

### 7.3 Validate JSON structure before DB writes

Add a minimal runtime guard before insert/upsert:

```typescript
function isValidQuestions(value: unknown): value is Array<{ text: string }> {
  return Array.isArray(value) && value.every((q) => q && typeof q.text === "string" && q.text.trim().length > 0);
}
```

Reject records that fail:
- Missing `partNumber` in `[1, 2, 3]`
- Missing `partType` in `["interview", "cue_card", "discussion"]`
- Empty `title`
- Invalid `questions`

Log and continue (do not crash entire seeding batch on one bad row).

### 7.4 Use transaction boundaries intentionally

Recommended seeding order:
1. Parse + validate all JSON rows
2. Open transaction to clear old records
3. Bulk write valid rows (upsert or create)

For large batches, avoid one giant transaction if DB memory is constrained; process in chunks of 50.

---

## 8. Data Contract for `speaking-parts.json`

Define this TypeScript contract in seeder:

```typescript
type SpeakingPartSeed = {
  engnovateSlug: string;
  partNumber: 1 | 2 | 3;
  partType: "interview" | "cue_card" | "discussion";
  topic: string;
  source: string;
  category: string;
  bookNumber: number | null;
  testNumber: number | null;
  title: string;
  questions: Array<{ text: string }>;
};
```

Then parse as:

```typescript
const raw = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as unknown;
if (!Array.isArray(raw)) throw new Error("speaking-parts.json must be an array");
const parts = raw as SpeakingPartSeed[];
```

This keeps Phase 1 and Phase 2 tightly aligned and easier to refactor later.

---

## 9. Rollback & Recovery

If migration or seeding fails:

1. Fix schema/seeder issue.
2. Reset local dev DB only if acceptable:
   ```bash
   npx prisma migrate reset
   ```
3. Re-run:
   ```bash
   npx prisma migrate dev --name add-ielts-advanced-speaking
   npx prisma db seed
   ```

For shared/staging DBs, do not reset. Use forward migration only.

---

## 10. Definition of Done (Phase 2 Exit Criteria)

Phase 2 is complete only when all are true:

- [ ] Prisma migration applied successfully on local DB
- [ ] Prisma client regenerated and compiles without `as any` workaround
- [ ] Seeder ingests `speaking-parts.json` with no unhandled exceptions
- [ ] `ielts_advanced_speaking_parts` row count is within expected range (~165-180)
- [ ] No duplicate `(engnovateSlug, partNumber)` rows
- [ ] At least one session row can be inserted manually in `ielts_advanced_speaking_sessions`
- [ ] Existing IELTS Advanced Listening/Reading/Writing seeding remains unaffected
- [ ] Phase 3 can query speaking parts through Prisma without schema adjustments

---

## 11. Handoff Notes for Phase 3

Before starting backend API work:

- Confirm final `status` values for speaking session lifecycle:
  - `IN_PROGRESS`, `SUBMITTED`, `GRADING`, `GRADED`, `GRADING_FAILED`
- Confirm `questions` JSON shape remains `{ text: string }[]` (no IDs yet)
- Confirm `feedback` JSON will follow existing Intensive Speaking response contract

If these stay stable, Phase 3 controller/service implementation can proceed without additional migrations.
