# Phase 1: Database Separation

## Current State

3 unified models in `backend-core/prisma/schema.prisma` (lines 653–709):

```
ShadowingVideo              → stores BOTH shadowing & dictation content
ShadowingFolder             → stores folders for BOTH
ShadowingDictationProgress  → stores progress for BOTH (differentiated by `type` column)
```

## Target State

6 isolated models — 3 for Shadowing, 3 for Dictation.

---

## Step 1.1: Add Shadowing Models

Replace the existing `ShadowingVideo` model. Keep the same table name `shadowing_videos` so no data migration is needed.

```prisma
// ============================================================
// SHADOWING
// ============================================================

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
  sentences      Json     // {id, english, vietnamese, phonetic, words[], audioStart, audioEnd}
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user User? @relation("UserShadowingVideos", fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("shadowing_videos")
}

model ShadowingFolder {
  id     String @id @default(uuid())
  userId String
  name   String
  order  Int    @default(0)

  user User @relation("UserShadowingFolders", fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, name])
  @@map("shadowing_folders")
}

model ShadowingProgress {
  id                 String   @id @default(uuid())
  userId             String
  lessonId           String
  completedSentences Int[]
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  user User @relation("UserShadowingProgress", fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, lessonId])
  @@index([userId])
  @@map("shadowing_progress")
}
```

**Key differences from unified model**:
- `ShadowingProgress` has NO `type` column (it's always shadowing)
- `ShadowingProgress` has NO `dictationDifficulty` column
- Unique constraint is `[userId, lessonId]` (no `type` needed)

## Step 1.2: Add Dictation Models

Create brand-new tables for Dictation.

```prisma
// ============================================================
// DICTATION
// ============================================================

model DictationVideo {
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
  sentences      Json     // {id, english, words[], audioStart, audioEnd}
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user User? @relation("UserDictationVideos", fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("dictation_videos")
}

model DictationFolder {
  id     String @id @default(uuid())
  userId String
  name   String
  order  Int    @default(0)

  user User @relation("UserDictationFolders", fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, name])
  @@map("dictation_folders")
}

model DictationProgress {
  id                 String   @id @default(uuid())
  userId             String
  lessonId           String
  completedSentences Int[]
  difficulty         String   @default("Intermediate") // Beginner | Intermediate | Advanced | Expert
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  user User @relation("UserDictationProgress", fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, lessonId])
  @@index([userId])
  @@map("dictation_progress")
}
```

**Key differences from ShadowingProgress**:
- `DictationProgress` has `difficulty` column (non-optional, defaults to "Intermediate")
- `DictationVideo.sentences` does NOT need `vietnamese` or `phonetic` fields (dictation doesn't use translations)

## Step 1.3: Delete Old Unified Model

Remove these 3 models from `schema.prisma`:
- `ShadowingDictationProgress` (replaced by `ShadowingProgress` + `DictationProgress`)

> **Note**: Keep the old `ShadowingVideo` and `ShadowingFolder` models as-is since we're reusing their table names. The new Dictation models get brand-new tables.

## Step 1.4: Update User Model Relations

Add the new relations to the `User` model:

```prisma
model User {
  // ... existing fields ...

  // Shadowing
  shadowingVideos   ShadowingVideo[]   @relation("UserShadowingVideos")
  shadowingFolders  ShadowingFolder[]  @relation("UserShadowingFolders")
  shadowingProgress ShadowingProgress[] @relation("UserShadowingProgress")

  // Dictation
  dictationVideos   DictationVideo[]   @relation("UserDictationVideos")
  dictationFolders  DictationFolder[]  @relation("UserDictationFolders")
  dictationProgress DictationProgress[] @relation("UserDictationProgress")
}
```

## Step 1.5: Data Migration

### Strategy: Seed-based (no SQL migration of existing progress)

1. **System lessons**: The seed script (`prisma/data/shadowing-lessons/`) will insert the same lesson data into BOTH `ShadowingVideo` and `DictationVideo` tables with `userId: null`.
2. **User progress**: Run a one-time migration script that:
   - Reads all rows from `shadowing_dictation_progress`
   - For rows with `type = 'shadowing'` → inserts into `shadowing_progress`
   - For rows with `type = 'dictation'` → inserts into `dictation_progress` (copying `dictationDifficulty` → `difficulty`)
3. **User videos**: Copy existing `shadowing_videos` rows where `userId != null` into `dictation_videos` (so users don't lose their uploaded content in either module)
4. **User folders**: Copy `shadowing_folders` into `dictation_folders`

### Migration Script Location
`backend-core/prisma/migrations/migrate-split-progress.ts`

## Step 1.6: Run Prisma

```bash
npx prisma generate
npx prisma db push     # or npx prisma migrate dev --name split-shadowing-dictation
npx prisma db seed
```
