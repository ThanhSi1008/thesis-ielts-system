import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { FONT_SIZES, RADIUS, SPACING } from '@/constants';
import { createExerciseStyles } from './styles';
import { ExplanationView } from './ExplanationView';
import { useTheme } from '@/contexts/ThemeContext';

function getExplanationText(exp: any): string {
  if (!exp) return '';
  if (typeof exp === 'string') return exp;
  return exp.rationale || JSON.stringify(exp);
}

const LABEL_BY_TYPE: Record<string, string> = {
  matching_features: 'Matching Features',
  matching_information: 'Matching Information',
  matching_headings: 'Matching Headings',
};

const OPTIONS_BOX_TITLE: Record<string, string> = {
  matching_features: 'List of Researchers / Features',
  matching_information: 'List of Paragraphs',
  matching_headings: 'List of Headings',
};

const DEFAULT_INSTRUCTION: Record<string, string> = {
  matching_features: 'Match each statement with the correct researcher or feature.',
  matching_information: 'Which paragraph contains the following information?',
  matching_headings: 'Choose the correct heading for each paragraph.',
};

export function ReadingMatchingGroupView({ group, answers, submitted, onAnswer }: any) {
  const { colors, isDark } = useTheme();
  const styles = createExerciseStyles(colors);
  const [showExplanation, setShowExplanation] = useState<number | null>(null);

  const questions: any[] = group.questions || [];
  const options: any[] = group.options || [];
  const optionLetters: string[] = options.map((o: any) => o.letter);
  const typeLabel = LABEL_BY_TYPE[group.type] ?? group.type?.replace(/_/g, ' ');
  const instruction = group.instruction || group.instructions || DEFAULT_INSTRUCTION[group.type] || '';
  const qNums = questions.map((q: any) => q.question_number);

  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={styles.groupType}>{typeLabel}</Text>

      {qNums.length > 0 && (
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
          Questions {Math.min(...qNums)}–{Math.max(...qNums)}
        </Text>
      )}

      {instruction ? (
        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>{instruction}</Text>
        </View>
      ) : null}

      {/* Questions as cards with option button row */}
      <View style={{ gap: SPACING.sm }}>
        {questions.map((q: any) => {
          const selected = (answers[q.question_number] ?? '').toUpperCase();
          const isCorrect = submitted && selected === q.answer?.toUpperCase();

          return (
            <View
              key={q.question_number}
              style={{
                backgroundColor: submitted
                  ? isCorrect ? (isDark ? colors.successBg : '#F0FDF4') : (isDark ? colors.errorBg : '#FFF5F5')
                  : colors.card,
                borderRadius: RADIUS.lg,
                borderWidth: 1,
                borderColor: submitted ? (isCorrect ? '#86EFAC' : '#FCA5A5') : colors.border,
                padding: SPACING.md,
              }}
            >
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                <View style={styles.qNumBadge}>
                  <Text style={styles.qNumBadgeText}>{q.question_number}</Text>
                </View>
                <Text style={{ flex: 1, fontSize: FONT_SIZES.sm, color: colors.text, lineHeight: 22, fontWeight: '500' }}>
                  {q.text}
                </Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {optionLetters.map((letter) => {
                    const isSelected = selected === letter.toUpperCase();
                    const isCorrectCell = submitted && letter.toUpperCase() === q.answer?.toUpperCase();
                    let bg: string = colors.card;
                    let border: string = colors.border;
                    let textColor: string = colors.text;

                    if (submitted && isCorrectCell) {
                      bg = isDark ? colors.successBg : '#DCFCE7';
                      border = '#86EFAC';
                      textColor = '#16A34A';
                    } else if (submitted && isSelected && !isCorrectCell) {
                      bg = isDark ? colors.errorBg : '#FEE2E2';
                      border = '#FCA5A5';
                      textColor = '#DC2626';
                    } else if (!submitted && isSelected) {
                      bg = isDark ? colors.warningBg : '#FEF9C3';
                      border = '#FDE047';
                      textColor = isDark ? colors.primary : '#854D0E';
                    }

                    return (
                      <TouchableOpacity
                        key={letter}
                        onPress={() => !submitted && onAnswer(q.question_number, letter)}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 22,
                          borderWidth: 2,
                          borderColor: border,
                          backgroundColor: bg,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ fontSize: FONT_SIZES.md, fontWeight: '800', color: textColor }}>
                          {letter}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              {submitted && !isCorrect && (
                <Text style={{ fontSize: 12, color: '#16A34A', fontWeight: '700', marginTop: 6 }}>
                  → Correct: {q.answer}
                </Text>
              )}

              {submitted && q.explanation && showExplanation === q.question_number && (
                <ExplanationView explanation={getExplanationText(q.explanation)} isCorrect={isCorrect} />
              )}
              {submitted && q.explanation && (
                <TouchableOpacity
                  onPress={() => setShowExplanation(showExplanation === q.question_number ? null : q.question_number)}
                  style={{
                    marginTop: 8,
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
              )}
            </View>
          );
        })}
      </View>

      {/* Options reference box */}
      {options.length > 0 && (
        <View
          style={{
            marginTop: SPACING.lg,
            borderRadius: RADIUS.lg,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              paddingHorizontal: SPACING.md,
              paddingVertical: 10,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '800',
                color: colors.textMuted,
                textTransform: 'uppercase',
                letterSpacing: 0.8,
              }}
            >
              {OPTIONS_BOX_TITLE[group.type] ?? 'Options'}
            </Text>
          </View>
          {options.map((opt: any, idx: number) => (
            <View
              key={idx}
              style={{
                flexDirection: 'row',
                borderBottomWidth: idx < options.length - 1 ? 1 : 0,
                borderBottomColor: colors.border,
                backgroundColor: colors.card,
              }}
            >
              <View
                style={{
                  width: 44,
                  paddingVertical: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRightWidth: 1,
                  borderRightColor: colors.border,
                  backgroundColor: colors.surface,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>
                  {opt.letter}
                </Text>
              </View>
              <Text
                style={{
                  flex: 1,
                  paddingHorizontal: SPACING.md,
                  paddingVertical: 12,
                  fontSize: FONT_SIZES.sm,
                  color: colors.text,
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
    </View>
  );
}
