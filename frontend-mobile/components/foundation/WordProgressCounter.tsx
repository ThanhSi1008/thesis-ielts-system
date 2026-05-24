import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { WordProgress } from '@/types';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface WordProgressCounterProps {
  wordProgress: WordProgress[];
  total: number;
}

export default function WordProgressCounter({ wordProgress, total }: WordProgressCounterProps) {
  const { isDark, colors } = useTheme();

  const masteredCount = wordProgress.filter((w) => w.status === 'MASTERED').length;
  const practicingCount = wordProgress.filter((w) => w.status === 'PRACTICING').length;
  const allNew = masteredCount === 0 && practicingCount === 0;
  const allMastered = masteredCount === total && total > 0;

  // Status colors
  const statusColors = {
    MASTERED: '#22C55E',   // Green
    PRACTICING: '#FB923C', // Orange
    NEW: isDark ? '#334155' : '#E2E8F0', // Gray
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.container}>
        {/* Left Side: Counter Status */}
        <View style={styles.leftContainer}>
          {allMastered ? (
            <View style={styles.masteredBadge}>
              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
            </View>
          ) : (
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: allNew
                    ? statusColors.NEW
                    : practicingCount > 0
                    ? statusColors.PRACTICING
                    : statusColors.MASTERED,
                },
              ]}
            />
          )}

          <Text style={[styles.counterText, { color: colors.text }]}>
            {allNew
              ? `0/${total} words practiced`
              : allMastered
              ? `All ${total} words mastered!`
              : `${masteredCount}/${total} mastered`}
          </Text>

          {practicingCount > 0 && !allMastered && (
            <View style={[styles.practicingBadge, { backgroundColor: isDark ? 'rgba(251, 146, 60, 0.15)' : '#FFF7ED' }]}>
              <Text style={styles.practicingBadgeText}>{practicingCount} learning</Text>
            </View>
          )}
        </View>

        {/* Right Side: Visual Dots */}
        {total > 0 && (
          <View style={styles.dotsRow}>
            {wordProgress.map((wp, idx) => (
              <View
                key={idx}
                style={[
                  styles.wordDot,
                  {
                    backgroundColor: statusColors[wp.status] || statusColors.NEW,
                  },
                ]}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: SPACING.md,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  masteredBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  counterText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
  },
  practicingBadge: {
    paddingHorizontal: SPACING.xs + 2,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  practicingBadgeText: {
    fontSize: 10,
    color: '#EA580C',
    fontFamily: FONTS.medium,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  wordDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
