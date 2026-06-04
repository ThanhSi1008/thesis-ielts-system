import React from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';
import { isCorrect } from '@/utils/answerNormalization';

// ─── Types (mirrored from web) ────────────────────────────────────────────────
interface OptionItem {
  letter: string;
  text: string;
}
interface LabelItem {
  question_number: number;
  answer: string;
  text?: string;
  label_context?: string;
}
interface FillQuestion {
  question_number: number;
  answer: string;
  acceptable_answers?: string[];
  label_context?: string;
}

interface Group {
  type: 'diagram_labelling' | 'diagram_completion' | 'map_labelling' | 'plan_labelling';
  heading?: string;
  image_url?: string;
  // diagram_labelling / map_labelling (radio-grid variant)
  options?: OptionItem[];
  items?: LabelItem[];
  // diagram_completion (fill-in-label variant)
  labels?: string[];
  questions?: FillQuestion[];
  // misc
  instruction?: string;
  diagram_title?: string;
}

interface Props {
  group: Group;
  answers: Record<string, string>;
  onAnswer: (qNum: string, value: string) => void;
  mode?: 'edit' | 'review';
  correctAnswers?: Record<string, string>;
}

// ─── Parse "{{5}} label text" → inline blank + surrounding text ──────────────
function LabelWithBlanks({
  label,
  qMap,
  answers,
  onAnswer,
  mode = 'edit',
  correctAnswers,
}: {
  label: string;
  qMap: Record<number, FillQuestion>;
  answers: Record<string, string>;
  onAnswer: (qNum: string, v: string) => void;
  mode?: 'edit' | 'review';
  correctAnswers?: Record<string, string>;
}) {
  const { colors, isDark } = useTheme();
  const regex = /\{\{(\d+)\}\}/g;
  const segments: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(label)) !== null) {
    if (match.index > lastIndex) {
      segments.push(
        <Text
          key={`t-${lastIndex}`}
          style={{ fontSize: FONT_SIZES.sm, color: colors.text, lineHeight: 22 }}
        >
          {label.slice(lastIndex, match.index)}
        </Text>,
      );
    }
    const qNum = Number(match[1]);
    const val = answers[String(qNum)] || '';
    const correctVal = correctAnswers?.[String(qNum)] ?? qMap[qNum]?.answer ?? (qMap[qNum]?.acceptable_answers && qMap[qNum]?.acceptable_answers[0]) ?? '';
    const isCorrectAns = mode === 'review' ? isCorrect(val, correctVal) : false;

    let containerStyle: any = null;
    let textStyle: any = null;

    if (mode === 'review') {
      if (val) {
        if (isCorrectAns) {
          containerStyle = { borderColor: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.08)' };
          textStyle = { color: '#16a34a' };
        } else {
          containerStyle = { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.08)' };
          textStyle = { color: '#ef4444' };
        }
      } else {
        containerStyle = { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.03)', borderStyle: 'dashed' };
        textStyle = { color: '#ef4444' };
      }
    }

    segments.push(
      <View
        key={`b-${qNum}`}
        style={[{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.primary,
          borderRadius: RADIUS.sm,
          paddingHorizontal: SPACING.sm,
          marginHorizontal: 2,
          minWidth: 80,
          backgroundColor: isDark ? colors.surface : '#F0F7FF',
        }, containerStyle]}
      >
        <Text style={[{ fontSize: 10, fontWeight: '700', color: colors.primary, marginRight: 4 }, textStyle]}>
          {qNum}
        </Text>
        <TextInput
          style={[{ fontSize: FONT_SIZES.sm, color: colors.text, minWidth: 60, paddingVertical: 2 }, textStyle]}
          value={val}
          onChangeText={(v) => onAnswer(String(qNum), v)}
          placeholder="…"
          placeholderTextColor={colors.textMuted}
          editable={mode !== 'review'}
        />
        {mode === 'review' && (
          <Ionicons
            name={isCorrectAns ? 'checkmark' : 'close'}
            size={12}
            color={isCorrectAns ? '#22c55e' : '#ef4444'}
            style={{ marginLeft: 2 }}
          />
        )}
      </View>,
    );

    if (mode === 'review' && !isCorrectAns) {
      segments.push(
        <View
          key={`correct-${qNum}`}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#22c55e',
            borderRadius: RADIUS.sm,
            paddingHorizontal: SPACING.xs,
            marginHorizontal: 2,
            backgroundColor: 'rgba(34, 197, 94, 0.08)',
          }}
        >
          <Ionicons name="bulb-outline" size={10} color="#16a34a" style={{ marginRight: 2 }} />
          <Text style={{ fontSize: 11, fontWeight: '800', color: '#16a34a' }}>{correctVal}</Text>
        </View>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < label.length) {
    segments.push(
      <Text key="t-end" style={{ fontSize: FONT_SIZES.sm, color: colors.text, lineHeight: 22 }}>
        {label.slice(lastIndex)}
      </Text>,
    );
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginBottom: SPACING.sm,
      }}
    >
      {segments}
    </View>
  );
}

