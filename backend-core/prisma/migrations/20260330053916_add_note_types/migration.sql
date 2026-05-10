-- AlterTable
ALTER TABLE "flashcards" ADD COLUMN     "fieldValues" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "noteTypeId" TEXT;

-- CreateTable
CREATE TABLE "note_types" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "isBuiltIn" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "note_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "note_type_fields" (
    "id" TEXT NOT NULL,
    "noteTypeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "note_type_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_templates" (
    "id" TEXT NOT NULL,
    "noteTypeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "frontFields" TEXT[],
    "backFields" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "card_templates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_noteTypeId_fkey" FOREIGN KEY ("noteTypeId") REFERENCES "note_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_type_fields" ADD CONSTRAINT "note_type_fields_noteTypeId_fkey" FOREIGN KEY ("noteTypeId") REFERENCES "note_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_templates" ADD CONSTRAINT "card_templates_noteTypeId_fkey" FOREIGN KEY ("noteTypeId") REFERENCES "note_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
