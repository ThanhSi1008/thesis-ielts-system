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
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
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
        <Text key={`t-${lastIndex}`} style={[lbStyles.text, { color: colors.text }]}>
          {label.slice(lastIndex, match.index)}
        </Text>,
      );
    }
    const qNum = Number(match[1]);
    const val = answers[String(qNum)] || '';
    segments.push(
      <View key={`b-${qNum}`} style={[lbStyles.blank, { borderColor: colors.primary, backgroundColor: isDark ? colors.surface : '#F0F7FF' }]}>
        <Text style={[lbStyles.blankNum, { color: colors.primary }]}>{qNum}</Text>
        <TextInput
          style={[lbStyles.blankInput, { color: colors.text }]}
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
      <Text key="t-end" style={[lbStyles.text, { color: colors.text }]}>
        {label.slice(lastIndex)}
      </Text>,
    );
  }

  return <View style={lbStyles.row}>{segments}</View>;
}

const lbStyles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: SPACING.sm },
  text: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 22 },
  blank: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    marginHorizontal: 2,
    minWidth: 80,
    backgroundColor: '#F0F7FF',
  },
  blankNum: { fontSize: 10, fontWeight: '700', color: COLORS.primary, marginRight: 4 },
  blankInput: { fontSize: FONT_SIZES.sm, color: COLORS.text, minWidth: 60, paddingVertical: 2 },
});

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
    <View style={[rgStyles.container, { borderColor: colors.border, backgroundColor: colors.card }]}>
      {/* Header row */}
      <View style={[rgStyles.headerRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={rgStyles.labelCell} />
        {labels.map((l) => (
          <View key={l} style={[rgStyles.radioCell, { borderColor: colors.border + '60' }]}>
            <Text style={[rgStyles.headerLabel, { color: colors.text }]}>{l}</Text>
          </View>
        ))}
      </View>

      {items.map((item) => {
        const num = String(item.question_number);
        const selected = answers[num] || '';
        return (
          <View key={num} style={[rgStyles.row, { borderColor: colors.border + '80' }]}>
            {/* Question number (+ optional text) */}
            <View style={rgStyles.labelCell}>
              <View style={[rgStyles.numBadge, { borderColor: colors.primary + '40', backgroundColor: isDark ? colors.surface : '#EFF6FF' }]}>
                <Text style={[rgStyles.numText, { color: colors.primary }]}>{item.question_number}</Text>
              </View>
              {item.text ? (
                <Text style={[rgStyles.itemText, { color: colors.text }]} numberOfLines={2}>
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
                  style={[rgStyles.radioCell, { borderColor: colors.border + '60' }]}
                  onPress={() => onAnswer(num, l)}
                  activeOpacity={0.7}
                >
                  <View style={[rgStyles.radio, { borderColor: colors.border, backgroundColor: colors.card }, isSelected && { borderColor: colors.primary }]}>
                    {isSelected && <View style={[rgStyles.radioDot, { backgroundColor: colors.primary }]} />}
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

const rgStyles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderColor: COLORS.border + '80' },
  labelCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  radioCell: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
    borderLeftWidth: 1,
    borderColor: COLORS.border + '60',
  },
  headerLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  numBadge: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#93C5FD',
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: { fontSize: 11, fontWeight: '700', color: '#1D4ED8' },
  itemText: { flex: 1, fontSize: FONT_SIZES.xs, color: COLORS.text },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  radioSelected: { borderColor: COLORS.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
});

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
    <View style={[flStyles.container, { backgroundColor: isDark ? colors.surface : '#EFF6FF', borderColor: isDark ? colors.border : '#BFDBFE' }]}>
      {questions.map((q) => {
        const num = String(q.question_number);
        return (
          <View key={num} style={flStyles.row}>
            <View style={[flStyles.numBadge, { borderColor: isDark ? colors.border : '#93C5FD', backgroundColor: colors.card }]}>
              <Text style={[flStyles.numText, { color: colors.primary }]}>{q.question_number}</Text>
            </View>
            {q.label_context ? <Text style={[flStyles.context, { color: colors.text }]}>{q.label_context}</Text> : null}
            <TextInput
              style={[flStyles.input, { borderColor: colors.primary, color: colors.text, backgroundColor: colors.card }]}
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

const flStyles = StyleSheet.create({
  container: {
    backgroundColor: '#EFF6FF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: SPACING.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  numBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#93C5FD',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  numText: { fontSize: 11, fontWeight: '700', color: '#1D4ED8' },
  context: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '500', flexShrink: 1 },
  input: {
    flex: 1,
    borderBottomWidth: 2,
    borderColor: '#1D4ED8',
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    backgroundColor: '#fff',
    minWidth: 80,
  },
});

// ─── Options bank (for diagram_labelling) ────────────────────────────────────
function OptionsBank({ options }: { options: OptionItem[] }) {
  const { colors, isDark } = useTheme();
  return (
    <View style={[obStyles.container, { backgroundColor: isDark ? colors.surface : '#EFF6FF', borderColor: isDark ? colors.border : '#BFDBFE' }]}>
      <Text style={[obStyles.title, { color: colors.primary, borderColor: isDark ? colors.border : '#BFDBFE' }]}>Options Box</Text>
      <View style={obStyles.grid}>
        {options.map((opt) => (
          <View key={opt.letter} style={obStyles.item}>
            <Text style={[obStyles.letter, { color: colors.primary }]}>{opt.letter}</Text>
            <Text style={[obStyles.optText, { color: colors.text }]}>{opt.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const obStyles = StyleSheet.create({
  container: {
    backgroundColor: '#EFF6FF',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: '#1E3A8A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderColor: '#BFDBFE',
    paddingBottom: SPACING.xs,
  },
  grid: { gap: SPACING.sm },
  item: { flexDirection: 'row', gap: SPACING.sm },
  letter: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#1D4ED8', width: 18 },
  optText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text },
});

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
    <View style={[s.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Header */}
      <View style={[s.header, { borderColor: colors.border + '60', backgroundColor: colors.surface }]}>
        <View
          style={[s.typeTag, { backgroundColor: tagColor + '18', borderColor: tagColor + '40' }]}
        >
          <Text style={[s.typeTagText, { color: tagColor }]}>{typeTag}</Text>
        </View>
        {title ? <Text style={[s.heading, { color: colors.text }]}>{title}</Text> : null}
      </View>

      {/* Instruction */}
      {group.instruction && <Text style={[s.instruction, { color: colors.textSecondary }]}>{group.instruction}</Text>}

      {/* Image */}
      {group.image_url ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.imageScroll}>
          <Image source={{ uri: group.image_url }} style={s.image} resizeMode="contain" />
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
        <View style={[s.labelsBox, { backgroundColor: isDark ? colors.surface : '#EFF6FF', borderColor: isDark ? colors.border : '#BFDBFE' }]}>
          <Text style={[s.labelsTitle, { color: colors.primary, borderColor: isDark ? colors.border : '#BFDBFE' }]}>Labels</Text>
          {group.labels.map((label, li) => {
            const qMap = Object.fromEntries(group.questions!.map((q) => [q.question_number, q]));
            return (
              <View key={li} style={s.labelRow}>
                <View style={[s.bullet, { backgroundColor: colors.primary + '80' }]} />
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


const s = StyleSheet.create({
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
    borderBottomWidth: 1,
    borderColor: COLORS.border + '60',
    backgroundColor: COLORS.surface,
  },
  typeTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.sm, borderWidth: 1 },
  typeTagText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  heading: { flex: 1, fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  instruction: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    lineHeight: 20,
  },
  imageScroll: { maxHeight: 260, marginVertical: SPACING.md },
  image: { width: 340, height: 240, marginHorizontal: SPACING.md },
  labelsBox: {
    margin: SPACING.md,
    backgroundColor: '#EFF6FF',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  labelsTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: '#1E3A8A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderColor: '#BFDBFE',
    paddingBottom: SPACING.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#60A5FA',
    marginTop: 8,
    flexShrink: 0,
  },
});
