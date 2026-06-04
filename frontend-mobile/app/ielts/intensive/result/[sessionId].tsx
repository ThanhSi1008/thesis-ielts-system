import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  LayoutAnimation,
  UIManager,
  Platform,
  Share,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS, ROUTES, API_BASE_URL } from '@/constants';
import { ieltsExamsApi } from '@/services/ielts.api';
import { useTheme } from '@/contexts/ThemeContext';
import { Button, toast } from '@/components/ui';
import WritingRubricView from '@/components/ielts/WritingRubricView';
import SpeakingRubricView from '@/components/ielts/SpeakingRubricView';
import QuestionNoteEditor from '@/components/ielts/QuestionNoteEditor';
import { notesApi, type QuestionNote } from '@/services/notes.api';
import { renderGroup } from '@/components/intensive/QuestionGroupRenderer';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Band helpers ─────────────────────────────────────────────────────────────
function getListeningBand(score: number) {
  if (score >= 39) return 9.0;
  if (score >= 37) return 8.5;
  if (score >= 35) return 8.0;
  if (score >= 32) return 7.5;
  if (score >= 30) return 7.0;
  if (score >= 26) return 6.5;
  if (score >= 23) return 6.0;
  if (score >= 18) return 5.5;
  if (score >= 16) return 5.0;
  if (score >= 13) return 4.5;
  if (score >= 10) return 4.0;
  if (score >= 8) return 3.5;
  if (score >= 6) return 3.0;
  if (score >= 4) return 2.5;
  if (score >= 2) return 2.0;
  return 1.0;
}

function getReadingBand(score: number) {
  if (score >= 39) return 9.0;
  if (score >= 37) return 8.5;
  if (score >= 35) return 8.0;
  if (score >= 33) return 7.5;
  if (score >= 30) return 7.0;
  if (score >= 27) return 6.5;
  if (score >= 23) return 6.0;
  if (score >= 19) return 5.5;
  if (score >= 15) return 5.0;
  if (score >= 13) return 4.5;
  if (score >= 10) return 4.0;
  if (score >= 8) return 3.5;
  if (score >= 6) return 3.0;
  if (score >= 4) return 2.5;
  if (score >= 2) return 2.0;
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
  '9.0': 'Expert',
  '8.5': 'Very Good',
  '8.0': 'Very Good',
  '7.5': 'Good',
  '7.0': 'Good',
  '6.5': 'Competent',
  '6.0': 'Competent',
  '5.5': 'Modest',
  '5.0': 'Modest',
  '4.5': 'Limited',
  '4.0': 'Limited',
  '3.5': 'Extremely Limited',
  '3.0': 'Extremely Limited',
  '2.5': 'Intermittent',
  '2.0': 'Intermittent',
  '1.0': 'Non User',
};

// ─── Extract correct answers recursively from exam.questions ─────────────────
function extractCorrectAnswers(obj: any, map: Map<string, any>) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    obj.forEach((x) => extractCorrectAnswers(x, map));
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
  Object.values(obj).forEach((v) => extractCorrectAnswers(v, map));
}

// ─── Extract timestamps recursively from exam.questions ────────────────────────
function extractTimestamps(obj: any, map: Map<string, number>) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    obj.forEach((x) => extractTimestamps(x, map));
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
  Object.values(obj).forEach((v) => extractTimestamps(v, map));
}

// ─── Answer correctness check (mirrors web logic) ────────────────────────────
function normalizeAns(a: any): string {
  if (!a) return '';
  if (Array.isArray(a)) return a.filter(Boolean).join(', ');
  return String(a);
}

