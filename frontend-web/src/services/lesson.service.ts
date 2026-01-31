import api from '@/lib/api';
import type { Lesson, VocabularyWord, GrammarRule } from '@/types';

export const lessonService = {
  /**
   * Get all published lessons
   */
  async getLessons(): Promise<Lesson[]> {
    const { data } = await api.get<Lesson[]>('/learning/lessons');
    return data;
  },

  /**
   * Get single lesson by ID with vocabulary and grammar
   */
  async getLesson(id: string): Promise<Lesson> {
    const { data } = await api.get<Lesson>(`/learning/lessons/${id}`);
    return data;
  },

  /**
   * Get vocabulary for a specific lesson
   */
  async getVocabulary(lessonId: string): Promise<VocabularyWord[]> {
    const { data } = await api.get<VocabularyWord[]>(`/learning/vocabulary/${lessonId}`);
    return data;
  },

  /**
   * Get grammar rules for a specific lesson
   */
  async getGrammar(lessonId: string): Promise<GrammarRule[]> {
    const { data } = await api.get<GrammarRule[]>(`/learning/grammar/${lessonId}`);
    return data;
  },
};
