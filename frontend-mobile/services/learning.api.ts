/**
 * Learning API - Handles Vocabulary, Grammar, Pronunciation and AI Voice checks
 * Syncs with Web implementation
 */

import { apiClient } from './api-client';
import type {
  FoundationVocabBook,
  VocabularyBookWithUnits,
  VocabularyUnitWithContent,
  VocabularyBookProgress,
  SubmitQuestionsResponse,
  FoundationGrammarBook,
  GrammarBookWithUnits,
  GrammarUnitWithContent,
  GrammarUnitProgress,
  PronunciationData,
  FoundationPronunciationSound,
  SoundProgress,
  PronunciationStats,
  WordProgress,
  PronunciationCheckResponse,
} from '../types';

// ============================================================
// VOCABULARY API
// ============================================================

export const vocabularyApi = {
  getBooks: async (): Promise<FoundationVocabBook[]> => {
    return apiClient.get<FoundationVocabBook[]>('/foundationVocabWord/books');
  },
  getBook: async (id: string): Promise<VocabularyBookWithUnits> => {
    return apiClient.get<VocabularyBookWithUnits>(`/foundationVocabWord/books/${id}`);
  },
  getUnit: async (id: string): Promise<VocabularyUnitWithContent> => {
    return apiClient.get<VocabularyUnitWithContent>(`/foundationVocabWord/units/${id}`);
  },

  // Progress tracking
  getProgress: async (bookId: string): Promise<VocabularyBookProgress> => {
    return apiClient.get<VocabularyBookProgress>(`/foundationVocabWord/progress/${bookId}`);
  },
  updateWordProgress: async (unitId: string, wordsLearned: number): Promise<any> => {
    return apiClient.post('/foundationVocabWord/progress/words', { unitId, wordsLearned });
  },

  submitQuestions: async (unitId: string, answers: { questionId: string; answer: string }[]): Promise<SubmitQuestionsResponse> => {
    return apiClient.post<SubmitQuestionsResponse>('/foundationVocabWord/progress/questions', { unitId, answers });
  },
};

// ============================================================
// GRAMMAR API
// ============================================================

export const grammarApi = {
  getBooks: async (): Promise<FoundationGrammarBook[]> => {
    return apiClient.get<FoundationGrammarBook[]>('/grammar/books');
  },
  getBook: async (slug: string): Promise<GrammarBookWithUnits> => {
    return apiClient.get<GrammarBookWithUnits>(`/grammar/books/${slug}`);
  },
  getUnit: async (id: string): Promise<GrammarUnitWithContent> => {
    return apiClient.get<GrammarUnitWithContent>(`/grammar/units/${id}`);
  },
  getUnitByOrder: async (bookSlug: string, order: string | number): Promise<GrammarUnitWithContent> => {
    return apiClient.get<GrammarUnitWithContent>(`/grammar/books/${bookSlug}/units/${order}`);
  },
  getProgress: async (bookSlug: string): Promise<GrammarUnitProgress[]> => {
    return apiClient.get<GrammarUnitProgress[]>(`/grammar/progress/${bookSlug}`);
  },
  updateProgress: async (unitId: string, payload: { theoryCompleted?: boolean; exerciseScore?: number; exerciseTotal?: number }): Promise<any> => {
    return apiClient.post('/grammar/progress', { unitId, ...payload });
  },
};

// ============================================================
// PRONUNCIATION API
// ============================================================

export const pronunciationApi = {
  getAllSounds: async (): Promise<PronunciationData> => {
    return apiClient.get<PronunciationData>('/pronunciation/sounds');
  },
  getSound: async (symbol: string): Promise<FoundationPronunciationSound> => {
    return apiClient.get<FoundationPronunciationSound>(`/pronunciation/sounds/${encodeURIComponent(symbol)}`);
  },
  getProgress: async (): Promise<SoundProgress[]> => {
    return apiClient.get<SoundProgress[]>('/pronunciation/progress');
  },
  getStats: async (): Promise<PronunciationStats> => {
    return apiClient.get<PronunciationStats>('/pronunciation/progress/stats');
  },
  updateProgress: async (soundId: string, score: number): Promise<any> => {
    return apiClient.post('/pronunciation/progress', { soundId, score });
  },
  getWordProgress: async (soundId: string): Promise<WordProgress[]> => {
    return apiClient.get<WordProgress[]>(`/pronunciation/sounds/${soundId}/word-progress`);
  },
};

// ============================================================
// LEARNING API (General & Voice checks)
// ============================================================

export const learningApi = {
  /**
   * Check pronunciation of an audio file
   * @param audioUri URI of the recorded audio file (local path)
   * @param userId Current user ID
   * @param options Target word or vocabulary ID for context
   */
  checkPronunciation: async (
    audioUri: string,
    userId: string,
    options: { vocabularyId?: string; targetWord?: string } = {},
  ): Promise<PronunciationCheckResponse> => {
    const formData = new FormData();

    // In React Native, FormData requires an object with uri, type, and name for files
    const uriParts = audioUri.split('/');
    const fileName = uriParts[uriParts.length - 1];

    // Extension → MIME map: covers all formats iOS/Android expo-audio may produce
    const extensionMimeMap: Record<string, string> = {
      '.wav': 'audio/wav',
      '.mp3': 'audio/mpeg',
      '.webm': 'audio/webm',
      '.m4a': 'audio/mp4', // iOS M4A is MPEG-4 Audio container (RFC 4337)
      '.mp4': 'audio/mp4',
      '.aac': 'audio/aac',
      '.caf': 'audio/x-caf', // iOS Core Audio Format (edge case)
    };
    const ext = fileName.includes('.') ? fileName.slice(fileName.lastIndexOf('.')) : '.wav';
    const fileType = extensionMimeMap[ext] ?? 'audio/wav';

    // DEBUG: shows actual URI & MIME in Metro console so we can verify iOS output
    console.log(`[PronunciationAPI] uri=${audioUri}`);
    console.log(`[PronunciationAPI] fileName=${fileName} | ext=${ext} | mimeType=${fileType}`);

    // @ts-ignore - React Native FormData accepts {uri, name, type} for files
    formData.append('audio', {
      uri: audioUri,
      name: fileName,
      type: fileType,
    });

    formData.append('userId', userId);

    if (options.vocabularyId) {
      formData.append('vocabularyId', options.vocabularyId);
    }

    if (options.targetWord) {
      formData.append('targetWord', options.targetWord);
    }

    return apiClient.postForm<PronunciationCheckResponse>('/pronunciation/check', formData);
  },

  /** Poll pronunciation attempts to check if AI processing completed */
  getUserPronunciationAttempts: async (userId: string): Promise<any[]> => {
    return apiClient.get<any[]>(`/pronunciation/attempts/${userId}`);
  },
};

export default learningApi;
