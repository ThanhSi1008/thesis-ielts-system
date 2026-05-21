import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '@/constants';

export function ExplanationView({
  explanation,
  isCorrect,
}: {
  explanation: any;
  isCorrect: boolean;
}) {
  if (!explanation) return null;

  const bg = isCorrect ? '#F0FDF4' : '#FEF2F2';
  const icon = isCorrect ? '✅ ' : '❌ ';

  if (typeof explanation === 'string') {
    return (
      <View style={[styles.container, { backgroundColor: bg }]}>
        <Text style={styles.text}>
          {icon}
          {explanation}
        </Text>
      </View>
    );
  }

  // It's an object
  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Text style={styles.text}>
        {icon}
        {explanation.rationale || explanation.reason || JSON.stringify(explanation)}
      </Text>
      {explanation.keyword && (
        <Text style={[styles.text, { marginTop: 4, fontWeight: '600' }]}>
          Keyword: <Text style={{ fontWeight: '400' }}>{explanation.keyword}</Text>
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  text: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
});
