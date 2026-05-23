import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Path, G, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { COLORS, FONTS, RADIUS, SPACING, FONT_SIZES } from '@/constants';
import { IeltsOverviewStats } from '@/types';
import { ProgressCircle, ProgressBar, Skeleton, Text } from '@/components/atoms';
import { EmptyState } from '@/components/molecules';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W - SPACING.lg * 2;

interface OverviewStatsTabProps {
  stats: IeltsOverviewStats | null;
  loading: boolean;
}

export default function OverviewStatsTab({ stats, loading }: OverviewStatsTabProps) {
  const { colors, isDark } = useTheme();
  const styles = useThemedStyles(createStyles);

  if (loading) {
    return (
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Skeleton height={24} width={120} variant="text" style={{ marginBottom: 12 }} />
          <Skeleton height={140} variant="rect" />
        </View>
        <View style={styles.row}>
          <View style={[styles.card, { flex: 1, marginRight: SPACING.md }]}>
            <Skeleton height={100} variant="rect" />
          </View>
          <View style={[styles.card, { flex: 1 }]}>
            <Skeleton height={100} variant="rect" />
          </View>
        </View>
        <View style={styles.card}>
          <Skeleton height={160} variant="rect" />
        </View>
      </ScrollView>
    );
  }

  if (!stats) {
    return (
      <EmptyState
        title="No Overview Stats Available"
        description="Start practicing, taking vocabulary, grammar lessons or mock tests to compile your overall performance stats!"
        illustration="bar-chart-outline"
      />
    );
  }

  // Helper to format activity dates
  const formatActivityDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getIconForActivity = (type: string) => {
    switch (type.toUpperCase()) {
      case 'EXAM':
      case 'MOCK_TEST':
        return 'document-text-outline';
      case 'VOCABULARY':
      case 'VOCAB':
        return 'book-outline';
      case 'GRAMMAR':
        return 'extension-puzzle-outline';
      case 'PRONUNCIATION':
      case 'SPEAKING':
        return 'mic-outline';
      case 'LISTENING':
        return 'headset-outline';
      case 'READING':
        return 'reader-outline';
      case 'WRITING':
        return 'create-outline';
      default:
        return 'flash-outline';
    }
  };

  const getTitleForActivity = (activity: any) => {
    const type = activity.type.toUpperCase();
    const scoreText = activity.score !== undefined ? ` (Score: ${activity.score})` : '';
    switch (type) {
      case 'EXAM':
      case 'MOCK_TEST':
        return `Completed Mock Test${scoreText}`;
      case 'VOCABULARY':
      case 'VOCAB':
        return `Vocabulary Practice${scoreText}`;
      case 'GRAMMAR':
        return `Completed Grammar Lesson${scoreText}`;
      case 'PRONUNCIATION':
        return `Pronunciation Practice${scoreText}`;
      default:
        return `${activity.type.charAt(0).toUpperCase() + activity.type.slice(1).toLowerCase()} Activity${scoreText}`;
    }
  };

  // Skill color mapper
  const skillColorMap = {
    listening: COLORS.skill.listening,
    reading: COLORS.skill.reading,
    writing: COLORS.skill.writing,
    speaking: COLORS.skill.speaking,
  };

  // Arc SVG coordinates for Predicted Band Gauge
  const r = 50;
  const strokeWidth = 8;
  const size = r * 2 + strokeWidth * 2;
  const center = size / 2;
  const startAngle = -210;
  const endAngle = 30;
  const angleRange = endAngle - startAngle;

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  const targetBand = stats.predictedBand ?? 1.0;
  // Convert 1.0 - 9.0 scale to percentage of gauge fill
  const bandPercent = Math.max(0, Math.min(1, (targetBand - 1.0) / 8.0));
  const activeEndAngle = startAngle + bandPercent * angleRange;

  const bgPath = describeArc(center, center, r, startAngle, endAngle);
  const activePath = describeArc(center, center, r, startAngle, activeEndAngle);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. predicted band score & study time */}
      <View style={styles.row}>
        {/* Predicted Band Gauge */}
        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.cardTitle}>Predicted Band</Text>
          <View style={styles.gaugeWrapper}>
            <Svg width={size} height={size}>
              {/* Gauge Background */}
              <Path d={bgPath} fill="none" stroke={colors.border} strokeWidth={strokeWidth} strokeLinecap="round" />
              {/* Gauge Fill */}
              <Path d={activePath} fill="none" stroke="#FFC600" strokeWidth={strokeWidth} strokeLinecap="round" />
              {/* Text */}
              <SvgText
                x={center}
                y={center + 8}
                textAnchor="middle"
                fontSize={24}
                fontFamily={FONTS.bold}
                fill={colors.text}
              >
                {stats.predictedBand?.toFixed(1) ?? '—'}
              </SvgText>
            </Svg>
            <Text style={styles.gaugeLabel}>Overall Estimate</Text>
          </View>
        </View>

        {/* Study Time / Streak Card */}
        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.cardTitle}>Study Stats</Text>
          <View style={styles.statItem}>
            <View style={[styles.statIconCircle, { backgroundColor: colors.infoBg }]}>
              <Ionicons name="time" size={20} color={colors.info} />
            </View>
            <View style={styles.statTexts}>
              <Text style={styles.statValue}>{stats.totalStudyTime ?? 0}m</Text>
              <Text style={styles.statLabel}>Learning Time</Text>
            </View>
          </View>

          <View style={[styles.statItem, { marginTop: SPACING.md }]}>
            <View style={[styles.statIconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Text style={{ fontSize: 16 }}>🔥</Text>
            </View>
            <View style={styles.statTexts}>
              <Text style={styles.statValue}>
                {stats.currentStreak ?? 0} <Text style={styles.streakSub}>/ {stats.longestStreak ?? 0} max</Text>
              </Text>
              <Text style={styles.statLabel}>Streak Day</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 2. Weekly XP Progress */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Weekly Activity</Text>
          <View style={styles.xpBadge}>
            <Text style={styles.xpBadgeText}>{stats.weeklyXp ?? 0} XP</Text>
          </View>
        </View>
        <Text style={styles.xpSubtitle}>Keep studying to maintain your streak and level up!</Text>
        
        {/* Progress illustration */}
        <View style={styles.xpProgressContainer}>
          <ProgressBar value={Math.min(stats.weeklyXp ?? 0, 1000)} max={1000} height={10} color={colors.primary} />
          <View style={styles.xpTicksRow}>
            <Text style={styles.xpTickText}>0 XP</Text>
            <Text style={styles.xpTickText}>500 XP</Text>
            <Text style={styles.xpTickText}>1000+ XP</Text>
          </View>
        </View>
      </View>

      {/* 3. Skill Analysis */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Estimated Skill Levels</Text>
        <Text style={styles.sectionSubtitle}>Predicted band levels based on your performance</Text>

        <View style={styles.skillsContainer}>
          {(Object.keys(stats.skillAnalysis || {}) as Array<keyof typeof stats.skillAnalysis>).map((skill) => {
            const val = stats.skillAnalysis?.[skill] ?? 1.0;
            // Map 1-9 to progress bar percent (0-100)
            const percent = ((val - 1.0) / 8.0) * 100;
            const skillColor = skillColorMap[skill] || colors.primary;

            return (
              <View key={skill} style={styles.skillRow}>
                <View style={styles.skillHeaderRow}>
                  <Text style={styles.skillLabel}>{skill.toUpperCase()}</Text>
                  <Text style={[styles.skillValue, { color: skillColor }]}>Band {val.toFixed(1)}</Text>
                </View>
                <ProgressBar value={percent} max={100} height={8} color={skillColor} />
              </View>
            );
          })}
        </View>
      </View>

      {/* 4. Recent Activity Timeline */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Activity</Text>
        {stats.recentActivity && stats.recentActivity.length > 0 ? (
          <View style={styles.timelineContainer}>
            {stats.recentActivity.slice(0, 5).map((activity, idx) => {
              const icon = getIconForActivity(activity.type);
              const title = getTitleForActivity(activity);
              const isLast = idx === stats.recentActivity.slice(0, 5).length - 1;

              return (
                <View key={idx} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[styles.timelineIconCircle, { borderColor: colors.border }]}>
                      <Ionicons name={icon as any} size={16} color={colors.primary} />
                    </View>
                    {!isLast && <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />}
                  </View>
                  <View style={styles.timelineRight}>
                    <Text style={styles.timelineTitle}>{title}</Text>
                    <Text style={styles.timelineDate}>{formatActivityDate(activity.date)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <EmptyState
            title="No Recent Activity"
            description="You have not completed any tasks yet today. Start learning to record activities here!"
            style={{ minHeight: 120, paddingVertical: SPACING.md }}
          />
        )}
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
    row: {
      flexDirection: 'row',
      marginBottom: SPACING.md,
      gap: SPACING.md,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: RADIUS.xl,
      padding: SPACING.lg,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: SPACING.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    halfCard: {
      flex: 1,
      marginBottom: 0,
    },
    cardTitle: {
      fontSize: FONT_SIZES.md,
      fontFamily: FONTS.bold,
      color: colors.text,
      marginBottom: 8,
    },
    sectionSubtitle: {
      fontSize: FONT_SIZES.xs,
      fontFamily: FONTS.regular,
      color: colors.textSecondary,
      marginBottom: SPACING.md,
    },
    cardHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    xpBadge: {
      backgroundColor: '#FEF3C7',
      paddingHorizontal: SPACING.md,
      paddingVertical: 4,
      borderRadius: RADIUS.full,
    },
    xpBadgeText: {
      color: '#D97706',
      fontFamily: FONTS.bold,
      fontSize: FONT_SIZES.xs,
    },
    xpSubtitle: {
      fontSize: FONT_SIZES.xs,
      color: colors.textSecondary,
      fontFamily: FONTS.regular,
      marginBottom: SPACING.md,
    },
    xpProgressContainer: {
      marginTop: SPACING.sm,
    },
    xpTicksRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 6,
    },
    xpTickText: {
      fontSize: 10,
      color: colors.textMuted,
      fontFamily: FONTS.regular,
    },
    gaugeWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: SPACING.sm,
    },
    gaugeLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      fontFamily: FONTS.medium,
      marginTop: 4,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: SPACING.sm,
    },
    statIconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: SPACING.md,
    },
    statTexts: {
      flex: 1,
    },
    statValue: {
      fontSize: FONT_SIZES.md,
      fontFamily: FONTS.bold,
      color: colors.text,
    },
    streakSub: {
      fontSize: 11,
      color: colors.textSecondary,
      fontFamily: FONTS.regular,
    },
    statLabel: {
      fontSize: 10,
      color: colors.textSecondary,
      fontFamily: FONTS.medium,
      marginTop: 1,
    },
    skillsContainer: {
      gap: SPACING.md,
    },
    skillRow: {
      marginBottom: SPACING.xs,
    },
    skillHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    skillLabel: {
      fontSize: FONT_SIZES.xs,
      fontFamily: FONTS.bold,
      color: colors.textSecondary,
    },
    skillValue: {
      fontSize: FONT_SIZES.xs,
      fontFamily: FONTS.bold,
    },
    timelineContainer: {
      marginTop: SPACING.sm,
    },
    timelineItem: {
      flexDirection: 'row',
      minHeight: 56,
    },
    timelineLeft: {
      alignItems: 'center',
      marginRight: SPACING.md,
      width: 24,
    },
    timelineIconCircle: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      zIndex: 1,
    },
    timelineLine: {
      width: 2,
      flex: 1,
      marginVertical: 2,
    },
    timelineRight: {
      flex: 1,
      paddingBottom: SPACING.md,
    },
    timelineTitle: {
      fontSize: FONT_SIZES.sm,
      fontFamily: FONTS.medium,
      color: colors.text,
    },
    timelineDate: {
      fontSize: 11,
      color: colors.textSecondary,
      fontFamily: FONTS.regular,
      marginTop: 2,
    },
  });
}
