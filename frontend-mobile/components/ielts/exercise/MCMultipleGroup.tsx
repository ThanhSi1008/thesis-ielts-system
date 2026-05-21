import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES } from '@/constants';
import { styles } from './styles';
import { ExplanationView } from './ExplanationView';

export function MCMultipleGroup({ group, gi, answers, submitted, onAnswer }: any) {
  const ansKey = `mcm-${gi}`;
  const raw = String(answers[ansKey] ?? '');
  const selectedLetters = raw ? raw.split(',') : [];
  const numCorrect = group.answers?.length || 2;

  const toggleAnswer = (letter: string) => {
    if (submitted) return;
    let newArr = [...selectedLetters];
    if (newArr.includes(letter)) {
      newArr = newArr.filter((l) => l !== letter);
    } else {
      if (newArr.length < numCorrect) {
        newArr.push(letter);
      }
    }
    onAnswer(ansKey, newArr.join(','));
  };

  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={styles.groupType}>{group.type.replace(/_/g, ' ')}</Text>
      {group.instructions && (
        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>{group.instructions}</Text>
        </View>
      )}

      <View style={styles.qBlock}>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {group.question_numbers?.map((n: number) => (
              <View key={n} style={styles.qNumBadge}>
                <Text style={styles.qNumBadgeText}>{n}</Text>
              </View>
            ))}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: FONT_SIZES.md, fontWeight: '600' }}>{group.text}</Text>
          </View>
        </View>
        <Text style={{ fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginBottom: 12 }}>
          Choose {numCorrect} letters
        </Text>

        {(group.options || []).map((opt: any) => {
          const isSelected = selectedLetters.includes(opt.letter);
          const isCorrect = (group.answers || [])
            .map((a: string) => a.toUpperCase())
            .includes(opt.letter.toUpperCase());
          let bg: string = '#fff',
            border: string = COLORS.border,
            textColor: string = COLORS.text;
          if (submitted && isCorrect) {
            bg = '#DCFCE7';
            border = '#86EFAC';
            textColor = '#16A34A';
          } else if (submitted && isSelected && !isCorrect) {
            bg = '#FEE2E2';
            border = '#FCA5A5';
            textColor = '#DC2626';
          } else if (!submitted && isSelected) {
            bg = '#EFF6FF';
            border = '#3B82F6';
            textColor = '#1D4ED8';
          }

          return (
            <TouchableOpacity
              key={opt.letter}
              style={[styles.mcmOptionBtn, { backgroundColor: bg, borderColor: border }]}
              onPress={() => toggleAnswer(opt.letter)}
              activeOpacity={submitted ? 1 : 0.8}
            >
              <View
                style={[
                  styles.mcmCheckbox,
                  isSelected &&
                    !submitted && { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
                  submitted && isCorrect && { backgroundColor: '#16A34A', borderColor: '#16A34A' },
                ]}
              >
                {(isSelected || (submitted && isCorrect)) && (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                )}
              </View>
              <Text style={{ fontWeight: '700', marginRight: 4, color: textColor }}>
                {opt.letter}.
              </Text>
              <Text style={[styles.mcmOptionText, { color: textColor }]}>{opt.text}</Text>
            </TouchableOpacity>
          );
        })}
        {submitted && group.explanation && (
          <ExplanationView explanation={group.explanation} isCorrect={true} />
        )}
      </View>
    </View>
  );
}
