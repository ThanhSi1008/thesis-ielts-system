import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';

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
  const items = hasLetterOptions(options)
    ? options.map((o) => ({ key: o.letter, text: o.text }))
    : (options as IdOption[]).map((o) => ({ key: o.id, text: o.text }));

  // Don't render if all items have empty text (auto-generated letter options)
  // For Matching Information, options A-G are passage paragraphs shown in left pane
  const hasContent = items.some((item) => item.text.trim().length > 0);
  if (!hasContent) return null;

  return (
    <View style={ob.container}>
      <Text style={ob.title}>{title}</Text>
      {items.map((item) => (
        <View key={item.key} style={ob.row}>
          <Text style={ob.letter}>{item.key}</Text>
          <Text style={ob.text}>{item.text}</Text>
        </View>
      ))}
    </View>
  );
}

const ob = StyleSheet.create({
  container: {
    backgroundColor: '#EFF6FF',
    borderRadius: RADIUS.lg,
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
  row: { flexDirection: 'row', gap: SPACING.sm, marginBottom: 6 },
  letter: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: '#1D4ED8',
    width: 24,
    flexShrink: 0,
  },
  text: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
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
  const keys = hasLetterOptions(options)
    ? options.map((o: LetterOption) => o.letter)
    : (options as IdOption[]).map((o) => o.id);

  const selectedLabel = value ? `${value} · ${resolveOption(options, value)}` : 'Select answer…';

  return (
    <View style={mr.wrapper}>
      {/* Question */}
      <View style={mr.questionRow}>
        <View style={mr.numBadge}>
          <Text style={mr.numText}>{qNum}</Text>
        </View>
        <Text style={mr.questionText}>{text}</Text>
      </View>

      {/* Picker trigger */}
      <TouchableOpacity
        style={[mr.picker, value && mr.pickerFilled]}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.8}
      >
        <Text style={[mr.pickerText, !value && mr.pickerPlaceholder]} numberOfLines={1}>
          {selectedLabel}
        </Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={value ? COLORS.primary : COLORS.textMuted}
        />
      </TouchableOpacity>

      {/* Dropdown options */}
      {open && (
        <View style={mr.dropdown}>
          <TouchableOpacity
            style={mr.dropItem}
            onPress={() => {
              onSelect('');
              setOpen(false);
            }}
          >
            <Text style={mr.dropItemText}>— Clear</Text>
          </TouchableOpacity>
          {keys.map((k) => {
            const isSelected = value.toUpperCase() === k.toUpperCase();
            return (
              <TouchableOpacity
                key={k}
                style={[mr.dropItem, isSelected && mr.dropItemActive]}
                onPress={() => {
                  onSelect(k);
                  setOpen(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={[mr.dropItemLetter, isSelected && mr.dropItemLetterActive]}>{k}</Text>
                <Text
                  style={[mr.dropItemText, isSelected && mr.dropItemTextActive]}
                  numberOfLines={2}
                >
                  {resolveOption(options, k)}
                </Text>
                {isSelected && <Ionicons name="checkmark" size={14} color={COLORS.primary} />}
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
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    borderColor: '#93C5FD',
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  numText: { fontSize: 11, fontWeight: '700', color: '#1D4ED8' },
  questionText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  pickerFilled: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '0A' },
  pickerText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: '600' },
  pickerPlaceholder: { color: COLORS.textMuted, fontWeight: '400' },
  dropdown: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: '#fff',
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
    borderColor: COLORS.border + '60',
  },
  dropItemActive: { backgroundColor: COLORS.primary + '0E' },
  dropItemLetter: {
    width: 24,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  dropItemLetterActive: { color: COLORS.primary },
  dropItemText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text },
  dropItemTextActive: { color: COLORS.primary, fontWeight: '600' },
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
// Data shapes:
//   Shape A (Listening): group.questions[] with {question_number, text}
//   Shape B (Reading):   group.items[]    with {question_number, question_text}
//   group.questions may also be a string range like "14-17" — never map it
//
// Options may come from:
//   group.options_box.options → { A: "Paragraph A label", ... }
//   group.options → [{ letter, text }]
//   OR auto-generated from instructions ("Choose ONE letter, A–G") — web exam-parser.ts logic
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

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.tag}>
          <Text style={s.tagText}>{TYPE_TAGS[type] || 'MATCHING'}</Text>
        </View>
        {heading ? <Text style={s.heading}>{heading}</Text> : null}
      </View>

      {/* Instruction */}
      {instruction ? (
        <View style={s.instructionBox}>
          <Ionicons name="information-circle-outline" size={14} color={COLORS.textSecondary} />
          <Text style={s.instructionText}>{instruction}</Text>
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
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    backgroundColor: '#1D4ED818',
    borderWidth: 1,
    borderColor: '#1D4ED840',
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#1D4ED8',
    textTransform: 'uppercase',
  },
  heading: { flex: 1, fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderColor: COLORS.border + '40',
  },
  instructionText: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  body: { padding: SPACING.md },
});
