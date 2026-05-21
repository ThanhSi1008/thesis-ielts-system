import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS } from '@/constants';
import { styles } from './styles';
import { ExplanationView } from './ExplanationView';

export function SummaryGroupView({ group, answers, submitted, onAnswer }: any) {
  const allQs = Object.entries(group.questions || {}).map(([k, q]: any) => ({
    qNum: Number(k),
    ...q,
  }));

  const renderText = (rawText: string) => {
    const text = rawText.replace(/(^|\n)\d+\s+/g, '$1');
    const blankRegex = /\b(\d+)\s*\{\{\1\}\}|\{\{(\d+)\}\}/g;

    // Hacky string matcher for React Native since we can't map regex natively without state
    const matches = Array.from(text.matchAll(blankRegex));
    const parts = [];
    let lastIndex = 0;

    if (matches.length === 0) {
      return <Text style={{ fontSize: FONT_SIZES.sm, color: COLORS.text }}>{text}</Text>;
    }

    for (const match of matches) {
      const qNum = Number(match[1] || match[2]);
      const qData = allQs.find((q) => q.qNum === qNum);
      const val = answers[qNum] ?? '';

      let isCorrect = false;
      if (qData) {
        const acceptable = qData.acceptable_answers
          ? qData.acceptable_answers.map((a: string) => a.toLowerCase().trim())
          : [(qData.primary_answer || '').toLowerCase().trim()];
        isCorrect = submitted && acceptable.includes(val.trim().toLowerCase());
      }

      if (match.index > lastIndex) {
        parts.push(
          <Text key={`t-${lastIndex}`} style={{ fontSize: FONT_SIZES.sm, color: COLORS.text }}>
            {text.slice(lastIndex, match.index)}
          </Text>,
        );
      }

      parts.push(
        <View
          key={`b-${qNum}`}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: submitted ? (isCorrect ? '#86EFAC' : '#FCA5A5') : COLORS.border,
            backgroundColor: submitted ? (isCorrect ? '#DCFCE7' : '#FEE2E2') : '#fff',
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
              color: submitted ? (isCorrect ? '#16A34A' : '#DC2626') : COLORS.textMuted,
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
                color: COLORS.text,
                minWidth: 60,
              }}
              value={val}
              onChangeText={(v) => onAnswer(qNum, v)}
              editable={!submitted}
              placeholder="..."
            />
          )}
        </View>,
      );

      if (submitted && !isCorrect && qData) {
        parts.push(
          <Text
            key={`a-${qNum}`}
            style={{ fontSize: 12, fontWeight: 'bold', color: '#16A34A', marginHorizontal: 4 }}
          >
            ({qData.primary_answer || qData.answer})
          </Text>,
        );
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(
        <Text key={`e-${lastIndex}`} style={{ fontSize: FONT_SIZES.sm, color: COLORS.text }}>
          {text.slice(lastIndex)}
        </Text>,
      );
    }

    return <Text style={{ lineHeight: 28 }}>{parts}</Text>;
  };

  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={styles.groupType}>{group.type.replace(/_/g, ' ')}</Text>
      {group.heading && (
        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>{group.heading}</Text>
        </View>
      )}

      <View
        style={{
          backgroundColor: '#F9FAFB',
          padding: 16,
          borderRadius: RADIUS.md,
          borderWidth: 1,
          borderColor: COLORS.border,
        }}
      >
        {renderText(group.text || '')}
      </View>

      {submitted &&
        allQs.map((q: any) =>
          q.explanation ? (
            <View key={q.qNum} style={{ marginTop: 8 }}>
              <Text
                style={{ fontSize: FONT_SIZES.sm, fontWeight: 'bold', color: COLORS.textSecondary }}
              >
                Q{q.qNum} Explanation:
              </Text>
              <ExplanationView
                explanation={q.explanation}
                isCorrect={(q.acceptable_answers
                  ? q.acceptable_answers.map((a: string) => a.toLowerCase().trim())
                  : [(q.primary_answer || q.answer || '').toLowerCase().trim()]
                ).includes((answers[q.qNum] ?? '').trim().toLowerCase())}
              />
            </View>
          ) : null,
        )}
    </View>
  );
}
