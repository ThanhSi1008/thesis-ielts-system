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
    questions?: any;
    type?: string;
    items?: any[];
    [key: string]: any;
  };
  answers: Record<string, string>;
  onAnswer: (key: string, value: string) => void;
  mode?: 'edit' | 'review';
  correctAnswers?: Record<string, string>;
}

const getFormPoints = (group: any): FormPoint[] => {
  let raw = group?.points || (Array.isArray(group?.questions) ? group?.questions : null) || group?.items;
  if (!raw && Array.isArray(group?.content)) {
    const flattened: FormPoint[] = [];
    group.content.forEach((section: any) => {
      if (section) {
        if (section.heading) {
          flattened.push({ text: section.heading });
        }
        if (Array.isArray(section.points)) {
          flattened.push(...section.points);
        } else if (section.text) {
          flattened.push({ text: section.text });
        }
      }
    });
    raw = flattened;
  }
  return Array.isArray(raw) ? raw : [];
};

function FormCompletionBlockComponent({
  group,
  answers,
  onAnswer,
  mode = 'edit',
  correctAnswers,
}: Props) {
  const { colors, isDark } = useTheme();
  const points = getFormPoints(group);
  const heading = group.heading || group.instructions;
  const isFlowchart = group.type === 'flowchart_completion' || group.type === 'flow_chart';
  const isTable = group.type === 'table' || group.type === 'table_completion' || String(group.question_type || '').toLowerCase().includes('table');

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
    headerTable: {
      backgroundColor: isDark ? '#0f172a' : '#F8FAFC',
      borderColor: isDark ? '#1e293b' : '#E2E8F0',
    },
    typeBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: RADIUS.sm,
      backgroundColor: '#16A34A18',
      borderWidth: 1,
      borderColor: '#16A34A40',
    },
    typeBadgeTable: {
      backgroundColor: '#47556915',
      borderColor: '#47556930',
    },
    typeBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.8,
      color: '#16A34A',
      textTransform: 'uppercase',
    },
    typeBadgeTextTable: {
      color: '#475569',
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

  const renderBoxedText = (point: FormPoint, idx: number) => {
    const qNum = point.question_number;
    const text = point.text || (point as any).question_text || '';
    if (!qNum) {
      return (
        <Text style={[styles.sectionHeaderText, { color: colors.text }]}>
          {text}
        </Text>
      );
    }

    const blankRegex = /\b\d+\s*(?:\.{3,}|_+|\[blank\])|\.{3,}|_+|\[blank\]|\|G\|/;
    const match = text.match(blankRegex);

    const key = String(qNum);
    const val = answers[key] || '';
    const correctVal = correctAnswers?.[key] || point.answer || (point.acceptable_answers && point.acceptable_answers[0]) || '';
    const isCorrectAns = mode === 'review' ? isCorrect(val, correctVal) : false;

    let containerStyle: any = {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      borderRadius: RADIUS.md,
      paddingHorizontal: 8,
      paddingVertical: 2,
      marginHorizontal: 4,
      minWidth: 100,
      maxWidth: 160,
    };
    let inputStyle: any = {
      flex: 1,
      fontSize: FONT_SIZES.sm,
      color: colors.text,
      padding: 0,
      margin: 0,
      fontWeight: '600',
      height: 24,
    };
    let badgeColor = colors.textSecondary;

    if (mode === 'review') {
      if (val) {
        if (isCorrectAns) {
          containerStyle.borderColor = '#22c55e';
          containerStyle.backgroundColor = isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.08)';
          inputStyle.color = '#16a34a';
          badgeColor = '#16a34a';
        } else {
          containerStyle.borderColor = '#ef4444';
          containerStyle.backgroundColor = isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)';
          inputStyle.color = '#ef4444';
          badgeColor = '#ef4444';
        }
      } else {
        containerStyle.borderColor = '#ef4444';
        containerStyle.backgroundColor = isDark ? 'rgba(239, 68, 68, 0.05)' : 'rgba(239, 68, 68, 0.03)';
        containerStyle.borderStyle = 'dashed';
        inputStyle.color = '#ef4444';
        badgeColor = '#ef4444';
      }
    }

    const inputNode = (
      <View key={`input-${qNum}`} style={containerStyle}>
        <Text style={{ fontSize: 10, fontWeight: '800', color: badgeColor, marginRight: 4 }}>
          {qNum}
        </Text>
        <TextInput
          style={inputStyle}
          value={val}
          onChangeText={(v) => onAnswer(key, v)}
          placeholder="..."
          placeholderTextColor={colors.textMuted}
          editable={mode !== 'review'}
          returnKeyType="done"
        />
        {mode === 'review' && (
          <Ionicons
            name={isCorrectAns ? 'checkmark-circle' : 'close-circle'}
            size={12}
            color={isCorrectAns ? '#22c55e' : '#ef4444'}
            style={{ marginLeft: 4 }}
          />
        )}
      </View>
    );

    if (!match) {
      return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
          <Text style={{ fontSize: FONT_SIZES.sm, color: colors.text, lineHeight: 28 }}>
            {text}
          </Text>
          {inputNode}
          {mode === 'review' && !isCorrectAns && (
            <Text style={{ fontSize: 12, color: '#16a34a', fontWeight: '700', marginLeft: 4 }}>
              ({correctVal})
            </Text>
          )}
        </View>
      );
    }

    const splitIdx = text.indexOf(match[0]);
    const before = text.slice(0, splitIdx);
    const after = text.slice(splitIdx + match[0].length);

    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
        {before ? (
          <Text style={{ fontSize: FONT_SIZES.sm, color: colors.text, lineHeight: 28 }}>
            {before}
          </Text>
        ) : null}
        {inputNode}
        {mode === 'review' && !isCorrectAns && (
          <Text style={{ fontSize: 12, color: '#16a34a', fontWeight: '700', marginRight: 4 }}>
            ({correctVal})
          </Text>
        )}
        {after ? (
          <Text style={{ fontSize: FONT_SIZES.sm, color: colors.text, lineHeight: 28 }}>
            {after}
          </Text>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isFlowchart && styles.headerFlowchart, isTable && styles.headerTable]}>
        <View style={[styles.typeBadge, isTable && styles.typeBadgeTable]}>
          <Text style={[styles.typeBadgeText, isTable && styles.typeBadgeTextTable]}>
            {isFlowchart ? 'FLOWCHART' : isTable ? 'TABLE COMPLETION' : 'FORM COMPLETION'}
          </Text>
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

          if (isHeader) {
            return (
              <View key={`h-${idx}`} style={styles.sectionHeader}>
                <Text style={[styles.sectionHeaderText, { color: colors.text }]}>
                  {point.text || (point as any).question_text}
                </Text>
              </View>
            );
          }

          return (
            <View key={String(qNum)} style={{ flexDirection: 'row', alignItems: 'flex-start', marginVertical: 4 }}>
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 2.5,
                  backgroundColor: colors.textSecondary,
                  marginTop: 11,
                  marginRight: 8,
                  flexShrink: 0,
                }}
              />
              <View style={{ flex: 1 }}>
                {renderBoxedText(point, idx)}
              </View>
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

  const prevPoints = getFormPoints(prev.group);
  const nextPoints = getFormPoints(next.group);
  
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
