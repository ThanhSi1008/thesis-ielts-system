import React from 'react';
import { View, Text } from 'react-native';
import { FONT_SIZES, RADIUS, SPACING } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';

export function ExplanationView({
  explanation,
  isCorrect,
}: {
  explanation: any;
  isCorrect: boolean;
}) {
  const { colors, isDark } = useTheme();
  if (!explanation) return null;

  const bg = isCorrect
    ? isDark ? colors.successBg : '#F0FDF4'
    : isDark ? colors.errorBg : '#FEF2F2';
  const icon = isCorrect ? '✅ ' : '❌ ';
  const textStyle = { fontSize: FONT_SIZES.sm, color: colors.text, lineHeight: 20 };

  if (typeof explanation === 'string') {
    return (
      <View style={{ marginTop: SPACING.sm, padding: SPACING.sm, borderRadius: RADIUS.md, backgroundColor: bg }}>
        <Text style={textStyle}>{icon}{explanation}</Text>
      </View>
    );
  }

  return (
    <View style={{ marginTop: SPACING.sm, padding: SPACING.sm, borderRadius: RADIUS.md, backgroundColor: bg }}>
      <Text style={textStyle}>
        {icon}{explanation.rationale || explanation.reason || JSON.stringify(explanation)}
      </Text>
      {explanation.keyword && (
        <Text style={[textStyle, { marginTop: 4, fontWeight: '600' }]}>
          Keyword: <Text style={{ fontWeight: '400' }}>{explanation.keyword}</Text>
        </Text>
      )}
    </View>
  );
}
