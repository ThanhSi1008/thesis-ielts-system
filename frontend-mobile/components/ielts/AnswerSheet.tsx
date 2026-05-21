import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { isCorrect } from '@/utils/answerNormalization';
import { useTheme } from '@/contexts/ThemeContext';

interface Props {
  answers: Record<string, string>;
  correctAnswers: Record<string, string>;
  totalQuestions: number;
  accentColor?: string;
}

export default function AnswerSheet({
  answers,
  correctAnswers,
  totalQuestions,
  accentColor,
}: Props) {
  const { colors, isDark } = useTheme();
  const questionNumbers = Array.from({ length: totalQuestions }, (_, i) => String(i + 1));
  const activeAccent = accentColor && accentColor !== '#FFC600' ? accentColor : colors.primary;

  return (
    <View style={[s.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Section heading */}
      <View style={[s.heading, { borderBottomColor: colors.border }]}>
        <Text style={[s.headingText, { color: activeAccent }]}>Answer Review</Text>
      </View>

      {/* Column headers */}
      <View style={[s.colHeader, { backgroundColor: isDark ? colors.background : colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[s.colText, s.numCol, { color: colors.textSecondary }]}>Q</Text>
        <Text style={[s.colText, s.ansCol, { color: colors.textSecondary }]}>Your Answer</Text>
        <Text style={[s.colText, s.ansCol, { color: colors.textSecondary }]}>Correct</Text>
        <View style={s.iconCol} />
      </View>

      {/* Rows */}
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} nestedScrollEnabled>
        {questionNumbers.map((num, idx) => {
          const userAns = answers[num] ?? '';
          const correctAns = correctAnswers[num] ?? '';
          const answered = userAns.trim().length > 0;
          const correct = answered && isCorrect(userAns, correctAns);
          const wrong = answered && !correct;

          const rowBg = correct 
            ? (isDark ? 'rgba(22, 163, 74, 0.12)' : '#F0FDF4') 
            : wrong 
              ? (isDark ? 'rgba(239, 68, 68, 0.12)' : '#FFF1F2') 
              : colors.card;

          return (
            <View
              key={num}
              style={[
                s.row, 
                { backgroundColor: rowBg }, 
                idx < totalQuestions - 1 && [s.rowBorder, { borderBottomColor: colors.border }]
              ]}
            >
              {/* Q number */}
              <Text style={[s.numCol, s.numText, { color: colors.textSecondary }]}>{num}</Text>

              {/* User answer */}
              <View style={s.ansCol}>
                {wrong ? (
                  <Text style={[s.wrongUserText, { color: colors.error }]}>{userAns}</Text>
                ) : (
                  <Text
                    style={[
                      s.ansText, 
                      { color: colors.text },
                      correct && [s.correctText, { color: colors.success || '#16A34A' }], 
                      !answered && [s.unansweredText, { color: colors.textMuted }]
                    ]}
                  >
                    {answered ? userAns : '—'}
                  </Text>
                )}
              </View>

              {/* Correct answer */}
              <View style={s.ansCol}>
                {wrong ? (
                  <View style={[s.correctBadge, { backgroundColor: isDark ? 'rgba(22, 163, 74, 0.2)' : 'rgba(22, 163, 74, 0.1)' }]}>
                    <Text style={[s.correctBadgeText, { color: isDark ? '#4ADE80' : '#16A34A' }]}>{correctAns || '—'}</Text>
                  </View>
                ) : (
                  <Text style={[
                    s.ansText, 
                    { color: colors.text },
                    correct && [s.correctText, { color: colors.success || '#16A34A' }]
                  ]}>
                    {correctAns || '—'}</Text>
                )}
              </View>

              {/* Status icon */}
              <View style={s.iconCol}>
                {correct && <Ionicons name="checkmark-circle" size={18} color="#16A34A" />}
                {wrong && <Ionicons name="close-circle" size={18} color="#EF4444" />}
                {!answered && (
                  <Ionicons name="remove-circle-outline" size={18} color={colors.textMuted} />
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  heading: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderBottomWidth: 1,
  },
  headingText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  colHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  colText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  scroll: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  numCol: { width: 28 },
  ansCol: { flex: 1, paddingHorizontal: 4 },
  iconCol: { width: 24, alignItems: 'center' },
  numText: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
  ansText: { fontSize: FONT_SIZES.sm },
  correctText: { fontWeight: '600' },
  unansweredText: { fontStyle: 'italic' },
  wrongUserText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    textDecorationLine: 'line-through',
  },
  correctBadge: {
    alignSelf: 'flex-start',
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  correctBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
