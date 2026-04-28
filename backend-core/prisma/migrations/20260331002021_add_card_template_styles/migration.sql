-- AlterTable
ALTER TABLE "card_templates" ADD COLUMN     "cardStyle" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "fieldStyles" JSONB NOT NULL DEFAULT '{}';
