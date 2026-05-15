# Phase 1 — Database Layer

> **Risk**: LOW — Schema changes are backward-compatible.  
> **Estimated Effort**: Small  
> **Dependencies**: None

---

## 1.1 Schema Changes (Optional, Non-Breaking)

The current schema is functional. These changes are **recommended improvements**, not blockers.

### Current Schema (3 models)

```prisma
// backend-core/prisma/schema.prisma (lines 653-707)

model ShadowingVideo {
  id             String   @id @default(uuid())
  userId         String?  // null = system lesson
  title          String
  youtubeVideoId String?
  audioUrl       String?
  imageUrl       String?
  tags           String[] @default([])
  folder         String   @default("All Videos")
  category       String   @default("Other")
  duration       String
  sentences      Json     // Array of ShadowingSentence
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  user           User?    @relation(...)
  @@map("shadowing_videos")
}

model ShadowingFolder {
  id     String @id @default(uuid())
  userId String
  name   String
  order  Int    @default(0)
  user   User   @relation(...)
  @@unique([userId, name])
  @@map("shadowing_folders")
}

model ShadowingDictationProgress {
  id                  String   @id @default(uuid())
  userId              String
  lessonId            String
  type                String   // "shadowing" | "dictation"
  completedSentences  Int[]
  dictationDifficulty String?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  user                User     @relation(...)
  @@unique([userId, lessonId, type])
  @@map("shadowing_dictation_progress")
}
```

### Recommended Changes

#### 1.1.1 — Add index on `ShadowingVideo.userId` for faster user-video lookups

```prisma
model ShadowingVideo {
  // ... existing fields ...
  @@index([userId])       // ADD THIS
  @@map("shadowing_videos")
}
```

#### 1.1.2 — Add index on `ShadowingDictationProgress` for fast bulk queries

```prisma
model ShadowingDictationProgress {
  // ... existing fields ...
  @@index([userId])        // ADD THIS — speeds up getAllProgress
  @@map("shadowing_dictation_progress")
}
```

#### 1.1.3 — (NO CHANGE) Keep `ShadowingVideo` as a single table

**Rationale**: Splitting system lessons and user videos into separate tables was considered but **rejected** because:
- They share the exact same shape (title, sentences, duration, etc.)
- The `userId == null` convention is clean and well-understood
- Splitting would duplicate the seeder, service, and DTO code for no benefit
- Prisma's `findMany({ where: { userId: null } })` is already indexed via 1.1.1

#### 1.1.4 — (NO CHANGE) Keep `type` as `String` in progress

**Rationale**: Converting `type` to a Prisma `enum ShadowingType { SHADOWING DICTATION }` was considered but rejected because:
- The string value is used directly in frontend API payloads
- Adding an enum requires a migration + code changes with no functional benefit
- The `@@unique([userId, lessonId, type])` constraint already enforces correctness

---

## 1.2 Seed Data Refactoring

### Current State

```
backend-core/prisma/data/shadowing-lessons.ts  (4,015 lines, 206KB)
```

One massive export `SHADOWING_LESSONS` with all lesson objects inline.

### Target State

```
backend-core/prisma/data/
├── shadowing-lessons.ts              # Re-export barrel (unchanged external API)
└── shadowing-lessons/                # NEW: individual lesson files
    ├── types.ts                      # ShadowingSentence, ShadowingLesson interfaces
    ├── lesson-001-sarahs-sales.ts
    ├── lesson-002-copywriter-job.ts
    ├── lesson-003-menu-photo.ts
    ├── ... (one per lesson)
    └── index.ts                      # Combines all: export const SHADOWING_LESSONS = [...]
```

### Implementation Steps

1. **Create `types.ts`** — Extract `ShadowingSentence` and `ShadowingLesson` interfaces from the top of the current file.

2. **Split lessons** — Each lesson becomes its own file exporting a single `ShadowingLesson` object.

3. **Create barrel `index.ts`** — Imports all individual lessons and re-exports as `SHADOWING_LESSONS`.

4. **Update import in `shadowing-lessons.ts`** — Re-export from the new barrel so nothing downstream breaks:
   ```ts
   // shadowing-lessons.ts (updated)
   export { ShadowingSentence, ShadowingLesson } from './shadowing-lessons/types';
   export { SHADOWING_LESSONS } from './shadowing-lessons';
   ```

5. **Verify seeder still works** — Run `npx prisma db seed` to confirm.

### Why This Matters

- Individual lesson files are easier to review and edit
- Adding a new lesson = adding a new file, not editing a 4000-line file (OCP)
- The barrel re-export means `shadowing.seeder.ts` doesn't change at all

---

## 1.3 Seeder (No Changes Needed)

The current `shadowing.seeder.ts` (30 lines) is clean:

```ts
// backend-core/prisma/seeders/shadowing.seeder.ts
import { SHADOWING_LESSONS } from '../data/shadowing-lessons';

export async function seedShadowingLessons(prisma: PrismaClient) {
  for (const lesson of SHADOWING_LESSONS) {
    await prisma.shadowingVideo.upsert({
      where: { id: lesson.id },
      update: data,
      create: { id: lesson.id, ...data },
    });
  }
}
```

This file does NOT need to change because:
- It imports from `shadowing-lessons.ts` which will re-export from the new barrel
- The `upsert` pattern is idempotent and correct
- It's already under 30 lines

---

## 1.4 Migration Steps

```bash
# 1. Create migration for the new indexes
npx prisma migrate dev --name add-shadowing-indexes

# 2. Verify
npx prisma db push

# 3. Run seeder to validate
npx prisma db seed
```

---

## Acceptance Criteria

- [ ] `@@index([userId])` added to `ShadowingVideo`
- [ ] `@@index([userId])` added to `ShadowingDictationProgress`
- [ ] Migration runs without errors
- [ ] Seed data split into individual lesson files
- [ ] `shadowing-lessons.ts` barrel re-export works (seeder still passes)
- [ ] All existing API endpoints return identical responses (no breaking changes)
