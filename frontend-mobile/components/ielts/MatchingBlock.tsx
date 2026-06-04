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

import { isCorrect } from '@/utils/answerNormalization';

// ─── Single matching row (question text + letter picker) ──────────────────────
function MatchRow({
  qNum,
  text,
  options,
  value,
  onSelect,
  mode = 'edit',
  correctVal,
}: {
  qNum: number;
  text: string;
  options: any[];
  value: string;
  onSelect: (letter: string) => void;
  mode?: 'edit' | 'review';
  correctVal?: string;
}) {
  const [open, setOpen] = useState(false);
  const { colors, isDark } = useTheme();
  const keys = hasLetterOptions(options)
    ? options.map((o: LetterOption) => o.letter)
    : (options as IdOption[]).map((o) => o.id);

  const selectedLabel = value ? `${value} · ${resolveOption(options, value)}` : 'Select answer…';
  const isCorrectAns = mode === 'review' ? isCorrect(value, correctVal ?? '') : false;

  let pickerStyle: any = null;
  let rowStyle: any = null;

  if (mode === 'review') {
    if (value) {
      if (isCorrectAns) {
        rowStyle = { borderColor: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.03)' };
        pickerStyle = { borderColor: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.08)' };
      } else {
        rowStyle = { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.03)' };
        pickerStyle = { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.08)' };
      }
    } else {
      rowStyle = { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.01)', borderStyle: 'dashed' };
      pickerStyle = { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.04)', borderStyle: 'dashed' };
    }
  }

  return (
    <View style={[mr.wrapper, { backgroundColor: colors.card, borderColor: colors.border }, rowStyle]}>
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
          pickerStyle,
        ]}
        onPress={() => {
          if (mode === 'review') return;
          setOpen((v) => !v);
        }}
        activeOpacity={mode === 'review' ? 1 : 0.8}
      >
        <Text
          style={[
            mr.pickerText,
            { color: colors.primary },
            !value && { color: colors.textMuted, fontWeight: '400' },
            mode === 'review' && (isCorrectAns ? { color: '#16a34a' } : { color: '#ef4444' }),
          ]}
          numberOfLines={1}
        >
          {selectedLabel}
        </Text>
        {mode === 'review' ? (
          <Ionicons
            name={isCorrectAns ? 'checkmark-circle' : 'close-circle'}
            size={16}
            color={isCorrectAns ? '#22c55e' : '#ef4444'}
          />
        ) : (
          <Ionicons
            name={open ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={value ? colors.primary : colors.textMuted}
          />
        )}
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

      {/* Correct answer explanation callout */}
      {mode === 'review' && !isCorrectAns && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, paddingHorizontal: 6, paddingVertical: 4, borderRadius: 4, backgroundColor: '#22c55e10', borderWidth: 0.5, borderColor: '#22c55e30' }}>
          <Ionicons name="bulb-outline" size={12} color="#16a34a" />
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#16a34a', flex: 1 }}>
            Correct answer: <Text style={{ fontWeight: 'bold' }}>{correctVal ? `${correctVal} · ${resolveOption(options, correctVal)}` : 'N/A'}</Text>
          </Text>
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
  mode = 'edit',
  correctAnswers,
}: {
  group: any;
  answers: Record<string, string>;
  onAnswer: (k: string, v: string) => void;
  mode?: 'edit' | 'review';
  correctAnswers?: Record<string, string>;
}) {
  const rawItems: any[] = group.items || [];
  const items = rawItems
    .map((item: any) => ({
      id: item.question_number ?? item.id,
      text: item.prompt || item.text || item.question_text || '',
    }))
    .filter((item) => item.id != null);

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
      {items.map((item) => {
        const rawItem = rawItems.find((ri: any) => (ri.question_number ?? ri.id) === item.id);
        const correctVal = correctAnswers?.[String(item.id)] ?? rawItem?.answer ?? '';
        return (
          <MatchRow
            key={String(item.id)}
            qNum={item.id}
            text={item.text}
            options={options}
            value={answers[String(item.id)] || ''}
            onSelect={(v) => onAnswer(String(item.id), v)}
            mode={mode}
            correctVal={correctVal}
          />
        );
      })}
    </>
  );
}

