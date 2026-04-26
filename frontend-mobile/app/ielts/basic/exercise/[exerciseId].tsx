import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, TextInput, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { apiClient } from '@/services/api-client';

/* ─── Types (from SharedExerciseTypes.ts) ─── */
interface MCOption { letter: string; text: string; }
interface MCQuestion {
  question_number: number;
  text: string;
  options: MCOption[];
  answer: string;
  explanation?: string;
}
interface ContentGroup {
  type: string;
  questions?: MCQuestion[];
  question_numbers?: number[];
  options?: MCOption[];
  answers?: string[];
  instructions?: string;
  points?: any[];
  rows?: any[];
  steps?: any[];
  items?: any[];
  passage?: string;
  [key: string]: unknown;
}
interface Exercise {
  id: string;
  topic?: string;
  audioUrl?: string;
  passage?: string;
  content: ContentGroup[];
}

/* ─── Score calculation (port of SharedScoreUtils.ts) ─── */
function calcScore(content: ContentGroup[], answers: Record<string | number, string>): number {
  let s = 0;
  content.forEach((g, gi) => {
    if (g.type === 'multiple_choice_multiple') {
      const correct = new Set((g.answers as string[] ?? []).map(a => a.toUpperCase()));
      const raw = String(answers[`mcm-${gi}`] ?? '');
      const selected = raw ? raw.split(',').map(x => x.toUpperCase()) : [];
      selected.forEach(x => { if (correct.has(x)) s++; });
    } else {
      const qs = Array.isArray(g.questions) ? g.questions : [];
      qs.forEach((q: MCQuestion) => {
        const ua = (answers[q.question_number] ?? '').toUpperCase();
        if (ua === (q.answer ?? '').toUpperCase()) s++;
      });
      // fill-in types: questions w/ text_answer
      if (g.type === 'short_answer' || g.type === 'note_completion' ||
          g.type === 'summary_completion' || g.type === 'diagram_completion') {
        qs.forEach((q: any) => {
          const ua = (answers[q.question_number] ?? '').trim().toLowerCase();
          const acceptable: string[] = q.acceptable_answers
            ? q.acceptable_answers.map((a: string) => a.toLowerCase().trim())
            : [(q.answer ?? '').toLowerCase().trim()];
          if (acceptable.includes(ua)) s++;
        });
      }
    }
  });
  return s;
}

function getTotalQuestions(content: ContentGroup[]): number {
  return content.reduce((acc, g, gi) => {
    if (g.type === 'multiple_choice_multiple') {
      return acc + (g.question_numbers?.length ?? 0);
    }
    return acc + (Array.isArray(g.questions) ? g.questions.length : 0);
  }, 0);
}

