/**
 * Feature limit configuration per subscription tier.
 * Values: number = max per period, Infinity = unlimited, 0 = blocked.
 */

export const TIER_LIMITS = {
  FREE: {
    // Foundation
    VOCABULARY_BOOKS: 2,           // First 2 books only
    GRAMMAR_LEVELS: ["Elementary"], // Only elementary level
    PRONUNCIATION_ATTEMPT: 5,      // Per day

    // IELTS
    IELTS_BASIC_LESSONS_PER_SKILL: 3,
    IELTS_BASIC_EXERCISES_PER_SKILL: 2,
    IELTS_ADVANCED_ACCESS: false,
    AI_WRITING_GRADING: 0,         // Per month
    AI_SPEAKING_GRADING: 0,        // Per month
    EXAM_HISTORY_LIMIT: 3,

    // Skills
    SHADOWING_SYSTEM_LESSONS: 5,
    DICTATION_SYSTEM_LESSONS: 5,
    YOUTUBE_IMPORT: false,

    // Vocab Lab
    MAX_DECKS: 3,
    MAX_CARDS_PER_DECK: 50,
    AI_CARD_GEN: 0,                // Per month
    MARKETPLACE_IMPORT: false,
    MARKETPLACE_PUBLISH: false,
  },

  PREMIUM: {
    VOCABULARY_BOOKS: Infinity,
    GRAMMAR_LEVELS: ["Elementary", "Intermediate", "Advanced"],
    PRONUNCIATION_ATTEMPT: Infinity,

    IELTS_BASIC_LESSONS_PER_SKILL: Infinity,
    IELTS_BASIC_EXERCISES_PER_SKILL: Infinity,
    IELTS_ADVANCED_ACCESS: true,
    AI_WRITING_GRADING: 10,
    AI_SPEAKING_GRADING: 10,
    EXAM_HISTORY_LIMIT: Infinity,

    SHADOWING_SYSTEM_LESSONS: Infinity,
    DICTATION_SYSTEM_LESSONS: Infinity,
    YOUTUBE_IMPORT: true,

    MAX_DECKS: Infinity,
    MAX_CARDS_PER_DECK: Infinity,
    AI_CARD_GEN: 50,
    MARKETPLACE_IMPORT: true,
    MARKETPLACE_PUBLISH: true,
  },

  PRO: {
    VOCABULARY_BOOKS: Infinity,
    GRAMMAR_LEVELS: ["Elementary", "Intermediate", "Advanced"],
    PRONUNCIATION_ATTEMPT: Infinity,

    IELTS_BASIC_LESSONS_PER_SKILL: Infinity,
    IELTS_BASIC_EXERCISES_PER_SKILL: Infinity,
    IELTS_ADVANCED_ACCESS: true,
    AI_WRITING_GRADING: Infinity,
    AI_SPEAKING_GRADING: Infinity,
    EXAM_HISTORY_LIMIT: Infinity,

    SHADOWING_SYSTEM_LESSONS: Infinity,
    DICTATION_SYSTEM_LESSONS: Infinity,
    YOUTUBE_IMPORT: true,

    MAX_DECKS: Infinity,
    MAX_CARDS_PER_DECK: Infinity,
    AI_CARD_GEN: Infinity,
    MARKETPLACE_IMPORT: true,
    MARKETPLACE_PUBLISH: true,
  },
} as const;

/**
 * Features that are tracked with monthly usage counters.
 * These use the UsageRecord model.
 */
export const QUOTA_FEATURES = [
  "AI_WRITING_GRADING",
  "AI_SPEAKING_GRADING",
  "AI_CARD_GEN",
] as const;

/**
 * Features tracked with daily counters (reset at midnight).
 */
export const DAILY_QUOTA_FEATURES = [
  "PRONUNCIATION_ATTEMPT",
] as const;

export type QuotaFeature = (typeof QUOTA_FEATURES)[number];
export type DailyQuotaFeature = (typeof DAILY_QUOTA_FEATURES)[number];
export type TierKey = keyof typeof TIER_LIMITS;