// ─── Reading variants: matching_headings / features / information ─────────────
function StandardMatchingVariant({
  group,
  answers,
  onAnswer,
  bankTitle,
  mode = 'edit',
  correctAnswers,
}: {
  group: any;
  answers: Record<string, string>;
  onAnswer: (k: string, v: string) => void;
  bankTitle: string;
  mode?: 'edit' | 'review';
  correctAnswers?: Record<string, string>;
}) {
  const questions: { question_number: number; text: string }[] = (() => {
    if (Array.isArray(group.items)) {
      return group.items.map((item: any) => ({
        question_number: item.question_number,
        text: item.question_text || item.text || item.prompt || '',
      }));
    }
    if (Array.isArray(group.questions)) {
      return group.questions.map((q: any) => ({
        question_number: q.question_number,
        text: q.question_text || q.text || q.prompt || '',
      }));
    }
    return [];
  })();

  const options: LetterOption[] = (() => {
    const raw = group.options_box?.options ?? group.options_box ?? group.options;
    if (raw && !Array.isArray(raw) && typeof raw === 'object') {
      return Object.entries(raw).map(([letter, text]) => ({ letter, text: String(text) }));
    }
    if (Array.isArray(raw) && raw.length > 0) return raw as LetterOption[];
    return [];
  })();

  if (options.length === 0) {
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
      {questions.map((q) => {
        const rawItem = Array.isArray(group.items)
          ? group.items.find((ri: any) => ri.question_number === q.question_number)
          : Array.isArray(group.questions)
          ? group.questions.find((ri: any) => ri.question_number === q.question_number)
          : null;
        const correctVal = correctAnswers?.[String(q.question_number)] ?? rawItem?.answer ?? '';
        return (
          <MatchRow
            key={q.question_number}
            qNum={q.question_number}
            text={q.text}
            options={options}
            value={answers[String(q.question_number)] || ''}
            onSelect={(v) => onAnswer(String(q.question_number), v)}
            mode={mode}
            correctVal={correctVal}
          />
        );
      })}
    </>
  );
}

// ─── matching_sentence_endings variant (options[]{id, text}) ─────────────────
function SentenceEndingsVariant({
  group,
  answers,
  onAnswer,
  mode = 'edit',
  correctAnswers,
}: {
  group: any;
  answers: Record<string, string>;
  onAnswer: (k: string, v: string) => void;
  mode?: 'edit' | 'review';
  correctAnswers?: Record<string, string>;
}) {
  const questions: { question_number: number; text: string; answer: string }[] =
    group.questions || [];
  const options: IdOption[] = group.options || [];

  return (
    <>
      <OptionBank options={options} title="Sentence Endings" />
      {questions.map((q) => {
        const correctVal = correctAnswers?.[String(q.question_number)] ?? q.answer ?? '';
        return (
          <MatchRow
            key={q.question_number}
            qNum={q.question_number}
            text={q.text || (q as any).question_text || (q as any).prompt || ''}
            options={options}
            value={answers[String(q.question_number)] || ''}
            onSelect={(v) => onAnswer(String(q.question_number), v)}
            mode={mode}
            correctVal={correctVal}
          />
        );
      })}
    </>
  );
}

// ─── Exported MatchingBlock ───────────────────────────────────────────────────
interface Props {
  group: any;
  answers: Record<string, string>;
  onAnswer: (k: string, v: string) => void;
  mode?: 'edit' | 'review';
  correctAnswers?: Record<string, string>;
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

function MatchingBlockComponent({
  group,
  answers,
  onAnswer,
  mode = 'edit',
  correctAnswers,
}: Props) {
  const { colors, isDark } = useTheme();
  const rawType: string = group.type || group.question_type || 'matching';
  const type = rawType.toLowerCase().replace(/\s+/g, '_');
  const instruction: string | undefined = group.instruction || group.description;
  const heading: string | undefined = group.heading;

  const renderVariant = () => {
    if (type === 'matching') {
      return (
        <ListeningMatchingVariant
          group={group}
          answers={answers}
          onAnswer={onAnswer}
          mode={mode}
          correctAnswers={correctAnswers}
        />
      );
    }
    if (type === 'matching_sentence_endings') {
      return (
        <SentenceEndingsVariant
          group={group}
          answers={answers}
          onAnswer={onAnswer}
          mode={mode}
          correctAnswers={correctAnswers}
        />
      );
    }
    return (
      <StandardMatchingVariant
        group={group}
        answers={answers}
        onAnswer={onAnswer}
        bankTitle={BANK_TITLES[type] || 'Options'}
        mode={mode}
        correctAnswers={correctAnswers}
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

function getQuestionNumbers(group: any): number[] {
  const rawItems: any[] = group.items || [];
  const items = rawItems
    .map((item: any) => item.question_number ?? item.id)
    .filter((id) => id != null);
  
  if (items.length > 0) return items.map(Number);

  const questions: any[] = group.questions || [];
  return questions.map((q) => Number(q.question_number)).filter(Boolean);
}

export default React.memo(MatchingBlockComponent, (prev, next) => {
  if (prev.mode !== next.mode) return false;
  if (prev.group !== next.group) return false;

  const prevQNums = getQuestionNumbers(prev.group);
  for (const qNum of prevQNums) {
    const key = String(qNum);
    if (prev.answers[key] !== next.answers[key]) return false;
    if (prev.correctAnswers?.[key] !== next.correctAnswers?.[key]) return false;
  }

  return true;
});

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
