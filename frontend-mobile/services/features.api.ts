import { apiClient } from './api-client';
import {
  Deck,
  Flashcard,
  CardType,
  VocabStats,
  ShadowingVideo,
  ShadowingProgress,
  ShadowingSentence,
  IeltsSkill,
  IeltsLesson,
  IeltsExercise,
  GamificationProfile,
  AchievementItem,
  DictationVideo,
  SharedDeck,
  CardTemplate,
} from '@/types';

// ==================== VOCAB LAB ====================
export const vocabLabApi = {
  getDecks: () => apiClient.get<Deck[]>('/vocab-lab/decks'),
  getDeckDetail: (id: string) => apiClient.get<Deck>(`/vocab-lab/decks/${id}`),
  createDeck: (name: string) => apiClient.post<Deck>('/vocab-lab/decks', { name }),
  deleteDeck: (id: string) => apiClient.delete<void>(`/vocab-lab/decks/${id}`),
  renameDeck: (id: string, name: string) =>
    apiClient.patch<void>(`/vocab-lab/decks/${id}`, { name }),
  getStudyCards: (deckId: string) => apiClient.get<Flashcard[]>(`/vocab-lab/study/${deckId}`),
  submitReview: (payload: { flashcardId: string; rating: number }) =>
    apiClient.post<void>('/vocab-lab/review', payload),
  getStats: (range?: number) => {
    const url = range ? `/vocab-lab/stats?range=${range}` : '/vocab-lab/stats';
    return apiClient.get<VocabStats>(url);
  },
  getCardTypes: () => apiClient.get<CardType[]>('/vocab-lab/card-types'),
  createCardType: (payload: { name: string }) =>
    apiClient.post<CardType>('/vocab-lab/card-types', payload),
  updateCardType: (id: string, payload: { name: string }) =>
    apiClient.patch<CardType>(`/vocab-lab/card-types/${id}`, payload),
  deleteCardType: (id: string) => apiClient.delete<void>(`/vocab-lab/card-types/${id}`),
  addField: (cardTypeId: string, payload: any) =>
    apiClient.post<any>(`/vocab-lab/card-types/${cardTypeId}/fields`, payload),
  updateField: (cardTypeId: string, fieldId: string, payload: any) =>
    apiClient.patch<any>(`/vocab-lab/card-types/${cardTypeId}/fields/${fieldId}`, payload),
  deleteField: (cardTypeId: string, fieldId: string) =>
    apiClient.delete<void>(`/vocab-lab/card-types/${cardTypeId}/fields/${fieldId}`),
  updateTemplate: (cardTypeId: string, templateId: string, payload: any) =>
    apiClient.patch<any>(`/vocab-lab/card-types/${cardTypeId}/templates/${templateId}`, payload),
  createFlashcard: (payload: {
    deckId: string;
    front: string;
    back: string;
    cardTypeId?: string;
    fieldValues?: Record<string, string>;
    fieldStyles?: Record<string, any>;
    tags?: string[];
  }) => apiClient.post<Flashcard>('/vocab-lab/cards', payload),
  updateFlashcard: (
    id: string,
    payload: {
      front?: string;
      back?: string;
      fieldValues?: Record<string, string>;
      tags?: string[];
    },
  ) => apiClient.put<Flashcard>(`/vocab-lab/cards/${id}`, payload),
  deleteFlashcard: (id: string) => apiClient.delete<void>(`/vocab-lab/cards/${id}`),
  browseCards: (params?: { deckId?: string; cardState?: string; tag?: string }) => {
    const q = new URLSearchParams();
    if (params?.deckId) q.set('deckId', params.deckId);
    if (params?.cardState) q.set('cardState', params.cardState);
    if (params?.tag) q.set('tag', params.tag);
    const qs = q.toString();
    return apiClient.get<Flashcard[]>(`/vocab-lab/cards${qs ? `?${qs}` : ''}`);
  },
  getTags: () => apiClient.get<string[]>('/vocab-lab/tags'),
  uploadMedia: async (
    uri: string,
    mimeType: string,
    fileName: string,
  ): Promise<{ url: string }> => {
    const formData = new FormData();
    // @ts-ignore - FormData in React Native accepts an object for file uploads
    formData.append('file', { uri, name: fileName, type: mimeType });
    return apiClient.postForm<{ url: string }>('/vocab-lab/media/upload', formData);
  },
  // Community Marketplace
  browseSharedDecks: (params?: {
    search?: string;
    sort?: string;
    category?: string;
    limit?: number;
    publisherId?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.sort) q.set('sort', params.sort);
    if (params?.category) q.set('category', params.category);
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.publisherId) q.set('publisherId', params.publisherId);
    const qs = q.toString();
    return apiClient.get<any[]>(`/vocab-lab/community/decks${qs ? `?${qs}` : ''}`);
  },
  importSharedDeck: (id: string) =>
    apiClient.post<void>(`/vocab-lab/community/decks/${id}/import`, {}),
  getSharedDeck: (id: string) =>
    apiClient.get<SharedDeck>(`/vocab-lab/community/decks/${id}`),
  getTemplates: (cardTypeId: string) =>
    apiClient.get<CardTemplate[]>(`/vocab-lab/card-types/${cardTypeId}/templates`),
  updateCardTypeDescription: (id: string, description: string | null) =>
    apiClient.patch<CardType>(`/vocab-lab/card-types/${id}/description`, { description }),
  unpublishDeck: (id: string) => apiClient.delete<void>(`/vocab-lab/community/decks/${id}`),
  publishDeck: (id: string, payload: { name: string; description?: string; tags?: string[] }) =>
    apiClient.post<any>(`/vocab-lab/decks/${id}/publish`, payload),
  importDeck: (lexonData: any) =>
    apiClient.post<{
      deckId: string;
      deckName: string;
      cardTypeId: string | null;
      cardsImported: number;
    }>('/vocab-lab/decks/import', lexonData),
  exportDeck: (id: string) => apiClient.get<any>(`/vocab-lab/decks/${id}/export`),
  createFlashcardFromVocabulary: (payload: {
    bookName: string;
    word: {
      word: string;
      phonetic?: string;
      definition: string;
      example?: string;
      imageUrl?: string;
      audioUrl?: string;
    };
  }) => apiClient.post<Flashcard>('/vocab-lab/from-foundationVocabWord', payload),
  createFlashcardFromVocabularyWithReview: (payload: {
    bookName: string;
    word: {
      word: string;
      phonetic?: string;
      definition: string;
      example?: string;
      imageUrl?: string;
      audioUrl?: string;
    };
    rating: 1 | 2 | 3 | 4;
  }) => apiClient.post<Flashcard>('/vocab-lab/from-foundationVocabWord/with-review', payload),
};

