import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ConfirmDialog } from '@/components';
import { toast } from '@/components/ui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS, SHADOWS, ROUTES } from '@/constants';
import { ieltsAdvancedApi } from '@/services/ielts.api';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useGrading } from '@/contexts/GradingContext';
import SpeakingExamBlock from '@/components/ielts/SpeakingExamBlock';

export default function AdvancedSpeakingPracticeScreen() {
  const router = useRouter();
  const { partId } = useLocalSearchParams<{ partId: string }>();
  const { isPremium, loading: subLoading } = useSubscription();
  const { colors, isDark } = useTheme();
  const { submitAndTrack } = useGrading();

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
    },
    loadingText: {
      marginTop: SPACING.md,
      fontFamily: FONTS.medium,
      fontSize: FONT_SIZES.sm,
      color: colors.textSecondary,
    },
    errorText: {
      fontFamily: FONTS.bold,
      fontSize: FONT_SIZES.md,
      color: colors.error,
      textAlign: 'center',
    },
    backBtnText: {
      marginTop: SPACING.md,
      padding: SPACING.sm,
    },
    header: {
      backgroundColor: isDark ? colors.card : COLORS.skill.speaking,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderBottomWidth: isDark ? 1 : 0,
      borderBottomColor: colors.border,
    },
    backBtn: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitleContainer: {
      flex: 1,
      marginLeft: SPACING.sm,
    },
    headerTitle: {
      color: isDark ? colors.text : '#fff',
      fontSize: FONT_SIZES.md,
      fontFamily: FONTS.bold,
    },
    headerSubtitle: {
      color: isDark ? colors.textSecondary : 'rgba(255, 255, 255, 0.8)',
      fontSize: FONT_SIZES.xs,
      fontFamily: FONTS.regular,
    },
    body: {
      flex: 1,
    },
    submittingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      justifyContent: 'center',
      alignItems: 'center',
      gap: SPACING.md,
      zIndex: 999,
    },
    submittingText: {
      fontFamily: FONTS.bold,
      fontSize: FONT_SIZES.md,
      color: isDark ? '#A78BFA' : COLORS.skill.speaking,
    },
  });

  const [part, setPart] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [speakingAnswers, setSpeakingAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exitConfirmVisible, setExitConfirmVisible] = useState(false);

  // Track elapsed time
  const startTimeRef = useRef<number>(0);

  // Verify subscription status
  useEffect(() => {
    if (!subLoading && !isPremium) {
      router.replace(ROUTES.pricing);
    }
  }, [isPremium, subLoading]);

  // Fetch part detail and initialize session
  useEffect(() => {
    if (!isPremium || !partId) return;

    const initPractice = async () => {
      try {
        const res = await ieltsAdvancedApi.getSpeakingPart(partId);
        setPart(res);

        if (res.activeSession) {
          setSessionId(res.activeSession.id);
          // Set draft answers if any exist (e.g. from prior attempts)
          const draftAnswers: Record<string, string> = {};
          if (res.activeSession.answers) {
            Object.entries(res.activeSession.answers).forEach(([key, val]) => {
              // Convert index key "0" back to "0-0" structure for SpeakingExamBlock
              draftAnswers[`0-${key}`] = String(val);
            });
          }
          setSpeakingAnswers(draftAnswers);
        } else {
          const session = await ieltsAdvancedApi.createSpeakingSession(partId);
          setSessionId(session.id);
          setSpeakingAnswers({});
        }

        startTimeRef.current = Date.now();
      } catch (err) {
        if (__DEV__) console.error('[SpeakingPractice] Failed to initialize:', err);
        toast.error('Error', 'Failed to load speaking session. Please try again.');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    initPractice();
  }, [partId, isPremium]);

  const handleSubmit = async () => {
    if (!sessionId) return;

    setIsSubmitting(true);

    try {
      const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);

      // Map answers format from "0-i" (SpeakingExamBlock flat structure) to "i" (backend format)
      const audioAnswers: Record<string, string> = {};
      Object.entries(speakingAnswers).forEach(([key, url]) => {
        const partsOfKey = key.split('-');
        if (partsOfKey.length === 2 && partsOfKey[0] === '0') {
          audioAnswers[partsOfKey[1]] = url;
        }
      });

      await submitAndTrack({
        sessionId,
        examType: 'SPEAKING',
        answers: audioAnswers,
        timeTaken,
        resultUrl: `/ielts/advanced/speaking/result/${sessionId}`,
      });

      // Navigate to polling/results screen
      router.replace(`/ielts/advanced/speaking/result/${sessionId}`);
    } catch (err: any) {
      if (__DEV__) console.error('[SpeakingPractice] Submit failed:', err);
      toast.error(
        'Submit Failed',
        err?.message ?? 'Could not submit your speaking practice. Please try again.',
      );
      setIsSubmitting(false);
    }
  };

  if (subLoading || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Initializing practice room...</Text>
      </View>
    );
  }

  if (!part) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Speaking topic not found.</Text>
        <TouchableOpacity style={styles.backBtnText} onPress={() => router.back()}>
          <Text style={{ color: COLORS.skill.speaking }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Map backend part properties to snake_case structure expected by SpeakingExamBlock
  const mappedPart = {
    part_number: part.partNumber ?? 1,
    topic: part.topic ?? part.title ?? '',
    cue_card: part.cueCard ?? part.cue_card ?? '',
    video: part.video ?? '',
    video2: part.video2 ?? '',
    questions: (part.questions ?? []).map((q: any) => ({
      text: q.text ?? q.question ?? '',
      video: q.video ?? '',
      video2: q.video2 ?? '',
    })),
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setExitConfirmVisible(true)}
        >
          <Ionicons name="close" size={24} color={isDark ? colors.text : '#fff'} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Part {part.partNumber ?? 1} Practice</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {part.topic ?? part.title}
          </Text>
        </View>
        <TouchableOpacity
          style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
          onPress={() => router.push(`/ielts/advanced/speaking/${partId}/community`)}
        >
          <Ionicons name="people-outline" size={22} color={isDark ? colors.text : '#fff'} />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <SpeakingExamBlock
          parts={[mappedPart]}
          answers={speakingAnswers}
          onChange={setSpeakingAnswers}
          onSubmit={handleSubmit}
        />
      </View>

      {/* Full screen loader during submission */}
      {isSubmitting && (
        <View style={styles.submittingOverlay}>
          <ActivityIndicator size="large" color={COLORS.skill.speaking} />
          <Text style={styles.submittingText}>Submitting answers for grading...</Text>
        </View>
      )}

      <ConfirmDialog
        visible={exitConfirmVisible}
        onClose={() => setExitConfirmVisible(false)}
        title="Exit Practice?"
        message="Your progress will be saved."
        variant="warning"
        primaryAction={{
          title: 'Exit',
          onPress: () => {
            setExitConfirmVisible(false);
            router.back();
          },
        }}
        secondaryAction={{
          title: 'Cancel',
          onPress: () => setExitConfirmVisible(false),
        }}
      />
    </SafeAreaView>
  );
}
