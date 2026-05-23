import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { COLORS, FONTS, RADIUS, SPACING, FONT_SIZES } from '@/constants';
import { IeltsBasicStats } from '@/types';
import { ProgressCircle, ProgressBar, Skeleton, Text, Badge } from '@/components/atoms';
import { EmptyState } from '@/components/molecules';

interface BasicStatsTabProps {
  stats: IeltsBasicStats | null;
  loading: boolean;
}

export default function BasicStatsTab({ stats, loading }: BasicStatsTabProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  if (loading) {
    return (
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Skeleton height={24} width={120} variant="text" style={{ marginBottom: 12 }} />
          <View style={styles.loadingProgressRow}>
            <Skeleton height={64} width={64} variant="circle" />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Skeleton height={16} width="60%" variant="text" style={{ marginBottom: 8 }} />
              <Skeleton height={12} width="40%" variant="text" />
            </View>
          </View>
        </View>
        <View style={styles.grid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <View key={i} style={styles.skeletonGridItem}>
              <Skeleton height={120} variant="rect" />
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }

  if (!stats) {
    return (
      <EmptyState
        title="No Basic Stats"
        description="Complete basic level lessons and exercises in any of the 4 skills to view your comprehensive basic stats!"
        illustration="reader-outline"
      />
    );
  }

  // Helper to format activity dates
  const formatActivityDate = (dateStr: string | null) => {
    if (!dateStr) return 'No activity yet';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getSkillIcon = (skill: string) => {
    switch (skill.toUpperCase()) {
      case 'LISTENING':
        return 'headset-outline';
      case 'READING':
        return 'reader-outline';
      case 'WRITING':
        return 'create-outline';
      case 'SPEAKING':
        return 'mic-outline';
      default:
        return 'star-outline';
    }
  };

  const getSkillColor = (skill: string) => {
    switch (skill.toUpperCase()) {
      case 'LISTENING':
        return COLORS.skill.listening;
      case 'READING':
        return COLORS.skill.reading;
      case 'WRITING':
        return COLORS.skill.writing;
      case 'SPEAKING':
        return COLORS.skill.speaking;
      default:
        return colors.primary;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. Overall Completion Progress Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Basic Level Completion</Text>
        <Text style={styles.sectionSubtitle}>Lessons & exercises master progress</Text>

        <View style={styles.progressCircleRow}>
          <ProgressCircle value={stats.overallProgress} max={100} size={70} strokeWidth={7} color={colors.primary} />
          <View style={styles.progressCircleTextCol}>
            <Text style={styles.progressNumberText}>{Math.round(stats.overallProgress)}%</Text>
            <Text style={styles.progressLabelText}>Basic Level Completion</Text>
            <Text style={styles.lastActivityText}>
              Last active: {formatActivityDate(stats.lastActivity)}
            </Text>
          </View>
        </View>
      </View>

      {/* 2. Skills Grid */}
      <Text style={styles.gridSectionTitle}>Skills Breakdown</Text>
      <View style={styles.grid}>
        {stats.skills.map((item) => {
          const color = getSkillColor(item.skill);
          const icon = getSkillIcon(item.skill);

          return (
            <View key={item.skill} style={styles.gridItem}>
              <View style={[styles.skillCard, { borderTopColor: color }]}>
                {/* Header */}
                <View style={styles.skillHeaderRow}>
                  <View style={[styles.skillIconCircle, { backgroundColor: color + '15' }]}>
                    <Ionicons name={icon as any} size={20} color={color} />
                  </View>
                  {item.averageScore !== null && (
                    <Badge label={`Avg: ${Math.round(item.averageScore)}%`} variant="info" />
                  )}
                </View>

                {/* Title */}
                <Text style={styles.skillCardTitle}>{item.skill}</Text>

                {/* Sub info */}
                <View style={styles.subInfoContainer}>
                  <View style={styles.infoLine}>
                    <Text style={styles.infoLabel}>Lessons</Text>
                    <Text style={styles.infoValue}>
                      {item.completedLessons} <Text style={styles.infoValueSub}>/ {item.totalLessons}</Text>
                    </Text>
                  </View>
                  <View style={styles.infoLine}>
                    <Text style={styles.infoLabel}>Exercises</Text>
                    <Text style={styles.infoValue}>
                      {item.completedExercises} <Text style={styles.infoValueSub}>/ {item.totalExercises}</Text>
                    </Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={styles.progressWrapper}>
                  <ProgressBar value={item.progress} max={100} height={6} color={color} />
                  <Text style={styles.percentText}>{Math.round(item.progress)}%</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      padding: SPACING.lg,
      paddingBottom: 40,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: RADIUS.xl,
      padding: SPACING.lg,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: SPACING.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    cardTitle: {
      fontSize: FONT_SIZES.md,
      fontFamily: FONTS.bold,
      color: colors.text,
      marginBottom: 4,
    },
    sectionSubtitle: {
      fontSize: FONT_SIZES.xs,
      fontFamily: FONTS.regular,
      color: colors.textSecondary,
      marginBottom: SPACING.md,
    },
    progressCircleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: SPACING.xs,
      marginBottom: SPACING.xs,
    },
    progressCircleTextCol: {
      flex: 1,
      marginLeft: SPACING.lg,
    },
    progressNumberText: {
      fontSize: FONT_SIZES.xl,
      fontFamily: FONTS.bold,
      color: colors.text,
    },
    progressLabelText: {
      fontSize: FONT_SIZES.xs,
      fontFamily: FONTS.medium,
      color: colors.textSecondary,
      marginTop: 2,
    },
    lastActivityText: {
      fontSize: 11,
      fontFamily: FONTS.regular,
      color: colors.textMuted,
      marginTop: 6,
    },
    gridSectionTitle: {
      fontSize: FONT_SIZES.md,
      fontFamily: FONTS.bold,
      color: colors.text,
      marginBottom: SPACING.md,
      paddingLeft: 2,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -SPACING.sm,
    },
    gridItem: {
      width: '50%',
      paddingHorizontal: SPACING.sm,
      marginBottom: SPACING.md,
    },
    skeletonGridItem: {
      width: '50%',
      paddingHorizontal: SPACING.sm,
      marginBottom: SPACING.md,
    },
    skillCard: {
      backgroundColor: colors.card,
      borderRadius: RADIUS.xl,
      borderWidth: 1,
      borderColor: colors.border,
      borderTopWidth: 4,
      padding: SPACING.md,
      minHeight: 180,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 6,
      elevation: 2,
    },
    skillHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.sm,
    },
    skillIconCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    skillCardTitle: {
      fontSize: FONT_SIZES.sm,
      fontFamily: FONTS.bold,
      color: colors.text,
      marginBottom: SPACING.md,
      textTransform: 'capitalize',
    },
    subInfoContainer: {
      gap: 6,
      marginBottom: SPACING.md,
    },
    infoLine: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    infoLabel: {
      fontSize: 11,
      fontFamily: FONTS.regular,
      color: colors.textSecondary,
    },
    infoValue: {
      fontSize: 11,
      fontFamily: FONTS.bold,
      color: colors.text,
    },
    infoValueSub: {
      fontFamily: FONTS.regular,
      color: colors.textMuted,
    },
    progressWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 'auto',
    },
    percentText: {
      fontSize: 10,
      fontFamily: FONTS.bold,
      color: colors.textSecondary,
      width: 24,
      textAlign: 'right',
    },
    loadingProgressRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });
}
