import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '@/constants';

function getExplanationText(exp: any): string {
  if (!exp) return '';
  if (typeof exp === 'string') return exp;
  return exp.rationale || exp.reason || JSON.stringify(exp);
}

function checkAnswer(q: any, userAns: string): boolean {
  const acceptable: string[] = q.acceptable_answers
    ? q.acceptable_answers.map((a: string) => a.toLowerCase().trim())
    : [q.answer?.toLowerCase().trim() ?? ''];
  return acceptable.includes(userAns.toLowerCase().trim());
}

// Parse "Parrotfish enter the ocean as {{3}}." → text + blank segments
function parseStageText(
  text: string
): Array<{ type: 'text'; value: string } | { type: 'blank'; qNum: number }> {
  const segments: Array<{ type: 'text'; value: string } | { type: 'blank'; qNum: number }> = [];
  const regex = /\{\{(\d+)\}\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'blank', qNum: Number(match[1]) });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }
  return segments;
}

// Render one stage box — text may contain {{qNum}} inline inputs
function StageBox({
  stage,
  qMap,
  answers,
  submitted,
  onAnswer,
}: {
  stage: any;
  qMap: Record<number, any>;
  answers: Record<string | number, string>;
  submitted: boolean;
  onAnswer: (qNum: number, val: string) => void;
}) {
  const segments = parseStageText(stage.text || '');
  const hasBlank = segments.some((s) => s.type === 'blank');

  return (
    <View
      style={{
        width: '100%',
        borderWidth: hasBlank ? 1.5 : 1,
        borderColor: hasBlank ? '#9CA3AF' : '#D1D5DB',
        backgroundColor: hasBlank ? '#fff' : '#F9FAFB',
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.md,
        paddingVertical: 12,
        alignItems: 'center',
      }}
    >
      {/* Stage name label */}
      {stage.stage_name ? (
        <Text
          style={{
            fontSize: 10,
            fontWeight: '800',
            color: '#9CA3AF',
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            marginBottom: 6,
          }}
        >
          {stage.stage_name}
        </Text>
      ) : null}

      {/* Stage text with inline blanks */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        {segments.map((seg, si) => {
          if (seg.type === 'text') {
            return (
              <Text key={si} style={{ fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 26, textAlign: 'center' }}>
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
                borderColor: submitted
                  ? isCorrect ? '#86EFAC' : '#FCA5A5'
                  : '#9CA3AF',
                backgroundColor: submitted
                  ? isCorrect ? '#F0FDF4' : '#FFF5F5'
                  : '#fff',
                borderRadius: RADIUS.sm,
                paddingHorizontal: 6,
                paddingVertical: 3,
                marginHorizontal: 2,
                minWidth: 90,
              }}
            >
              {/* Question number badge */}
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '700',
                  color: submitted ? (isCorrect ? '#16A34A' : '#DC2626') : '#9CA3AF',
                  marginRight: 4,
                }}
              >
                {qNum}
              </Text>

              {submitted ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
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
                    color: COLORS.text,
                    minWidth: 70,
                    fontWeight: '500',
                    textAlign: 'center',
                  }}
                  value={userAnswer}
                  onChangeText={(v) => onAnswer(qNum, v)}
                  editable={!submitted}
                  placeholder="..."
                  placeholderTextColor={COLORS.textMuted}
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

// Arrow connector between stages
function ArrowDown() {
  return (
    <View style={{ alignItems: 'center', marginVertical: 4 }}>
      {/* Vertical line */}
      <View style={{ width: 2, height: 14, backgroundColor: '#9CA3AF' }} />
      {/* Arrowhead: CSS triangle using borders */}
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 6,
          borderRightWidth: 6,
          borderTopWidth: 8,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: '#9CA3AF',
          marginTop: -1,
        }}
      />
    </View>
  );
}

export function ReadingFlowchartGroupView({
  group,
  answers,
  submitted,
  onAnswer,
}: any) {
  const [showExplanation, setShowExplanation] = useState<number | null>(null);

  const questions: any[] = group.questions || [];
  const stages: any[] = group.stages || [];
  const qMap: Record<number, any> = Object.fromEntries(
    questions.map((q: any) => [q.question_number, q])
  );
  const instruction: string = group.instruction || group.instructions || 'Complete the flow-chart below.';
  const flowchartTitle: string = group.flowchart_title || group.heading || '';
  const qNums = questions.map((q: any) => q.question_number);

  return (
    <View style={{ marginBottom: 24 }}>
      {/* Header */}
      {qNums.length > 0 && (
        <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 2 }}>
          Questions {Math.min(...qNums)}–{Math.max(...qNums)}
        </Text>
      )}
      <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 14, lineHeight: 20 }}>
        {instruction}
      </Text>

      {/* Flowchart box */}
      <View
        style={{
          borderWidth: 1,
          borderColor: '#D1D5DB',
          borderRadius: RADIUS.lg,
          overflow: 'hidden',
        }}
      >
        {/* Title bar */}
        {flowchartTitle ? (
          <View
            style={{
              backgroundColor: '#F3F4F6',
              borderBottomWidth: 1,
              borderBottomColor: '#E5E7EB',
              paddingHorizontal: SPACING.md,
              paddingVertical: 10,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.text }}>
              {flowchartTitle}
            </Text>
          </View>
        ) : null}

        {/* Stages column */}
        <View style={{ paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, alignItems: 'center' }}>
          {stages.map((stage, si) => (
            <View key={si} style={{ width: '100%', alignItems: 'center' }}>
              <StageBox
                stage={stage}
                qMap={qMap}
                answers={answers}
                submitted={submitted}
                onAnswer={onAnswer}
              />
              {si < stages.length - 1 && <ArrowDown />}
            </View>
          ))}
        </View>
      </View>

      {/* Explanations after submit */}
      {submitted && questions.some((q: any) => q.explanation) && (
        <View style={{ marginTop: SPACING.md, gap: 6 }}>
          {questions.map((q: any) =>
            q.explanation ? (
              <View key={q.question_number}>
                <TouchableOpacity
                  onPress={() =>
                    setShowExplanation(
                      showExplanation === q.question_number ? null : q.question_number
                    )
                  }
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    alignSelf: 'flex-start',
                    backgroundColor: '#F3F4F6',
                    borderRadius: RADIUS.sm,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    marginBottom: 4,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#6B7280' }}>
                    Q{q.question_number}
                  </Text>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#4B5563' }}>
                    {showExplanation === q.question_number ? 'Hide' : '💬 Explain'}
                  </Text>
                </TouchableOpacity>
                {showExplanation === q.question_number && (
                  <View
                    style={{
                      backgroundColor: '#EFF6FF',
                      borderWidth: 1,
                      borderColor: '#BFDBFE',
                      borderRadius: RADIUS.md,
                      padding: SPACING.md,
                      marginBottom: 4,
                    }}
                  >
                    <Text style={{ fontSize: 13, color: '#1E40AF', lineHeight: 20 }}>
                      {getExplanationText(q.explanation)}
                    </Text>
                  </View>
                )}
              </View>
            ) : null
          )}
        </View>
      )}
    </View>
  );
}
