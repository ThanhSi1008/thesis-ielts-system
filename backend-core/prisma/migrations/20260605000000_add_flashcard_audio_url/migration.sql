-- Add an optional TTS-generated pronunciation audio URL to flashcards.
-- Nullable so all existing rows and other create paths (e.g. foundation
-- vocabulary import) remain valid without supplying it.
ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "audioUrl" TEXT;
