import React, { useEffect, useState, useCallback } from 'react';
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
import { grammarApi } from '@/services/ielts.api';

type Tab = 'theory' | 'exercises';

const LEVEL_COLOR: Record<string, string> = {
  Elementary: '#EF4444',
  Intermediate: '#3B82F6',
  Advanced: '#7C3AED',
};

// ─── Theory tab ───────────────────────────────────────────────────────────────
function TheoryTab({ unit }: { unit: any }) {
  // Supports: explanation (string), examples (string[]), notes (string)
  const explanation: string = unit.explanation ?? unit.theory ?? '';
  const examples: string[] = unit.examples ?? [];
  const notes: string = unit.notes ?? '';

  if (!explanation && examples.length === 0) {
    return (
      <View style={th.empty}>
        <Text style={{ fontSize: 32 }}>📖</Text>
        <Text style={th.emptyText}>No theory content yet for this unit.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Explanation */}
      {!!explanation && (
        <View style={th.block}>
          <View style={th.blockHeader}>
            <Ionicons name="document-text-outline" size={14} color={COLORS.primary} />
            <Text style={th.blockTitle}>Explanation</Text>
          </View>
          <Text style={th.explanation}>{explanation}</Text>
        </View>
      )}

      {/* Examples */}
      {examples.length > 0 && (
        <View style={th.block}>
          <View style={th.blockHeader}>
            <Ionicons name="chatbubble-outline" size={14} color="#059669" />
            <Text style={[th.blockTitle, { color: '#059669' }]}>Examples</Text>
          </View>
          {examples.map((ex, i) => (
            <View key={i} style={th.exampleRow}>
              <Text style={th.exampleBullet}>→</Text>
              <Text style={th.exampleText}>{ex}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Notes */}
      {!!notes && (
        <View style={[th.block, th.noteBlock]}>
          <View style={th.blockHeader}>
            <Ionicons name="information-circle-outline" size={14} color="#D97706" />
            <Text style={[th.blockTitle, { color: '#D97706' }]}>Note</Text>
          </View>
          <Text style={th.noteText}>{notes}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const th = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.xl,
  },
  emptyText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, textAlign: 'center' },
  block: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noteBlock: { backgroundColor: '#FFFBEB', borderColor: '#D97706' + '40' },
  blockHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.sm },
  blockTitle: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold, color: COLORS.primary },
  explanation: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 24 },
  exampleRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: 4 },
  exampleBullet: { fontSize: FONT_SIZES.sm, color: '#059669', fontFamily: FONTS.bold },
  exampleText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  noteText: { fontSize: FONT_SIZES.sm, color: '#92400E', lineHeight: 22 },
});

// ─── Exercises tab ────────────────────────────────────────────────────────────
function ExercisesTab({ exercises }: { exercises: any[] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const pick = (exId: string, opt: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [exId]: opt }));
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < exercises.length) {
      Alert.alert('Incomplete', 'Please answer all questions first.');
      return;
    }
    let correct = 0;
    exercises.forEach((ex) => {
      if (answers[ex.id] === ex.correctAnswer) correct++;
    });
    const pct = Math.round((correct / exercises.length) * 100);
    setScore(pct);
    setSubmitted(true);
  };

  if (exercises.length === 0) {
    return (
      <View style={ex.empty}>
        <Text style={{ fontSize: 32 }}>🚧</Text>
        <Text style={ex.emptyText}>No exercises for this unit yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      {submitted && (
        <View style={[ex.resultBanner, { backgroundColor: score >= 70 ? '#ECFDF5' : '#FEF2F2' }]}>
          <Text style={[ex.resultScore, { color: score >= 70 ? '#059669' : '#EF4444' }]}>
            {score}%
          </Text>
          <Text style={ex.resultLabel}>{score >= 70 ? '✨ Well done!' : 'Keep practicing!'}</Text>
        </View>
      )}

      {exercises.map((exercise, idx) => {
        const chosen = answers[exercise.id];
        const options: string[] = exercise.options ?? [];
        return (
          <View key={exercise.id} style={ex.card}>
            <Text style={ex.qText}>
              {idx + 1}. {exercise.question}
            </Text>
            {options.map((opt) => {
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
                  onPress={() => pick(exercise.id, opt)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      ex.optText,
                      isCorrect && { color: '#059669' },
                      isWrong && { color: '#EF4444' },
                    ]}
                  >
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
      {submitted && (
        <TouchableOpacity
          style={[ex.submitBtn, { backgroundColor: '#64748B' }]}
          onPress={() => {
            setAnswers({});
            setSubmitted(false);
            setScore(0);
          }}
        >
          <Text style={ex.submitTxt}>Try Again</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const ex = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.xl,
  },
  emptyText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, textAlign: 'center' },
  resultBanner: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  resultScore: { fontSize: 40, fontFamily: FONTS.bold },
  resultLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  card: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  optSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '0D' },
  optCorrect: { borderColor: '#059669', backgroundColor: '#ECFDF5' },
  optWrong: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  optText: { fontSize: FONT_SIZES.sm, color: COLORS.text, flex: 1 },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.md + 2,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  submitTxt: { color: '#fff', fontFamily: FONTS.bold, fontSize: FONT_SIZES.md },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function IeltsGrammarLessonScreen() {
  const router = useRouter();
  const { bookSlug, unitId } = useLocalSearchParams<{ bookSlug: string; unitId: string }>();

  const [unit, setUnit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('theory');

  const load = useCallback(async () => {
    try {
      const data = await grammarApi.getUnit(unitId!);
      setUnit(data);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [unitId]);

  useEffect(() => {
    load();
  }, [load]);

  const accentColor = LEVEL_COLOR[unit?.book?.level] ?? COLORS.primary;
  const exercises: any[] = unit?.exercises ?? [];

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'theory', label: 'Theory', icon: 'document-text-outline' },
    { key: 'exercises', label: 'Exercises', icon: 'pencil-outline' },
  ];

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: accentColor }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle} numberOfLines={1}>
            {loading ? 'Loading…' : (unit?.title ?? 'Lesson')}
          </Text>
          {unit?.book?.name && (
            <Text style={s.headerSub} numberOfLines={1}>
              {unit.book.name}
            </Text>
          )}
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Tab bar */}
      <View style={s.tabBar}>
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[s.tabItem, active && { borderBottomColor: accentColor }]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons name={tab.icon} size={15} color={active ? accentColor : COLORS.textMuted} />
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

      {/* Content */}
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={accentColor} />
        </View>
      ) : (
        <View style={s.content}>
          {activeTab === 'theory' && <TheoryTab unit={unit} />}
          {activeTab === 'exercises' && <ExercisesTab exercises={exercises} />}
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold, color: '#fff' },
  headerSub: { fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
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
    gap: 5,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  badge: { borderRadius: RADIUS.full, paddingHorizontal: 5, paddingVertical: 1, marginLeft: 2 },
  badgeText: { fontSize: 9, color: '#fff', fontFamily: FONTS.bold },
  content: { flex: 1, padding: SPACING.lg },
});
