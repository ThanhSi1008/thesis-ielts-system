import React from 'react';
import { View, Text, TextInput, Image, TouchableOpacity } from 'react-native';
import { FONT_SIZES, RADIUS } from '@/constants';
import { createExerciseStyles } from './styles';
import { ExplanationView } from './ExplanationView';
import { useTheme } from '@/contexts/ThemeContext';

export function MapLabellingGroupView({ group, answers, submitted, onAnswer }: any) {
  const { colors, isDark } = useTheme();
  const styles = createExerciseStyles(colors);
  const qs = group.items || group.questions || [];
  const rawOptions = group.options || [];
  const labels = group.labels || rawOptions.map((o: any) => o.letter) || [];

  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={styles.groupType}>{group.type.replace(/_/g, ' ')}</Text>
      {(group.instructions || group.heading) && (
        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>{group.instructions || group.heading}</Text>
        </View>
      )}

      {group.image_url && (
        <View
          style={{
            alignItems: 'center',
            marginBottom: 16,
            backgroundColor: colors.card,
            padding: 8,
            borderRadius: RADIUS.md,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Image
            source={{ uri: group.image_url }}
            style={{ width: '100%', height: 250 }}
            resizeMode="contain"
          />
        </View>
      )}

      {rawOptions.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.textMuted, marginTop: 4 }}>
            OPTIONS:
          </Text>
          {rawOptions.map((opt: any) => (
            <View
              key={opt.letter}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: RADIUS.md,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              <Text style={{ fontWeight: 'bold', marginRight: 4, color: colors.text }}>{opt.letter}</Text>
              <Text style={{ color: colors.textMuted }}>· {opt.text}</Text>
            </View>
          ))}
        </View>
      )}

      {labels.length > 0 ? (
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: RADIUS.md,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
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
            <View style={{ flex: 2, padding: 12, borderRightWidth: 1, borderRightColor: colors.border }}>
              <Text style={{ fontWeight: 'bold', color: colors.text }}>Question</Text>
            </View>
            <View style={{ flex: 3, padding: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Text style={{ fontWeight: 'bold', width: '100%', color: colors.text }}>Options</Text>
            </View>
          </View>
          {qs.map((q: any, idx: number) => {
            const qNum = q.question_number;
            const sel = answers[qNum] ?? '';
            const isCorrect = submitted && sel.toUpperCase() === (q.answer || '').toUpperCase();

            return (
              <View
                key={qNum}
                style={{
                  borderBottomWidth: idx === qs.length - 1 ? 0 : 1,
                  borderBottomColor: colors.border,
                  padding: 12,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View style={styles.qNumBadge}>
                    <Text style={styles.qNumBadgeText}>{qNum}</Text>
                  </View>
                  <Text style={{ flex: 1, marginLeft: 8, fontSize: FONT_SIZES.sm, color: colors.text }}>{q.text}</Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {labels.map((lbl: string) => {
                    const isSelected = sel.toUpperCase() === lbl.toUpperCase();
                    const isActualAnswer = (q.answer || '').toUpperCase() === lbl.toUpperCase();

                    let bg: string = colors.card;
                    let borderColor: string = colors.border;
                    let textColor: string = colors.text;

                    if (submitted && isActualAnswer) {
                      bg = isDark ? colors.successBg : '#DCFCE7';
                      borderColor = '#86EFAC';
                      textColor = '#16A34A';
                    } else if (submitted && isSelected && !isCorrect) {
                      bg = isDark ? colors.errorBg : '#FEE2E2';
                      borderColor = '#FCA5A5';
                      textColor = '#DC2626';
                    } else if (!submitted && isSelected) {
                      bg = isDark ? colors.infoBg : '#EFF6FF';
                      borderColor = '#3B82F6';
                      textColor = '#1D4ED8';
                    }

                    return (
                      <TouchableOpacity
                        key={lbl}
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 12,
                          borderRadius: RADIUS.md,
                          borderWidth: 1,
                          backgroundColor: bg,
                          borderColor,
                        }}
                        onPress={() => !submitted && onAnswer(qNum, lbl)}
                      >
                        <Text
                          style={{
                            fontSize: FONT_SIZES.sm,
                            color: textColor,
                            fontWeight: isSelected ? '700' : '500',
                          }}
                        >
                          {lbl}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {submitted && q.explanation && (
                  <ExplanationView explanation={q.explanation} isCorrect={isCorrect} />
                )}
              </View>
            );
          })}
        </View>
      ) : (
        <View
          style={{
            backgroundColor: isDark ? colors.infoBg : '#F0F9FF',
            padding: 16,
            borderRadius: RADIUS.md,
            borderWidth: 1,
            borderColor: isDark ? colors.border : '#BAE6FD',
          }}
        >
          {qs.map((q: any) => {
            const qNum = q.question_number;
            const val = answers[qNum] ?? '';
            const correctArr = (q.acceptable_answers ?? [q.answer ?? '']).map((a: string) =>
              a.toLowerCase().trim(),
            );
            const isCorrect = submitted && correctArr.includes(val.trim().toLowerCase());

            return (
              <View
                key={qNum}
                style={{
                  marginBottom: 16,
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                }}
              >
                <View style={styles.qNumBadge}>
                  <Text style={styles.qNumBadgeText}>{qNum}</Text>
                </View>
                <Text
                  style={{
                    marginLeft: 8,
                    marginTop: 4,
                    marginRight: 8,
                    fontSize: FONT_SIZES.sm,
                    fontWeight: '600',
                    color: colors.text,
                  }}
                >
                  {q.label_context || q.text}
                </Text>

                <View style={{ flex: 1, minWidth: 150 }}>
                  <TextInput
                    style={[
                      styles.input,
                      { paddingVertical: 6, paddingHorizontal: 10, minHeight: 36, marginTop: 0 },
                      submitted && isCorrect && {
                        borderColor: '#86EFAC',
                        backgroundColor: isDark ? colors.successBg : '#DCFCE7',
                        color: '#16A34A',
                      },
                      submitted && !isCorrect && {
                        borderColor: '#FCA5A5',
                        backgroundColor: isDark ? colors.errorBg : '#FEE2E2',
                        color: '#DC2626',
                      },
                    ]}
                    value={val}
                    onChangeText={(v) => !submitted && onAnswer(qNum, v)}
                    editable={!submitted}
                    placeholder="Your answer"
                    placeholderTextColor={colors.textMuted}
                  />
                  {submitted && !isCorrect && (
                    <Text style={{ fontSize: FONT_SIZES.xs, color: '#16A34A', fontWeight: 'bold', marginTop: 4 }}>
                      → {q.answer}
                    </Text>
                  )}
                  {submitted && q.explanation && (
                    <ExplanationView explanation={q.explanation} isCorrect={isCorrect} />
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
