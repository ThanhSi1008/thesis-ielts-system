import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '@/constants';
import { markdownStyles } from './shared';

// Small inline helper to avoid the TouchableOpacity re-import issue
import { TouchableOpacity } from 'react-native';

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
  const [showExplanation, setShowExplanation] = useState<number | null>(null);
  const questions = (group.questions ?? group.points ?? []) as any[];
  const instruction = group.instruction || group.instructions;
  const qNums = questions.map((q: any) => q.question_number ?? q.id);

  return (
    <View style={{ marginBottom: 24 }}>
      {/* Header */}
      {qNums.length > 0 && (
        <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 2 }}>
          Questions {Math.min(...qNums)}–{Math.max(...qNums)}
        </Text>
      )}
      <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 16, lineHeight: 20 }}>
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
              {/* Question row */}
              <View
                style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}
              >
                <View
                  style={{
                    minWidth: 28,
                    height: 28,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: submitted ? (isCorrect ? '#86EFAC' : '#FCA5A5') : '#BFDBFE',
                    backgroundColor: submitted ? (isCorrect ? '#DCFCE7' : '#FEE2E2') : '#EFF6FF',
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

              {/* Input / Answer display */}
              <View style={{ paddingLeft: 36 }}>
                {submitted ? (
                  <View style={{ gap: 6 }}>
                    {/* User's answer */}
                    <View
                      style={{
                        alignSelf: 'flex-start',
                        borderWidth: 1,
                        borderColor: isCorrect ? '#86EFAC' : '#FCA5A5',
                        backgroundColor: isCorrect ? '#F0FDF4' : '#FFF5F5',
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
                    {/* Correct answer badge */}
                    {!isCorrect && q.answer && (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                          backgroundColor: '#F0FDF4',
                          borderRadius: RADIUS.md,
                          borderWidth: 1,
                          borderColor: '#BBF7D0',
                          paddingHorizontal: 12,
                          paddingVertical: 7,
                          alignSelf: 'flex-start',
                        }}
                      >
                        <Text style={{ fontSize: 11, color: '#16A34A', fontWeight: '600' }}>
                          Correct answer:
                        </Text>
                        <Text
                          style={{ fontSize: FONT_SIZES.sm, color: '#16A34A', fontWeight: '700' }}
                        >
                          {q.answer}
                        </Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <TextInput
                    style={{
                      borderWidth: 1.5,
                      borderColor: '#D1D5DB',
                      borderRadius: RADIUS.md,
                      paddingHorizontal: 12,
                      paddingVertical: 9,
                      fontSize: FONT_SIZES.sm,
                      color: COLORS.text,
                      backgroundColor: '#fff',
                    }}
                    value={val}
                    onChangeText={(v) => onAnswer(qNum, v)}
                    placeholder="Your answer…"
                    placeholderTextColor={COLORS.textMuted}
                    editable={!submitted}
                    autoCorrect={false}
                    spellCheck={false}
                  />
                )}
              </View>

              {/* Explanation */}
              {submitted && q.explanation && (
                <View style={{ paddingLeft: 36, marginTop: 10 }}>
                  <TouchableExplain
                    qNum={qNum}
                    showExplanation={showExplanation}
                    setShowExplanation={setShowExplanation}
                    explanation={q.explanation}
                  />
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
function TouchableExplain({ qNum, showExplanation, setShowExplanation, explanation }: any) {
  return (
    <>
      <TouchableOpacity
        onPress={() => setShowExplanation(showExplanation === qNum ? null : qNum)}
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
          {showExplanation === qNum ? 'Hide' : '💬 Explain'}
        </Text>
      </TouchableOpacity>
      {showExplanation === qNum && (
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
            {getExplanationText(explanation)}
          </Text>
        </View>
      )}
    </>
  );
}
