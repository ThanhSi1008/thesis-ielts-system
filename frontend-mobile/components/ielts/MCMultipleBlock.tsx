import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';

interface Option {
  letter: string;
  text: string;
}

interface Props {
  group: {
    text?: string;
    instructions?: string;
    question_numbers?: number[];
    options?: Option[];
    answers?: string[]; // correct answer letters (used for scoring; not shown during practice)
  };
  groupIdx: number; // index in content array — used to build the 'mcm-{idx}' answer key
  answer: string; // current value: comma-separated selected letters, e.g. "A,C"
  onAnswer: (key: string, value: string) => void;
}

export default function MCMultipleBlock({ group, groupIdx, answer, onAnswer }: Props) {
  const ansKey = `mcm-${groupIdx}`;
  const selectedLetters: string[] = answer ? answer.split(',').filter(Boolean) : [];
  const numRequired = group.answers?.length ?? 2;
  const options: Option[] = group.options ?? [];
  const qNums: number[] = group.question_numbers ?? [];

  const toggle = (letter: string) => {
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
          <Ionicons name="information-circle-outline" size={14} color={COLORS.textSecondary} />
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
        return (
          <TouchableOpacity
            key={opt.letter}
            style={[
              styles.option,
              selected && styles.optionSelected,
              disabled && styles.optionDisabled,
            ]}
            onPress={() => toggle(opt.letter)}
            activeOpacity={disabled ? 1 : 0.8}
          >
            <View style={[styles.checkbox, selected && styles.checkboxFilled]}>
              {selected && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text style={[styles.letter, selected && styles.letterSelected]}>{opt.letter}.</Text>
            <Text
              style={[
                styles.optText,
                selected && styles.optTextSelected,
                disabled && styles.optTextDisabled,
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
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: '#EFF6FF',
    borderBottomWidth: 1,
    borderColor: '#BFDBFE',
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
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#93C5FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qNumText: { fontSize: 11, fontWeight: '700', color: '#1D4ED8' },

  qText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '600',
    lineHeight: 22,
    padding: SPACING.md,
    paddingBottom: 0,
  },
  instrBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  instrText: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.border,
    borderWidth: 1,
    borderColor: COLORS.textMuted,
  },
  progressDotFilled: { backgroundColor: '#3B82F6', borderColor: '#2563EB' },
  progressText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginLeft: 4 },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  optionSelected: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  optionDisabled: { opacity: 0.45 },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxFilled: { backgroundColor: '#3B82F6', borderColor: '#2563EB' },

  letter: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textSecondary, width: 18 },
  letterSelected: { color: '#1D4ED8' },
  optText: { flex: 1, fontSize: FONT_SIZES.md, color: COLORS.text, lineHeight: 20 },
  optTextSelected: { color: '#1D4ED8', fontWeight: '500' },
  optTextDisabled: { color: COLORS.textMuted },
});
