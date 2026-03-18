import api from '@/lib/api';
import type { ExamDetail, ExamSessionDetail, IeltsIntensiveCatalogResponse, IeltsSkill } from '@/types';

export const examsApi = {
  getIntensiveCatalog: async (skill: IeltsSkill) => {
    const { data } = await api.get<IeltsIntensiveCatalogResponse>('/exams/intensive/catalog', {
      params: { skill },
    });
    return data;
  },
  getExam: async (id: string) => {
    const { data } = await api.get<ExamDetail>(`/exams/${encodeURIComponent(id)}`);
    return data;
  },
  createSession: async (examId: string, userId: string) => {
    const { data } = await api.post<ExamSessionDetail>(`/exams/${encodeURIComponent(examId)}/sessions`, { userId });
    return data;
  },
  submitSession: async (sessionId: string, answers: Record<string, string | number | string[]>) => {
    const { data } = await api.post<ExamSessionDetail>(`/exams/sessions/${encodeURIComponent(sessionId)}/submit`, { answers });
    return data;
  },
};

