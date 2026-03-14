import api from '@/lib/api';
import type { Deck, DeckWithCounts, Flashcard, SubmitReviewRequest, StudyCard, VocabLabStats } from '@/types';

export const vocabLabApi = {
  // ==================== DECK OPERATIONS ====================
  getDecks: async () => {
    const { data } = await api.get<DeckWithCounts[]>('/vocab-lab/decks');
    return data;
  },
  getDeckDetail: async (id: string) => {
    const { data } = await api.get<DeckWithCounts>(`/vocab-lab/decks/${id}`);
    return data;
  },
  createDeck: async (name: string) => {
    const { data } = await api.post<Deck>('/vocab-lab/decks', { name });
    return data;
  },
  deleteDeck: async (id: string) => {
    const { data } = await api.delete(`/vocab-lab/decks/${id}`);
    return data;
  },

  // ==================== FLASHCARD OPERATIONS ====================
  createFlashcard: async (payload: { deckId: string; front: string; back: string; tags?: string[] }) => {
    const { data } = await api.post<Flashcard>('/vocab-lab/cards', payload);
    return data;
  },
  updateFlashcard: async (id: string, payload: { deckId?: string; front?: string; back?: string; tags?: string[] }) => {
    const { data } = await api.put<Flashcard>(`/vocab-lab/cards/${id}`, payload);
    return data;
  },
  deleteFlashcard: async (id: string) => {
    const { data } = await api.delete(`/vocab-lab/cards/${id}`);
    return data;
  },
  browseCards: async (params?: { deckId?: string; cardState?: string; tag?: string }) => {
    const { data } = await api.get<Flashcard[]>('/vocab-lab/cards', { params });
    return data;
  },

  // ==================== STUDY / REVIEW ====================
  getStudyCards: async (deckId: string) => {
    const { data } = await api.get<StudyCard[]>(`/vocab-lab/study/${deckId}`);
    return data;
  },
  submitReview: async (payload: SubmitReviewRequest) => {
    const { data } = await api.post<Flashcard>('/vocab-lab/review', payload);
    return data;
  },

  // ==================== STATS & TAGS ====================
  getStats: async () => {
    const { data } = await api.get<VocabLabStats>('/vocab-lab/stats');
    return data;
  },
  getTags: async () => {
    const { data } = await api.get<string[]>('/vocab-lab/tags');
    return data;
  },
};
