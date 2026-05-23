import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { COLORS, FONTS, RADIUS, SPACING, FONT_SIZES } from '@/constants';
import { IeltsFoundationStats } from '@/types';
import { ProgressCircle, ProgressBar, Skeleton, Text, Badge } from '@/components/atoms';
import { EmptyState } from '@/components/molecules';

interface FoundationStatsTabProps {
  stats: IeltsFoundationStats | null;
  loading: boolean;
}

export default function FoundationStatsTab({ stats, loading }: FoundationStatsTabProps) {
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
        <View style={styles.card}>
          <Skeleton height={150} variant="rect" />
        </View>
      </ScrollView>
    );
  }

  if (!stats) {
    return (
      <EmptyState
        title="No Foundation Stats"
        description="Get started learning foundation vocabulary, grammar, or pronunciation lessons to see your stats here!"
        illustration="book-outline"
      />
    );
  }

  const { vocabulary, grammar, pronunciation } = stats;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. Vocabulary Progress Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Vocabulary Lab</Text>
        <Text style={styles.sectionSubtitle}>Progress across vocabulary learning books</Text>

        <View style={styles.progressCircleRow}>
          <ProgressCircle value={vocabulary.progress} max={100} size={70} strokeWidth={7} color={COLORS.skill.reading} />
          <View style={styles.progressCircleTextCol}>
            <Text style={styles.progressNumberText}>
              {vocabulary.wordsLearned} / {vocabulary.totalWords}
            </Text>
            <Text style={styles.progressLabelText}>Words Learned</Text>
            <Text style={styles.completedBooksText}>
              {vocabulary.booksCompleted} / {vocabulary.totalBooks} Books Completed
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.subSectionTitle}>Books Overview</Text>
        {vocabulary.books && vocabulary.books.length > 0 ? (
          <View style={styles.booksList}>
            {vocabulary.books.map((book) => (
              <View key={book.id} style={styles.bookRow}>
                <View style={styles.bookInfoCol}>
                  <View style={styles.bookHeaderLine}>
                    <Text style={styles.bookName} numberOfLines={1}>
                      {book.name}
                    </Text>
                    <Badge
                      label={`${book.completedUnits}/${book.totalUnits} Units`}
                      variant={book.progress >= 100 ? 'success' : 'neutral'}
                    />
                  </View>
                  <View style={styles.progressBarWrapper}>
                    <ProgressBar value={book.progress} max={100} height={6} color={COLORS.skill.reading} />
                    <Text style={styles.progressPercentText}>{Math.round(book.progress)}%</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No vocabulary books started yet</Text>
        )}
      </View>

      {/* 2. Grammar Progress Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Grammar Master</Text>
        <Text style={styles.sectionSubtitle}>Track completed grammar units</Text>

        <View style={styles.progressCircleRow}>
          <ProgressCircle value={grammar.progress} max={100} size={70} strokeWidth={7} color={COLORS.skill.writing} />
          <View style={styles.progressCircleTextCol}>
            <Text style={styles.progressNumberText}>{Math.round(grammar.progress)}%</Text>
            <Text style={styles.progressLabelText}>Overall Completion</Text>
            <Text style={styles.completedBooksText}>
              {grammar.booksCompleted} / {grammar.totalBooks} Grammar Books Completed
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.subSectionTitle}>Books Overview</Text>
        {grammar.books && grammar.books.length > 0 ? (
          <View style={styles.booksList}>
            {grammar.books.map((book) => (
              <View key={book.id} style={styles.bookRow}>
                <View style={styles.bookInfoCol}>
                  <View style={styles.bookHeaderLine}>
                    <Text style={styles.bookName} numberOfLines={1}>
                      {book.name}
                    </Text>
                    <Badge
                      label={`${book.completedUnits}/${book.totalUnits} Units`}
                      variant={book.progress >= 100 ? 'success' : 'neutral'}
                    />
                  </View>
                  <View style={styles.progressBarWrapper}>
                    <ProgressBar value={book.progress} max={100} height={6} color={COLORS.skill.writing} />
                    <Text style={styles.progressPercentText}>{Math.round(book.progress)}%</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No grammar books started yet</Text>
        )}
      </View>

      {/* 3. Pronunciation Progress Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pronunciation Studio</Text>
        <Text style={styles.sectionSubtitle}>IPA sound practicing statistics</Text>

        <View style={styles.pronStatGrid}>
          {/* Sounds Mastered Card */}
          <View style={[styles.pronStatBox, { backgroundColor: colors.successBg }]}>
            <View style={styles.pronIconCircle}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            </View>
            <Text style={styles.pronStatVal}>{pronunciation.soundsMastered}</Text>
            <Text style={styles.pronStatLbl}>Mastered (Score ≥80)</Text>
          </View>

          {/* Sounds Practiced Card */}
          <View style={[styles.pronStatBox, { backgroundColor: colors.infoBg }]}>
            <View style={styles.pronIconCircle}>
              <Ionicons name="mic-circle" size={18} color={colors.info} />
            </View>
            <Text style={styles.pronStatVal}>
              {pronunciation.soundsPracticed} <Text style={styles.pronStatValSub}>/ {pronunciation.totalSounds}</Text>
            </Text>
            <Text style={styles.pronStatLbl}>Sounds Practiced</Text>
          </View>
        </View>

        <View style={styles.pronProgressRow}>
          <View style={styles.pronProgressHeader}>
            <Text style={styles.subSectionTitle}>Mastery Progress</Text>
            <Badge label={`Avg: ${Math.round(pronunciation.averageScore)}`} variant="info" />
          </View>
          <ProgressBar value={pronunciation.progress} max={100} height={8} color={COLORS.skill.speaking} />
          <View style={styles.pronProgressLabels}>
            <Text style={styles.pronProgressPercent}>{Math.round(pronunciation.progress)}% Mastered</Text>
          </View>
        </View>
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
      marginBottom: SPACING.md,
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
      fontSize: FONT_SIZES.lg,
      fontFamily: FONTS.bold,
      color: colors.text,
    },
    progressLabelText: {
      fontSize: 11,
      fontFamily: FONTS.medium,
      color: colors.textSecondary,
      marginTop: 2,
    },
    completedBooksText: {
      fontSize: FONT_SIZES.xs,
      fontFamily: FONTS.regular,
      color: colors.textMuted,
      marginTop: 6,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: SPACING.md,
    },
    subSectionTitle: {
      fontSize: FONT_SIZES.xs,
      fontFamily: FONTS.bold,
      color: colors.text,
      marginBottom: SPACING.sm,
    },
    booksList: {
      gap: SPACING.md,
    },
    bookRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    bookInfoCol: {
      flex: 1,
    },
    bookHeaderLine: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    bookName: {
      fontSize: FONT_SIZES.sm,
      fontFamily: FONTS.semibold,
      color: colors.text,
      flex: 1,
      marginRight: SPACING.md,
    },
    progressBarWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    progressPercentText: {
      fontSize: 11,
      fontFamily: FONTS.bold,
      color: colors.textSecondary,
      width: 32,
      textAlign: 'right',
    },
    emptyText: {
      fontSize: FONT_SIZES.xs,
      color: colors.textMuted,
      fontFamily: FONTS.regular,
      textAlign: 'center',
      paddingVertical: SPACING.md,
    },
    pronStatGrid: {
      flexDirection: 'row',
      gap: SPACING.md,
      marginBottom: SPACING.lg,
    },
    pronStatBox: {
      flex: 1,
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pronIconCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: 'rgba(255,255,255,0.7)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },
    pronStatVal: {
      fontSize: FONT_SIZES.lg,
      fontFamily: FONTS.bold,
      color: COLORS.gray[800],
    },
    pronStatValSub: {
      fontSize: FONT_SIZES.xs,
      fontFamily: FONTS.regular,
      color: COLORS.gray[500],
    },
    pronStatLbl: {
      fontSize: 10,
      fontFamily: FONTS.medium,
      color: COLORS.gray[600],
      marginTop: 2,
      textAlign: 'center',
    },
    pronProgressRow: {
      marginTop: SPACING.xs,
    },
    pronProgressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    pronProgressLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 6,
    },
    pronProgressPercent: {
      fontSize: 11,
      fontFamily: FONTS.bold,
      color: colors.textSecondary,
    },
    loadingProgressRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });
}
