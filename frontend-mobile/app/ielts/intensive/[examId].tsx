import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, Animated, Dimensions, TouchableWithoutFeedback,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAudioPlayer } from 'expo-audio';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { ieltsExamsApi } from '@/services/ielts.api';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Badge } from '@/components/ui';
import WritingExamBlock from '@/components/ielts/WritingExamBlock';
import SpeakingExamBlock from '@/components/ielts/SpeakingExamBlock';
import ReadingExamBlock from '@/components/ielts/ReadingExamBlock';
import DiagramMapBlock from '@/components/ielts/DiagramMapBlock';
import MatchingBlock from '@/components/ielts/MatchingBlock';

// ─── Timer (wall-clock fix) ───────────────────────────────────────────────────
function useTimer(initialSeconds: number, running: boolean) {
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      // Capture wall-clock start, subtract already-elapsed to resume correctly
      startTimeRef.current = Date.now() - elapsed * 1000;
      intervalRef.current = setInterval(() => {
        const wallElapsed = Math.round((Date.now() - startTimeRef.current!) / 1000);
        setElapsed(wallElapsed);
      }, 500); // 500ms polling keeps display accurate without being costly
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const remaining = Math.max(0, initialSeconds - elapsed);
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  return { elapsed, remaining, display: `${mm}:${ss}`, isExpired: remaining === 0 };
}


// ─── MCQ Question ────────────────────────────────────────────────────────────
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

// ─── Fill blank Question ──────────────────────────────────────────────────────
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

const DIAGRAM_TYPES = new Set(['diagram_labelling', 'diagram_completion', 'map_labelling', 'plan_labelling']);
const MATCHING_TYPES = new Set(['matching', 'matching_headings', 'matching_features', 'matching_information', 'matching_sentence_endings']);

// ─── Render question groups (Listening / Reading) ─────────────────────────────
// partIdx + groupIdx together guarantee a globally-unique key across all parts.
function renderGroup(
  group: any,
  answers: Record<string, string>,
  setAnswer: (k: string, v: string) => void,
  groupIdx = 0,
  partIdx = 0,
) {
  const type = group.type ?? 'fill';
  const questions = group.questions || group.points || [];
  // Key: p{partIdx}-g{groupIdx}-{type} — always unique across parts & groups
  const baseKey = `p${partIdx}-g${groupIdx}-${type}`;

  if (DIAGRAM_TYPES.has(type)) {
    return (
      <DiagramMapBlock
        key={baseKey}
        group={group}
        answers={answers}
        onAnswer={setAnswer}
      />
    );
  }

  if (MATCHING_TYPES.has(type)) {
    return (
      <MatchingBlock
        key={baseKey}
        group={group}
        answers={answers}
        onAnswer={setAnswer}
      />
    );
  }

  return (
    <View key={baseKey}>
      {group.instructions && <Text style={styles.instructions}>{group.instructions}</Text>}
      {questions.map((q: any, qi: number) => {
        // Use question_number when available; fall back to loop index to avoid duplicate keys
        const num = q.question_number != null ? String(q.question_number) : `${baseKey}-qi${qi}`;
        const qKey = `${baseKey}-${num}`;
        if (type === 'multiple_choice') {
          return <MCQQuestion key={qKey} q={q} answer={answers[num] || ''} onAnswer={v => setAnswer(num, v)} />;
        }
        return <FillQuestion key={qKey} q={q} answer={answers[num] || ''} onAnswer={v => setAnswer(num, v)} />;
      })}
    </View>
  );
}

// ─── AI Grading Overlay (Writing / Speaking) ──────────────────────────────────
function AIGradingOverlay({ onGoBack }: { onGoBack: () => void }) {
  return (
    <View style={overlayStyles.container}>
      <View style={overlayStyles.spinnerWrapper}>
        <ActivityIndicator size="large" color="#D51025" />
      </View>
      <Text style={overlayStyles.title}>Calculating your score…</Text>
      <Text style={overlayStyles.subtitle}>
        Our AI examiner is grading your responses.{'\n'}This may take a minute.
      </Text>
      <TouchableOpacity style={overlayStyles.backBtn} onPress={onGoBack}>
        <Ionicons name="arrow-back-outline" size={16} color="rgba(255,255,255,0.8)" />
        <Text style={overlayStyles.backBtnText}>Go back to mock tests</Text>
      </TouchableOpacity>
      <Text style={overlayStyles.note}>You'll be redirected automatically when done.</Text>
    </View>
  );
}

