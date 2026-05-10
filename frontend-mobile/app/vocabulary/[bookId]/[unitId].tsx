import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Animated, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS } from '@/constants';
import { vocabularyApi } from '@/services/ielts.api';

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'flashcard' | 'exercise' | 'reading';

interface Word {
  id: string;
  word: string;
  pronunciation?: string;
  partOfSpeech?: string;
  definition: string;
  exampleSentence?: string;
  imageUrl?: string;
}

interface Exercise {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface Question {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  isInput?: boolean;
}

// ─── Flashcard component ──────────────────────────────────────────────────────
function FlashCard({ word, onKnow, onLearn }: { word: Word; onKnow: () => void; onLearn: () => void }) {
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [flipped, setFlipped] = useState(false);

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  const flip = () => {
    Animated.spring(flipAnim, {
      toValue: flipped ? 0 : 1,
      friction: 7, tension: 12, useNativeDriver: true,
    }).start();
    setFlipped(!flipped);
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
        <Animated.View style={[fc.card, fc.cardFront, { transform: [{ rotateY: frontRotate }] }]}>
          <Text style={fc.hint}>Tap to reveal</Text>
          <Text style={fc.word}>{word.word}</Text>
          {word.pronunciation && <Text style={fc.pron}>{word.pronunciation}</Text>}
          {word.partOfSpeech && (
            <View style={fc.posBadge}>
              <Text style={fc.posText}>{word.partOfSpeech}</Text>
            </View>
          )}
        </Animated.View>
        {/* Back */}
        <Animated.View style={[fc.card, fc.cardBack, { transform: [{ rotateY: backRotate }] }]}>
          <Text style={fc.definition}>{word.definition}</Text>
          {word.exampleSentence && (
            <Text style={fc.example}>→ {word.exampleSentence}</Text>
          )}
        </Animated.View>
      </TouchableOpacity>

      {/* Action buttons (only visible when flipped) */}
      {flipped && (
        <View style={fc.actions}>
          <TouchableOpacity style={[fc.btn, fc.btnLearn]} onPress={onLearn}>
            <Ionicons name="bookmark-outline" size={16} color="#EF4444" />
            <Text style={[fc.btnTxt, { color: '#EF4444' }]}>Review Later</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[fc.btn, fc.btnKnow]} onPress={onKnow}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#059669" />
            <Text style={[fc.btnTxt, { color: '#059669' }]}>I Know It!</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
const fc = StyleSheet.create({
  wrap: { flex: 1 },
  card: {
    flex: 1, borderRadius: RADIUS.xl, padding: SPACING.xl,
    alignItems: 'center', justifyContent: 'center',
    backfaceVisibility: 'hidden', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  cardFront: { backgroundColor: '#fff', borderWidth: 2, borderColor: COLORS.border },
  cardBack: { backgroundColor: '#1E293B' },
  hint: { fontSize: 10, color: COLORS.textMuted, marginBottom: SPACING.lg, fontFamily: FONTS.regular },
  word: { fontSize: 36, fontFamily: FONTS.bold, color: COLORS.text, textAlign: 'center' },
  pron: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: SPACING.sm },
  posBadge: { marginTop: SPACING.md, backgroundColor: COLORS.primary + '18', borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 3 },
  posText: { fontSize: 10, color: COLORS.primary, fontFamily: FONTS.bold, textTransform: 'uppercase' },
  definition: { fontSize: FONT_SIZES.lg, color: '#fff', textAlign: 'center', lineHeight: 28, fontFamily: FONTS.bold },
  example: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.65)', textAlign: 'center', marginTop: SPACING.lg, lineHeight: 22 },
  actions: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.lg },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: RADIUS.xl, borderWidth: 1.5 },
  btnLearn: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  btnKnow: { borderColor: '#059669', backgroundColor: '#ECFDF5' },
  btnTxt: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold },
});

