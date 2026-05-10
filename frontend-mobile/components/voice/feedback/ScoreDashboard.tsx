import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import type { PronunciationScore } from '@/types';

interface ScoreDashboardProps {
  score: PronunciationScore;
}

/**
 * Dashboard to display AI Pronunciation scoring results
 */
export const ScoreDashboard: React.FC<ScoreDashboardProps> = ({ score }) => {
  const metrics = [
    { label: 'Overall', value: score.pronScore, color: COLORS.primary },
    { label: 'Accuracy', value: score.accuracyScore, color: '#10B981' }, // Green
    { label: 'Fluency', value: score.fluencyScore, color: '#3B82F6' }, // Blue
    { label: 'Completeness', value: score.completenessScore, color: '#F59E0B' }, // Orange
  ];

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {metrics.map((m, i) => (
          <View key={i} style={styles.metricCard}>
            <Text style={styles.label}>{m.label}</Text>
            <View style={[styles.valueBg, { backgroundColor: m.color + '20' }]}>
              <Text style={[styles.value, { color: m.color }]}>{Math.round(m.value)}</Text>
            </View>
            <View style={styles.progressBg}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${m.value}%` as any, backgroundColor: m.color }
                ]} 
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    padding: SPACING.sm,
    alignItems: 'center',
  },
  label: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  valueBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
  },
  progressBg: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
});
