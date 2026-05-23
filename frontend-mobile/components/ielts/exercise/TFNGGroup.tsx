import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { FONT_SIZES, RADIUS, SPACING } from '@/constants';
import { createMarkdownStyles } from './shared';
import { useTheme } from '@/contexts/ThemeContext';

function getExplanationText(exp: any): string {
  if (!exp) return '';
  if (typeof exp === 'string') return exp;
  return exp.rationale || exp.reason || JSON.stringify(exp);
}

export function TFNGGroup({ group, answers, submitted, onAnswer }: any) {
  const { colors, isDark } = useTheme();
  const markdownStyles = createMarkdownStyles(colors);
  const [showExplanation, setShowExplanation] = useState<number | null>(null);

  const isYesNo = group.type === 'yes_no_not_given';
  const OPTIONS = isYesNo ? ['YES', 'NO', 'NOT GIVEN'] : ['TRUE', 'FALSE', 'NOT GIVEN'];
  const typeLabel = isYesNo ? 'Yes / No / Not Given' : 'True / False / Not Given';
  const questions = group.questions || [];
  const instruction = group.instruction || group.instructions;
  const qNums = questions.map((q: any) => q.question_number);

  const defaultInstruction = isYesNo
    ? 'Do the following statements agree with the views of the writer? Choose YES, NO or NOT GIVEN.'
    : 'Do the following statements agree with the information in the text? Choose TRUE, FALSE or NOT GIVEN.';

  return (
    <View style={{ marginBottom: 24 }}>
      {qNums.length > 0 && (
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 2 }}>
          Questions {Math.min(...qNums)}–{Math.max(...qNums)}
        </Text>
      )}
      <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 16, lineHeight: 20 }}>
        {instruction || defaultInstruction}
      </Text>

      <View style={{ gap: 24 }}>
        {questions.map((q: any) => {
          const sel = (answers[q.question_number] ?? '').toUpperCase();
          const isCorrect = sel === q.answer?.toUpperCase();

          return (
            <View key={q.question_number}>
              <View
                style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}
              >
                <View
                  style={{
                    minWidth: 24,
                    height: 24,
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
                    flexShrink: 0,
                    marginTop: 1,
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
                <View style={{ flex: 1 }}>
                  {q.text ? (
                    <Markdown style={markdownStyles}>
                      {(q.text || '').replace(/<br\s*\/?>/gi, '\n')}
                    </Markdown>
                  ) : null}
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 6, paddingLeft: 32, flexWrap: 'wrap' }}>
                {OPTIONS.map((opt) => {
                  const isSelected = sel === opt;
                  const isAnswerKey = q.answer?.toUpperCase() === opt;

                  let circleBorder = colors.border;
                  let hasFill = false;
                  let textColor = colors.textMuted;
                  let textWeight: '400' | '700' = '400';
                  let textDecoration: 'none' | 'line-through' = 'none';

                  if (submitted) {
                    if (isAnswerKey) {
                      circleBorder = '#22C55E';
                      hasFill = true;
                      textColor = '#15803D';
                      textWeight = '700';
                    } else if (isSelected && !isAnswerKey) {
                      circleBorder = '#F87171';
                      hasFill = true;
                      textColor = '#DC2626';
                      textDecoration = 'line-through';
                    } else {
                      circleBorder = colors.border;
                      textColor = colors.textDisabled;
                    }
                  } else {
                    if (isSelected) {
                      circleBorder = '#3B82F6';
                      hasFill = true;
                      textColor = '#1D4ED8';
                      textWeight = '700';
                    }
                  }

                  return (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => !submitted && onAnswer(q.question_number, opt)}
                      activeOpacity={submitted ? 1 : 0.6}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        marginBottom: 4,
                      }}
                    >
                      <View
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 8,
                          borderWidth: 1.5,
                          borderColor: circleBorder,
                          backgroundColor: colors.card,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {hasFill && (
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: circleBorder,
                            }}
                          />
                        )}
                      </View>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: textWeight,
                          color: textColor,
                          textTransform: 'uppercase',
                          letterSpacing: 0.3,
                          textDecorationLine: textDecoration,
                        }}
                      >
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {submitted && q.explanation && (
                <View style={{ paddingLeft: 32, marginTop: 8 }}>
                  <TouchableOpacity
                    onPress={() =>
                      setShowExplanation(
                        showExplanation === q.question_number ? null : q.question_number,
                      )
                    }
                    style={{
                      alignSelf: 'flex-start',
                      backgroundColor: isDark ? colors.surface : '#F3F4F6',
                      borderRadius: RADIUS.sm,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      marginBottom: 6,
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textSecondary }}>
                      {showExplanation === q.question_number ? 'Hide' : '💬 Explain'}
                    </Text>
                  </TouchableOpacity>
                  {showExplanation === q.question_number && (
                    <View
                      style={{
                        backgroundColor: isDark ? colors.infoBg : '#EFF6FF',
                        borderWidth: 1,
                        borderColor: isDark ? colors.border : '#BFDBFE',
                        borderRadius: RADIUS.md,
                        padding: SPACING.md,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          color: isDark ? colors.info : '#1E40AF',
                          lineHeight: 20,
                        }}
                      >
                        {getExplanationText(q.explanation)}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
