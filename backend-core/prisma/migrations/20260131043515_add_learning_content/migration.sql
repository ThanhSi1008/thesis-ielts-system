-- CreateTable
CREATE TABLE "vocabulary_books" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vocabulary_books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabulary_units" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "storyTitle" TEXT,
    "storyContent" TEXT,
    "storyImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vocabulary_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabulary_words" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "ipa" TEXT,
    "partOfSpeech" TEXT,
    "example" TEXT,
    "imageUrl" TEXT,
    "audioUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vocabulary_words_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabulary_exercises" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "vocabulary_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabulary_questions" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "options" JSONB,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "vocabulary_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grammar_books" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "unitCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grammar_books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grammar_units" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "theoryContent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grammar_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grammar_exercises" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "options" JSONB,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "grammar_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pronunciation_sounds" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "audioUrl" TEXT,
    "voiced" BOOLEAN,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pronunciation_sounds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "grammar_books_slug_key" ON "grammar_books"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "pronunciation_sounds_symbol_key" ON "pronunciation_sounds"("symbol");

-- AddForeignKey
ALTER TABLE "vocabulary_units" ADD CONSTRAINT "vocabulary_units_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "vocabulary_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_words" ADD CONSTRAINT "vocabulary_words_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "vocabulary_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_exercises" ADD CONSTRAINT "vocabulary_exercises_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "vocabulary_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_questions" ADD CONSTRAINT "vocabulary_questions_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "vocabulary_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grammar_units" ADD CONSTRAINT "grammar_units_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "grammar_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grammar_exercises" ADD CONSTRAINT "grammar_exercises_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "grammar_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;
