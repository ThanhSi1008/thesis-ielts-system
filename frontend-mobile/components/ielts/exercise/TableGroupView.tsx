import React from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { FONT_SIZES, RADIUS } from '@/constants';
import { createExerciseStyles } from './styles';
import { ExplanationView } from './ExplanationView';
import { useTheme } from '@/contexts/ThemeContext';

export function TableGroupView({ group, answers, submitted, onAnswer }: any) {
  const { colors, isDark } = useTheme();
  const styles = createExerciseStyles(colors);
  const headers = group.headers || [];
  const rows = group.rows || [];

  const allQs = rows.flatMap((row: any) =>
    Object.entries(row.questions || {}).map(([k, q]: any) => ({ qNum: Number(k), ...q })),
  );

  const renderCellText = (text: string) => {
    const blankRegex = /\b(\d+)\s*\.{3,}/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const matches = Array.from(text.matchAll(blankRegex));

    if (matches.length === 0) {
      return <Text style={{ fontSize: FONT_SIZES.sm, color: colors.text }}>{text}</Text>;
    }

    for (const m of matches) {
      const qNum = Number(m[1]);
      const qData = allQs.find((q: any) => q.qNum === qNum);
      const val = answers[qNum] ?? '';
      const isCorrect =
        submitted && val.trim().toLowerCase() === (qData?.answer ?? '').trim().toLowerCase();

      if ((m.index ?? 0) > lastIndex) {
        parts.push(
          <Text key={`t-${lastIndex}`} style={{ fontSize: FONT_SIZES.sm, color: colors.text }}>
            {text.slice(lastIndex, m.index)}
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
            borderColor: submitted ? (isCorrect ? '#86EFAC' : '#FCA5A5') : colors.border,
            backgroundColor: submitted
              ? isCorrect
                ? isDark
                  ? colors.successBg
                  : '#DCFCE7'
                : isDark
                  ? colors.errorBg
                  : '#FEE2E2'
              : colors.card,
            borderRadius: RADIUS.sm,
            paddingHorizontal: 4,
            paddingVertical: 2,
            marginHorizontal: 4,
            minWidth: 70,
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
                minWidth: 50,
              }}
              value={val}
              onChangeText={(v) => onAnswer(qNum, v)}
              editable={!submitted}
              placeholder="..."
              placeholderTextColor={colors.textMuted}
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
            ({qData.answer})
          </Text>,
        );
      }

      lastIndex = (m.index ?? 0) + m[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(
        <Text key={`e-${lastIndex}`} style={{ fontSize: FONT_SIZES.sm, color: colors.text }}>
          {text.slice(lastIndex)}
        </Text>,
      );
    }

    return <Text style={{ lineHeight: 28 }}>{parts}</Text>;
  };

  const renderCell = (value: string | string[]) => {
    if (Array.isArray(value)) {
      return (
        <View style={{ gap: 4 }}>
          {value.map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: colors.textMuted,
                  marginTop: 8,
                  marginRight: 6,
                }}
              />
              <View style={{ flex: 1 }}>{renderCellText(item)}</View>
            </View>
          ))}
        </View>
      );
    }
    if (typeof value === 'string') return renderCellText(value);
    return null;
  };

  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={styles.groupType}>{group.type.replace(/_/g, ' ')}</Text>
      {group.instructions && (
        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>{group.instructions}</Text>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator style={{ marginVertical: 12 }}>
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: RADIUS.md,
            overflow: 'hidden',
            backgroundColor: colors.card,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: colors.surface,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            {headers.map((h: string, idx: number) => (
              <View
                key={h}
                style={{
                  width: 150,
                  padding: 12,
                  borderRightWidth: idx === headers.length - 1 ? 0 : 1,
                  borderRightColor: colors.border,
                }}
              >
                <Text style={{ fontWeight: 'bold', color: colors.text }}>{h}</Text>
              </View>
            ))}
          </View>
          {rows.map((row: any, ri: number) => (
            <View
              key={ri}
              style={{
                flexDirection: 'row',
                borderBottomWidth: ri === rows.length - 1 ? 0 : 1,
                borderBottomColor: colors.border,
              }}
            >
              {headers.map((h: string, idx: number) => (
                <View
                  key={h}
                  style={{
                    width: 150,
                    padding: 12,
                    borderRightWidth: idx === headers.length - 1 ? 0 : 1,
                    borderRightColor: colors.border,
                  }}
                >
                  {row[h] !== undefined ? renderCell(row[h]) : null}
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {submitted &&
        allQs.map((q: any) =>
          q.explanation ? (
            <View key={q.qNum} style={{ marginTop: 8 }}>
              <Text
                style={{ fontSize: FONT_SIZES.sm, fontWeight: 'bold', color: colors.textSecondary }}
              >
                Q{q.qNum} Explanation:
              </Text>
              <ExplanationView
                explanation={q.explanation}
                isCorrect={answers[q.qNum]?.trim().toLowerCase() === q.answer.trim().toLowerCase()}
              />
            </View>
          ) : null,
        )}
    </View>
  );
}
