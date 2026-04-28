import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, Modal, FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAudioPlayer } from 'expo-audio';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { ieltsExamsApi } from '@/services/ielts.api';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Badge } from '@/components/ui';

// ─── Timer ─────────────────────────────────────────────────────────────────
function useTimer(initialSeconds: number, running: boolean) {
  const [elapsed, setElapsed] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else if (ref.current) {
      clearInterval(ref.current);
    }
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);

  const remaining = Math.max(0, initialSeconds - elapsed);
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  return { elapsed, remaining, display: `${mm}:${ss}`, isExpired: remaining === 0 };
}

// ─── MCQ Question ──────────────────────────────────────────────────────────
function MCQQuestion({ q, answer, onAnswer }: { q: any; answer: string; onAnswer: (v: string) => void }) {
  const options = q.options || [];
  return (
    <View style={qStyles.block}>
      <Text style={qStyles.qNumber}>Q{q.question_number}</Text>
      <Text style={qStyles.qText}>{q.question || q.text}</Text>
      {options.map((opt: any, i: number) => {
        const letter = opt.letter || String.fromCharCode(65 + i);
        const label = opt.text || opt;
        const selected = answer === letter;
        return (
          <TouchableOpacity
            key={letter}
            style={[qStyles.option, selected && qStyles.optionSelected]}
            onPress={() => onAnswer(letter)}
            activeOpacity={0.8}
          >
            <View style={[qStyles.optionBullet, selected && qStyles.optionBulletSelected]}>
              <Text style={[qStyles.optionLetter, selected && { color: '#fff' }]}>{letter}</Text>
            </View>
            <Text style={[qStyles.optionText, selected && qStyles.optionTextSelected]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Fill blank Question ───────────────────────────────────────────────────
function FillQuestion({ q, answer, onAnswer }: { q: any; answer: string; onAnswer: (v: string) => void }) {
  return (
    <View style={qStyles.block}>
      <Text style={qStyles.qNumber}>Q{q.question_number}</Text>
      <Text style={qStyles.qText}>{q.question || q.text}</Text>
      <TextInput
        style={qStyles.input}
        value={answer}
        onChangeText={onAnswer}
        placeholder="Type your answer…"
        placeholderTextColor={COLORS.textMuted}
      />
    </View>
  );
}

const qStyles = StyleSheet.create({
  block: { marginBottom: SPACING.xl, padding: SPACING.lg, backgroundColor: '#fff', borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.border },
  qNumber: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.primary, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  qText: { fontSize: FONT_SIZES.md, color: COLORS.text, marginBottom: SPACING.md, lineHeight: 22 },
  option: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.sm, backgroundColor: COLORS.surface },
  optionSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '12' },
  optionBullet: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md, backgroundColor: '#fff' },
  optionBulletSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  optionLetter: { fontWeight: '700', fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  optionText: { flex: 1, fontSize: FONT_SIZES.md, color: COLORS.text },
  optionTextSelected: { color: COLORS.primary, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.md, fontSize: FONT_SIZES.md, color: COLORS.text },
});

// ─── Render question groups ───────────────────────────────────────────────
function renderGroup(group: any, answers: Record<string, string>, setAnswer: (k: string, v: string) => void) {
  const type = group.type;
  const questions = group.questions || group.points || [];

  return (
    <View key={`${type}-${JSON.stringify(questions[0])}`}>
      {group.instructions && <Text style={styles.instructions}>{group.instructions}</Text>}
      {questions.map((q: any) => {
        const num = String(q.question_number);
        if (type === 'multiple_choice' || type === 'matching') {
          return <MCQQuestion key={num} q={q} answer={answers[num] || ''} onAnswer={v => setAnswer(num, v)} />;
        }
        return <FillQuestion key={num} q={q} answer={answers[num] || ''} onAnswer={v => setAnswer(num, v)} />;
      })}
    </View>
  );
}

// ─── Main Exam Player ────────────────────────────────────────────────────────
export default function ExamPlayerScreen() {
  const router = useRouter();
  const { examId } = useLocalSearchParams<{ examId: string }>();
  const { user } = useAuth();

  const [exam, setExam] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  
  const audioUrl = exam?.questions?.audio_url;
  const player = useAudioPlayer(audioUrl || '');

  const { elapsed, display: timerDisplay } = useTimer(
    (exam?.duration ?? 60) * 60,
    timerRunning,
  );

  useEffect(() => {
    loadExam();
  }, [examId]);

  const loadExam = async () => {
    try {
      const examData = await ieltsExamsApi.getExam(examId);
      setExam(examData);
      if (user) {
        const sess = await ieltsExamsApi.createSession(examId, user.id);
        setSession(sess);
        setTimerRunning(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const setAnswer = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleToggleAudio = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleSubmit = async () => {
    Alert.alert(
      'Submit Test?',
      'You cannot change answers after submitting.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            if (!session) return;
            try {
              setSubmitting(true);
              setTimerRunning(false);
              const result = await ieltsExamsApi.submitSession(session.id, answers, elapsed);
              router.replace(`/ielts/intensive/result/${session.id}` as any);
            } catch (e) {
              Alert.alert('Error', 'Failed to submit. Try again.');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading exam…</Text>
      </View>
    );
  }

  if (!exam) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Exam not found.</Text>
        <TouchableOpacity onPress={() => router.back()}><Text style={{ color: COLORS.primary }}>Go back</Text></TouchableOpacity>
      </View>
    );
  }

  const questions = exam.questions as any;
  const parts = questions?.parts || questions?.passages || questions?.tasks || [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Sticky header with timer */}
      <View style={styles.examHeader}>
        <TouchableOpacity
          onPress={() =>
            Alert.alert('Exit Test?', 'Progress will be saved.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Exit', style: 'destructive', onPress: () => router.back() },
            ])
          }
        >
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.examTitleContainer}>
          <Text style={styles.examTitle} numberOfLines={1}>{exam.title?.split(' - ')[1] ?? exam.title}</Text>
          <Badge label={exam.type} color="#fff" bg="rgba(255,255,255,0.2)" />
        </View>
        <View style={[styles.timerBadge, elapsed > (exam.duration - 5) * 60 && styles.timerWarning]}>
          <Ionicons name="timer-outline" size={14} color="#fff" />
          <Text style={styles.timerText}>{timerDisplay}</Text>
        </View>
      </View>

      {/* Audio player bar for Listening */}
      {audioUrl && (
        <TouchableOpacity
          style={[styles.audioBanner, player.playing && styles.audioBannerPlaying]}
          onPress={handleToggleAudio}
        >
          <Ionicons name={player.playing ? 'pause-circle' : 'play-circle'} size={32} color={COLORS.primary} />
          <Text style={styles.audioLabel}>{player.playing ? 'Playing audio…' : 'Tap to play audio'}</Text>
        </TouchableOpacity>
      )}

      {/* Questions */}
      <ScrollView
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 120 }}
      >
        {parts.length > 0 ? (
          parts.map((part: any, pi: number) => {
            const groups = part.groups || part.content || [];
            return (
              <View key={pi} style={styles.partSection}>
                <Text style={styles.partTitle}>
                  Part {part.part_number || part.passage_number || part.task_number || pi + 1}
                </Text>
                {part.passage && (
                  <ScrollView style={styles.passageBox} nestedScrollEnabled>
                    <Text style={styles.passageText}>{part.passage}</Text>
                  </ScrollView>
                )}
                {groups.map((g: any) => renderGroup(g, answers, setAnswer))}
              </View>
            );
          })
        ) : (
          // Flat question list fallback
          (questions.groups || []).map((g: any) => renderGroup(g, answers, setAnswer))
        )}
      </ScrollView>

      {/* Submit button */}
      <View style={styles.submitBar}>
        <Text style={styles.answeredCount}>
          {Object.keys(answers).length} answered
        </Text>
        <Button
          title={submitting ? 'Submitting…' : 'Submit Test'}
          onPress={handleSubmit}
          loading={submitting}
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: SPACING.md, color: COLORS.textSecondary },
  errorText: { fontSize: FONT_SIZES.lg, color: COLORS.error, marginBottom: SPACING.md },
  examHeader: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  examTitleContainer: { flex: 1, gap: 4 },
  examTitle: { color: '#fff', fontSize: FONT_SIZES.sm, fontWeight: '700' },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  timerWarning: { backgroundColor: COLORS.error + 'CC' },
  timerText: { color: '#fff', fontWeight: '800', fontSize: FONT_SIZES.sm, fontVariant: ['tabular-nums'] },
  audioBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.primary + '0E',
    borderBottomWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  audioBannerPlaying: { backgroundColor: COLORS.primary + '1A' },
  audioLabel: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: '600' },
  scrollArea: { flex: 1 },
  partSection: { marginBottom: SPACING.xxl },
  partTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 2,
    borderColor: COLORS.primary,
  },
  passageBox: {
    maxHeight: 220,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  passageText: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  instructions: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginBottom: SPACING.md,
    padding: SPACING.md,
    backgroundColor: '#FFF9C4',
    borderRadius: RADIUS.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
  },
  submitBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  answeredCount: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontWeight: '600' },
});
