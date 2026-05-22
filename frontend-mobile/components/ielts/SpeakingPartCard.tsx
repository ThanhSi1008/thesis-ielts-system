import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, RADIUS, FONT_SIZES, SPACING } from '@/constants';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

export interface SpeakingPartItem {
  id: string;
  partNumber: 1 | 2 | 3;
  partType?: string;
  topic: string;
  source?: string;
  category: string;
  bookNumber?: number;
  testNumber?: number;
  title: string;
  bestScore: number | null;
  lastAttempt: string | null;
  questions?: any;
}

interface SpeakingPartCardProps {
  part: SpeakingPartItem;
  index: number;
  onPress: () => void;
}

export function SpeakingPartCard({ part, index, onPress }: SpeakingPartCardProps) {
  const { colors, isDark } = useTheme();

  // Theme colors for Parts
  const getPartBadgeColor = (num: number) => {
    switch (num) {
      case 1:
        return {
          bg: isDark ? '#1e1b4b' : '#EEF2FF',
          text: isDark ? '#818cf8' : '#4F46E5',
          label: 'Part 1: Interview'
        };
      case 2:
        return {
          bg: isDark ? '#50072b' : '#FDF2F8',
          text: isDark ? '#f472b6' : '#DB2777',
          label: 'Part 2: Cue Card'
        };
      case 3:
        return {
          bg: isDark ? '#064e3b' : '#ECFDF5',
          text: isDark ? '#34d399' : '#059669',
          label: 'Part 3: Discussion'
        };
      default:
        return {
          bg: isDark ? colors.surface : '#F3F4F6',
          text: colors.textSecondary,
          label: `Part ${num}`
        };
    }
  };

  const partStyle = getPartBadgeColor(part.partNumber);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(400)}
      style={styles.cardWrapper}
    >
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Header Tags Row */}
        <View style={styles.tagRow}>
          <View style={styles.leftTags}>
            <View style={[styles.partChip, { backgroundColor: partStyle.bg }]}>
              <Text style={[styles.partChipText, { color: partStyle.text }]}>
                {partStyle.label}
              </Text>
            </View>
            <View style={[styles.categoryChip, { backgroundColor: isDark ? colors.surface : '#F3F4F6' }]}>
              <Text style={[styles.categoryChipText, { color: colors.textSecondary }]}>{part.category}</Text>
            </View>
          </View>

          <View style={styles.rightTags}>
            {part.source ? (
              <View style={[styles.sourceBadge, { backgroundColor: isDark ? colors.surface : '#F9FAFB', borderColor: colors.border }]}>
                <Ionicons name="book-outline" size={11} color={colors.textSecondary} />
                <Text style={[styles.sourceText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {part.source}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Part Title & Topic */}
        <View style={styles.bodyContainer}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {part.title}
          </Text>
          <Text style={[styles.topicText, { color: colors.textSecondary }]}>
            Topic: <Text style={[styles.topicHighlight, { color: colors.text }]}>{part.topic}</Text>
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Footer Row */}
        <View style={styles.footerRow}>
          {part.bestScore !== null ? (
            <View style={styles.scoreContainer}>
              <Text style={[styles.scoreLabel, { color: colors.textMuted }]}>Best Band</Text>
              <View style={[styles.scoreBadge, { backgroundColor: isDark ? '#3b0764' : '#F3E8FF' }]}>
                <Ionicons name="sparkles" size={12} color={isDark ? '#c084fc' : '#7C3AED'} style={{ marginRight: 4 }} />
                <Text style={[styles.scoreValue, { color: isDark ? '#c084fc' : '#7C3AED' }]}>Band {part.bestScore}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.unattemptedContainer}>
              <Ionicons name="mic-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.unattemptedText, { color: colors.textSecondary }]}>Not practiced yet</Text>
            </View>
          )}

          <View style={[styles.actionBtn, { backgroundColor: isDark ? colors.primary : '#7C3AED' }]}>
            <Text style={[styles.actionBtnText, { color: isDark ? colors.onPrimary : '#ffffff' }]}>
              {part.bestScore !== null ? 'Practice Again' : 'Start Practice'}
            </Text>
            <Ionicons name="arrow-forward" size={14} color={isDark ? colors.onPrimary : '#ffffff'} />
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
    maxWidth: '40%',
  },
  partChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderCurve: 'continuous',
  },
  partChipText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xs - 2,
    textTransform: 'uppercase',
  },
  categoryChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderCurve: 'continuous',
  },
  categoryChipText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs - 1,
    color: '#4B5563',
  },
  sourceBadge: {
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
  sourceText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs - 1,
    color: '#4B5563',
    maxWidth: 90,
  },
  bodyContainer: {
    marginBottom: 2,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md - 1,
    color: '#111827',
    lineHeight: 22,
    marginBottom: 4,
  },
  topicText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm - 1,
    color: '#6B7280',
  },
  topicHighlight: {
    fontFamily: FONTS.semibold,
    color: '#374151',
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
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderCurve: 'continuous',
  },
  scoreValue: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xs,
    color: '#7C3AED',
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
    backgroundColor: '#7C3AED', // Matching COLORS.skill.speaking
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
