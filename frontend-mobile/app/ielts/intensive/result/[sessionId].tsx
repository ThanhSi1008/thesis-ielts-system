import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, LayoutAnimation, UIManager, Platform, Share, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { ieltsExamsApi } from '@/services/ielts.api';
import { Button } from '@/components/ui';
import WritingRubricView from '@/components/ielts/WritingRubricView';
import SpeakingRubricView from '@/components/ielts/SpeakingRubricView';
import QuestionNoteEditor from '@/components/ielts/QuestionNoteEditor';
import { notesApi, type QuestionNote } from '@/services/notes.api';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Band helpers ─────────────────────────────────────────────────────────────
function getListeningBand(score: number) {
  if (score >= 39) return 9.0; if (score >= 37) return 8.5; if (score >= 35) return 8.0;
  if (score >= 32) return 7.5; if (score >= 30) return 7.0; if (score >= 26) return 6.5;
  if (score >= 23) return 6.0; if (score >= 18) return 5.5; if (score >= 16) return 5.0;
  if (score >= 13) return 4.5; if (score >= 10) return 4.0; if (score >= 8) return 3.5;
  if (score >= 6) return 3.0; if (score >= 4) return 2.5; if (score >= 2) return 2.0;
  return 1.0;
}

function getReadingBand(score: number) {
  if (score >= 39) return 9.0; if (score >= 37) return 8.5; if (score >= 35) return 8.0;
  if (score >= 33) return 7.5; if (score >= 30) return 7.0; if (score >= 27) return 6.5;
  if (score >= 23) return 6.0; if (score >= 19) return 5.5; if (score >= 15) return 5.0;
  if (score >= 13) return 4.5; if (score >= 10) return 4.0; if (score >= 8) return 3.5;
  if (score >= 6) return 3.0; if (score >= 4) return 2.5; if (score >= 2) return 2.0;
  return 1.0;
}

function getBandForType(score: number, type: string) {
  return type === 'READING' ? getReadingBand(score) : getListeningBand(score);
}

function getBandColor(band: number): string {
  if (band >= 8.0) return '#22c55e';
  if (band >= 6.5) return '#3b82f6';
  if (band >= 5.0) return '#f59e0b';
  return '#ef4444';
}

const BAND_LABELS: Record<string, string> = {
  '9.0': 'Expert', '8.5': 'Very Good', '8.0': 'Very Good',
  '7.5': 'Good', '7.0': 'Good', '6.5': 'Competent',
  '6.0': 'Competent', '5.5': 'Modest', '5.0': 'Modest',
  '4.5': 'Limited', '4.0': 'Limited', '3.5': 'Extremely Limited',
  '3.0': 'Extremely Limited', '2.5': 'Intermittent', '2.0': 'Intermittent', '1.0': 'Non User',
};

// ─── Extract correct answers recursively from exam.questions ─────────────────
function extractCorrectAnswers(obj: any, map: Map<string, any>) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    obj.forEach(x => extractCorrectAnswers(x, map));
    return;
  }
  if ('question_number' in obj && 'answer' in obj) {
    map.set(String(obj.question_number), obj.answer);
    return;
  }
  if ('question_numbers' in obj && 'answer' in obj) {
    let ans = obj.answer;
    if (typeof ans === 'string' && ans.includes(',')) {
      ans = ans.split(',').map((s: string) => s.trim());
    }
    for (const n of obj.question_numbers as number[]) {
      map.set(String(n), ans);
    }
    return;
  }
  Object.values(obj).forEach(v => extractCorrectAnswers(v, map));
}

// ─── Extract timestamps recursively from exam.questions ────────────────────────
function extractTimestamps(obj: any, map: Map<string, number>) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    obj.forEach(x => extractTimestamps(x, map));
    return;
  }
  if ('question_number' in obj && 'timestamp_seconds' in obj) {
    map.set(String(obj.question_number), obj.timestamp_seconds);
    return;
  }
  if ('question_numbers' in obj && 'timestamp_seconds' in obj) {
    for (const n of obj.question_numbers as number[]) {
      map.set(String(n), obj.timestamp_seconds);
    }
    return;
  }
  Object.values(obj).forEach(v => extractTimestamps(v, map));
}

