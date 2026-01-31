/**
 * API Types - Common types used across the application
 */

// ==================== BASE TYPES ====================

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

// ==================== USER & AUTH ====================

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// ==================== VOCABULARY ====================

export interface VocabularyBook {
  id: string;
  name: string;
  imageUrl: string;
  wordCount: number;
  _count: { units: number };
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
}

export interface VocabularyBookWithUnits {
  id: string;
  name: string;
  units: VocabularyUnit[];
}

export interface VocabularyUnitWithContent {
  id: string;
  title: string;
  book: { id: string; name: string };
  words: VocabularyWord[];
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
}

export interface GrammarUnit {
  id: string;
  title: string;
  order: number;
  theoryContent?: string;
}

export interface GrammarExercise {
  id: string;
  question: string;
  answer: string;
}

export interface GrammarBookWithUnits {
  id: string;
  slug: string;
  name: string;
  units: GrammarUnit[];
}

export interface GrammarUnitWithContent {
  id: string;
  title: string;
  theoryContent?: string;
  book: { id: string; slug: string; name: string };
  exercises: GrammarExercise[];
}

// ==================== PRONUNCIATION ====================

export type SoundType = 'monophthong' | 'diphthong' | 'consonant';

export interface PronunciationSound {
  id: string;
  symbol: string;
  type: SoundType;
  word: string;
  description?: string;
  imageUrl?: string;
  audioUrl?: string;
}

export interface GroupedSounds {
  monophthongs: PronunciationSound[];
  diphthongs: PronunciationSound[];
  consonants: PronunciationSound[];
}

// ==================== EXAMS ====================

export interface Exam {
  id: string;
  title: string;
  duration: number;
  questionCount: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface ExamResult {
  id: string;
  examId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  completedAt: string;
}

// ==================== LEARNING PROGRESS ====================

export interface LearningProgress {
  vocabularyCompleted: number;
  vocabularyTotal: number;
  grammarCompleted: number;
  grammarTotal: number;
  pronunciationCompleted: number;
  pronunciationTotal: number;
  examsTaken: number;
  averageScore: number;
}
