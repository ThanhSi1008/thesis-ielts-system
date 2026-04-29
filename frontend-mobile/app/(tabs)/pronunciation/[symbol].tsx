/**
 * Pronunciation Detail Screen — /pronunciation/[symbol]
 * Shows example words for a phonetic symbol with AI recorder + smart polling
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useAudioRecorderHook } from '@/hooks/useAudioRecorder';
import { learningApi } from '@/services/learning.api';

// ─── Example words per symbol ─────────────────────────────────────────────────
const EXAMPLE_WORDS: Record<string, { word: string; sentence: string }[]> = {
  'iː': [{ word: 'sleep', sentence: 'I need to sleep.' }, { word: 'tree', sentence: 'The tree is tall.' }, { word: 'see', sentence: 'Can you see it?' }],
  'ɪ': [{ word: 'slip', sentence: 'Don\'t slip on ice.' }, { word: 'sit', sentence: 'Please sit down.' }, { word: 'big', sentence: 'It\'s a big house.' }],
  'ʊ': [{ word: 'good', sentence: 'That\'s a good idea.' }, { word: 'book', sentence: 'Read this book.' }, { word: 'put', sentence: 'Put it here.' }],
  'uː': [{ word: 'food', sentence: 'The food is ready.' }, { word: 'moon', sentence: 'The moon is bright.' }, { word: 'shoe', sentence: 'My shoe is new.' }],
  'e': [{ word: 'bed', sentence: 'Time for bed.' }, { word: 'red', sentence: 'A red apple.' }, { word: 'ten', sentence: 'Count to ten.' }],
  'ə': [{ word: 'teacher', sentence: 'She is a teacher.' }, { word: 'about', sentence: 'Tell me about it.' }, { word: 'sofa', sentence: 'Sit on the sofa.' }],
  'ɜː': [{ word: 'bird', sentence: 'A bird is singing.' }, { word: 'word', sentence: 'What\'s the word?' }, { word: 'turn', sentence: 'It\'s your turn.' }],
  'ɔː': [{ word: 'door', sentence: 'Open the door.' }, { word: 'four', sentence: 'I have four books.' }, { word: 'saw', sentence: 'I saw a film.' }],
  'æ': [{ word: 'cat', sentence: 'The cat sleeps.' }, { word: 'man', sentence: 'A tall man.' }, { word: 'back', sentence: 'Come back soon.' }],
  'ʌ': [{ word: 'up', sentence: 'Look up at the sky.' }, { word: 'cup', sentence: 'A cup of tea.' }, { word: 'run', sentence: 'Let\'s run fast.' }],
  'ɑː': [{ word: 'far', sentence: 'It\'s not far away.' }, { word: 'car', sentence: 'My car is fast.' }, { word: 'heart', sentence: 'Follow your heart.' }],
  'ɒ': [{ word: 'on', sentence: 'Turn it on.' }, { word: 'hot', sentence: 'The soup is hot.' }, { word: 'dog', sentence: 'A small dog.' }],
  'ɪə': [{ word: 'here', sentence: 'Come here please.' }, { word: 'ear', sentence: 'My ear hurts.' }, { word: 'beer', sentence: 'A glass of beer.' }],
  'eɪ': [{ word: 'wait', sentence: 'Please wait here.' }, { word: 'day', sentence: 'Have a nice day.' }, { word: 'name', sentence: 'What\'s your name?' }],
  'ʊə': [{ word: 'tourist', sentence: 'He is a tourist.' }, { word: 'sure', sentence: 'Are you sure?' }, { word: 'pure', sentence: 'Pure water.' }],
  'ɔɪ': [{ word: 'boy', sentence: 'A young boy.' }, { word: 'oil', sentence: 'Cook in oil.' }, { word: 'join', sentence: 'Join the team.' }],
  'əʊ': [{ word: 'show', sentence: 'Show me the way.' }, { word: 'go', sentence: 'Let\'s go now.' }, { word: 'home', sentence: 'Go home.' }],
  'eə': [{ word: 'hair', sentence: 'Nice hair!' }, { word: 'care', sentence: 'Take care.' }, { word: 'there', sentence: 'It\'s over there.' }],
  'aɪ': [{ word: 'my', sentence: 'It\'s my turn.' }, { word: 'time', sentence: 'What time is it?' }, { word: 'night', sentence: 'Good night.' }],
  'aʊ': [{ word: 'cow', sentence: 'A black cow.' }, { word: 'now', sentence: 'Do it now.' }, { word: 'out', sentence: 'Come out here.' }],
  'p': [{ word: 'pen', sentence: 'Pass the pen.' }, { word: 'park', sentence: 'Meet at the park.' }, { word: 'cup', sentence: 'Fill the cup.' }],
  'b': [{ word: 'boat', sentence: 'A small boat.' }, { word: 'big', sentence: 'Very big.' }, { word: 'cab', sentence: 'Take a cab.' }],
  't': [{ word: 'tea', sentence: 'Hot tea.' }, { word: 'time', sentence: 'No more time.' }, { word: 'cat', sentence: 'A cute cat.' }],
  'd': [{ word: 'dog', sentence: 'Walk the dog.' }, { word: 'day', sentence: 'A sunny day.' }, { word: 'bad', sentence: 'That\'s bad.' }],
  'ʧ': [{ word: 'cheese', sentence: 'Extra cheese.' }, { word: 'chair', sentence: 'Pull up a chair.' }, { word: 'watch', sentence: 'Watch the clock.' }],
  'ʤ': [{ word: 'job', sentence: 'A good job.' }, { word: 'age', sentence: 'What\'s your age?' }, { word: 'jump', sentence: 'Jump over it.' }],
  'k': [{ word: 'car', sentence: 'Drive a car.' }, { word: 'key', sentence: 'Lost my key.' }, { word: 'back', sentence: 'Turn back.' }],
  'g': [{ word: 'go', sentence: 'Ready to go.' }, { word: 'great', sentence: 'That\'s great.' }, { word: 'big', sentence: 'Too big.' }],
  'f': [{ word: 'fly', sentence: 'Watch it fly.' }, { word: 'fan', sentence: 'Turn on the fan.' }, { word: 'off', sentence: 'Turn it off.' }],
  'v': [{ word: 'van', sentence: 'Drive the van.' }, { word: 'very', sentence: 'Very good.' }, { word: 'love', sentence: 'I love it.' }],
  'θ': [{ word: 'think', sentence: 'Think first.' }, { word: 'three', sentence: 'Three more.' }, { word: 'math', sentence: 'I like math.' }],
  'ð': [{ word: 'this', sentence: 'This is mine.' }, { word: 'the', sentence: 'The end.' }, { word: 'with', sentence: 'Come with me.' }],
  's': [{ word: 'see', sentence: 'I can see.' }, { word: 'sit', sentence: 'Sit here.' }, { word: 'pass', sentence: 'Pass the test.' }],
  'z': [{ word: 'zoo', sentence: 'Visit the zoo.' }, { word: 'zip', sentence: 'Zip it up.' }, { word: 'buzz', sentence: 'I hear a buzz.' }],
  'ʃ': [{ word: 'she', sentence: 'She is kind.' }, { word: 'show', sentence: 'Show the way.' }, { word: 'push', sentence: 'Push the door.' }],
  'ʒ': [{ word: 'measure', sentence: 'Measure it.' }, { word: 'vision', sentence: 'Great vision.' }, { word: 'beige', sentence: 'Beige walls.' }],
  'm': [{ word: 'man', sentence: 'A kind man.' }, { word: 'make', sentence: 'Make it happen.' }, { word: 'home', sentence: 'Go home.' }],
  'n': [{ word: 'now', sentence: 'Do it now.' }, { word: 'night', sentence: 'Good night.' }, { word: 'ten', sentence: 'Ten seconds.' }],
  'ŋ': [{ word: 'sing', sentence: 'Sing a song.' }, { word: 'ring', sentence: 'The ring fits.' }, { word: 'long', sentence: 'A long road.' }],
  'h': [{ word: 'hot', sentence: 'It\'s hot today.' }, { word: 'here', sentence: 'Stay here.' }, { word: 'help', sentence: 'I need help.' }],
  'l': [{ word: 'love', sentence: 'Show some love.' }, { word: 'let', sentence: 'Let it go.' }, { word: 'full', sentence: 'I\'m full.' }],
  'r': [{ word: 'red', sentence: 'A red rose.' }, { word: 'run', sentence: 'Run faster.' }, { word: 'very', sentence: 'Very well.' }],
  'w': [{ word: 'wet', sentence: 'The floor is wet.' }, { word: 'win', sentence: 'We will win.' }, { word: 'away', sentence: 'Go away.' }],
  'j': [{ word: 'yes', sentence: 'Yes, I agree.' }, { word: 'you', sentence: 'How are you?' }, { word: 'yet', sentence: 'Not yet.' }],
};

// Symbol → color map (mirrors web)
const SYMBOL_COLORS: Record<string, { bg: string; text: string }> = {
  monophthong: { bg: '#FEF08A', text: '#1a1a2e' },
  diphthong:   { bg: '#FCA5A5', text: '#7f1d1d' },
  consonant:   { bg: '#F3F4F6', text: '#374151' },
};

const SYMBOL_TYPES: Record<string, keyof typeof SYMBOL_COLORS> = {
  'iː': 'monophthong', 'ɪ': 'monophthong', 'ʊ': 'monophthong', 'uː': 'monophthong',
  'e': 'monophthong', 'ə': 'monophthong', 'ɜː': 'monophthong', 'ɔː': 'monophthong',
  'æ': 'monophthong', 'ʌ': 'monophthong', 'ɑː': 'monophthong', 'ɒ': 'monophthong',
  'ɪə': 'diphthong', 'eɪ': 'diphthong', 'ʊə': 'diphthong', 'ɔɪ': 'diphthong',
  'əʊ': 'diphthong', 'eə': 'diphthong', 'aɪ': 'diphthong', 'aʊ': 'diphthong',
};

// ─── Exponential Backoff Poller ───────────────────────────────────────────────
function useExponentialPoller() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Start polling with exponential backoff.
   *  Intervals: 1s → 2s → 4s → 4s → ... until timeout (default 60s) */
  const startPolling = useCallback(
    (
      fn: () => Promise<boolean>, // return true to stop polling
      opts: { maxMs?: number } = {}
    ) => {
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
    []
  );

  const stopPolling = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // Cleanup on unmount
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
}