const overlayStyles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,10,10,0.93)', alignItems: 'center', justifyContent: 'center', padding: SPACING.xl, zIndex: 200 },
  spinnerWrapper: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl },
  title: { color: '#fff', fontSize: FONT_SIZES.xl, fontWeight: '800', marginBottom: SPACING.sm, textAlign: 'center' },
  subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: FONT_SIZES.sm, textAlign: 'center', lineHeight: 20, marginBottom: SPACING.xxl },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: SPACING.md },
  backBtnText: { color: 'rgba(255,255,255,0.8)', fontWeight: '600', fontSize: FONT_SIZES.sm },
  note: { color: 'rgba(255,255,255,0.25)', fontSize: FONT_SIZES.xs, textAlign: 'center' },
});

// ─── Question Navigator Drawer ────────────────────────────────────────────────
const DRAWER_HEIGHT = Math.min(Dimensions.get('window').height * 0.55, 420);

function QuestionNavigatorDrawer({
  open,
  onClose,
  totalQuestions,
  answers,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  totalQuestions: number;
  answers: Record<string, string>;
  onSelect: (n: number) => void;
}) {
  const slideAnim = useRef(new Animated.Value(DRAWER_HEIGHT)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: open ? 0 : DRAWER_HEIGHT,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  }, [open]);

  const numbers = Array.from({ length: totalQuestions }, (_, i) => i + 1);
  const answeredCount = Object.keys(answers).length;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={nav.backdrop} />
        </TouchableWithoutFeedback>
      )}
      {/* Sheet */}
      <Animated.View style={[nav.sheet, { transform: [{ translateY: slideAnim }] }]}>
        {/* Handle */}
        <View style={nav.handle} />
        {/* Header */}
        <View style={nav.sheetHeader}>
          <Text style={nav.sheetTitle}>Question Navigator</Text>
          <View style={nav.legend}>
            <View style={nav.legendRow}>
              <View style={[nav.dot, { backgroundColor: COLORS.primary }]} />
              <Text style={nav.legendText}>{answeredCount} Answered</Text>
            </View>
            <View style={nav.legendRow}>
              <View style={[nav.dot, { backgroundColor: '#E5E7EB' }]} />
              <Text style={nav.legendText}>{totalQuestions - answeredCount} Unanswered</Text>
            </View>
          </View>
        </View>
        {/* Grid */}
        <ScrollView
          contentContainerStyle={nav.grid}
          showsVerticalScrollIndicator={false}
        >
          {numbers.map(n => {
            const answered = !!answers[String(n)];
            return (
              <TouchableOpacity
                key={n}
                style={[nav.cell, answered && nav.cellAnswered]}
                onPress={() => { onClose(); setTimeout(() => onSelect(n), 150); }}
                activeOpacity={0.75}
              >
                <Text style={[nav.cellText, answered && nav.cellTextAnswered]}>{n}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>
    </>
  );
}

const nav = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 90 },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: DRAWER_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    zIndex: 100,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 20,
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB',
    alignSelf: 'center', marginTop: 12, marginBottom: 8,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
  sheetTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  legend: { flexDirection: 'row', gap: SPACING.md },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 10, color: COLORS.textSecondary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 8 },
  cell: {
    width: 44, height: 44, borderRadius: RADIUS.md,
    backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },
  cellAnswered: { backgroundColor: COLORS.primary + '18', borderColor: COLORS.primary },
  cellText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textMuted },
  cellTextAnswered: { color: COLORS.primary },
});

