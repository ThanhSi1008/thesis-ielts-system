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
  PronunciationSound,
  SoundProgress,
  PronunciationStats,
  WordProgress,
  GrammarUnitProgress,
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
  getUnitByOrder: async (bookSlug: string, order: string | number) => {
    const { data } = await api.get<GrammarUnitWithContent>(`/grammar/books/${bookSlug}/units/${order}`);
    return data;
  },
  getProgress: async (bookSlug: string) => {
    const { data } = await api.get<GrammarUnitProgress[]>(`/grammar/progress/${bookSlug}`);
    return data;
  },
  updateProgress: async (unitId: string, payload: { theoryCompleted?: boolean; exerciseScore?: number; exerciseTotal?: number }) => {
    const { data } = await api.post('/grammar/progress', { unitId, ...payload });
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
  getProgress: async () => {
    const { data } = await api.get<SoundProgress[]>('/pronunciation/progress');
    return data;
  },
  getStats: async () => {
    const { data } = await api.get<PronunciationStats>('/pronunciation/progress/stats');
    return data;
  },
  updateProgress: async (soundId: string, score: number) => {
    const { data } = await api.post('/pronunciation/progress', { soundId, score });
    return data;
  },
  getWordProgress: async (soundId: string) => {
    const { data } = await api.get<WordProgress[]>(`/pronunciation/sounds/${soundId}/word-progress`);
    return data;
  },
};

// ============================================================
// LEARNING API (General)
// ============================================================

export const learningApi = {
  checkPronunciation: async (file: File, userId: string, options: { vocabularyId?: string; targetWord?: string }) => {
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('userId', userId);

    if (options.vocabularyId) {
      formData.append('vocabularyId', options.vocabularyId);
    }

    if (options.targetWord) {
      formData.append('targetWord', options.targetWord);
    }

    const { data } = await api.post('/learning/pronunciation/check', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
  getUserPronunciationAttempts: async (userId: string) => {
    const { data } = await api.get(`/learning/pronunciation/attempts/${userId}`);
    return data;
  },
};
