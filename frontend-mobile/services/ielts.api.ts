import { apiClient } from './api-client';
import { clientCache } from './cache';
import {
  IeltsOverviewStats,
  IeltsFoundationStats,
  IeltsBasicStats,
  IeltsAdvancedStats,
  IeltsIntensiveStats,
  CommunityWritingAnswer,
  CommunitySpeakingAnswer,
} from '../types';

// ==================== IELTS PROFILE ====================
export const ieltsProfileApi = {
  get: () => apiClient.get<any>('/ielts/profile'),
  create: (data: any) => apiClient.post<any>('/ielts/profile', data),
  update: (data: any) => apiClient.patch<any>('/ielts/profile', data),
  onboarding: (data: any) => apiClient.post<any>('/ielts/onboarding', data),
  getStreak: () => apiClient.get<{ currentStreak: number; longestStreak: number }>('/ielts/streak'),
  getPlacementExercises: () =>
    apiClient.get<{ listening: any; reading: any; writing: any }>('/ielts/placement-exercises'),
  getRecentActivity: () => apiClient.get<any>('/users/me/recent-activity'),
  getRecommended: () => apiClient.get<any[]>('/users/me/recommended'),
};

// ==================== IELTS ADVANCED ====================
export const ieltsAdvancedApi = {
  getListeningParts: (questionType?: string) =>
    apiClient.get<any[]>(
      questionType
        ? `/ielts/advanced/listening?questionType=${encodeURIComponent(questionType)}`
        : '/ielts/advanced/listening',
    ),
  getListeningPart: (id: string) => apiClient.get<any>(`/ielts/advanced/listening/${id}`),
  submitListening: (id: string, answers: Record<string, string>) =>
    apiClient.post<any>(`/ielts/advanced/listening/${id}/submit`, { answers }),
  getListeningHistory: () => apiClient.get<any[]>('/ielts/advanced/history'),
  getListeningHistoryByPart: (partId: string) =>
    apiClient.get<any[]>(`/ielts/advanced/history?partId=${encodeURIComponent(partId)}`),
  getListeningHistoryDetail: (sessionId: string) =>
    apiClient.get<any>(`/ielts/advanced/history/${sessionId}`),

  getReadingParts: (questionType?: string) =>
    apiClient.get<any[]>(
      questionType
        ? `/ielts/advanced/reading?questionType=${encodeURIComponent(questionType)}`
        : '/ielts/advanced/reading',
    ),
  getReadingPart: (id: string) => apiClient.get<any>(`/ielts/advanced/reading/${id}`),
  submitReading: (id: string, answers: Record<string, string>) =>
    apiClient.post<any>(`/ielts/advanced/reading/${id}/submit`, { answers }),
  getReadingHistory: () => apiClient.get<any[]>('/ielts/advanced/reading/history'),
  getReadingHistoryByPart: (partId: string) =>
    apiClient.get<any[]>(`/ielts/advanced/reading/history?partId=${encodeURIComponent(partId)}`),
  getReadingHistoryDetail: (sessionId: string) =>
    apiClient.get<any>(`/ielts/advanced/reading/history/${sessionId}`),
  getStatistics: () =>
    apiClient.get<Record<string, { correct: number; total: number; attempted: number }>>(
      '/ielts/advanced/statistics',
    ),

  // --- IELTS Advanced Writing ---
  getWritingPrompts: (params?: {
    taskType?: 'TASK1' | 'TASK2';
    subType?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) => {
    const q = new URLSearchParams();
    if (params?.taskType) q.set('taskType', params.taskType);
    if (params?.subType) q.set('subType', params.subType);
    if (params?.category) q.set('category', params.category);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString();
    return apiClient.get<any>(`/ielts/advanced/writing/prompts${qs ? `?${qs}` : ''}`);
  },
  getWritingPrompt: (id: string) => apiClient.get<any>(`/ielts/advanced/writing/prompts/${id}`),
  getWritingSessionsByPrompt: (promptId: string) =>
    apiClient.get<any[]>(`/ielts/advanced/writing/prompts/${promptId}/sessions`),
  createWritingSession: (promptId: string) =>
    apiClient.post<any>('/ielts/advanced/writing/sessions', { promptId }),
  saveWritingDraft: (sessionId: string, draftEssay: string) =>
    apiClient.patch<any>(`/ielts/advanced/writing/sessions/${sessionId}/draft`, { draftEssay }),
  submitWritingSession: (sessionId: string, payload: { essay: string; timeTaken?: number }) =>
    apiClient.post<any>(`/ielts/advanced/writing/sessions/${sessionId}/submit`, payload),
  getWritingSession: (sessionId: string) =>
    apiClient.get<any>(`/ielts/advanced/writing/sessions/${sessionId}`),
  getWritingHistory: () => apiClient.get<any[]>('/ielts/advanced/writing/history'),

  // --- IELTS Advanced Speaking ---
  getSpeakingParts: (params?: {
    partNumber?: 1 | 2 | 3;
    category?: string;
    topic?: string;
    page?: number;
    limit?: number;
  }) => {
    const q = new URLSearchParams();
    if (params?.partNumber) q.set('partNumber', String(params.partNumber));
    if (params?.category) q.set('category', params.category);
    if (params?.topic) q.set('topic', params.topic);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString();
    return apiClient.get<any>(`/ielts/advanced/speaking/parts${qs ? `?${qs}` : ''}`);
  },
  getSpeakingPart: (id: string) => apiClient.get<any>(`/ielts/advanced/speaking/parts/${id}`),
  getSpeakingSessionsByPart: (partId: string) =>
    apiClient.get<any[]>(`/ielts/advanced/speaking/parts/${partId}/sessions`),
  createSpeakingSession: (partId: string) =>
    apiClient.post<any>('/ielts/advanced/speaking/sessions', { partId }),
  submitSpeakingSession: (
    sessionId: string,
    payload: { audioAnswers: Record<string, string>; timeTaken?: number },
  ) => apiClient.post<any>(`/ielts/advanced/speaking/sessions/${sessionId}/submit`, payload),
  getSpeakingSession: (sessionId: string) =>
    apiClient.get<any>(`/ielts/advanced/speaking/sessions/${sessionId}`),
  getSpeakingHistory: () => apiClient.get<any[]>('/ielts/advanced/speaking/history'),
  getSpeakingStats: () => apiClient.get<any>('/ielts/advanced/speaking/stats'),

  // --- Community Answers ---
  getCommunityWritingAnswers: (
    promptId: string,
    params?: { page?: number; limit?: number; sortBy?: 'band' | 'date' },
  ) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.sortBy) q.set('sortBy', params.sortBy);
    const qs = q.toString();
    return apiClient.get<{ data: CommunityWritingAnswer[]; total: number }>(
      `/ielts/advanced/writing/prompts/${promptId}/community${qs ? `?${qs}` : ''}`,
    );
  },
  getCommunityWritingAnswer: (promptId: string, sessionId: string) =>
    apiClient.get<CommunityWritingAnswer>(
      `/ielts/advanced/writing/prompts/${promptId}/community/${sessionId}`,
    ),

  getCommunitySpeakingAnswers: (
    partId: string,
    params?: { page?: number; limit?: number; sortBy?: 'band' | 'date' },
  ) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.sortBy) q.set('sortBy', params.sortBy);
    const qs = q.toString();
    return apiClient.get<{ data: CommunitySpeakingAnswer[]; total: number }>(
      `/ielts/advanced/speaking/parts/${partId}/community${qs ? `?${qs}` : ''}`,
    );
  },
  getCommunitySpeakingAnswer: (partId: string, sessionId: string) =>
    apiClient.get<CommunitySpeakingAnswer>(
      `/ielts/advanced/speaking/parts/${partId}/community/${sessionId}`,
    ),
};

