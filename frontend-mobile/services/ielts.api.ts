import { apiClient } from './api-client';

// ==================== IELTS PROFILE ====================
export const ieltsProfileApi = {
  get: () => apiClient.get<any>('/ielts/profile'),
  create: (data: any) => apiClient.post<any>('/ielts/profile', data),
  update: (data: any) => apiClient.patch<any>('/ielts/profile', data),
  getStreak: () => apiClient.get<{ currentStreak: number; longestStreak: number }>('/ielts/streak'),
};

// ==================== IELTS ADVANCED ====================
export const ieltsAdvancedApi = {
  getListeningParts: () => apiClient.get<any[]>('/ielts/advanced/listening'),
  getListeningPart: (id: string) => apiClient.get<any>(`/ielts/advanced/listening/${id}`),
  submitListening: (id: string, answers: Record<string, string>) =>
    apiClient.post<any>(`/ielts/advanced/listening/${id}/submit`, { answers }),
  getListeningHistory: () => apiClient.get<any[]>('/ielts/advanced/history'),
  getListeningHistoryDetail: (sessionId: string) =>
    apiClient.get<any>(`/ielts/advanced/history/${sessionId}`),

  getReadingParts: () => apiClient.get<any[]>('/ielts/advanced/reading'),
  getReadingPart: (id: string) => apiClient.get<any>(`/ielts/advanced/reading/${id}`),
  submitReading: (id: string, answers: Record<string, string>) =>
    apiClient.post<any>(`/ielts/advanced/reading/${id}/submit`, { answers }),
  getReadingHistory: () => apiClient.get<any[]>('/ielts/advanced/reading/history'),
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
};

// ==================== STUDENT/TEACHER ====================
export const studentTeacherApi = {
  getMyTeachers: () => apiClient.get<any[]>('/users/my-teachers'),
  getMyStudents: () => apiClient.get<any[]>('/users/my-students'),
  linkTeacher: (teacherId: string) => apiClient.post<any>('/users/link-teacher', { teacherId }),
  getStudentStats: (studentId: string) => apiClient.get<any>(`/users/student/${studentId}/stats`),
};
