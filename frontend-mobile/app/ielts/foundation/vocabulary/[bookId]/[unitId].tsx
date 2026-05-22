import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { vocabularyApi } from '@/services';
import { COLORS, FONTS } from '@/constants';
import { useAudioPlayer } from 'expo-audio';
import type { VocabularyUnitWithContent, SubmitQuestionsResponse } from '@/types';
import { Breadcrumb } from '@/components';

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'flashcard' | 'reading' | 'exercise';

interface Word {
  id: string;
  word: string;
  ipa?: string;
  partOfSpeech?: string;
  meaning: string;
  example?: string;
  imageUrl?: string;
  audioUrl?: string;
}

// ─── Flashcard component ──────────────────────────────────────────────────────
function FlashCard({
  word,
  onEvaluate,
}: {
  word: Word;
  onEvaluate: (rating: 'again' | 'hard' | 'good' | 'easy') => void;
}) {
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [flipped, setFlipped] = useState(false);

  // Setup expo-audio player dynamically
  const player = useAudioPlayer(word.audioUrl || '');

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const flip = () => {
    if (flipped) return; // Prevent flipping back immediately to let user read
    Animated.spring(flipAnim, {
      toValue: 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setFlipped(true);
  };

  const handleSpeak = () => {
    try {
      if (player) {
        player.seekTo(0);
        player.play();
      }
    } catch (e) {
      if (__DEV__) console.log('Audio playback error', e);
    }
  };

  // Reset when word changes
  useEffect(() => {
    flipAnim.setValue(0);
    setFlipped(false);
  }, [word.id]);

  return (
    <View style={fc.wrap}>
      <TouchableOpacity onPress={flip} activeOpacity={0.95} style={{ flex: 1 }}>
        {/* Front */}
        <Animated.View
          style={[
            fc.card,
            fc.cardFront,
            { transform: [{ rotateY: frontRotate }] },
            flipped && { zIndex: 0 },
          ]}
        >
          {/* Header */}
          <View style={fc.cardHeader}>
            {word.partOfSpeech ? (
              <View style={fc.posBadge}>
                <Text style={fc.posText}>{word.partOfSpeech}</Text>
              </View>
            ) : (
              <View />
            )}
            {word.audioUrl ? (
              <TouchableOpacity style={fc.audioBtn} onPress={handleSpeak}>
                <Ionicons name="volume-high" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Word content with Image */}
          <View style={fc.cardBody}>
            {word.imageUrl ? (
              <Image source={{ uri: word.imageUrl }} style={fc.wordImg} resizeMode="cover" />
            ) : (
              <View style={fc.imgPlaceholder}>
                <Ionicons name="book-outline" size={48} color={COLORS.gray[300]} />
              </View>
            )}
            <Text style={fc.wordText}>{word.word}</Text>
            {word.ipa ? <Text style={fc.pronText}>[{word.ipa}]</Text> : null}
          </View>

          <Text style={fc.hintText}>Tap card to flip and see meaning</Text>
        </Animated.View>

        {/* Back */}
        <Animated.View
          style={[
            fc.card,
            fc.cardBack,
            { transform: [{ rotateY: backRotate }] },
            !flipped && { zIndex: -1 },
          ]}
        >
          <View style={fc.cardHeader}>
            {word.partOfSpeech ? (
              <View style={fc.posBadge}>
                <Text style={fc.posText}>{word.partOfSpeech}</Text>
              </View>
            ) : (
              <View />
            )}
            {word.audioUrl ? (
              <TouchableOpacity style={fc.audioBtn} onPress={handleSpeak}>
                <Ionicons name="volume-high" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            ) : null}
          </View>

          <ScrollView contentContainerStyle={fc.scrollBody} showsVerticalScrollIndicator={false}>
            <Text style={fc.wordTextSmall}>{word.word}</Text>
            {word.ipa ? <Text style={fc.pronTextSmall}>[{word.ipa}]</Text> : null}

            <View style={fc.meaningWrapper}>
              <Text style={fc.defText}>{word.meaning}</Text>
            </View>

            {word.example && (
              <View style={fc.exampleBox}>
                <Text style={fc.exampleLabel}>Example Sentence</Text>
                <Text style={fc.exampleText}>"{word.example}"</Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </TouchableOpacity>

      {/* Action buttons (only visible when flipped) */}
      {flipped && (
        <View style={fc.srsActions}>
          <TouchableOpacity
            style={[fc.srsBtn, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}
            onPress={() => onEvaluate('again')}
          >
            <Text style={[fc.srsLabel, { color: '#EF4444' }]}>Again</Text>
            <Text style={[fc.srsTime, { color: '#F87171' }]}>&lt;1m</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[fc.srsBtn, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}
            onPress={() => onEvaluate('hard')}
          >
            <Text style={[fc.srsLabel, { color: '#F97316' }]}>Hard</Text>
            <Text style={[fc.srsTime, { color: '#FDBA74' }]}>10m</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[fc.srsBtn, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}
            onPress={() => onEvaluate('good')}
          >
            <Text style={[fc.srsLabel, { color: '#0EA5E9' }]}>Good</Text>
            <Text style={[fc.srsTime, { color: '#7DD3FC' }]}>3d</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[fc.srsBtn, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}
            onPress={() => onEvaluate('easy')}
          >
            <Text style={[fc.srsLabel, { color: '#22C55E' }]}>Easy</Text>
            <Text style={[fc.srsTime, { color: '#86EFAC' }]}>5d</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const fc = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  card: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    backfaceVisibility: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  cardFront: { zIndex: 1 },
  cardBack: { zIndex: 0 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  posBadge: {
    backgroundColor: 'rgba(33,150,243,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  posText: {
    color: COLORS.info,
    fontSize: 11,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  audioBtn: {
    padding: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardBody: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 24 },
  wordImg: { width: '100%', height: 160, borderRadius: 16, marginBottom: 20 },
  imgPlaceholder: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  wordText: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  wordTextSmall: {
    fontSize: 26,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    textAlign: 'center',
  },
  pronText: { fontSize: 16, color: COLORS.gray[400], marginTop: 6, fontFamily: FONTS.medium },
  pronTextSmall: {
    fontSize: 15,
    color: COLORS.gray[400],
    marginTop: 4,
    textAlign: 'center',
    fontFamily: FONTS.medium,
  },
  scrollBody: { flexGrow: 1, alignItems: 'center', paddingBottom: 16 },
  meaningWrapper: {
    marginTop: 16,
    paddingHorizontal: 8,
  },
  defText: {
    fontSize: 17,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 26,
    fontFamily: FONTS.medium,
  },
  exampleBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  exampleLabel: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.gray[400],
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  exampleText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    fontStyle: 'italic',
    fontFamily: FONTS.regular,
  },
  hintText: {
    textAlign: 'center',
    color: COLORS.gray[400],
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginTop: 'auto',
  },
  srsActions: { flexDirection: 'row', gap: 8, marginTop: 16 },
  srsBtn: { flex: 1, borderWidth: 1, borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
  srsLabel: { fontFamily: FONTS.bold, fontSize: 14 },
  srsTime: { fontFamily: FONTS.medium, fontSize: 10, marginTop: 1 },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function VocabularyUnitScreen() {
  const router = useRouter();
  const { bookId, unitId } = useLocalSearchParams<{ bookId: string; unitId: string }>();

  const [unit, setUnit] = useState<VocabularyUnitWithContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('flashcard');

  // Stateful words for SRS (handles 'again' repending)
  const [wordsState, setWordsState] = useState<Word[]>([]);
  const [originalWordsCount, setOriginalWordsCount] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [wordsLearned, setWordsLearned] = useState(0);

  // Exercise State
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});
  const [questionResult, setQuestionResult] = useState<SubmitQuestionsResponse | null>(null);
  const [questionSubmitting, setQuestionSubmitting] = useState(false);
  const [questionsCompleted, setQuestionsCompleted] = useState(false);

  // Tab unlocking
  const [wordListComplete, setWordListComplete] = useState(false);

  const loadingBreadcrumb = useMemo(() => [
    { label: 'IELTS', route: '/(tabs)/ielts' },
    { label: 'Vocabulary', route: '/ielts/foundation/vocabulary' },
    { label: 'Book', route: `/ielts/foundation/vocabulary/${bookId}` },
    { label: 'Loading...' }
  ], [bookId]);

  const breadcrumbItems = useMemo(() => [
    { label: 'IELTS', route: '/(tabs)/ielts' },
    { label: 'Vocabulary', route: '/ielts/foundation/vocabulary' },
    { label: 'Book', route: `/ielts/foundation/vocabulary/${bookId}` },
    { label: unit?.title ?? 'Unit' }
  ], [bookId, unit?.title]);

  const load = useCallback(async () => {
    try {
      const data = await vocabularyApi.getUnit(unitId!);
      setUnit(data);
      setWordsState(data.words);
      setOriginalWordsCount(data.words.length);

      // Load progress to resume
      try {
        const progressData = await vocabularyApi.getProgress(bookId!);
        const unitProgress = progressData.units.find((u) => u.id === unitId);
        if (unitProgress) {
          if (unitProgress.wordsLearned > 0) {
            const initialLearned = Math.min(unitProgress.wordsLearned, data.words.length);
            setWordsLearned(initialLearned);
            setCardIndex(Math.min(initialLearned, data.words.length - 1));

            if (initialLearned >= data.words.length) {
              setWordListComplete(true);
              setActiveTab('reading');
            }
          }

          if (unitProgress.questionScore !== undefined && unitProgress.questionScore !== null) {
            setQuestionsCompleted(unitProgress.isCompleted);
            const totalQ = data.questions?.length ?? 0;
            const correctCount = Math.round((unitProgress.questionScore / 100) * totalQ);

            setQuestionResult({
              score: unitProgress.questionScore,
              correctCount,
              totalQuestions: totalQ,
              results: [], // We won't have specific incorrect list, but we mark it complete
            });
            setWordListComplete(true);
            setActiveTab('reading');
          }
        }
      } catch (err) {
        if (__DEV__) console.log('No unit progress or user offline', err);
      }
    } catch (err) {
      if (__DEV__) console.log('Failed to load vocabulary unit details', err);
    } finally {
      setLoading(false);
    }
  }, [unitId, bookId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleEvaluate = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
    const currentWord = wordsState[cardIndex];
    if (!currentWord) return;

    let nextTotal = originalWordsCount;
    let nextWords = [...wordsState];

    if (rating === 'again') {
      nextWords.push(currentWord);
      setWordsState(nextWords);
      nextTotal += 1;
    }

    const nextIndex = cardIndex + 1;
    const newLearned = Math.min(wordsLearned + 1, nextTotal);
    setWordsLearned(newLearned);

    try {
      await vocabularyApi.updateWordProgress(unitId!, Math.min(newLearned, originalWordsCount));
    } catch (err) {
      if (__DEV__) console.log('Failed to update progress', err);
    }

    if (nextIndex < nextWords.length) {
      setCardIndex(nextIndex);
    } else {
      setWordsLearned(originalWordsCount);
      setWordListComplete(true);
      try {
        await vocabularyApi.updateWordProgress(unitId!, originalWordsCount);
      } catch (err) {
        if (__DEV__) console.log('Failed to update progress', err);
      }
      Alert.alert(
        '🎉 Flashcards Completed!',
        "You have successfully learned all vocabulary words in this unit! Next, let's read the comprehension story.",
        [{ text: 'Go to Reading', onPress: () => setActiveTab('reading') }],
      );
    }
  };

  const handleSkipWordList = async () => {
    setWordsLearned(originalWordsCount);
    setWordListComplete(true);
    try {
      await vocabularyApi.updateWordProgress(unitId!, originalWordsCount);
    } catch (err) {
      if (__DEV__) console.log('Failed to update progress', err);
    }
    setActiveTab('reading');
  };

  const handleSubmitQuestions = async () => {
    if (!unit || !unit.questions) return;
    setQuestionSubmitting(true);
    try {
      const answers = Object.entries(questionAnswers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));
      const res = await vocabularyApi.submitQuestions(unitId!, answers);
      setQuestionResult(res);
      const isPerfect = res.correctCount === res.totalQuestions;
      if (isPerfect) {
        setQuestionsCompleted(true);
      }
      Alert.alert(
        isPerfect ? '🎉 Perfect Score!' : '💪 Keep Trying!',
        `You got ${res.correctCount} out of ${res.totalQuestions} questions correct.`,
        [{ text: 'OK' }],
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to submit answers. Please try again.');
      if (__DEV__) console.error(err);
    } finally {
      setQuestionSubmitting(false);
    }
  };

  const handleRetryQuestions = () => {
    setQuestionResult(null);
    setQuestionAnswers({});
    setQuestionsCompleted(false);
  };

  const renderStoryContent = (htmlContent?: string) => {
    if (!htmlContent) return 'No reading content available for this unit.';
    return htmlContent
      .replace(/<\/p>/g, '\n\n')
      .replace(/<p[^>]*>/g, '')
      .replace(/<strong>/g, '')
      .replace(/<\/strong>/g, '')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .trim();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Breadcrumb items={loadingBreadcrumb} />
            <Text style={styles.headerTitle}>Loading…</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const questions = unit?.questions ?? [];
  const currentWord = wordsState[cardIndex];
  const progressPercent =
    originalWordsCount > 0 ? Math.min((wordsLearned / originalWordsCount) * 100, 100) : 0;

  const tabs: { key: Tab; label: string; icon: any; locked: boolean }[] = [
    { key: 'flashcard', label: 'Flashcards', icon: 'albums-outline', locked: false },
    { key: 'reading', label: 'Reading', icon: 'book-outline', locked: !wordListComplete },
    { key: 'exercise', label: 'Exercises', icon: 'pencil-outline', locked: !wordListComplete },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Breadcrumb items={breadcrumbItems} />
          <Text style={styles.headerTitle} numberOfLines={1}>
            {unit?.title ?? 'Unit Detail'}
          </Text>
          <Text style={styles.headerSub}>
            {activeTab === 'flashcard'
              ? `${Math.min(cardIndex + 1, wordsState.length)} / ${wordsState.length} cards`
              : `Unit ${unit?.order ?? 1} · Vocabulary`}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, active && styles.tabItemActive]}
              disabled={tab.locked}
              onPress={() => setActiveTab(tab.key)}
            >
              {tab.locked ? (
                <Ionicons name="lock-closed" size={14} color={COLORS.gray[300]} />
              ) : (
                <Ionicons
                  name={tab.icon}
                  size={15}
                  color={active ? COLORS.primary : COLORS.gray[400]}
                />
              )}
              <Text
                style={[
                  styles.tabLabel,
                  active && styles.tabLabelActive,
                  tab.locked && { color: COLORS.gray[300] },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* ── Tab 1: Flashcard */}
        {activeTab === 'flashcard' &&
          (wordsState.length === 0 ? (
            <View style={styles.center}>
              <Text style={{ fontSize: 32 }}>📭</Text>
              <Text style={styles.emptyText}>No flashcards available yet.</Text>
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              {currentWord && <FlashCard word={currentWord} onEvaluate={handleEvaluate} />}
              {!wordListComplete && (
                <TouchableOpacity style={styles.skipBtn} onPress={handleSkipWordList}>
                  <Text style={styles.skipBtnText}>Skip learning & go to reading</Text>
                  <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
                </TouchableOpacity>
              )}
            </View>
          ))}

        {/* ── Tab 2: Reading Story */}
        {activeTab === 'reading' && (
          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.readingTitle}>{unit?.storyTitle || unit?.title}</Text>
            <View style={styles.storyCard}>
              <Text style={styles.readingPara}>{renderStoryContent(unit?.storyContent)}</Text>
            </View>
            <TouchableOpacity
              style={styles.startExerciseBtn}
              onPress={() => setActiveTab('exercise')}
            >
              <Text style={styles.startExerciseText}>Start Comprehension Exercises</Text>
              <Ionicons name="create-outline" size={18} color="#fff" />
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* ── Tab 3: Exercise Questions */}
        {activeTab === 'exercise' && (
          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.exHeaderRow}>
              <Text style={styles.exMainTitle}>Comprehension Test</Text>
              {questionResult && (
                <View
                  style={[
                    styles.scoreBadge,
                    questionsCompleted ? styles.scoreBadgePerfect : styles.scoreBadgeNormal,
                  ]}
                >
                  <Text style={styles.scoreBadgeText}>
                    {questionResult.correctCount} / {questionResult.totalQuestions} Correct
                  </Text>
                </View>
              )}
            </View>

            {questions.length === 0 ? (
              <View style={styles.center}>
                <Text style={{ fontSize: 32 }}>📝</Text>
                <Text style={styles.emptyText}>No exercises for this unit.</Text>
              </View>
            ) : (
              <View style={styles.questionsList}>
                {questions.map((q, idx) => {
                  const res = questionResult?.results?.find((r) => r.questionId === q.id);
                  const isCorrect = res?.isCorrect;
                  const isAnswered = questionAnswers[q.id] !== undefined;

                  return (
                    <View
                      key={q.id}
                      style={[
                        styles.questionCard,
                        questionResult && (isCorrect ? styles.qCardCorrect : styles.qCardIncorrect),
                      ]}
                    >
                      {/* Question Text */}
                      <View style={styles.qNumRow}>
                        <Text style={styles.qNum}>Question {idx + 1}</Text>
                        {questionResult && (
                          <Ionicons
                            name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                            size={20}
                            color={isCorrect ? '#16A34A' : '#EF4444'}
                          />
                        )}
                      </View>
                      <Text style={styles.qText}>{q.question}</Text>

                      {/* Question Answer Render */}
                      {q.type === 'fill_blank' ? (
                        <View style={styles.inputWrapper}>
                          <TextInput
                            style={[
                              styles.textInput,
                              questionResult &&
                                (isCorrect ? styles.inputCorrect : styles.inputIncorrect),
                            ]}
                            placeholder="Type your answer here..."
                            placeholderTextColor={COLORS.gray[400]}
                            value={questionAnswers[q.id] || ''}
                            onChangeText={(text) => {
                              if (!questionResult) {
                                setQuestionAnswers((prev) => ({ ...prev, [q.id]: text }));
                              }
                            }}
                            editable={!questionResult}
                            autoCapitalize="none"
                            autoCorrect={false}
                          />
                          {questionResult && !isCorrect && (
                            <View style={styles.correctAnswerRow}>
                              <Ionicons
                                name="information-circle-outline"
                                size={14}
                                color="#16A34A"
                              />
                              <Text style={styles.correctAnswerText}>
                                Correct answer:{' '}
                                <Text style={{ fontFamily: FONTS.bold }}>{q.answer}</Text>
                              </Text>
                            </View>
                          )}
                        </View>
                      ) : (
                        <View style={styles.optionsWrapper}>
                          {q.options?.map((opt, optIdx) => {
                            const isSelected = questionAnswers[q.id] === opt;
                            const isCorrectOpt =
                              q.answer.toLowerCase() === opt.toLowerCase() ||
                              (res && res.correctAnswer.toLowerCase() === opt.toLowerCase());

                            let optionStyle: any = styles.optionItem;
                            let optionTextStyle: any = styles.optionText;

                            if (isSelected && !questionResult) {
                              optionStyle = [styles.optionItem, styles.optionSelected];
                              optionTextStyle = [styles.optionText, styles.optionTextSelected];
                            } else if (questionResult) {
                              if (isCorrectOpt) {
                                optionStyle = [styles.optionItem, styles.optionCorrect];
                                optionTextStyle = [styles.optionText, styles.optionTextCorrect];
                              } else if (isSelected && !isCorrect) {
                                optionStyle = [styles.optionItem, styles.optionIncorrect];
                                optionTextStyle = [styles.optionText, styles.optionTextIncorrect];
                              } else {
                                optionStyle = [styles.optionItem, { opacity: 0.5 }];
                              }
                            }

                            return (
                              <TouchableOpacity
                                key={optIdx}
                                style={optionStyle}
                                disabled={!!questionResult}
                                onPress={() => {
                                  setQuestionAnswers((prev) => ({ ...prev, [q.id]: opt }));
                                }}
                              >
                                <View style={styles.optionDotRow}>
                                  <View
                                    style={[
                                      styles.optionDot,
                                      isSelected && styles.optionDotSelected,
                                      questionResult && isCorrectOpt && styles.optionDotCorrect,
                                      questionResult &&
                                        isSelected &&
                                        !isCorrect &&
                                        styles.optionDotIncorrect,
                                    ]}
                                  />
                                  <Text style={optionTextStyle}>{opt}</Text>
                                </View>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  );
                })}

                {/* Question Summary/Footer */}
                {!questionResult ? (
                  <TouchableOpacity
                    style={[
                      styles.submitBtn,
                      Object.keys(questionAnswers).length < questions.length &&
                        styles.submitBtnDisabled,
                    ]}
                    disabled={
                      questionSubmitting || Object.keys(questionAnswers).length < questions.length
                    }
                    onPress={handleSubmitQuestions}
                  >
                    {questionSubmitting ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Text style={styles.submitBtnText}>Submit Answers</Text>
                        <Ionicons name="checkmark-done" size={20} color="#fff" />
                      </>
                    )}
                  </TouchableOpacity>
                ) : (
                  <View style={styles.resultBox}>
                    {questionsCompleted ? (
                      <View style={styles.successWrapper}>
                        <Text style={styles.successEmoji}>🏆</Text>
                        <Text style={styles.successTitle}>Perfect Score!</Text>
                        <Text style={styles.successDesc}>
                          Excellent! You've mastered all vocabulary words and comprehension
                          exercises in this unit.
                        </Text>
                        <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
                          <Text style={styles.doneBtnText}>Return to Unit List</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.retryWrapper}>
                        <Text style={styles.retryTitle}>Almost there!</Text>
                        <Text style={styles.retryDesc}>
                          Review the correct answers above and try again to master this unit.
                        </Text>
                        <TouchableOpacity style={styles.retryBtn} onPress={handleRetryQuestions}>
                          <Text style={styles.retryBtnText}>Try Again</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray[400],
    textAlign: 'center',
    fontFamily: FONTS.regular,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  closeBtn: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontFamily: FONTS.bold, color: COLORS.text },
  headerSub: { fontSize: 12, color: COLORS.gray[400], marginTop: 2, fontFamily: FONTS.medium },

  progressBar: { height: 4, backgroundColor: COLORS.border },
  progressFill: { height: '100%', backgroundColor: '#22C55E' },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: { borderBottomColor: COLORS.primary },
  tabLabel: { fontSize: 13, color: COLORS.gray[400], fontFamily: FONTS.medium },
  tabLabelActive: { color: COLORS.text, fontFamily: FONTS.bold },

  content: { flex: 1 },

  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginTop: 'auto',
    marginBottom: 16,
  },
  skipBtnText: {
    fontSize: 13,
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },

  readingTitle: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 14,
    textAlign: 'center',
  },
  storyCard: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  readingPara: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 26,
    fontFamily: FONTS.regular,
  },
  startExerciseBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startExerciseText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: FONTS.bold,
  },

  exHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  exMainTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scoreBadgePerfect: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  scoreBadgeNormal: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  scoreBadgeText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  questionsList: { gap: 16 },
  questionCard: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qCardCorrect: {
    borderColor: '#BBF7D0',
    backgroundColor: '#F9FDFB',
  },
  qCardIncorrect: {
    borderColor: '#FECACA',
    backgroundColor: '#FFFDFD',
  },
  qNumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  qNum: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.gray[400],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  qText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 16,
    lineHeight: 22,
  },

  inputWrapper: { width: '100%' },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  inputCorrect: {
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
    color: '#16A34A',
  },
  inputIncorrect: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    color: '#EF4444',
  },
  correctAnswerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingLeft: 4,
  },
  correctAnswerText: {
    fontSize: 12,
    color: '#16A34A',
    fontFamily: FONTS.medium,
  },

  optionsWrapper: { gap: 8 },
  optionItem: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
  },
  optionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(255,198,0,0.05)',
  },
  optionCorrect: {
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
  },
  optionIncorrect: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  optionText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  optionTextSelected: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  optionTextCorrect: {
    color: '#16A34A',
    fontFamily: FONTS.bold,
  },
  optionTextCorrectSelected: {
    color: '#16A34A',
    fontFamily: FONTS.bold,
  },
  optionTextIncorrect: {
    color: '#EF4444',
    fontFamily: FONTS.bold,
  },
  optionDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray[300],
  },
  optionDotSelected: {
    backgroundColor: COLORS.primary,
  },
  optionDotCorrect: {
    backgroundColor: '#16A34A',
  },
  optionDotIncorrect: {
    backgroundColor: '#EF4444',
  },

  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnDisabled: {
    backgroundColor: COLORS.gray[200],
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  resultBox: {
    marginTop: 16,
  },
  successWrapper: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  successEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: '#16A34A',
    marginBottom: 6,
  },
  successDesc: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.gray[600],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  doneBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#fff',
    fontFamily: FONTS.bold,
    fontSize: 14,
  },

  retryWrapper: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  retryTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: '#D97706',
    marginBottom: 6,
  },
  retryDesc: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.gray[600],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: '#D97706',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  retryBtnText: {
    color: '#fff',
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
});