/* ─── MCQ Group ─── */
function MCQGroup({ group, answers, submitted, onAnswer }: {
  group: ContentGroup;
  answers: Record<string | number, string>;
  submitted: boolean;
  onAnswer: (qNum: number, letter: string) => void;
}) {
  const questions = (group.questions ?? []) as MCQuestion[];
  return (
    <View>
      {group.instructions && (
        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>{group.instructions}</Text>
        </View>
      )}
      {questions.map((q) => {
        const sel = answers[q.question_number] ?? '';
        return (
          <View key={q.question_number} style={styles.qBlock}>
            <Text style={styles.qNum}>Q{q.question_number}</Text>
            <Text style={styles.qText}>{q.text}</Text>
            {(q.options ?? []).map((opt) => {
              const isSelected = sel === opt.letter;
              const isCorrect = q.answer.toUpperCase() === opt.letter.toUpperCase();
              let bg: string = COLORS.surface, border: string = COLORS.border, textColor: string = COLORS.text;
              if (submitted && isCorrect) { bg = '#DCFCE7'; border = '#86EFAC'; }
              else if (submitted && isSelected && !isCorrect) { bg = '#FEE2E2'; border = '#FCA5A5'; }
              else if (!submitted && isSelected) { bg = '#FFF9E6'; border = '#FCD34D'; }
              return (
                <TouchableOpacity
                  key={opt.letter}
                  style={[styles.option, { backgroundColor: bg, borderColor: border }]}
                  onPress={() => !submitted && onAnswer(q.question_number, opt.letter)}
                  activeOpacity={submitted ? 1 : 0.8}
                >
                  <View style={[styles.bullet, isSelected && !submitted && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}>
                    <Text style={[styles.bulletLetter, isSelected && !submitted && { color: '#fff' }]}>{opt.letter}</Text>
                  </View>
                  <Text style={[styles.optText, { color: textColor }]}>{opt.text}</Text>
                  {submitted && isCorrect && <Ionicons name="checkmark-circle" size={16} color="#16A34A" />}
                  {submitted && isSelected && !isCorrect && <Ionicons name="close-circle" size={16} color="#DC2626" />}
                </TouchableOpacity>
              );
            })}
            {submitted && q.explanation && (
              <View style={[styles.explanation, { backgroundColor: sel.toUpperCase() === q.answer.toUpperCase() ? '#F0FDF4' : '#FEF2F2' }]}>
                <Text style={{ fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 }}>
                  {sel.toUpperCase() === q.answer.toUpperCase() ? '✅ ' : '❌ '}{q.explanation}
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

/* ─── Fill-in Group ─── */
function FillGroup({ group, answers, submitted, onAnswer }: {
  group: ContentGroup;
  answers: Record<string | number, string>;
  submitted: boolean;
  onAnswer: (qNum: number, val: string) => void;
}) {
  const questions = (group.questions ?? group.points ?? []) as any[];
  const TYPE_LABEL: Record<string, string> = {
    short_answer: 'Short Answer',
    note_completion: 'Note Completion',
    summary_completion: 'Summary Completion',
    diagram_completion: 'Diagram Completion',
    flowchart_completion: 'Flowchart Completion',
  };
  return (
    <View>
      <Text style={styles.groupType}>{TYPE_LABEL[group.type] ?? group.type.replace(/_/g, ' ')}</Text>
      {group.instructions && (
        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>{group.instructions}</Text>
        </View>
      )}
      {questions.map((q) => {
        const qNum = q.question_number ?? q.id;
        const val = answers[qNum] ?? '';
        const correct = (q.acceptable_answers ?? [q.answer ?? '']).map((a: string) => a.toLowerCase().trim());
        const isCorrect = submitted && correct.includes(val.trim().toLowerCase());
        return (
          <View key={qNum} style={styles.qBlock}>
            <Text style={styles.qNum}>Q{qNum}</Text>
            <Text style={styles.qText}>{q.text ?? q.question ?? ''}</Text>
            <TextInput
              style={[
                styles.input,
                submitted && isCorrect && { borderColor: '#86EFAC', backgroundColor: '#DCFCE7' },
                submitted && !isCorrect && { borderColor: '#FCA5A5', backgroundColor: '#FEE2E2' },
              ]}
              value={val}
              onChangeText={v => !submitted && onAnswer(qNum, v)}
              placeholder="Your answer…"
              placeholderTextColor={COLORS.textMuted}
              editable={!submitted}
            />
            {submitted && (
              <Text style={{ fontSize: FONT_SIZES.xs, marginTop: 4, color: isCorrect ? '#16A34A' : '#DC2626', fontWeight: '700' }}>
                {isCorrect ? '✅ Correct!' : `❌ Answer: ${q.answer ?? (q.acceptable_answers?.[0] ?? '')}`}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

/* ─── Render a content group by type ─── */
function ContentGroupView({ group, gi, answers, submitted, onAnswer }: {
  group: ContentGroup; gi: number;
  answers: Record<string | number, string>;
  submitted: boolean;
  onAnswer: (key: string | number, val: string) => void;
}) {
  const FILL_TYPES = ['short_answer', 'note_completion', 'summary_completion', 'diagram_completion', 'flowchart_completion'];
  const MCQ_TYPES = ['multiple_choice', 'multiple_choice_single', 'multiple_choice_multiple',
    'true_false_not_given', 'yes_no_not_given', 'matching', 'matching_headings',
    'matching_features', 'matching_information', 'matching_sentence_endings'];

  if (FILL_TYPES.includes(group.type)) {
    return <FillGroup group={group} answers={answers} submitted={submitted} onAnswer={(q, v) => onAnswer(q, v)} />;
  }
  // Default: MCQ
  return <MCQGroup group={group} answers={answers} submitted={submitted} onAnswer={(q, l) => onAnswer(q, l)} />;
}

/* ─── Main Screen ─── */
export default function ExerciseViewerScreen() {
  const router = useRouter();
  const { exerciseId, lessonId, skill } = useLocalSearchParams<{
    exerciseId: string; lessonId?: string; skill: string;
  }>();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string | number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const skillLc = skill?.toLowerCase() ?? '';
        const endpoint = skillLc === 'reading' ? 'reading-exercises'
          : skillLc === 'writing' ? 'writing-exercises'
          : 'listening-exercises';
        const data = await apiClient.get<Exercise>(`/ielts/${endpoint}/${exerciseId}`);
        setExercise(data);
      } catch (e) {
        console.error('Failed to fetch exercise:', e);
      } finally {
        setLoading(false);
      }
    };
    if (exerciseId) fetch();
  }, [exerciseId]);

  const score = useMemo(() =>
    exercise ? calcScore(exercise.content, answers) : 0,
    [exercise, answers, submitted]
  );
  const total = useMemo(() =>
    exercise ? getTotalQuestions(exercise.content) : 0,
    [exercise]
  );
  const isPerfect = submitted && score === total && total > 0;
  const answeredCount = Object.keys(answers).length;

  const setAnswer = (key: string | number, val: string) =>
    setAnswers(prev => ({ ...prev, [key]: val }));

  const handleSubmit = () => {
    Alert.alert('Submit answers?', 'You cannot change answers after submitting.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Submit', onPress: async () => {
          setSubmitted(true);
          const finalScore = exercise ? calcScore(exercise.content, answers) : 0;
          const finalTotal = exercise ? getTotalQuestions(exercise.content) : 0;
          if (finalScore === finalTotal && finalTotal > 0) {
            setMarking(true);
            try {
              const skillLc = skill?.toLowerCase() ?? '';
              const fieldName = skillLc === 'reading' ? 'readingExerciseId'
                : skillLc === 'writing' ? 'writingExerciseId'
                : 'listeningExerciseId';
              await apiClient.post('/ielts/progress/mark-completed', { [fieldName]: exerciseId });
            } catch (e) { console.error('mark-completed failed:', e); }
            finally { setMarking(false); }
          }
        }
      },
    ]);
  };

  const handleNext = async () => {
    try {
      const data = await apiClient.get<{ steps: any[]; currentStep: number }>('/ielts/roadmap');
      let nextItem: any = null;
      for (const step of data.steps ?? []) {
        for (const item of step.items ?? []) {
          if (!item.isCompleted && !item.isLocked) { nextItem = item; break; }
        }
        if (nextItem) break;
      }
      if (nextItem?.type === 'lesson') {
        router.replace(`/ielts/basic/lesson/${nextItem.id}?skill=${nextItem.skill.toLowerCase()}` as any);
      } else if (nextItem) {
        const q = nextItem.lessonId ? `?lessonId=${nextItem.lessonId}&skill=${nextItem.skill.toLowerCase()}` : `?skill=${nextItem.skill.toLowerCase()}`;
        router.replace(`/ielts/basic/exercise/${nextItem.id}${q}` as any);
      } else {
        router.back();
      }
    } catch { router.back(); }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading exercise…</Text>
      </View>
    );
  }
  if (!exercise) {
    return (
      <View style={styles.center}>
        <Text style={{ color: COLORS.error, fontWeight: '700' }}>Exercise not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: SPACING.md }}>
          <Text style={{ color: COLORS.primary }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const skillUpper = (skill ?? '').toUpperCase();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: SPACING.md }}>
          <Text style={styles.breadcrumb}>{skillUpper} · PRACTICE</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>{exercise.topic ?? 'Exercise'}</Text>
        </View>
        {!submitted && (
          <Text style={styles.ansCount}>{answeredCount} / {total}</Text>
        )}
        {submitted && (
          <Text style={[styles.ansCount, { color: isPerfect ? '#16A34A' : '#D97706' }]}>
            {score}/{total} ✓
          </Text>
        )}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Passage (reading) */}
        {exercise.passage && (
          <View style={styles.passageBox}>
            <Text style={styles.passageLabel}>📖 Passage</Text>
            <Text style={styles.passageText}>{exercise.passage}</Text>
          </View>
        )}

        {/* Audio hint for listening */}
        {exercise.audioUrl && (
          <View style={styles.audioHint}>
            <Ionicons name="headset-outline" size={20} color={COLORS.primary} />
            <Text style={styles.audioHintText}>Audio exercise — play audio while answering</Text>
          </View>
        )}

        {/* Content groups */}
        {exercise.content.map((group, gi) => (
          <ContentGroupView
            key={gi}
            group={group}
            gi={gi}
            answers={answers}
            submitted={submitted}
            onAnswer={setAnswer}
          />
        ))}
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        {!submitted ? (
          <TouchableOpacity
            style={[styles.submitBtn, answeredCount === 0 && { opacity: 0.5 }]}
            onPress={handleSubmit}
            disabled={answeredCount === 0}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.text} />
            <Text style={styles.submitText}>Submit Answers</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <View>
              <Text style={[styles.scoreText, { color: isPerfect ? '#16A34A' : '#D97706' }]}>
                {score} / {total} correct
              </Text>
              <Text style={styles.scoreSubtext}>
                {isPerfect ? '🎉 Perfect score!' : `Keep trying — need ${total - score} more`}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
              {!isPerfect && (
                <TouchableOpacity
                  style={styles.retryBtn}
                  onPress={() => { setAnswers({}); setSubmitted(false); }}
                >
                  <Ionicons name="refresh" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              )}
              {isPerfect && (
                <TouchableOpacity style={styles.nextBtn} onPress={handleNext} disabled={marking}>
                  {marking
                    ? <ActivityIndicator size="small" color={COLORS.text} />
                    : <>
                        <Text style={styles.nextText}>Next Step</Text>
                        <Ionicons name="chevron-forward" size={14} color={COLORS.text} />
                      </>
                  }
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  loadingText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    backgroundColor: '#fff', borderBottomWidth: 1, borderColor: COLORS.border,
  },
  breadcrumb: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text, marginTop: 2 },
  ansCount: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: COLORS.primary },

  passageBox: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.border,
    padding: SPACING.lg, marginBottom: SPACING.lg, maxHeight: 240,
  },
  passageLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', marginBottom: SPACING.sm },
  passageText: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },

  audioHint: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: '#EFF6FF', borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.lg,
    borderWidth: 1, borderColor: '#BFDBFE',
  },
  audioHintText: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: '600' },

  groupType: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: SPACING.sm },
  instructions: {
    backgroundColor: '#FFFBEB', borderRadius: RADIUS.md,
    borderLeftWidth: 3, borderLeftColor: '#D97706',
    padding: SPACING.md, marginBottom: SPACING.md,
  },
  instructionsText: { fontSize: FONT_SIZES.sm, color: '#92400E', lineHeight: 20 },

  qBlock: {
    backgroundColor: '#fff', borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.border,
    padding: SPACING.lg, marginBottom: SPACING.md,
  },
  qNum: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase', marginBottom: 4 },
  qText: { fontSize: FONT_SIZES.md, color: COLORS.text, marginBottom: SPACING.md, lineHeight: 22 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1, marginBottom: SPACING.sm,
  },
  bullet: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  bulletLetter: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textSecondary },
  optText: { flex: 1, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  explanation: { marginTop: SPACING.sm, padding: SPACING.sm, borderRadius: RADIUS.md },
  input: {
    borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: RADIUS.md, padding: SPACING.md,
    fontSize: FONT_SIZES.md, color: COLORS.text,
  },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: SPACING.lg, backgroundColor: '#fff',
    borderTopWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 8,
  },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    backgroundColor: '#1E293B', borderRadius: RADIUS.xl, paddingVertical: SPACING.md,
  },
  submitText: { fontSize: FONT_SIZES.md, fontWeight: '800', color: '#fff' },
  scoreText: { fontSize: FONT_SIZES.lg, fontWeight: '800' },
  scoreSubtext: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#1E293B', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  retryText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#fff' },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FCD34D', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  nextText: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text },
});
