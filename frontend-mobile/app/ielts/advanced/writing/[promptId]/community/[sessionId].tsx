import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { ieltsAdvancedApi } from '@/services';
import { CommunityWritingAnswer } from '@/types';
import { TextWithLookup } from '@/components/global/TextWithLookup';
import { ProgressCircle, ProgressBar, Skeleton, Badge, ScoreBadge, Text } from '@/components/atoms';
import { EmptyState } from '@/components/molecules';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function WritingAnswerDetailScreen() {
  const router = useRouter();
  const { promptId, sessionId } = useLocalSearchParams<{ promptId: string; sessionId: string }>();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const [prompt, setPrompt] = useState<any>(null);
  const [answer, setAnswer] = useState<CommunityWritingAnswer | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentsCollapsed, setCommentsCollapsed] = useState(true);

  useEffect(() => {
    if (!promptId || !sessionId) return;
    
    const loadDetails = async () => {
      try {
        const [promptRes, answerRes] = await Promise.allSettled([
          ieltsAdvancedApi.getWritingPrompt(promptId),
          ieltsAdvancedApi.getCommunityWritingAnswer(promptId, sessionId),
        ]);
        if (promptRes.status === 'fulfilled') setPrompt(promptRes.value);
        if (answerRes.status === 'fulfilled') setAnswer(answerRes.value);
      } catch (e) {
        console.error('Failed to load community essay details:', e);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [promptId, sessionId]);

  const toggleComments = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCommentsCollapsed(!commentsCollapsed);
  };

  const essayWordCount = useMemo(() => {
    if (!answer?.essay) return 0;
    return answer.essay.trim().split(/\s+/).filter(Boolean).length;
  }, [answer]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.skill.writing} />
      </View>
    );
  }

  if (!answer) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Essay Detail</Text>
          <View style={{ width: 44 }} />
        </View>
        <EmptyState
          title="Essay Not Found"
          description="We could not retrieve this community submission. It may have been removed."
          illustration="alert-circle-outline"
        />
      </SafeAreaView>
    );
  }

  const feedback = answer.feedback;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle} numberOfLines={1}>{answer.userName}'s Essay</Text>
          <Text style={styles.headerSubtitle}>Submitted via community answers</Text>
        </View>
        <ScoreBadge band={answer.bandScore ?? 0.0} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 1. Prompt recap */}
        {prompt && (
          <View style={styles.recapCard}>
            <View style={styles.recapHeader}>
              <Badge label={prompt.taskType} variant="info" />
              <Text style={styles.recapMeta}>
                Min: {prompt.minimumWords ?? (prompt.taskType === 'TASK1' ? 150 : 250)} words · Suggested: {prompt.suggestedTime ?? (prompt.taskType === 'TASK1' ? 20 : 40)}m
              </Text>
            </View>
            <Text style={styles.recapTitle}>{prompt.title}</Text>
          </View>
        )}

        {/* Dictionary Help Callout */}
        <View style={styles.helpCallout}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.helpCalloutText}>
            Tip: Long-press any word in the essay to look it up in the dictionary.
          </Text>
        </View>

        {/* 2. Essay view */}
        <View style={styles.essayCard}>
          <View style={styles.essayCardHeader}>
            <Text style={styles.essayTitle}>Essay Response</Text>
            <Badge label={`${essayWordCount} words`} variant="neutral" />
          </View>
          <TextWithLookup content={answer.essay} style={styles.essayText} />
        </View>

        {/* 3. Feedback rubric breakdown */}
        {feedback && (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackTitle}>IELTS Rubric Grading</Text>
            
            <View style={styles.rubricContainer}>
              {/* Task Achievement */}
              {feedback.taskAchievement !== undefined && (
                <View style={styles.rubricRow}>
                  <View style={styles.rubricHeader}>
                    <Text style={styles.rubricLabel}>Task Achievement</Text>
                    <Text style={styles.rubricVal}>Band {feedback.taskAchievement.toFixed(1)}</Text>
                  </View>
                  <ProgressBar value={feedback.taskAchievement} max={9} height={6} color={colors.primary} />
                </View>
              )}

              {/* Coherence & Cohesion */}
              {feedback.coherenceCohesion !== undefined && (
                <View style={styles.rubricRow}>
                  <View style={styles.rubricHeader}>
                    <Text style={styles.rubricLabel}>Coherence & Cohesion</Text>
                    <Text style={styles.rubricVal}>Band {feedback.coherenceCohesion.toFixed(1)}</Text>
                  </View>
                  <ProgressBar value={feedback.coherenceCohesion} max={9} height={6} color={COLORS.skill.reading} />
                </View>
              )}

              {/* Lexical Resource */}
              {feedback.lexicalResource !== undefined && (
                <View style={styles.rubricRow}>
                  <View style={styles.rubricHeader}>
                    <Text style={styles.rubricLabel}>Lexical Resource (Vocabulary)</Text>
                    <Text style={styles.rubricVal}>Band {feedback.lexicalResource.toFixed(1)}</Text>
                  </View>
                  <ProgressBar value={feedback.lexicalResource} max={9} height={6} color={COLORS.skill.speaking} />
                </View>
              )}

              {/* Grammatical Range & Accuracy */}
              {feedback.grammaticalRange !== undefined && (
                <View style={styles.rubricRow}>
                  <View style={styles.rubricHeader}>
                    <Text style={styles.rubricLabel}>Grammatical Range & Accuracy</Text>
                    <Text style={styles.rubricVal}>Band {feedback.grammaticalRange.toFixed(1)}</Text>
                  </View>
                  <ProgressBar value={feedback.grammaticalRange} max={9} height={6} color={COLORS.skill.listening} />
                </View>
              )}
            </View>

            {/* 4. Collapsible comments section */}
            {feedback.comments && (
              <View style={styles.commentsWrapper}>
                <TouchableOpacity style={styles.commentsHeader} onPress={toggleComments} activeOpacity={0.8}>
                  <Text style={styles.commentsTitle}>Detailed AI Evaluation</Text>
                  <Ionicons name={commentsCollapsed ? 'chevron-down' : 'chevron-up'} size={18} color={colors.textSecondary} />
                </TouchableOpacity>
                {!commentsCollapsed && (
                  <View style={styles.commentsContent}>
                    <Text style={styles.commentsText}>{feedback.comments}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.md,
      paddingBottom: SPACING.sm,
      paddingTop: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },
    backBtn: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitleCol: {
      flex: 1,
      marginLeft: SPACING.xs,
      marginRight: SPACING.sm,
    },
    headerTitle: {
      fontSize: FONT_SIZES.md,
      fontFamily: FONTS.bold,
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 11,
      fontFamily: FONTS.regular,
      color: colors.textSecondary,
      marginTop: 2,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: SPACING.md,
      paddingBottom: 40,
    },
    recapCard: {
      backgroundColor: colors.card,
      borderRadius: RADIUS.xl,
      padding: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: SPACING.md,
    },
    recapHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.sm,
    },
    recapMeta: {
      fontSize: 11,
      color: colors.textSecondary,
      fontFamily: FONTS.regular,
    },
    recapTitle: {
      fontSize: FONT_SIZES.sm,
      fontFamily: FONTS.bold,
      color: colors.text,
      lineHeight: 18,
    },
    helpCallout: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.bgSubtle,
      paddingHorizontal: SPACING.md,
      paddingVertical: 8,
      borderRadius: RADIUS.lg,
      marginBottom: SPACING.md,
    },
    helpCalloutText: {
      fontSize: 11,
      fontFamily: FONTS.medium,
      color: colors.textSecondary,
      flex: 1,
    },
    essayCard: {
      backgroundColor: colors.card,
      borderRadius: RADIUS.xl,
      padding: SPACING.lg,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: SPACING.md,
    },
    essayCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.md,
      borderBottomWidth: 1,
      borderColor: colors.border,
      paddingBottom: SPACING.sm,
    },
    essayTitle: {
      fontSize: FONT_SIZES.md,
      fontFamily: FONTS.bold,
      color: colors.text,
    },
    essayText: {
      fontSize: FONT_SIZES.sm,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      color: colors.text,
      lineHeight: 22,
    },
    feedbackCard: {
      backgroundColor: colors.card,
      borderRadius: RADIUS.xl,
      padding: SPACING.lg,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: SPACING.md,
    },
    feedbackTitle: {
      fontSize: FONT_SIZES.md,
      fontFamily: FONTS.bold,
      color: colors.text,
      marginBottom: SPACING.lg,
    },
    rubricContainer: {
      gap: SPACING.md,
      marginBottom: SPACING.lg,
    },
    rubricRow: {
      marginBottom: SPACING.xs,
    },
    rubricHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    rubricLabel: {
      fontSize: FONT_SIZES.xs,
      fontFamily: FONTS.bold,
      color: colors.textSecondary,
    },
    rubricVal: {
      fontSize: FONT_SIZES.xs,
      fontFamily: FONTS.bold,
      color: colors.text,
    },
    commentsWrapper: {
      borderTopWidth: 1,
      borderColor: colors.border,
      paddingTop: SPACING.md,
    },
    commentsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    commentsTitle: {
      fontSize: FONT_SIZES.sm,
      fontFamily: FONTS.bold,
      color: colors.text,
    },
    commentsContent: {
      marginTop: SPACING.md,
      backgroundColor: colors.bgSubtle,
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
    },
    commentsText: {
      fontSize: FONT_SIZES.xs,
      fontFamily: FONTS.regular,
      color: colors.textSecondary,
      lineHeight: 18,
    },
  });
}
