import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
  SlideInUp,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useAudioRecorderHook } from '@/hooks/useAudioRecorder';
import { usePronunciationChecker } from '@/hooks/usePronunciationChecker';

import { Waveform } from '@/components/voice/Waveform';
import { RecordButton } from '@/components/voice/RecordButton';
import { ScoreDashboard } from '@/components/voice/feedback/ScoreDashboard';
import { TranscriptFeedback } from '@/components/voice/feedback/TranscriptFeedback';

// ─── Score colour thresholds ───────────────────────────────────────────────────
const SCORE_THRESHOLD = { excellent: 80, good: 60 };

function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= SCORE_THRESHOLD.excellent) return { label: 'Excellent!', color: '#059669' };
  if (score >= SCORE_THRESHOLD.good) return { label: 'Good', color: '#D97706' };
  return { label: 'Keep Practicing', color: COLORS.status.error };
}

// ─── Example phrases for the library tab ─────────────────────────────────────
const SAMPLE_PHRASES = [
  'The weather is beautiful today.',
  'I would like to make an appointment.',
  'Could you please repeat that?',
  'I am studying English every day.',
  'The quick brown fox jumps over the lazy dog.',
];

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function PronunciationAIScreen() {
  const { user } = useAuth();
  const {
    isRecording,
    recordedUri,
    durationMillis,
    currentMetering,
    startRecording,
    stopRecording,
    clearRecording,
  } = useAudioRecorderHook();

  const { result, isChecking, error, checkPronunciation, reset } =
    usePronunciationChecker();

  const [targetText, setTargetText] = React.useState(SAMPLE_PHRASES[0]);
  const [activePhrase, setActivePhrase] = React.useState(0);

  // ── Animate result card in ──────────────────────────────────────────────────
  const resultOffset = useSharedValue(80);
  const resultOpacity = useSharedValue(0);
  const resultStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: resultOffset.value }],
    opacity: resultOpacity.value,
  }));

  useEffect(() => {
    if (result) {
      resultOffset.value = withSpring(0, { damping: 16, stiffness: 120 });
      resultOpacity.value = withTiming(1, { duration: 400 });
      // Haptic celebration for high score
      if (result.score.pronScore >= SCORE_THRESHOLD.excellent) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } else {
      resultOffset.value = 80;
      resultOpacity.value = 0;
    }
  }, [result]);

  // ── Handle record / stop ────────────────────────────────────────────────────
  const handleRecordToggle = useCallback(async () => {
    if (isRecording) {
      const uri = await stopRecording();
      if (uri && user?.id) {
        await checkPronunciation(uri, user.id, { targetWord: targetText });
      } else if (!user?.id) {
        Alert.alert('Lỗi', 'Bạn cần đăng nhập để sử dụng tính năng này.');
      }
    } else {
      reset();
      await clearRecording();
      await startRecording();
    }
  }, [isRecording, user, targetText, stopRecording, startRecording, checkPronunciation, clearRecording, reset]);

  // ── Phrase picker ───────────────────────────────────────────────────────────
  const selectPhrase = (index: number) => {
    setActivePhrase(index);
    setTargetText(SAMPLE_PHRASES[index]);
    reset();
  };

  const formatDuration = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  // Backend returns PENDING first (async queue), score is populated later by AI
  const isPending = result?.status === 'PENDING' || (result && !result.score);
  const scoreLabel = result?.score ? getScoreLabel(result.score.pronScore) : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎤 AI Pronunciation</Text>
        <Text style={styles.headerSub}>Record and get instant AI feedback</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Target phrase card ── */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>TARGET PHRASE</Text>
          <TextInput
            style={styles.phraseInput}
            value={targetText}
            onChangeText={(t) => { setTargetText(t); reset(); }}
            multiline
            placeholder="Type any word or phrase…"
            placeholderTextColor={COLORS.textMuted}
            accessible
            accessibilityLabel="Target phrase input"
          />

          {/* Sample phrase chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.phraseChips}
          >
            {SAMPLE_PHRASES.map((p, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.phraseChip, activePhrase === i && styles.phraseChipActive]}
                onPress={() => selectPhrase(i)}
                accessibilityLabel={`Sample phrase: ${p}`}
              >
                <Text
                  style={[styles.phraseChipText, activePhrase === i && styles.phraseChipTextActive]}
                  numberOfLines={1}
                >
                  {p.split(' ').slice(0, 3).join(' ')}…
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Recording zone ── */}
        <View style={styles.recordZone}>
          {/* Waveform */}
          <View style={styles.waveformBox}>
            <Waveform
              isRecording={isRecording}
              metering={currentMetering}
              barCount={32}
            />
            {isRecording && (
              <Text style={styles.timer}>{formatDuration(durationMillis)}</Text>
            )}
          </View>

          {/* Status text */}
          <Text style={styles.recordHint}>
            {isChecking
              ? 'AI is scoring your pronunciation…'
              : isRecording
              ? 'Recording… tap to stop'
              : recordedUri
              ? 'Recorded! Submit or try again.'
              : 'Tap the mic to start'}
          </Text>

          {/* Record button */}
          {isChecking ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 20 }} />
          ) : (
            <RecordButton
              isRecording={isRecording}
              onPress={handleRecordToggle}
              isDisabled={isChecking}
              size={72}
            />
          )}

          {/* Reset button */}
          {(result || error) && !isRecording && (
            <TouchableOpacity style={styles.resetBtn} onPress={reset} accessibilityRole="button">
              <Ionicons name="refresh" size={16} color={COLORS.textSecondary} />
              <Text style={styles.resetText}>Try again</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Error state ── */}
        {error && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color={COLORS.status.error} />
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>
        )}

        {/* ── AI Result ── */}
        {result && isPending && (
          <Animated.View entering={FadeIn} style={styles.pendingBox}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.pendingText}>
              ⏳ AI đang phân tích phát âm… Vui lòng chờ.
            </Text>
          </Animated.View>
        )}

        {result && !isPending && result.score && (
          <Animated.View style={[styles.resultSection, resultStyle]}>
            {/* Score badge */}
            {scoreLabel && (
              <View style={[styles.scoreBadge, { backgroundColor: scoreLabel.color + '18' }]}>
                <Text style={[styles.scoreBadgeText, { color: scoreLabel.color }]}>
                  {scoreLabel.label} — {Math.round(result.score!.pronScore)}/100
                </Text>
              </View>
            )}

            {/* Score dashboard */}
            <ScoreDashboard score={result.score!} />

            {/* Word-level transcript */}
            {result.score!.words && result.score!.words.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.sectionLabel}>WORD FEEDBACK</Text>
                <Text style={styles.transcriptHint}>
                  🟢 Good  🟡 Fair  🔴 Needs work  — strikethrough = omitted
                </Text>
                <TranscriptFeedback
                  words={result.score.words}
                  onWordPress={(word) =>
                    Alert.alert(
                      word,
                      'Tip: Focus on stressing this syllable correctly.'
                    )
                  }
                />
              </View>
            )}
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.onPrimary,
  },
  headerSub: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.onPrimary,
    opacity: 0.75,
    marginTop: 2,
  },

  scroll: { flex: 1 },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 60,
    gap: SPACING.lg,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  phraseInput: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 28,
    minHeight: 56,
  },
  phraseChips: { gap: SPACING.sm, paddingVertical: 4 },
  phraseChip: {
    backgroundColor: COLORS.secondary,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    maxWidth: 130,
  },
  phraseChipActive: { backgroundColor: COLORS.primary },
  phraseChipText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontWeight: '600' },
  phraseChipTextActive: { color: COLORS.onPrimary },

  recordZone: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
    minHeight: 240,
    justifyContent: 'center',
  },
  waveformBox: { width: '100%', alignItems: 'center' },
  timer: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.status.error,
    fontWeight: '700',
    marginTop: SPACING.xs,
  },
  recordHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.secondary,
    marginTop: SPACING.xs,
  },
  resetText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontWeight: '600' },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.status.error + '18',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.status.error + '40',
  },
  errorText: { fontSize: FONT_SIZES.sm, color: COLORS.status.error, flex: 1 },

  resultSection: { gap: SPACING.lg },
  scoreBadge: {
    alignSelf: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  scoreBadgeText: { fontSize: FONT_SIZES.lg, fontWeight: '800' },

  transcriptHint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: -4,
  },

  pendingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.primary + '12',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  pendingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
    flex: 1,
  },
});