// ==================== IELTS EXAMS (Mock Tests) ====================
export const ieltsExamsApi = {
  getHistory: () => apiClient.get<any[]>('/exams/history'),
  getIntensiveCatalog: async (skill: string, bypassCache = false): Promise<any> => {
    const cacheKey = `intensive_catalog_${skill}`;
    if (!bypassCache) {
      const cached = await clientCache.get<any>(cacheKey);
      if (cached) return cached;
    }
    const data = await apiClient.get<any>(`/exams/intensive/catalog?skill=${skill}`);
    await clientCache.set(cacheKey, data);
    return data;
  },
  getExam: (id: string) => apiClient.get<any>(`/exams/${id}`),
  createSession: (examId: string, userId: string, practicePart?: number) =>
    apiClient.post<any>(`/exams/${examId}/sessions`, { userId, practicePart }),
  getSession: (sessionId: string) => apiClient.get<any>(`/exams/sessions/${sessionId}`),
  submitSession: (sessionId: string, answers: Record<string, any>, timeTaken?: number) =>
    apiClient.post<any>(`/exams/sessions/${sessionId}/submit`, { answers, timeTaken }),
  saveProgress: (sessionId: string, answers: Record<string, any>, timeTaken?: number) =>
    apiClient.patch<any>(`/exams/sessions/${sessionId}/progress`, { answers, timeTaken }),
  deleteSession: (sessionId: string) => apiClient.delete<any>(`/exams/sessions/${sessionId}`),
  uploadSpeakingAudio: (formData: FormData): Promise<{ url: string }> =>
    apiClient.postForm<{ url: string }>('/exams/audio/upload', formData),
};

// ==================== STUDENT/TEACHER ====================
export const studentTeacherApi = {
  getMyTeachers: () => apiClient.get<any[]>('/users/my-teachers'),
  getMyStudents: () => apiClient.get<any[]>('/users/my-students'),
  linkTeacher: (teacherId: string) => apiClient.post<any>('/users/link-teacher', { teacherId }),
  unlinkTeacher: (teacherId: string) => apiClient.delete<any>(`/users/unlink-teacher/${teacherId}`),
  getStudentStats: (studentId: string) => apiClient.get<any>(`/users/student/${studentId}/stats`),
};

// ==================== IELTS STATISTICS ====================
export const ieltsStatisticsApi = {
  getOverview: () => apiClient.get<IeltsOverviewStats>('/ielts-statistics/overview'),
  getFoundation: () => apiClient.get<IeltsFoundationStats>('/ielts-statistics/foundation'),
  getBasic: () => apiClient.get<IeltsBasicStats>('/ielts-statistics/basic'),
  getAdvanced: () => apiClient.get<IeltsAdvancedStats>('/ielts-statistics/advanced'),
  getIntensive: () => apiClient.get<IeltsIntensiveStats>('/ielts-statistics/intensive'),
};

import { vocabularyApi as newVocabularyApi, grammarApi as newGrammarApi } from './learning.api';

// ==================== VOCABULARY ====================
/**
 * @deprecated Use vocabularyApi from @/services instead
 */
export const vocabularyApi = newVocabularyApi;

// ==================== GRAMMAR ====================
/**
 * @deprecated Use grammarApi from @/services instead
 */
export const grammarApi = newGrammarApi;