function checkCorrect(userAns: any, correctAns: any): boolean {
  const un = normalizeAns(userAns)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  if (!un) return false;
  const candidates = Array.isArray(correctAns) ? correctAns : [String(correctAns)];
  for (const c of candidates) {
    const variants: string[] = [];
    const parts = String(c)
      .split('/')
      .map((p) => p.trim());
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
  userAnswers,
  correctMap,
  totalQuestions,
}: {
  userAnswers: Record<string, any>;
  correctMap: Map<string, any>;
  totalQuestions: number;
}) {
  const { colors, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const as = createAsStyles(colors);
  const numbers = Array.from({ length: totalQuestions }, (_, i) => i + 1);
  let correct = 0,
    wrong = 0,
    blank = 0;

  const chunkSize = Math.ceil(totalQuestions / 4) || 10;
  const parts = Array.from({ length: 4 }, (_, i) =>
    numbers.slice(i * chunkSize, (i + 1) * chunkSize),
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
                {partNums.map((n) => {
                  const key = String(n);
                  const user = userAnswers[key];
                  const correct_ = correctMap.get(key);
                  const hasAns = !!normalizeAns(user);
                  const isCorrect =
                    hasAns && correct_ !== undefined && checkCorrect(user, correct_);
                  const isWrong = hasAns && correct_ !== undefined && !isCorrect;

                  if (isCorrect) correct++;
                  else if (isWrong) wrong++;
                  else blank++;

                  const bg = isCorrect
                    ? isDark
                      ? 'rgba(34, 205, 94, 0.15)'
                      : '#DCFCE7'
                    : isWrong
                      ? isDark
                        ? 'rgba(239, 68, 68, 0.15)'
                        : '#FEE2E2'
                      : colors.surface;
                  const border = isCorrect
                    ? isDark
                      ? '#22c55e'
                      : '#16a34a'
                    : isWrong
                      ? isDark
                        ? '#ef4444'
                        : colors.error
                      : colors.border;
                  const color = isCorrect
                    ? isDark
                      ? '#4ade80'
                      : '#15803D'
                    : isWrong
                      ? isDark
                        ? '#f87171'
                        : '#B91C1C'
                      : colors.textMuted;

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
          <View
            style={[
              as.legendDot,
              {
                backgroundColor: isDark ? 'rgba(34, 205, 94, 0.15)' : '#DCFCE7',
                borderColor: isDark ? '#22c55e' : '#16a34a',
              },
            ]}
          />
          <Text style={as.legendText}>{correct} Correct</Text>
        </View>
        <View style={as.legendItem}>
          <View
            style={[
              as.legendDot,
              {
                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
                borderColor: isDark ? '#ef4444' : colors.error,
              },
            ]}
          />
          <Text style={as.legendText}>{wrong} Wrong</Text>
        </View>
        <View style={as.legendItem}>
          <View
            style={[as.legendDot, { backgroundColor: colors.surface, borderColor: colors.border }]}
          />
          <Text style={as.legendText}>{blank} Blank</Text>
        </View>
      </View>
    </View>
  );
}

const createAsStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      margin: SPACING.lg,
      backgroundColor: colors.card,
      borderRadius: RADIUS.xl,
      padding: SPACING.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: {
      fontSize: FONT_SIZES.md,
      fontWeight: '700',
      color: colors.text,
      marginBottom: SPACING.md,
    },
    columnsContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: SPACING.sm },
    column: { flex: 1, alignItems: 'center' },
    colTitle: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
      marginBottom: SPACING.sm,
      textTransform: 'uppercase',
    },
    colGrid: { flexDirection: 'column', gap: 6 },
    cell: {
      width: 36,
      height: 36,
      borderRadius: RADIUS.sm,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cellNum: { fontSize: 11, fontWeight: '700' },
    legend: { flexDirection: 'row', gap: SPACING.lg, marginTop: SPACING.md },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 12, height: 12, borderRadius: 3, borderWidth: 1.5 },
    legendText: { fontSize: FONT_SIZES.xs, color: colors.textSecondary, fontWeight: '600' },
  });

