-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'ADMIN', 'INSTRUCTOR');

-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('FULL_TEST', 'READING', 'LISTENING', 'SPEAKING', 'WRITING', 'PRACTICE');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'GRADING', 'GRADED', 'COMPLETED', 'ABANDONED', 'GRADING_FAILED');

-- CreateEnum
CREATE TYPE "MaterialType" AS ENUM ('LESSON', 'VOCABULARY', 'GRAMMAR', 'PRACTICE', 'VIDEO', 'AUDIO');

-- CreateEnum
CREATE TYPE "PronunciationStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "PronunciationMastery" AS ENUM ('NEW', 'PRACTICING', 'MASTERED');

-- CreateEnum
CREATE TYPE "CardState" AS ENUM ('NEW', 'LEARNING', 'REVIEW', 'RELEARNING');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PREMIUM', 'PRO');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('MOCK', 'VNPAY', 'STRIPE', 'MANUAL');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('STREAK_MILESTONE', 'LESSON_COMPLETED', 'REVIEW_DUE', 'DECK_MASTERED', 'EXAM_GRADED', 'NEW_EXAM_AVAILABLE', 'DICTATION_COMPLETE', 'NEW_LESSON', 'SYSTEM_ANNOUNCEMENT', 'ACHIEVEMENT');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('STUDY_TIP', 'SCORE_ACHIEVEMENT', 'GENERAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "googleId" TEXT,
    "avatar" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exams" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "duration" INTEGER NOT NULL,
    "type" "ExamType" NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "questions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "answers" JSONB NOT NULL,
    "timeTaken" INTEGER,
    "practicePart" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "results" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "readingScore" INTEGER,
    "listeningScore" INTEGER,
    "speakingScore" DOUBLE PRECISION,
    "writingScore" DOUBLE PRECISION,
    "feedback" JSONB,
    "gradedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_materials" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" JSONB NOT NULL,
    "type" "MaterialType" NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "tags" TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "lastAccess" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" "Difficulty" NOT NULL,
    "order" INTEGER NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabularies" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "ipa" TEXT,
    "audioUrl" TEXT,
    "example" TEXT,
    "partOfSpeech" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vocabularies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grammars" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "rule" TEXT NOT NULL,
    "example" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grammars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pronunciation_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vocabularyId" TEXT,
    "audioUrl" TEXT NOT NULL,
    "transcribedText" TEXT,
    "targetWord" TEXT NOT NULL,
    "score" INTEGER,
    "feedback" JSONB,
    "status" "PronunciationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pronunciation_attempts_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "vocabulary_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "wordsLearned" INTEGER NOT NULL DEFAULT 0,
    "totalWords" INTEGER NOT NULL DEFAULT 20,
    "questionScore" INTEGER,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vocabulary_progress_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "pronunciation_sounds" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "tip" TEXT,
    "imageUrl" TEXT,
    "audioUrl" TEXT,
    "videoUrl" TEXT,
    "voiced" BOOLEAN,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pronunciation_sounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sound_example_words" (
    "id" TEXT NOT NULL,
    "soundId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "ipa" TEXT,
    "audioUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "sound_example_words_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pronunciation_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "soundId" TEXT NOT NULL,
    "status" "PronunciationMastery" NOT NULL DEFAULT 'NEW',
    "practiceCount" INTEGER NOT NULL DEFAULT 0,
    "bestScore" INTEGER,
    "lastPracticedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pronunciation_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "decks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flashcards" (
    "id" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "tags" TEXT[],
    "due" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stability" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "elapsedDays" INTEGER NOT NULL DEFAULT 0,
    "scheduledDays" INTEGER NOT NULL DEFAULT 0,
    "reps" INTEGER NOT NULL DEFAULT 0,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "lastReview" TIMESTAMP(3),
    "nextReviewDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cardState" "CardState" NOT NULL DEFAULT 'NEW',
    "cardTypeId" TEXT,
    "fieldValues" JSONB NOT NULL DEFAULT '{}',
    "fieldStyles" JSONB,
    "cardStyle" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flashcards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flashcard_reviews" (
    "id" TEXT NOT NULL,
    "flashcardId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledDays" INTEGER NOT NULL DEFAULT 0,
    "elapsedDays" INTEGER NOT NULL DEFAULT 0,
    "state" "CardState",

    CONSTRAINT "flashcard_reviews_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "card_templates" (
    "id" TEXT NOT NULL,
    "cardTypeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "frontFields" TEXT[],
    "backFields" TEXT[],
    "fieldStyles" JSONB NOT NULL DEFAULT '{}',
    "cardStyle" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "card_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_decks" (
    "id" TEXT NOT NULL,
    "publisherId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT[],
    "lexonPayload" JSONB NOT NULL,
    "importCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shared_decks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_notes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "questionNumber" INTEGER NOT NULL,
    "noteText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shadowing_videos" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "youtubeVideoId" TEXT,
    "audioUrl" TEXT,
    "imageUrl" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "folder" TEXT NOT NULL DEFAULT 'All Videos',
    "category" TEXT NOT NULL DEFAULT 'Other',
    "duration" TEXT NOT NULL,
    "sentences" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'READY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shadowing_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shadowing_folders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "shadowing_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shadowing_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "completedSentences" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shadowing_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dictation_videos" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "youtubeVideoId" TEXT,
    "audioUrl" TEXT,
    "imageUrl" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "folder" TEXT NOT NULL DEFAULT 'All Videos',
    "category" TEXT NOT NULL DEFAULT 'Other',
    "duration" TEXT NOT NULL,
    "sentences" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'READY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dictation_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dictation_folders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "dictation_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dictation_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "completedSentences" INTEGER[],
    "difficulty" TEXT NOT NULL DEFAULT 'Intermediate',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dictation_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ielts_skills" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ielts_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ielts_lessons" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "chapter" TEXT,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "quiz" JSONB,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ielts_lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ielts_listening_exercises" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "lessonId" TEXT,
    "topic" TEXT NOT NULL,
    "instructions" TEXT,
    "audioUrl" TEXT NOT NULL,
    "transcript" JSONB NOT NULL,
    "content" JSONB NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ielts_listening_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ielts_reading_exercises" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "lessonId" TEXT,
    "topic" TEXT NOT NULL,
    "instructions" TEXT,
    "passage" TEXT NOT NULL,
    "passageWithLocations" JSONB,
    "content" JSONB NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ielts_reading_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ielts_basic_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT,
    "listeningExerciseId" TEXT,
    "readingExerciseId" TEXT,
    "writingExerciseId" TEXT,
    "speakingExerciseId" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ielts_basic_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ielts_writing_exercises" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "lessonId" TEXT,
    "topic" TEXT NOT NULL,
    "instructions" TEXT,
    "prompt" TEXT NOT NULL,
    "diagramUrl" TEXT,
    "modelAnswer" JSONB NOT NULL,
    "order" INTEGER NOT NULL,
    "taskType" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ielts_writing_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ielts_writing_user_answers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "writingExerciseId" TEXT NOT NULL,
    "answers" JSONB NOT NULL DEFAULT '{}',
    "score" INTEGER,
    "totalBlanks" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ielts_writing_user_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ielts_speaking_exercises" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "lessonId" TEXT,
    "topic" TEXT NOT NULL,
    "partType" INTEGER NOT NULL,
    "questionType" TEXT NOT NULL DEFAULT 'cloze',
    "instructions" TEXT,
    "prompt" TEXT NOT NULL,
    "content" JSONB,
    "modelAnswer" JSONB,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ielts_speaking_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ielts_practice_listening_parts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "partNumber" INTEGER NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "transcript" JSONB NOT NULL,
    "content" JSONB NOT NULL,
    "questionTypes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ielts_practice_listening_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ielts_practice_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "scoreData" JSONB NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ielts_practice_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ielts_practice_reading_parts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "partNumber" INTEGER NOT NULL,
    "passage" TEXT NOT NULL,
    "passageWithLocations" JSONB,
    "content" JSONB NOT NULL,
    "questionTypes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ielts_practice_reading_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ielts_practice_reading_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "scoreData" JSONB NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ielts_practice_reading_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ielts_advanced_writing_prompts" (
    "id" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "subType" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'engnovate',
    "category" TEXT NOT NULL DEFAULT 'cambridge-academic',
    "bookNumber" INTEGER,
    "testNumber" INTEGER,
    "title" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "imageUrl" TEXT,
    "minimumWords" INTEGER NOT NULL DEFAULT 150,
    "suggestedTime" INTEGER NOT NULL DEFAULT 20,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "engnovateSlug" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ielts_advanced_writing_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ielts_advanced_writing_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "essay" TEXT,
    "draftEssay" TEXT,
    "timeTaken" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "feedback" JSONB,
    "bandScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ielts_advanced_writing_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ielts_advanced_speaking_parts" (
    "id" TEXT NOT NULL,
    "partNumber" INTEGER NOT NULL,
    "partType" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'engnovate',
    "category" TEXT NOT NULL DEFAULT 'cambridge-academic',
    "bookNumber" INTEGER,
    "testNumber" INTEGER,
    "title" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "engnovateSlug" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ielts_advanced_speaking_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ielts_advanced_speaking_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "audioUrls" JSONB,
    "transcription" JSONB,
    "timeTaken" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "feedback" JSONB,
    "bandScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ielts_advanced_speaking_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ielts_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetBand" DOUBLE PRECISION,
    "dailyCommitmentMins" INTEGER DEFAULT 30,
    "examDate" TIMESTAMP(3),
    "placementScore" INTEGER,
    "placementListening" INTEGER,
    "placementReading" INTEGER,
    "placementWriting" INTEGER,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TIMESTAMP(3),
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ielts_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_teacher_links" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LINKED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_teacher_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "icon" TEXT,
    "thumbnail" TEXT,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tier" INTEGER NOT NULL DEFAULT 1,
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "type" "PostType" NOT NULL DEFAULT 'GENERAL',
    "title" TEXT,
    "body" TEXT NOT NULL,
    "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "bookmarkCount" INTEGER NOT NULL DEFAULT 0,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "parentId" TEXT,
    "body" TEXT NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_likes" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_bookmarks" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "provider" "PaymentProvider",
    "providerSubId" TEXT,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "trialEndsAt" TIMESTAMP(3),
    "trialUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "provider" "PaymentProvider" NOT NULL,
    "providerPayId" TEXT,
    "status" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_records" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usage_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_plans" (
    "id" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceAmount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "interval" TEXT NOT NULL,
    "intervalCount" INTEGER NOT NULL DEFAULT 1,
    "features" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "results_sessionId_key" ON "results"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "learning_progress_userId_materialId_key" ON "learning_progress"("userId", "materialId");

-- CreateIndex
CREATE UNIQUE INDEX "vocabulary_progress_userId_unitId_key" ON "vocabulary_progress"("userId", "unitId");

-- CreateIndex
CREATE UNIQUE INDEX "grammar_books_slug_key" ON "grammar_books"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "grammar_progress_userId_unitId_key" ON "grammar_progress"("userId", "unitId");

-- CreateIndex
CREATE UNIQUE INDEX "pronunciation_sounds_symbol_key" ON "pronunciation_sounds"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "pronunciation_progress_userId_soundId_key" ON "pronunciation_progress"("userId", "soundId");

-- CreateIndex
CREATE INDEX "shared_decks_publisherId_idx" ON "shared_decks"("publisherId");

-- CreateIndex
CREATE INDEX "shared_decks_importCount_idx" ON "shared_decks"("importCount");

-- CreateIndex
CREATE UNIQUE INDEX "question_notes_userId_examId_questionNumber_key" ON "question_notes"("userId", "examId", "questionNumber");

-- CreateIndex
CREATE INDEX "shadowing_videos_userId_idx" ON "shadowing_videos"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "shadowing_folders_userId_name_key" ON "shadowing_folders"("userId", "name");

-- CreateIndex
CREATE INDEX "shadowing_progress_userId_idx" ON "shadowing_progress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "shadowing_progress_userId_lessonId_key" ON "shadowing_progress"("userId", "lessonId");

-- CreateIndex
CREATE INDEX "dictation_videos_userId_idx" ON "dictation_videos"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "dictation_folders_userId_name_key" ON "dictation_folders"("userId", "name");

-- CreateIndex
CREATE INDEX "dictation_progress_userId_idx" ON "dictation_progress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "dictation_progress_userId_lessonId_key" ON "dictation_progress"("userId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "ielts_skills_name_key" ON "ielts_skills"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ielts_basic_progress_userId_lessonId_listeningExerciseId_re_key" ON "ielts_basic_progress"("userId", "lessonId", "listeningExerciseId", "readingExerciseId", "writingExerciseId", "speakingExerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "ielts_writing_user_answers_userId_writingExerciseId_key" ON "ielts_writing_user_answers"("userId", "writingExerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "ielts_advanced_writing_prompts_engnovateSlug_key" ON "ielts_advanced_writing_prompts"("engnovateSlug");

-- CreateIndex
CREATE INDEX "ielts_advanced_writing_sessions_userId_idx" ON "ielts_advanced_writing_sessions"("userId");

-- CreateIndex
CREATE INDEX "ielts_advanced_writing_sessions_promptId_idx" ON "ielts_advanced_writing_sessions"("promptId");

-- CreateIndex
CREATE UNIQUE INDEX "ielts_advanced_speaking_parts_engnovateSlug_partNumber_key" ON "ielts_advanced_speaking_parts"("engnovateSlug", "partNumber");

-- CreateIndex
CREATE INDEX "ielts_advanced_speaking_sessions_userId_idx" ON "ielts_advanced_speaking_sessions"("userId");

-- CreateIndex
CREATE INDEX "ielts_advanced_speaking_sessions_partId_idx" ON "ielts_advanced_speaking_sessions"("partId");

-- CreateIndex
CREATE UNIQUE INDEX "ielts_profiles_userId_key" ON "ielts_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "student_teacher_links_studentId_teacherId_key" ON "student_teacher_links"("studentId", "teacherId");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_key_key" ON "achievements"("key");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_userId_achievementId_key" ON "user_achievements"("userId", "achievementId");

-- CreateIndex
CREATE INDEX "xp_logs_userId_createdAt_idx" ON "xp_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "posts_authorId_idx" ON "posts"("authorId");

-- CreateIndex
CREATE INDEX "posts_createdAt_idx" ON "posts"("createdAt");

-- CreateIndex
CREATE INDEX "posts_likeCount_idx" ON "posts"("likeCount");

-- CreateIndex
CREATE INDEX "comments_postId_createdAt_idx" ON "comments"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "comments_authorId_idx" ON "comments"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "post_likes_postId_userId_key" ON "post_likes"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "post_bookmarks_postId_userId_key" ON "post_bookmarks"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_userId_key" ON "subscriptions"("userId");

-- CreateIndex
CREATE INDEX "payments_subscriptionId_idx" ON "payments"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "usage_records_subscriptionId_feature_periodStart_key" ON "usage_records"("subscriptionId", "feature", "periodStart");

-- AddForeignKey
ALTER TABLE "exam_sessions" ADD CONSTRAINT "exam_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_sessions" ADD CONSTRAINT "exam_sessions_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "exam_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_progress" ADD CONSTRAINT "learning_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_progress" ADD CONSTRAINT "learning_progress_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "learning_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabularies" ADD CONSTRAINT "vocabularies_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grammars" ADD CONSTRAINT "grammars_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pronunciation_attempts" ADD CONSTRAINT "pronunciation_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pronunciation_attempts" ADD CONSTRAINT "pronunciation_attempts_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "vocabularies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_units" ADD CONSTRAINT "vocabulary_units_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "vocabulary_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_words" ADD CONSTRAINT "vocabulary_words_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "vocabulary_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_questions" ADD CONSTRAINT "vocabulary_questions_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "vocabulary_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_progress" ADD CONSTRAINT "vocabulary_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_progress" ADD CONSTRAINT "vocabulary_progress_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "vocabulary_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grammar_units" ADD CONSTRAINT "grammar_units_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "grammar_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grammar_exercises" ADD CONSTRAINT "grammar_exercises_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "grammar_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grammar_progress" ADD CONSTRAINT "grammar_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grammar_progress" ADD CONSTRAINT "grammar_progress_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "grammar_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sound_example_words" ADD CONSTRAINT "sound_example_words_soundId_fkey" FOREIGN KEY ("soundId") REFERENCES "pronunciation_sounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pronunciation_progress" ADD CONSTRAINT "pronunciation_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pronunciation_progress" ADD CONSTRAINT "pronunciation_progress_soundId_fkey" FOREIGN KEY ("soundId") REFERENCES "pronunciation_sounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decks" ADD CONSTRAINT "decks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_cardTypeId_fkey" FOREIGN KEY ("cardTypeId") REFERENCES "card_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcard_reviews" ADD CONSTRAINT "flashcard_reviews_flashcardId_fkey" FOREIGN KEY ("flashcardId") REFERENCES "flashcards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_type_fields" ADD CONSTRAINT "card_type_fields_cardTypeId_fkey" FOREIGN KEY ("cardTypeId") REFERENCES "card_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_templates" ADD CONSTRAINT "card_templates_cardTypeId_fkey" FOREIGN KEY ("cardTypeId") REFERENCES "card_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_decks" ADD CONSTRAINT "shared_decks_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_notes" ADD CONSTRAINT "question_notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shadowing_videos" ADD CONSTRAINT "shadowing_videos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shadowing_folders" ADD CONSTRAINT "shadowing_folders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shadowing_progress" ADD CONSTRAINT "shadowing_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dictation_videos" ADD CONSTRAINT "dictation_videos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dictation_folders" ADD CONSTRAINT "dictation_folders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dictation_progress" ADD CONSTRAINT "dictation_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_lessons" ADD CONSTRAINT "ielts_lessons_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "ielts_skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_listening_exercises" ADD CONSTRAINT "ielts_listening_exercises_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "ielts_skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_listening_exercises" ADD CONSTRAINT "ielts_listening_exercises_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "ielts_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_reading_exercises" ADD CONSTRAINT "ielts_reading_exercises_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "ielts_skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_reading_exercises" ADD CONSTRAINT "ielts_reading_exercises_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "ielts_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_basic_progress" ADD CONSTRAINT "ielts_basic_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_basic_progress" ADD CONSTRAINT "ielts_basic_progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "ielts_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_basic_progress" ADD CONSTRAINT "ielts_basic_progress_listeningExerciseId_fkey" FOREIGN KEY ("listeningExerciseId") REFERENCES "ielts_listening_exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_basic_progress" ADD CONSTRAINT "ielts_basic_progress_readingExerciseId_fkey" FOREIGN KEY ("readingExerciseId") REFERENCES "ielts_reading_exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_basic_progress" ADD CONSTRAINT "ielts_basic_progress_writingExerciseId_fkey" FOREIGN KEY ("writingExerciseId") REFERENCES "ielts_writing_exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_basic_progress" ADD CONSTRAINT "ielts_basic_progress_speakingExerciseId_fkey" FOREIGN KEY ("speakingExerciseId") REFERENCES "ielts_speaking_exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_writing_exercises" ADD CONSTRAINT "ielts_writing_exercises_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "ielts_skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_writing_exercises" ADD CONSTRAINT "ielts_writing_exercises_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "ielts_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_writing_user_answers" ADD CONSTRAINT "ielts_writing_user_answers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_writing_user_answers" ADD CONSTRAINT "ielts_writing_user_answers_writingExerciseId_fkey" FOREIGN KEY ("writingExerciseId") REFERENCES "ielts_writing_exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_speaking_exercises" ADD CONSTRAINT "ielts_speaking_exercises_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "ielts_skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_speaking_exercises" ADD CONSTRAINT "ielts_speaking_exercises_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "ielts_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_practice_sessions" ADD CONSTRAINT "ielts_practice_sessions_partId_fkey" FOREIGN KEY ("partId") REFERENCES "ielts_practice_listening_parts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_practice_sessions" ADD CONSTRAINT "ielts_practice_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_practice_reading_sessions" ADD CONSTRAINT "ielts_practice_reading_sessions_partId_fkey" FOREIGN KEY ("partId") REFERENCES "ielts_practice_reading_parts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_practice_reading_sessions" ADD CONSTRAINT "ielts_practice_reading_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_advanced_writing_sessions" ADD CONSTRAINT "ielts_advanced_writing_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_advanced_writing_sessions" ADD CONSTRAINT "ielts_advanced_writing_sessions_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "ielts_advanced_writing_prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_advanced_speaking_sessions" ADD CONSTRAINT "ielts_advanced_speaking_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_advanced_speaking_sessions" ADD CONSTRAINT "ielts_advanced_speaking_sessions_partId_fkey" FOREIGN KEY ("partId") REFERENCES "ielts_advanced_speaking_parts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ielts_profiles" ADD CONSTRAINT "ielts_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_teacher_links" ADD CONSTRAINT "student_teacher_links_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_teacher_links" ADD CONSTRAINT "student_teacher_links_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_logs" ADD CONSTRAINT "xp_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_bookmarks" ADD CONSTRAINT "post_bookmarks_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_bookmarks" ADD CONSTRAINT "post_bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

