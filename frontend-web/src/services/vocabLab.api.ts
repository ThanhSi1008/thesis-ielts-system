import api from '@/lib/api';
import type { Deck, DeckWithCounts, Flashcard, SubmitReviewRequest, StudyCard, VocabLabStats, CardType, CardTypeField, CardTemplate, FieldStyle, CardStyle } from '@/types';

export interface CreateCardTypeFieldPayload {
  name: string;
  description?: string;
  fieldType?: 'text' | 'media';
}

export interface UpdateCardTypeFieldPayload {
  name?: string;
  order?: number;
  description?: string;
  fieldType?: 'text' | 'media';
}

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
  createFlashcard: async (payload: {
    deckId: string;
    front?: string;
    back?: string;
    tags?: string[];
    cardTypeId?: string;
    fieldValues?: Record<string, string>;
    fieldStyles?: Record<string, FieldStyle>;
    cardStyle?: CardStyle;
  }) => {
    const { data } = await api.post<Flashcard>('/vocab-lab/cards', payload);
    return data;
  },
  updateFlashcard: async (id: string, payload: {
    deckId?: string; front?: string; back?: string; tags?: string[];
    fieldValues?: Record<string, string>;
    fieldStyles?: Record<string, FieldStyle>;
    cardStyle?: CardStyle;
  }) => {
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
  createFlashcardFromVocabulary: async (payload: { bookName: string; word: any }) => {
    const { data } = await api.post<Flashcard>('/vocab-lab/from-vocabulary', payload);
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

  // ==================== CARD TYPE OPERATIONS ====================
  getCardTypes: async () => {
    const { data } = await api.get<CardType[]>('/vocab-lab/card-types');
    return data;
  },
  createCardType: async (name: string) => {
    const { data } = await api.post<CardType>('/vocab-lab/card-types', { name });
    return data;
  },
  renameCardType: async (id: string, name: string) => {
    const { data } = await api.patch<CardType>(`/vocab-lab/card-types/${id}`, { name });
    return data;
  },
  deleteCardType: async (id: string) => {
    const { data } = await api.delete(`/vocab-lab/card-types/${id}`);
    return data;
  },
  updateCardTypeDescription: async (id: string, description: string | null) => {
    const { data } = await api.patch<CardType>(`/vocab-lab/card-types/${id}/description`, { description });
    return data;
  },

  // ==================== FIELD OPERATIONS ====================
  addField: async (cardTypeId: string, payload: CreateCardTypeFieldPayload) => {
    const { data } = await api.post<CardTypeField>(`/vocab-lab/card-types/${cardTypeId}/fields`, payload);
    return data;
  },
  updateField: async (cardTypeId: string, fieldId: string, payload: UpdateCardTypeFieldPayload) => {
    const { data } = await api.patch<CardTypeField>(`/vocab-lab/card-types/${cardTypeId}/fields/${fieldId}`, payload);
    return data;
  },
  deleteField: async (cardTypeId: string, fieldId: string) => {
    const { data } = await api.delete(`/vocab-lab/card-types/${cardTypeId}/fields/${fieldId}`);
    return data;
  },

  // ==================== TEMPLATE OPERATIONS ====================
  getTemplates: async (cardTypeId: string) => {
    const { data } = await api.get<CardTemplate[]>(`/vocab-lab/card-types/${cardTypeId}/templates`);
    return data;
  },
  updateTemplate: async (cardTypeId: string, templateId: string, payload: {
    name?: string;
    frontFields?: string[];
    backFields?: string[];
    fieldStyles?: Record<string, FieldStyle>;
    cardStyle?: CardStyle;
  }) => {
    const { data } = await api.patch<CardTemplate>(`/vocab-lab/card-types/${cardTypeId}/templates/${templateId}`, payload);
    return data;
  },

  // ==================== MEDIA UPLOAD ====================
  uploadMedia: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file, file.name);
    const { data } = await api.post<{ url: string }>('/vocab-lab/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
