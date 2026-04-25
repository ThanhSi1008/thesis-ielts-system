-- CreateTable
CREATE TABLE "ielts_writing_user_answers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "writingExerciseId" TEXT NOT NULL,
    "intro" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "body1" TEXT NOT NULL,
    "body2" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ielts_writing_user_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ielts_writing_user_answers_userId_writingExerciseId_key" ON "ielts_writing_user_answers"("userId", "writingExerciseId");

-- AddForeignKey
ALTER TABLE "ielts_writing_user_answers" ADD CONSTRAINT "ielts_writing_user_answers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_writing_user_answers" ADD CONSTRAINT "ielts_writing_user_answers_writingExerciseId_fkey" FOREIGN KEY ("writingExerciseId") REFERENCES "ielts_writing_exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
