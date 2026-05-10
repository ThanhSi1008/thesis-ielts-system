-- CreateTable
CREATE TABLE "grammar_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "theoryCompleted" BOOLEAN NOT NULL DEFAULT false,
    "exerciseScore" INTEGER,
    "exerciseTotal" INTEGER,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grammar_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "grammar_progress_userId_unitId_key" ON "grammar_progress"("userId", "unitId");

-- AddForeignKey
ALTER TABLE "grammar_progress" ADD CONSTRAINT "grammar_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grammar_progress" ADD CONSTRAINT "grammar_progress_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "grammar_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;
