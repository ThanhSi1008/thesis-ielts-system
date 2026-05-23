import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import type { PronunciationStats } from '@/types';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS } from '@/constants';

interface ProgressSummaryProps {
  stats: PronunciationStats;
}

export default function ProgressSummary({ stats }: ProgressSummaryProps) {
  const { totalSounds, masteredCount, practicingCount, newCount, overallMastery } = stats;

  const radius = 24;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallMastery / 100) * circumference;

  const getProgressColor = () => {
    if (overallMastery >= 75) return '#22C55E'; // green-500
    if (overallMastery >= 25) return '#FB923C'; // orange-400
    return '#3B82F6'; // blue-500
  };

  return (
    <View style={styles.card}>
      <View style={styles.flexRow}>
        {/* Ring Mastery */}
        <View style={styles.ringContainer}>
          <View style={styles.ringWrapper}>
            <Svg width={64} height={64} viewBox="0 0 64 64" style={styles.svg}>
              <Circle
                cx="32"
                cy="32"
                r={radius}
                stroke="#F1F5F9"
                strokeWidth={strokeWidth}
                fill="none"
              />
              <Circle
                cx="32"
                cy="32"
                r={radius}
                stroke={getProgressColor()}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 32 32)"
              />
            </Svg>
            <View style={styles.ringTextContainer}>
              <Text style={styles.ringText}>{overallMastery}%</Text>
            </View>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>🔊 IPA Mastery</Text>
            <Text style={styles.subTitle}>Track your pronunciation progress</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalSounds}</Text>
            <Text style={styles.statLabel}>Sounds</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#22C55E' }]}>{masteredCount}</Text>
            <Text style={styles.statLabel}>Mastered</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#FB923C' }]}>{practicingCount}</Text>
            <Text style={styles.statLabel}>Practicing</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#94A3B8' }]}>{newCount}</Text>
            <Text style={styles.statLabel}>New</Text>
          </View>
        </View>
      </View>

      {/* Progress Bar Segmented */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressSegment,
            {
              backgroundColor: '#22C55E',
              width: `${(masteredCount / totalSounds) * 100}%`,
            },
          ]}
        />
        <View
          style={[
            styles.progressSegment,
            {
              backgroundColor: '#FB923C',
              width: `${(practicingCount / totalSounds) * 100}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  flexRow: {
    flexDirection: 'column',
    gap: SPACING.md,
  },
  ringContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  ringWrapper: {
    position: 'relative',
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  ringTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  subTitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    gap: SPACING.xs,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
  },
  statValue: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 9,
    fontFamily: FONTS.bold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    flexDirection: 'row',
    marginTop: SPACING.md,
  },
  progressSegment: {
    height: '100%',
  },
});
