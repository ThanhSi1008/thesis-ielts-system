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
import { useTheme } from '@/contexts/ThemeContext';
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
  const { colors, isDark } = useTheme();
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

  const activeColor = isDark ? colors.primary : COLORS.skill.speaking;

  return (
    <View style={[audioStyles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TouchableOpacity
        style={[audioStyles.button, { backgroundColor: isDark ? colors.surface : '#fff', borderColor: colors.border }]}
        onPress={handlePlay}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={activeColor} />
        ) : (
          <Ionicons
            name={player.playing ? 'pause' : 'play'}
            size={16}
            color={activeColor}
          />
        )}
      </TouchableOpacity>
      <Text style={[audioStyles.time, { color: colors.textSecondary }]}>
        {formatTime(status.currentTime)} / {formatTime(status.duration || 0)}
      </Text>
      <View style={[audioStyles.track, { backgroundColor: colors.border }]}>
        <View style={[audioStyles.progress, { width: `${progress}%`, backgroundColor: activeColor }]} />
      </View>
    </View>
  );
}

const audioStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
    borderWidth: 1,
    gap: 10,
    marginTop: SPACING.xs,
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  time: {
    fontFamily: FONTS.semibold,
    fontSize: 11,
    minWidth: 70,
  },
  track: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 2,
  },
});

export default function AdvancedSpeakingResultScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
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

  const activeColor = isDark ? colors.primary : COLORS.skill.speaking;

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={activeColor} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Fetching practice details...</Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>Session details could not be found.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={{ color: activeColor }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render evaluation pending page
  if (pollingActive || session.status === 'GRADING') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.pendingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={activeColor} />
          <Text style={[styles.pendingTitle, { color: colors.text }]}>Evaluating Your Speaking...</Text>
          <Text style={[styles.pendingSubtitle, { color: colors.textSecondary }]}>
            Our AI engine is currently grading your speaking answers against standard IELTS rubrics (Fluency, Vocabulary, Grammar, Pronunciation). This usually takes 30 to 90 seconds.
          </Text>

          {/* Tips Carousel */}
          <View style={[styles.tipBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.tipHeader}>
              <Ionicons name="bulb" size={18} color={colors.warning} />
              <Text style={[styles.tipTitle, { color: colors.text }]}>Did you know?</Text>
            </View>
            <Text style={[styles.tipContent, { color: colors.textSecondary }]}>{MOCK_TIPS[tipIndex]}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (session.status === 'GRADING_FAILED') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          <Ionicons name="alert-circle" size={54} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>AI Grading Failed</Text>
          <Text style={[styles.errorSub, { color: colors.textSecondary }]}>
            We were unable to successfully grade your speaking audio. Please try practicing again or reviewing your speaking history.
          </Text>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
            <Text style={[styles.actionBtnText, { color: colors.onPrimary }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Dynamic Header */}
      <View style={[styles.header, { backgroundColor: isDark ? colors.surface : COLORS.skill.speaking, borderBottomWidth: isDark ? 1 : 0, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.headerBack} onPress={() => router.replace('/ielts/advanced/speaking')}>
          <Ionicons name="arrow-back" size={24} color={isDark ? colors.text : "#fff"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? colors.text : "#fff" }]}>Evaluation Results</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator contentContainerStyle={styles.scrollContent}>
        {/* Score & Topic Overview Card */}
        <View style={[styles.overviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.scoreCircle, { backgroundColor: activeColor }]}>
            <Text style={[styles.scoreVal, { color: isDark ? colors.onPrimary : '#fff' }]}>{session.bandScore?.toFixed(1) ?? 'N/A'}</Text>
            <Text style={[styles.scoreLbl, { color: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)' }]}>Band Score</Text>
          </View>

          <View style={styles.overviewDetails}>
            <Text style={[styles.promptTitle, { color: colors.text }]} numberOfLines={2}>
              {part?.topic ?? part?.title ?? 'IELTS Speaking Practice'}
            </Text>
            <View style={styles.promptMetaRow}>
              <View style={[styles.metaBadge, { backgroundColor: isDark ? 'rgba(255, 198, 0, 0.15)' : 'rgba(124, 58, 237, 0.1)' }]}>
                <Text style={[styles.metaBadgeText, { color: activeColor }]}>PART {part?.partNumber ?? 1}</Text>
              </View>
              <Text style={[styles.metaItem, { color: colors.textSecondary }]}>
                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />{' '}
                {timeDisplay}
              </Text>
            </View>
          </View>
        </View>

        {/* Interactive Audio & Transcript Section */}
        {part?.questions && part.questions.length > 0 && (
          <View style={[styles.transcriptCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Your Response Details</Text>
            {part.questions.map((question: any, idx: number) => {
              const qIdxStr = String(idx);
              const audioUrl = session.audioUrls?.[qIdxStr];
              const transcription = session.transcription?.[qIdxStr];

              return (
                <View key={idx} style={[styles.questionItem, idx > 0 && [styles.questionItemBorder, { borderTopColor: colors.border }]]}>
                  <Text style={[styles.questionText, { color: colors.text }]}>
                    Q{idx + 1}: {question.text}
                  </Text>
                  {audioUrl ? (
                    <AudioPlayButton url={audioUrl} />
                  ) : (
                    <Text style={[styles.noAudioText, { color: colors.textMuted }]}>No audio answer recorded.</Text>
                  )}
                  {transcription ? (
                    <View style={[styles.transcriptionBox, { backgroundColor: isDark ? colors.surface : '#F8FAFC', borderColor: isDark ? colors.border : '#F1F5F9' }]}>
                      <Text style={[styles.transcriptionLabel, { color: activeColor }]}>AI Transcription:</Text>
                      <Text style={[styles.transcriptionText, { color: colors.text }]}>{transcription}</Text>
                    </View>
                  ) : (
                    <Text style={[styles.noTranscriptionText, { color: colors.textMuted }]}>No transcription available.</Text>
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
          <View style={[styles.noFeedbackBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="alert-circle-outline" size={24} color={colors.textMuted} />
            <Text style={[styles.noFeedbackText, { color: colors.textSecondary }]}>No detailed evaluation details found.</Text>
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.doneBtn, { backgroundColor: isDark ? colors.primary : colors.card, borderColor: isDark ? colors.primary : colors.border }]}
          onPress={() => router.replace('/ielts/advanced/speaking')}
        >
          <Text style={[styles.doneBtnText, { color: isDark ? colors.onPrimary : colors.textSecondary }]}>Return to List</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  errorText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  errorSub: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 18,
  },
  backBtn: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
  },
  header: {
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
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
  },
  pendingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  pendingTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  pendingSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
  },
  tipBox: {
    width: '100%',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
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
  },
  tipContent: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    lineHeight: 18,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  overviewCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreVal: {
    fontFamily: FONTS.bold,
    fontSize: 24,
  },
  scoreLbl: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  overviewDetails: {
    flex: 1,
  },
  promptTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md,
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
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  metaBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
  },
  metaItem: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
  },
  transcriptCard: {
    borderWidth: 1,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.md,
  },
  questionItem: {
    paddingVertical: SPACING.md,
  },
  questionItemBorder: {
    borderTopWidth: 1,
  },
  questionText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.sm,
    lineHeight: 18,
    marginBottom: SPACING.xs,
  },
  noAudioText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
  },
  transcriptionBox: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    borderWidth: 1,
  },
  transcriptionLabel: {
    fontFamily: FONTS.semibold,
    fontSize: 11,
    marginBottom: 4,
  },
  transcriptionText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
  },
  noTranscriptionText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
  },
  noFeedbackBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  noFeedbackText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
  },
  actionBtn: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.xl,
  },
  actionBtnText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.sm,
  },
  doneBtn: {
    borderWidth: 1.5,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  doneBtnText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md,
  },
});
