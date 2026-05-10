-- AlterTable
ALTER TABLE "exam_sessions" ADD COLUMN     "timeTaken" INTEGER;

-- AlterTable
ALTER TABLE "exams" ADD COLUMN     "imageUrl" TEXT;

-- CreateTable
CREATE TABLE "question_notes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "questionNumber" INTEGER NOT NULL,
    "noteText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shadowing_videos" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "youtubeVideoId" TEXT NOT NULL,
    "folder" TEXT NOT NULL DEFAULT 'All Videos',
    "category" TEXT NOT NULL DEFAULT 'Other',
    "duration" TEXT NOT NULL,
    "sentences" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shadowing_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shadowing_folders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "shadowing_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shadowing_dictation_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "completedSentences" INTEGER[],
    "dictationDifficulty" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shadowing_dictation_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "question_notes_userId_examId_questionNumber_key" ON "question_notes"("userId", "examId", "questionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "shadowing_folders_userId_name_key" ON "shadowing_folders"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "shadowing_dictation_progress_userId_lessonId_type_key" ON "shadowing_dictation_progress"("userId", "lessonId", "type");

-- AddForeignKey
ALTER TABLE "question_notes" ADD CONSTRAINT "question_notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shadowing_videos" ADD CONSTRAINT "shadowing_videos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shadowing_folders" ADD CONSTRAINT "shadowing_folders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shadowing_dictation_progress" ADD CONSTRAINT "shadowing_dictation_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shadowing_dictation_progress" ADD CONSTRAINT "shadowing_dictation_progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "shadowing_videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
