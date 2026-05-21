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
  
  ieltsGrammar: '/ielts/grammar',
  ieltsGrammarBook: (bookSlug: string) => `/ielts/grammar/${bookSlug}`,
  ieltsGrammarUnit: (bookSlug: string, unitId: string) => `/ielts/grammar/${bookSlug}/${unitId}`,
  
  ieltsPronunciation: '/ielts/pronunciation',
  ieltsPronunciationSymbol: (symbol: string) => `/ielts/pronunciation/${symbol}`,
  
  // Vocabulary
  vocabulary: '/(tabs)/vocabulary',
  vocabularyBook: (bookId: string) => `/vocabulary/${bookId}`,
  vocabularyUnit: (bookId: string, unitId: string) => `/vocabulary/${bookId}/${unitId}`,
  
  // Grammar
  grammar: '/(tabs)/grammar',
  grammarBook: (bookSlug: string) => `/grammar/${bookSlug}`,
  grammarUnit: (bookSlug: string, unitId: string) => `/grammar/${bookSlug}/${unitId}`,
  
  // Shadowing
  shadowing: '/shadowing',
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
