import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { toast } from '@/components/ui';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS, SHADOWS, ROUTES } from '@/constants';
import { ieltsAdvancedApi } from '@/services/ielts.api';
import { useGradingPoll } from '@/hooks/useGradingPoll';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useTheme } from '@/contexts/ThemeContext';
import WritingRubricView from '@/components/ielts/WritingRubricView';

const MOCK_TIPS = [
  'Use a variety of sentence structures (simple, compound, complex) to maximize your grammatical score.',
  'Paragraph transitions are key. Use transition signals like "Furthermore", "In contrast", and "Consequently".',
  'Avoid repeating the same words. Use synonyms to show off your lexical resource.',
  'Make sure your stance is clear throughout Task 2. A clear opinion is vital for Task Achievement.',
  'For Task 1, do not list every single detail. Summarize main trends and make comparisons where relevant.',
];

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

export default function AdvancedWritingResultScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { isPremium, loading: subLoading } = useSubscription();

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pollingActive, setPollingActive] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

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

  // Load session initially
  useEffect(() => {
    if (!sessionId || !isPremium) return;

    const loadSession = async () => {
      try {
        const res = await ieltsAdvancedApi.getWritingSession(sessionId);
        setSession(res);

        if (
          res.status === 'IN_PROGRESS' ||
          res.status === 'SUBMITTED' ||
          res.status === 'GRADING'
        ) {
          setPollingActive(true);
        }
      } catch (err) {
        if (__DEV__) console.error('[WritingResult] Fetch failed:', err);
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
    pollFn: ieltsAdvancedApi.getWritingSession,
    onDone: (finalSessionId) => {
      setPollingActive(false);
      // Reload final graded session details
      ieltsAdvancedApi.getWritingSession(finalSessionId).then((res) => {
        setSession(res);
      });
    },
    onError: (errMsg) => {
      setPollingActive(false);
      toast.error('Grading Error', errMsg);
    },
  });

  const prompt = session?.prompt;

  // Word count helper
  const essayWordCount = useMemo(() => {
    if (!session?.essay) return 0;
    return session.essay.trim().split(/\s+/).filter(Boolean).length;
  }, [session]);

  // Parse duration: seconds into MM:SS
  const timeDisplay = useMemo(() => {
    if (!session?.timeTaken) return '--:--';
    const mins = Math.floor(session.timeTaken / 60);
    const secs = session.timeTaken % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [session]);

  // Resilient feedback normalizer matching components/ielts/WritingRubricView expectation
  const normalizedFeedback = useMemo(() => {
    if (!session?.feedback) return null;

    const rawFeedback =
      typeof session.feedback === 'string' ? JSON.parse(session.feedback) : session.feedback;

    if (rawFeedback.task1 || rawFeedback.task2) {
      return rawFeedback;
    }

    const overall_band = session.bandScore ?? rawFeedback.overall_band ?? rawFeedback.band ?? 6.0;
    if (prompt?.taskType === 'TASK1') {
      return {
        overall_band,
        task1: rawFeedback,
        task2: null,
      };
    } else {
      return {
        overall_band,
        task1: null,
        task2: rawFeedback,
      };
    }
  }, [session, prompt]);

  // Prepare answers dict for WritingRubricView
  const answersDict = useMemo(() => {
    if (!session?.essay) return {};
    return prompt?.taskType === 'TASK1' ? { task1: session.essay } : { task2: session.essay };
  }, [session, prompt]);

  const band = session?.bandScore ?? 0;
  const bandStr = band.toFixed(1);
  const bandColor = getBandColor(band);
  const description = BAND_LABELS[bandStr] || '';
  const isPending = pollingActive || session?.status === 'GRADING';

  const activeColor = isDark ? colors.primary : COLORS.skill.writing;

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
      backgroundColor: isDark ? colors.card : COLORS.skill.writing,
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
      backgroundColor: isDark ? 'rgba(255, 198, 0, 0.15)' : 'rgba(217, 119, 6, 0.1)',
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
        <View style={styles.pendingContainer}>
          <ActivityIndicator size="large" color={activeColor} />
          <Text style={styles.pendingTitle}>Evaluating Your Essay...</Text>
          <Text style={styles.pendingSubtitle}>
            Our AI engine is currently grading your writing against standard IELTS rubrics. This
            usually takes 10 to 60 seconds.
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
            We were unable to successfully grade your essay. Please try retaking or reviewing your
            essay history.
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
          onPress={() => router.replace('/ielts/advanced/writing')}
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
              {isPending ? '⏳ GRADING IN PROGRESS' : '🏆 IELTS WRITING PRACTICE CERTIFICATE'}
            </Text>

            <Text style={[styles.certSubText, { color: colors.textSecondary }]}>
              {isPending
                ? 'Your practice session has been recorded. AI scoring engine is evaluating your performance...'
                : `This is to certify that you have successfully completed the practice of Advanced Writing`}
            </Text>

            <Text style={[styles.certExamTitle, { color: colors.text }]} numberOfLines={2}>
              {prompt?.title ?? 'IELTS Essay'}
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
                  {prompt?.taskType ?? 'TASK'}
                </Text>
              </View>
              <Text style={styles.metaItem}>
                <Ionicons name="document-text-outline" size={14} color={colors.textSecondary} />{' '}
                {essayWordCount} words
              </Text>
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

        {/* Rubric View Section */}
        {normalizedFeedback ? (
          <WritingRubricView
            feedback={normalizedFeedback}
            answers={answersDict}
            practicePart={prompt?.taskType === 'TASK1' ? 1 : 2}
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
          onPress={() => router.replace('/ielts/advanced/writing')}
        >
          <Text style={styles.doneBtnText}>Return to List</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