// ─── Main Exam Player ─────────────────────────────────────────────────────────
export default function ExamPlayerScreen() {
  const router = useRouter();
  const { examId } = useLocalSearchParams<{ examId: string }>();
  const { user } = useAuth();

  const [exam, setExam] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [writingAnswers, setWritingAnswers] = useState({ task1: '', task2: '' });
  const [speakingAnswers, setSpeakingAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAiGrading, setIsAiGrading] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  // Question navigator: track Y-offsets per part via onLayout
  const scrollViewRef = useRef<ScrollView>(null);
  const partOffsetsRef = useRef<Record<number, number>>({}); // partIndex → Y offset

  // Scroll to a question number (estimates part based on question ranges)
  const scrollToQuestion = useCallback((n: number) => {
    if (!exam) return;
    const questions = exam.questions as any;
    const parts = questions?.parts || questions?.passages || questions?.tasks || [];
    if (parts.length === 0) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    // Find which part contains question n by scanning question_number in groups
    let targetPartIndex = 0;
    for (let pi = 0; pi < parts.length; pi++) {
      const groups = parts[pi].groups || parts[pi].content || [];
      for (const g of groups) {
        const allNums: number[] = [];
        const collectNums = (obj: any) => {
          if (!obj || typeof obj !== 'object') return;
          if (Array.isArray(obj)) { obj.forEach(collectNums); return; }
          if ('question_number' in obj) { allNums.push(Number(obj.question_number)); return; }
          if ('question_numbers' in obj) { (obj.question_numbers as number[]).forEach(x => allNums.push(x)); return; }
          Object.values(obj).forEach(collectNums);
        };
        collectNums(g);
        if (allNums.some(num => num === n)) { targetPartIndex = pi; break; }
      }
    }
    const yOffset = partOffsetsRef.current[targetPartIndex] ?? 0;
    scrollViewRef.current?.scrollTo({ y: Math.max(0, yOffset - 16), animated: true });
  }, [exam]);

  const [volume, setVolume] = useState(1.0);

  const audioUrl = exam?.questions?.audio_url;
  const player = useAudioPlayer(audioUrl || '');

  useEffect(() => {
    if (player) player.volume = volume;
  }, [volume, player]);

  const { elapsed, display: timerDisplay } = useTimer(
    (exam?.duration ?? 60) * 60,
    timerRunning,
  );

  useEffect(() => { loadExam(); }, [examId]);

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

  const setAnswer = (key: string, value: string) =>
    setAnswers(prev => ({ ...prev, [key]: value }));

  const handleToggleAudio = () => {
    if (player.playing) { player.pause(); } else { player.play(); }
  };

  const buildSubmitPayload = () => {
    const type = exam?.type;
    if (type === 'WRITING') return { task1: writingAnswers.task1, task2: writingAnswers.task2 };
    if (type === 'SPEAKING') return speakingAnswers;
    return answers;
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
              const payload = buildSubmitPayload();
              const isAiType = exam?.type === 'WRITING' || exam?.type === 'SPEAKING';
              if (isAiType) setIsAiGrading(true);
              await ieltsExamsApi.submitSession(session.id, payload, elapsed);
              router.replace(`/ielts/intensive/result/${session.id}` as any);
            } catch (e) {
              setIsAiGrading(false);
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
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: COLORS.primary }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const examType: string = exam.type || 'LISTENING';
  const questions = exam.questions as any;
  const parts = questions?.parts || questions?.passages || questions?.tasks || [];

  // Writing
  const isWriting = examType === 'WRITING';
  const writingTasks = questions?.tasks || [];

  // Speaking
  const isSpeaking = examType === 'SPEAKING';
  const speakingParts = questions?.parts || [];

  // Reading
  const isReading = examType === 'READING';

  // Answered count display
  const answeredCount = isWriting
    ? [writingAnswers.task1, writingAnswers.task2].filter(v => v.trim()).length
    : isSpeaking
      ? Object.values(speakingAnswers).filter(v => v.trim()).length
      : Object.keys(answers).length;

  const totalCount = isWriting ? 2 : isSpeaking
    ? speakingParts.reduce((s: number, p: any) => s + (p.questions?.length || (p.cue_card ? 1 : 0)), 0)
    : undefined;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Sticky header */}
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
          <Badge label={examType} color="#fff" bg="rgba(255,255,255,0.2)" />
        </View>
        <View style={[styles.timerBadge, elapsed > (exam.duration - 5) * 60 && styles.timerWarning]}>
          <Ionicons name="timer-outline" size={14} color="#fff" />
          <Text style={styles.timerText}>{timerDisplay}</Text>
        </View>
      </View>

      {/* Audio bar (Listening only) */}
      {audioUrl && (
        <View style={styles.audioBannerContainer}>
          <TouchableOpacity
            style={[styles.audioBanner, player.playing && styles.audioBannerPlaying]}
            onPress={handleToggleAudio}
            activeOpacity={0.8}
          >
            <Ionicons name={player.playing ? 'pause-circle' : 'play-circle'} size={32} color={COLORS.primary} />
            <Text style={styles.audioLabel}>{player.playing ? 'Playing audio…' : 'Tap to play audio'}</Text>
          </TouchableOpacity>
          <View style={styles.volumeControl}>
            <TouchableOpacity onPress={() => setVolume(Math.max(0, volume - 0.2))} style={styles.volBtn}>
              <Ionicons name="volume-low" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <View style={styles.volumeTrack}>
              <View style={[styles.volumeFill, { width: `${volume * 100}%` }]} />
            </View>
            <TouchableOpacity onPress={() => setVolume(Math.min(1, volume + 0.2))} style={styles.volBtn}>
              <Ionicons name="volume-high" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Writing board */}
      {isWriting && (
        <WritingExamBlock
          tasks={writingTasks}
          answers={writingAnswers}
          onChange={setWritingAnswers}
        />
      )}

      {/* Speaking board */}
      {isSpeaking && (
        <SpeakingExamBlock
          parts={speakingParts}
          answers={speakingAnswers}
          onChange={setSpeakingAnswers}
        />
      )}

      {/* Reading board */}
      {isReading && (
        <ReadingExamBlock
          parts={parts}
          answers={answers}
          onChange={setAnswer}
          renderGroup={renderGroup as any}
        />
      )}

      {/* Listening questions */}
      {!isWriting && !isSpeaking && !isReading && (
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 120 }}
        >
          {parts.length > 0 ? (
            parts.map((part: any, pi: number) => {
              const groups = part.groups || part.content || [];
              return (
                <View
                  key={pi}
                  style={styles.partSection}
                  onLayout={(e) => {
                    partOffsetsRef.current[pi] = e.nativeEvent.layout.y;
                  }}
                >
                  <Text style={styles.partTitle}>
                    Part {part.part_number || part.passage_number || part.task_number || pi + 1}
                  </Text>
                  {part.passage && (
                    <ScrollView style={styles.passageBox} nestedScrollEnabled>
                      <Text style={styles.passageText}>{part.passage}</Text>
                    </ScrollView>
                  )}
                  {groups.map((g: any, gi: number) => renderGroup(g, answers, setAnswer, gi, pi))}
                </View>
              );
            })
          ) : (
            (questions.groups || []).map((g: any, gi: number) => renderGroup(g, answers, setAnswer, gi, 0))
          )}
        </ScrollView>
      )}

      {/* Submit bar */}
      <View style={styles.submitBar}>
        {/* Navigator toggle */}
        <TouchableOpacity
          style={styles.navToggleBtn}
          onPress={() => setNavOpen(v => !v)}
          activeOpacity={0.8}
        >
          <Ionicons name="grid-outline" size={18} color={COLORS.primary} />
          <Text style={styles.navToggleText}>
            {Object.keys(answers).length}/{totalCount ?? '?'}
          </Text>
        </TouchableOpacity>

        <Button
          title={submitting ? 'Submitting…' : 'Submit Test'}
          onPress={handleSubmit}
          loading={submitting}
          size="lg"
        />
      </View>

      {/* Question Navigator Drawer (Listening/Reading only) */}
      {!isWriting && !isSpeaking && totalCount !== undefined && (
        <QuestionNavigatorDrawer
          open={navOpen}
          onClose={() => setNavOpen(false)}
          totalQuestions={totalCount}
          answers={answers}
          onSelect={scrollToQuestion}
        />
      )}

      {/* AI Grading overlay */}
      {isAiGrading && (
        <AIGradingOverlay onGoBack={() => router.replace('/ielts/intensive' as any)} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: SPACING.md, color: COLORS.textSecondary },
  errorText: { fontSize: FONT_SIZES.lg, color: COLORS.error, marginBottom: SPACING.md },
  examHeader: {
    backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, gap: SPACING.md,
  },
  examTitleContainer: { flex: 1, gap: 4 },
  examTitle: { color: '#fff', fontSize: FONT_SIZES.sm, fontWeight: '700' },
  timerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  timerWarning: { backgroundColor: '#ef4444' },
  timerText: { color: '#fff', fontSize: FONT_SIZES.sm, fontWeight: '700', fontVariant: ['tabular-nums'] },
  
  audioBannerContainer: { backgroundColor: '#EEF2FF', borderBottomWidth: 1, borderColor: '#C7D2FE' },
  audioBanner: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.sm },
  audioBannerPlaying: { backgroundColor: '#E0E7FF' },
  audioLabel: { fontSize: FONT_SIZES.md, color: COLORS.primary, fontWeight: '600' },
  volumeControl: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md, gap: SPACING.sm },
  volBtn: { padding: 4 },
  volumeTrack: { flex: 1, height: 6, backgroundColor: '#C7D2FE', borderRadius: 3, overflow: 'hidden' },
  volumeFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  scrollArea: { flex: 1 },
  partSection: { marginBottom: SPACING.xxl },
  partTitle: {
    fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text,
    marginBottom: SPACING.lg, paddingBottom: SPACING.sm, borderBottomWidth: 2, borderColor: COLORS.primary,
  },
  passageBox: {
    maxHeight: 220, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border,
  },
  passageText: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  instructions: {
    fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontStyle: 'italic',
    marginBottom: SPACING.md, padding: SPACING.md, backgroundColor: '#FFF9C4',
    borderRadius: RADIUS.md, borderLeftWidth: 3, borderLeftColor: COLORS.warning,
  },
  submitBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: '#fff',
    borderTopWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 8,
  },
  answeredCount: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontWeight: '600' },
  navToggleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.primary + '12', borderRadius: RADIUS.xl,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1.5, borderColor: COLORS.primary + '30',
  },
  navToggleText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.primary },
});
