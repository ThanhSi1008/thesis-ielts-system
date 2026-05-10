/*
  Warnings:

  - You are about to drop the column `noteTypeId` on the `card_templates` table. All the data in the column will be lost.
  - You are about to drop the column `noteTypeId` on the `flashcards` table. All the data in the column will be lost.
  - You are about to drop the `note_type_fields` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `note_types` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `cardTypeId` to the `card_templates` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "card_templates" DROP CONSTRAINT "card_templates_noteTypeId_fkey";

-- DropForeignKey
ALTER TABLE "flashcards" DROP CONSTRAINT "flashcards_noteTypeId_fkey";

-- DropForeignKey
ALTER TABLE "note_type_fields" DROP CONSTRAINT "note_type_fields_noteTypeId_fkey";

-- AlterTable
ALTER TABLE "card_templates" DROP COLUMN "noteTypeId",
ADD COLUMN     "cardTypeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "exam_sessions" ADD COLUMN     "practicePart" INTEGER;

-- AlterTable
ALTER TABLE "flashcards" DROP COLUMN "noteTypeId",
ADD COLUMN     "cardTypeId" TEXT;

-- DropTable
DROP TABLE "note_type_fields";

-- DropTable
DROP TABLE "note_types";

-- CreateTable
CREATE TABLE "card_types" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isBuiltIn" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_type_fields" (
    "id" TEXT NOT NULL,
    "cardTypeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "description" TEXT,
    "fieldType" TEXT NOT NULL DEFAULT 'text',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "card_type_fields_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_cardTypeId_fkey" FOREIGN KEY ("cardTypeId") REFERENCES "card_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_type_fields" ADD CONSTRAINT "card_type_fields_cardTypeId_fkey" FOREIGN KEY ("cardTypeId") REFERENCES "card_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_templates" ADD CONSTRAINT "card_templates_cardTypeId_fkey" FOREIGN KEY ("cardTypeId") REFERENCES "card_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