// ==================== SHADOWING ====================
export const shadowingApi = {
  getLessons: () => apiClient.get<ShadowingVideo[]>('/shadowing/lessons'),
  getLessonById: (id: string) => apiClient.get<ShadowingVideo>(`/shadowing/lessons/${id}`),
  getVideos: () => apiClient.get<ShadowingVideo[]>('/shadowing/videos'),
  getVideoById: (id: string) => apiClient.get<ShadowingVideo>(`/shadowing/videos/${id}`),
  createVideo: (dto: {
    title: string;
    youtubeVideoId: string;
    folder?: string;
    category?: string;
    duration: string;
    sentences: ShadowingSentence[];
  }) => apiClient.post<ShadowingVideo>('/shadowing/videos', dto),
  importVideo: (dto: { youtubeUrl: string; title: string; folder?: string }) =>
    apiClient.post<ShadowingVideo>('/shadowing/videos/import', dto),
  deleteVideo: (id: string) => apiClient.delete<void>(`/shadowing/videos/${id}`),
  getFolders: () => apiClient.get<string[]>('/shadowing/folders'),
  createFolder: (name: string) => apiClient.post<void>('/shadowing/folders', { name }),
  getAllProgress: () =>
    apiClient.get<Record<string, { shadowing: number[]; dictation: number[] }>>(
      '/shadowing/progress',
    ),
  getProgress: (lessonId: string) =>
    apiClient.get<ShadowingProgress>(`/shadowing/progress/${encodeURIComponent(lessonId)}`),
  upsertProgress: (dto: ShadowingProgress) => apiClient.post<void>('/shadowing/progress', dto),
  renameFolder: (name: string, newName: string) =>
    apiClient.patch<void>(`/shadowing/folders/${encodeURIComponent(name)}`, { newName }),
  deleteFolder: (name: string) =>
    apiClient.delete<void>(`/shadowing/folders/${encodeURIComponent(name)}`),
  updateVideo: (id: string, dto: {
    title?: string;
    folder?: string;
    category?: string;
  }) => apiClient.patch<ShadowingVideo>(`/shadowing/videos/${id}`, dto),
};

// ==================== DICTATION ====================
export const dictationApi = {
  getLessons: () => apiClient.get<DictationVideo[]>('/dictation/lessons'),
  getLessonById: (id: string) => apiClient.get<DictationVideo>(`/dictation/lessons/${id}`),
  getVideos: () => apiClient.get<DictationVideo[]>('/dictation/videos'),
  getVideoById: (id: string) => apiClient.get<DictationVideo>(`/dictation/videos/${id}`),
  createVideo: (dto: {
    title: string;
    youtubeVideoId: string;
    folder?: string;
    category?: string;
    duration: string;
    sentences: any[];
  }) => apiClient.post<DictationVideo>('/dictation/videos', dto),
  importVideo: (dto: { youtubeUrl: string; title: string; folder?: string }) =>
    apiClient.post<DictationVideo>('/dictation/videos/import', dto),
  deleteVideo: (id: string) => apiClient.delete<void>(`/dictation/videos/${id}`),
  getFolders: () => apiClient.get<string[]>('/dictation/folders'),
  createFolder: (name: string) => apiClient.post<void>('/dictation/folders', { name }),
  getAllProgress: () =>
    apiClient.get<Record<string, { completedSentences: number[]; difficulty?: string }>>(
      '/dictation/progress',
    ),
  getProgress: (lessonId: string) =>
    apiClient.get<any>(`/dictation/progress/${encodeURIComponent(lessonId)}`),
  upsertProgress: (dto: {
    lessonId: string;
    completedSentences: number[];
    difficulty?: string;
    lessonTitle?: string;
    totalSentences?: number;
  }) => apiClient.post<void>('/dictation/progress', dto),
  renameFolder: (name: string, newName: string) =>
    apiClient.patch<void>(`/dictation/folders/${encodeURIComponent(name)}`, { newName }),
  deleteFolder: (name: string) =>
    apiClient.delete<void>(`/dictation/folders/${encodeURIComponent(name)}`),
  updateVideo: (id: string, dto: {
    title?: string;
    folder?: string;
    category?: string;
  }) => apiClient.patch<DictationVideo>(`/dictation/videos/${id}`, dto),
};


