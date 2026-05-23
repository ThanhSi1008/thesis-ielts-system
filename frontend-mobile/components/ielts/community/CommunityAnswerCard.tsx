import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { COLORS, FONTS, RADIUS, SPACING, FONT_SIZES } from '@/constants';
import { CommunityWritingAnswer, CommunitySpeakingAnswer, CommunityAnswerType } from '@/types';
import { Avatar, ScoreBadge, Badge, Skeleton, Text } from '@/components/atoms';

interface CommunityAnswerCardProps {
  type: CommunityAnswerType;
  answer: CommunityWritingAnswer | CommunitySpeakingAnswer;
  onPress: () => void;
}

function timeAgo(dateString: string) {
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export default function CommunityAnswerCard({ type, answer, onPress }: CommunityAnswerCardProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const isWriting = type === 'writing';
  const writingAnswer = answer as CommunityWritingAnswer;
  const speakingAnswer = answer as CommunitySpeakingAnswer;

  // Determine feedback breakdown sub-badges
  const renderFeedbackBadges = () => {
    if (!answer.feedback) return null;

    if (isWriting && writingAnswer.feedback) {
      const { taskAchievement, coherenceCohesion, lexicalResource, grammaticalRange } = writingAnswer.feedback;
      return (
        <View style={styles.badgeRow}>
          {taskAchievement !== undefined && <Badge label={`TA: ${taskAchievement}`} variant="neutral" size="sm" />}
          {coherenceCohesion !== undefined && <Badge label={`CC: ${coherenceCohesion}`} variant="neutral" size="sm" />}
          {lexicalResource !== undefined && <Badge label={`LR: ${lexicalResource}`} variant="neutral" size="sm" />}
          {grammaticalRange !== undefined && <Badge label={`GR: ${grammaticalRange}`} variant="neutral" size="sm" />}
        </View>
      );
    } else if (!isWriting && speakingAnswer.feedback) {
      const { fluency, vocabulary, grammar, pronunciation } = speakingAnswer.feedback;
      return (
        <View style={styles.badgeRow}>
          {fluency !== undefined && <Badge label={`FC: ${fluency}`} variant="neutral" size="sm" />}
          {vocabulary !== undefined && <Badge label={`LR: ${vocabulary}`} variant="neutral" size="sm" />}
          {grammar !== undefined && <Badge label={`GR: ${grammar}`} variant="neutral" size="sm" />}
          {pronunciation !== undefined && <Badge label={`PR: ${pronunciation}`} variant="neutral" size="sm" />}
        </View>
      );
    }
    return null;
  };

  const formattedTime = timeAgo(answer.submittedAt);
  const audioCount = !isWriting && speakingAnswer.audioAnswers ? Object.keys(speakingAnswer.audioAnswers).length : 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      {/* 1. Header */}
      <View style={styles.header}>
        <Avatar name={answer.userName} source={answer.userAvatar} size="sm" />
        <View style={styles.headerTextCol}>
          <Text style={styles.userName} numberOfLines={1}>
            {answer.userName}
          </Text>
          <Text style={styles.timeText}>{formattedTime}</Text>
        </View>
        <ScoreBadge band={answer.bandScore ?? 0.0} />
      </View>

      {/* 2. Preview Content */}
      <View style={styles.contentContainer}>
        {isWriting ? (
          <Text style={styles.previewText} numberOfLines={3}>
            {writingAnswer.essay}
          </Text>
        ) : (
          <View style={styles.speakingIndicator}>
            <Ionicons name="mic-outline" size={16} color={COLORS.skill.speaking} />
            <Text style={styles.speakingIndicatorText}>
              {audioCount} audio {audioCount === 1 ? 'answer' : 'answers'}
            </Text>
          </View>
        )}
      </View>

      {/* 3. Feedback Breakdown Sub-badges */}
      {answer.feedback && (
        <View style={styles.footer}>
          {renderFeedbackBadges()}
          <View style={styles.arrowButton}>
            <Text style={styles.arrowButtonText}>View Answer</Text>
            <Ionicons name="chevron-forward" size={12} color={colors.textSecondary} />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: RADIUS.xl,
      padding: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: SPACING.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 6,
      elevation: 2,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.sm,
    },
    headerTextCol: {
      flex: 1,
      marginLeft: SPACING.sm,
      marginRight: SPACING.md,
    },
    userName: {
      fontSize: FONT_SIZES.sm,
      fontFamily: FONTS.bold,
      color: colors.text,
    },
    timeText: {
      fontSize: 10,
      fontFamily: FONTS.regular,
      color: colors.textMuted,
      marginTop: 2,
    },
    contentContainer: {
      marginBottom: SPACING.sm,
    },
    previewText: {
      fontSize: FONT_SIZES.xs,
      fontFamily: FONTS.regular,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    speakingIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: COLORS.skill.speaking + '12',
      alignSelf: 'flex-start',
      paddingHorizontal: SPACING.md,
      paddingVertical: 6,
      borderRadius: RADIUS.md,
    },
    speakingIndicatorText: {
      fontSize: FONT_SIZES.xs,
      fontFamily: FONTS.bold,
      color: COLORS.skill.speaking,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderColor: colors.border,
      paddingTop: SPACING.sm,
      marginTop: SPACING.xs,
    },
    badgeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
      flex: 1,
    },
    arrowButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    arrowButtonText: {
      fontSize: 11,
      fontFamily: FONTS.bold,
      color: colors.textSecondary,
    },
  });
}
