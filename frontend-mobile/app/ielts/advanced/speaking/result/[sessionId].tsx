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
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    button: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      backgroundColor: isDark ? colors.surface : '#fff',
      borderColor: colors.border,
    },
    time: {
      fontFamily: FONTS.semibold,
      fontSize: 11,
      minWidth: 70,
      color: colors.textSecondary,
    },
    track: {
      flex: 1,
      height: 4,
      borderRadius: 2,
      overflow: 'hidden',
      backgroundColor: colors.border,
    },
    progress: {
      height: '100%',
      borderRadius: 2,
      backgroundColor: activeColor,
    },
  });

  return (
    <View style={audioStyles.container}>
      <TouchableOpacity
        style={audioStyles.button}
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
      <Text style={audioStyles.time}>
        {formatTime(status.currentTime)} / {formatTime(status.duration || 0)}
      </Text>
      <View style={audioStyles.track}>
        <View style={[audioStyles.progress, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

export default function AdvancedSpeakingResultScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { isPremium } = useSubscription();

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pollingActive, setPollingActive] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  const activeColor = isDark ? colors.primary : COLORS.skill.speaking;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: SPACING.xl,
      backgroundColor: colors.background,
    },
    loadingText: {
      marginTop: SPACING.md,
      fontFamily: FONTS.medium,
      fontSize: FONT_SIZES.sm,
      color: colors.textSecondary,
    },
    errorText: {
      fontFamily: FONTS.bold,
      fontSize: FONT_SIZES.lg,
      textAlign: 'center',
      marginBottom: SPACING.xs,
      color: colors.error,
    },
    errorSub: {
      fontFamily: FONTS.regular,
      fontSize: FONT_SIZES.sm,
      textAlign: 'center',
      marginBottom: SPACING.lg,
      lineHeight: 18,
      color: colors.textSecondary,
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
      backgroundColor: isDark ? colors.surface : COLORS.skill.speaking,
      borderBottomWidth: isDark ? 1 : 0,
      borderBottomColor: colors.border,
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
      color: isDark ? colors.text : '#fff',
    },
    pendingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SPACING.xxl,
      backgroundColor: colors.background,
    },
    pendingTitle: {
      fontFamily: FONTS.bold,
      fontSize: FONT_SIZES.xl,
      marginTop: SPACING.xl,
      marginBottom: SPACING.sm,
      color: colors.text,
    },
    pendingSubtitle: {
      fontFamily: FONTS.regular,
      fontSize: FONT_SIZES.sm,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 40,
      color: colors.textSecondary,
    },
    tipBox: {
      width: '100%',
      borderRadius: RADIUS.lg,
      padding: SPACING.lg,
      borderWidth: 1,
      backgroundColor: colors.card,
      borderColor: colors.border,
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
      color: colors.text,
    },
    tipContent: {
      fontFamily: FONTS.regular,
      fontSize: FONT_SIZES.sm,
      lineHeight: 18,
      color: colors.textSecondary,
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
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    scoreCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: activeColor,
    },
    scoreVal: {
      fontFamily: FONTS.bold,
      fontSize: 24,
      color: isDark ? colors.onPrimary : '#fff',
    },
    scoreLbl: {
      fontFamily: FONTS.medium,
      fontSize: 10,
      textTransform: 'uppercase',
      color: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
    },
    overviewDetails: {
      flex: 1,
    },
    promptTitle: {
      fontFamily: FONTS.bold,
      fontSize: FONT_SIZES.md,
      lineHeight: 20,
      marginBottom: SPACING.xs,
      color: colors.text,
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
      backgroundColor: isDark ? 'rgba(255, 198, 0, 0.15)' : 'rgba(124, 58, 237, 0.1)',
    },
    metaBadgeText: {
      fontFamily: FONTS.bold,
      fontSize: 10,
      color: activeColor,
    },
    metaItem: {
      fontFamily: FONTS.medium,
      fontSize: FONT_SIZES.xs,
      color: colors.textSecondary,
    },
    transcriptCard: {
      borderWidth: 1,
      borderRadius: RADIUS.xl,
      padding: SPACING.lg,
      marginBottom: SPACING.lg,
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    sectionHeader: {
      fontSize: FONT_SIZES.sm,
      fontFamily: FONTS.bold,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: SPACING.md,
      color: colors.textSecondary,
    },
    questionItem: {
      paddingVertical: SPACING.md,
    },
    questionItemBorder: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    questionText: {
      fontFamily: FONTS.bold,
      fontSize: FONT_SIZES.sm,
      lineHeight: 18,
      marginBottom: SPACING.xs,
      color: colors.text,
    },
    noAudioText: {
      fontFamily: FONTS.medium,
      fontSize: FONT_SIZES.xs,
      fontStyle: 'italic',
      marginTop: SPACING.xs,
      color: colors.textMuted,
    },
    transcriptionBox: {
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      marginTop: SPACING.sm,
      borderWidth: 1,
      backgroundColor: isDark ? colors.surface : '#F8FAFC',
      borderColor: isDark ? colors.border : '#F1F5F9',
    },
    transcriptionLabel: {
      fontFamily: FONTS.semibold,
      fontSize: 11,
      marginBottom: 4,
      color: activeColor,
    },
    transcriptionText: {
      fontFamily: FONTS.regular,
      fontSize: FONT_SIZES.sm,
      lineHeight: 20,
      color: colors.text,
    },
    noTranscriptionText: {
      fontFamily: FONTS.medium,
      fontSize: FONT_SIZES.xs,
      fontStyle: 'italic',
      marginTop: SPACING.xs,
      color: colors.textMuted,
    },
    noFeedbackBox: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
      borderRadius: RADIUS.xl,
      borderWidth: 1,
      gap: SPACING.sm,
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    noFeedbackText: {
      fontFamily: FONTS.medium,
      fontSize: FONT_SIZES.sm,
      color: colors.textSecondary,
    },
    actionBtn: {
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.md,
      marginTop: SPACING.xl,
      backgroundColor: colors.primary,
    },
    actionBtnText: {
      fontFamily: FONTS.bold,
      fontSize: FONT_SIZES.sm,
      color: colors.onPrimary,
    },
    doneBtn: {
      borderWidth: 1.5,
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.md,
      alignItems: 'center',
      marginTop: SPACING.xl,
      backgroundColor: isDark ? colors.primary : colors.card,
      borderColor: isDark ? colors.primary : colors.border,
    },
    doneBtnText: {
      fontFamily: FONTS.bold,
      fontSize: FONT_SIZES.md,
      color: isDark ? colors.onPrimary : colors.textSecondary,
    },
  });

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
        <ActivityIndicator size="large" color={activeColor} />
        <Text style={styles.loadingText}>Fetching practice details...</Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Session details could not be found.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={{ color: activeColor }}>Go Back</Text>
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
          <ActivityIndicator size="large" color={activeColor} />
          <Text style={styles.pendingTitle}>Evaluating Your Speaking...</Text>
          <Text style={styles.pendingSubtitle}>
            Our AI engine is currently grading your speaking answers against standard IELTS rubrics (Fluency, Vocabulary, Grammar, Pronunciation). This usually takes 30 to 90 seconds.
          </Text>

          {/* Tips Carousel */}
          <View style={styles.tipBox}>
            <View style={styles.tipHeader}>
              <Ionicons name="bulb" size={18} color={colors.warning} />
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
          <Ionicons name="alert-circle" size={54} color={colors.error} />
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
          <Ionicons name="arrow-back" size={24} color={isDark ? colors.text : "#fff"} />
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
                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />{' '}
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
            <Ionicons name="alert-circle-outline" size={24} color={colors.textMuted} />
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
