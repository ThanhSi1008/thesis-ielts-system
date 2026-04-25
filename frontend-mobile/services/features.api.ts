import { apiClient } from './api-client';

// ==================== VOCAB LAB ====================
export const vocabLabApi = {
  getDecks: () => apiClient.get<any[]>('/vocab-lab/decks'),
  getDeckDetail: (id: string) => apiClient.get<any>(`/vocab-lab/decks/${id}`),
  createDeck: (name: string) => apiClient.post<any>('/vocab-lab/decks', { name }),
  deleteDeck: (id: string) => apiClient.delete<any>(`/vocab-lab/decks/${id}`),
  getStudyCards: (deckId: string) => apiClient.get<any[]>(`/vocab-lab/study/${deckId}`),
  submitReview: (payload: { flashcardId: string; rating: number }) =>
    apiClient.post<any>('/vocab-lab/review', payload),
  getStats: () => apiClient.get<any>('/vocab-lab/stats'),
  getCardTypes: () => apiClient.get<any[]>('/vocab-lab/card-types'),
  createFlashcard: (payload: { deckId: string; front: string; back: string; cardTypeId?: string; fieldValues?: Record<string, string>; fieldStyles?: Record<string, any>; tags?: string[] }) =>
    apiClient.post<any>('/vocab-lab/cards', payload),
  updateFlashcard: (id: string, payload: { front?: string; back?: string }) =>
    apiClient.put<any>(`/vocab-lab/cards/${id}`, payload),
  deleteFlashcard: (id: string) => apiClient.delete<any>(`/vocab-lab/cards/${id}`),
  browseCards: (deckId?: string) =>
    apiClient.get<any[]>(`/vocab-lab/cards${deckId ? `?deckId=${deckId}` : ''}`),
  uploadMedia: async (uri: string, mimeType: string, fileName: string): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', { uri, name: fileName, type: mimeType } as any);
    return apiClient.post<any>('/vocab-lab/media/upload', formData);
  },
};

// ==================== SHADOWING ====================
export const shadowingApi = {
  getVideos: () => apiClient.get<any[]>('/shadowing/videos'),
  getVideoById: (id: string) => apiClient.get<any>(`/shadowing/videos/${id}`),
  createVideo: (dto: { title: string; youtubeVideoId: string; folder?: string; category?: string; duration: string; sentences: any[] }) =>
    apiClient.post<any>('/shadowing/videos', dto),
  deleteVideo: (id: string) => apiClient.delete<any>(`/shadowing/videos/${id}`),
  getFolders: () => apiClient.get<string[]>('/shadowing/folders'),
  getAllProgress: () => apiClient.get<Record<string, { shadowing: number[]; dictation: number[] }>>('/shadowing/progress'),
  getProgress: (lessonId: string) => apiClient.get<any>(`/shadowing/progress/${encodeURIComponent(lessonId)}`),
  upsertProgress: (dto: { lessonId: string; type: 'shadowing' | 'dictation'; completedSentences: number[]; dictationDifficulty?: string }) =>
    apiClient.post<any>('/shadowing/progress', dto),
};

// ==================== IELTS BASIC LESSONS ====================
export const ieltsBasicApi = {
  getSkills: () => apiClient.get<any[]>('/ielts/skills'),
  getSkillLessons: (skillId: string) => apiClient.get<any[]>(`/ielts/skills/${skillId}/lessons`),
  getLessonDetail: (lessonId: string) => apiClient.get<any>(`/ielts/lessons/${lessonId}`),
  markLessonComplete: (lessonId: string) => apiClient.post<any>(`/ielts/lessons/${lessonId}/complete`, {}),
  getListeningExercises: (lessonId?: string) =>
    apiClient.get<any[]>(`/ielts/listening-exercises${lessonId ? `?lessonId=${lessonId}` : ''}`),
  getReadingExercises: (lessonId?: string) =>
    apiClient.get<any[]>(`/ielts/reading-exercises${lessonId ? `?lessonId=${lessonId}` : ''}`),
  getUserProgress: () => apiClient.get<any[]>('/ielts/progress'),
};
