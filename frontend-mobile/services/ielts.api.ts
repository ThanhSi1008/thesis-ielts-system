import { apiClient } from './api-client';

// ==================== IELTS PROFILE ====================
export const ieltsProfileApi = {
  get: () => apiClient.get<any>('/ielts/profile'),
  create: (data: any) => apiClient.post<any>('/ielts/profile', data),
  update: (data: any) => apiClient.patch<any>('/ielts/profile', data),
  onboarding: (data: any) => apiClient.post<any>('/ielts/onboarding', data),
  getStreak: () => apiClient.get<{ currentStreak: number; longestStreak: number }>('/ielts/streak'),
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
};

// ==================== IELTS EXAMS (Mock Tests) ====================
export const ieltsExamsApi = {
  getHistory: () => apiClient.get<any[]>('/exams/history'),
  getIntensiveCatalog: (skill: string) =>
    apiClient.get<any>(`/exams/intensive/catalog?skill=${skill}`),
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