// ==================== IELTS BASIC LESSONS ====================
export const ieltsBasicApi = {
  getSkills: () => apiClient.get<IeltsSkill[]>('/ielts/skills'),
  getSkillLessons: (skillId: string) =>
    apiClient.get<IeltsLesson[]>(`/ielts/skills/${skillId}/lessons`),
  getLessonDetail: (lessonId: string) => apiClient.get<IeltsLesson>(`/ielts/lessons/${lessonId}`),
  markLessonComplete: (lessonId: string) =>
    apiClient.post<void>(`/ielts/lessons/${lessonId}/complete`, {}),
  getListeningExercises: (lessonId?: string) =>
    apiClient.get<IeltsExercise[]>(
      `/ielts/listening-exercises${lessonId ? `?lessonId=${lessonId}` : ''}`,
    ),
  getReadingExercises: (lessonId?: string) =>
    apiClient.get<IeltsExercise[]>(
      `/ielts/reading-exercises${lessonId ? `?lessonId=${lessonId}` : ''}`,
    ),
  getUserProgress: () => apiClient.get<any[]>('/ielts/progress'),
};

// ==================== SUBSCRIPTIONS ====================
export interface PricingPlan {
  id: string;
  tier: 'FREE' | 'PREMIUM' | 'PRO';
  name: string;
  description: string;
  priceAmount: number; // in cents, e.g. 999 = $9.99
  currency: string;
  interval: 'month' | 'year';
  intervalCount: number;
  features: string[];
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutResponse {
  redirectUrl?: string;
  subscription?: any;
  message?: string;
}

export const subscriptionsApi = {
  /** GET /subscriptions/plans — returns paid plans from backend */
  getPlans: (): Promise<PricingPlan[]> => apiClient.get<PricingPlan[]>('/subscriptions/plans'),

  /** GET /subscriptions/me — current user's subscription info */
  getMySubscription: (): Promise<any> => apiClient.get<any>('/subscriptions/me'),

  /** POST /subscriptions/start-trial */
  startTrial: (): Promise<CheckoutResponse> =>
    apiClient.post<CheckoutResponse>('/subscriptions/start-trial', {}),

  /** POST /subscriptions/checkout — create checkout session */
  checkout: (planId: string): Promise<CheckoutResponse> =>
    apiClient.post<CheckoutResponse>('/subscriptions/checkout', { planId }),

  verifyCheckout: (
    sessionId: string,
    vnpParams?: Record<string, string>,
  ): Promise<CheckoutResponse> =>
    apiClient.post<CheckoutResponse>('/subscriptions/checkout/verify', { sessionId, vnpParams }),

  cancel: (reason?: string): Promise<any> =>
    apiClient.post<any>('/subscriptions/cancel', { reason }),
};

// ==================== GAMIFICATION ====================
export const gamificationApi = {
  getProfile: () => apiClient.get<GamificationProfile>('/gamification/profile'),
  getAchievements: () => apiClient.get<AchievementItem[]>('/gamification/achievements'),
};

// ==================== NOTIFICATIONS ====================
export const notificationsApi = {
  getNotifications: (page: number = 1, limit: number = 20) =>
    apiClient.get<any>(`/notifications?page=${page}&limit=${limit}`),
  getUnreadCount: () => apiClient.get<{ count: number }>('/notifications/unread-count'),
  markAllAsRead: () => apiClient.patch<void>('/notifications/read-all', {}),
  markAsRead: (id: string) => apiClient.patch<void>(`/notifications/${id}/read`, {}),
  deleteNotification: (id: string) => apiClient.delete<void>(`/notifications/${id}`),
  createTestNotification: () => apiClient.post<any>('/notifications/test', {}),
  addPushToken: (token: string, platform: string) =>
    apiClient.post<any>('/users/me/push-token', { token, platform }),
  removePushToken: (token: string) =>
    apiClient.deleteWithBody<any>('/users/me/push-token', { token }),
};
