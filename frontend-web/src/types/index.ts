/**
 * Centralized Type Definitions for Frontend Web
 */

// ==================== COMMON TYPES ====================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
}

// ==================== AUTH & USER ====================

export interface User {
  id: string;
  email: string;
  fullName?: string;
  firstName?: string; // Standardize names later
  lastName?: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  avatar?: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role?: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
}

export interface AuthResponse {
  access_token: string; // NestJS convention
  refresh_token?: string;
  user?: User;
}

// ==================== VOCABULARY ====================

export interface VocabularyBook {
  id: string;
  name: string;
  imageUrl: string;
  wordCount: number;
  _count?: { units: number };
}

export interface VocabularyUnit {
  id: string;
  title: string;
  order: number;
}

export interface VocabularyWord {
  id: string;
  word: string;
  meaning: string;
  ipa?: string;
  partOfSpeech?: string;
  example?: string;
  imageUrl?: string;
  audioUrl?: string;
  lessonId?: string; // From Lesson Service
  createdAt?: string;
  updatedAt?: string;
}

export interface VocabularyBookWithUnits extends VocabularyBook {
  units: VocabularyUnit[];
}

export interface VocabularyUnitWithContent extends VocabularyUnit {
  book: { id: string; name: string };
  words: VocabularyWord[];
  exercises: any[];
  questions: any[];
  storyTitle?: string;
  storyContent?: string;
  storyImageUrl?: string;
}

// ==================== GRAMMAR ====================

export interface GrammarBook {
  id: string;
  slug: string;
  name: string;
  author: string;
  level: string;
  imageUrl: string;
  color: string;
  unitCount: number;
  _count?: { units: number };
}

export interface GrammarUnit {
  id: string;
  title: string;
  order: number;
  theoryContent?: string;
}

export interface GrammarBookWithUnits extends GrammarBook {
  units: GrammarUnit[];
}

export interface GrammarUnitWithContent extends GrammarUnit {
  book: { id: string; slug: string; name: string };
  exercises: any[];
}

export interface GrammarRule { // From Lesson Service
  id: string;
  lessonId: string;
  title: string;
  rule: string;
  example: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== PRONUNCIATION ====================

export interface PronunciationSound {
  id: string;
  symbol: string;
  type: string;
  word: string;
  description?: string;
  imageUrl?: string;
  audioUrl?: string;
  voiced?: boolean;
}

export interface PronunciationData {
  monophthongs: PronunciationSound[];
  diphthongs: PronunciationSound[];
  consonants: PronunciationSound[];
}

// ==================== LESSONS ====================

export interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  vocabularies?: VocabularyWord[];
  grammars?: GrammarRule[];
}
