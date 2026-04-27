import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '@/constants';

// Web: NoteEntry = string | { subheading: string; points: string[] }
type NoteEntry = string | { subheading: string; points: string[] };

function getExplanationText(exp: any): string {
  if (!exp) return '';
  if (typeof exp === 'string') return exp;
  return exp.rationale || exp.reason || JSON.stringify(exp);
}

// Parse "Some text {{12}} more text" into segments
function parseNote(note: string): Array<{ type: 'text'; value: string } | { type: 'blank'; qNum: number }> {
  const segments: Array<{ type: 'text'; value: string } | { type: 'blank'; qNum: number }> = [];
  const regex = /\{\{(\d+)\}\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(note)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: note.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'blank', qNum: Number(match[1]) });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < note.length) {
    segments.push({ type: 'text', value: note.slice(lastIndex) });
  }
  return segments;
}

// Inline blank input inside a note line
function NoteLine({
  note,
  qMap,
  answers,
  submitted,
  onAnswer,
}: {
  note: string;
  qMap: Record<number, any>;
  answers: Record<string | number, string>;
  submitted: boolean;
  onAnswer: (qNum: number, val: string) => void;
}) {
  const segments = parseNote(note);
  const hasBlank = segments.some((s) => s.type === 'blank');

  if (!hasBlank) {
    // Plain text line — render as bullet point
    return (
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
        <View
          style={{
            width: 5, height: 5, borderRadius: 3,
            backgroundColor: COLORS.textMuted,
            marginTop: 9, flexShrink: 0,
          }}
        />
        <Text style={{ flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 24 }}>
          {note}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
      <View
        style={{
          width: 5, height: 5, borderRadius: 3,
          backgroundColor: COLORS.textMuted,
          marginTop: 9, flexShrink: 0,
        }}
      />
      {/* Flex wrap of text + inline inputs */}
      <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
        {segments.map((seg, si) => {
          if (seg.type === 'text') {
            return (
              <Text key={si} style={{ fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 24 }}>
                {seg.value}
              </Text>
            );
          }

          const qNum = seg.qNum;
          const q = qMap[qNum];
          const userAnswer = String(answers[qNum] ?? '');
          const acceptable = q?.acceptable_answers
            ? q.acceptable_answers.map((a: string) => a.toLowerCase().trim())
            : [q?.answer?.toLowerCase().trim() ?? ''];
          const isCorrect = submitted && acceptable.includes(userAnswer.toLowerCase().trim());

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
              {/* Question number badge inside blank */}
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: isCorrect ? '#15803D' : '#DC2626',
                      textDecorationLine: isCorrect ? 'none' : 'line-through',
                    }}
                  >
                    {userAnswer || '—'}
                  </Text>
                  {!isCorrect && q?.answer && (
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#16A34A' }}>
                      ({q.answer})
                    </Text>
                  )}
                </View>
              ) : (
                <TextInput
                  style={{
                    padding: 0,
                    margin: 0,
                    fontSize: 13,
                    color: COLORS.text,
                    minWidth: 70,
                    fontWeight: '500',
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

export function NoteCompletionGroupView({
  group,
  answers,
  submitted,
  onAnswer,
}: any) {
  const [showExplanation, setShowExplanation] = useState<number | null>(null);

  const questions: any[] = group.questions || [];
  const notes: NoteEntry[] = group.notes || [];
  const qMap: Record<number, any> = Object.fromEntries(
    questions.map((q: any) => [q.question_number, q])
  );

  const instruction: string =
    group.instruction || group.instructions || 'Complete the notes below.';
  const noteTitle: string = group.note_title || group.heading || '';
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

      {/* Note box */}
      <View
        style={{
          borderWidth: 1,
          borderColor: '#E5E7EB',
          borderRadius: RADIUS.lg,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        {/* Note title bar */}
        {noteTitle ? (
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
              {noteTitle}
            </Text>
          </View>
        ) : null}

        {/* Notes content */}
        <View style={{ backgroundColor: '#fff', padding: SPACING.lg }}>
          {notes.length > 0 ? (
            notes.map((entry, ni) => {
              // Grouped format: { subheading, points[] }
              if (typeof entry === 'object' && 'points' in entry) {
                return (
                  <View key={ni} style={{ marginBottom: 14 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '600',
                        color: COLORS.textSecondary,
                        fontStyle: 'italic',
                        marginBottom: 8,
                      }}
                    >
                      {entry.subheading}
                    </Text>
                    <View style={{ paddingLeft: 4 }}>
                      {entry.points.map((point, pi) => (
                        <NoteLine
                          key={pi}
                          note={point}
                          qMap={qMap}
                          answers={answers}
                          submitted={submitted}
                          onAnswer={onAnswer}
                        />
                      ))}
                    </View>
                  </View>
                );
              }

              // Flat format: plain string with {{qNum}} placeholders
              return (
                <NoteLine
                  key={ni}
                  note={entry as string}
                  qMap={qMap}
                  answers={answers}
                  submitted={submitted}
                  onAnswer={onAnswer}
                />
              );
            })
          ) : (
            // Fallback: render from group.points (Listening note format)
            (group.points || []).map((point: any, idx: number) => {
              const isHeader = !point.question_number;
              if (isHeader) {
                return (
                  <Text
                    key={idx}
                    style={{ fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 8 }}
                  >
                    {point.text}
                  </Text>
                );
              }
              return (
                <NoteLine
                  key={idx}
                  note={point.text || ''}
                  qMap={qMap}
                  answers={answers}
                  submitted={submitted}
                  onAnswer={onAnswer}
                />
              );
            })
          )}
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
