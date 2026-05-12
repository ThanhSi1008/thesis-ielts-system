/**
 * Services - Barrel export for all API services
 */

export { apiClient } from './api-client';
export { vocabularyApi, grammarApi, pronunciationApi, authApi } from './api';
export { learningApi } from './learning.api';
export { postsApi, gamificationApi } from './posts.api';

// Re-export types for convenience
export type {
  BookWithUnits,
  UnitWithContent,
  VocabularyBook,
  GrammarBook,
  GrammarBookWithUnits,
  GrammarUnitWithContent,
  PronunciationSound,
  GroupedSounds,
} from './api';