function WordCard({ word, sentence, index, userId }: WordCardProps) {
  const { isRecording, startRecording, stopRecording } = useAudioRecorderHook();
  const [status, setStatus] = useState<PracticeStatus>('idle');
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const { startPolling, stopPolling } = useExponentialPoller();

  const handleToggle = useCallback(async () => {
    if (status === 'recording' || isRecording) {
      // Stop recording → submit
      setStatus('processing');
      const uri = await stopRecording();
      if (!uri) { setStatus('idle'); return; }

      try {
        const res: any = await learningApi.checkPronunciation(uri, userId, { targetWord: word });
        if (!res?.attemptId) throw new Error('No attemptId returned');

        startPolling(async () => {
          try {
            const attempts: any[] = await learningApi.getUserPronunciationAttempts(userId);
            const attempt = attempts?.find((a: any) => a.id === res.attemptId);

            if (attempt?.status === 'COMPLETED') {
              const pronScore = attempt.score ?? 0;
              setScore(pronScore);
              setFeedback(attempt.feedback?.level ?? null);
              setStatus('done');
              if (pronScore >= 80) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              } else {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
        }, { maxMs: 60_000 });

      } catch (err: any) {
        setErrMsg(err?.message ?? 'Upload failed.');
        setStatus('error');
      }
    } else {
      // Start recording
      setStatus('recording');
      setScore(null);
      setFeedback(null);
      setErrMsg(null);
      await startRecording();
    }
  }, [status, isRecording, word, userId, startRecording, stopRecording, startPolling]);

  const reset = useCallback(() => {
    stopPolling();
    setStatus('idle');
    setScore(null);
    setFeedback(null);
    setErrMsg(null);
  }, [stopPolling]);

  const scoreColor = score !== null
    ? score >= 80 ? '#059669' : score >= 50 ? '#D97706' : '#DC2626'
    : COLORS.textMuted;

  return (
    <Animated.View entering={FadeInDown.delay(index * 100)} style={styles.wordCard}>
      {/* Word + sentence */}
      <View style={styles.wordCardInfo}>
        <Text style={styles.wordText}>{word}</Text>
        <Text style={styles.sentenceText}>{sentence}</Text>
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
            <Text style={styles.errorText}>{errMsg}</Text>
            <TouchableOpacity onPress={reset}>
              <Text style={styles.retryText}>Retry</Text>
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
            {status === 'recording' && (
              <View style={styles.recordingDot} />
            )}
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

  const decoded = decodeURIComponent(symbol ?? '');
  const examples = EXAMPLE_WORDS[decoded] ?? [{ word: decoded, sentence: '' }];
  const typeKey = SYMBOL_TYPES[decoded] ?? 'consonant';
  const colors = SYMBOL_COLORS[typeKey];

  const typeLabel = typeKey === 'monophthong'
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
      >
        <Text style={styles.sectionLabel}>PRACTICE WORDS</Text>

        {user ? (
          examples.map((ex, i) => (
            <WordCard
              key={ex.word}
              word={ex.word}
              sentence={ex.sentence}
              index={i}
              userId={user.id}
            />
          ))
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
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  symbolBadge: {
    width: 56, height: 56, borderRadius: RADIUS.lg,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  symbolText: { fontSize: 26, fontFamily: FONTS.bold },
  headerMeta: { flex: 1 },
  symbolLabel: { fontSize: FONT_SIZES.xl, fontFamily: FONTS.bold, color: COLORS.text },
  typeLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontFamily: FONTS.regular },

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
  tipText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 18, fontFamily: FONTS.regular },

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
  wordCardInfo: { flex: 1, gap: 6 },
  wordText: { fontSize: FONT_SIZES.xl, fontFamily: FONTS.bold, color: COLORS.text },
  sentenceText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontFamily: FONTS.regular, opacity: 0.8 },

  recorderSide: { marginLeft: SPACING.md, alignItems: 'center', minWidth: 60 },

  micBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: COLORS.primary + '40',
  },
  micBtnActive: {
    backgroundColor: '#EF4444',
    borderColor: '#DC2626',
  },
  recordingDot: {
    position: 'absolute',
    top: 6, right: 6,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#fff',
  },

  processingBox: { alignItems: 'center', gap: 4 },
  processingText: { fontSize: 10, color: COLORS.textSecondary, fontFamily: FONTS.medium },

  scoreBox: { alignItems: 'center' },
  scoreNumber: { fontSize: FONT_SIZES.xxl, fontFamily: FONTS.bold, lineHeight: 28 },
  scoreMax: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: -2, fontFamily: FONTS.regular },
  scoreLevel: { fontSize: 10, fontFamily: FONTS.bold, textTransform: 'uppercase', marginTop: 2 },
  retryBtn: { marginTop: 4 },

  errorBox: { alignItems: 'center' },
  errorText: { fontSize: 10, color: '#EF4444', textAlign: 'center', maxWidth: 64, fontFamily: FONTS.regular },
  retryText: { fontSize: 11, color: COLORS.primary, fontFamily: FONTS.bold, marginTop: 4 },

  loginPrompt: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: SPACING.sm,
  },
  loginTitle: { fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold, color: COLORS.text },
  loginSub: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, textAlign: 'center', fontFamily: FONTS.regular },
});
