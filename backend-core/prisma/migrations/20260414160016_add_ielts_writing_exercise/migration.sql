-- CreateTable
CREATE TABLE "ielts_skills" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ielts_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ielts_lessons" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "chapter" TEXT,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "quiz" JSONB,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ielts_lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ielts_listening_exercises" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "lessonId" TEXT,
    "topic" TEXT NOT NULL,
    "instructions" TEXT,
    "audioUrl" TEXT NOT NULL,
    "transcript" JSONB NOT NULL,
    "content" JSONB NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ielts_listening_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ielts_reading_exercises" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "lessonId" TEXT,
    "topic" TEXT NOT NULL,
    "instructions" TEXT,
    "passage" TEXT NOT NULL,
    "passageWithLocations" JSONB,
    "content" JSONB NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ielts_reading_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ielts_basic_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT,
    "listeningExerciseId" TEXT,
    "readingExerciseId" TEXT,
    "writingExerciseId" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ielts_basic_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ielts_writing_exercises" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "lessonId" TEXT,
    "topic" TEXT NOT NULL,
    "instructions" TEXT,
    "prompt" TEXT NOT NULL,
    "diagramUrl" TEXT,
    "modelAnswer" JSONB NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ielts_writing_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ielts_skills_name_key" ON "ielts_skills"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ielts_basic_progress_userId_lessonId_listeningExerciseId_re_key" ON "ielts_basic_progress"("userId", "lessonId", "listeningExerciseId", "readingExerciseId", "writingExerciseId");

-- AddForeignKey
ALTER TABLE "ielts_lessons" ADD CONSTRAINT "ielts_lessons_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "ielts_skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_listening_exercises" ADD CONSTRAINT "ielts_listening_exercises_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "ielts_skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_listening_exercises" ADD CONSTRAINT "ielts_listening_exercises_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "ielts_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_reading_exercises" ADD CONSTRAINT "ielts_reading_exercises_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "ielts_skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_reading_exercises" ADD CONSTRAINT "ielts_reading_exercises_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "ielts_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_basic_progress" ADD CONSTRAINT "ielts_basic_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_basic_progress" ADD CONSTRAINT "ielts_basic_progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "ielts_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_basic_progress" ADD CONSTRAINT "ielts_basic_progress_listeningExerciseId_fkey" FOREIGN KEY ("listeningExerciseId") REFERENCES "ielts_listening_exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_basic_progress" ADD CONSTRAINT "ielts_basic_progress_readingExerciseId_fkey" FOREIGN KEY ("readingExerciseId") REFERENCES "ielts_reading_exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_basic_progress" ADD CONSTRAINT "ielts_basic_progress_writingExerciseId_fkey" FOREIGN KEY ("writingExerciseId") REFERENCES "ielts_writing_exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_writing_exercises" ADD CONSTRAINT "ielts_writing_exercises_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "ielts_skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_writing_exercises" ADD CONSTRAINT "ielts_writing_exercises_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "ielts_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
