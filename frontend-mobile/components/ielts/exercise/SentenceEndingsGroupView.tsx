import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '@/constants';
import { styles } from './styles';
import { ExplanationView } from './ExplanationView';

function getExplanationText(exp: any): string {
  if (!exp) return '';
  if (typeof exp === 'string') return exp;
  return exp.rationale || JSON.stringify(exp);
}

export function SentenceEndingsGroupView({ group, answers, submitted, onAnswer }: any) {
  const [showExplanation, setShowExplanation] = useState<number | null>(null);

  const questions: any[] = group.questions || [];
  const options: any[] = group.options || [];
  const instruction: string =
    group.instruction || group.instructions || 'Complete each sentence with the correct ending.';
  const qNums = questions.map((q: any) => q.question_number);

  // Track which option IDs are already used (to dim them)
  const usedIds = questions
    .map((q: any) => (answers[q.question_number] ?? '').toUpperCase())
    .filter(Boolean);

  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={styles.groupType}>Matching Sentence Endings</Text>

      {qNums.length > 0 && (
        <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 4 }}>
          Questions {Math.min(...qNums)}–{Math.max(...qNums)}
        </Text>
      )}

      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>{instruction}</Text>
      </View>

      {/* Question cards */}
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
                backgroundColor: submitted ? (isCorrect ? '#F0FDF4' : '#FFF5F5') : '#fff',
                borderRadius: RADIUS.lg,
                borderWidth: 1,
                borderColor: submitted ? (isCorrect ? '#86EFAC' : '#FCA5A5') : COLORS.border,
                padding: SPACING.md,
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
            >
              {/* Question stem */}
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                <View
                  style={{
                    minWidth: 26,
                    height: 26,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: submitted ? (isCorrect ? '#86EFAC' : '#FCA5A5') : '#BFDBFE',
                    backgroundColor: submitted ? (isCorrect ? '#DCFCE7' : '#FEE2E2') : '#EFF6FF',
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
                    color: COLORS.text,
                    lineHeight: 22,
                    fontWeight: '500',
                  }}
                >
                  {q.text}
                </Text>
              </View>

              {/* Answer / selection area */}
              {submitted ? (
                <View style={{ marginLeft: 34, gap: 6 }}>
                  {/* Selected answer chip */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      alignSelf: 'flex-start',
                      borderWidth: 1,
                      borderColor: isCorrect ? '#86EFAC' : '#FCA5A5',
                      backgroundColor: isCorrect ? '#DCFCE7' : '#FEE2E2',
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

                  {/* Correct answer if wrong */}
                  {!isCorrect && q.answer && (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        alignSelf: 'flex-start',
                        borderWidth: 1,
                        borderColor: '#86EFAC',
                        backgroundColor: '#DCFCE7',
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
                /* Option chips to tap */
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
                            ? '#F59E0B'
                            : isUsedElsewhere
                              ? '#E5E7EB'
                              : COLORS.border,
                          backgroundColor: isSelected
                            ? '#FEF3C7'
                            : isUsedElsewhere
                              ? '#F9FAFB'
                              : '#fff',
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
                            color: isSelected ? '#92400E' : COLORS.textSecondary,
                          }}
                        >
                          {optId}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Explanation toggle */}
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
                      backgroundColor: '#EFF6FF',
                      borderRadius: RADIUS.sm,
                      borderWidth: 1,
                      borderColor: '#BFDBFE',
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

      {/* Options reference bank */}
      {options.length > 0 && (
        <View
          style={{
            marginTop: SPACING.lg,
            backgroundColor: '#F9FAFB',
            borderWidth: 1,
            borderColor: COLORS.border,
            borderRadius: RADIUS.lg,
            padding: SPACING.md,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: '800',
              color: COLORS.textMuted,
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
                        : COLORS.textMuted
                      : isUsed
                        ? '#F59E0B'
                        : COLORS.text,
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
                        : COLORS.textMuted
                      : isUsed
                        ? '#92400E'
                        : COLORS.text,
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
