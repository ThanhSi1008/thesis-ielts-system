import api from '@/lib/api';
import type { 
  VocabularyBook, 
  VocabularyBookWithUnits, 
  VocabularyUnitWithContent,
  GrammarBook,
  GrammarBookWithUnits,
  GrammarUnitWithContent,
  PronunciationData,
  PronunciationSound
} from '@/types';

// ============================================================
// VOCABULARY API
// ============================================================

export const vocabularyApi = {
  getBooks: async () => {
    const { data } = await api.get<VocabularyBook[]>('/vocabulary/books');
    return data;
  },
  getBook: async (id: string) => {
    const { data } = await api.get<VocabularyBookWithUnits>(`/vocabulary/books/${id}`);
    return data;
  },
  getUnit: async (id: string) => {
    const { data } = await api.get<VocabularyUnitWithContent>(`/vocabulary/units/${id}`);
    return data;
  },
};

// ============================================================
// GRAMMAR API
// ============================================================

export const grammarApi = {
  getBooks: async () => {
    const { data } = await api.get<GrammarBook[]>('/grammar/books');
    return data;
  },
  getBook: async (slug: string) => {
    const { data } = await api.get<GrammarBookWithUnits>(`/grammar/books/${slug}`);
    return data;
  },
  getUnit: async (id: string) => {
    const { data } = await api.get<GrammarUnitWithContent>(`/grammar/units/${id}`);
    return data;
  },
};

// ============================================================
// PRONUNCIATION API
// ============================================================

export const pronunciationApi = {
  getAllSounds: async () => {
    const { data } = await api.get<PronunciationData>('/pronunciation/sounds');
    return data;
  },
  getSound: async (symbol: string) => {
    const { data } = await api.get<PronunciationSound>(`/pronunciation/sounds/${encodeURIComponent(symbol)}`);
    return data;
  },
};
