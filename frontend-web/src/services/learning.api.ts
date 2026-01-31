import api from '@/lib/api';
import type { 
  VocabularyBook, 
  VocabularyBookWithUnits, 
  VocabularyUnitWithContent,
  VocabularyBookProgress,
  SubmitExerciseResponse,
  SubmitQuestionsResponse,
  GrammarBook,
  GrammarBookWithUnits,
  GrammarUnitWithContent,
  PronunciationData,
  PronunciationSound
} from '@/types';

// ============================================================
// VOCABULARY API
// ============================================================

export const vocabularyApi = {
  getBooks: async () => {
    const { data } = await api.get<VocabularyBook[]>('/vocabulary/books');
    return data;
  },
  getBook: async (id: string) => {
    const { data } = await api.get<VocabularyBookWithUnits>(`/vocabulary/books/${id}`);
    return data;
  },
  getUnit: async (id: string) => {
    const { data } = await api.get<VocabularyUnitWithContent>(`/vocabulary/units/${id}`);
    return data;
  },
  
  // Progress tracking
  getProgress: async (bookId: string) => {
    const { data } = await api.get<VocabularyBookProgress>(`/vocabulary/progress/${bookId}`);
    return data;
  },
  updateWordProgress: async (unitId: string, wordsLearned: number) => {
    const { data } = await api.post('/vocabulary/progress/words', { unitId, wordsLearned });
    return data;
  },
  submitExercise: async (unitId: string, answers: { exerciseId: string; answer: string }[]) => {
    const { data } = await api.post<SubmitExerciseResponse>('/vocabulary/progress/exercise', { unitId, answers });
    return data;
  },
  submitQuestions: async (unitId: string, answers: { questionId: string; answer: string }[]) => {
    const { data } = await api.post<SubmitQuestionsResponse>('/vocabulary/progress/questions', { unitId, answers });
    return data;
  },
};

// ============================================================
// GRAMMAR API
// ============================================================

export const grammarApi = {
  getBooks: async () => {
    const { data } = await api.get<GrammarBook[]>('/grammar/books');
    return data;
  },
  getBook: async (slug: string) => {
    const { data } = await api.get<GrammarBookWithUnits>(`/grammar/books/${slug}`);
    return data;
  },
  getUnit: async (id: string) => {
    const { data } = await api.get<GrammarUnitWithContent>(`/grammar/units/${id}`);
    return data;
  },
};

// ============================================================
// PRONUNCIATION API
// ============================================================

export const pronunciationApi = {
  getAllSounds: async () => {
    const { data } = await api.get<PronunciationData>('/pronunciation/sounds');
    return data;
  },
  getSound: async (symbol: string) => {
    const { data } = await api.get<PronunciationSound>(`/pronunciation/sounds/${encodeURIComponent(symbol)}`);
    return data;
  },
};
