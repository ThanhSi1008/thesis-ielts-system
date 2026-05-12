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
  firstName?: string;
  lastName?: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  avatar?: string;
  googleId?: string;   // Present if signed in via Google
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
}

export interface AuthResponse {
  access_token: string; // NestJS convention
  refresh_token?: string;
  user?: User;
}

// ==================== VOCABULARY ====================

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
  lessonId?: string; // From Lesson Service
  createdAt?: string;
  updatedAt?: string;
}

export interface VocabularyBookWithUnits extends FoundationVocabBook {
  units: FoundationVocabUnit[];
}

export interface VocabularyUnitWithContent extends FoundationVocabUnit {
  book: { id: string; name: string };
  words: FoundationVocabItem[];
  questions: FoundationVocabQuestion[];
  storyTitle?: string;
  storyContent?: string;
  storyImageUrl?: string;
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

export interface GrammarBookWithUnits extends FoundationGrammarBook {
  units: FoundationGrammarUnit[];
}

export interface GrammarUnitWithContent extends FoundationGrammarUnit {
  book: { id: string; slug: string; name: string };
  exercises: any[];
}

export interface GrammarUnitProgress {
  unitOrder: number;
  theoryCompleted: boolean;
  exerciseScore: number | null;
  exerciseTotal: number | null;
  isCompleted: boolean;
  completedAt: string | null;
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

export interface PronunciationWordFeedback {
  word: string;
  targetIPA: string;
  spokenIPA: string;
  spoken: string;
  phonemeScore: number;
  confidence: number;
  match: 'correct' | 'incorrect' | 'missing';
}

export interface PronunciationResult {
  score: number;
  transcribedText: string;
  feedback: {
    level: string;
    message: string;
    color: string;
    details: {
      targetIPA: string;
      transcribedIPA: string;
      phonemeAccuracy: number;
      confidenceScore: number;
      textAccuracy: number;
    };
    words: PronunciationWordFeedback[];
  };
}

export interface PronunciationData {
  monophthongs: FoundationPronunciationSound[];
  diphthongs: FoundationPronunciationSound[];
  consonants: FoundationPronunciationSound[];
}

// ==================== LESSONS ====================

export interface FoundationVocabLesson {
  id: string;
  title: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  vocabularies?: FoundationVocabItem[];
  grammars?: GrammarRule[];
}

// ==================== VOCAB LAB (SM-2 Flashcards) ====================

export type CardState = 'NEW' | 'LEARNING' | 'REVIEW' | 'RELEARNING';

// Per-field visual style
export interface FieldStyle {
  fontSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  color?: string;             // hex e.g. "#FF4500"
  textAlign?: 'left' | 'center' | 'right';
}

// Card-level visual style (applies to the whole card container)
export interface CardStyle {
  backgroundColor?: string;   // hex
  fontFamily?: 'sans' | 'serif' | 'mono';
  textColor?: string;         // default text color override
}

// Card Types
export interface CardTypeField {
  id: string;
  name: string;
  order: number;
  description?: string | null;
  fieldType: 'text' | 'media';
  cardTypeId: string;
  createdAt: string;
}

export interface CardTemplate {
  id: string;
  name: string;
  frontFields: string[]; // ordered field IDs
  backFields: string[];  // ordered field IDs
  fieldStyles: Record<string, FieldStyle>; // fieldId → style
  cardStyle: CardStyle;
  cardTypeId: string;
  createdAt: string;
}

export interface CardType {
  id: string;
  name: string;
  description?: string | null;
  isBuiltIn: boolean;
  fields: CardTypeField[];
  templates: CardTemplate[];
  cardCount?: number;
  userId?: string | null;
  createdAt: string;
}

export interface Deck {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeckWithCounts extends Deck {
  newCount: number;
  learningCount: number;
  dueCount: number;
  totalCards: number;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  tags: string[];
  // FSRS scheduling fields
  due: string;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  lastReview?: string;
  nextReviewDate: string; // Keeping for backward compatibility
  cardState: CardState;
  cardTypeId?: string | null;
  cardType?: CardType | null;
  fieldValues: Record<string, string>;
  fieldStyles?: Record<string, FieldStyle>;
  cardStyle?: CardStyle;
  createdAt: string;
  updatedAt: string;
  deck?: { id: string; name: string };
}

export interface StudyCard extends Flashcard {
  // Study session specific properties if needed
}

export interface SubmitReviewRequest {
  flashcardId: string;
  rating: number; // 1=Again, 2=Hard, 3=Good, 4=Easy
}

export interface VocabLabStats {
  // Flat backward-compat fields
  newCount: number;
  learningCount: number;
  reviewCount: number;
  totalCount: number;

  cardCounts: {
    newCount: number;
    learningCount: number;
    reviewCount: number;
    relearningCount: number;
    totalCount: number;
  };

  reviewActivity: {
    date: string;
    reviewCount: number;
    againCount: number;
    hardCount: number;
    goodCount: number;
    easyCount: number;
  }[];

  streakData: {
    currentStreak: number;
    longestStreak: number;
    totalReviewDays: number;
    totalReviews: number;
  };

  maturityDistribution: {
    young: number;
    mature: number;
    suspended: number;
  };

  forecast: {
    date: string;
    dueCount: number;
    cumulativeCount: number;
  }[];

  averages: {
    averageEasePercent: number;
    averageLapses: number;
    averageInterval: number;
    retentionRatePercent: number;
  };