// ─── Question Review Row ──────────────────────────────────────────────────────
function QuestionReviewRow({
  questionNumber,
  userAns,
  correctAns,
  note,
  examId,
  userId,
  timestamp,
  onSeek,
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
  const { colors, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const qr = createQrStyles(colors, isDark);
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
            <Ionicons name="checkmark" size={12} color={isDark ? '#4ade80' : '#15803D'} />
            <Text style={qr.correctText}>{user}</Text>
          </View>
        )}
        {isWrong && (
          <View style={qr.wrongRow}>
            <View style={qr.wrongPill}>
              <Text style={qr.wrongText}>{user || '—'}</Text>
            </View>
            <Ionicons name="arrow-forward" size={12} color={colors.textMuted} />
            <View style={qr.answerPill}>
              <Text style={qr.answerText}>{correct}</Text>
            </View>
          </View>
        )}
        {isBlank && (
          <View style={qr.wrongRow}>
            <Text style={qr.blankText}>—</Text>
            <Ionicons name="arrow-forward" size={12} color={colors.textMuted} />
            <View style={qr.answerPill}>
              <Text style={qr.answerText}>{correct}</Text>
            </View>
          </View>
        )}

        {timestamp !== undefined && onSeek && (
          <TouchableOpacity
            style={qr.listenBtn}
            onPress={() => onSeek(timestamp)}
            activeOpacity={0.7}
          >
            <Ionicons name="volume-medium" size={13} color={colors.primary} />
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

const createQrStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING.sm,
      borderBottomWidth: 1,
      borderColor: colors.border + '60',
      gap: SPACING.md,
    },
    numBadge: {
      width: 28,
      height: 28,
      borderRadius: 6,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    numText: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
    right: { flex: 1 },
    correctPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: isDark ? 'rgba(34, 205, 94, 0.15)' : '#DCFCE7',
      borderRadius: RADIUS.sm,
      paddingHorizontal: 8,
      paddingVertical: 3,
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: isDark ? '#22c55e' : '#86EFAC',
    },
    correctText: {
      fontSize: FONT_SIZES.sm,
      fontWeight: '700',
      color: isDark ? '#4ade80' : '#15803D',
    },
    listenBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'flex-start',
      marginTop: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#EFF6FF',
      borderRadius: RADIUS.sm,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#BFDBFE',
    },
    listenText: { fontSize: 11, fontWeight: '700', color: colors.primary },
    wrongRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    wrongPill: {
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
      borderRadius: RADIUS.sm,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderWidth: 1,
      borderColor: isDark ? '#ef4444' : '#FECACA',
    },
    wrongText: {
      fontSize: FONT_SIZES.sm,
      fontWeight: '700',
      color: isDark ? '#f87171' : '#B91C1C',
      textDecorationLine: 'line-through',
    },
    answerPill: {
      backgroundColor: isDark ? 'rgba(34, 205, 94, 0.15)' : '#DCFCE7',
      borderRadius: RADIUS.sm,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderWidth: 1,
      borderColor: isDark ? '#22c55e' : '#86EFAC',
    },
    answerText: {
      fontSize: FONT_SIZES.sm,
      fontWeight: '700',
      color: isDark ? '#4ade80' : '#15803D',
    },
    blankText: { fontSize: FONT_SIZES.sm, color: colors.textMuted, fontWeight: '600' },
  });

