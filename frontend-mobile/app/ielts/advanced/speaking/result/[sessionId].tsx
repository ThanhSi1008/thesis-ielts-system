import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS, SHADOWS, ROUTES } from '@/constants';
import { ieltsAdvancedApi } from '@/services/ielts.api';
import { useGradingPoll } from '@/hooks/useGradingPoll';
import { useSubscription } from '@/contexts/SubscriptionContext';
import SpeakingRubricView from '@/components/ielts/SpeakingRubricView';

const MOCK_TIPS = [
  'Fluency does not mean speaking super fast. Speak at a natural, steady pace to avoid hesitation.',
  'Do not repeat the question word-for-word. Paraphrase using synonyms to boost Lexical Resource score.',
  'Use filler phrases like "That is an interesting question..." to buy yourself time to think instead of staying silent.',
  'Vary your sentence structures. Use both simple and complex sentences to improve Grammatical Range.',
  'Clear pronunciation and correct word stress are more important than having a perfect native accent.',
];

interface AudioPlayButtonProps {
  url: string;
}

function AudioPlayButton({ url }: AudioPlayButtonProps) {
  const player = useAudioPlayer(url);
  const status = useAudioPlayerStatus(player);

  const handlePlay = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const progress = status.duration > 0 ? (status.currentTime / status.duration) * 100 : 0;
  const isLoading = status.isBuffering || !status.isLoaded;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={audioStyles.container}>
      <TouchableOpacity
        style={audioStyles.button}
        onPress={handlePlay}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={COLORS.skill.speaking} />
        ) : (
          <Ionicons
            name={player.playing ? 'pause' : 'play'}
            size={16}
            color={COLORS.skill.speaking}
          />
        )}
      </TouchableOpacity>
      <Text style={audioStyles.time}>
        {formatTime(status.currentTime)} / {formatTime(status.duration || 0)}
      </Text>
      <View style={audioStyles.track}>
        <View style={[audioStyles.progress, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

const audioStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    marginTop: SPACING.xs,
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  time: {
    fontFamily: FONTS.semibold,
    fontSize: 11,
    color: '#64748B',
    minWidth: 70,
  },
  track: {
    flex: 1,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: COLORS.skill.speaking,
    borderRadius: 2,
  },
});

export default function AdvancedSpeakingResultScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { isPremium } = useSubscription();

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pollingActive, setPollingActive] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  // Verify Premium Tier
  useEffect(() => {
    if (!isPremium) {
      router.replace(ROUTES.pricing);
    }
  }, [isPremium]);

  // Tip slider logic
  useEffect(() => {
    if (!pollingActive) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % MOCK_TIPS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [pollingActive]);

  // Load session initially
  useEffect(() => {
    if (!sessionId || !isPremium) return;

    const loadSession = async () => {
      try {
        const res = await ieltsAdvancedApi.getSpeakingSession(sessionId);
        setSession(res);

        if (res.status === 'IN_PROGRESS' || res.status === 'SUBMITTED' || res.status === 'GRADING') {
          setPollingActive(true);
        }
      } catch (err) {
        console.error('[SpeakingResult] Fetch failed:', err);
        Alert.alert('Error', 'Failed to load session details.');
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [sessionId, isPremium]);

  // Polling Hook for AI Grading
  useGradingPoll({
    sessionId,
    enabled: pollingActive,
    pollFn: ieltsAdvancedApi.getSpeakingSession,
    onDone: (finalSessionId) => {
      setPollingActive(false);
      // Reload final graded session details
      ieltsAdvancedApi.getSpeakingSession(finalSessionId).then((res) => {
        setSession(res);
      });
    },
    onError: (errMsg) => {
      setPollingActive(false);
      Alert.alert('Grading Error', errMsg);
    },
  });

  const part = session?.part;

  // Parse duration: seconds into MM:SS
  const timeDisplay = useMemo(() => {
    if (!session?.timeTaken) return '--:--';
    const mins = Math.floor(session.timeTaken / 60);
    const secs = session.timeTaken % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [session]);

  // Defensively parse and normalize feedback object for SpeakingRubricView
  const normalizedFeedback = useMemo(() => {
    if (!session?.feedback) return null;
    try {
      const rawFeedback = typeof session.feedback === 'string'
        ? JSON.parse(session.feedback)
        : session.feedback;

      const overall_band = session.bandScore ?? rawFeedback.overall_band ?? rawFeedback.band ?? 6.0;
      return {
        overall_band,
        criteria: rawFeedback.criteria ?? {},
      };
    } catch (e) {
      console.error('[SpeakingResult] Parse feedback failed:', e);
      return null;
    }
  }, [session]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.skill.speaking} />
        <Text style={styles.loadingText}>Fetching practice details...</Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Session details could not be found.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={{ color: COLORS.skill.speaking }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render evaluation pending page
  if (pollingActive || session.status === 'GRADING') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.pendingContainer}>
          <ActivityIndicator size="large" color={COLORS.skill.speaking} />
          <Text style={styles.pendingTitle}>Evaluating Your Speaking...</Text>
          <Text style={styles.pendingSubtitle}>
            Our AI engine is currently grading your speaking answers against standard IELTS rubrics (Fluency, Vocabulary, Grammar, Pronunciation). This usually takes 30 to 90 seconds.
          </Text>

          {/* Tips Carousel */}
          <View style={styles.tipBox}>
            <View style={styles.tipHeader}>
              <Ionicons name="bulb" size={18} color={COLORS.warning} />
              <Text style={styles.tipTitle}>Did you know?</Text>
            </View>
            <Text style={styles.tipContent}>{MOCK_TIPS[tipIndex]}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (session.status === 'GRADING_FAILED') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.center}>
          <Ionicons name="alert-circle" size={54} color={COLORS.error} />
          <Text style={styles.errorText}>AI Grading Failed</Text>
          <Text style={styles.errorSub}>
            We were unable to successfully grade your speaking audio. Please try practicing again or reviewing your speaking history.
          </Text>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.back()}>
            <Text style={styles.actionBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Dynamic Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={() => router.replace('/ielts/advanced/speaking')}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Evaluation Results</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator contentContainerStyle={styles.scrollContent}>
        {/* Score & Topic Overview Card */}
        <View style={styles.overviewCard}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreVal}>{session.bandScore?.toFixed(1) ?? 'N/A'}</Text>
            <Text style={styles.scoreLbl}>Band Score</Text>
          </View>

          <View style={styles.overviewDetails}>
            <Text style={styles.promptTitle} numberOfLines={2}>
              {part?.topic ?? part?.title ?? 'IELTS Speaking Practice'}
            </Text>
            <View style={styles.promptMetaRow}>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>PART {part?.partNumber ?? 1}</Text>
              </View>
              <Text style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />{' '}
                {timeDisplay}
              </Text>
            </View>
          </View>
        </View>

        {/* Interactive Audio & Transcript Section */}
        {part?.questions && part.questions.length > 0 && (
          <View style={styles.transcriptCard}>
            <Text style={styles.sectionHeader}>Your Response Details</Text>
            {part.questions.map((question: any, idx: number) => {
              const qIdxStr = String(idx);
              const audioUrl = session.audioUrls?.[qIdxStr];
              const transcription = session.transcription?.[qIdxStr];

              return (
                <View key={idx} style={[styles.questionItem, idx > 0 && styles.questionItemBorder]}>
                  <Text style={styles.questionText}>
                    Q{idx + 1}: {question.text}
                  </Text>
                  {audioUrl ? (
                    <AudioPlayButton url={audioUrl} />
                  ) : (
                    <Text style={styles.noAudioText}>No audio answer recorded.</Text>
                  )}
                  {transcription ? (
                    <View style={styles.transcriptionBox}>
                      <Text style={styles.transcriptionLabel}>AI Transcription:</Text>
                      <Text style={styles.transcriptionText}>{transcription}</Text>
                    </View>
                  ) : (
                    <Text style={styles.noTranscriptionText}>No transcription available.</Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Rubric View Section */}
        {normalizedFeedback ? (
          <SpeakingRubricView
            feedback={normalizedFeedback}
            exam={part}
          />
        ) : (
          <View style={styles.noFeedbackBox}>
            <Ionicons name="alert-circle-outline" size={24} color={COLORS.textMuted} />
            <Text style={styles.noFeedbackText}>No detailed evaluation details found.</Text>
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => router.replace('/ielts/advanced/speaking')}
        >
          <Text style={styles.doneBtnText}>Return to List</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  errorText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  errorSub: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 18,
  },
  backBtn: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
  },
  header: {
    backgroundColor: COLORS.skill.speaking,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  headerBack: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
  },
  pendingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
    backgroundColor: '#fff',
  },
  pendingTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.text,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  pendingSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
  },
  tipBox: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  tipTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  tipContent: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  overviewCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
    boxShadow: SHADOWS.card,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.skill.speaking,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: SHADOWS.sm,
  },
  scoreVal: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: '#fff',
  },
  scoreLbl: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
  },
  overviewDetails: {
    flex: 1,
  },
  promptTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  promptMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: 2,
  },
  metaBadge: {
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  metaBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.skill.speaking,
  },
  metaItem: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  transcriptCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    boxShadow: SHADOWS.card,
  },
  sectionHeader: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.md,
  },
  questionItem: {
    paddingVertical: SPACING.md,
  },
  questionItemBorder: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  questionText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 18,
    marginBottom: SPACING.xs,
  },
  noAudioText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
  },
  transcriptionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  transcriptionLabel: {
    fontFamily: FONTS.semibold,
    fontSize: 11,
    color: COLORS.skill.speaking,
    marginBottom: 4,
  },
  transcriptionText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  noTranscriptionText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
  },
  noFeedbackBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    padding: 40,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  noFeedbackText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  actionBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.xl,
  },
  actionBtnText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.sm,
    color: '#212529',
  },
  doneBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  doneBtnText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
});
