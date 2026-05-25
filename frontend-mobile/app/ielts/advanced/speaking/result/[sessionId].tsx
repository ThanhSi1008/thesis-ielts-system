import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import { toast } from '@/components/ui';
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
      <TouchableOpacity style={audioStyles.button} onPress={handlePlay} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator size="small" color={activeColor} />
        ) : (
          <Ionicons name={player.playing ? 'pause' : 'play'} size={16} color={activeColor} />
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
  const { isPremium, loading: subLoading } = useSubscription();

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pollingActive, setPollingActive] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  const band = session?.bandScore ?? 0;
  const bandStr = band.toFixed(1);
  const bandColor = getBandColor(band);
  const description = BAND_LABELS[bandStr] || '';
  const isPending = pollingActive || session?.status === 'GRADING';

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
    pendingHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },
    pendingHeaderBtn: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: SPACING.md,
    },
    pendingHeaderTitleCol: {
      flex: 1,
    },
    pendingHeaderTitle: {
      fontSize: FONT_SIZES.md,
      fontFamily: FONTS.bold,
      color: colors.text,
    },
    pendingHeaderSubtitle: {
      fontSize: 11,
      fontFamily: FONTS.regular,
      color: colors.textSecondary,
      marginTop: 2,
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
    certContainer: {
      borderWidth: 3,
      borderRadius: RADIUS.xl,
      padding: 6,
      backgroundColor: isDark ? 'rgba(30, 27, 20, 0.4)' : '#FCFAF6',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 4,
      marginBottom: SPACING.lg,
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
    if (!subLoading && !isPremium) {
      router.replace(ROUTES.pricing);
    }
  }, [isPremium, subLoading]);

  // Tip slider logic
  useEffect(() => {
    if (!pollingActive) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % MOCK_TIPS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [pollingActive]);

  // Android physical back button handling during grading/polling
  useEffect(() => {
    if (!pollingActive) return;
    const backAction = () => {
      router.replace('/ielts/advanced?tab=speaking');
      return true; // prevent default back action
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [pollingActive]);

  // Load session initially
  useEffect(() => {
    if (!sessionId || !isPremium) return;

    const loadSession = async () => {
      try {
        const res = await ieltsAdvancedApi.getSpeakingSession(sessionId);
        setSession(res);

        if (
          res.status === 'IN_PROGRESS' ||
          res.status === 'SUBMITTED' ||
          res.status === 'GRADING'
        ) {
          setPollingActive(true);
        }
      } catch (err) {
        if (__DEV__) console.error('[SpeakingResult] Fetch failed:', err);
        toast.error('Error', 'Failed to load session details.');
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
      toast.error('Grading Error', errMsg);
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
      const rawFeedback =
        typeof session.feedback === 'string' ? JSON.parse(session.feedback) : session.feedback;

      const overall_band = session.bandScore ?? rawFeedback.overall_band ?? rawFeedback.band ?? 6.0;
      return {
        overall_band,
        criteria: rawFeedback.criteria ?? {},
      };
    } catch (e) {
      if (__DEV__) console.error('[SpeakingResult] Parse feedback failed:', e);
      return null;
    }
  }, [session]);

  if (subLoading || loading) {
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
        
        {/* Minimalist header with back button */}
        <View style={styles.pendingHeader}>
          <TouchableOpacity
            style={styles.pendingHeaderBtn}
            onPress={() => router.replace('/ielts/advanced?tab=speaking')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Back to IELTS Advanced Dashboard"
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.pendingHeaderTitleCol}>
            <Text style={styles.pendingHeaderTitle}>Evaluating Speaking</Text>
            <Text style={styles.pendingHeaderSubtitle} numberOfLines={1}>
              AI evaluation running. You can return here later.
            </Text>
          </View>
        </View>

        <View style={styles.pendingContainer}>
          <ActivityIndicator size="large" color={activeColor} />
          <Text style={styles.pendingTitle}>Evaluating Your Speaking...</Text>
          <Text style={styles.pendingSubtitle}>
            Our AI engine is currently grading your speaking answers against standard IELTS rubrics
            (Fluency, Vocabulary, Grammar, Pronunciation). This usually takes 30 to 90 seconds.
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
            We were unable to successfully grade your speaking audio. Please try practicing again or
            reviewing your speaking history.
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
        <TouchableOpacity
          style={styles.headerBack}
          onPress={() => router.replace('/ielts/advanced?tab=speaking')}
        >
          <Ionicons name="arrow-back" size={24} color={isDark ? colors.text : '#fff'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Evaluation Results</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator contentContainerStyle={styles.scrollContent}>
        {/* Polished Exam Certificate Hero */}
        <View style={[styles.certContainer, { borderColor: bandColor }]}>
          <View style={[styles.certInnerFrame, { borderColor: bandColor + '40' }]}>
            <Text style={[styles.certHeader, { color: bandColor }]}>
              {isPending ? '⏳ GRADING IN PROGRESS' : '🏆 IELTS SPEAKING PRACTICE CERTIFICATE'}
            </Text>

            <Text style={[styles.certSubText, { color: colors.textSecondary }]}>
              {isPending
                ? 'Your practice session has been recorded. AI scoring engine is evaluating your performance...'
                : `This is to certify that you have successfully completed the practice of Advanced Speaking`}
            </Text>

            <Text style={[styles.certExamTitle, { color: colors.text }]} numberOfLines={2}>
              {part?.topic ?? part?.title ?? 'IELTS Speaking Practice'}
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

            {/* Metadata Info Row */}
            <View
              style={[styles.promptMetaRow, { marginTop: SPACING.md, marginBottom: SPACING.sm }]}
            >
              <View style={[styles.metaBadge, { backgroundColor: bandColor + '15' }]}>
                <Text style={[styles.metaBadgeText, { color: bandColor }]}>
                  PART {part?.partNumber ?? 1}
                </Text>
              </View>
              <Text style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />{' '}
                {timeDisplay}
              </Text>
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
          <SpeakingRubricView feedback={normalizedFeedback} exam={part} />
        ) : (
          <View style={styles.noFeedbackBox}>
            <Ionicons name="alert-circle-outline" size={24} color={colors.textMuted} />
            <Text style={styles.noFeedbackText}>No detailed evaluation details found.</Text>
          </View>
        )}

        {/* Community Answers Button */}
        {part?.id && (
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: COLORS.skill.speaking, borderColor: COLORS.skill.speaking, marginTop: SPACING.md }]}
            onPress={() => router.push(`/ielts/advanced/speaking/${part.id}/community`)}
          >
            <Text style={[styles.doneBtnText, { color: '#fff' }]}>View Community Answers</Text>
          </TouchableOpacity>
        )}

        {/* Action Button */}
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => router.replace('/ielts/advanced?tab=speaking')}
        >
          <Text style={styles.doneBtnText}>Return to List</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
