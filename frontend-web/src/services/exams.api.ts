import api from '@/lib/api';
import type { ExamDetail, ExamSessionDetail, IeltsIntensiveCatalogResponse, PracticeCatalogResponse, IeltsSkill } from '@/types';

export const examsApi = {
  getIntensiveCatalog: async (skill: IeltsSkill) => {
    const { data } = await api.get<IeltsIntensiveCatalogResponse>('/exams/intensive/catalog', {
      params: { skill },
    });
    return data;
  },
  getPracticeCatalog: async (skill: IeltsSkill) => {
    const { data } = await api.get<PracticeCatalogResponse>('/exams/intensive/practice-catalog', {
      params: { skill },
    });
    return data;
  },
  getHistory: async () => {
    const { data } = await api.get<any[]>('/exams/history');
    return data;
  },
  getExam: async (id: string) => {
    const { data } = await api.get<ExamDetail>(`/exams/${encodeURIComponent(id)}`);
    return data;
  },
  createSession: async (examId: string, userId: string, practicePart?: number) => {
    const { data } = await api.post<ExamSessionDetail>(`/exams/${encodeURIComponent(examId)}/sessions`, { userId, practicePart });
    return data;
  },
  getSession: async (sessionId: string) => {
    const { data } = await api.get<ExamSessionDetail & { exam: any; result: any }>(`/exams/sessions/${encodeURIComponent(sessionId)}`);
    return data;
  },
  submitSession: async (sessionId: string, answers: Record<string, string | number | string[]>, timeTaken?: number) => {
    const { data } = await api.post<ExamSessionDetail>(`/exams/sessions/${encodeURIComponent(sessionId)}/submit`, { answers, timeTaken });
    return data;
  },
  deleteSession: async (sessionId: string) => {
    const { data } = await api.delete(`/exams/sessions/${encodeURIComponent(sessionId)}`);
    return data;
  },
  saveSessionProgress: async (sessionId: string, answers: Record<string, any>, timeTaken?: number) => {
    const { data } = await api.patch<ExamSessionDetail>(`/exams/sessions/${encodeURIComponent(sessionId)}/progress`, { answers, timeTaken });
    return data;
  },
  uploadAudio: async (file: Blob, filename = 'audio.webm') => {
    const formData = new FormData();
    formData.append('audio', file, filename);
    const { data } = await api.post<{ url: string }>('/exams/audio/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
