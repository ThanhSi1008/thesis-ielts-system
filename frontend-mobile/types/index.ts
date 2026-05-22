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
  googleId?: string;
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
  order: number;
  book: { id: string; name: string };
  words: VocabularyWord[];
  questions: FoundationVocabQuestion[];
  storyTitle?: string;
  storyContent?: string;
  storyImageUrl?: string;
}

export type BookWithUnits = VocabularyBookWithUnits;
export type UnitWithContent = VocabularyUnitWithContent;

export interface FoundationVocabBook {
  id: string;
  name: string;
  imageUrl: string;
  wordCount: number;
  _count?: { units: number };
}

export interface FoundationVocabUnit {
  id: string;
  title: string;
  order: number;
}

export interface FoundationVocabItem {
  id: string;
  word: string;
  meaning: string;
  ipa?: string;
  partOfSpeech?: string;
  example?: string;
  imageUrl?: string;
  audioUrl?: string;
  lessonId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FoundationVocabQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'fill_blank';
  options?: string[];
  answer: string;
  order: number;
}

export interface VocabularyUnitProgress {
  id: string;
  title: string;
  order: number;
  totalWords: number;
  wordsLearned: number;
  questionScore?: number;
  isCompleted: boolean;
}

export interface VocabularyBookProgress {
  book: { id: string; name: string };
  units: VocabularyUnitProgress[];
}