// ─── Answer correctness check (mirrors web logic) ────────────────────────────
function normalizeAns(a: any): string {
  if (!a) return '';
  if (Array.isArray(a)) return a.filter(Boolean).join(', ');
  return String(a);
}

function checkCorrect(userAns: any, correctAns: any): boolean {
  const un = normalizeAns(userAns).toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!un) return false;
  const candidates = Array.isArray(correctAns) ? correctAns : [String(correctAns)];
  for (const c of candidates) {
    const variants: string[] = [];
    const parts = String(c).split('/').map(p => p.trim());
    for (const p of parts) {
      const m = p.match(/^(.*?)\((.*?)\)(.*)$/);
      if (m) {
        variants.push((m[1] + m[3]).trim());
        variants.push((m[1] + m[2] + m[3]).trim());
      } else {
        variants.push(p);
      }
    }
    for (const v of variants) {
      if (un === v.toLowerCase().replace(/[^a-z0-9]/g, '')) return true;
    }
  }
  return false;
}

// ─── Answer Sheet (4 columns) ────────────────────────────────────────────────
function AnswerSheet({
  userAnswers, correctMap, totalQuestions,
}: {
  userAnswers: Record<string, any>;
  correctMap: Map<string, any>;
  totalQuestions: number;
}) {
  const numbers = Array.from({ length: totalQuestions }, (_, i) => i + 1);
  let correct = 0, wrong = 0, blank = 0;

  const chunkSize = Math.ceil(totalQuestions / 4) || 10;
  const parts = Array.from({ length: 4 }, (_, i) => 
    numbers.slice(i * chunkSize, (i + 1) * chunkSize)
  );

  return (
    <View style={as.container}>
      <Text style={as.title}>Answer Sheet</Text>
      <View style={as.columnsContainer}>
        {parts.map((partNums, idx) => {
          if (partNums.length === 0) return null;
          return (
            <View key={idx} style={as.column}>
              <Text style={as.colTitle}>Part {idx + 1}</Text>
              <View style={as.colGrid}>
                {partNums.map(n => {
                  const key = String(n);
                  const user = userAnswers[key];
                  const correct_ = correctMap.get(key);
                  const hasAns = !!normalizeAns(user);
                  const isCorrect = hasAns && correct_ !== undefined && checkCorrect(user, correct_);
                  const isWrong = hasAns && correct_ !== undefined && !isCorrect;

                  if (isCorrect) correct++;
                  else if (isWrong) wrong++;
                  else blank++;

                  const bg = isCorrect ? '#DCFCE7' : isWrong ? '#FEE2E2' : COLORS.surface;
                  const border = isCorrect ? '#16a34a' : isWrong ? COLORS.error : COLORS.border;
                  const color = isCorrect ? '#15803D' : isWrong ? '#B91C1C' : COLORS.textMuted;

                  return (
                    <View key={n} style={[as.cell, { backgroundColor: bg, borderColor: border }]}>
                      <Text style={[as.cellNum, { color }]}>{n}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>
      <View style={as.legend}>
        <View style={as.legendItem}>
          <View style={[as.legendDot, { backgroundColor: '#DCFCE7', borderColor: '#16a34a' }]} />
          <Text style={as.legendText}>{correct} Correct</Text>
        </View>
        <View style={as.legendItem}>
          <View style={[as.legendDot, { backgroundColor: '#FEE2E2', borderColor: COLORS.error }]} />
          <Text style={as.legendText}>{wrong} Wrong</Text>
        </View>
        <View style={as.legendItem}>
          <View style={[as.legendDot, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]} />
          <Text style={as.legendText}>{blank} Blank</Text>
        </View>
      </View>
    </View>
  );
}

const as = StyleSheet.create({
  container: { margin: SPACING.lg, backgroundColor: '#fff', borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border },
  title: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  columnsContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: SPACING.sm },
  column: { flex: 1, alignItems: 'center' },
  colTitle: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, marginBottom: SPACING.sm, textTransform: 'uppercase' },
  colGrid: { flexDirection: 'column', gap: 6 },
  cell: { width: 36, height: 36, borderRadius: RADIUS.sm, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  cellNum: { fontSize: 11, fontWeight: '700' },
  legend: { flexDirection: 'row', gap: SPACING.lg, marginTop: SPACING.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 3, borderWidth: 1.5 },
  legendText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: '600' },
});

// ─── Question Review Row ──────────────────────────────────────────────────────
function QuestionReviewRow({
  questionNumber, userAns, correctAns, note, examId, userId, timestamp, onSeek,
}: {
  questionNumber: number;
  userAns: any;
  correctAns: any;
  note?: QuestionNote;
  examId: string;
  userId: string;
  timestamp?: number;
  onSeek?: (ts: number) => void;
}) {
  const user = normalizeAns(userAns);
  const correct = normalizeAns(correctAns);
  const hasAns = !!user;
  const isCorrect_ = hasAns && correctAns !== undefined && checkCorrect(userAns, correctAns);
  const isWrong = hasAns && correctAns !== undefined && !isCorrect_;
  const isBlank = !hasAns;

  return (
    <View style={qr.row}>
      <View style={qr.numBadge}>
        <Text style={qr.numText}>{questionNumber}</Text>
      </View>
      <View style={qr.right}>
        {isCorrect_ && (
          <View style={qr.correctPill}>
            <Ionicons name="checkmark" size={12} color="#15803D" />
            <Text style={qr.correctText}>{user}</Text>
          </View>
        )}
        {isWrong && (
          <View style={qr.wrongRow}>
            <View style={qr.wrongPill}>
              <Text style={qr.wrongText}>{user || '—'}</Text>
            </View>
            <Ionicons name="arrow-forward" size={12} color={COLORS.textMuted} />
            <View style={qr.answerPill}>
              <Text style={qr.answerText}>{correct}</Text>
            </View>
          </View>
        )}
        {isBlank && (
          <View style={qr.wrongRow}>
            <Text style={qr.blankText}>—</Text>
            <Ionicons name="arrow-forward" size={12} color={COLORS.textMuted} />
            <View style={qr.answerPill}>
              <Text style={qr.answerText}>{correct}</Text>
            </View>
          </View>
        )}
        
        {timestamp !== undefined && onSeek && (
          <TouchableOpacity style={qr.listenBtn} onPress={() => onSeek(timestamp)} activeOpacity={0.7}>
            <Ionicons name="volume-medium" size={13} color={COLORS.primary} />
            <Text style={qr.listenText}>Listen</Text>
          </TouchableOpacity>
        )}

        <QuestionNoteEditor
          questionNumber={questionNumber}
          examId={examId}
          userId={userId}
          initialNote={note}
        />
      </View>
    </View>
  );
}

const qr = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderColor: COLORS.border + '60', gap: SPACING.md },
  numBadge: { width: 28, height: 28, borderRadius: 6, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  numText: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary },
  right: { flex: 1 },
  correctPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#DCFCE7', borderRadius: RADIUS.sm, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#86EFAC' },
  correctText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#15803D' },
  listenBtn: { 
    flexDirection: 'row', alignItems: 'center', gap: 4, 
    alignSelf: 'flex-start', marginTop: 4, paddingHorizontal: 8, paddingVertical: 4,
    backgroundColor: '#EFF6FF', borderRadius: RADIUS.sm, borderWidth: 1, borderColor: '#BFDBFE'
  },
  listenText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  wrongRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  wrongPill: { backgroundColor: '#FEE2E2', borderRadius: RADIUS.sm, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: '#FECACA' },
  wrongText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#B91C1C', textDecorationLine: 'line-through' },
  answerPill: { backgroundColor: '#DCFCE7', borderRadius: RADIUS.sm, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: '#86EFAC' },
  answerText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#15803D' },
  blankText: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, fontWeight: '600' },
});

// ─── Question Review Section (collapsible) ────────────────────────────────────
function QuestionReviewSection({
  userAnswers, correctMap, timestampMap, totalQuestions, noteMap, examId, userId, onSeek,
}: {
  userAnswers: Record<string, any>;
  correctMap: Map<string, any>;
  timestampMap: Map<string, number>;
  totalQuestions: number;
  noteMap: Map<number, QuestionNote>;
  examId: string;
  userId: string;
  onSeek?: (ts: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const numbers = Array.from({ length: totalQuestions }, (_, i) => i + 1);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(v => !v);
  };

  return (
    <View style={rev.container}>
      <TouchableOpacity style={rev.header} onPress={toggle} activeOpacity={0.8}>
        <Text style={rev.headerTitle}>Question Review</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textSecondary} />
      </TouchableOpacity>
      {open && (
        <View style={rev.body}>
          {numbers.map(n => (
            <QuestionReviewRow
              key={n}
              questionNumber={n}
              userAns={userAnswers[String(n)]}
              correctAns={correctMap.get(String(n))}
              note={noteMap.get(n)}
              examId={examId}
              userId={userId}
              timestamp={timestampMap.get(String(n))}
              onSeek={onSeek}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const rev = StyleSheet.create({
  container: { margin: SPACING.lg, backgroundColor: '#fff', borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.lg },
  headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  body: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md },
});

// ─── Main Result Screen ───────────────────────────────────────────────────────
export default function ResultScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [retaking, setRetaking] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [noteMap, setNoteMap] = useState<Map<number, QuestionNote>>(new Map());
  const [volume, setVolume] = useState(1.0);

  const audioUrl = session?.exam?.questions?.audio_url || '';
  const player = useAudioPlayer(audioUrl);

  useEffect(() => {
    if (player) player.volume = volume;
  }, [volume, player]);

  const handleSeek = (timestamp: number) => {
    if (!player.playing) player.play();
    player.seekTo(timestamp);
  };

  useEffect(() => {
    ieltsExamsApi.getSession(sessionId)
      .then(data => {
        setSession(data);
        if (data?.userId && data?.exam?.id) {
          notesApi.getExamNotes(data.userId, data.exam.id)
            .then(notes => {
              const map = new Map<number, QuestionNote>();
              notes.forEach(n => map.set(n.questionNumber, n));
              setNoteMap(map);
            })
            .catch(() => { });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sessionId]);

  // Poll every 5 s while AI grading is in progress
  useEffect(() => {
    if (!session || !['SUBMITTED', 'GRADING'].includes(session.status)) return;
    const interval = setInterval(async () => {
      try {
        const data = await ieltsExamsApi.getSession(sessionId);
        setSession(data);
        if (!['SUBMITTED', 'GRADING'].includes(data.status)) clearInterval(interval);
      } catch { /* ignore */ }
    }, 5000);
    return () => clearInterval(interval);
  }, [session?.status, sessionId]);

  const handleRetake = useCallback(async () => {
    if (!session?.exam?.id) return;
    try {
      setRetaking(true);
      const newSession = await ieltsExamsApi.createSession(session.exam.id, session.userId ?? '');
      router.replace(`/ielts/intensive/${session.exam.id}?sessionId=${newSession.id}` as any);
    } catch {
      Alert.alert('Error', 'Could not start a new session. Please try again.');
    } finally {
      setRetaking(false);
    }
  }, [session, router]);

  const handleShare = useCallback(async (
    bandStr: string,
    rawScore: number,
    totalQuestions: number,
    examTitle: string,
    examType: string,
    mm: string,
    ss: string,
  ) => {
    try {
      setSharing(true);
      const message = [
        `🎓 IELTS ${examType} Result`,
        `📝 Exam: ${examTitle}`,
        ``,
        `⭐ Band Score: ${bandStr}`,
        `✅ Raw Score: ${rawScore}/${totalQuestions}`,
        `⏱ Time: ${mm}:${ss}`,
        ``,
        `Practiced with TOEIC Master AI 🚀`,
      ].join('\n');
      await Share.share({ message, title: `IELTS ${examType} — Band ${bandStr}` });
    } catch {
    } finally {
      setSharing(false);
    }
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading result…</Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.center}>
        <Text style={{ color: COLORS.error }}>Session not found.</Text>
      </View>
    );
  }

  const rawScore: number = session.result?.totalScore ?? 0;
  const examType: string = session.exam?.type ?? 'LISTENING';
  const isWritingOrSpeaking = examType === 'WRITING' || examType === 'SPEAKING';
  const isPending = ['SUBMITTED', 'GRADING'].includes(session.status);

  let band = 0;
  if (isWritingOrSpeaking) {
    band = session.result?.writingScore ?? session.result?.speakingScore ?? 0;
  } else {
    band = getBandForType(rawScore, examType);
  }

  const bandStr = band.toFixed(1);
  const bandColor = getBandColor(band);
  const description = BAND_LABELS[bandStr] || '';

  const timeTaken = session.timeTaken;
  const mm = timeTaken ? String(Math.floor(timeTaken / 60)).padStart(2, '0') : '--';
  const ss = timeTaken ? String(timeTaken % 60).padStart(2, '0') : '--';

  const correctMap = new Map<string, any>();
  const timestampMap = new Map<string, number>();
  if (session.exam?.questions && !isWritingOrSpeaking) {
    extractCorrectAnswers(session.exam.questions, correctMap);
    extractTimestamps(session.exam.questions, timestampMap);
  }

  const userAnswers: Record<string, any> = session.answers ?? {};
  const totalQuestions = correctMap.size > 0 ? correctMap.size : 40;

  const rawSpeakingFeedback = session.result?.feedback;
  const speakingFeedback = rawSpeakingFeedback != null
    ? (typeof rawSpeakingFeedback === 'string'
        ? (() => { try { return JSON.parse(rawSpeakingFeedback); } catch { return null; } })()
        : rawSpeakingFeedback)
    : null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Breadcrumb Navigation */}
        <View style={styles.breadcrumb}>
          <Text style={styles.bcText}>IELTS</Text>
          <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
          <Text style={styles.bcText}>Intensive</Text>
          <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
          <Text style={[styles.bcText, styles.bcActive]}>Result</Text>
        </View>

        <View style={[styles.hero, { backgroundColor: bandColor + '18' }]}>
          <View style={[styles.bandCircle, { borderColor: bandColor }]}>
            <Text style={[styles.bandScore, { color: bandColor }]}>{bandStr}</Text>
            <Text style={[styles.bandLabel, { color: bandColor }]}>Band</Text>
          </View>
          <Text style={styles.resultTitle}>
            {isPending ? '⏳ Grading in Progress' : '✅ Test Complete'}
          </Text>
          <Text style={styles.description}>
            {isPending
              ? 'Your writing/speaking is being graded by AI. Check back soon.'
              : description}
          </Text>
          <Text style={styles.examTitle} numberOfLines={2}>{session.exam?.title}</Text>
        </View>

        {!isPending && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{rawScore}</Text>
              <Text style={styles.statLabel}>Raw Score</Text>
            </View>
            <View style={[styles.statCard, styles.statMid]}>
              <Text style={styles.statValue}>{totalQuestions}</Text>
              <Text style={styles.statLabel}>Total Qs</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{mm}:{ss}</Text>
              <Text style={styles.statLabel}>Time Taken</Text>
            </View>
          </View>
        )}

        {!isPending && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Score Breakdown</Text>
            <View style={styles.barBg}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${Math.min(100, (rawScore / totalQuestions) * 100)}%` as any,
                    backgroundColor: bandColor,
                  },
                ]}
              />
            </View>
            <Text style={styles.barLabel}>
              {rawScore} / {totalQuestions} ({Math.round((rawScore / totalQuestions) * 100)}%)
            </Text>
          </View>
        )}

        {!isPending && audioUrl ? (
          <View style={styles.audioBannerContainer}>
            <View style={styles.audioBanner}>
              <TouchableOpacity onPress={() => player.playing ? player.pause() : player.play()} style={styles.playBtn}>
                <Ionicons name={player.playing ? 'pause' : 'play'} size={20} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.audioBannerText}>{player.playing ? 'Playing exam audio' : 'Audio paused'}</Text>
            </View>
            <View style={styles.volumeControl}>
              <TouchableOpacity onPress={() => setVolume(Math.max(0, volume - 0.2))}>
                <Ionicons name="volume-low" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
              <View style={styles.volumeTrack}>
                <View style={[styles.volumeFill, { width: `${volume * 100}%` }]} />
              </View>
              <TouchableOpacity onPress={() => setVolume(Math.min(1, volume + 0.2))}>
                <Ionicons name="volume-high" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {!isPending && !isWritingOrSpeaking && correctMap.size > 0 && (
          <AnswerSheet
            userAnswers={userAnswers}
            correctMap={correctMap}
            totalQuestions={totalQuestions}
          />
        )}

        {!isPending && !isWritingOrSpeaking && correctMap.size > 0 && (
          <QuestionReviewSection
            userAnswers={userAnswers}
            correctMap={correctMap}
            timestampMap={timestampMap}
            totalQuestions={totalQuestions}
            noteMap={noteMap}
            examId={session.exam?.id ?? ''}
            userId={session.userId ?? ''}
            onSeek={handleSeek}
          />
        )}

        {!isPending && examType === 'WRITING' && session.result?.writingFeedback && (
          <WritingRubricView
            feedback={session.result.writingFeedback}
            answers={{
              task1: session.answers?.task1 ?? session.answers?.['1'],
              task2: session.answers?.task2 ?? session.answers?.['2'],
            }}
            exam={session.exam}
          />
        )}

        {!isPending && examType === 'SPEAKING' && speakingFeedback && (
          <SpeakingRubricView
            feedback={speakingFeedback}
            answers={session.answers ?? {}}
            exam={session.exam}
          />
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.retakeBtn, retaking && { opacity: 0.7 }]}
            onPress={handleRetake}
            disabled={retaking}
            activeOpacity={0.85}
          >
            {retaking
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="refresh-outline" size={18} color="#fff" />}
            <Text style={styles.retakeBtnText}>{retaking ? 'Starting…' : 'Retake Exam'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.shareBtn, sharing && { opacity: 0.7 }]}
            onPress={() => handleShare(bandStr, rawScore, totalQuestions, session.exam?.title ?? '', examType, mm, ss)}
            disabled={sharing}
            activeOpacity={0.85}
          >
            {sharing
              ? <ActivityIndicator size="small" color={COLORS.primary} />
              : <Ionicons name="share-social-outline" size={18} color={COLORS.primary} />}
            <Text style={styles.shareBtnText}>{sharing ? 'Sharing…' : 'Share Result'}</Text>
          </TouchableOpacity>

          <Button
            title="Back to Tests"
            variant="outline"
            onPress={() => router.replace('/ielts/intensive' as any)}
            fullWidth
          />
          <View style={{ height: SPACING.sm }} />
          <Button
            title="View All History"
            variant="ghost"
            onPress={() => router.replace('/ielts/history' as any)}
            fullWidth
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: SPACING.md, color: COLORS.textSecondary },
  breadcrumb: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  bcText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  bcActive: { color: COLORS.primary, fontWeight: '700' },
  hero: { alignItems: 'center', padding: SPACING.xxxl, paddingTop: SPACING.lg },
  bandCircle: {
    width: 120, height: 120, borderRadius: 60, borderWidth: 5,
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg,
    backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  bandScore: { fontSize: 40, fontWeight: '900', lineHeight: 44 },
  bandLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  resultTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 8, textAlign: 'center' },
  description: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  audioBannerContainer: {
    marginHorizontal: SPACING.lg, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: '#C7D2FE',
    backgroundColor: '#EEF2FF', overflow: 'hidden'
  },
  audioBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md,
  },
  playBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  audioBannerText: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: '600' },
  volumeControl: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.md, paddingBottom: SPACING.md,
  },
  volumeTrack: { flex: 1, height: 6, backgroundColor: '#E0E7FF', borderRadius: 3, overflow: 'hidden' },
  volumeFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  examTitle: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, textAlign: 'center' },
  statsRow: {
    flexDirection: 'row', marginHorizontal: SPACING.lg, marginTop: SPACING.md,
    backgroundColor: '#fff', borderRadius: RADIUS.xl, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  statCard: { flex: 1, alignItems: 'center' },
  statMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: COLORS.border },
  statValue: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  section: { paddingHorizontal: SPACING.lg, marginTop: SPACING.xl },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  barBg: { height: 12, backgroundColor: COLORS.border, borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 6 },
  barLabel: { marginTop: SPACING.sm, fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, textAlign: 'right' },
  actions: { padding: SPACING.xl, marginTop: SPACING.lg, gap: SPACING.sm },
  // Retake button
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.sm, borderRadius: RADIUS.xl, paddingVertical: 14,
  },
  retakeBtn: { backgroundColor: COLORS.primary },
  retakeBtnText: { color: '#fff', fontSize: FONT_SIZES.md, fontWeight: '700' },
  // Share button
  shareBtn: {
    backgroundColor: COLORS.primary + '12',
    borderWidth: 1.5, borderColor: COLORS.primary,
  },
  shareBtnText: { color: COLORS.primary, fontSize: FONT_SIZES.md, fontWeight: '700' },
});
