/**
 * Pronunciation Detail Screen — /pronunciation/[symbol]
 * Shows example words for a phonetic symbol with AI recorder + smart polling + backend data
 *
 * Polling strategy: Exponential backoff (1s → 2s → 4s → 4s… max 4s)
 * Rationale: Fast first check (AI sometimes returns in <2s), then backs off
 * to avoid hammering the server. Timeout 60s. Cleans up on unmount.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useAudioRecorderHook } from '@/hooks/useAudioRecorder';
import { learningApi, pronunciationApi } from '@/services/learning.api';
import type { FoundationPronunciationSound, WordProgress } from '@/types';

// ─── Local fallback example sentences (to enrich UI) ───────────────────────────
const SENTENCE_FALLBACKS: Record<string, string> = {
  sleep: 'I need to sleep.',
  tree: 'The tree is tall.',
  see: 'Can you see it?',
  slip: "Don't slip on ice.",
  sit: 'Please sit down.',
  big: "It's a big house.",
  good: "That's a good idea.",
  book: 'Read this book.',
  put: 'Put it here.',
  food: 'The food is ready.',
  moon: 'The moon is bright.',
  shoe: 'My shoe is new.',
  bed: 'Time for bed.',
  red: 'A red apple.',
  ten: 'Count to ten.',
  teacher: 'She is a teacher.',
  about: 'Tell me about it.',
  sofa: 'Sit on the sofa.',
  bird: 'A bird is singing.',
  word: "What's the word?",
  turn: "It's your turn.",
  door: 'Open the door.',
  four: 'I have four books.',
  saw: 'I saw a film.',
  cat: 'The cat sleeps.',
  man: 'A tall man.',
  back: 'Come back soon.',
  up: 'Look up at the sky.',
  cup: 'A cup of tea.',
  run: "Let's run fast.",
  far: "It's not far away.",
  car: 'My car is fast.',
  heart: 'Follow your heart.',
  on: 'Turn it on.',
  hot: 'The soup is hot.',
  dog: 'A small dog.',
  here: 'Come here please.',
  ear: 'My ear hurts.',
  beer: 'A glass of beer.',
  wait: 'Please wait here.',
  day: 'Have a nice day.',
  name: "What's your name?",
  tourist: 'He is a tourist.',
  sure: 'Are you sure?',
  pure: 'Pure water.',
  boy: 'A young boy.',
  oil: 'Cook in oil.',
  join: 'Join the team.',
  show: 'Show me the way.',
  go: "Let's go now.",
  home: 'Go home.',
  hair: 'Nice hair!',
  care: 'Take care.',
  there: "It's over there.",
  my: "It's my turn.",
  time: 'What time is it?',
  night: 'Good night.',
  cow: 'A black cow.',
  now: 'Do it now.',
  out: 'Come out here.',
  pen: 'Pass the pen.',
  park: 'Meet at the park.',
  boat: 'A small boat.',
  cab: 'Take a cab.',
  tea: 'Hot tea.',
  bad: "That's bad.",
  cheese: 'Extra cheese.',
  chair: 'Pull up a chair.',
  watch: 'Watch the clock.',
  job: 'A good job.',
  age: "What's your age?",
  jump: 'Jump over it.',
  key: 'Lost my key.',
  great: "That's great.",
  fly: 'Watch it fly.',
  fan: 'Turn on the fan.',
  off: 'Turn it off.',
  van: 'Drive the van.',
  very: 'Very good.',
  love: 'I love it.',
  think: 'Think first.',
  three: 'Three more.',
  math: 'I like math.',
  this: 'This is mine.',
  the: 'The end.',
  with: 'Come with me.',
  pass: 'Pass the test.',
  zoo: 'Visit the zoo.',
  zip: 'Zip it up.',
  buzz: 'I hear a buzz.',
  she: 'She is kind.',
  push: 'Push the door.',
  measure: 'Measure it.',
  vision: 'Great vision.',
  beige: 'Beige walls.',
  make: 'Make it happen.',
  sing: 'Sing a song.',
  ring: 'The ring fits.',
  long: 'A long road.',
  help: 'I need help.',
  let: 'Let it go.',
  full: "I'm full.",
  rose: 'A red rose.',
  win: 'We will win.',
  away: 'Go away.',
  yes: 'Yes, I agree.',
  you: 'How are you?',
  yet: 'Not yet.',
};

// Symbol → color map
const SYMBOL_COLORS: Record<string, { bg: string; text: string }> = {
  monophthong: { bg: '#FEF08A', text: '#1a1a2e' },
  diphthong: { bg: '#FCA5A5', text: '#7f1d1d' },
  consonant: { bg: '#F3F4F6', text: '#374151' },
};

// ─── Exponential Backoff Poller ───────────────────────────────────────────────
function useExponentialPoller() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startPolling = useCallback(
    (fn: () => Promise<boolean>, opts: { maxMs?: number } = {}) => {
      const maxMs = opts.maxMs ?? 60_000;
      const start = Date.now();
      let delay = 1_000;

      const tick = async () => {
        if (Date.now() - start >= maxMs) {
          fn(); // final attempt
          return;
        }
        const done = await fn();
        if (!done) {
          delay = Math.min(delay * 2, 4_000); // exponential backoff, cap at 4s
          timerRef.current = setTimeout(tick, delay);
        }
      };

      timerRef.current = setTimeout(tick, delay);
    },
    [],
  );

  const stopPolling = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  return { startPolling, stopPolling };
}

// ─── Word Practice Card ───────────────────────────────────────────────────────
type PracticeStatus = 'idle' | 'recording' | 'processing' | 'done' | 'error';

interface WordCardProps {
  word: string;
  sentence: string;
  index: number;
  userId: string;
  soundId: string;
  initialProgress?: WordProgress;
  onSuccess?: () => void;
}

function WordCard({
  word,
  sentence,
  index,
  userId,
  soundId,
  initialProgress,
  onSuccess,
}: WordCardProps) {
  const { isRecording, startRecording, stopRecording } = useAudioRecorderHook();
  const [status, setStatus] = useState<PracticeStatus>('idle');
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const { startPolling, stopPolling } = useExponentialPoller();

  const handleToggle = useCallback(async () => {
    if (status === 'recording' || isRecording) {
      setStatus('processing');
      const uri = await stopRecording();
      if (!uri) {
        setStatus('idle');
        return;
      }

      try {
        const res: any = await learningApi.checkPronunciation(uri, userId, { targetWord: word });
        if (!res?.attemptId) throw new Error('No attemptId returned');

        startPolling(
          async () => {
            try {
              const attempts: any[] = await learningApi.getUserPronunciationAttempts(userId);
              const attempt = attempts?.find((a: any) => a.id === res.attemptId);

              if (attempt?.status === 'COMPLETED') {
                const pronScore = attempt.score ?? 0;
                setScore(pronScore);
                setFeedback(attempt.feedback?.level ?? null);
                setStatus('done');

                // Save overall progress for this sound
                try {
                  await pronunciationApi.updateProgress(soundId, pronScore);
                } catch (e) {
                  console.error('[WordCard] Failed to update overall sound progress:', e);
                }

                if (pronScore >= 80) {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                } else {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }

                if (onSuccess) {
                  onSuccess();
                }
                return true; // stop polling
              }
              if (attempt?.status === 'FAILED') {
                setErrMsg('Analysis failed. Try again.');
                setStatus('error');
                return true;
              }
            } catch (_) {}
            return false; // continue polling
          },
          { maxMs: 60_000 },
        );
      } catch (err: any) {
        setErrMsg(err?.message ?? 'Upload failed.');
        setStatus('error');
      }
    } else {
      setStatus('recording');
      setScore(null);
      setFeedback(null);
      setErrMsg(null);
      await startRecording();
    }
  }, [status, isRecording, word, userId, soundId, startRecording, stopRecording, startPolling, onSuccess]);

  const reset = useCallback(() => {
    stopPolling();
    setStatus('idle');
    setScore(null);
    setFeedback(null);
    setErrMsg(null);
  }, [stopPolling]);

  const scoreColor =
    score !== null
      ? score >= 80
        ? '#059669'
        : score >= 50
          ? '#D97706'
          : '#DC2626'
      : COLORS.textMuted;

  // Render status indicator from backend
  const renderBackendProgress = () => {
    if (!initialProgress) return null;
    const { status: wordStatus, bestScore, attemptCount } = initialProgress;
    if (wordStatus === 'NEW') return null;

    const progressColor = wordStatus === 'MASTERED' ? '#059669' : '#D97706';

    return (
      <View style={styles.backendProgressRow}>
        <View style={[styles.statusDot, { backgroundColor: progressColor }]} />
        <Text style={[styles.backendProgressText, { color: progressColor }]}>
          {wordStatus} · Best: {bestScore}% ({attemptCount} tries)
        </Text>
      </View>
    );
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 100)} style={styles.wordCard}>
      {/* Word + sentence */}
      <View style={styles.wordCardInfo}>
        <View style={styles.wordTitleRow}>
          <Text style={styles.wordText}>{word}</Text>
          {initialProgress?.status === 'MASTERED' && (
            <View style={styles.masteredBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#059669" />
            </View>
          )}
        </View>
        <Text style={styles.sentenceText}>{sentence}</Text>
        {renderBackendProgress()}
      </View>

      {/* Right side: recorder control */}
      <View style={styles.recorderSide}>
        {status === 'processing' ? (
          <View style={styles.processingBox}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.processingText}>Analyzing…</Text>
          </View>
        ) : status === 'done' && score !== null ? (
          <Animated.View entering={ZoomIn} style={styles.scoreBox}>
            <Text style={[styles.scoreNumber, { color: scoreColor }]}>{Math.round(score)}</Text>
            <Text style={styles.scoreMax}>/100</Text>
            {feedback && <Text style={[styles.scoreLevel, { color: scoreColor }]}>{feedback}</Text>}
            <TouchableOpacity onPress={reset} style={styles.retryBtn} hitSlop={8}>
              <Ionicons name="refresh" size={12} color={COLORS.textMuted} />
            </TouchableOpacity>
          </Animated.View>
        ) : status === 'error' ? (
          <View style={styles.errorBox}>
            <Text style={styles.recorderErrorText}>{errMsg}</Text>
            <TouchableOpacity onPress={reset}>
              <Text style={styles.recorderRetryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.micBtn, status === 'recording' && styles.micBtnActive]}
            onPress={handleToggle}
            accessibilityLabel={status === 'recording' ? 'Stop' : 'Record'}
          >
            <Ionicons
              name={status === 'recording' ? 'stop' : 'mic'}
              size={22}
              color={status === 'recording' ? '#fff' : COLORS.primary}
            />
            {status === 'recording' && <View style={styles.recordingDot} />}
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SoundDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [sound, setSound] = useState<FoundationPronunciationSound | null>(null);
  const [wordProgresses, setWordProgresses] = useState<WordProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const decoded = decodeURIComponent(symbol ?? '');

  const fetchSoundData = useCallback(async (showSkeleton = true) => {
    if (showSkeleton) setLoading(true);
    setError(null);
    try {
      // 1. Fetch sound details from backend
      const detail = await pronunciationApi.getSound(decoded);
      setSound(detail);

      // 2. Fetch word progress if user is logged in
      if (user && detail?.id) {
        const progressList = await pronunciationApi.getWordProgress(detail.id);
        setWordProgresses(progressList || []);
      }
    } catch (err: any) {
      console.error('[SoundDetailScreen] Error fetching sound:', err);
      setError(err?.message || 'Failed to load sound detail');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [decoded, user]);

  useEffect(() => {
    fetchSoundData();
  }, [fetchSoundData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSoundData(false);
  }, [fetchSoundData]);

  const handleWordSuccess = useCallback(() => {
    // Silent refetch word progress after successful attempt
    if (user && sound?.id) {
      pronunciationApi.getWordProgress(sound.id)
        .then((progressList) => setWordProgresses(progressList || []))
        .catch((err) => console.error('[SoundDetailScreen] Silent progress update failed:', err));
    }
  }, [user, sound]);

  const typeKey = sound?.type ?? 'consonant';
  const colors = SYMBOL_COLORS[typeKey] ?? SYMBOL_COLORS.consonant;

  const typeLabel =
    typeKey === 'monophthong'
      ? 'Monophthong · Pure Vowel'
      : typeKey === 'diphthong'
        ? 'Diphthong · Gliding Vowel'
        : 'Consonant';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={[styles.symbolBadge, { backgroundColor: colors.bg }]}>
          <Text style={[styles.symbolText, { color: colors.text }]}>{decoded}</Text>
        </View>
        <View style={styles.headerMeta}>
          <Text style={styles.symbolLabel}>/{decoded}/</Text>
          <Text style={styles.typeLabel}>{typeLabel}</Text>
        </View>
      </View>

      {/* Description and Tip */}
      {sound?.description && (
        <View style={styles.descBanner}>
          <Text style={styles.descTitle}>💡 Pronunciation Tip</Text>
          <Text style={styles.descText}>{sound.description}</Text>
          {sound.tip && <Text style={styles.tipDetail}>💡 {sound.tip}</Text>}
        </View>
      )}

      {/* ── Tip banner ── */}
      <View style={styles.tipBanner}>
        <Ionicons name="bulb-outline" size={16} color={COLORS.primary} />
        <Text style={styles.tipText}>
          Tap the mic next to each word and say it clearly. AI will score your pronunciation.
        </Text>
      </View>

      {/* ── Practice words ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        <Text style={styles.sectionLabel}>PRACTICE WORDS</Text>

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading exercises...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <Text style={styles.retryText} onPress={() => fetchSoundData()}>Tap to retry</Text>
          </View>
        ) : user && sound ? (
          sound.exampleWords && sound.exampleWords.length > 0 ? (
            sound.exampleWords.map((ex, i) => {
              const localSentence = SENTENCE_FALLBACKS[ex.word.toLowerCase()] ?? `Practice saying the word: ${ex.word}`;
              const progressObj = wordProgresses.find((p) => p.word.toLowerCase() === ex.word.toLowerCase());

              return (
                <WordCard
                  key={ex.id || ex.word}
                  word={ex.word}
                  sentence={localSentence}
                  index={i}
                  userId={user.id}
                  soundId={sound.id}
                  initialProgress={progressObj}
                  onSuccess={handleWordSuccess}
                />
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No examples available for this sound.</Text>
            </View>
          )
        ) : (
          <View style={styles.loginPrompt}>
            <Ionicons name="lock-closed-outline" size={32} color={COLORS.textMuted} />
            <Text style={styles.loginTitle}>Log in to practice</Text>
            <Text style={styles.loginSub}>Create an account to get AI pronunciation feedback.</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolBadge: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  symbolText: { fontSize: 26, fontFamily: FONTS.bold },
  headerMeta: { flex: 1 },
  symbolLabel: { fontSize: FONT_SIZES.xl, fontFamily: FONTS.bold, color: COLORS.text },
  typeLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontFamily: FONTS.regular },

  descBanner: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  descTitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 4,
  },
  descText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 16,
    fontFamily: FONTS.regular,
  },
  tipDetail: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },

  tipBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary + '12',
    margin: SPACING.lg,
    marginBottom: 0,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '25',
  },
  tipText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 18,
    fontFamily: FONTS.regular,
  },

  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg },
  sectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.bold,
    color: COLORS.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
  },

  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
  },
  errorContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semibold,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  retryText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    textDecorationLine: 'underline',
  },

  wordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  wordCardInfo: { flex: 1, gap: 4 },
  wordTitleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  wordText: { fontSize: FONT_SIZES.xl, fontFamily: FONTS.bold, color: COLORS.text },
  masteredBadge: { justifyContent: 'center' },
  sentenceText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    opacity: 0.8,
  },
  backendProgressRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  backendProgressText: { fontSize: 10, fontFamily: FONTS.bold, textTransform: 'uppercase' },

  recorderSide: { marginLeft: SPACING.md, alignItems: 'center', minWidth: 60 },

  micBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary + '40',
  },
  micBtnActive: {
    backgroundColor: '#EF4444',
    borderColor: '#DC2626',
  },
  recordingDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },

  processingBox: { alignItems: 'center', gap: 4 },
  processingText: { fontSize: 10, color: COLORS.textSecondary, fontFamily: FONTS.medium },

  scoreBox: { alignItems: 'center' },
  scoreNumber: { fontSize: FONT_SIZES.xxl, fontFamily: FONTS.bold, lineHeight: 28 },
  scoreMax: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: -2,
    fontFamily: FONTS.regular,
  },
  scoreLevel: { fontSize: 10, fontFamily: FONTS.bold, textTransform: 'uppercase', marginTop: 2 },
  retryBtn: { marginTop: 4 },

  errorBox: { alignItems: 'center' },
  recorderErrorText: {
    fontSize: 10,
    color: '#EF4444',
    textAlign: 'center',
    maxWidth: 64,
    fontFamily: FONTS.regular,
  },
  recorderRetryText: { fontSize: 11, color: COLORS.primary, fontFamily: FONTS.bold, marginTop: 4 },

  emptyContainer: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm, fontFamily: FONTS.regular },

  loginPrompt: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: SPACING.sm,
  },
  loginTitle: { fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold, color: COLORS.text },
  loginSub: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontFamily: FONTS.regular,
  },
});
