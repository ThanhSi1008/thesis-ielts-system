import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '@/constants';
import { styles } from './styles';
import { ExplanationView } from './ExplanationView';

function getExplanationText(exp: any): string {
  if (!exp) return '';
  if (typeof exp === 'string') return exp;
  return exp.rationale || JSON.stringify(exp);
}

export function ReadingSummaryGroupView({ group, answers, submitted, onAnswer }: any) {
  const questions: any[] = group.questions || [];
  const qMap: Record<number, any> = Object.fromEntries(
    questions.map((q: any) => [q.question_number, q])
  );

  const checkAnswer = (q: any, userAns: string): boolean => {
    const acceptable = q.acceptable_answers
      ? q.acceptable_answers.map((a: string) => a.toLowerCase().trim())
      : [q.answer.toLowerCase().trim()];
    return acceptable.includes(userAns.toLowerCase().trim());
  };

  const summaryText: string = group.summary || group.text || '';
  const instruction: string = group.instruction || group.instructions || 'Complete the summary below.';

  // Parse {{qNum}} placeholders and render inline inputs
  const renderSummaryText = () => {
    const blankRegex = /\{\{(\d+)\}\}/g;
    const matches = Array.from(summaryText.matchAll(blankRegex));

    if (matches.length === 0) {
      return (
        <Text style={{ fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 26 }}>
          {summaryText}
        </Text>
      );
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    for (const match of matches) {
      const qNum = Number(match[1]);
      const q = qMap[qNum];
      const userAnswer = answers[qNum] ?? '';
      const isCorrect = submitted && q && checkAnswer(q, userAnswer);

      if ((match.index ?? 0) > lastIndex) {
        parts.push(
          <Text key={`t-${lastIndex}`} style={{ fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 26 }}>
            {summaryText.slice(lastIndex, match.index)}
          </Text>
        );
      }

      parts.push(
        <View
          key={`box-${qNum}`}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: submitted ? (isCorrect ? '#86EFAC' : '#FCA5A5') : '#9CA3AF',
            backgroundColor: submitted ? (isCorrect ? '#DCFCE7' : '#FEE2E2') : '#fff',
            borderRadius: RADIUS.sm,
            paddingHorizontal: 6,
            paddingVertical: 2,
            marginHorizontal: 2,
            minWidth: 90,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: 'bold',
              marginRight: 4,
              color: submitted ? (isCorrect ? '#16A34A' : '#DC2626') : '#9CA3AF',
            }}
          >
            {qNum}
          </Text>
          {submitted ? (
            <>
              <Text
                style={{
                  fontSize: FONT_SIZES.sm,
                  fontWeight: '600',
                  color: isCorrect ? '#15803D' : '#DC2626',
                  textDecorationLine: isCorrect ? 'none' : 'line-through',
                }}
              >
                {userAnswer || '—'}
              </Text>
              {!isCorrect && q && (
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#16A34A', marginLeft: 4 }}>
                  ({q.answer})
                </Text>
              )}
            </>
          ) : (
            <TextInput
              style={{
                padding: 0,
                margin: 0,
                fontSize: FONT_SIZES.sm,
                color: COLORS.text,
                minWidth: 60,
                fontWeight: '500',
              }}
              value={userAnswer}
              onChangeText={(v) => onAnswer(qNum, v)}
              editable={!submitted}
              placeholder="..."
              placeholderTextColor={COLORS.textMuted}
            />
          )}
        </View>
      );

      lastIndex = (match.index ?? 0) + match[0].length;
    }

    if (lastIndex < summaryText.length) {
      parts.push(
        <Text key={`end-${lastIndex}`} style={{ fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 26 }}>
          {summaryText.slice(lastIndex)}
        </Text>
      );
    }

    return <Text style={{ lineHeight: 30 }}>{parts}</Text>;
  };

  const qNums = questions.map((q: any) => q.question_number);

  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={styles.groupType}>Summary Completion</Text>

      {/* Question range header */}
      {qNums.length > 0 && (
        <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 4 }}>
          Questions {Math.min(...qNums)}–{Math.max(...qNums)}
        </Text>
      )}

      {instruction ? (
        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>{instruction}</Text>
        </View>
      ) : null}

      {/* Summary Box */}
      <View
        style={{
          backgroundColor: '#F9FAFB',
          borderWidth: 1,
          borderColor: '#E5E7EB',
          borderRadius: RADIUS.lg,
          padding: SPACING.lg,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        {renderSummaryText()}
      </View>

      {/* Explanations after submit */}
      {submitted &&
        questions.map((q: any) =>
          q.explanation ? (
            <View key={q.question_number} style={{ marginTop: SPACING.sm }}>
              <Text style={{ fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textSecondary }}>
                Q{q.question_number} Explanation:
              </Text>
              <ExplanationView
                explanation={getExplanationText(q.explanation)}
                isCorrect={checkAnswer(q, answers[q.question_number] ?? '')}
              />
            </View>
          ) : null
        )}
    </View>
  );
}
