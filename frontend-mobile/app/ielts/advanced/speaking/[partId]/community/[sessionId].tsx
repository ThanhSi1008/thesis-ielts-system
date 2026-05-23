import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { ieltsAdvancedApi } from '@/services';
import { CommunitySpeakingAnswer } from '@/types';
import { AudioPlayer } from '@/components/ui/AudioPlayer';
import { ProgressCircle, ProgressBar, Skeleton, Badge, ScoreBadge, Text } from '@/components/atoms';
import { EmptyState } from '@/components/molecules';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SpeakingAnswerDetailScreen() {
  const router = useRouter();
  const { partId, sessionId } = useLocalSearchParams<{ partId: string; sessionId: string }>();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const [part, setPart] = useState<any>(null);
  const [answer, setAnswer] = useState<CommunitySpeakingAnswer | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentsCollapsed, setCommentsCollapsed] = useState(true);

  useEffect(() => {
    if (!partId || !sessionId) return;
    
    const loadDetails = async () => {
      try {
        const [partRes, answerRes] = await Promise.allSettled([
          ieltsAdvancedApi.getSpeakingPart(partId),
          ieltsAdvancedApi.getCommunitySpeakingAnswer(partId, sessionId),
        ]);
        if (partRes.status === 'fulfilled') setPart(partRes.value);
        if (answerRes.status === 'fulfilled') setAnswer(answerRes.value);
      } catch (e) {
        console.error('Failed to load community speaking details:', e);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [partId, sessionId]);

  const toggleComments = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCommentsCollapsed(!commentsCollapsed);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.skill.speaking} />
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
          <Text style={styles.headerTitle}>Speaking Detail</Text>
          <View style={{ width: 44 }} />
        </View>
        <EmptyState
          title="Answer Not Found"
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
          <Text style={styles.headerTitle} numberOfLines={1}>{answer.userName}'s Speaking</Text>
          <Text style={styles.headerSubtitle}>Submitted via community answers</Text>
        </View>
        <ScoreBadge band={answer.bandScore ?? 0.0} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 1. Part recap */}
        {part && (
          <View style={styles.recapCard}>
            <View style={styles.recapHeader}>
              <Badge label={`Part ${part.partNumber ?? 1}`} variant="info" />
              <Text style={styles.recapMeta}>
                {part.questions?.length ?? 0} Questions
              </Text>
            </View>
            <Text style={styles.recapTitle}>{part.topic ?? part.title}</Text>
          </View>
        )}

        {/* 2. Questions & Audio Responses */}
        <Text style={styles.sectionTitle}>Audio Responses</Text>
        {part?.questions && part.questions.length > 0 ? (
          <View style={styles.questionsList}>
            {part.questions.map((q: any, idx: number) => {
              const audioUrl = answer.audioAnswers?.[String(idx)];
              return (
                <View key={idx} style={styles.questionCard}>
                  <Text style={styles.questionLabel}>Question {idx + 1}</Text>
                  <Text style={styles.questionText}>{q.text ?? q.question}</Text>
                  {audioUrl ? (
                    <AudioPlayer url={audioUrl} />
                  ) : (
                    <View style={styles.noAudioContainer}>
                      <Ionicons name="mic-off-outline" size={16} color={colors.textMuted} />
                      <Text style={styles.noAudioText}>No recording submitted for this question</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          <EmptyState
            title="No Questions"
            description="No questions found for this topic."
            illustration="help-circle-outline"
            style={{ minHeight: 120, paddingVertical: SPACING.md }}
          />
        )}

        {/* 3. Feedback rubric breakdown */}
        {feedback && (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackTitle}>IELTS Rubric Grading</Text>
            
            <View style={styles.rubricContainer}>
              {/* Fluency */}
              {feedback.fluency !== undefined && (
                <View style={styles.rubricRow}>
                  <View style={styles.rubricHeader}>
                    <Text style={styles.rubricLabel}>Fluency & Coherence</Text>
                    <Text style={styles.rubricVal}>Band {feedback.fluency.toFixed(1)}</Text>
                  </View>
                  <ProgressBar value={feedback.fluency} max={9} height={6} color={colors.primary} />
                </View>
              )}

              {/* Vocabulary */}
              {feedback.vocabulary !== undefined && (
                <View style={styles.rubricRow}>
                  <View style={styles.rubricHeader}>
                    <Text style={styles.rubricLabel}>Lexical Resource (Vocabulary)</Text>
                    <Text style={styles.rubricVal}>Band {feedback.vocabulary.toFixed(1)}</Text>
                  </View>
                  <ProgressBar value={feedback.vocabulary} max={9} height={6} color={COLORS.skill.reading} />
                </View>
              )}

              {/* Grammar */}
              {feedback.grammar !== undefined && (
                <View style={styles.rubricRow}>
                  <View style={styles.rubricHeader}>
                    <Text style={styles.rubricLabel}>Grammatical Range & Accuracy</Text>
                    <Text style={styles.rubricVal}>Band {feedback.grammar.toFixed(1)}</Text>
                  </View>
                  <ProgressBar value={feedback.grammar} max={9} height={6} color={COLORS.skill.speaking} />
                </View>
              )}

              {/* Pronunciation */}
              {feedback.pronunciation !== undefined && (
                <View style={styles.rubricRow}>
                  <View style={styles.rubricHeader}>
                    <Text style={styles.rubricLabel}>Pronunciation</Text>
                    <Text style={styles.rubricVal}>Band {feedback.pronunciation.toFixed(1)}</Text>
                  </View>
                  <ProgressBar value={feedback.pronunciation} max={9} height={6} color={COLORS.skill.listening} />
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
      marginBottom: SPACING.lg,
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
    sectionTitle: {
      fontSize: FONT_SIZES.sm,
      fontFamily: FONTS.bold,
      color: colors.text,
      marginBottom: SPACING.md,
      paddingLeft: 2,
    },
    questionsList: {
      gap: SPACING.md,
      marginBottom: SPACING.lg,
    },
    questionCard: {
      backgroundColor: colors.card,
      borderRadius: RADIUS.xl,
      padding: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    questionLabel: {
      fontSize: 10,
      fontFamily: FONTS.bold,
      color: COLORS.skill.speaking,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    questionText: {
      fontSize: FONT_SIZES.sm,
      fontFamily: FONTS.medium,
      color: colors.text,
      lineHeight: 18,
    },
    noAudioContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.bgSubtle,
      padding: SPACING.md,
      borderRadius: RADIUS.lg,
      marginTop: SPACING.md,
    },
    noAudioText: {
      fontSize: 11,
      fontFamily: FONTS.regular,
      color: colors.textMuted,
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
