import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';

// ─── Shared types ─────────────────────────────────────────────────────────────
interface LetterOption {
  letter: string;
  text: string;
}
interface IdOption {
  id: string;
  text: string;
}

// type guards
function hasLetterOptions(opts: any[]): opts is LetterOption[] {
  return opts.length > 0 && 'letter' in opts[0];
}

// Resolve display label for an option key
function resolveOption(options: any[], key: string): string {
  if (!key) return '';
  const found = options.find(
    (o: any) => (o.letter || o.id || '').toUpperCase() === key.toUpperCase(),
  );
  return found ? found.text : key;
}

// ─── Option Bank (displayed above question list) ──────────────────────────────
function OptionBank({ options, title }: { options: LetterOption[] | IdOption[]; title: string }) {
  const { colors, isDark } = useTheme();
  const items = hasLetterOptions(options)
    ? options.map((o) => ({ key: o.letter, text: o.text }))
    : (options as IdOption[]).map((o) => ({ key: o.id, text: o.text }));

  // Don't render if all items have empty text (auto-generated letter options)
  // For Matching Information, options A-G are passage paragraphs shown in left pane
  const hasContent = items.some((item) => item.text.trim().length > 0);
  if (!hasContent) return null;

  return (
    <View
      style={[
        ob.container,
        {
          backgroundColor: isDark ? colors.surface : '#EFF6FF',
          borderColor: isDark ? colors.border : '#BFDBFE',
        },
      ]}
    >
      <Text
        style={[
          ob.title,
          { color: colors.primary, borderColor: isDark ? colors.border : '#BFDBFE' },
        ]}
      >
        {title}
      </Text>
      {items.map((item) => (
        <View key={item.key} style={ob.row}>
          <Text style={[ob.letter, { color: colors.primary }]}>{item.key}</Text>
          <Text style={[ob.text, { color: colors.text }]}>{item.text}</Text>
        </View>
      ))}
    </View>
  );
}

const ob = StyleSheet.create({
  container: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    borderBottomWidth: 1,
    paddingBottom: SPACING.xs,
  },
  row: { flexDirection: 'row', gap: SPACING.sm, marginBottom: 6 },
  letter: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    width: 24,
    flexShrink: 0,
  },
  text: { flex: 1, fontSize: FONT_SIZES.sm, lineHeight: 20 },
});

