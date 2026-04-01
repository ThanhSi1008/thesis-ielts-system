import api from '@/lib/api';
import type { Deck, DeckWithCounts, Flashcard, SubmitReviewRequest, StudyCard, VocabLabStats, NoteType, NoteTypeField, CardTemplate, FieldStyle, CardStyle } from '@/types';

export interface CreateNoteTypeFieldPayload {
  name: string;
  description?: string;
  fieldType?: 'text' | 'media';
}

export interface UpdateNoteTypeFieldPayload {
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
    noteTypeId?: string;
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

  // ==================== NOTE TYPE OPERATIONS ====================
  getNoteTypes: async () => {
    const { data } = await api.get<NoteType[]>('/vocab-lab/note-types');
    return data;
  },
  createNoteType: async (name: string) => {
    const { data } = await api.post<NoteType>('/vocab-lab/note-types', { name });
    return data;
  },
  renameNoteType: async (id: string, name: string) => {
    const { data } = await api.patch<NoteType>(`/vocab-lab/note-types/${id}`, { name });
    return data;
  },
  deleteNoteType: async (id: string) => {
    const { data } = await api.delete(`/vocab-lab/note-types/${id}`);
    return data;
  },

  // ==================== FIELD OPERATIONS ====================
  addField: async (noteTypeId: string, payload: CreateNoteTypeFieldPayload) => {
    const { data } = await api.post<NoteTypeField>(`/vocab-lab/note-types/${noteTypeId}/fields`, payload);
    return data;
  },
  updateField: async (noteTypeId: string, fieldId: string, payload: UpdateNoteTypeFieldPayload) => {
    const { data } = await api.patch<NoteTypeField>(`/vocab-lab/note-types/${noteTypeId}/fields/${fieldId}`, payload);
    return data;
  },
  deleteField: async (noteTypeId: string, fieldId: string) => {
    const { data } = await api.delete(`/vocab-lab/note-types/${noteTypeId}/fields/${fieldId}`);
    return data;
  },

  // ==================== TEMPLATE OPERATIONS ====================
  getTemplates: async (noteTypeId: string) => {
    const { data } = await api.get<CardTemplate[]>(`/vocab-lab/note-types/${noteTypeId}/templates`);
    return data;
  },
  updateTemplate: async (noteTypeId: string, templateId: string, payload: {
    name?: string;
    frontFields?: string[];
    backFields?: string[];
    fieldStyles?: Record<string, FieldStyle>;
    cardStyle?: CardStyle;
  }) => {
    const { data } = await api.patch<CardTemplate>(`/vocab-lab/note-types/${noteTypeId}/templates/${templateId}`, payload);
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
