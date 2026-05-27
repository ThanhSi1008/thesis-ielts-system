-- AlterTable: add audioscriptRef column for LISTENING dual-PDF ingestion
ALTER TABLE "content_import_jobs" ADD COLUMN "audioscriptRef" TEXT;
