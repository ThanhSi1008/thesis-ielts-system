import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS } from '@/constants';
import { grammarApi } from '@/services';
import type { GrammarUnitWithContent } from '@/types';
import { Breadcrumb } from '@/components';

type Tab = 'theory' | 'exercises';

const LEVEL_COLOR: Record<string, string> = {
  Elementary: '#10b981',
  Intermediate: '#3b82f6',
  Advanced: '#fbbf24',
};

// ─── Theory Tab Component ──────────────────────────────────────────────────
function TheoryTab({ unit, onComplete }: { unit: any; onComplete: () => void }) {
  const explanation = unit.explanation ?? unit.theory ?? unit.theoryContent ?? '';
  const examples: string[] = unit.examples ?? [];
  const notes = unit.notes ?? '';

  useEffect(() => {
    // Gracefully mark theory as completed when viewed
    onComplete();
  }, [onComplete]);

  if (!explanation && examples.length === 0) {
    return (
      <View style={th.empty}>
        <Ionicons name="book-outline" size={48} color={COLORS.gray[300]} />
        <Text style={th.emptyText}>No theory content yet for this unit.</Text>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Explanation */}
      {!!explanation && (
        <View style={th.block}>
          <View style={th.blockHeader}>
            <Ionicons name="document-text-outline" size={16} color={COLORS.textSecondary} />
            <Text style={th.blockTitle}>Explanation</Text>
          </View>
          <Text style={th.explanation}>{explanation}</Text>
        </View>
      )}

      {/* Examples */}
      {examples.length > 0 && (
        <View style={th.block}>
          <View style={th.blockHeader}>
            <Ionicons name="chatbubbles-outline" size={16} color="#059669" />
            <Text style={[th.blockTitle, { color: '#059669' }]}>Examples</Text>
          </View>
          {examples.map((exText, i) => (
            <View key={i} style={th.exampleRow}>
              <Text style={th.exampleBullet}>→</Text>
              <Text style={th.exampleText}>{exText}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Notes */}
      {!!notes && (
        <View style={[th.block, th.noteBlock]}>
          <View style={th.blockHeader}>
            <Ionicons name="information-circle-outline" size={16} color="#D97706" />
            <Text style={[th.blockTitle, { color: '#92400E' }]}>Important Note</Text>
          </View>
          <Text style={th.noteText}>{notes}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const th = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontFamily: FONTS.medium,
  },
  block: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noteBlock: { backgroundColor: '#FFFBEB', borderColor: 'rgba(217, 119, 6, 0.25)' },
  blockHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  blockTitle: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  explanation: { fontSize: 14, color: COLORS.text, lineHeight: 24, fontFamily: FONTS.medium },
  exampleRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  exampleBullet: { fontSize: 14, color: '#059669', fontFamily: FONTS.bold },
  exampleText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
    fontStyle: 'italic',
    fontFamily: FONTS.medium,
  },
  noteText: { fontSize: 14, color: '#92400E', lineHeight: 22, fontFamily: FONTS.medium },
});

// ─── Exercises Tab Component ────────────────────────────────────────────────
function ExercisesTab({
  exercises,
  onSubmitScore,
}: {
  exercises: any[];
  onSubmitScore: (correct: number) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showAnswerMap, setShowAnswerMap] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const selectOption = (exId: string, opt: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [exId]: opt }));
  };

  const toggleShowAnswer = (exId: string) => {
    setShowAnswerMap((prev) => ({ ...prev, [exId]: !prev[exId] }));
  };

  const handleSubmit = () => {
    const isMultipleChoice = exercises.some((e) => e.options && e.options.length > 0);

    if (isMultipleChoice && Object.keys(answers).length < exercises.length) {
      Alert.alert('Incomplete Answers', 'Please reply to all questions before submitting.');
      return;
    }

    let correct = 0;
    exercises.forEach((exItem) => {
      const correctAns = exItem.correctAnswer ?? exItem.answer;
      if (answers[exItem.id]?.trim().toLowerCase() === correctAns?.trim().toLowerCase()) {
        correct++;
      }
    });

    const percentage = Math.round((correct / exercises.length) * 100);
    setScore(percentage);
    setSubmitted(true);
    onSubmitScore(correct);
  };

  if (exercises.length === 0) {
    return (
      <View style={ex.empty}>
        <Ionicons name="construct-outline" size={48} color={COLORS.gray[300]} />
        <Text style={ex.emptyText}>No exercises available for this unit yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      {submitted && (
        <View style={[ex.resultBanner, { backgroundColor: score >= 70 ? '#ECFDF5' : '#FEF2F2' }]}>
          <Text style={[ex.resultScore, { color: score >= 70 ? '#059669' : '#EF4444' }]}>
            {score}%
          </Text>
          <Text style={ex.resultLabel}>
            {score >= 70 ? '✨ Excellent work!' : 'Keep practicing!'}
          </Text>
        </View>
      )}

      {exercises.map((exercise, idx) => {
        const chosen = answers[exercise.id];
        const correctAns = exercise.correctAnswer ?? exercise.answer;
        const options: string[] = exercise.options ?? [];
        const hasOptions = options.length > 0;

        return (
          <View key={exercise.id} style={ex.card}>
            <View style={ex.qHeader}>
              <Text style={ex.qBadge}>QUESTION {idx + 1}</Text>
            </View>
            <Text style={ex.qText}>{exercise.question}</Text>

            {hasOptions ? (
              // Multiple Choice
              options.map((opt) => {
                const isChosen = chosen === opt;
                const isCorrect = submitted && opt === correctAns;
                const isWrong = submitted && isChosen && opt !== correctAns;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      ex.option,
                      isChosen && !submitted && ex.optSelected,
                      isCorrect && ex.optCorrect,
                      isWrong && ex.optWrong,
                    ]}
                    onPress={() => selectOption(exercise.id, opt)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        ex.optText,
                        isCorrect && { color: '#059669', fontFamily: FONTS.bold },
                        isWrong && { color: '#EF4444', fontFamily: FONTS.bold },
                      ]}
                    >
                      {opt}
                    </Text>
                    {isCorrect && <Ionicons name="checkmark-circle" size={16} color="#059669" />}
                    {isWrong && <Ionicons name="close-circle" size={16} color="#EF4444" />}
                  </TouchableOpacity>
                );
              })
            ) : (
              // Fill-in-the-blank or Free response toggleable helper
              <View style={ex.toggleAnswerContainer}>
                <TouchableOpacity
                  style={ex.toggleAnswerBtn}
                  onPress={() => toggleShowAnswer(exercise.id)}
                  activeOpacity={0.85}
                >
                  <Text style={ex.toggleAnswerBtnText}>
                    {showAnswerMap[exercise.id] ? 'Hide Answer' : 'Show Answer'}
                  </Text>
                  <Ionicons
                    name={showAnswerMap[exercise.id] ? 'eye-off-outline' : 'eye-outline'}
                    size={16}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>

                {showAnswerMap[exercise.id] && (
                  <View style={ex.answerBlock}>
                    <Text style={ex.answerTitle}>Correct Answer:</Text>
                    <Text style={ex.answerText}>{correctAns}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        );
      })}

      {/* Submit or Reset Trigger */}
      {exercises.some((e) => e.options && e.options.length > 0) && (
        <View style={{ marginTop: 8 }}>
          {!submitted ? (
            <TouchableOpacity style={ex.submitBtn} onPress={handleSubmit}>
              <Text style={ex.submitTxt}>Submit Answers</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[ex.submitBtn, { backgroundColor: '#64748B' }]}
              onPress={() => {
                setAnswers({});
                setSubmitted(false);
                setScore(0);
              }}
            >
              <Text style={ex.submitTxt}>Reset Quiz</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const ex = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontFamily: FONTS.medium,
  },
  resultBanner: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  resultScore: { fontSize: 36, fontFamily: FONTS.bold },
  resultLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontFamily: FONTS.medium,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qHeader: { marginBottom: 6 },
  qBadge: { fontSize: 9, fontFamily: FONTS.bold, color: COLORS.gray[400], letterSpacing: 0.8 },
  qText: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 14,
    lineHeight: 22,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  optSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '0D' },
  optCorrect: { borderColor: '#059669', backgroundColor: '#ECFDF5' },
  optWrong: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  optText: { fontSize: 14, color: COLORS.text, flex: 1, fontFamily: FONTS.medium },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  submitTxt: { color: COLORS.text, fontFamily: FONTS.bold, fontSize: 14 },

  toggleAnswerContainer: { marginTop: 4 },
  toggleAnswerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleAnswerBtnText: { color: COLORS.text, fontFamily: FONTS.bold, fontSize: 12 },
  answerBlock: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A5D6A7',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  answerTitle: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: '#1B5E20',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  answerText: { fontSize: 14, fontFamily: FONTS.bold, color: '#2E7D32' },
});

// ─── Main Screen Component ─────────────────────────────────────────────────
export default function GrammarLessonScreen() {
  const router = useRouter();
  const { bookSlug, unitId } = useLocalSearchParams<{ bookSlug: string; unitId: string }>();

  const [unit, setUnit] = useState<GrammarUnitWithContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('theory');

  const loadingBreadcrumb = useMemo(() => [
    { label: 'IELTS', route: '/(tabs)/ielts' },
    { label: 'Grammar', route: '/ielts/foundation/grammar' },
    { label: 'Loading...' }
  ], []);

  const breadcrumbItems = useMemo(() => [
    { label: 'IELTS', route: '/(tabs)/ielts' },
    { label: 'Grammar', route: '/ielts/foundation/grammar' },
    { label: unit?.book?.name ?? 'Book', route: `/ielts/foundation/grammar/${bookSlug}` },
    { label: unit?.title ?? 'Unit' }
  ], [unit, bookSlug]);

  const load = useCallback(async () => {
    if (!unitId) return;
    try {
      const data = await grammarApi.getUnit(unitId);
      setUnit(data);
    } catch (err) {
      if (__DEV__) console.error(err);
    } finally {
      setLoading(false);
    }
  }, [unitId]);

  useEffect(() => {
    load();
  }, [load]);

  const markTheoryComplete = useCallback(async () => {
    if (!unitId) return;
    try {
      await grammarApi.updateProgress(unitId, { theoryCompleted: true });
    } catch {
      /* silent progress update */
    }
  }, [unitId]);

  const submitExerciseScore = useCallback(
    async (correct: number) => {
      if (!unitId || !unit) return;
      try {
        await grammarApi.updateProgress(unitId, {
          exerciseScore: correct,
          exerciseTotal: unit.exercises.length,
        });
      } catch {
        /* silent progress update */
      }
    },
    [unitId, unit],
  );

  const accentColor =
    LEVEL_COLOR[
      unit?.book?.name
        ? unit.book.name.includes('Advanced')
          ? 'Advanced'
          : unit.book.name.includes('Intermediate')
            ? 'Intermediate'
            : 'Elementary'
        : ''
    ] ?? COLORS.primary;
  const exercises = unit?.exercises ?? [];

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'theory', label: 'Theory Notes', icon: 'book-outline' },
    { key: 'exercises', label: 'Practice Quiz', icon: 'pencil-outline' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <View style={s.headerContainer}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Breadcrumb items={loadingBreadcrumb} />
            <Text style={s.headerTitle} numberOfLines={1}>
              Loading...
            </Text>
          </View>
        </View>
        <View style={s.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!unit) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <View style={s.headerContainer}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Breadcrumb items={loadingBreadcrumb} />
            <Text style={s.headerTitle} numberOfLines={1}>
              Not Found
            </Text>
          </View>
        </View>
        <View style={s.center}>
          <Text style={s.emptyText}>Lesson not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={s.container}>
      {/* Header */}
      <SafeAreaView style={[s.headerWrapper, { backgroundColor: '#fff', borderBottomColor: '#f0f0f0', borderBottomWidth: 1 }]} edges={['top']}>
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <View style={s.headerTitleCol}>
            <Breadcrumb items={breadcrumbItems} />
            <Text style={s.headerTitle} numberOfLines={1}>
              {unit.title}
            </Text>
          </View>
          <View style={[s.headerBadge, { backgroundColor: accentColor + '15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexDirection: 'column', alignItems: 'center' }]}>
            <Text style={[s.headerBadgeVal, { color: accentColor, fontFamily: FONTS.bold }]}>{unit.order ?? 1}</Text>
            <Text style={[s.headerBadgeLbl, { color: accentColor, fontFamily: FONTS.regular, fontSize: 8 }]}>UNIT</Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Tabs */}
      <View style={s.tabBar}>
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[s.tabItem, active && { borderBottomColor: accentColor }]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.8}
            >
              <Ionicons name={tab.icon} size={15} color={active ? accentColor : COLORS.gray[400]} />
              <Text style={[s.tabLabel, active && { color: accentColor, fontFamily: FONTS.bold }]}>
                {tab.label}
              </Text>
              {tab.key === 'exercises' && exercises.length > 0 && (
                <View style={[s.badge, { backgroundColor: accentColor }]}>
                  <Text style={s.badgeText}>{exercises.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab Contents */}
      <View style={s.content}>
        {activeTab === 'theory' ? (
          <TheoryTab unit={unit} onComplete={markTheoryComplete} />
        ) : (
          <ExercisesTab exercises={exercises} onSubmitScore={submitExerciseScore} />
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: '#fff',
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnWhite: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, marginLeft: 12 },
  headerEyebrow: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: COLORS.gray[400],
  },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.text, letterSpacing: -0.1 },

  headerWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 8,
  },
  headerTitleCol: { flex: 1 },
  headerBadge: { alignItems: 'center' },
  headerBadgeVal: { fontFamily: FONTS.bold, fontSize: 14 },
  headerBadgeLbl: {
    fontFamily: FONTS.regular,
    fontSize: 8,
    letterSpacing: 0.5,
    marginTop: 1,
  },
  headerEyebrowWhite: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: 'rgba(255,255,255,0.7)',
  },
  headerTitleWhite: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#fff',
    letterSpacing: -0.1,
  },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
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
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabLabel: { fontSize: 12, color: COLORS.gray[400], fontFamily: FONTS.semibold },
  badge: { borderRadius: RADIUS.full, paddingHorizontal: 6, paddingVertical: 1, marginLeft: 4 },
  badgeText: { fontSize: 9, color: '#fff', fontFamily: FONTS.bold },
  content: { flex: 1, padding: 14 },
  emptyText: { fontSize: 13, color: COLORS.textSecondary, fontFamily: FONTS.medium },
});
