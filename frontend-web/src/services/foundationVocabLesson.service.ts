import api from '@/lib/api';
import type { FoundationVocabLesson, FoundationVocabItem, GrammarRule } from '@/types';

export const lessonService = {
  /**
   * Get all published lessons
   */
  async getLessons(): Promise<FoundationVocabLesson[]> {
    const { data } = await api.get<FoundationVocabLesson[]>('/learning/lessons');
    return data;
  },

  /**
   * Get single foundationVocabLesson by ID with foundationVocabWord and grammar
   */
  async getLesson(id: string): Promise<FoundationVocabLesson> {
    const { data } = await api.get<FoundationVocabLesson>(`/learning/lessons/${id}`);
    return data;
  },

  /**
   * Get foundationVocabWord for a specific foundationVocabLesson
   */
  async getVocabulary(lessonId: string): Promise<FoundationVocabItem[]> {
    const { data } = await api.get<FoundationVocabItem[]>(`/learning/foundationVocabWord/${lessonId}`);
    return data;
  },

  /**
   * Get grammar rules for a specific foundationVocabLesson
   */
  async getGrammar(lessonId: string): Promise<GrammarRule[]> {
    const { data } = await api.get<GrammarRule[]>(`/learning/grammar/${lessonId}`);
    return data;
  },
};
