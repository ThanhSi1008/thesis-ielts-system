import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '@/constants';
import { markdownStyles } from './shared';

function getExplanationText(exp: any): string {
  if (!exp) return '';
  if (typeof exp === 'string') return exp;
  return exp.rationale || exp.reason || JSON.stringify(exp);
}

export function TFNGGroup({ group, answers, submitted, onAnswer }: any) {
  const [showExplanation, setShowExplanation] = useState<number | null>(null);

  const isYesNo = group.type === 'yes_no_not_given';
  const OPTIONS = isYesNo
    ? ['YES', 'NO', 'NOT GIVEN']
    : ['TRUE', 'FALSE', 'NOT GIVEN'];

  const typeLabel = isYesNo ? 'Yes / No / Not Given' : 'True / False / Not Given';
  const questions = group.questions || [];
  const instruction = group.instruction || group.instructions;
  const qNums = questions.map((q: any) => q.question_number);

  const defaultInstruction = isYesNo
    ? 'Do the following statements agree with the views of the writer? Choose YES, NO or NOT GIVEN.'
    : 'Do the following statements agree with the information in the text? Choose TRUE, FALSE or NOT GIVEN.';

  return (
    <View style={{ marginBottom: 24 }}>
      {/* Header */}
      {qNums.length > 0 && (
        <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 2 }}>
          Questions {Math.min(...qNums)}–{Math.max(...qNums)}
        </Text>
      )}
      <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 16, lineHeight: 20 }}>
        {instruction || defaultInstruction}
      </Text>

      <View style={{ gap: 24 }}>
        {questions.map((q: any) => {
          const sel = (answers[q.question_number] ?? '').toUpperCase();
          const isCorrect = sel === q.answer?.toUpperCase();

          return (
            <View key={q.question_number}>
              {/* Question text row */}
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                <View
                  style={{
                    minWidth: 24,
                    height: 24,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: submitted
                      ? isCorrect ? '#86EFAC' : '#FCA5A5'
                      : '#BFDBFE',
                    backgroundColor: submitted
                      ? isCorrect ? '#DCFCE7' : '#FEE2E2'
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
                      color: submitted
                        ? isCorrect ? '#16A34A' : '#DC2626'
                        : '#1D4ED8',
                    }}
                  >
                    {q.question_number}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  {q.text ? (
                    <Markdown style={markdownStyles}>{(q.text || '').replace(/<br\s*\/?>/gi, '\n')}</Markdown>
                  ) : null}
                </View>
              </View>

              {/* Option radio row — horizontal, slim */}
              <View style={{ flexDirection: 'row', gap: 6, paddingLeft: 32, flexWrap: 'wrap' }}>
                {OPTIONS.map((opt) => {
                  const isSelected = sel === opt;
                  const isAnswerKey = q.answer?.toUpperCase() === opt;

                  // Circle states
                  let circleBorder = '#D1D5DB';
                  let hasFill = false;
                  let fillColor = 'transparent';
                  let textColor = '#6B7280';
                  let textWeight: '400' | '700' = '400';
                  let textDecoration: 'none' | 'line-through' = 'none';

                  if (submitted) {
                    if (isAnswerKey) {
                      circleBorder = '#22C55E'; hasFill = true; fillColor = '#22C55E';
                      textColor = '#15803D'; textWeight = '700';
                    } else if (isSelected && !isAnswerKey) {
                      circleBorder = '#F87171'; hasFill = true; fillColor = '#F87171';
                      textColor = '#DC2626'; textDecoration = 'line-through';
                    } else {
                      circleBorder = '#E5E7EB'; textColor = '#D1D5DB';
                    }
                  } else {
                    if (isSelected) {
                      circleBorder = '#3B82F6'; hasFill = true; fillColor = '#3B82F6';
                      textColor = '#1D4ED8'; textWeight = '700';
                    }
                  }

                  return (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => !submitted && onAnswer(q.question_number, opt)}
                      activeOpacity={submitted ? 1 : 0.6}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}
                    >
                      <View
                        style={{
                          width: 16, height: 16, borderRadius: 8,
                          borderWidth: 1.5, borderColor: circleBorder,
                          backgroundColor: '#fff',
                          alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {hasFill && (
                          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' }} />
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

              {/* Explanation */}
              {submitted && q.explanation && (
                <View style={{ paddingLeft: 32, marginTop: 8 }}>
                  <TouchableOpacity
                    onPress={() => setShowExplanation(showExplanation === q.question_number ? null : q.question_number)}
                    style={{
                      alignSelf: 'flex-start',
                      backgroundColor: '#F3F4F6',
                      borderRadius: RADIUS.sm,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      marginBottom: 6,
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#4B5563' }}>
                      {showExplanation === q.question_number ? 'Hide' : '💬 Explain'}
                    </Text>
                  </TouchableOpacity>
                  {showExplanation === q.question_number && (
                    <View
                      style={{
                        backgroundColor: '#EFF6FF',
                        borderWidth: 1,
                        borderColor: '#BFDBFE',
                        borderRadius: RADIUS.md,
                        padding: SPACING.md,
                      }}
                    >
                      <Text style={{ fontSize: 13, color: '#1E40AF', lineHeight: 20 }}>
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
