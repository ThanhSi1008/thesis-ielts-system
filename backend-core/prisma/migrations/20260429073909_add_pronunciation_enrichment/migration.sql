-- CreateEnum
CREATE TYPE "PronunciationMastery" AS ENUM ('NEW', 'PRACTICING', 'MASTERED');

-- AlterTable
ALTER TABLE "pronunciation_sounds" ADD COLUMN     "name" TEXT,
ADD COLUMN     "tip" TEXT,
ADD COLUMN     "videoUrl" TEXT;

-- CreateTable
CREATE TABLE "sound_example_words" (
    "id" TEXT NOT NULL,
    "soundId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "ipa" TEXT,
    "audioUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "sound_example_words_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pronunciation_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "soundId" TEXT NOT NULL,
    "status" "PronunciationMastery" NOT NULL DEFAULT 'NEW',
    "practiceCount" INTEGER NOT NULL DEFAULT 0,
    "bestScore" INTEGER,
    "lastPracticedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pronunciation_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pronunciation_progress_userId_soundId_key" ON "pronunciation_progress"("userId", "soundId");

-- AddForeignKey
ALTER TABLE "sound_example_words" ADD CONSTRAINT "sound_example_words_soundId_fkey" FOREIGN KEY ("soundId") REFERENCES "pronunciation_sounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pronunciation_progress" ADD CONSTRAINT "pronunciation_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pronunciation_progress" ADD CONSTRAINT "pronunciation_progress_soundId_fkey" FOREIGN KEY ("soundId") REFERENCES "pronunciation_sounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
