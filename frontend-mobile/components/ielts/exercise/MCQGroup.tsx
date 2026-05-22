import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { FONT_SIZES, RADIUS, SPACING } from '@/constants';
import { createMarkdownStyles } from './shared';
import { ExplanationView } from './ExplanationView';
import { useTheme } from '@/contexts/ThemeContext';

function getExplanationText(exp: any): string {
  if (!exp) return '';
  if (typeof exp === 'string') return exp;
  if (exp.keyword && exp.rationale)
    return `🔑 ${exp.keyword}\n\n💡 ${exp.rationale}${exp.distractor_analysis ? `\n\n⚠️ ${exp.distractor_analysis}` : ''}`;
  return exp.rationale || exp.reason || JSON.stringify(exp);
}

export function MCQGroup({ group, answers, submitted, onAnswer }: any) {
  const { colors, isDark } = useTheme();
  const markdownStyles = createMarkdownStyles(colors);
  const [showExplanation, setShowExplanation] = useState<number | null>(null);
  const questions = (group.questions ?? []) as any[];
  const instruction = group.instruction || group.instructions;
  const qNums = questions.map((q: any) => q.question_number);

  return (
    <View style={{ marginBottom: 24 }}>
      {qNums.length > 0 && (
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 2 }}>
          Questions {Math.min(...qNums)}–{Math.max(...qNums)}
        </Text>
      )}
      {instruction && (
        <Text
          style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 16, lineHeight: 20 }}
        >
          {instruction}
        </Text>
      )}

      <View style={{ gap: 24 }}>
        {questions.map((q) => {
          const sel = answers[q.question_number] ?? '';
          const isCorrect = sel.toUpperCase() === q.answer?.toUpperCase();

          return (
            <View key={q.question_number}>
              <View
                style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 12 }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: submitted ? (isCorrect ? '#16A34A' : '#DC2626') : colors.text,
                    marginTop: 2,
                    minWidth: 22,
                  }}
                >
                  {q.question_number}.
                </Text>
                <View style={{ flex: 1 }}>
                  <Markdown style={markdownStyles}>
                    {(q.text || '').replace(/<br\s*\/?>/gi, '\n')}
                  </Markdown>
                </View>
              </View>

              <View style={{ gap: 10, paddingLeft: 30 }}>
                {(q.options ?? []).map((opt: any) => {
                  const isSelected = sel.toUpperCase() === opt.letter.toUpperCase();
                  const isAnswerKey = q.answer?.toUpperCase() === opt.letter.toUpperCase();

                  let circleBorder: string = colors.border;
                  let circleFill: string | null = null;
                  let textColor: string = colors.text;
                  let textDecoration: 'none' | 'line-through' = 'none';
                  let textWeight: '400' | '600' = '400';

                  if (submitted) {
                    if (isAnswerKey) {
                      circleBorder = '#22C55E';
                      circleFill = '#22C55E';
                      textColor = '#15803D';
                      textWeight = '600';
                    } else if (isSelected && !isAnswerKey) {
                      circleBorder = '#F87171';
                      circleFill = '#F87171';
                      textColor = '#DC2626';
                      textDecoration = 'line-through';
                    } else {
                      circleBorder = colors.border;
                      textColor = colors.textDisabled;
                    }
                  } else {
                    if (isSelected) {
                      circleBorder = colors.primary;
                      circleFill = colors.primary;
                      textColor = colors.text;
                      textWeight = '600';
                    }
                  }

                  return (
                    <TouchableOpacity
                      key={opt.letter}
                      onPress={() => !submitted && onAnswer(q.question_number, opt.letter)}
                      activeOpacity={submitted ? 1 : 0.6}
                      style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}
                    >
                      <View
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 9,
                          borderWidth: 2,
                          borderColor: circleBorder,
                          backgroundColor: colors.card,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: 2,
                          flexShrink: 0,
                        }}
                      >
                        {circleFill && (
                          <View
                            style={{
                              width: 9,
                              height: 9,
                              borderRadius: 5,
                              backgroundColor: colors.card,
                            }}
                          />
                        )}
                      </View>
                      <Text
                        style={{
                          flex: 1,
                          fontSize: FONT_SIZES.sm,
                          color: textColor,
                          lineHeight: 22,
                          fontWeight: textWeight,
                          textDecorationLine: textDecoration,
                        }}
                      >
                        {opt.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {submitted && q.explanation && (
                <View style={{ paddingLeft: 30, marginTop: 10 }}>
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
