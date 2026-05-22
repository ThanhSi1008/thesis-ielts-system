import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, FONT_SIZES, SPACING } from '@/constants';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

export interface WritingPromptItem {
  id: string;
  taskType: 'TASK1' | 'TASK2';
  subType: string;
  source?: string;
  category: string;
  bookNumber?: number;
  testNumber?: number;
  title: string;
  imageUrl?: string;
  minimumWords: number;
  suggestedTime: number;
  difficulty?: string;
  bestScore: number | null;
  lastAttempt: string | null;
}

interface AdvancedWritingPromptCardProps {
  prompt: WritingPromptItem;
  index: number;
  onPress: () => void;
}

export function AdvancedWritingPromptCard({
  prompt,
  index,
  onPress,
}: AdvancedWritingPromptCardProps) {
  const { colors, isDark } = useTheme();
  const isTask1 = prompt.taskType === 'TASK1';

  // Custom theme colors for tasks
  const taskBg = isDark ? (isTask1 ? '#451a03' : '#2e1065') : isTask1 ? '#FEF3C7' : '#EDE9FE';
  const taskColor = isDark ? (isTask1 ? '#fbbf24' : '#c084fc') : isTask1 ? '#D97706' : '#7C3AED';
  const taskLabel = isTask1 ? 'Task 1' : 'Task 2';

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)} style={styles.cardWrapper}>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Header tags row */}
        <View style={styles.tagRow}>
          <View style={styles.leftTags}>
            <View style={[styles.taskChip, { backgroundColor: taskBg }]}>
              <Text style={[styles.taskChipText, { color: taskColor }]}>{taskLabel}</Text>
            </View>
            <View
              style={[styles.subTypeChip, { backgroundColor: isDark ? colors.surface : '#F3F4F6' }]}
            >
              <Text style={[styles.subTypeChipText, { color: colors.textSecondary }]}>
                {prompt.subType}
              </Text>
            </View>
          </View>

          <View style={styles.rightTags}>
            <View
              style={[
                styles.timeBadge,
                {
                  backgroundColor: isDark ? colors.surface : '#F9FAFB',
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
              <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                {prompt.suggestedTime}m
              </Text>
            </View>
            <View
              style={[styles.categoryBadge, { backgroundColor: isDark ? '#1e3a8a' : '#EFF6FF' }]}
            >
              <Text style={[styles.categoryText, { color: isDark ? '#93c5fd' : '#1D4ED8' }]}>
                {prompt.category}
              </Text>
            </View>
          </View>
        </View>

        {/* Prompt Title */}
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {prompt.title}
        </Text>

        {/* Source metadata if available */}
        {prompt.source ? (
          <Text style={[styles.sourceText, { color: colors.textSecondary }]}>
            Source: {prompt.source}
          </Text>
        ) : null}

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Footer row: Best score or Status indicator */}
        <View style={styles.footerRow}>
          {prompt.bestScore !== null ? (
            <View style={styles.scoreContainer}>
              <Text style={[styles.scoreLabel, { color: colors.textMuted }]}>Best Score</Text>
              <View
                style={[styles.scoreBadge, { backgroundColor: isDark ? '#064e3b' : '#DCFCE7' }]}
              >
                <Ionicons
                  name="trophy-outline"
                  size={14}
                  color={isDark ? '#34d399' : '#15803D'}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.scoreValue, { color: isDark ? '#34d399' : '#15803D' }]}>
                  Band {prompt.bestScore}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.unattemptedContainer}>
              <Ionicons name="create-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.unattemptedText, { color: colors.textSecondary }]}>
                Not attempted yet
              </Text>
            </View>
          )}

          <View
            style={[styles.actionBtn, { backgroundColor: isDark ? colors.primary : '#D97706' }]}
          >
            <Text style={[styles.actionBtnText, { color: colors.onPrimary }]}>
              {prompt.bestScore !== null ? 'Practice Again' : 'Start Practice'}
            </Text>
            <Ionicons name="arrow-forward" size={14} color={colors.onPrimary} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: SPACING.md,
    width: '100%',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: SPACING.md,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)',
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  leftTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rightTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderCurve: 'continuous',
  },
  taskChipText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xs - 2,
    textTransform: 'uppercase',
  },
  subTypeChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderCurve: 'continuous',
  },
  subTypeChipText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs - 1,
    color: '#4B5563',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 3,
  },
  timeText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs - 1,
    color: '#4B5563',
  },
  categoryBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs - 2,
    color: '#1D4ED8',
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md - 1,
    color: '#111827',
    lineHeight: 22,
    marginBottom: 4,
  },
  sourceText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: '#6B7280',
    marginBottom: SPACING.xs,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: SPACING.sm,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  scoreLabel: {
    fontFamily: FONTS.medium,
    fontSize: 9,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderCurve: 'continuous',
  },
  scoreValue: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xs,
    color: '#15803D',
  },
  unattemptedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  unattemptedText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    color: '#4B5563',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D97706', // Matching COLORS.skill.writing
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderCurve: 'continuous',
    gap: 4,
  },
  actionBtnText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xs,
    color: '#ffffff',
  },
});
