import { apiClient } from './api-client';
import { 
  Deck, Flashcard, CardType, VocabStats, 
  ShadowingVideo, ShadowingProgress, ShadowingSentence,
  IeltsSkill, IeltsLesson, IeltsExercise
} from '@/types';

// ==================== VOCAB LAB ====================
export const vocabLabApi = {
  getDecks: () => apiClient.get<Deck[]>('/vocab-lab/decks'),
  getDeckDetail: (id: string) => apiClient.get<Deck>(`/vocab-lab/decks/${id}`),
  createDeck: (name: string) => apiClient.post<Deck>('/vocab-lab/decks', { name }),
  deleteDeck: (id: string) => apiClient.delete<void>(`/vocab-lab/decks/${id}`),
  getStudyCards: (deckId: string) => apiClient.get<Flashcard[]>(`/vocab-lab/study/${deckId}`),
  submitReview: (payload: { flashcardId: string; rating: number }) =>
    apiClient.post<void>('/vocab-lab/review', payload),
  getStats: () => apiClient.get<VocabStats>('/vocab-lab/stats'),
  getCardTypes: () => apiClient.get<CardType[]>('/vocab-lab/card-types'),
  createFlashcard: (payload: { deckId: string; front: string; back: string; cardTypeId?: string; fieldValues?: Record<string, string>; fieldStyles?: Record<string, any>; tags?: string[] }) =>
    apiClient.post<Flashcard>('/vocab-lab/cards', payload),
  updateFlashcard: (id: string, payload: { front?: string; back?: string }) =>
    apiClient.put<Flashcard>(`/vocab-lab/cards/${id}`, payload),
  deleteFlashcard: (id: string) => apiClient.delete<void>(`/vocab-lab/cards/${id}`),
  browseCards: (deckId?: string) =>
    apiClient.get<Flashcard[]>(`/vocab-lab/cards${deckId ? `?deckId=${deckId}` : ''}`),
  uploadMedia: async (uri: string, mimeType: string, fileName: string): Promise<{ url: string }> => {
    const formData = new FormData();
    // @ts-ignore - FormData in React Native accepts an object for file uploads
    formData.append('file', { uri, name: fileName, type: mimeType });
    return apiClient.postForm<{ url: string }>('/vocab-lab/media/upload', formData);
  },
};

// ==================== SHADOWING ====================
export const shadowingApi = {
  getVideos: () => apiClient.get<ShadowingVideo[]>('/shadowing/videos'),
  getVideoById: (id: string) => apiClient.get<ShadowingVideo>(`/shadowing/videos/${id}`),
  createVideo: (dto: { title: string; youtubeVideoId: string; folder?: string; category?: string; duration: string; sentences: ShadowingSentence[] }) =>
    apiClient.post<ShadowingVideo>('/shadowing/videos', dto),
  deleteVideo: (id: string) => apiClient.delete<void>(`/shadowing/videos/${id}`),
  getFolders: () => apiClient.get<string[]>('/shadowing/folders'),
  getAllProgress: () => apiClient.get<Record<string, { shadowing: number[]; dictation: number[] }>>('/shadowing/progress'),
  getProgress: (lessonId: string) => apiClient.get<ShadowingProgress>(`/shadowing/progress/${encodeURIComponent(lessonId)}`),
  upsertProgress: (dto: ShadowingProgress) =>
    apiClient.post<void>('/shadowing/progress', dto),
};

// ==================== IELTS BASIC LESSONS ====================
export const ieltsBasicApi = {
  getSkills: () => apiClient.get<IeltsSkill[]>('/ielts/skills'),
  getSkillLessons: (skillId: string) => apiClient.get<IeltsLesson[]>(`/ielts/skills/${skillId}/lessons`),
  getLessonDetail: (lessonId: string) => apiClient.get<IeltsLesson>(`/ielts/lessons/${lessonId}`),
  markLessonComplete: (lessonId: string) => apiClient.post<void>(`/ielts/lessons/${lessonId}/complete`, {}),
  getListeningExercises: (lessonId?: string) =>
    apiClient.get<IeltsExercise[]>(`/ielts/listening-exercises${lessonId ? `?lessonId=${lessonId}` : ''}`),
  getReadingExercises: (lessonId?: string) =>
    apiClient.get<IeltsExercise[]>(`/ielts/reading-exercises${lessonId ? `?lessonId=${lessonId}` : ''}`),
  getUserProgress: () => apiClient.get<any[]>('/ielts/progress'),
};

