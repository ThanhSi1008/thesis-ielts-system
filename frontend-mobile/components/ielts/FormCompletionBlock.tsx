import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';
import { isCorrect } from '@/utils/answerNormalization';

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
  mode?: 'edit' | 'review';
  correctAnswers?: Record<string, string>;
}

function FormCompletionBlockComponent({
  group,
  answers,
  onAnswer,
  mode = 'edit',
  correctAnswers,
}: Props) {
  const { colors, isDark } = useTheme();
  const points: FormPoint[] = group.points ?? group.questions ?? [];
  const heading = group.heading ?? group.instructions;
  const isFlowchart = group.type === 'flowchart_completion' || group.type === 'flow_chart';

  const styles = StyleSheet.create({
    container: {
      marginBottom: SPACING.xl,
      backgroundColor: colors.card,
      borderRadius: RADIUS.xl,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: SPACING.md,
      backgroundColor: isDark ? '#052e16' : '#F0FDF4',
      borderBottomWidth: 1,
      borderColor: isDark ? '#14532d' : '#BBF7D0',
    },
    headerFlowchart: {
      backgroundColor: isDark ? '#2d1f00' : '#FFFBEB',
      borderColor: isDark ? '#854d0e' : '#FDE68A',
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
      backgroundColor: colors.surface,
      padding: SPACING.md,
      borderBottomWidth: 1,
      borderColor: colors.border + '60',
    },
    headingText: {
      flex: 1,
      fontSize: FONT_SIZES.sm,
      color: colors.text,
      fontWeight: '600',
      lineHeight: 20,
    },

    formBody: {
      padding: SPACING.md,
      backgroundColor: colors.surface,
      gap: SPACING.sm,
    },
    formBodyFlowchart: { backgroundColor: isDark ? '#1c1500' : '#FFFDF0' },

    sectionHeader: {
      paddingVertical: SPACING.sm,
      borderBottomWidth: 1,
      borderColor: colors.border,
      marginBottom: 4,
    },
    sectionHeaderText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: colors.text },

    fieldRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      backgroundColor: colors.card,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.border,
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
    fieldLabel: { fontSize: FONT_SIZES.sm, color: colors.text, flex: 1, lineHeight: 18 },
    fieldInput: {
      borderBottomWidth: 1.5,
      borderColor: colors.border,
      paddingVertical: 4,
      paddingHorizontal: 6,
      fontSize: FONT_SIZES.md,
      color: colors.text,
      minWidth: 100,
      maxWidth: 180,
    },
  });

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
          <Ionicons name="document-text-outline" size={14} color={colors.textSecondary} />
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
          const correctVal = correctAnswers?.[key] ?? point.answer ?? (point.acceptable_answers && point.acceptable_answers[0]) ?? '';
          const isCorrectAns = mode === 'review' ? isCorrect(val, correctVal) : false;

          let rowStyle: any = null;
          let inputStyle: any = null;

          if (mode === 'review') {
            if (val) {
              if (isCorrectAns) {
                rowStyle = { borderColor: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.08)' };
                inputStyle = { color: '#16a34a', borderBottomColor: '#22c55e' };
              } else {
                rowStyle = { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.08)' };
                inputStyle = { color: '#ef4444', borderBottomColor: '#ef4444' };
              }
            } else {
              rowStyle = { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.03)', borderStyle: 'dashed' };
              inputStyle = { color: '#ef4444', borderBottomColor: '#ef4444' };
            }
          }

          return (
            <View key={key} style={{ gap: 4 }}>
              <View style={[styles.fieldRow, rowStyle]}>
                {/* Question number badge */}
                <View style={styles.qBadge}>
                  <Text style={styles.qBadgeText}>{qNum}</Text>
                </View>

                {/* Label */}
                {label ? <Text style={styles.fieldLabel} numberOfLines={1} ellipsizeMode="tail">{label}</Text> : null}

                {/* Text input */}
                <TextInput
                  style={[styles.fieldInput, inputStyle]}
                  value={val}
                  onChangeText={(v) => onAnswer(key, v)}
                  placeholder="…"
                  placeholderTextColor={colors.textMuted}
                  editable={mode !== 'review'}
                />

                {/* Right side feedback icon */}
                {mode === 'review' && (
                  <Ionicons
                    name={isCorrectAns ? 'checkmark-circle' : 'close-circle'}
                    size={18}
                    color={isCorrectAns ? '#22c55e' : '#ef4444'}
                  />
                )}
              </View>

              {mode === 'review' && !isCorrectAns && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 36, marginBottom: 4 }}>
                  <Ionicons name="bulb-outline" size={12} color="#16a34a" />
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#16a34a' }}>
                    Correct answer: <Text style={{ fontWeight: 'bold' }}>{correctVal}</Text>
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

function extractLabel(text: string): string {
  const cleaned = text
    .replace(/\b\d+\s*\.{3,}/g, '')
    .replace(/\|G\|/g, '')
    .replace(/\.{3,}/g, '')
    .trim();
  return cleaned;
}

export default React.memo(FormCompletionBlockComponent, (prev, next) => {
  if (prev.mode !== next.mode) return false;
  if (prev.group !== next.group) return false;

  const prevPoints: FormPoint[] = prev.group.points ?? prev.group.questions ?? [];
  const nextPoints: FormPoint[] = next.group.points ?? next.group.questions ?? [];
  
  if (prevPoints.length !== nextPoints.length) return false;

  for (const pt of prevPoints) {
    const qNum = pt.question_number;
    if (qNum) {
      const key = String(qNum);
      if (prev.answers[key] !== next.answers[key]) return false;
      if (prev.correctAnswers?.[key] !== next.correctAnswers?.[key]) return false;
    }
  }

  return true;
});
