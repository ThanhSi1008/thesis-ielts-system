/*
  Warnings:

  - You are about to drop the `grammars` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `learning_materials` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `learning_progress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lessons` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vocabularies` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "grammars" DROP CONSTRAINT "grammars_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "learning_progress" DROP CONSTRAINT "learning_progress_materialId_fkey";

-- DropForeignKey
ALTER TABLE "learning_progress" DROP CONSTRAINT "learning_progress_userId_fkey";

-- DropForeignKey
ALTER TABLE "pronunciation_attempts" DROP CONSTRAINT "pronunciation_attempts_vocabularyId_fkey";

-- DropForeignKey
ALTER TABLE "vocabularies" DROP CONSTRAINT "vocabularies_lessonId_fkey";

-- DropTable
DROP TABLE "grammars";

-- DropTable
DROP TABLE "learning_materials";

-- DropTable
DROP TABLE "learning_progress";

-- DropTable
DROP TABLE "lessons";

-- DropTable
DROP TABLE "vocabularies";

-- DropEnum
DROP TYPE "MaterialType";
