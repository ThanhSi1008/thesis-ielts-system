import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';

interface FormPoint {
  question_number?: number | string;
  text?: string;
  answer?: string;
  acceptable_answers?: string[];
}

interface Props {
  group: {
    heading?: string;
    instructions?: string;
    points?: FormPoint[];
    questions?: FormPoint[];
    type?: string;
  };
  answers: Record<string, string>;
  onAnswer: (key: string, value: string) => void;
}

export default function FormCompletionBlock({ group, answers, onAnswer }: Props) {
  const points: FormPoint[] = group.points ?? group.questions ?? [];
  const heading = group.heading ?? group.instructions;
  const isFlowchart = group.type === 'flowchart_completion' || group.type === 'flow_chart';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isFlowchart && styles.headerFlowchart]}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{isFlowchart ? 'FLOWCHART' : 'FORM COMPLETION'}</Text>
        </View>
      </View>

      {/* Heading / instructions */}
      {heading && (
        <View style={styles.headingBox}>
          <Ionicons name="document-text-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.headingText}>{heading}</Text>
        </View>
      )}

      {/* Form rows */}
      <View style={[styles.formBody, isFlowchart && styles.formBodyFlowchart]}>
        {points.map((point, idx) => {
          const qNum = point.question_number;
          const isHeader = !qNum;
          const label = extractLabel(point.text ?? '');

          if (isHeader) {
            return (
              <View key={`h-${idx}`} style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>{point.text}</Text>
              </View>
            );
          }

          const key = String(qNum);
          const val = answers[key] ?? '';

          return (
            <View key={key} style={styles.fieldRow}>
              {/* Question number badge */}
              <View style={styles.qBadge}>
                <Text style={styles.qBadgeText}>{qNum}</Text>
              </View>

              {/* Label */}
              {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}

              {/* Text input */}
              <TextInput
                style={styles.fieldInput}
                value={val}
                onChangeText={(v) => onAnswer(key, v)}
                placeholder="…"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

/**
 * Extracts a human-readable label from the point's text.
 * The text often contains a blank marker like "City: ..." or just descriptive text.
 * We strip the blank marker and use what remains as the label.
 */
function extractLabel(text: string): string {
  // Remove known blank markers: "...", "|G|", or sequences of dots + spaces
  const cleaned = text
    .replace(/\b\d+\s*\.{3,}/g, '') // "27 ..." at start
    .replace(/\|G\|/g, '')
    .replace(/\.{3,}/g, '')
    .trim();
  return cleaned;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: '#F0FDF4',
    borderBottomWidth: 1,
    borderColor: '#BBF7D0',
  },
  headerFlowchart: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    backgroundColor: '#16A34A18',
    borderWidth: 1,
    borderColor: '#16A34A40',
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#16A34A',
    textTransform: 'uppercase',
  },
  headingBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.border + '60',
  },
  headingText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '600',
    lineHeight: 20,
  },

  formBody: {
    padding: SPACING.md,
    backgroundColor: '#F9FAFB',
    gap: SPACING.sm,
  },
  formBodyFlowchart: { backgroundColor: '#FFFDF0' },

  sectionHeader: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 4,
  },
  sectionHeaderText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },

  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  qBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 5,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    flexShrink: 0,
  },
  qBadgeText: { fontSize: 11, fontWeight: '800', color: '#16A34A' },
  fieldLabel: { fontSize: FONT_SIZES.sm, color: COLORS.text, flex: 1, lineHeight: 18 },
  fieldInput: {
    borderBottomWidth: 1.5,
    borderColor: COLORS.border,
    paddingVertical: 4,
    paddingHorizontal: 6,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    minWidth: 100,
    maxWidth: 180,
  },
});
