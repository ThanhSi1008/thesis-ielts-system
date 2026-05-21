/**
 * @deprecated This file is deprecated and will be removed in Phase 15.
 * Please use domain-specific APIs in @/services instead (e.g. authApi, learningApi).
 *
 * Services - Domain-specific API endpoints
 * Uses ApiClient for HTTP operations and types from types/
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './api-client';
import { STORAGE_KEYS } from '../constants';
import type {
  VocabularyBook,
  VocabularyBookWithUnits,
  VocabularyUnitWithContent,
  VocabularyWord, // Added this import
  GrammarBook,
  GrammarBookWithUnits,
  GrammarUnitWithContent,
  GroupedSounds,
  PronunciationSound,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
} from '../types';

// ==================== VOCABULARY API ====================

export const vocabularyApi = {
  getBooks: () => apiClient.get<VocabularyBook[]>('/vocabulary/books'),
  getBook: (id: string) => apiClient.get<VocabularyBookWithUnits>(`/vocabulary/books/${id}`),
  getUnit: (id: string) => apiClient.get<VocabularyUnitWithContent>(`/vocabulary/units/${id}`),
};

// ==================== GRAMMAR API ====================

export const grammarApi = {
  getBooks: () => apiClient.get<GrammarBook[]>('/grammar/books'),
  getBook: (slug: string) => apiClient.get<GrammarBookWithUnits>(`/grammar/books/${slug}`),
  getUnit: (id: string) => apiClient.get<GrammarUnitWithContent>(`/grammar/units/${id}`),
};

// ==================== PRONUNCIATION API ====================

export const pronunciationApi = {
  getSounds: () => apiClient.get<GroupedSounds>('/pronunciation/sounds'),
  getSound: (symbol: string) =>
    apiClient.get<PronunciationSound>(`/pronunciation/sounds/${symbol}`),
};

// ==================== AUTH API ====================

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthTokens> => {
    const data = await apiClient.post<AuthTokens>('/auth/login', credentials);
    if (data.accessToken) {
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
    }
    return data;
  },

  register: (data: RegisterRequest) => apiClient.post<{ message: string }>('/auth/register', data),

  logout: async () => {
    await AsyncStorage.multiRemove([STORAGE_KEYS.ACCESS_TOKEN, STORAGE_KEYS.REFRESH_TOKEN]);
  },

  refreshToken: async (): Promise<AuthTokens> => {
    const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const data = await apiClient.post<AuthTokens>('/auth/refresh', { refreshToken });
    if (data.accessToken) {
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
    }
    return data;
  },
};

// ==================== BACKWARD COMPATIBLE EXPORTS ====================
// These are for existing components that import types from api.ts

export type {
  VocabularyBook,
  VocabularyBookWithUnits as BookWithUnits,
  VocabularyUnitWithContent as UnitWithContent,
  VocabularyWord, // Added this export
  GrammarBook,
  GrammarBookWithUnits,
  GrammarUnitWithContent,
  PronunciationSound,
  GroupedSounds,
} from '../types';
