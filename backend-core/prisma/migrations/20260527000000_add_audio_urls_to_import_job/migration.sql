-- AlterTable: add audioUrls column to content_import_jobs
ALTER TABLE "content_import_jobs" ADD COLUMN "audioUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
