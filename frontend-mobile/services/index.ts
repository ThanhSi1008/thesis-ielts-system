/**
 * Services - Barrel export for all API services
 */

export { apiClient } from './api-client';
export * from './auth.service';

// Expose individual apis from features.api
export {
  vocabLabApi,
  shadowingApi,
  ieltsBasicApi,
  subscriptionsApi,
} from './features.api';

// Expose individual apis from ielts.api
export {
  ieltsProfileApi,
  ieltsAdvancedApi,
  ieltsExamsApi,
  studentTeacherApi,
} from './ielts.api';

export { learningApi } from './learning.api';
export { notesApi } from './notes.api';
export { postsApi } from './posts.api';

// Combined gamificationApi from features.api and posts.api
import { gamificationApi as featuresGamification } from './features.api';
import { gamificationApi as postsGamification } from './posts.api';
export const gamificationApi = {
  ...featuresGamification,
  ...postsGamification,
};

// Combined vocabularyApi and grammarApi to merge type-safe methods with advanced methods
import { vocabularyApi as apiVocab, grammarApi as apiGrammar, pronunciationApi, authApi } from './api';
import { vocabularyApi as ieltsVocab, grammarApi as ieltsGrammar } from './ielts.api';

export const vocabularyApi = {
  ...apiVocab,
  ...ieltsVocab,
};

export const grammarApi = {
  ...apiGrammar,
  ...ieltsGrammar,
};

export { pronunciationApi, authApi };

// Re-export types for convenience
export type {
  VocabularyBook,
  BookWithUnits,
  UnitWithContent,
  VocabularyWord,
  GrammarBook,
  GrammarBookWithUnits,
  GrammarUnitWithContent,
  PronunciationSound,
  GroupedSounds,
} from './api';

