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
import { SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';

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
}

// ─── Parse "{{5}} label text" → inline blank + surrounding text ──────────────
function LabelWithBlanks({
  label,
  qMap,
  answers,
  onAnswer,
}: {
  label: string;
  qMap: Record<number, FillQuestion>;
  answers: Record<string, string>;
  onAnswer: (qNum: string, v: string) => void;
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
    segments.push(
      <View
        key={`b-${qNum}`}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.primary,
          borderRadius: RADIUS.sm,
          paddingHorizontal: SPACING.sm,
          marginHorizontal: 2,
          minWidth: 80,
          backgroundColor: isDark ? colors.surface : '#F0F7FF',
        }}
      >
        <Text style={{ fontSize: 10, fontWeight: '700', color: colors.primary, marginRight: 4 }}>
          {qNum}
        </Text>
        <TextInput
          style={{ fontSize: FONT_SIZES.sm, color: colors.text, minWidth: 60, paddingVertical: 2 }}
          value={val}
          onChangeText={(v) => onAnswer(String(qNum), v)}
          placeholder="…"
          placeholderTextColor={colors.textMuted}
        />
      </View>,
    );
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
}: {
  labels: string[];
  items: LabelItem[];
  answers: Record<string, string>;
  onAnswer: (qNum: string, value: string) => void;
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
        return (
          <View
            key={num}
            style={{
              flexDirection: 'row',
              borderBottomWidth: 1,
              borderColor: colors.border + '80',
            }}
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
                  borderColor: colors.primary + '40',
                  backgroundColor: isDark ? colors.surface : '#EFF6FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary }}>
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
                  onPress={() => onAnswer(num, l)}
                  activeOpacity={0.7}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: isSelected ? colors.primary : colors.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: colors.card,
                    }}
                  >
                    {isSelected && (
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: colors.primary,
                        }}
                      />
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
}: {
  questions: { question_number: number; label_context?: string; answer?: string }[];
  answers: Record<string, string>;
  onAnswer: (qNum: string, v: string) => void;
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
        return (
          <View key={num} style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
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
              style={{
                flex: 1,
                borderBottomWidth: 2,
                borderColor: colors.primary,
                fontSize: FONT_SIZES.sm,
                color: colors.text,
                paddingVertical: 4,
                paddingHorizontal: SPACING.sm,
                backgroundColor: colors.card,
                minWidth: 80,
              }}
              value={answers[num] || ''}
              onChangeText={(v) => onAnswer(num, v)}
              placeholder="Answer…"
              placeholderTextColor={colors.textMuted}
            />
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

// ─── Main exported component ──────────────────────────────────────────────────
export default function DiagramMapBlock({ group, answers, onAnswer }: Props) {
  const { colors, isDark } = useTheme();
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
                <LabelWithBlanks label={label} qMap={qMap} answers={answers} onAnswer={onAnswer} />
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
          />
        </View>
      )}

      {/* ── map_labelling: fill-text variant ── */}
      {hasFillList && !hasRadioGrid && group.questions && (
        <View style={{ padding: SPACING.md }}>
          <FillList questions={group.questions as any} answers={answers} onAnswer={onAnswer} />
        </View>
      )}
    </View>
  );
}