// ─── Question Review Section (collapsible) ────────────────────────────────────
function QuestionReviewSection({
  questionsData,
  userAnswers,
  correctMap,
  timestampMap,
  totalQuestions,
  noteMap,
  examId,
  userId,
  onSeek,
}: {
  questionsData: any;
  userAnswers: Record<string, any>;
  correctMap: Map<string, any>;
  timestampMap: Map<string, number>;
  totalQuestions: number;
  noteMap: Map<number, QuestionNote>;
  examId: string;
  userId: string;
  onSeek?: (ts: number) => void;
}) {
  const { colors, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const rev = createRevStyles(colors);
  const [open, setOpen] = useState(false);
  const [subMode, setSubMode] = useState<'detail' | 'list'>('detail');
  const numbers = Array.from({ length: totalQuestions }, (_, i) => i + 1);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((v) => !v);
  };

  const correctAnswersRecord: Record<string, string> = {};
  correctMap.forEach((v, k) => {
    correctAnswersRecord[k] = normalizeAns(v);
  });

  const renderDetailGroups = () => {
    const parts = questionsData?.parts || questionsData?.passages || questionsData?.tasks || [];
    
    if (parts.length > 0) {
      return parts.map((part: any, pi: number) => {
        const groups = part.question_groups || part.groups || part.content || [];
        return (
          <View key={`part-${pi}`} style={{ marginBottom: SPACING.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.md, paddingBottom: 6, borderBottomWidth: 1.5, borderBottomColor: colors.primary + '30' }}>
              <Ionicons name="bookmark-outline" size={14} color={colors.primary} />
              <Text style={{ fontSize: 12, fontWeight: '800', color: colors.primary, textTransform: 'uppercase', letterSpacing: 1 }}>
                Part {part.part_number || pi + 1} {part.title ? `· ${part.title}` : ''}
              </Text>
            </View>
            {groups.map((g: any, gi: number) =>
              renderGroup(
                g,
                userAnswers,
                () => {},
                gi,
                pi,
                colors,
                isDark,
                undefined,
                'review',
                correctAnswersRecord
              )
            )}
          </View>
        );
      });
    }

    const groups = questionsData?.question_groups || questionsData?.groups || questionsData?.content || [];
    return (
      <View>
        {groups.map((g: any, gi: number) =>
          renderGroup(
            g,
            userAnswers,
            () => {},
            gi,
            0,
            colors,
            isDark,
            undefined,
            'review',
            correctAnswersRecord
          )
        )}
      </View>
    );
  };

  return (
    <View style={rev.container}>
      <TouchableOpacity style={rev.header} onPress={toggle} activeOpacity={0.8}>
        <Text style={rev.headerTitle}>Question Review</Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
      {open && (
        <View style={rev.body}>
          {/* Sub-tab Toggle inside collapsible body */}
          <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: RADIUS.md, padding: 2, borderWidth: 1, borderColor: colors.border, marginBottom: SPACING.md }}>
            <TouchableOpacity
              style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: RADIUS.md - 2, backgroundColor: subMode === 'detail' ? colors.card : 'transparent' }}
              onPress={() => setSubMode('detail')}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: subMode === 'detail' ? colors.primary : colors.textSecondary }}>
                Detail Review
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: RADIUS.md - 2, backgroundColor: subMode === 'list' ? colors.card : 'transparent' }}
              onPress={() => setSubMode('list')}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: subMode === 'list' ? colors.primary : colors.textSecondary }}>
                Classic List
              </Text>
            </TouchableOpacity>
          </View>

          {subMode === 'list' ? (
            numbers.map((n) => (
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
            ))
          ) : (
            <View style={{ marginTop: SPACING.xs }}>
              {renderDetailGroups()}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const createRevStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      margin: SPACING.lg,
      backgroundColor: colors.card,
      borderRadius: RADIUS.xl,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: SPACING.lg,
    },
    headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: colors.text },
    body: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md },
  });

