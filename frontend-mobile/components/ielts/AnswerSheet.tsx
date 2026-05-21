import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { isCorrect } from '@/utils/answerNormalization';

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
  accentColor = COLORS.primary,
}: Props) {
  const questionNumbers = Array.from({ length: totalQuestions }, (_, i) => String(i + 1));

  return (
    <View style={s.container}>
      {/* Section heading */}
      <View style={s.heading}>
        <Text style={[s.headingText, { color: accentColor }]}>Answer Review</Text>
      </View>

      {/* Column headers */}
      <View style={s.colHeader}>
        <Text style={[s.colText, s.numCol]}>Q</Text>
        <Text style={[s.colText, s.ansCol]}>Your Answer</Text>
        <Text style={[s.colText, s.ansCol]}>Correct</Text>
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

          const rowBg = correct ? '#F0FDF4' : wrong ? '#FFF1F2' : '#fff';

          return (
            <View
              key={num}
              style={[s.row, { backgroundColor: rowBg }, idx < totalQuestions - 1 && s.rowBorder]}
            >
              {/* Q number */}
              <Text style={[s.numCol, s.numText]}>{num}</Text>

              {/* User answer */}
              <View style={s.ansCol}>
                {wrong ? (
                  <Text style={s.wrongUserText}>{userAns}</Text>
                ) : (
                  <Text
                    style={[s.ansText, correct && s.correctText, !answered && s.unansweredText]}
                  >
                    {answered ? userAns : '—'}
                  </Text>
                )}
              </View>

              {/* Correct answer */}
              <View style={s.ansCol}>
                {wrong ? (
                  <View style={s.correctBadge}>
                    <Text style={s.correctBadgeText}>{correctAns || '—'}</Text>
                  </View>
                ) : (
                  <Text style={[s.ansText, correct && s.correctText]}>{correctAns || '—'}</Text>
                )}
              </View>

              {/* Status icon */}
              <View style={s.iconCol}>
                {correct && <Ionicons name="checkmark-circle" size={18} color="#16A34A" />}
                {wrong && <Ionicons name="close-circle" size={18} color="#EF4444" />}
                {!answered && (
                  <Ionicons name="remove-circle-outline" size={18} color={COLORS.textMuted} />
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
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  heading: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  colText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
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
    borderBottomColor: COLORS.border,
  },
  numCol: { width: 28 },
  ansCol: { flex: 1, paddingHorizontal: 4 },
  iconCol: { width: 24, alignItems: 'center' },
  numText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textSecondary },
  ansText: { fontSize: FONT_SIZES.sm, color: COLORS.text },
  correctText: { color: '#16A34A', fontWeight: '600' },
  unansweredText: { color: COLORS.textMuted, fontStyle: 'italic' },
  wrongUserText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#EF4444',
    textDecorationLine: 'line-through',
  },
  correctBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EF4444',
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  correctBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
});
