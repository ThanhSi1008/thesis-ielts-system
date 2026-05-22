import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { FONT_SIZES, RADIUS, SPACING } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeTokens } from '@/constants/theme';

function getExplanationText(exp: any): string {
  if (!exp) return '';
  if (typeof exp === 'string') return exp;
  return exp.rationale || exp.reason || JSON.stringify(exp);
}

function parseLabel(
  label: string,
): ({ type: 'text'; value: string } | { type: 'blank'; qNum: number })[] {
  const segments: ({ type: 'text'; value: string } | { type: 'blank'; qNum: number })[] = [];
  const regex = /\{\{(\d+)\}\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(label)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: label.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'blank', qNum: Number(match[1]) });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < label.length) {
    segments.push({ type: 'text', value: label.slice(lastIndex) });
  }
  return segments;
}

function checkAnswer(q: any, userAns: string): boolean {
  const acceptable: string[] = q.acceptable_answers
    ? q.acceptable_answers.map((a: string) => a.toLowerCase().trim())
    : [q.answer?.toLowerCase().trim() ?? ''];
  return acceptable.includes(userAns.toLowerCase().trim());
}

function LabelLine({
  label,
  qMap,
  answers,
  submitted,
  onAnswer,
  colors,
  isDark,
}: {
  label: string;
  qMap: Record<number, any>;
  answers: Record<string | number, string>;
  submitted: boolean;
  onAnswer: (qNum: number, val: string) => void;
  colors: ThemeTokens;
  isDark: boolean;
}) {
  const segments = parseLabel(label);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 10 }}>
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: '#60A5FA',
          marginTop: 10,
          flexShrink: 0,
        }}
      />
      <View
        style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}
      >
        {segments.map((seg, si) => {
          if (seg.type === 'text') {
            return (
              <Text
                key={si}
                style={{ fontSize: FONT_SIZES.sm, color: colors.text, lineHeight: 26 }}
              >
                {seg.value}
              </Text>
            );
          }

          const qNum = seg.qNum;
          const q = qMap[qNum];
          const userAnswer = String(answers[qNum] ?? '');
          const isCorrect = submitted && q ? checkAnswer(q, userAnswer) : false;

          return (
            <View
              key={si}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: submitted ? (isCorrect ? '#86EFAC' : '#FCA5A5') : colors.border,
                backgroundColor: submitted
                  ? isCorrect
                    ? isDark
                      ? colors.successBg
                      : '#F0FDF4'
                    : isDark
                      ? colors.errorBg
                      : '#FFF5F5'
                  : colors.card,
                borderRadius: RADIUS.sm,
                paddingHorizontal: 6,
                paddingVertical: 3,
                marginHorizontal: 2,
                minWidth: 90,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '700',
                  color: submitted ? (isCorrect ? '#16A34A' : '#DC2626') : colors.textMuted,
                  marginRight: 4,
                }}
              >
                {qNum}
              </Text>

              {submitted ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: isCorrect ? '#15803D' : '#DC2626',
                      textDecorationLine: isCorrect ? 'none' : 'line-through',
                    }}
                  >
                    {userAnswer || '—'}
                  </Text>
                  {!isCorrect && q?.answer && (
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#16A34A' }}>
                      → {q.answer}
                    </Text>
                  )}
                </View>
              ) : (
                <TextInput
                  style={{
                    padding: 0,
                    margin: 0,
                    fontSize: 12,
                    color: colors.text,
                    minWidth: 70,
                    fontWeight: '500',
                  }}
                  value={userAnswer}
                  onChangeText={(v) => onAnswer(qNum, v)}
                  editable={!submitted}
                  placeholder="..."
                  placeholderTextColor={colors.textMuted}
                  autoCorrect={false}
                  spellCheck={false}
                />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function DiagramCompletionGroupView({ group, answers, submitted, onAnswer }: any) {
  const { colors, isDark } = useTheme();
  const [showExplanation, setShowExplanation] = useState<number | null>(null);

  const questions: any[] = group.questions || [];
  const labels: string[] = group.labels || [];
  const qMap: Record<number, any> = Object.fromEntries(
    questions.map((q: any) => [q.question_number, q]),
  );
  const instruction: string = group.instruction || group.instructions || 'Label the diagram below.';
  const diagramTitle: string = group.diagram_title || group.heading || '';
  const imageUrl: string = group.image_url || '';
  const qNums = questions.map((q: any) => q.question_number);

  return (
    <View style={{ marginBottom: 24 }}>
      {qNums.length > 0 && (
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 2 }}>
          Questions {Math.min(...qNums)}–{Math.max(...qNums)}
        </Text>
      )}
      <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 14, lineHeight: 20 }}>
        {instruction}
      </Text>

      {imageUrl ? (
        <View
          style={{
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: RADIUS.lg,
            overflow: 'hidden',
            marginBottom: 14,
            alignItems: 'center',
            padding: 8,
          }}
        >
          <Image
            source={{ uri: imageUrl }}
            style={{ width: '100%', height: 220 }}
            resizeMode="contain"
            accessibilityLabel={diagramTitle || 'Diagram'}
          />
        </View>
      ) : null}

      <View
        style={{
          backgroundColor: isDark ? colors.infoBg : '#EFF6FF',
          borderWidth: 1,
          borderColor: isDark ? colors.border : '#BFDBFE',
          borderRadius: RADIUS.lg,
          padding: SPACING.md,
        }}
      >
        {diagramTitle ? (
          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              color: colors.text,
              marginBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: isDark ? colors.border : '#BFDBFE',
              paddingBottom: 8,
            }}
          >
            {diagramTitle}
          </Text>
        ) : null}

        <Text
          style={{
            fontSize: 11,
            fontWeight: '800',
            color: colors.textMuted,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            marginBottom: 10,
          }}
        >
          Labels
        </Text>

        {labels.map((label, li) => (
          <LabelLine
            key={li}
            label={label}
            qMap={qMap}
            answers={answers}
            submitted={submitted}
            onAnswer={onAnswer}
            colors={colors}
            isDark={isDark}
          />
        ))}

        {labels.length === 0 &&
          questions.map((q: any) => {
            const qNum = q.question_number;
            const val = answers[qNum] ?? '';
            const isCorrect = submitted && checkAnswer(q, val);

            return (
              <View
                key={qNum}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    borderWidth: 1,
                    borderColor: submitted
                      ? isCorrect
                        ? '#86EFAC'
                        : '#FCA5A5'
                      : isDark
                        ? colors.border
                        : '#BFDBFE',
                    backgroundColor: submitted
                      ? isCorrect
                        ? isDark
                          ? colors.successBg
                          : '#DCFCE7'
                        : isDark
                          ? colors.errorBg
                          : '#FEE2E2'
                      : isDark
                        ? colors.infoBg
                        : '#EFF6FF',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '700',
                      color: submitted ? (isCorrect ? '#16A34A' : '#DC2626') : '#1D4ED8',
                    }}
                  >
                    {qNum}
                  </Text>
                </View>

                {q.text ? (
                  <Text
                    style={{
                      fontSize: FONT_SIZES.sm,
                      color: colors.text,
                      fontWeight: '500',
                      flexShrink: 1,
                    }}
                  >
                    {q.text}
                  </Text>
                ) : null}

                <View style={{ flex: 1, minWidth: 120 }}>
                  {submitted ? (
                    <View>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '600',
                          color: isCorrect ? '#15803D' : '#DC2626',
                          textDecorationLine: isCorrect ? 'none' : 'line-through',
                        }}
                      >
                        {val || '—'}
                      </Text>
                      {!isCorrect && q.answer && (
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: '700',
                            color: '#16A34A',
                            marginTop: 2,
                          }}
                        >
                          → {q.answer}
                        </Text>
                      )}
                    </View>
                  ) : (
                    <TextInput
                      style={{
                        borderWidth: 1.5,
                        borderColor: colors.border,
                        borderRadius: RADIUS.sm,
                        paddingHorizontal: 8,
                        paddingVertical: 6,
                        fontSize: 13,
                        color: colors.text,
                        backgroundColor: colors.card,
                      }}
                      value={val}
                      onChangeText={(v) => onAnswer(qNum, v)}
                      editable={!submitted}
                      placeholder="..."
                      placeholderTextColor={colors.textMuted}
                      autoCorrect={false}
                    />
                  )}
                </View>
              </View>
            );
          })}
      </View>

      {submitted && questions.some((q: any) => q.explanation) && (
        <View style={{ marginTop: SPACING.md, gap: 6 }}>
          {questions.map((q: any) =>
            q.explanation ? (
              <View key={q.question_number}>
                <TouchableOpacity
                  onPress={() =>
                    setShowExplanation(
                      showExplanation === q.question_number ? null : q.question_number,
                    )
                  }
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    alignSelf: 'flex-start',
                    backgroundColor: isDark ? colors.surface : '#F3F4F6',
                    borderRadius: RADIUS.sm,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    marginBottom: 4,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textMuted }}>
                    Q{q.question_number}
                  </Text>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textSecondary }}>
                    {showExplanation === q.question_number ? 'Hide' : '💬 Explain'}
                  </Text>
                </TouchableOpacity>
                {showExplanation === q.question_number && (
                  <View
                    style={{
                      backgroundColor: isDark ? colors.infoBg : '#EFF6FF',
                      borderWidth: 1,
                      borderColor: isDark ? colors.border : '#BFDBFE',
                      borderRadius: RADIUS.md,
                      padding: SPACING.md,
                      marginBottom: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        color: isDark ? colors.info : '#1E40AF',
                        lineHeight: 20,
                      }}
                    >
                      {getExplanationText(q.explanation)}
                    </Text>
                  </View>
                )}
              </View>
            ) : null,
          )}
        </View>
      )}
    </View>
  );
}
