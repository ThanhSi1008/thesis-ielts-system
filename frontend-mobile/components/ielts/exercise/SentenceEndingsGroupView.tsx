import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FONT_SIZES, RADIUS, SPACING } from '@/constants';
import { createExerciseStyles } from './styles';
import { ExplanationView } from './ExplanationView';
import { useTheme } from '@/contexts/ThemeContext';

function getExplanationText(exp: any): string {
  if (!exp) return '';
  if (typeof exp === 'string') return exp;
  return exp.rationale || JSON.stringify(exp);
}

export function SentenceEndingsGroupView({ group, answers, submitted, onAnswer }: any) {
  const { colors, isDark } = useTheme();
  const styles = createExerciseStyles(colors);
  const [showExplanation, setShowExplanation] = useState<number | null>(null);

  const questions: any[] = group.questions || [];
  const options: any[] = group.options || [];
  const instruction: string =
    group.instruction || group.instructions || 'Complete each sentence with the correct ending.';
  const qNums = questions.map((q: any) => q.question_number);

  const usedIds = questions
    .map((q: any) => (answers[q.question_number] ?? '').toUpperCase())
    .filter(Boolean);

  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={styles.groupType}>Matching Sentence Endings</Text>

      {qNums.length > 0 && (
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
          Questions {Math.min(...qNums)}–{Math.max(...qNums)}
        </Text>
      )}

      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>{instruction}</Text>
      </View>

      <View style={{ gap: SPACING.sm }}>
        {questions.map((q: any) => {
          const selected = (answers[q.question_number] ?? '').toUpperCase();
          const isCorrect = submitted && selected === q.answer?.toUpperCase();
          const selectedOpt = options.find(
            (o: any) => (o.id ?? o.letter ?? '').toUpperCase() === selected,
          );

          return (
            <View
              key={q.question_number}
              style={{
                backgroundColor: submitted
                  ? isCorrect
                    ? isDark
                      ? colors.successBg
                      : '#F0FDF4'
                    : isDark
                      ? colors.errorBg
                      : '#FFF5F5'
                  : colors.card,
                borderRadius: RADIUS.lg,
                borderWidth: 1,
                borderColor: submitted ? (isCorrect ? '#86EFAC' : '#FCA5A5') : colors.border,
                padding: SPACING.md,
              }}
            >
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                <View
                  style={{
                    minWidth: 26,
                    height: 26,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: submitted
                      ? isCorrect
                        ? '#86EFAC'
                        : '#FCA5A5'
                      : isDark
                        ? colors.border
                        : '#BFDBFE',
                    backgroundColor: submitted
                      ? isCorrect
                        ? isDark
                          ? colors.successBg
                          : '#DCFCE7'
                        : isDark
                          ? colors.errorBg
                          : '#FEE2E2'
                      : isDark
                        ? colors.infoBg
                        : '#EFF6FF',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 4,
                    marginTop: 2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '700',
                      color: submitted ? (isCorrect ? '#16A34A' : '#DC2626') : '#1D4ED8',
                    }}
                  >
                    {q.question_number}
                  </Text>
                </View>
                <Text
                  style={{
                    flex: 1,
                    fontSize: FONT_SIZES.sm,
                    color: colors.text,
                    lineHeight: 22,
                    fontWeight: '500',
                  }}
                >
                  {q.text}
                </Text>
              </View>

              {submitted ? (
                <View style={{ marginLeft: 34, gap: 6 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      alignSelf: 'flex-start',
                      borderWidth: 1,
                      borderColor: isCorrect ? '#86EFAC' : '#FCA5A5',
                      backgroundColor: isCorrect
                        ? isDark
                          ? colors.successBg
                          : '#DCFCE7'
                        : isDark
                          ? colors.errorBg
                          : '#FEE2E2',
                      borderRadius: RADIUS.sm,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      gap: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '800',
                        color: isCorrect ? '#16A34A' : '#DC2626',
                        textDecorationLine: isCorrect ? 'none' : 'line-through',
                      }}
                    >
                      {selected || '—'}
                    </Text>
                    {selectedOpt && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: isCorrect ? '#15803D' : '#DC2626',
                          textDecorationLine: isCorrect ? 'none' : 'line-through',
                          flexShrink: 1,
                        }}
                      >
                        · {selectedOpt.text}
                      </Text>
                    )}
                  </View>

                  {!isCorrect && q.answer && (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        alignSelf: 'flex-start',
                        borderWidth: 1,
                        borderColor: '#86EFAC',
                        backgroundColor: isDark ? colors.successBg : '#DCFCE7',
                        borderRadius: RADIUS.sm,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        gap: 6,
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#16A34A' }}>→</Text>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#16A34A' }}>
                        {q.answer}
                      </Text>
                      {options.find(
                        (o: any) =>
                          (o.id ?? o.letter ?? '').toUpperCase() === q.answer?.toUpperCase(),
                      ) && (
                        <Text style={{ fontSize: 12, color: '#15803D', flexShrink: 1 }}>
                          ·{' '}
                          {
                            options.find(
                              (o: any) =>
                                (o.id ?? o.letter ?? '').toUpperCase() === q.answer?.toUpperCase(),
                            )?.text
                          }
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              ) : (
                <View style={{ marginLeft: 34, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {options.map((opt: any) => {
                    const optId = (opt.id ?? opt.letter ?? '').toUpperCase();
                    const isSelected = selected === optId;
                    const isUsedElsewhere = usedIds.includes(optId) && !isSelected;

                    return (
                      <TouchableOpacity
                        key={optId}
                        onPress={() => !submitted && onAnswer(q.question_number, optId)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          borderWidth: 1.5,
                          borderColor: isSelected
                            ? colors.warning
                            : isUsedElsewhere
                              ? colors.border
                              : colors.border,
                          backgroundColor: isSelected
                            ? isDark
                              ? colors.warningBg
                              : '#FEF3C7'
                            : isUsedElsewhere
                              ? colors.surface
                              : colors.card,
                          borderRadius: RADIUS.md,
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          gap: 4,
                          opacity: isUsedElsewhere ? 0.5 : 1,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: '800',
                            color: isSelected ? colors.warning : colors.textSecondary,
                          }}
                        >
                          {optId}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {submitted && q.explanation && (
                <>
                  <TouchableOpacity
                    onPress={() =>
                      setShowExplanation(
                        showExplanation === q.question_number ? null : q.question_number,
                      )
                    }
                    style={{
                      marginTop: 10,
                      marginLeft: 34,
                      alignSelf: 'flex-start',
                      backgroundColor: isDark ? colors.infoBg : '#EFF6FF',
                      borderRadius: RADIUS.sm,
                      borderWidth: 1,
                      borderColor: isDark ? colors.border : '#BFDBFE',
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#1D4ED8' }}>
                      {showExplanation === q.question_number ? 'Hide' : 'Explain'}
                    </Text>
                  </TouchableOpacity>
                  {showExplanation === q.question_number && (
                    <View style={{ marginLeft: 34, marginTop: 8 }}>
                      <ExplanationView
                        explanation={getExplanationText(q.explanation)}
                        isCorrect={isCorrect}
                      />
                    </View>
                  )}
                </>
              )}
            </View>
          );
        })}
      </View>

      {options.length > 0 && (
        <View
          style={{
            marginTop: SPACING.lg,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: RADIUS.lg,
            padding: SPACING.md,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: '800',
              color: colors.textMuted,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginBottom: SPACING.sm,
            }}
          >
            Options
          </Text>
          {options.map((opt: any) => {
            const optId = (opt.id ?? opt.letter ?? '').toUpperCase();
            const isUsed = !submitted && usedIds.includes(optId);
            const isCorrectAns =
              submitted && questions.some((q: any) => q.answer?.toUpperCase() === optId);

            return (
              <View key={optId} style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '800',
                    color: submitted
                      ? isCorrectAns
                        ? '#16A34A'
                        : colors.textMuted
                      : isUsed
                        ? colors.warning
                        : colors.text,
                    width: 20,
                  }}
                >
                  {optId}
                </Text>
                <Text
                  style={{
                    flex: 1,
                    fontSize: FONT_SIZES.sm,
                    color: submitted
                      ? isCorrectAns
                        ? '#16A34A'
                        : colors.textMuted
                      : isUsed
                        ? isDark
                          ? colors.warning
                          : '#92400E'
                        : colors.text,
                    fontWeight: submitted ? (isCorrectAns ? '700' : '400') : '500',
                    lineHeight: 20,
                  }}
                >
                  {opt.text}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
