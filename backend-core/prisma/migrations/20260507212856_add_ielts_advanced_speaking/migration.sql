-- CreateTable
CREATE TABLE "ielts_advanced_speaking_parts" (
    "id" TEXT NOT NULL,
    "partNumber" INTEGER NOT NULL,
    "partType" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'engnovate',
    "category" TEXT NOT NULL DEFAULT 'cambridge-academic',
    "bookNumber" INTEGER,
    "testNumber" INTEGER,
    "title" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "engnovateSlug" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ielts_advanced_speaking_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ielts_advanced_speaking_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "audioUrls" JSONB,
    "transcription" JSONB,
    "timeTaken" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "feedback" JSONB,
    "bandScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ielts_advanced_speaking_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ielts_advanced_speaking_parts_engnovateSlug_partNumber_key" ON "ielts_advanced_speaking_parts"("engnovateSlug", "partNumber");

-- CreateIndex
CREATE INDEX "ielts_advanced_speaking_sessions_userId_idx" ON "ielts_advanced_speaking_sessions"("userId");

-- CreateIndex
CREATE INDEX "ielts_advanced_speaking_sessions_partId_idx" ON "ielts_advanced_speaking_sessions"("partId");

-- AddForeignKey
ALTER TABLE "ielts_advanced_speaking_sessions" ADD CONSTRAINT "ielts_advanced_speaking_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_advanced_speaking_sessions" ADD CONSTRAINT "ielts_advanced_speaking_sessions_partId_fkey" FOREIGN KEY ("partId") REFERENCES "ielts_advanced_speaking_parts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
