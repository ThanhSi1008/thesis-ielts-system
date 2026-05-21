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

export default function AdvancedWritingResultScreen() {
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
        const res = await ieltsAdvancedApi.getWritingSession(sessionId);
        setSession(res);

        if (res.status === 'IN_PROGRESS' || res.status === 'SUBMITTED' || res.status === 'GRADING') {
          setPollingActive(true);
        }
      } catch (err) {
        console.error('[WritingResult] Fetch failed:', err);
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
      Alert.alert('Grading Error', errMsg);
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

    const rawFeedback = typeof session.feedback === 'string' 
      ? JSON.parse(session.feedback) 
      : session.feedback;

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
    return prompt?.taskType === 'TASK1'
      ? { task1: session.essay }
      : { task2: session.essay };
  }, [session, prompt]);

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
          <Text style={styles.pendingTitle}>Evaluating Your Essay...</Text>
          <Text style={styles.pendingSubtitle}>
            Our AI engine is currently grading your writing against standard IELTS rubrics. This usually takes 10 to 60 seconds.
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
            We were unable to successfully grade your essay. Please try retaking or reviewing your essay history.
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
        <TouchableOpacity style={styles.headerBack} onPress={() => router.replace('/ielts/advanced/writing')}>
          <Ionicons name="arrow-back" size={24} color={isDark ? colors.text : "#fff"} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Evaluation Results</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator contentContainerStyle={styles.scrollContent}>
        {/* Score & Prompt Overview Card */}
        <View style={styles.overviewCard}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreVal}>{session.bandScore?.toFixed(1) ?? 'N/A'}</Text>
            <Text style={styles.scoreLbl}>Band Score</Text>
          </View>

          <View style={styles.overviewDetails}>
            <Text style={styles.promptTitle} numberOfLines={2}>
              {prompt?.title ?? 'IELTS Essay'}
            </Text>
            <View style={styles.promptMetaRow}>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>{prompt?.taskType ?? 'TASK'}</Text>
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
