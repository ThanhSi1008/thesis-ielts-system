import { apiClient } from './api-client';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface QuestionNote {
  id: string;
  userId: string;
  examId: string;
  questionNumber: number;
  noteText: string;
  createdAt: string;
  updatedAt: string;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const notesApi = {
  /** Fetch all notes for a specific exam by the current user */
  getExamNotes: (userId: string, examId: string): Promise<QuestionNote[]> =>
    apiClient.get<QuestionNote[]>(
      `/notes?userId=${encodeURIComponent(userId)}&examId=${encodeURIComponent(examId)}`,
    ),

  /** Create or update (upsert) a note for a specific question */
  upsertNote: (
    userId: string,
    examId: string,
    questionNumber: number,
    noteText: string,
  ): Promise<QuestionNote> =>
    apiClient.put<QuestionNote>('/notes', { userId, examId, questionNumber, noteText }),

  /** Delete a note by its ID */
  deleteNote: (id: string): Promise<void> =>
    apiClient.delete<void>(`/notes/${encodeURIComponent(id)}`),
};
