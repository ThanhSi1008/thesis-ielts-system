# Phase 1: Database Total Separation

## 1. Schema Modifications (`backend-core/prisma/schema.prisma`)
We will completely split the tables so neither module relies on the other.

### Remove Old Unified Tables
- Delete `ShadowingVideo`
- Delete `ShadowingFolder`
- Delete `ShadowingDictationProgress`

### Add Shadowing Tables
```prisma
model ShadowingVideo {
  id             String   @id @default(uuid())
  userId         String?
  title          String
  youtubeVideoId String?
  audioUrl       String?
  imageUrl       String?
  tags           String[] @default([])
  folder         String   @default("All Videos")
  category       String   @default("Other")
  duration       String
  sentences      Json     
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  user           User?    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("shadowing_videos")
}

model ShadowingFolder {
  id     String @id @default(uuid())
  userId String
  name   String
  order  Int    @default(0)
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

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
  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, lessonId])
  @@index([userId])
  @@map("shadowing_progress")
}
```

### Add Dictation Tables
*(Exact replica but prefixed with `Dictation` instead of `Shadowing`, and `DictationProgress` gets the `difficulty` field).*
```prisma
model DictationVideo {
  id             String   @id @default(uuid())
  userId         String?
  title          String
  youtubeVideoId String?
  audioUrl       String?
  imageUrl       String?
  folder         String   @default("All Videos")
  
  // Dictation-specific configurations
  defaultDifficulty String  @default("Intermediate")
  allowReveal       Boolean @default(true)
  
  // Sentences schema for dictation (english, words[], audioStart, audioEnd)
  sentences      Json     
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  user           User?    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("dictation_videos")
}

model DictationFolder {
  id     String @id @default(uuid())
  userId String
  name   String
  order  Int    @default(0)
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, name])
  @@map("dictation_folders")
}

model DictationProgress {
  id                 String   @id @default(uuid())
  userId             String
  lessonId           String
  completedSentences Int[]
  difficulty         String?  // Beginner, Intermediate, etc.
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, lessonId])
  @@index([userId])
  @@map("dictation_progress")
}
```

## 2. Seeding Strategy
- Update `backend-core/prisma/data/shadowing-lessons/index.ts`.
- The seeder will now insert the EXACT SAME JSON LESSONS into `prisma.shadowingVideo.createMany` AND `prisma.dictationVideo.createMany`.
- This creates physical duplicates of the content so each system can mutate its own database rows without affecting the other.