// ─── Single matching row (question text + letter picker) ──────────────────────
function MatchRow({
  qNum,
  text,
  options,
  value,
  onSelect,
}: {
  qNum: number;
  text: string;
  options: any[];
  value: string;
  onSelect: (letter: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const { colors, isDark } = useTheme();
  const keys = hasLetterOptions(options)
    ? options.map((o: LetterOption) => o.letter)
    : (options as IdOption[]).map((o) => o.id);

  const selectedLabel = value ? `${value} · ${resolveOption(options, value)}` : 'Select answer…';

  return (
    <View style={[mr.wrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Question */}
      <View style={mr.questionRow}>
        <View
          style={[
            mr.numBadge,
            {
              backgroundColor: isDark ? colors.surface : '#EFF6FF',
              borderColor: isDark ? colors.border : '#93C5FD',
            },
          ]}
        >
          <Text style={[mr.numText, { color: colors.primary }]}>{qNum}</Text>
        </View>
        <Text style={[mr.questionText, { color: colors.text }]}>{text}</Text>
      </View>

      {/* Picker trigger */}
      <TouchableOpacity
        style={[
          mr.picker,
          { backgroundColor: colors.surface, borderColor: colors.border },
          value && { borderColor: colors.primary, backgroundColor: colors.primary + '0A' },
        ]}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.8}
      >
        <Text
          style={[
            mr.pickerText,
            { color: colors.primary },
            !value && { color: colors.textMuted, fontWeight: '400' },
          ]}
          numberOfLines={1}
        >
          {selectedLabel}
        </Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={value ? colors.primary : colors.textMuted}
        />
      </TouchableOpacity>

      {/* Dropdown options */}
      {open && (
        <View style={[mr.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[mr.dropItem, { borderColor: colors.border + '60' }]}
            onPress={() => {
              onSelect('');
              setOpen(false);
            }}
          >
            <Text style={[mr.dropItemText, { color: colors.text }]}>— Clear</Text>
          </TouchableOpacity>
          {keys.map((k) => {
            const isSelected = value.toUpperCase() === k.toUpperCase();
            return (
              <TouchableOpacity
                key={k}
                style={[
                  mr.dropItem,
                  { borderColor: colors.border + '60' },
                  isSelected && { backgroundColor: colors.primary + '0E' },
                ]}
                onPress={() => {
                  onSelect(k);
                  setOpen(false);
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    mr.dropItemLetter,
                    { color: colors.textSecondary },
                    isSelected && { color: colors.primary },
                  ]}
                >
                  {k}
                </Text>
                <Text
                  style={[
                    mr.dropItemText,
                    { color: colors.text },
                    isSelected && { color: colors.primary, fontWeight: '600' },
                  ]}
                  numberOfLines={2}
                >
                  {resolveOption(options, k)}
                </Text>
                {isSelected && <Ionicons name="checkmark" size={14} color={colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const mr = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.md,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  numBadge: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  numText: { fontSize: 11, fontWeight: '700' },
  questionText: { flex: 1, fontSize: FONT_SIZES.sm, lineHeight: 20 },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  pickerText: { flex: 1, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  dropdown: {
    marginTop: 4,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  dropItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  dropItemLetter: {
    width: 24,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  dropItemText: { flex: 1, fontSize: FONT_SIZES.sm },
});

// ─── Listening `matching` variant (items[] + options[] + answers{}) ───────────
function ListeningMatchingVariant({
  group,
  answers,
  onAnswer,
}: {
  group: any;
  answers: Record<string, string>;
  onAnswer: (k: string, v: string) => void;
}) {
  // items may use question_number (actual data) or id (legacy)
  const rawItems: any[] = group.items || [];
  const items = rawItems
    .map((item: any) => ({
      id: item.question_number ?? item.id,
      text: item.prompt || item.text || '',
    }))
    .filter((item) => item.id != null);

  // options may be:
  //   group.options_box.options  → object { A: "label", B: "label" }  ← actual data
  //   group.options              → array [{ letter, text }]            ← legacy
  const rawOptions = group.options_box?.options ?? group.options_box ?? group.options;
  const options: LetterOption[] =
    rawOptions && !Array.isArray(rawOptions) && typeof rawOptions === 'object'
      ? Object.entries(rawOptions).map(([letter, text]) => ({ letter, text: String(text) }))
      : Array.isArray(rawOptions)
        ? rawOptions
        : [];

  const bankTitle = group.options_box?.title || 'Options Box';

  return (
    <>
      <OptionBank options={options} title={bankTitle} />
      {items.map((item) => (
        <MatchRow
          key={String(item.id)}
          qNum={item.id}
          text={item.text}
          options={options}
          value={answers[String(item.id)] || ''}
          onSelect={(v) => onAnswer(String(item.id), v)}
        />
      ))}
    </>
  );
}

// ─── Reading variants: matching_headings / features / information ─────────────
function StandardMatchingVariant({
  group,
  answers,
  onAnswer,
  bankTitle,
}: {
  group: any;
  answers: Record<string, string>;
  onAnswer: (k: string, v: string) => void;
  bankTitle: string;
}) {
  // Normalise to a consistent shape: { question_number, text }
  const questions: { question_number: number; text: string }[] = (() => {
    if (Array.isArray(group.items)) {
      return group.items.map((item: any) => ({
        question_number: item.question_number,
        text: item.question_text || item.text || '',
      }));
    }
    if (Array.isArray(group.questions)) {
      return group.questions.map((q: any) => ({
        question_number: q.question_number,
        text: q.question_text || q.text || '',
      }));
    }
    return [];
  })();

  // Resolve options — first try explicit, then auto-generate from instructions (mirrors web)
  const options: LetterOption[] = (() => {
    const raw = group.options_box?.options ?? group.options_box ?? group.options;
    if (raw && !Array.isArray(raw) && typeof raw === 'object') {
      return Object.entries(raw).map(([letter, text]) => ({ letter, text: String(text) }));
    }
    if (Array.isArray(raw) && raw.length > 0) return raw as LetterOption[];
    return [];
  })();

  if (options.length === 0) {
    // Auto-generate: scan instructions for a letter range like "A–G" or "A-F"
    const instr: string = group.instructions || group.instruction || '';
    const rangeMatch = instr.match(/([A-Z])\s*[–\-]\s*([A-Z])/i);
    if (rangeMatch) {
      const start = rangeMatch[1].toUpperCase().charCodeAt(0);
      const end = rangeMatch[2].toUpperCase().charCodeAt(0);
      if (start < end && end - start < 26) {
        for (let c = start; c <= end; c++) {
          options.push({ letter: String.fromCharCode(c), text: '' });
        }
      }
    }
  }

  return (
    <>
      {options.length > 0 && <OptionBank options={options} title={bankTitle} />}
      {questions.map((q) => (
        <MatchRow
          key={q.question_number}
          qNum={q.question_number}
          text={q.text}
          options={options}
          value={answers[String(q.question_number)] || ''}
          onSelect={(v) => onAnswer(String(q.question_number), v)}
        />
      ))}
    </>
  );
}

// ─── matching_sentence_endings variant (options[]{id, text}) ─────────────────
function SentenceEndingsVariant({
  group,
  answers,
  onAnswer,
}: {
  group: any;
  answers: Record<string, string>;
  onAnswer: (k: string, v: string) => void;
}) {
  const questions: { question_number: number; text: string; answer: string }[] =
    group.questions || [];
  const options: IdOption[] = group.options || [];

  return (
    <>
      <OptionBank options={options} title="Sentence Endings" />
      {questions.map((q) => (
        <MatchRow
          key={q.question_number}
          qNum={q.question_number}
          text={q.text}
          options={options}
          value={answers[String(q.question_number)] || ''}
          onSelect={(v) => onAnswer(String(q.question_number), v)}
        />
      ))}
    </>
  );
}

// ─── Exported MatchingBlock ───────────────────────────────────────────────────
interface Props {
  group: any;
  answers: Record<string, string>;
  onAnswer: (k: string, v: string) => void;
}

const BANK_TITLES: Record<string, string> = {
  matching_headings: 'List of Headings',
  matching_features: 'List of Researchers / Features',
  matching_information: 'List of Paragraphs',
  matching: 'Options Box',
};

const TYPE_TAGS: Record<string, string> = {
  matching: 'MATCHING',
  matching_headings: 'HEADINGS',
  matching_features: 'FEATURES',
  matching_information: 'INFORMATION',
  matching_sentence_endings: 'SENTENCE ENDINGS',
};

export default function MatchingBlock({ group, answers, onAnswer }: Props) {
  const { colors, isDark } = useTheme();
  // question_type is the actual field (e.g. "Matching"); type is legacy fallback
  const rawType: string = group.question_type || group.type || 'matching';
  const type = rawType.toLowerCase().replace(/\s+/g, '_');
  const instruction: string | undefined = group.instruction || group.description;
  const heading: string | undefined = group.heading;

  const renderVariant = () => {
    if (type === 'matching') {
      return <ListeningMatchingVariant group={group} answers={answers} onAnswer={onAnswer} />;
    }
    if (type === 'matching_sentence_endings') {
      return <SentenceEndingsVariant group={group} answers={answers} onAnswer={onAnswer} />;
    }
    // matching_headings | matching_features | matching_information
    return (
      <StandardMatchingVariant
        group={group}
        answers={answers}
        onAnswer={onAnswer}
        bankTitle={BANK_TITLES[type] || 'Options'}
      />
    );
  };

  const tagColor = '#1D4ED8';

  return (
    <View style={[s.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Header */}
      <View
        style={[s.header, { borderColor: colors.border + '60', backgroundColor: colors.surface }]}
      >
        <View
          style={[
            s.tag,
            {
              backgroundColor: isDark ? colors.surface : '#1D4ED818',
              borderColor: isDark ? colors.border : '#1D4ED840',
            },
          ]}
        >
          <Text style={[s.tagText, { color: isDark ? colors.primary : tagColor }]}>
            {TYPE_TAGS[type] || 'MATCHING'}
          </Text>
        </View>
        {heading ? <Text style={[s.heading, { color: colors.text }]}>{heading}</Text> : null}
      </View>

      {/* Instruction */}
      {instruction ? (
        <View
          style={[
            s.instructionBox,
            { backgroundColor: colors.surface, borderColor: colors.border + '40' },
          ]}
        >
          <Ionicons name="information-circle-outline" size={14} color={colors.textSecondary} />
          <Text style={[s.instructionText, { color: colors.textSecondary }]}>{instruction}</Text>
        </View>
      ) : null}

      {/* Content */}
      <View style={s.body}>{renderVariant()}</View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderBottomWidth: 1,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heading: { flex: 1, fontSize: FONT_SIZES.sm, fontWeight: '700' },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  instructionText: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  body: { padding: SPACING.md },
});
