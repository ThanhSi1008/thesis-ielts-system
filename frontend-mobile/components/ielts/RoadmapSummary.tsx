import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, FONT_SIZES, SPACING } from '@/constants';

interface RoadmapSummaryProps {
  totalLessons: number;
  completedLessons: number;
  totalExercises: number;
  completedExercises: number;
}

export function RoadmapSummary({
  totalLessons,
  completedLessons,
  totalExercises,
  completedExercises
}: RoadmapSummaryProps) {
  const lessonsLeft = totalLessons - completedLessons;
  const exercisesLeft = totalExercises - completedExercises;

  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>IELTS Basic Mastery Roadmap</Text>
      <View style={styles.summaryMeta}>
        <Text style={styles.metaText}>
          Lessons left{' '}
          <Text style={styles.metaBold}>{lessonsLeft}</Text>
          <Text style={styles.metaDim}> / {totalLessons}</Text>
        </Text>
        <Text style={styles.metaDot}>  ·  </Text>
        <Text style={styles.metaText}>
          Exercises left{' '}
          <Text style={styles.metaBold}>{exercisesLeft}</Text>
          <Text style={styles.metaDim}> / {totalExercises}</Text>
        </Text>
      </View>
      <Text style={styles.summaryDesc}>
        This section is designed to build your fundamental English skills for the IELTS exam.
        You will work through structured daily lessons and exercises covering Listening and
        Reading to establish a strong baseline before moving on to advanced strategies.
        Complete the tasks in sequential order to unlock the next steps.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    margin: SPACING.lg,
    backgroundColor: '#FAF7F2',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E8E3D8',
  },
  summaryTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm },
  summaryMeta: { flexDirection: 'row', marginBottom: SPACING.md, flexWrap: 'wrap' },
  metaText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  metaBold: { fontWeight: '700', color: COLORS.text },
  metaDim:  { color: COLORS.textMuted },
  metaDot:  { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  summaryDesc: { fontSize: FONT_SIZES.sm, color: '#4B5563', lineHeight: 20 },
});
