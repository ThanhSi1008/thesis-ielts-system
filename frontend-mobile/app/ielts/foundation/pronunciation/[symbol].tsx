/**
 * IELTS Pronunciation Detail — /ielts/foundation/pronunciation/[symbol]
 * Synced with web frontend page and improved for a premium mobile experience.
 */
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAudioPlayer } from 'expo-audio';

import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS, API_BASE_URL } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAudioRecorderHook } from '@/hooks/useAudioRecorder';
import { learningApi, pronunciationApi } from '@/services/learning.api';
import type { FoundationPronunciationSound, WordProgress } from '@/types';
import { Breadcrumb } from '@/components';
import WordProgressCounter from '@/components/foundation/WordProgressCounter';

// ─── Local fallback example sentences ───────────────────────────────────────────
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

// Vowel/Consonant theme colors
const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  monophthong: { bg: '#FEF08A', text: '#1a1a2e' },
  diphthong: { bg: '#FCA5A5', text: '#7f1d1d' },
  consonant: { bg: '#E2E8F0', text: '#1E293B' },
};

// URL helper to prepend API_BASE_URL for relative backend assets (audio/images)
const getFullUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE_URL}${cleanUrl}`;
};

// ─── Exponential Backoff Poller ───────────────────────────────────────────────
function useExponentialPoller() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startPolling = useCallback((fn: () => Promise<boolean>, opts: { maxMs?: number } = {}) => {
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
        delay = Math.min(delay * 2, 4_000);
        timerRef.current = setTimeout(tick, delay);
      }
    };

    timerRef.current = setTimeout(tick, delay);
  }, []);

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
  ipa?: string;
  sentence: string;
  index: number;
  userId: string;
  soundId: string;
  audioUrl?: string;
  initialProgress?: WordProgress;
  onSuccess?: () => void;
}

function WordCard({
  word,
  ipa,
  sentence,
  index,
  userId,
  soundId,
  audioUrl,
  initialProgress,
  onSuccess,
}: WordCardProps) {
  const { colors, isDark } = useTheme();
  const { isRecording, startRecording, stopRecording } = useAudioRecorderHook();
  const [status, setStatus] = useState<PracticeStatus>('idle');
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const { startPolling, stopPolling } = useExponentialPoller();

  // Play word example audio using expo-audio
  const player = useAudioPlayer(audioUrl ? getFullUrl(audioUrl) : '');

  const playWordAudio = () => {
    if (!audioUrl || !player) return;
    try {
      setIsAudioPlaying(true);
      player.seekTo(0);
      player.play();
      
      // Auto-reset playing state after 2 seconds or audio duration
      setTimeout(() => setIsAudioPlaying(false), 2000);
    } catch (e) {
      if (__DEV__) console.log('Word audio playback error', e);
      setIsAudioPlaying(false);
    }
  };

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

                // Update sound-level progress
                try {
                  await pronunciationApi.updateProgress(soundId, pronScore);
                } catch (e) {
                  if (__DEV__) console.error('[WordCard] Failed to update sound progress:', e);
                }

                if (pronScore >= 80) {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                } else {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }

                if (onSuccess) {
                  onSuccess();
                }
                return true; // Stop polling
              }
              if (attempt?.status === 'FAILED') {
                setErrMsg('Analysis failed. Try again.');
                setStatus('error');
                return true;
              }
            } catch (_) {}
            return false; // Continue polling
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
  }, [
    status,
    isRecording,
    word,
    userId,
    soundId,
    startRecording,
    stopRecording,
    startPolling,
    onSuccess,
  ]);

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
        ? '#10B981' // Green
        : score >= 50
        ? '#F59E0B' // Amber
        : '#EF4444' // Red
      : colors.textSecondary;

  const currentStatus = initialProgress?.status ?? 'NEW';

  // Dynamic borders for WordCard based on progress status
  const cardBorderColor =
    currentStatus === 'MASTERED'
      ? '#22C55E'
      : currentStatus === 'PRACTICING'
      ? '#FB923C'
      : colors.border;

  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 80)} 
      style={[
        styles.wordCard, 
        { 
          backgroundColor: colors.card, 
          borderColor: cardBorderColor,
          borderWidth: currentStatus !== 'NEW' ? 1.5 : 1
        }
      ]}
    >
      <View style={styles.wordCardInfo}>
        <View style={styles.wordTitleRow}>
          <Text style={[styles.wordText, { color: colors.text }]}>{word}</Text>
          {currentStatus === 'MASTERED' && (
            <View style={styles.masteredBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
            </View>
          )}
          {currentStatus === 'PRACTICING' && (
            <View style={[styles.practicingBadgeMini, { backgroundColor: isDark ? '#78350F' : '#FFF7ED' }]}>
              <Text style={styles.practicingTextMini}>Learning</Text>
            </View>
          )}
        </View>
        {ipa ? <Text style={styles.wordIpaText}>{ipa}</Text> : null}
        <Text style={[styles.sentenceText, { color: colors.textSecondary }]}>{sentence}</Text>

        {initialProgress && currentStatus !== 'NEW' && (
          <View style={styles.backendProgressRow}>
            <View 
              style={[
                styles.statusDot, 
                { backgroundColor: currentStatus === 'MASTERED' ? '#22C55E' : '#FB923C' }
              ]} 
            />
            <Text 
              style={[
                styles.backendProgressText, 
                { color: currentStatus === 'MASTERED' ? '#22C55E' : '#FB923C' }
              ]}
            >
              {currentStatus} · Best: {initialProgress.bestScore}% ({initialProgress.attemptCount} tries)
            </Text>
          </View>
        )}
      </View>

      {/* Action panel */}
      <View style={styles.recorderSide}>
        {status === 'processing' ? (
          <View style={styles.processingBox}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={[styles.processingText, { color: colors.textSecondary }]}>Analyzing…</Text>
          </View>
        ) : status === 'done' && score !== null ? (
          <Animated.View entering={ZoomIn} style={styles.scoreBox}>
            <Text style={[styles.scoreNumber, { color: scoreColor }]}>{Math.round(score)}</Text>
            <Text style={[styles.scoreMax, { color: colors.textMuted }]}>/100</Text>
            {feedback && <Text style={[styles.scoreLevel, { color: scoreColor }]}>{feedback}</Text>}
            <TouchableOpacity onPress={reset} style={styles.retryBtn} hitSlop={8}>
              <Ionicons name="refresh" size={12} color={colors.textMuted} />
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
          <View style={styles.actionRow}>
            {/* Audio sample play button */}
            <TouchableOpacity
              style={[styles.audioPlayBtn, isAudioPlaying && styles.audioPlayBtnActive, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF', borderColor: isDark ? '#334155' : '#DBEAFE' }]}
              onPress={playWordAudio}
              disabled={!audioUrl}
              accessibilityLabel={`Play sound sample for ${word}`}
            >
              <Ionicons
                name="volume-high"
                size={18}
                color={audioUrl ? '#2563EB' : colors.textDisabled}
              />
            </TouchableOpacity>

            {/* Mic Record Button */}
            <TouchableOpacity
              style={[
                styles.micBtn, 
                status === 'recording' && styles.micBtnActive,
                { backgroundColor: isDark ? 'rgba(255, 198, 0, 0.1)' : '#FEF3C7', borderColor: 'rgba(255,198,0,0.3)' }
              ]}
              onPress={handleToggle}
              accessibilityLabel={status === 'recording' ? 'Stop' : 'Record'}
            >
              <Ionicons
                name={status === 'recording' ? 'stop' : 'mic'}
                size={18}
                color={status === 'recording' ? '#fff' : '#D97706'}
              />
              {status === 'recording' && <View style={styles.recordingDot} />}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function IeltsSoundDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { colors, isDark } = useTheme();

  const [sound, setSound] = useState<FoundationPronunciationSound | null>(null);
  const [wordProgresses, setWordProgresses] = useState<WordProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlayingHeroAudio, setIsPlayingHeroAudio] = useState(false);

  const decoded = decodeURIComponent(symbol ?? '');

  const breadcrumbItems = useMemo(() => [
    { label: 'IELTS', route: '/(tabs)/ielts' },
    { label: 'Pronunciation', route: '/ielts/foundation/pronunciation' },
    { label: `/${decoded}/` }
  ], [decoded]);

  const fetchSoundData = useCallback(
    async (showSkeleton = true) => {
      if (showSkeleton) setLoading(true);
      setError(null);
      try {
        const detail = await pronunciationApi.getSound(decoded);
        setSound(detail);

        if (user && detail?.id) {
          const progressList = await pronunciationApi.getWordProgress(detail.id);
          setWordProgresses(progressList || []);
        }
      } catch (err: any) {
        if (__DEV__) console.error('[IeltsSoundDetailScreen] Error fetching sound:', err);
        setError(err?.message || 'Failed to load sound detail');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [decoded, user],
  );

  useEffect(() => {
    fetchSoundData();
  }, [fetchSoundData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSoundData(false);
  }, [fetchSoundData]);

  const handleWordSuccess = useCallback(() => {
    if (user && sound?.id) {
      pronunciationApi
        .getWordProgress(sound.id)
        .then((progressList) => setWordProgresses(progressList || []))
        .catch((err) => {
          if (__DEV__) console.error('[IeltsSoundDetailScreen] Silent progress update failed:', err);
        });
    }
  }, [user, sound]);

  // Setup main sound audio player
  const heroPlayer = useAudioPlayer(sound?.audioUrl ? getFullUrl(sound.audioUrl) : '');

  const playHeroAudio = () => {
    if (!sound?.audioUrl || !heroPlayer) return;
    try {
      setIsPlayingHeroAudio(true);
      heroPlayer.seekTo(0);
      heroPlayer.play();
      setTimeout(() => setIsPlayingHeroAudio(false), 2000);
    } catch (e) {
      if (__DEV__) console.log('Hero sound playback error', e);
      setIsPlayingHeroAudio(false);
    }
  };

  const typeKey = sound?.type ?? 'consonant';
  const typeStyle = TYPE_COLORS[typeKey] ?? TYPE_COLORS.consonant;

  const typeLabel =
    typeKey === 'monophthong'
      ? 'Monophthong · Pure Vowel'
      : typeKey === 'diphthong'
      ? 'Diphthong · Gliding Vowel'
      : sound?.voiced
      ? 'Voiced Consonant'
      : 'Voiceless Consonant';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.surface }]} hitSlop={8}>
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Breadcrumb items={breadcrumbItems} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <Animated.View
              entering={FadeIn}
              style={[styles.symbolBadgeMini, { backgroundColor: typeStyle.bg }]}
            >
              <Text style={[styles.symbolTextMini, { color: typeStyle.text }]}>{decoded}</Text>
            </Animated.View>
            <View style={styles.headerMeta}>
              <Text style={[styles.symbolLabelMini, { color: colors.text }]}>/{decoded}/</Text>
              <Text style={[styles.typeLabelMini, { color: colors.textSecondary }]}>{typeLabel}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading pronunciation content...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <Text style={styles.retryText} onPress={() => fetchSoundData()}>
              Tap to retry
            </Text>
          </View>
        ) : sound ? (
          <Animated.View entering={FadeIn.duration(400)}>
            {/* ─── Premium Sound Hero Section ─── */}
            <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.heroBadgeRow}>
                <View style={[styles.typeBadge, { backgroundColor: isDark ? 'rgba(255, 198, 0, 0.15)' : 'rgba(255, 198, 0, 0.25)' }]}>
                  <Text style={styles.typeBadgeText}>{typeLabel}</Text>
                </View>
              </View>
              
              <Text style={[styles.heroSymbolText, { color: colors.text }]}>{sound.symbol}</Text>
              <Text style={[styles.heroNameText, { color: colors.textSecondary }]}>{sound.name || 'Phonetic Sound'}</Text>

              {sound.audioUrl ? (
                <TouchableOpacity
                  style={[
                    styles.heroPlayButton, 
                    isPlayingHeroAudio && styles.heroPlayButtonActive,
                    { backgroundColor: COLORS.primary }
                  ]}
                  onPress={playHeroAudio}
                  accessibilityLabel="Play audio sample"
                >
                  <Ionicons name="volume-high" size={26} color="#1E293B" />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* ─── How to Produce Section ─── */}
            {sound.description && (
              <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionCardTitle, { color: colors.text }]}>How to Produce</Text>
                <Text style={[styles.sectionCardDesc, { color: colors.textSecondary }]}>{sound.description}</Text>

                {/* Mouth Diagram Display */}
                {sound.imageUrl ? (
                  <View style={[styles.mouthImageWrapper, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: colors.border }]}>
                    <Image
                      source={{ uri: getFullUrl(sound.imageUrl) }}
                      style={styles.mouthImage}
                      resizeMode="contain"
                    />
                  </View>
                ) : null}
              </View>
            )}

            {/* ─── Distinct Tip Section ─── */}
            {sound.tip ? (
              <View style={[styles.tipBanner, { backgroundColor: isDark ? 'rgba(255, 198, 0, 0.08)' : '#FFFDF0', borderColor: 'rgba(255, 198, 0, 0.3)' }]}>
                <Ionicons name="bulb" size={20} color="#EA580C" style={styles.tipIcon} />
                <View style={styles.tipTextContent}>
                  <Text style={[styles.tipTitleText, { color: isDark ? '#F59E0B' : '#C2410C' }]}>Pronunciation Tip</Text>
                  <Text style={[styles.tipBodyText, { color: colors.text }]}>{sound.tip}</Text>
                </View>
              </View>
            ) : null}

            {/* ─── WordProgressCounter Component Integration ─── */}
            {user && sound.exampleWords && sound.exampleWords.length > 0 && (
              <View style={styles.counterWrapper}>
                <WordProgressCounter
                  wordProgress={wordProgresses}
                  total={sound.exampleWords.length}
                />
              </View>
            )}

            {/* ─── List of Practice Words ─── */}
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>PRACTICE WORDS</Text>
            {sound.exampleWords && sound.exampleWords.length > 0 ? (
              sound.exampleWords.map((ex, i) => {
                const localSentence =
                  SENTENCE_FALLBACKS[ex.word.toLowerCase()] ?? `Practice saying the word: ${ex.word}`;
                const progressObj = wordProgresses.find(
                  (p) => p.word.toLowerCase() === ex.word.toLowerCase(),
                );

                return (
                  <WordCard
                    key={ex.id || ex.word}
                    word={ex.word}
                    ipa={ex.ipa}
                    sentence={localSentence}
                    index={i}
                    userId={user?.id || ''}
                    soundId={sound.id}
                    audioUrl={ex.audioUrl}
                    initialProgress={progressObj}
                    onSuccess={handleWordSuccess}
                  />
                );
              })
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No examples available for this sound.</Text>
              </View>
            )}
          </Animated.View>
        ) : (
          <View style={styles.loginPrompt}>
            <Ionicons name="lock-closed-outline" size={32} color={colors.textMuted} />
            <Text style={[styles.loginTitle, { color: colors.text }]}>Log in to practice</Text>
            <Text style={[styles.loginSub, { color: colors.textSecondary }]}>Create an account to get AI pronunciation feedback.</Text>
          </View>
        )}
        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  headerMeta: { flex: 1 },
  headerCenter: { flex: 1, marginLeft: 4 },
  symbolBadgeMini: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolTextMini: { fontSize: 18, fontFamily: FONTS.bold },
  symbolLabelMini: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold },
  typeLabelMini: { fontSize: 10, fontFamily: FONTS.regular },

  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg },
  
  // Premium Hero Card
  heroCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginBottom: SPACING.lg,
  },
  heroBadgeRow: {
    marginBottom: SPACING.md,
  },
  typeBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  typeBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: '#D97706',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  heroSymbolText: {
    fontSize: 72,
    fontFamily: FONTS.bold,
    lineHeight: 80,
    letterSpacing: -1,
  },
  heroNameText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  heroPlayButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFC600',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  heroPlayButtonActive: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },

  // How to Produce Card
  sectionCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  sectionCardTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.sm,
  },
  sectionCardDesc: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 22,
    fontFamily: FONTS.regular,
  },
  mouthImageWrapper: {
    marginTop: SPACING.md,
    aspectRatio: 16 / 9,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mouthImage: {
    width: '100%',
    height: '100%',
  },

  // Premium Tip Box
  tipBanner: {
    flexDirection: 'row',
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  tipIcon: {
    marginTop: 2,
  },
  tipTextContent: {
    flex: 1,
  },
  tipTitleText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  tipBodyText: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
    fontFamily: FONTS.regular,
  },

  counterWrapper: {
    marginBottom: SPACING.sm,
  },

  sectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },

  loadingContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
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

  // Premium WordCard
  wordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  wordCardInfo: { flex: 1, gap: 4 },
  wordTitleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  wordText: { fontSize: FONT_SIZES.xl, fontFamily: FONTS.bold },
  wordIpaText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: '#64748B',
    fontStyle: 'italic',
  },
  masteredBadge: { justifyContent: 'center' },
  practicingBadgeMini: {
    paddingHorizontal: SPACING.xs + 2,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  practicingTextMini: {
    fontSize: 9,
    color: '#EA580C',
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
  },
  sentenceText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    opacity: 0.85,
    marginTop: 2,
  },
  backendProgressRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  backendProgressText: { fontSize: 10, fontFamily: FONTS.bold, textTransform: 'uppercase', letterSpacing: 0.4 },

  recorderSide: { marginLeft: SPACING.md, alignItems: 'center', minWidth: 60, justifyContent: 'center' },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  audioPlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  audioPlayBtnActive: {
    transform: [{ scale: 0.95 }],
  },
  micBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  micBtnActive: { backgroundColor: '#EF4444', borderColor: '#DC2626' },
  recordingDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },

  processingBox: { alignItems: 'center', gap: 4 },
  processingText: { fontSize: 9, fontFamily: FONTS.medium },

  scoreBox: { alignItems: 'center' },
  scoreNumber: { fontSize: FONT_SIZES.xl, fontFamily: FONTS.bold, lineHeight: 24 },
  scoreMax: {
    fontSize: 10,
    marginTop: -2,
    fontFamily: FONTS.regular,
  },
  scoreLevel: { fontSize: 8, fontFamily: FONTS.bold, textTransform: 'uppercase', marginTop: 1 },
  retryBtn: { marginTop: 3 },

  errorBox: { alignItems: 'center' },
  recorderErrorText: {
    fontSize: 9,
    color: '#EF4444',
    textAlign: 'center',
    maxWidth: 64,
    fontFamily: FONTS.regular,
  },
  recorderRetryText: { fontSize: 10, color: COLORS.primary, fontFamily: FONTS.bold, marginTop: 3 },

  emptyContainer: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.regular },

  loginPrompt: { alignItems: 'center', paddingVertical: 48, gap: SPACING.sm },
  loginTitle: { fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold },
  loginSub: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    fontFamily: FONTS.regular,
  },
});