  hourlyActivity: {
    hour: number;
    count: number;
  }[];
}

// ==================== IELTS EXAMS (Intensive Catalog) ====================

export type IeltsBasicSkill = 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING';

export interface IeltsIntensiveTestCard {
  examId: string;
  testNumber: number;
  durationMinutes: number;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  myScore?: number;
  participantsCount: number;
  completedCount: number;
}

export interface IeltsIntensiveGroup {
  id: string; // "cambridge-17"
  title: string; // "Cambridge IELTS 17"
  imageUrl?: string;
  participantsCount: number;
  completedCount: number;
  tests: IeltsIntensiveTestCard[];
}

export interface IeltsIntensiveCatalogResponse {
  skill: IeltsBasicSkill;
  groups: IeltsIntensiveGroup[];
}

export interface PracticeItem {
  id: string; // "examId-partNumber"
  examId: string;
  testTitle: string;
  partNumber: number;
  partType: string; // e.g. "Basic Conversation"
  topic: string; // e.g. "Cookery Classes"
  totalQuestions: number;
  myScore?: number;
  practicesCompleted: number;
  latestSessionId?: string; // to resume
  latestSessionStatus?: string;
}

export interface PracticeCatalogResponse {
  skill: IeltsBasicSkill;
  items: PracticeItem[];
}

export interface ExamDetail {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  duration: number;
  type: string;
  readingType?: 'ACADEMIC' | 'GENERAL';
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  isPublished: boolean;
  questions: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface IeltsBasicWritingExercise {
  id: string;
  skillId: string;
  lessonId?: string;
  topic: string;
  instructions?: string;
  prompt: string;
  diagramUrl?: string;
  modelAnswer: {
    intro?: string;
    overview?: string;
    body1?: string;
    body2?: string;
  };
  order: number;
}

export interface ExamSessionDetail {
  id: string;
  userId: string;
  examId: string;
  status: string;
  answers: any;
  startedAt: string;
  submittedAt?: string | null;
  ieltsIntensiveResult?: any;
  practicePart?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SharedDeck {
  id: string;
  publisherId: string;
  name: string;
  description: string | null;
  tags: string[];
  importCount: number;
  createdAt: string;
  updatedAt: string;
  cardCount: number;
  publisher: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
  };
}

// ==================== COMMUNITY POSTS ====================

export type PostType = 'STUDY_TIP' | 'SCORE_ACHIEVEMENT' | 'GENERAL';

export interface PostAuthor {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
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
  isPinned: boolean;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
  author: PostAuthor;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  parentId: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: PostAuthor;
  replies?: Comment[];
}

export interface PostListResponse {
  items: Post[];
  nextCursor: string | null;
}

export interface PostListParams {
  cursor?: string;
  limit?: number;
  type?: PostType;
  tag?: string;
  authorId?: string;
}

// ==================== GAMIFICATION ====================

export interface AchievementItem {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tier: number;  // 1=Bronze, 2=Silver, 3=Gold
  earned: boolean;
  earnedAt: string | null;
}

export interface GamificationProfile {
  totalXp: number;
  level: number;
  currentLevelXp: number;
  xpNeeded: number;
  achievementCount: number;
  totalAchievements: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string | null;
  value: number;
}

export interface XpLogEntry {
  id: string;
  amount: number;
  reason: string;
  createdAt: string;
}

// ==================== SUBSCRIPTION ====================

export type SubscriptionTier = "FREE" | "PREMIUM" | "PRO";
export type SubscriptionStatus = "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELED" | "EXPIRED";

export interface PricingPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  description: string | null;
  priceAmount: number; // cents
  currency: string;
  interval: "month" | "year";
  intervalCount: number;
  features: string[];
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

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
    | "SUBSCRIPTION_REQUIRED"
    | "QUOTA_EXCEEDED"
    | "DECK_LIMIT_REACHED"
    | "CARD_LIMIT_REACHED"
    | "DAILY_QUOTA_EXCEEDED";
  message: string;
  requiredTier?: SubscriptionTier;
  currentTier?: SubscriptionTier;
  upgradeUrl?: string;
}

export interface CheckoutResponse {
  subscription?: UserSubscription;
  message?: string;
  sessionId?: string;
  redirectUrl?: string;
}

// ==================== IELTS STATISTICS ====================

export interface IeltsOverviewStats {
  estimatedBand: number | null;
  targetBand: number | null;
  bandGap: number | null;
  dailyMinutesPracticed: number;
  dailyCommitmentMins: number;
  heatmap: { date: string; minutes: number }[];
  recentActivity: any[]; // Expand this when feed is ready
  daysToExam: number | null;
  readinessScore: number | null;
}

export interface IeltsFoundationStats {
  vocabulary: { wordsLearned: number; totalWords: number };
  grammar: { completedUnits: number; totalUnits: number };
  pronunciation: { mastered: number; practicing: number; new: number };
  averageAccuracy: number;
  timeBalance: { vocab: number; grammar: number; pronunciation: number };
}

export interface IeltsBasicSkillStats {
  skillId: string;
  skillName: string;
  completedItems: number;
  totalItems: number;
  completionRate: number;
}

export interface IeltsBasicStats {
  skills: IeltsBasicSkillStats[];
  overallReadiness: number;
}

export interface IeltsAdvancedStats {
  heatmap: any[];
  weakSpots: any[];
  scoreTrend: any[];
  writingFeedbackSummary: any;
  speakingFeedbackSummary: any;
}

export interface IeltsIntensiveStats {
  overallTrend: any[];
  skillTrends: { listening: any[]; reading: any[]; writing: any[]; speaking: any[] };
  scoreDistribution: any[];
  timeManagement: { averageTimeTaken: number; optimalTime: number };
  skillGap: { bestSkill: string; worstSkill: string; gap: number };
}
