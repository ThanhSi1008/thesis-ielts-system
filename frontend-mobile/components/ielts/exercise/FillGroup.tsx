import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { FONT_SIZES, RADIUS, SPACING } from '@/constants';
import { createMarkdownStyles } from './shared';
import { useTheme } from '@/contexts/ThemeContext';

function getExplanationText(exp: any): string {
  if (!exp) return '';
  if (typeof exp === 'string') return exp;
  return exp.rationale || exp.reason || JSON.stringify(exp);
}

const TYPE_LABEL: Record<string, string> = {
  short_answer: 'Short Answer Questions',
  sentence_completion: 'Sentence Completion',
  diagram_completion: 'Diagram Completion',
  note_completion: 'Note Completion',
  form_completion: 'Form Completion',
  summary_completion: 'Summary Completion',
};

export function FillGroup({
  group,
  answers,
  submitted,
  onAnswer,
}: {
  group: any;
  answers: Record<string | number, string>;
  submitted: boolean;
  onAnswer: (qNum: number, val: string) => void;
}) {
  const { colors, isDark } = useTheme();
  const markdownStyles = createMarkdownStyles(colors);
  const [showExplanation, setShowExplanation] = useState<number | null>(null);
  const questions = (group.questions ?? group.points ?? []) as any[];
  const instruction = group.instruction || group.instructions;
  const qNums = questions.map((q: any) => q.question_number ?? q.id);

  return (
    <View style={{ marginBottom: 24 }}>
      {qNums.length > 0 && (
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 2 }}>
          Questions {Math.min(...qNums)}–{Math.max(...qNums)}
        </Text>
      )}
      <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 16, lineHeight: 20 }}>
        {instruction || TYPE_LABEL[group.type] || 'Answer the questions below.'}
      </Text>

      <View style={{ gap: 24 }}>
        {questions.map((q) => {
          const qNum = q.question_number ?? q.id;
          const val = answers[qNum] ?? '';
          const acceptable = (q.acceptable_answers ?? [q.answer ?? '']).map((a: string) =>
            a.toLowerCase().trim(),
          );
          const isCorrect = submitted && acceptable.includes(val.trim().toLowerCase());

          return (
            <View key={qNum}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                <View
                  style={{
                    minWidth: 28,
                    height: 28,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: submitted ? (isCorrect ? '#86EFAC' : '#FCA5A5') : (isDark ? colors.border : '#BFDBFE'),
                    backgroundColor: submitted
                      ? isCorrect ? (isDark ? colors.successBg : '#DCFCE7') : (isDark ? colors.errorBg : '#FEE2E2')
                      : isDark ? colors.infoBg : '#EFF6FF',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 4,
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '700',
                      color: submitted ? (isCorrect ? '#16A34A' : '#DC2626') : '#1D4ED8',
                    }}
                  >
                    {qNum}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  {(q.text ?? q.question) ? (
                    <Markdown style={markdownStyles}>
                      {(q.text ?? q.question ?? '').replace(/<br\s*\/?>/gi, '\n')}
                    </Markdown>
                  ) : null}
                </View>
              </View>

              <View style={{ paddingLeft: 36 }}>
                {submitted ? (
                  <View style={{ gap: 6 }}>
                    <View
                      style={{
                        alignSelf: 'flex-start',
                        borderWidth: 1,
                        borderColor: isCorrect ? '#86EFAC' : '#FCA5A5',
                        backgroundColor: isCorrect ? (isDark ? colors.successBg : '#F0FDF4') : (isDark ? colors.errorBg : '#FFF5F5'),
                        borderRadius: RADIUS.md,
                        paddingHorizontal: 12,
                        paddingVertical: 7,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: FONT_SIZES.sm,
                          fontWeight: '600',
                          color: isCorrect ? '#15803D' : '#DC2626',
                          textDecorationLine: isCorrect ? 'none' : 'line-through',
                        }}
                      >
                        {val || '—'}
                      </Text>
                    </View>
                    {!isCorrect && q.answer && (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                          backgroundColor: isDark ? colors.successBg : '#F0FDF4',
                          borderRadius: RADIUS.md,
                          borderWidth: 1,
                          borderColor: '#BBF7D0',
                          paddingHorizontal: 12,
                          paddingVertical: 7,
                          alignSelf: 'flex-start',
                        }}
                      >
                        <Text style={{ fontSize: 11, color: '#16A34A', fontWeight: '600' }}>Correct answer:</Text>
                        <Text style={{ fontSize: FONT_SIZES.sm, color: '#16A34A', fontWeight: '700' }}>{q.answer}</Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <TextInput
                    style={{
                      borderWidth: 1.5,
                      borderColor: colors.border,
                      borderRadius: RADIUS.md,
                      paddingHorizontal: 12,
                      paddingVertical: 9,
                      fontSize: FONT_SIZES.sm,
                      color: colors.text,
                      backgroundColor: colors.card,
                    }}
                    value={val}
                    onChangeText={(v) => onAnswer(qNum, v)}
                    placeholder="Your answer…"
                    placeholderTextColor={colors.textMuted}
                    editable={!submitted}
                    autoCorrect={false}
                    spellCheck={false}
                  />
                )}
              </View>

              {submitted && q.explanation && (
                <View style={{ paddingLeft: 36, marginTop: 10 }}>
                  <TouchableOpacity
                    onPress={() => setShowExplanation(showExplanation === qNum ? null : qNum)}
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
                      {showExplanation === qNum ? 'Hide' : '💬 Explain'}
                    </Text>
                  </TouchableOpacity>
                  {showExplanation === qNum && (
                    <View
                      style={{
                        backgroundColor: isDark ? colors.infoBg : '#EFF6FF',
                        borderWidth: 1,
                        borderColor: isDark ? colors.border : '#BFDBFE',
                        borderRadius: RADIUS.md,
                        padding: SPACING.md,
                      }}
                    >
                      <Text style={{ fontSize: 13, color: isDark ? colors.info : '#1E40AF', lineHeight: 20 }}>
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