// ─── Main Result Screen ───────────────────────────────────────────────────────
export default function ResultScreen() {
  const { colors, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const styles = createStyles(colors, isDark);
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [retaking, setRetaking] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [noteMap, setNoteMap] = useState<Map<number, QuestionNote>>(new Map());
  const [volume, setVolume] = useState(1.0);

  const rawAudioUrl = session?.exam?.questions?.audio_url
    ?? session?.exam?.questions?.audioUrl
    ?? '';
  const audioUrl = useMemo(() => {
    if (!rawAudioUrl) return '';
    if (rawAudioUrl.startsWith('http')) return rawAudioUrl;
    const cleanUrl = rawAudioUrl.startsWith('/') ? rawAudioUrl : `/${rawAudioUrl}`;
    const baseAssetUrl = API_BASE_URL.replace(/\/api\/v\d+\/?$/, '').replace(/\/+$/, '');
    return `${baseAssetUrl}${cleanUrl}`;
  }, [rawAudioUrl]);
  const player = useAudioPlayer(audioUrl, { downloadFirst: true });

  useEffect(() => {
    if (player) player.volume = volume;
  }, [volume, player]);

  const handleSeek = (timestamp: number) => {
    if (!player.playing) player.play();
    player.seekTo(timestamp);
  };

  useEffect(() => {
    ieltsExamsApi
      .getSession(sessionId)
      .then((data) => {
        setSession(data);
        if (data?.userId && data?.exam?.id) {
          notesApi
            .getExamNotes(data.userId, data.exam.id)
            .then((notes) => {
              const map = new Map<number, QuestionNote>();
              notes.forEach((n) => map.set(n.questionNumber, n));
              setNoteMap(map);
            })
            .catch(() => {});
        }
      })
      .catch((e) => { if (__DEV__) console.error(e); })
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
      } catch {
        /* ignore */
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [session?.status, sessionId]);

  const handleRetake = useCallback(async () => {
    if (!session?.exam?.id) return;
    try {
      setRetaking(true);
      const newSession = await ieltsExamsApi.createSession(session.exam.id, session.userId ?? '');
      router.replace(
        (ROUTES.ieltsIntensiveExam(session.exam.id) + `?sessionId=${newSession.id}`) as any,
      );
    } catch {
      toast.error('Could not start a new session. Please try again.');
    } finally {
      setRetaking(false);
    }
  }, [session, router]);

  const handleShare = useCallback(
    async (
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
          `Practiced with IELTS Master AI 🚀`,
        ].join('\n');
        await Share.share({ message, title: `IELTS ${examType} — Band ${bandStr}` });
      } catch {
      } finally {
        setSharing(false);
      }
    },
    [],
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading result…</Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.error }}>Session not found.</Text>
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
  const speakingFeedback =
    rawSpeakingFeedback != null
      ? typeof rawSpeakingFeedback === 'string'
        ? (() => {
            try {
              return JSON.parse(rawSpeakingFeedback);
            } catch {
              return null;
            }
          })()
        : rawSpeakingFeedback
      : null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Breadcrumb Navigation */}
        <View style={styles.breadcrumb}>
          <Text style={styles.bcText}>IELTS</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
          <Text style={styles.bcText}>Intensive</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
          <Text style={[styles.bcText, styles.bcActive]}>Result</Text>
        </View>

        {/* Polished Exam Certificate Hero */}
        <View style={[styles.certContainer, { borderColor: bandColor }]}>
          <View style={[styles.certInnerFrame, { borderColor: bandColor + '40' }]}>
            <Text style={[styles.certHeader, { color: bandColor }]}>
              {isPending ? '⏳ GRADING IN PROGRESS' : '🏆 IELTS MOCK EXAM CERTIFICATE'}
            </Text>

            <Text style={[styles.certSubText, { color: colors.textSecondary }]}>
              {isPending
                ? 'Your practice session has been recorded. AI scoring engine is evaluating your performance...'
                : `This is to certify that you have successfully completed the practice mock exam of ${examType.toUpperCase()}`}
            </Text>

            <Text style={[styles.certExamTitle, { color: colors.text }]} numberOfLines={2}>
              {session.exam?.title}
            </Text>

            <View style={styles.certBody}>
              <View style={styles.certScoreContainer}>
                {/* Beautiful Gold/Skill Color Score Seal */}
                <View
                  style={[
                    styles.certSeal,
                    { borderColor: bandColor, backgroundColor: colors.card },
                  ]}
                >
                  <Text style={[styles.certSealBand, { color: bandColor }]}>{bandStr}</Text>
                  <Text style={[styles.certSealText, { color: colors.textSecondary }]}>
                    BAND SCORE
                  </Text>
                </View>

                {/* Verification Stamp & Signature */}
                <View style={styles.certStampContainer}>
                  <View
                    style={[
                      styles.certStamp,
                      isPending && { borderColor: colors.border, backgroundColor: colors.surface },
                    ]}
                  >
                    <Ionicons
                      name={isPending ? 'hourglass-outline' : 'ribbon-outline'}
                      size={18}
                      color={isPending ? colors.textMuted : bandColor}
                    />
                    <Text
                      style={[
                        styles.certStampText,
                        { color: isPending ? colors.textSecondary : bandColor },
                      ]}
                    >
                      {isPending ? 'PROCESSING' : 'AI EVALUATED'}
                    </Text>
                  </View>

                  <View style={styles.certSignatureLine}>
                    <Text
                      style={[
                        styles.certSignature,
                        { color: colors.text, fontFamily: FONTS.medium },
                      ]}
                    >
                      IELTS Master AI
                    </Text>
                    <View style={[styles.certLine, { backgroundColor: colors.border }]} />
                    <Text style={[styles.certSignatureLabel, { color: colors.textMuted }]}>
                      VERIFIED BY
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Descriptive Performance Band Badge */}
            {!isPending && description && (
              <View
                style={[
                  styles.certBadge,
                  { backgroundColor: bandColor + '15', borderColor: bandColor },
                ]}
              >
                <Text style={[styles.certBadgeText, { color: bandColor }]}>{description}</Text>
              </View>
            )}
          </View>
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
              <Text style={styles.statValue}>
                {mm}:{ss}
              </Text>
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
              <TouchableOpacity
                onPress={() => (player.playing ? player.pause() : player.play())}
                style={styles.playBtn}
              >
                <Ionicons name={player.playing ? 'pause' : 'play'} size={20} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.audioBannerText}>
                {player.playing ? 'Playing exam audio' : 'Audio paused'}
              </Text>
            </View>
            <View style={styles.volumeControl}>
              <TouchableOpacity onPress={() => setVolume(Math.max(0, volume - 0.2))}>
                <Ionicons name="volume-low" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              <View style={styles.volumeTrack}>
                <View style={[styles.volumeFill, { width: `${volume * 100}%` }]} />
              </View>
              <TouchableOpacity onPress={() => setVolume(Math.min(1, volume + 0.2))}>
                <Ionicons name="volume-high" size={20} color={colors.textSecondary} />
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
            questionsData={session.exam?.questions}
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
            {retaking ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="refresh-outline" size={18} color="#fff" />
            )}
            <Text style={styles.retakeBtnText}>{retaking ? 'Starting…' : 'Retake Exam'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.shareBtn, sharing && { opacity: 0.7 }]}
            onPress={() =>
              handleShare(
                bandStr,
                rawScore,
                totalQuestions,
                session.exam?.title ?? '',
                examType,
                mm,
                ss,
              )
            }
            disabled={sharing}
            activeOpacity={0.85}
          >
            {sharing ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="share-social-outline" size={18} color={colors.primary} />
            )}
            <Text style={styles.shareBtnText}>{sharing ? 'Sharing…' : 'Share Result'}</Text>
          </TouchableOpacity>

          <Button
            title="Back to Tests"
            variant="outline"
            onPress={() => router.replace(ROUTES.ieltsIntensive)}
            fullWidth
          />
          <View style={{ height: SPACING.sm }} />
          <Button
            title="View All History"
            variant="ghost"
            onPress={() => router.replace(ROUTES.ieltsHistory)}
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    loadingText: { marginTop: SPACING.md, color: colors.textSecondary },
    breadcrumb: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: SPACING.lg,
      paddingTop: SPACING.md,
    },
    bcText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
    bcActive: { color: colors.primary, fontWeight: '700' },
    certContainer: {
      margin: SPACING.lg,
      borderWidth: 3,
      borderRadius: RADIUS.xl,
      padding: 6,
      backgroundColor: isDark ? 'rgba(30, 27, 20, 0.4)' : '#FCFAF6',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 4,
    },
    certInnerFrame: {
      borderWidth: 1,
      borderRadius: RADIUS.lg,
      padding: SPACING.xl,
      alignItems: 'center',
    },
    certHeader: {
      fontSize: 12,
      fontFamily: FONTS.bold,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 2.5,
      marginBottom: SPACING.sm,
      textAlign: 'center',
    },
    certSubText: {
      fontSize: 11,
      fontFamily: FONTS.regular,
      textAlign: 'center',
      marginBottom: SPACING.md,
      lineHeight: 16,
    },
    certExamTitle: {
      fontSize: FONT_SIZES.lg,
      fontFamily: FONTS.bold,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: SPACING.xl,
      paddingHorizontal: SPACING.sm,
    },
    certBody: {
      width: '100%',
      marginBottom: SPACING.lg,
    },
    certScoreContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      width: '100%',
      gap: SPACING.md,
    },
    certSeal: {
      width: 90,
      height: 90,
      borderRadius: 45,
      borderWidth: 3,
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    certSealBand: {
      fontSize: 28,
      fontFamily: FONTS.bold,
      fontWeight: '900',
      lineHeight: 30,
    },
    certSealText: {
      fontSize: 8,
      fontFamily: FONTS.bold,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    certStampContainer: {
      alignItems: 'center',
      gap: SPACING.sm,
    },
    certStamp: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: RADIUS.sm,
      borderWidth: 1,
      borderColor: 'rgba(34, 197, 94, 0.3)',
      backgroundColor: 'rgba(34, 197, 94, 0.06)',
    },
    certStampText: {
      fontSize: 10,
      fontFamily: FONTS.bold,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    certSignatureLine: {
      alignItems: 'center',
      width: 110,
    },
    certSignature: {
      fontSize: 13,
      fontStyle: 'italic',
      marginBottom: 2,
    },
    certLine: {
      height: 1,
      width: '100%',
      marginBottom: 4,
    },
    certSignatureLabel: {
      fontSize: 9,
      fontFamily: FONTS.bold,
      fontWeight: '700',
      letterSpacing: 1,
    },
    certBadge: {
      paddingHorizontal: SPACING.xl,
      paddingVertical: 6,
      borderRadius: RADIUS.full,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: SPACING.sm,
    },
    certBadgeText: {
      fontSize: FONT_SIZES.sm,
      fontFamily: FONTS.bold,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    hero: { alignItems: 'center', padding: SPACING.xxxl, paddingTop: SPACING.lg },
    bandCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 5,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: SPACING.lg,
      backgroundColor: colors.card,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    },
    bandScore: { fontSize: 40, fontWeight: '900', lineHeight: 44 },
    bandLabel: {
      fontSize: FONT_SIZES.xs,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    resultTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    description: {
      fontSize: FONT_SIZES.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    audioBannerContainer: {
      marginHorizontal: SPACING.lg,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#C7D2FE',
      backgroundColor: isDark ? colors.card : '#EEF2FF',
      overflow: 'hidden',
    },
    audioBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
      padding: SPACING.md,
    },
    playBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    audioBannerText: {
      fontSize: FONT_SIZES.sm,
      color: isDark ? colors.text : colors.primary,
      fontWeight: '600',
    },
    volumeControl: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      paddingHorizontal: SPACING.md,
      paddingBottom: SPACING.md,
    },
    volumeTrack: {
      flex: 1,
      height: 6,
      backgroundColor: isDark ? colors.border : '#E0E7FF',
      borderRadius: 3,
      overflow: 'hidden',
    },
    volumeFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
    examTitle: { fontSize: FONT_SIZES.sm, color: colors.textMuted, textAlign: 'center' },
    statsRow: {
      flexDirection: 'row',
      marginHorizontal: SPACING.lg,
      marginTop: SPACING.md,
      backgroundColor: colors.card,
      borderRadius: RADIUS.xl,
      padding: SPACING.lg,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    statCard: { flex: 1, alignItems: 'center' },
    statMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border },
    statValue: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: colors.text },
    statLabel: { fontSize: FONT_SIZES.xs, color: colors.textSecondary, marginTop: 2 },
    section: { paddingHorizontal: SPACING.lg, marginTop: SPACING.xl },
    sectionTitle: {
      fontSize: FONT_SIZES.md,
      fontWeight: '700',
      color: colors.text,
      marginBottom: SPACING.md,
    },
    barBg: { height: 12, backgroundColor: colors.border, borderRadius: 6, overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: 6 },
    barLabel: {
      marginTop: SPACING.sm,
      fontSize: FONT_SIZES.sm,
      color: colors.textSecondary,
      textAlign: 'right',
    },
    actions: { padding: SPACING.xl, marginTop: SPACING.lg, gap: SPACING.sm },
    // Retake button
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.sm,
      borderRadius: RADIUS.xl,
      paddingVertical: 14,
    },
    retakeBtn: { backgroundColor: colors.primary },
    retakeBtnText: { color: '#fff', fontSize: FONT_SIZES.md, fontWeight: '700' },
    // Share button
    shareBtn: {
      backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : colors.primary + '12',
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    shareBtnText: { color: colors.primary, fontSize: FONT_SIZES.md, fontWeight: '700' },
  });
