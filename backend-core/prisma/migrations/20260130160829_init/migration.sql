-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'ADMIN', 'INSTRUCTOR');

-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('FULL_TEST', 'READING', 'LISTENING', 'SPEAKING', 'WRITING', 'PRACTICE');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'GRADING', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "MaterialType" AS ENUM ('LESSON', 'VOCABULARY', 'GRAMMAR', 'PRACTICE', 'VIDEO', 'AUDIO');

-- CreateEnum
CREATE TYPE "PronunciationStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exams" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "type" "ExamType" NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "questions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "answers" JSONB NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "results" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "readingScore" INTEGER,
    "listeningScore" INTEGER,
    "speakingScore" INTEGER,
    "writingScore" INTEGER,
    "feedback" JSONB,
    "gradedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_materials" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" JSONB NOT NULL,
    "type" "MaterialType" NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "tags" TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "lastAccess" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" "Difficulty" NOT NULL,
    "order" INTEGER NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabularies" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "ipa" TEXT,
    "audioUrl" TEXT,
    "example" TEXT,
    "partOfSpeech" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vocabularies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grammars" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "rule" TEXT NOT NULL,
    "example" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grammars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pronunciation_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vocabularyId" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "transcribedText" TEXT,
    "targetWord" TEXT NOT NULL,
    "score" INTEGER,
    "feedback" JSONB,
    "status" "PronunciationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pronunciation_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "results_sessionId_key" ON "results"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "learning_progress_userId_materialId_key" ON "learning_progress"("userId", "materialId");

-- AddForeignKey
ALTER TABLE "exam_sessions" ADD CONSTRAINT "exam_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_sessions" ADD CONSTRAINT "exam_sessions_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "exam_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_progress" ADD CONSTRAINT "learning_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_progress" ADD CONSTRAINT "learning_progress_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "learning_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabularies" ADD CONSTRAINT "vocabularies_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grammars" ADD CONSTRAINT "grammars_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pronunciation_attempts" ADD CONSTRAINT "pronunciation_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pronunciation_attempts" ADD CONSTRAINT "pronunciation_attempts_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "vocabularies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
