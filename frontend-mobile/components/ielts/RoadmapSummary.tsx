import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONTS, RADIUS, FONT_SIZES, SPACING } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';

interface RoadmapSummaryProps {
  totalLessons: number;
  completedLessons: number;
  totalExercises: number;
  completedExercises: number;
}

/** Matches web's summary card inside RoadmapContent */
export function RoadmapSummary({
  totalLessons,
  completedLessons,
  totalExercises,
  completedExercises,
}: RoadmapSummaryProps) {
  const { colors, isDark } = useTheme();
  const lessonsLeft = totalLessons - completedLessons;
  const exercisesLeft = totalExercises - completedExercises;

  const styles = StyleSheet.create({
    card: {
      margin: SPACING.lg,
      backgroundColor: isDark ? colors.surface : '#FAF7F2',
      borderRadius: 24,
      borderCurve: 'continuous',
      padding: SPACING.xl,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#E8E3D8',
    },
    title: {
      fontFamily: FONTS.bold,
      fontSize: FONT_SIZES.xl,
      color: colors.text,
      marginBottom: SPACING.md,
      letterSpacing: -0.3,
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      marginBottom: SPACING.lg,
    },
    metaLabel: {
      fontFamily: FONTS.medium,
      fontSize: FONT_SIZES.xs,
      color: colors.textSecondary,
    },
    metaBold: {
      fontFamily: FONTS.bold,
      fontSize: FONT_SIZES.xs,
      color: colors.textSecondary,
    },
    metaDim: {
      fontFamily: FONTS.regular,
      fontSize: FONT_SIZES.xs,
      color: colors.textMuted,
    },
    metaDot: {
      fontFamily: FONTS.regular,
      fontSize: FONT_SIZES.xs,
      color: colors.textMuted,
    },
    desc: {
      fontFamily: FONTS.medium,
      fontSize: FONT_SIZES.sm,
      color: colors.textSecondary,
      lineHeight: 22,
    },
  });

  return (
    <View style={styles.card}>
      {/* Title — matches web: text-2xl font-extrabold */}
      <Text style={styles.title}>IELTS Basic Mastery Roadmap</Text>

      {/* Stats row — matches web's flex-wrap items-center gap-5 */}
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Lessons left </Text>
        <Text style={styles.metaBold}>{lessonsLeft}</Text>
        <Text style={styles.metaDim}> / {totalLessons}</Text>

        <Text style={styles.metaDot}> · </Text>

        <Text style={styles.metaLabel}>Exercises left </Text>
        <Text style={styles.metaBold}>{exercisesLeft}</Text>
        <Text style={styles.metaDim}> / {totalExercises}</Text>
      </View>

      {/* Description — matches web paragraph */}
      <Text style={styles.desc}>
        This section is designed to build your fundamental English skills for the IELTS exam. You
        will work through structured daily lessons and exercises covering Listening and Reading to
        establish a strong baseline before moving on to advanced strategies. Complete the tasks in
        sequential order to unlock the next steps.
      </Text>
    </View>
  );
}