export interface QuestionResult {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface SubmitQuestionsResponse {
  score: number;
  correctCount: number;
  totalQuestions: number;
  results: QuestionResult[];
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
  options?: string[];
  correctAnswer?: string;
}

export interface GrammarBookWithUnits {
  id: string;
  slug: string;
  name: string;
  level?: string;
  author?: string;
  units: GrammarUnit[];
}

export interface GrammarUnitWithContent {
  id: string;
  title: string;
  theoryContent?: string;
  explanation?: string;
  theory?: string;
  examples?: string[];
  notes?: string;
  book: { id: string; slug: string; name: string };
  exercises: GrammarExercise[];
}

export interface FoundationGrammarBook {
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

export interface FoundationGrammarUnit {
  id: string;
  title: string;
  order: number;
  theoryContent?: string;
}

export interface GrammarUnitProgress {
  unitOrder: number;
  theoryCompleted: boolean;
  exerciseScore: number | null;
  exerciseTotal: number | null;
  isCompleted: boolean;
  completedAt: string | null;
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

export interface WordScore {
  word: string;
  accuracyScore: number;
  errorType?: 'None' | 'Omission' | 'Insertion' | 'Substitution' | 'Mispronunciation';
}

export interface PronunciationScore {
  accuracyScore: number;
  completenessScore: number;
  fluencyScore: number;
  pronScore: number;
  words?: WordScore[];
}

export interface PronunciationCheckResponse {
  // Immediate response: queue acknowledgment
  attemptId?: string;
  status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  message?: string;
  // Populated later when AI processing completes
  score?: PronunciationScore;
  audioUrl?: string;
}

export interface FoundationPronunciationSound {
  id: string;
  symbol: string;
  name?: string;
  type: string;
  word: string;
  description?: string;
  tip?: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  voiced?: boolean;
  order: number;
  exampleWords: FoundationSoundExample[];
}

export interface FoundationSoundExample {
  id: string;
  word: string;
  ipa?: string;
  audioUrl?: string;
  order: number;
}

export interface SoundProgress {
  soundId: string;
  symbol: string;
  type: string;
  status: 'NEW' | 'PRACTICING' | 'MASTERED';
  practiceCount: number;
  bestScore: number | null;
  lastPracticedAt: string | null;
}

export interface PronunciationStats {
  totalSounds: number;
  masteredCount: number;
  practicingCount: number;
  newCount: number;
  overallMastery: number;
}

export interface WordProgress {
  word: string;
  bestScore: number | null;
  attemptCount: number;
  status: 'NEW' | 'PRACTICING' | 'MASTERED';
}

export interface PronunciationData {
  monophthongs: FoundationPronunciationSound[];
  diphthongs: FoundationPronunciationSound[];
  consonants: FoundationPronunciationSound[];
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

export interface ShadowingSentence {
  index: number;
  startTime: number;
  endTime: number;
  text: string;
  vietnamese?: string;
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

// ==================== VOCAB LAB ====================

export interface Deck {
  id: string;
  name: string;
  newCount?: number;
  learningCount?: number;
  dueCount?: number;
  totalCount?: number;
  totalCards?: number;
}

export interface CardField {
  id: string;
  name: string;
  order: number;
  fieldType?: string;
  description?: string;
}

export interface CardTemplate {
  id: string;
  name: string;
  frontFields: string[];
  backFields: string[];
  fieldStyles?: Record<string, Record<string, string>>;
  cardStyle?: Record<string, string>;
}

export interface CardType {
  id: string;
  name: string;
  isBuiltIn: boolean;
  fields: CardField[];
  templates?: CardTemplate[];
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  state?: 'new' | 'learning' | 'review';
  cardTypeId?: string;
  fieldValues?: Record<string, string>;
  fieldStyles?: Record<string, any>;
  tags?: string[];
}

export interface VocabStats {
  totalCards?: number;
  totalCount?: number;
  totalDue?: number;
  dueCount?: number;
  totalLearned?: number;
  reviewCount?: number;
  newCount?: number;
  learningCount?: number;
}

// ==================== SHADOWING ====================

export interface ShadowingVideo {
  id: string;
  title: string;
  youtubeVideoId: string;
  folder?: string;
  category?: string;
  duration: string;
  sentences: ShadowingSentence[];
  tags?: string[];
}

export interface ShadowingProgress {
  lessonId: string;
  type: 'shadowing' | 'dictation';
  completedSentences: number[];
  dictationDifficulty?: string;
}

// ==================== IELTS ====================

export interface IeltsSkill {
  id: string;
  title: string;
  icon?: string;
}

export interface IeltsLesson {
  id: string;
  title: string;
  skillId: string;
  isCompleted?: boolean;
}

export interface IeltsExercise {
  id: string;
  topic?: string;
  audioUrl?: string;
  passage?: string;
  content?: IeltsContentGroup[];
  prompt?: string;
  diagramUrl?: string;
  modelAnswer?: Record<string, string>;
}

export interface IeltsContentGroup {
  type: string;
  questions?: IeltsMCQuestion[];
  question_numbers?: number[];
  options?: IeltsMCOption[];
  answers?: string[];
  instructions?: string;
  passage?: string;
  [key: string]: unknown;
}

export interface IeltsMCQuestion {
  question_number: number;
  text: string;
  options: IeltsMCOption[];
  answer: string;
  explanation?: string;
}

export interface IeltsMCOption {
  letter: string;
  text: string;
}

// ==================== GAMIFICATION ====================

export interface GamificationProfile {
  id: string;
  userId: string;
  level: number;
  totalXp: number;
  currentLevelXp: number;
  xpNeeded: number;
  achievementCount: number;
  totalAchievements: number;
  createdAt: string;
  updatedAt: string;
}

export interface AchievementItem {
  id: string;
  badgeId: string;
  name: string;
  description: string;
  icon: string;
  conditionType: string;
  conditionValue: number;
  xpReward: number;
  earnedAt?: string;
  progress?: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  value: number;
}

// ==================== COMMUNITY / POSTS ====================

export type PostType = 'GENERAL' | 'STUDY_TIP' | 'SCORE_ACHIEVEMENT';

export interface PostAuthor {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  subscription?: { tier: string } | null;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  body: string;
  parentId: string | null;
  createdAt: string;
  author: PostAuthor;
  replies?: Comment[];
}

export interface Post {
  id: string;
  authorId: string;
  type: PostType;
  title: string | null;
  body: string;
  imageUrls: string[];
  tags: string[];
  metadata: Record<string, any> | null;
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
  author: PostAuthor;
  comments?: Comment[];
}

export interface PostListResponse {
  items: Post[];
  nextCursor: string | null;
}

export interface PostListParams {
  cursor?: string;
  type?: PostType;
  tag?: string;
  authorId?: string;
  limit?: number;
  bookmarkedOnly?: boolean;
}

// ==================== SUBSCRIPTION ====================

export type SubscriptionTier = 'FREE' | 'PREMIUM' | 'PRO';
export type SubscriptionStatus = 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';

export interface UserSubscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  canceledAt: string | null;
  trialEndsAt: string | null;
  trialUsed: boolean;
  usage: Record<string, { used: number; limit: number }>;
  limits: Record<string, unknown>;
}

export interface SubscriptionError {
  statusCode: 403;
  error:
    | 'SUBSCRIPTION_REQUIRED'
    | 'QUOTA_EXCEEDED'
    | 'DECK_LIMIT_REACHED'
    | 'CARD_LIMIT_REACHED'
    | 'DAILY_QUOTA_EXCEEDED';
  message: string;
  requiredTier?: SubscriptionTier;
  currentTier?: SubscriptionTier;
  upgradeUrl?: string;
}