// ─── Exercise component ───────────────────────────────────────────────────────
function ExerciseTab({
  exercises,
  onSubmit,
}: {
  exercises: Exercise[];
  onSubmit: (answers: { exerciseId: string; answer: string }[], score: number) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (exId: string, option: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [exId]: option }));
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < exercises.length) {
      Alert.alert('Incomplete', 'Please answer all questions before submitting.');
      return;
    }
    let correct = 0;
    exercises.forEach(ex => { if (answers[ex.id] === ex.correctAnswer) correct++; });
    const pct = Math.round((correct / exercises.length) * 100);
    setScore(pct);
    setSubmitted(true);
    onSubmit(exercises.map(ex => ({ exerciseId: ex.id, answer: answers[ex.id] ?? '' })), pct);
  };

  if (exercises.length === 0) {
    return (
      <View style={ex.empty}>
        <Text style={{ fontSize: 32 }}>🚧</Text>
        <Text style={ex.emptyText}>No exercises available for this unit yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      {submitted && (
        <View style={[ex.resultBanner, { backgroundColor: score >= 70 ? '#ECFDF5' : '#FEF2F2' }]}>
          <Text style={[ex.resultScore, { color: score >= 70 ? '#059669' : '#EF4444' }]}>{score}%</Text>
          <Text style={ex.resultLabel}>{score >= 70 ? 'Great job! 🎉' : 'Keep practicing!'}</Text>
        </View>
      )}
      {exercises.map((exercise, idx) => {
        const chosen = answers[exercise.id];
        return (
          <View key={exercise.id} style={ex.qCard}>
            <Text style={ex.qText}>{idx + 1}. {exercise.question}</Text>
            {exercise.options.map(opt => {
              const isChosen = chosen === opt;
              const isCorrect = submitted && opt === exercise.correctAnswer;
              const isWrong = submitted && isChosen && opt !== exercise.correctAnswer;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[
                    ex.option,
                    isChosen && !submitted && ex.optSelected,
                    isCorrect && ex.optCorrect,
                    isWrong && ex.optWrong,
                  ]}
                  onPress={() => handleSelect(exercise.id, opt)}
                  activeOpacity={0.8}
                >
                  <Text style={[ex.optText, isCorrect && { color: '#059669' }, isWrong && { color: '#EF4444' }]}>
                    {opt}
                  </Text>
                  {isCorrect && <Ionicons name="checkmark-circle" size={16} color="#059669" />}
                  {isWrong && <Ionicons name="close-circle" size={16} color="#EF4444" />}
                </TouchableOpacity>
              );
            })}
          </View>
        );
      })}
      {!submitted && (
        <TouchableOpacity style={ex.submitBtn} onPress={handleSubmit}>
          <Text style={ex.submitTxt}>Submit Answers</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
const ex = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, padding: SPACING.xl },
  emptyText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, textAlign: 'center' },
  resultBanner: { borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.lg, alignItems: 'center' },
  resultScore: { fontSize: 40, fontFamily: FONTS.bold },
  resultLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  qCard: { backgroundColor: '#fff', borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  qText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SPACING.md, lineHeight: 20 },
  option: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.sm,
  },
  optSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '0D' },
  optCorrect: { borderColor: '#059669', backgroundColor: '#ECFDF5' },
  optWrong: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  optText: { fontSize: FONT_SIZES.sm, color: COLORS.text, flex: 1 },
  submitBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.xl, padding: SPACING.md + 2,
    alignItems: 'center', marginTop: SPACING.md,
  },
  submitTxt: { color: '#fff', fontFamily: FONTS.bold, fontSize: FONT_SIZES.md },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function VocabularyUnitScreen() {
  const router = useRouter();
  const { bookId, unitId } = useLocalSearchParams<{ bookId: string; unitId: string }>();

  const [unit, setUnit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('flashcard');

  // Flashcard state
  const [cardIndex, setCardIndex] = useState(0);
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    try {
      const data = await vocabularyApi.getUnit(unitId!);
      setUnit(data);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [unitId]);

  useEffect(() => { load(); }, [load]);

  // ── Flashcard handlers
  const words: Word[] = unit?.words ?? [];
  const exercises: Exercise[] = unit?.exercises ?? [];

  const handleKnow = async () => {
    const word = words[cardIndex];
    const newKnown = new Set(knownIds);
    newKnown.add(word.id);
    setKnownIds(newKnown);
    try {
      await vocabularyApi.updateWordProgress(unitId!, newKnown.size);
    } catch { /* silent */ }
    if (cardIndex < words.length - 1) setCardIndex(cardIndex + 1);
    else Alert.alert('🎉 Unit Complete!', `You learned ${newKnown.size}/${words.length} words!`, [
      { text: 'Try Exercises', onPress: () => setActiveTab('exercise') },
      { text: 'Done' },
    ]);
  };

  const handleLearn = () => {
    if (cardIndex < words.length - 1) setCardIndex(cardIndex + 1);
  };

  const handleExerciseSubmit = async (answers: { exerciseId: string; answer: string }[], score: number) => {
    try { await vocabularyApi.submitExercise(unitId!, answers); } catch { /* silent */ }
  };

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'flashcard', label: 'Flashcards', icon: 'albums-outline' },
    { key: 'exercise', label: 'Exercises', icon: 'pencil-outline' },
    { key: 'reading', label: 'Reading', icon: 'book-outline' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Loading…</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      </SafeAreaView>
    );
  }

  const reading = unit?.reading;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle} numberOfLines={1}>{unit?.title ?? 'Unit'}</Text>
          <Text style={s.headerSub}>{unit?.book?.name ?? ''}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Tab bar */}
      <View style={s.tabBar}>
        {tabs.map(tab => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[s.tabItem, active && s.tabItemActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons name={tab.icon} size={16} color={active ? COLORS.primary : COLORS.textMuted} />
              <Text style={[s.tabLabel, active && s.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      <View style={s.content}>
        {/* ── Flashcard tab */}
        {activeTab === 'flashcard' && (
          words.length === 0 ? (
            <View style={s.center}>
              <Text style={{ fontSize: 32 }}>📭</Text>
              <Text style={s.emptyText}>No flashcards available yet.</Text>
            </View>
          ) : (
            <View style={{ flex: 1, padding: SPACING.lg }}>
              {/* Progress */}
              <View style={s.fcProgress}>
                <Text style={s.fcProgressText}>{cardIndex + 1} / {words.length}</Text>
                <Text style={s.fcKnownText}>{knownIds.size} known</Text>
              </View>
              <View style={s.fcTrack}>
                <View style={[s.fcFill, { width: `${((cardIndex + 1) / words.length) * 100}%` }]} />
              </View>

              <View style={{ flex: 1, marginTop: SPACING.md }}>
                <FlashCard
                  word={words[cardIndex]}
                  onKnow={handleKnow}
                  onLearn={handleLearn}
                />
              </View>

              {/* Nav arrows */}
              <View style={s.fcNav}>
                <TouchableOpacity
                  style={[s.navBtn, cardIndex === 0 && { opacity: 0.3 }]}
                  onPress={() => cardIndex > 0 && setCardIndex(cardIndex - 1)}
                >
                  <Ionicons name="arrow-back" size={20} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={s.navHint}>Tap card to flip</Text>
                <TouchableOpacity
                  style={[s.navBtn, cardIndex >= words.length - 1 && { opacity: 0.3 }]}
                  onPress={() => cardIndex < words.length - 1 && setCardIndex(cardIndex + 1)}
                >
                  <Ionicons name="arrow-forward" size={20} color={COLORS.text} />
                </TouchableOpacity>
              </View>
            </View>
          )
        )}

        {/* ── Exercise tab */}
        {activeTab === 'exercise' && (
          <View style={{ flex: 1, padding: SPACING.lg }}>
            <ExerciseTab exercises={exercises} onSubmit={handleExerciseSubmit} />
          </View>
        )}

        {/* ── Reading tab */}
        {activeTab === 'reading' && (
          !reading ? (
            <View style={s.center}>
              <Text style={{ fontSize: 32 }}>📖</Text>
              <Text style={s.emptyText}>No reading passage for this unit.</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 40 }}>
              <Text style={s.readingTitle}>{reading.title}</Text>
              {(reading.paragraphs ?? reading.text ?? []).map((para: string, i: number) => (
                <Text key={i} style={s.readingPara}>{para}</Text>
              ))}
            </ScrollView>
          )
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  emptyText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, textAlign: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    backgroundColor: '#fff', borderBottomWidth: 1, borderColor: COLORS.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold, color: COLORS.text },
  headerSub: { fontSize: 10, color: COLORS.textSecondary, marginTop: 1 },
  tabBar: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderBottomWidth: 1, borderColor: COLORS.border,
  },
  tabItem: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: SPACING.sm, borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabItemActive: { borderBottomColor: COLORS.primary },
  tabLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  tabLabelActive: { color: COLORS.primary, fontFamily: FONTS.bold },
  content: { flex: 1 },
  // Flashcard
  fcProgress: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  fcProgressText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold, color: COLORS.text },
  fcKnownText: { fontSize: FONT_SIZES.xs, color: '#059669', fontFamily: FONTS.bold },
  fcTrack: { height: 4, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden' },
  fcFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 2 },
  fcNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING.md },
  navBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  navHint: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  // Reading
  readingTitle: { fontSize: FONT_SIZES.xl, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SPACING.lg },
  readingPara: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 24, marginBottom: SPACING.md },
});
