-- CreateEnum
CREATE TYPE "ContentImportTargetSystem" AS ENUM ('INTENSIVE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "ContentImportSkill" AS ENUM ('LISTENING', 'READING', 'WRITING', 'SPEAKING', 'FULL_TEST');

-- CreateEnum
CREATE TYPE "ContentImportSourceType" AS ENUM ('WEB_URL', 'PDF_UPLOAD');

-- CreateEnum
CREATE TYPE "ContentImportStatus" AS ENUM ('PENDING', 'SCRAPING', 'EXTRACTING', 'AWAITING_REVIEW', 'COMMITTING', 'COMMITTED', 'FAILED', 'DISCARDED');

-- CreateTable
CREATE TABLE "content_import_jobs" (
    "id" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "targetSystem" "ContentImportTargetSystem" NOT NULL,
    "skill" "ContentImportSkill" NOT NULL,
    "groupId" TEXT,
    "groupExpiresAt" TIMESTAMP(3),
    "status" "ContentImportStatus" NOT NULL DEFAULT 'PENDING',
    "sourceType" "ContentImportSourceType" NOT NULL,
    "sourceRef" TEXT NOT NULL,
    "contractVersion" TEXT NOT NULL DEFAULT 'v1',
    "provenance" JSONB NOT NULL,
    "rawText" TEXT,
    "structuredJson" JSONB,
    "mediaAssets" JSONB,
    "geminiModel" TEXT,
    "tokensUsed" INTEGER,
    "error" TEXT,
    "committedEntityId" TEXT,
    "processingStartedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_import_jobs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "content_import_jobs" ADD CONSTRAINT "content_import_jobs_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddColumn to exams
ALTER TABLE "exams" ADD COLUMN "source" TEXT,
ADD COLUMN "bookNumber" INTEGER,
ADD COLUMN "testNumber" INTEGER,
ADD COLUMN "quarter" TEXT,
ADD COLUMN "year" INTEGER,
ADD COLUMN "importJobId" TEXT;

-- AddColumn to ielts_practice_listening_parts
ALTER TABLE "ielts_practice_listening_parts" ADD COLUMN "source" TEXT,
ADD COLUMN "bookNumber" INTEGER,
ADD COLUMN "testNumber" INTEGER,
ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "importJobId" TEXT;

-- AddColumn to ielts_practice_reading_parts
ALTER TABLE "ielts_practice_reading_parts" ADD COLUMN "source" TEXT,
ADD COLUMN "bookNumber" INTEGER,
ADD COLUMN "testNumber" INTEGER,
ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "importJobId" TEXT;

-- AddColumn to ielts_advanced_writing_prompts
ALTER TABLE "ielts_advanced_writing_prompts" ADD COLUMN "importJobId" TEXT;

-- AddColumn to ielts_advanced_speaking_parts
ALTER TABLE "ielts_advanced_speaking_parts" ADD COLUMN "importJobId" TEXT;

-- CreateIndex
CREATE INDEX "content_import_jobs_createdById_idx" ON "content_import_jobs"("createdById");
CREATE INDEX "content_import_jobs_status_idx" ON "content_import_jobs"("status");
CREATE INDEX "content_import_jobs_targetSystem_skill_idx" ON "content_import_jobs"("targetSystem", "skill");
CREATE INDEX "content_import_jobs_groupId_idx" ON "content_import_jobs"("groupId");
