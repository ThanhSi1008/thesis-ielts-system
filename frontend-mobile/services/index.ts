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
  notificationsApi,
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

// Re-export new unified APIs from learning.api
export { vocabularyApi, grammarApi, pronunciationApi } from './learning.api';
export { authApi } from './api';


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