// ─── Radio-grid table (diagram_labelling & map_labelling with items+options) ──
function RadioGrid({
  labels,
  items,
  answers,
  onAnswer,
  mode = 'edit',
  correctAnswers,
}: {
  labels: string[];
  items: LabelItem[];
  answers: Record<string, string>;
  onAnswer: (qNum: string, value: string) => void;
  mode?: 'edit' | 'review';
  correctAnswers?: Record<string, string>;
}) {
  const { colors, isDark } = useTheme();
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: RADIUS.md,
        overflow: 'hidden',
        backgroundColor: colors.card,
      }}
    >
      {/* Header row */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            padding: SPACING.sm,
            gap: SPACING.sm,
          }}
        />
        {labels.map((l) => (
          <View
            key={l}
            style={{
              width: 44,
              alignItems: 'center',
              justifyContent: 'center',
              padding: SPACING.sm,
              borderLeftWidth: 1,
              borderColor: colors.border + '60',
            }}
          >
            <Text style={{ fontSize: FONT_SIZES.sm, fontWeight: '700', color: colors.text }}>
              {l}
            </Text>
          </View>
        ))}
      </View>

      {items.map((item) => {
        const num = String(item.question_number);
        const selected = answers[num] || '';
        const correctVal = correctAnswers?.[num] ?? item.answer ?? '';
        const isCorrectAns = mode === 'review' ? isCorrect(selected, correctVal) : false;

        let rowStyle: any = null;
        if (mode === 'review') {
          if (isCorrectAns) {
            rowStyle = { backgroundColor: 'rgba(34, 197, 94, 0.02)' };
          } else {
            rowStyle = { backgroundColor: 'rgba(239, 68, 68, 0.02)' };
          }
        }

        return (
          <View
            key={num}
            style={[{
              flexDirection: 'row',
              borderBottomWidth: 1,
              borderColor: colors.border + '80',
            }, rowStyle]}
          >
            {/* Question number (+ optional text) */}
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                padding: SPACING.sm,
                gap: SPACING.sm,
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: isCorrectAns && mode === 'review' ? '#22c55e40' : (mode === 'review' ? '#ef444440' : colors.primary + '40'),
                  backgroundColor: isCorrectAns && mode === 'review' ? 'rgba(34, 197, 94, 0.08)' : (mode === 'review' ? 'rgba(239, 68, 68, 0.08)' : (isDark ? colors.surface : '#EFF6FF')),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: isCorrectAns && mode === 'review' ? '#16a34a' : (mode === 'review' ? '#ef4444' : colors.primary) }}>
                  {item.question_number}
                </Text>
              </View>
              {item.text ? (
                <Text
                  style={{ flex: 1, fontSize: FONT_SIZES.xs, color: colors.text }}
                  numberOfLines={2}
                >
                  {item.text}
                </Text>
              ) : null}
            </View>

            {/* Radio options */}
            {labels.map((l) => {
              const isSelected = selected.toUpperCase() === l.toUpperCase();
              const isActualCorrect = correctVal.toUpperCase() === l.toUpperCase();

              let radioCircleStyle: any = null;
              let radioInnerStyle: any = null;

              if (mode === 'review') {
                if (isSelected) {
                  if (isActualCorrect) {
                    radioCircleStyle = { borderColor: '#22c55e' };
                    radioInnerStyle = { backgroundColor: '#22c55e' };
                  } else {
                    radioCircleStyle = { borderColor: '#ef4444' };
                    radioInnerStyle = { backgroundColor: '#ef4444' };
                  }
                } else if (isActualCorrect) {
                  radioCircleStyle = { borderColor: '#22c55e', borderStyle: 'dashed' };
                }
              } else {
                if (isSelected) {
                  radioCircleStyle = { borderColor: colors.primary };
                  radioInnerStyle = { backgroundColor: colors.primary };
                } else {
                  radioCircleStyle = { borderColor: colors.border };
                }
              }

              return (
                <TouchableOpacity
                  key={l}
                  style={{
                    width: 44,
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: SPACING.sm,
                    borderLeftWidth: 1,
                    borderColor: colors.border + '60',
                  }}
                  onPress={() => {
                    if (mode === 'review') return;
                    onAnswer(num, l);
                  }}
                  activeOpacity={mode === 'review' ? 1 : 0.7}
                >
                  <View
                    style={[{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: colors.card,
                    }, radioCircleStyle]}
                  >
                    {isSelected && (
                      <View
                        style={[{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                        }, radioInnerStyle]}
                      />
                    )}
                    {mode === 'review' && isActualCorrect && !isSelected && (
                      <Ionicons name="checkmark" size={10} color="#22c55e" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

// ─── Text-input list (map_labelling with questions + label_context) ───────────
function FillList({
  questions,
  answers,
  onAnswer,
  mode = 'edit',
  correctAnswers,
}: {
  questions: { question_number: number; label_context?: string; answer?: string }[];
  answers: Record<string, string>;
  onAnswer: (qNum: string, v: string) => void;
  mode?: 'edit' | 'review';
  correctAnswers?: Record<string, string>;
}) {
  const { colors, isDark } = useTheme();
  return (
    <View
      style={{
        backgroundColor: isDark ? colors.surface : '#EFF6FF',
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: isDark ? colors.border : '#BFDBFE',
        gap: SPACING.md,
      }}
    >
      {questions.map((q) => {
        const num = String(q.question_number);
        const val = answers[num] || '';
        const correctVal = correctAnswers?.[num] ?? q.answer ?? '';
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
          <View key={num} style={{ gap: 4 }}>
            <View style={[{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.sm, borderRadius: RADIUS.md }, rowStyle]}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: isDark ? colors.border : '#93C5FD',
                  backgroundColor: colors.card,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary }}>
                  {q.question_number}
                </Text>
              </View>
              {q.label_context ? (
                <Text
                  style={{
                    fontSize: FONT_SIZES.sm,
                    color: colors.text,
                    fontWeight: '500',
                    flexShrink: 1,
                  }}
                >
                  {q.label_context}
                </Text>
              ) : null}
              <TextInput
                style={[{
                  flex: 1,
                  borderBottomWidth: 2,
                  borderColor: colors.primary,
                  fontSize: FONT_SIZES.sm,
                  color: colors.text,
                  paddingVertical: 4,
                  paddingHorizontal: SPACING.sm,
                  backgroundColor: colors.card,
                  minWidth: 80,
                }, inputStyle]}
                value={val}
                onChangeText={(v) => onAnswer(num, v)}
                placeholder="Answer…"
                placeholderTextColor={colors.textMuted}
                editable={mode !== 'review'}
              />
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
  );
}

// ─── Options bank (for diagram_labelling) ────────────────────────────────────
function OptionsBank({ options }: { options: OptionItem[] }) {
  const { colors, isDark } = useTheme();
  return (
    <View
      style={{
        backgroundColor: isDark ? colors.surface : '#EFF6FF',
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: isDark ? colors.border : '#BFDBFE',
        marginBottom: SPACING.md,
      }}
    >
      <Text
        style={{
          fontSize: FONT_SIZES.xs,
          fontWeight: '700',
          color: colors.primary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: SPACING.sm,
          borderBottomWidth: 1,
          borderColor: isDark ? colors.border : '#BFDBFE',
          paddingBottom: SPACING.xs,
        }}
      >
        Options Box
      </Text>
      <View style={{ gap: SPACING.sm }}>
        {options.map((opt) => (
          <View key={opt.letter} style={{ flexDirection: 'row', gap: SPACING.sm }}>
            <Text
              style={{
                fontSize: FONT_SIZES.sm,
                fontWeight: '700',
                color: colors.primary,
                width: 18,
              }}
            >
              {opt.letter}
            </Text>
            <Text style={{ flex: 1, fontSize: FONT_SIZES.sm, color: colors.text }}>{opt.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Normalise the flat AI / admin-import group into the native render shape ──
// The extraction → commit pipeline emits visual groups as a flat `items[]`
// (each `{ question_number, question_text, answer, options? }`) plus a STRING
// `questions` range label. The render variants below instead expect native
// arrays: `labels` + `items[].text` (radio grid), `labels` with `{{n}}` markers
// + `questions[]` (diagram completion), or `questions[].label_context` (fill).
// Native seed groups already provide those arrays and pass through untouched.
function adaptVisualGroup(group: Group): Group {
  const rawItems: any[] = Array.isArray((group as any).items) ? (group as any).items : [];
  const hasNativeLabels = Array.isArray(group.labels) && group.labels.length > 0;
  const hasNativeQuestions = Array.isArray(group.questions) && group.questions.length > 0;
  const isAiShape =
    rawItems.length > 0 &&
    !hasNativeLabels &&
    !hasNativeQuestions &&
    rawItems.some((it) => typeof it?.question_text === 'string');
  if (!isAiShape) return group;

  // The commit service stamps `instructions` (plural); the renderer reads `instruction`.
  const instruction = (group as any).instruction ?? (group as any).instructions;
  // A lettered bank lives either on a group-level options_box or on each item's
  // `options` record ({ A: "...", B: "..." }) produced from the AI options array.
  const optionRecord =
    (group as any).options_box?.options ??
    rawItems.find((it) => it?.options && typeof it.options === 'object' && !Array.isArray(it.options))?.options ??
    null;
  const bankLetters: string[] = optionRecord ? Object.keys(optionRecord) : [];

  if (group.type === 'diagram_completion') {
    // Each "The ___ valve" becomes a label "The {{5}} valve" with an inline blank.
    const labels: string[] = [];
    const questions: FillQuestion[] = [];
    for (const it of rawItems) {
      const qn = Number(it.question_number);
      if (!Number.isFinite(qn)) continue;
      const text = String(it.question_text ?? '').trim() || `Label ${qn}`;
      labels.push(text.includes('___') ? text.replace('___', `{{${qn}}}`) : `${text} {{${qn}}}`);
      questions.push({ question_number: qn, answer: String(it.answer ?? '') });
    }
    return { ...group, instruction, labels, questions } as Group;
  }

  if (group.type === 'diagram_labelling') {
    // Options bank + radio grid: build OptionItem[] from the lettered bank.
    const options: OptionItem[] = bankLetters.map((letter) => ({
      letter,
      text: String(optionRecord?.[letter] ?? '').trim(),
    }));
    const items: LabelItem[] = rawItems
      .filter((it) => Number.isFinite(Number(it.question_number)))
      .map((it) => ({
        question_number: Number(it.question_number),
        answer: String(it.answer ?? ''),
        text: String(it.question_text ?? '').trim() || undefined,
      }));
    return { ...group, instruction, options, items } as Group;
  }

  // map_labelling / plan_labelling
  const hasOptionTexts = bankLetters.length > 0 && bankLetters.some(letter => {
    const val = optionRecord?.[letter];
    return typeof val === 'string' && val.trim().length > 0;
  });

  if (bankLetters.length > 0 && hasOptionTexts) {
    // Radio grid: each row is located against the lettered bank; answer is a letter.
    const items: LabelItem[] = rawItems
      .filter((it) => Number.isFinite(Number(it.question_number)))
      .map((it) => ({
        question_number: Number(it.question_number),
        answer: String(it.answer ?? ''),
        text: String(it.question_text ?? '').trim() || undefined,
      }));
    return { ...group, instruction, labels: bankLetters, items } as Group;
  }

  // Fill-text variant: type the place name; the prompt text becomes label_context.
  const questions: FillQuestion[] = rawItems
    .filter((it) => Number.isFinite(Number(it.question_number)))
    .map((it) => ({
      question_number: Number(it.question_number),
      answer: String(it.answer ?? ''),
      label_context: String(it.question_text ?? '').trim() || undefined,
    }));
  return { ...group, instruction, questions } as Group;
}

// ─── Main exported component ──────────────────────────────────────────────────
function DiagramMapBlockComponent({
  group: rawGroup,
  answers,
  onAnswer,
  mode = 'edit',
  correctAnswers,
}: Props) {
  const { colors, isDark } = useTheme();
  const group = React.useMemo(() => adaptVisualGroup(rawGroup), [rawGroup]);
  const isDiagramLabelling = group.type === 'diagram_labelling';
  const isMapLabelling = group.type === 'map_labelling' || group.type === 'plan_labelling';
  const isDiagramCompletion = group.type === 'diagram_completion';

  // Detect which sub-variant of map_labelling
  const hasRadioGrid = isMapLabelling && !!group.labels?.length && !!group.items?.length;
  const hasFillList = isMapLabelling && !!group.questions?.length;

  const title =
    group.heading ||
    group.diagram_title ||
    (isDiagramCompletion
      ? 'Diagram Completion'
      : isDiagramLabelling
        ? 'Diagram Labelling'
        : 'Map Labelling');

  const typeTag = isDiagramCompletion ? 'DIAGRAM' : isDiagramLabelling ? 'DIAGRAM' : 'MAP';
  const tagColor = isDiagramCompletion ? '#059669' : isDiagramLabelling ? '#2563EB' : '#D97706';

  return (
    <View
      style={{
        marginBottom: SPACING.xl,
        backgroundColor: colors.card,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: SPACING.sm,
          padding: SPACING.md,
          borderBottomWidth: 1,
          borderColor: colors.border + '60',
          backgroundColor: colors.surface,
        }}
      >
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: RADIUS.sm,
            borderWidth: 1,
            backgroundColor: tagColor + '18',
            borderColor: tagColor + '40',
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: '800',
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              color: tagColor,
            }}
          >
            {typeTag}
          </Text>
        </View>
        {title ? (
          <Text style={{ flex: 1, fontSize: FONT_SIZES.sm, fontWeight: '700', color: colors.text }}>
            {title}
          </Text>
        ) : null}
      </View>

      {/* Instruction */}
      {group.instruction && (
        <Text
          style={{
            fontSize: FONT_SIZES.sm,
            color: colors.textSecondary,
            fontStyle: 'italic',
            marginHorizontal: SPACING.md,
            marginTop: SPACING.sm,
            lineHeight: 20,
          }}
        >
          {group.instruction}
        </Text>
      )}

      {/* Image */}
      {group.image_url ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ maxHeight: 260, marginVertical: SPACING.md }}
        >
          <Image
            source={{ uri: group.image_url }}
            style={{ width: 340, height: 240, marginHorizontal: SPACING.md }}
            resizeMode="contain"
          />
        </ScrollView>
      ) : null}

      {/* ── diagram_labelling: options bank + radio grid ── */}
      {isDiagramLabelling && group.options && group.items && (
        <View style={{ padding: SPACING.md }}>
          <OptionsBank options={group.options} />
          <RadioGrid
            labels={group.options.map((o) => o.letter)}
            items={group.items}
            answers={answers}
            onAnswer={onAnswer}
            mode={mode}
            correctAnswers={correctAnswers}
          />
        </View>
      )}

      {/* ── diagram_completion: labels with inline blanks ── */}
      {isDiagramCompletion && group.labels && group.questions && (
        <View
          style={{
            margin: SPACING.md,
            backgroundColor: isDark ? colors.surface : '#EFF6FF',
            borderRadius: RADIUS.md,
            padding: SPACING.md,
            borderWidth: 1,
            borderColor: isDark ? colors.border : '#BFDBFE',
          }}
        >
          <Text
            style={{
              fontSize: FONT_SIZES.xs,
              fontWeight: '700',
              color: colors.primary,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              marginBottom: SPACING.md,
              borderBottomWidth: 1,
              borderColor: isDark ? colors.border : '#BFDBFE',
              paddingBottom: SPACING.xs,
            }}
          >
            Labels
          </Text>
          {group.labels.map((label, li) => {
            const qMap = Object.fromEntries(group.questions!.map((q) => [q.question_number, q]));
            return (
              <View
                key={li}
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: SPACING.sm,
                  marginBottom: SPACING.sm,
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: colors.primary + '80',
                    marginTop: 8,
                    flexShrink: 0,
                  }}
                />
                <LabelWithBlanks
                  label={label}
                  qMap={qMap}
                  answers={answers}
                  onAnswer={onAnswer}
                  mode={mode}
                  correctAnswers={correctAnswers}
                />
              </View>
            );
          })}
        </View>
      )}

      {/* ── map_labelling: radio grid variant ── */}
      {hasRadioGrid && group.labels && group.items && (
        <View style={{ padding: SPACING.md }}>
          <RadioGrid
            labels={group.labels}
            items={group.items}
            answers={answers}
            onAnswer={onAnswer}
            mode={mode}
            correctAnswers={correctAnswers}
          />
        </View>
      )}

      {/* ── map_labelling: fill-text variant ── */}
      {hasFillList && !hasRadioGrid && group.questions && (
        <View style={{ padding: SPACING.md }}>
          <FillList
            questions={group.questions as any}
            answers={answers}
            onAnswer={onAnswer}
            mode={mode}
            correctAnswers={correctAnswers}
          />
        </View>
      )}
    </View>
  );
}

function getDiagramQuestionNumbers(group: Group): number[] {
  const nums: number[] = [];
  if (Array.isArray(group.items)) {
    group.items.forEach((item) => {
      if (item.question_number) nums.push(item.question_number);
    });
  }
  if (Array.isArray(group.questions)) {
    group.questions.forEach((q) => {
      if (q.question_number) nums.push(q.question_number);
    });
  }
  return nums;
}

export default React.memo(DiagramMapBlockComponent, (prev, next) => {
  if (prev.mode !== next.mode) return false;
  if (prev.group !== next.group) return false;

  const prevQNums = getDiagramQuestionNumbers(prev.group);
  for (const qNum of prevQNums) {
    const key = String(qNum);
    if (prev.answers[key] !== next.answers[key]) return false;
    if (prev.correctAnswers?.[key] !== next.correctAnswers?.[key]) return false;
  }

  return true;
});
