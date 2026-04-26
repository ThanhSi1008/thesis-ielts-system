import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '@/constants';
import { markdownStyles } from './shared';

function getExplanationText(exp: any): string {
  if (!exp) return '';
  if (typeof exp === 'string') return exp;
  return exp.rationale || exp.reason || JSON.stringify(exp);
}

export function MatchingGroup({ group, answers, submitted, onAnswer }: any) {
  const [showExplanation, setShowExplanation] = useState<number | null>(null);

  const options = group.options || [];
  const items = group.items || [];
  const instruction = group.instruction || group.instructions;
  const qNums = items.map((i: any) => i.id);

  return (
    <View style={{ marginBottom: 24 }}>
      {/* Header */}
      {qNums.length > 0 && (
        <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 2 }}>
          Questions {Math.min(...qNums)}–{Math.max(...qNums)}
        </Text>
      )}
      <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 14, lineHeight: 20 }}>
        {instruction || 'Match each statement with the correct option.'}
      </Text>

      {/* Options reference box */}
      {options.length > 0 && (
        <View
          style={{
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: RADIUS.lg,
            overflow: 'hidden',
            marginBottom: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <View
            style={{
              backgroundColor: '#F8FAFC',
              borderBottomWidth: 1,
              borderBottomColor: '#E5E7EB',
              paddingHorizontal: SPACING.md,
              paddingVertical: 10,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Options List
            </Text>
          </View>
          {options.map((opt: any, idx: number) => (
            <View
              key={opt.letter}
              style={{
                flexDirection: 'row',
                borderBottomWidth: idx < options.length - 1 ? 1 : 0,
                borderBottomColor: '#F3F4F6',
                backgroundColor: '#fff',
              }}
            >
              <View
                style={{
                  width: 40,
                  paddingVertical: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRightWidth: 1,
                  borderRightColor: '#F3F4F6',
                  backgroundColor: '#FAFAFA',
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '800', color: COLORS.text }}>
                  {opt.letter}
                </Text>
              </View>
              <Text
                style={{
                  flex: 1,
                  paddingHorizontal: SPACING.md,
                  paddingVertical: 10,
                  fontSize: FONT_SIZES.sm,
                  color: COLORS.text,
                  fontWeight: '500',
                  lineHeight: 20,
                }}
              >
                {opt.text}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Question cards */}
      <View style={{ gap: SPACING.sm }}>
        {items.map((item: any) => {
          const qNum = item.id;
          const qData = group.answers ? group.answers[qNum] : null;
          const sel = (answers[qNum] ?? '').toUpperCase();
          const correctLetter = qData?.letter?.toUpperCase();
          const isCorrect = submitted && sel === correctLetter;

          return (
            <View
              key={qNum}
              style={{
                backgroundColor: '#fff',
                borderRadius: RADIUS.lg,
                borderWidth: 1,
                borderColor: submitted
                  ? isCorrect ? '#BBF7D0' : '#FCA5A5'
                  : '#E5E7EB',
                padding: SPACING.md,
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              {/* Question stem */}
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 12 }}>
                <View
                  style={{
                    minWidth: 24, height: 24, borderRadius: 6,
                    borderWidth: 1,
                    borderColor: submitted ? (isCorrect ? '#86EFAC' : '#FCA5A5') : '#BFDBFE',
                    backgroundColor: submitted ? (isCorrect ? '#DCFCE7' : '#FEE2E2') : '#EFF6FF',
                    alignItems: 'center', justifyContent: 'center',
                    paddingHorizontal: 4, flexShrink: 0, marginTop: 2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12, fontWeight: '700',
                      color: submitted ? (isCorrect ? '#16A34A' : '#DC2626') : '#1D4ED8',
                    }}
                  >
                    {qNum}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  {item.text ? (
                    <Markdown style={markdownStyles}>{(item.text || '').replace(/<br\s*\/?>/gi, '\n')}</Markdown>
                  ) : null}
                </View>
              </View>

              {/* Option letter buttons — horizontal scroll */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {options.map((opt: any) => {
                    const isSelected = sel === opt.letter.toUpperCase();
                    const isCorrectOpt = correctLetter === opt.letter.toUpperCase();

                    let circleBorder = '#D1D5DB';
                    let hasFill = false;
                    let fillColor = '#D1D5DB';
                    let textColor = '#9CA3AF';

                    if (submitted) {
                      if (isCorrectOpt) {
                        circleBorder = '#22C55E'; hasFill = true; fillColor = '#22C55E'; textColor = '#16A34A';
                      } else if (isSelected && !isCorrectOpt) {
                        circleBorder = '#F87171'; hasFill = true; fillColor = '#F87171'; textColor = '#DC2626';
                      } else {
                        circleBorder = '#E5E7EB'; textColor = '#D1D5DB';
                      }
                    } else if (isSelected) {
                      circleBorder = '#FFC107'; hasFill = true; fillColor = '#FFC107'; textColor = '#92400E';
                    }

                    return (
                      <TouchableOpacity
                        key={opt.letter}
                        onPress={() => !submitted && onAnswer(qNum, opt.letter)}
                        activeOpacity={submitted ? 1 : 0.6}
                        style={{ alignItems: 'center', gap: 4 }}
                      >
                        <View
                          style={{
                            width: 36, height: 36, borderRadius: 18,
                            borderWidth: 2, borderColor: circleBorder,
                            backgroundColor: '#fff',
                            alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          {hasFill ? (
                            <Text style={{ fontSize: 13, fontWeight: '800', color: fillColor }}>
                              {opt.letter}
                            </Text>
                          ) : (
                            <Text style={{ fontSize: 12, fontWeight: '700', color: textColor }}>
                              {opt.letter}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              {/* Correct answer hint */}
              {submitted && !isCorrect && correctLetter && (
                <Text style={{ fontSize: 12, color: '#16A34A', fontWeight: '700', marginTop: 8 }}>
                  → Correct: {correctLetter}
                </Text>
              )}

              {/* Explanation */}
              {submitted && qData?.explanation && (
                <View style={{ marginTop: 8 }}>
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
                        {getExplanationText(qData.explanation)}
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
