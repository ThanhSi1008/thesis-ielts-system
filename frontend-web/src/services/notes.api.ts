import api from '@/lib/api';

export interface QuestionNote {
  id: string;
  userId: string;
  examId: string;
  questionNumber: number;
  noteText: string;
  createdAt: string;
  updatedAt: string;
}

export const notesApi = {
  getExamNotes: async (userId: string, examId: string): Promise<QuestionNote[]> => {
    const { data } = await api.get<QuestionNote[]>('/notes', { params: { userId, examId } });
    return data;
  },
  upsertNote: async (userId: string, examId: string, questionNumber: number, noteText: string): Promise<QuestionNote> => {
    const { data } = await api.put<QuestionNote>('/notes', { userId, examId, questionNumber, noteText });
    return data;
  },
  deleteNote: async (id: string): Promise<void> => {
    await api.delete(`/notes/${encodeURIComponent(id)}`);
  },
};
