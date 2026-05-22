/**
 * Typed Routes for Expo Router - Consistency Baseline
 */

export const ROUTES = {
  // Auth
  login: '/(auth)/login',
  register: '/(auth)/register',
  
  // Tabs
  home: '/(tabs)',
  explore: '/(tabs)/explore',
  ielts: '/(tabs)/ielts',
  community: '/(tabs)/community',
  profile: '/(tabs)/profile',
  
  // IELTS
  ieltsAdvanced: '/ielts/advanced',
  ieltsAdvancedSkillPart: (skill: string, partId: string) => `/ielts/advanced/${skill}/${partId}`,
  ieltsAdvancedSkillPartHistory: (skill: string, partId: string) => `/ielts/advanced/${skill}/${partId}/history`,
  ieltsAdvancedSkillPartResult: (skill: string, partId: string, resultId: string) => `/ielts/advanced/${skill}/${partId}/result/${resultId}`,
  ieltsAdvancedListening: (partId: string) => `/ielts/advanced/listening/${partId}`,
  ieltsAdvancedReading: (partId: string) => `/ielts/advanced/reading/${partId}`,
  ieltsAdvancedWriting: (promptId: string) => `/ielts/advanced/writing/${promptId}`,
  ieltsAdvancedSpeaking: (partId: string) => `/ielts/advanced/speaking/${partId}`,
  ieltsAdvancedSpeakingIndex: '/ielts/advanced/speaking',
  ieltsAdvancedSpeakingResult: (sessionId: string) => `/ielts/advanced/speaking/result/${sessionId}`,
  ieltsAdvancedHistory: '/ielts/advanced/history',
  ieltsAdvancedStatistics: '/ielts/advanced/statistics',
  
  ieltsIntensive: '/ielts/intensive',
  ieltsIntensiveExam: (examId: string) => `/ielts/intensive/${examId}`,
  ieltsIntensiveResult: (sessionId: string) => `/ielts/intensive/result/${sessionId}`,
  ieltsIntensiveCustom: '/ielts/intensive/custom',
  
  ieltsBasic: '/(tabs)/ielts',
  ieltsBasicLesson: (lessonId: string) => `/ielts/basic/lesson/${lessonId}`,
  ieltsBasicExercise: (exerciseId: string) => `/ielts/basic/exercise/${exerciseId}`,
  ieltsBasicLibraryExercises: (skill: string) => `/ielts/basic/library/${skill}/exercises`,
  ieltsBasicLibraryLessons: (skill: string) => `/ielts/basic/library/${skill}/lessons`,
  
  ieltsRoadmap: '/ielts/roadmap',
  ieltsHistory: '/ielts/history',
  ieltsStatistics: '/ielts/statistics',
  ieltsCalculator: '/ielts/calculator',
  ieltsDashboard: '/ielts/dashboard',
  ieltsOnboarding: '/ielts/onboarding',
  ieltsDiagnostic: '/ielts/onboarding/diagnostic', // P5
  
  ieltsStudentTeacher: '/ielts/student-teacher',
  ieltsStudentDetail: (studentId: string) => `/ielts/student-teacher/${studentId}`,
  
  /** @deprecated Use foundationGrammar instead */
  ieltsGrammar: '/ielts/grammar',
  /** @deprecated Use foundationGrammarBook instead */
  ieltsGrammarBook: (bookSlug: string) => `/ielts/grammar/${bookSlug}`,
  /** @deprecated Use foundationGrammarUnit instead */
  ieltsGrammarUnit: (bookSlug: string, unitId: string) => `/ielts/grammar/${bookSlug}/${unitId}`,
  
  /** @deprecated Use foundationPronunciation instead */
  ieltsPronunciation: '/ielts/pronunciation',
  /** @deprecated Use foundationPronunciationSymbol instead */
  ieltsPronunciationSymbol: (symbol: string) => `/ielts/pronunciation/${symbol}`,
  
  // Foundation (IELTS Foundation Modules)
  foundationVocabulary: '/ielts/foundation/vocabulary',
  foundationVocabularyBook: (bookId: string) => `/ielts/foundation/vocabulary/${bookId}`,
  foundationVocabularyUnit: (bookId: string, unitId: string) => `/ielts/foundation/vocabulary/${bookId}/${unitId}`,

  foundationGrammar: '/ielts/foundation/grammar',
  foundationGrammarBook: (bookSlug: string) => `/ielts/foundation/grammar/${bookSlug}`,
  foundationGrammarUnit: (bookSlug: string, unitId: string) => `/ielts/foundation/grammar/${bookSlug}/${unitId}`,

  foundationPronunciation: '/ielts/foundation/pronunciation',
  foundationPronunciationSymbol: (symbol: string) => `/ielts/foundation/pronunciation/${symbol}`,

  // Practice Tools
  practiceTools: '/practice-tools',
  practiceToolsShadowing: '/practice-tools/shadowing',
  practiceToolsShadowingLesson: (lessonId: string, mode: 'shadowing' | 'dictation') => `/practice-tools/shadowing/${lessonId}/${mode}`,
  practiceToolsDictation: '/practice-tools/dictation',
  
  /** @deprecated Use foundationVocabulary instead */
  vocabulary: '/(tabs)/vocabulary',
  /** @deprecated Use foundationVocabularyBook instead */
  vocabularyBook: (bookId: string) => `/vocabulary/${bookId}`,
  /** @deprecated Use foundationVocabularyUnit instead */
  vocabularyUnit: (bookId: string, unitId: string) => `/vocabulary/${bookId}/${unitId}`,
  
  /** @deprecated Use foundationGrammar instead */
  grammar: '/(tabs)/grammar',
  /** @deprecated Use foundationGrammarBook instead */
  grammarBook: (bookSlug: string) => `/grammar/${bookSlug}`,
  /** @deprecated Use foundationGrammarUnit instead */
  grammarUnit: (bookSlug: string, unitId: string) => `/grammar/${bookSlug}/${unitId}`,
  
  /** @deprecated Use practiceToolsShadowing instead */
  shadowing: '/shadowing',
  /** @deprecated Use practiceToolsShadowingLesson instead */
  shadowingLesson: (lessonId: string, mode: 'shadowing' | 'dictation') => `/shadowing/${lessonId}/${mode}`,
  
  // Vocab Lab
  vocabLab: '/vocab-lab',
  vocabLabDeck: (deckId: string) => `/vocab-lab/${deckId}`,
  vocabLabStudy: (deckId: string) => `/vocab-lab/study/${deckId}`,
  
  // Pricing/Payment
  pricing: '/pricing',
  paymentVnpayReturn: '/payment/vnpay-return', // P12
  
  // Chat / Notification
  chatAi: '/chat-ai',
  notification: '/notification',
} as const;

export type RoutesType = typeof ROUTES;
