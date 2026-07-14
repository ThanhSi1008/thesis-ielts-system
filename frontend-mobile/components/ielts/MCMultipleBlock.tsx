import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';

interface Option {
  letter: string;
  text: string;
}

interface Props {
  group: {
    text?: string;
    instructions?: string;
    question_numbers?: number[];
    options?: any;
    answers?: string[]; // correct answer letters (used for scoring; not shown during practice)
    items?: any[];
    [key: string]: any;
  };
  groupIdx: number; // index in content array — used to build the 'mcm-{idx}' answer key
  answer: string; // current value: comma-separated selected letters, e.g. "A,C"
  onAnswer: (key: string, value: string) => void;
  mode?: 'edit' | 'review';
  correctAnswers?: Record<string, string>;
}

function MCMultipleBlockComponent({
  group,
  groupIdx,
  answer,
  onAnswer,
  mode = 'edit',
  correctAnswers,
}: Props) {
  const { colors, isDark } = useTheme();
  const ansKey = `mcm-${groupIdx}`;
  const selectedLetters: string[] = answer ? answer.split(',').filter(Boolean) : [];

  const item = (group.items && group.items[0]) || group;
  const qNums: number[] = item.question_numbers || group.question_numbers || [];
  const rawOptions = item.options || group.options || [];
  const correctLetters = (group.answers || item.answers || [])
    .map((s: any) => String(s).trim().toUpperCase());
  const numRequired = correctLetters.length || qNums.length || 2;

  const options: Option[] = Array.isArray(rawOptions)
    ? rawOptions.map((opt: any, i: number) => {
        if (opt && typeof opt === 'object') {
          return {
            letter: opt.letter || opt.val || String.fromCharCode(65 + i),
            text: opt.text || opt.label || String(opt),
          };
        }
        return {
          letter: String.fromCharCode(65 + i),
          text: String(opt),
        };
      })
    : Object.entries(rawOptions).map(([letter, text]) => ({
        letter,
        text: String(text),
      }));

  const toggle = (letter: string) => {
    if (mode === 'review') return;
    let next = [...selectedLetters];
    if (next.includes(letter)) {
      next = next.filter((l) => l !== letter);
    } else {
      if (next.length < numRequired) {
        next.push(letter);
      }
    }
    onAnswer(ansKey, next.join(','));
  };

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
      gap: SPACING.sm,
      padding: SPACING.md,
      backgroundColor: isDark ? '#0c1a3d' : '#EFF6FF',
      borderBottomWidth: 1,
      borderColor: isDark ? '#1e3a8a' : '#BFDBFE',
    },
    typeBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: RADIUS.sm,
      backgroundColor: '#1D4ED818',
      borderWidth: 1,
      borderColor: '#1D4ED840',
    },
    typeBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.8,
      color: '#1D4ED8',
      textTransform: 'uppercase',
    },
    qNumRow: { flexDirection: 'row', gap: 4 },
    qNumBadge: {
      width: 22,
      height: 22,
      borderRadius: 5,
      backgroundColor: isDark ? '#1e3a8a' : '#DBEAFE',
      borderWidth: 1,
      borderColor: isDark ? '#3b82f6' : '#93C5FD',
      alignItems: 'center',
      justifyContent: 'center',
    },
    qNumText: { fontSize: 11, fontWeight: '700', color: '#1D4ED8' },

    qText: {
      fontSize: FONT_SIZES.md,
      color: colors.text,
      fontWeight: '600',
      lineHeight: 22,
      padding: SPACING.md,
      paddingBottom: 0,
    },
    instrBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 6,
      backgroundColor: colors.surface,
      marginHorizontal: SPACING.md,
      marginTop: SPACING.sm,
      borderRadius: RADIUS.md,
      padding: SPACING.sm,
    },
    instrText: {
      flex: 1,
      fontSize: FONT_SIZES.xs,
      color: colors.textSecondary,
      lineHeight: 18,
      fontStyle: 'italic',
    },
    hint: {
      fontSize: FONT_SIZES.xs,
      color: '#1D4ED8',
      fontWeight: '600',
      paddingHorizontal: SPACING.md,
      paddingTop: SPACING.sm,
    },

    progressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
    },
    progressDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.border,
      borderWidth: 1,
      borderColor: colors.textMuted,
    },
    progressDotFilled: { backgroundColor: '#3B82F6', borderColor: '#2563EB' },
    progressText: { fontSize: FONT_SIZES.xs, color: colors.textSecondary, marginLeft: 4 },

    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      marginHorizontal: SPACING.md,
      marginBottom: SPACING.sm,
      borderRadius: RADIUS.lg,
      borderWidth: 1.5,
      borderColor: colors.border,
      padding: SPACING.md,
      backgroundColor: colors.surface,
    },
    optionSelected: {
      borderColor: '#3B82F6',
      backgroundColor: isDark ? '#0c1a3d' : '#EFF6FF',
    },
    optionDisabled: { opacity: 0.45 },

    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 5,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    checkboxFilled: { backgroundColor: '#3B82F6', borderColor: '#2563EB' },

    letter: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: colors.textSecondary, width: 18 },
    letterSelected: { color: '#1D4ED8' },
    optText: { flex: 1, fontSize: FONT_SIZES.md, color: colors.text, lineHeight: 20 },
    optTextSelected: { color: '#1D4ED8', fontWeight: '500' },
    optTextDisabled: { color: colors.textMuted },
  });

  return (
    <View style={styles.container}>
      {/* Header badge row */}
      <View style={styles.header}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>MULTIPLE ANSWER</Text>
        </View>
        <View style={styles.qNumRow}>
          {qNums.map((n) => (
            <View key={n} style={styles.qNumBadge}>
              <Text style={styles.qNumText}>{n}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Question text */}
      {group.text ? <Text style={styles.qText}>{group.text}</Text> : null}

      {/* Instructions */}
      {group.instructions ? (
        <View style={styles.instrBox}>
          <Ionicons name="information-circle-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.instrText}>{group.instructions}</Text>
        </View>
      ) : (
        <Text style={styles.hint}>
          Choose {numRequired} answer{numRequired !== 1 ? 's' : ''}
        </Text>
      )}

      {/* Progress indicator */}
      <View style={styles.progressRow}>
        {Array.from({ length: numRequired }).map((_, i) => (
          <View
            key={i}
            style={[styles.progressDot, selectedLetters.length > i && styles.progressDotFilled]}
          />
        ))}
        <Text style={styles.progressText}>
          {selectedLetters.length} / {numRequired} selected
        </Text>
      </View>

      {/* Options */}
      {options.map((opt) => {
        const selected = selectedLetters.includes(opt.letter);
        const disabled = !selected && selectedLetters.length >= numRequired;

        const isCorrectOpt = correctLetters.includes(opt.letter.toUpperCase());

        let optionStyle: any = null;
        let checkboxStyle: any = null;
        let checkboxIcon: string = 'checkmark';

        if (mode === 'review') {
          if (selected) {
            if (isCorrectOpt) {
              optionStyle = { borderColor: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.08)' };
              checkboxStyle = { backgroundColor: '#22c55e', borderColor: '#22c55e' };
            } else {
              optionStyle = { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.08)' };
              checkboxStyle = { backgroundColor: '#ef4444', borderColor: '#ef4444' };
              checkboxIcon = 'close';
            }
          } else {
            if (isCorrectOpt) {
              optionStyle = {
                borderColor: '#22c55e',
                borderStyle: 'dashed',
                backgroundColor: 'rgba(34, 197, 94, 0.03)',
              };
              checkboxStyle = { borderColor: '#22c55e', backgroundColor: 'transparent' };
            }
          }
        }

        return (
          <TouchableOpacity
            key={opt.letter}
            style={[
              styles.option,
              selected && styles.optionSelected,
              disabled && styles.optionDisabled,
              optionStyle,
            ]}
            onPress={() => toggle(opt.letter)}
            activeOpacity={mode === 'review' || disabled ? 1 : 0.8}
          >
            <View style={[styles.checkbox, selected && styles.checkboxFilled, checkboxStyle]}>
              {(selected || (mode === 'review' && isCorrectOpt)) && (
                <Ionicons
                  name={checkboxIcon as any}
                  size={14}
                  color={mode === 'review' && isCorrectOpt && !selected ? '#22c55e' : '#fff'}
                />
              )}
            </View>
            <Text
              style={[
                styles.letter,
                selected && styles.letterSelected,
                mode === 'review' && isCorrectOpt && { color: '#16a34a' },
              ]}
            >
              {opt.letter}.
            </Text>
            <Text
              style={[
                styles.optText,
                selected && styles.optTextSelected,
                disabled && styles.optTextDisabled,
                mode === 'review' && isCorrectOpt && { color: '#16a34a', fontWeight: '600' },
              ]}
            >
              {opt.text}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default React.memo(MCMultipleBlockComponent, (prev, next) => {
  return (
    prev.answer === next.answer &&
    prev.mode === next.mode &&
    prev.groupIdx === next.groupIdx &&
    prev.group === next.group
  );
});
