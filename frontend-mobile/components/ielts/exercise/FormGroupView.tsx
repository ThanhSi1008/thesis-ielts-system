import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { FONT_SIZES, RADIUS } from '@/constants';
import { createExerciseStyles } from './styles';
import { ExplanationView } from './ExplanationView';
import { useTheme } from '@/contexts/ThemeContext';

export function FormGroupView({ group, answers, submitted, onAnswer }: any) {
  const { colors, isDark } = useTheme();
  const styles = createExerciseStyles(colors);
  const isFlowchart = group.type === 'flowchart_completion' || group.type === 'flow_chart';
  const qs = group.points || group.questions || [];
  const heading = group.heading || group.instructions;

  const renderInlineText = (point: any) => {
    const text = point.text || '';
    const qNum = point.question_number;

    if (!qNum) {
      return (
        <Text style={{ fontSize: FONT_SIZES.md, fontWeight: '700', color: colors.text }}>
          {text}
        </Text>
      );
    }

    const blankRegex = /\b(\d+)\s*\.{3,}|\|G\|/;
    const match = text.match(blankRegex);

    if (!match) {
      return <Text style={{ fontSize: FONT_SIZES.sm, color: colors.text }}>{text}</Text>;
    }

    const splitIdx = text.indexOf(match[0]);
    const before = text.slice(0, splitIdx);
    const after = text.slice(splitIdx + match[0].length);

    const val = answers[qNum] ?? '';
    const correctArr = (point.acceptable_answers ?? [point.answer ?? '']).map((a: string) =>
      a.toLowerCase().trim(),
    );
    const isCorrect = submitted && correctArr.includes(val.trim().toLowerCase());

    return (
      <Text style={{ fontSize: FONT_SIZES.sm, color: colors.text, lineHeight: 28 }}>
        {before}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: submitted ? (isCorrect ? '#86EFAC' : '#FCA5A5') : colors.border,
            backgroundColor: submitted
              ? isCorrect ? (isDark ? colors.successBg : '#DCFCE7') : (isDark ? colors.errorBg : '#FEE2E2')
              : colors.card,
            borderRadius: RADIUS.sm,
            paddingHorizontal: 4,
            paddingVertical: 2,
            marginHorizontal: 4,
            minWidth: 80,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: 'bold',
              color: submitted ? (isCorrect ? '#16A34A' : '#DC2626') : colors.textMuted,
              marginRight: 4,
            }}
          >
            {qNum}
          </Text>
          {submitted ? (
            <Text
              style={{
                fontSize: FONT_SIZES.sm,
                fontWeight: '600',
                color: isCorrect ? '#16A34A' : '#DC2626',
                textDecorationLine: isCorrect ? 'none' : 'line-through',
              }}
            >
              {val || '—'}
            </Text>
          ) : (
            <TextInput
              style={{
                padding: 0,
                margin: 0,
                fontSize: FONT_SIZES.sm,
                color: colors.text,
                minWidth: 60,
              }}
              value={val}
              onChangeText={(v) => onAnswer(qNum, v)}
              editable={!submitted}
              placeholder="..."
              placeholderTextColor={colors.textMuted}
            />
          )}
        </View>

        {submitted && !isCorrect && (
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#16A34A', marginHorizontal: 4 }}>
            ({point.answer})
          </Text>
        )}

        {after}
      </Text>
    );
  };

  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={styles.groupType}>{group.type.replace(/_/g, ' ')}</Text>
      {heading && (
        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>{heading}</Text>
        </View>
      )}

      <View
        style={{
          backgroundColor: isFlowchart
            ? isDark ? colors.successBg : '#F0FDF4'
            : colors.surface,
          padding: 16,
          borderRadius: RADIUS.md,
          borderWidth: 1,
          borderColor: isFlowchart ? (isDark ? '#4ADE80' : '#BBF7D0') : colors.border,
        }}
      >
        {qs.map((point: any, idx: number) => {
          const isHeader = !point.question_number;
          return (
            <View
              key={point.question_number || `h-${idx}`}
              style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'flex-start' }}
            >
              {!isHeader && (
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: colors.textMuted,
                    marginTop: 10,
                    marginRight: 8,
                  }}
                />
              )}
              <View style={{ flex: 1 }}>
                {renderInlineText(point)}
                {submitted && point.explanation && (
                  <ExplanationView
                    explanation={point.explanation}
                    isCorrect={(point.acceptable_answers ?? [point.answer ?? ''])
                      .map((a: string) => a.toLowerCase().trim())
                      .includes((answers[point.question_number] ?? '').trim().toLowerCase())}
                  />
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
