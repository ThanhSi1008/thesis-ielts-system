import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, Animated, Dimensions, TouchableWithoutFeedback,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAudioPlayer } from 'expo-audio';
import { useGradingPoll } from '@/hooks/useGradingPoll';
import { WebView } from 'react-native-webview';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { ieltsExamsApi } from '@/services/ielts.api';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Badge } from '@/components/ui';
import WritingExamBlock from '@/components/ielts/WritingExamBlock';
import SpeakingExamBlock from '@/components/ielts/SpeakingExamBlock';
import ReadingExamBlock from '@/components/ielts/ReadingExamBlock';
import DiagramMapBlock from '@/components/ielts/DiagramMapBlock';
import MatchingBlock from '@/components/ielts/MatchingBlock';

// ─── Timer (wall-clock fix) ───────────────────────────────────────────────────
function useTimer(initialSeconds: number, running: boolean) {
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      // Capture wall-clock start, subtract already-elapsed to resume correctly
      startTimeRef.current = Date.now() - elapsed * 1000;
      intervalRef.current = setInterval(() => {
        const wallElapsed = Math.round((Date.now() - startTimeRef.current!) / 1000);
        setElapsed(wallElapsed);
      }, 500); // 500ms polling keeps display accurate without being costly
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const remaining = Math.max(0, initialSeconds - elapsed);
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  return { elapsed, remaining, display: `${mm}:${ss}`, isExpired: remaining === 0 };
}


// ─── MCQ Question ────────────────────────────────────────────────────────────
// Supports both single-answer (question_number) and multi-select (question_numbers[])
// Multi-select: each slot in question_numbers gets its own answers key, e.g. answers["23"], answers["24"]
// Selecting a letter writes it to the next empty slot (or deselects if already chosen)
function MCQQuestion({
  q,
  answers,          // full answers map (needed for multi-select)
  onAnswer,         // (key, value) setter
}: {
  q: any;
  answers: Record<string, string>;
  onAnswer: (key: string, value: string) => void;
}) {
  // Normalise options
  const rawOptions = q.options;
  const optionEntries: { letter: string; label: string }[] =
    rawOptions && !Array.isArray(rawOptions) && typeof rawOptions === 'object'
      ? Object.entries(rawOptions).map(([letter, label]) => ({ letter, label: String(label) }))
      : Array.isArray(rawOptions)
        ? rawOptions.map((opt: any, i: number) => ({
            letter: opt.letter || String.fromCharCode(65 + i),
            label: opt.text || String(opt),
          }))
        : [];

  const questionText = q.question_text || q.question || q.text || '';

  // Determine if this is multi-select
  const qNums: string[] = q.question_numbers
    ? (q.question_numbers as number[]).map(String)
    : q.question_number != null
      ? [String(q.question_number)]
      : [];
  const isMulti = qNums.length > 1;
  const displayNum = qNums.join(' & ');

  // Currently selected letters (one per slot)
  const selectedLetters: string[] = qNums.map(k => answers[k] || '').filter(Boolean);
  const isSelected = (letter: string) => selectedLetters.includes(letter);

  const handlePress = (letter: string) => {
    if (!isMulti) {
      // Single-answer: simple toggle (radio)
      const key = qNums[0];
      if (!key) return;
      onAnswer(key, answers[key] === letter ? '' : letter);
      return;
    }
    // Multi-select: toggle across slots
    if (isSelected(letter)) {
      // Deselect — find which slot holds this letter and clear it
      const slotKey = qNums.find(k => answers[k] === letter);
      if (slotKey) onAnswer(slotKey, '');
    } else {
      // Select — write into the first empty slot
      const emptySlot = qNums.find(k => !answers[k]);
      if (emptySlot) onAnswer(emptySlot, letter);
      // If all slots are full, replace the last one
      else onAnswer(qNums[qNums.length - 1], letter);
    }
  };

  return (
    <View style={qStyles.block}>
      <Text style={qStyles.qNumber}>Q{displayNum}</Text>
      {isMulti && (
        <Text style={qStyles.multiHint}>Choose {qNums.length} letters</Text>
      )}
      <Text style={qStyles.qText}>{questionText}</Text>
      {optionEntries.map(({ letter, label }) => {
        const sel = isSelected(letter);
        return (
          <TouchableOpacity
            key={letter}
            style={[qStyles.option, sel && qStyles.optionSelected]}
            onPress={() => handlePress(letter)}
            activeOpacity={0.8}
          >
            <View style={[
              qStyles.optionBullet,
              sel && qStyles.optionBulletSelected,
              isMulti && qStyles.optionBulletMulti,
              isMulti && sel && qStyles.optionBulletMultiSelected,
            ]}>
              {isMulti && sel
                ? <Ionicons name="checkmark" size={12} color="#fff" />
                : <Text style={[qStyles.optionLetter, sel && { color: '#fff' }]}>{letter}</Text>
              }
            </View>
            <Text style={[qStyles.optionText, sel && qStyles.optionTextSelected]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Fill blank Question ──────────────────────────────────────────────────────
function FillQuestion({ q, answer, onAnswer }: { q: any; answer: string; onAnswer: (v: string) => void }) {
  const questionText = q.question_text || q.question || q.text || '';
  const contextNote = q.note || q.additional_info || q.context || null;
  const qNums: string[] = q.question_numbers
    ? (q.question_numbers as number[]).map(String)
    : q.question_number != null ? [String(q.question_number)] : [];

  return (
    <View style={qStyles.block}>
      <Text style={qStyles.qNumber}>Q{qNums.join(' & ')}</Text>
      {questionText ? <Text style={qStyles.qText}>{questionText}</Text> : null}
      {contextNote ? (
        <View style={qStyles.contextNote}>
          <Ionicons name="information-circle-outline" size={13} color={COLORS.textSecondary} />
          <Text style={qStyles.contextNoteText}>{contextNote}</Text>
        </View>
      ) : null}
      <TextInput
        style={qStyles.input}
        value={answer}
        onChangeText={onAnswer}
        placeholder="Type your answer…"
        placeholderTextColor={COLORS.textMuted}
        returnKeyType="done"
      />
    </View>
  );
}

const qStyles = StyleSheet.create({
  block: { marginBottom: SPACING.xl, padding: SPACING.lg, backgroundColor: '#fff', borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.border },
  qNumber: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.primary, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  multiHint: { fontSize: FONT_SIZES.xs, color: '#D97706', fontWeight: '600', marginBottom: SPACING.sm, backgroundColor: '#FEF3C7', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  qText: { fontSize: FONT_SIZES.md, color: COLORS.text, marginBottom: SPACING.md, lineHeight: 22 },
  option: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.sm, backgroundColor: COLORS.surface },
  optionSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '12' },
  optionBullet: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md, backgroundColor: '#fff' },
  optionBulletSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  // Checkbox variant for multi-select
  optionBulletMulti: { borderRadius: 6 },
  optionBulletMultiSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  optionLetter: { fontWeight: '700', fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  optionText: { flex: 1, fontSize: FONT_SIZES.md, color: COLORS.text },
  optionTextSelected: { color: COLORS.primary, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.md, fontSize: FONT_SIZES.md, color: COLORS.text },
  contextNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 4, marginBottom: SPACING.sm, padding: SPACING.sm, backgroundColor: '#F8FAFC', borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border + '60' },
  contextNoteText: { flex: 1, fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, lineHeight: 18 },
  sectionBlock: { marginBottom: SPACING.lg },
  sectionHeading: {
    fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.primary,
    marginBottom: SPACING.sm, paddingBottom: 4,
    borderBottomWidth: 1, borderBottomColor: COLORS.border + '60',
  },
  sectionText: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 22, marginBottom: SPACING.md },
  // Word bank (options_box) for Summary/Note Completion
  optionsBox: {
    backgroundColor: '#F8FAFC', borderRadius: RADIUS.xl, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.lg,
  },
  optionsBoxTitle: { fontSize: FONT_SIZES.xs, fontWeight: '800', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: SPACING.sm },
  optionsBoxGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  optionsBoxItem: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff', borderRadius: RADIUS.md, paddingHorizontal: SPACING.sm, paddingVertical: 4,
    borderWidth: 1, borderColor: COLORS.border,
  },
  optionsBoxLetter: { fontSize: FONT_SIZES.xs, fontWeight: '800', color: COLORS.primary },
  optionsBoxText: { fontSize: FONT_SIZES.xs, color: COLORS.text },
  // Passage context wrap
  passageContextWrap: {
    backgroundColor: '#F8F9FA', borderRadius: RADIUS.lg, borderWidth: 1,
    borderColor: '#E2E8F0', borderLeftWidth: 3, borderLeftColor: COLORS.primary + '80',
    padding: SPACING.md, marginBottom: SPACING.lg,
  },
  passageContextText: {
    fontSize: FONT_SIZES.sm, color: '#374151', lineHeight: 26,
  },
  blankBadge: {
    backgroundColor: COLORS.primary, color: '#fff', fontWeight: '800',
    fontSize: 11, borderRadius: 4, paddingHorizontal: 5, overflow: 'hidden',
  },
  // Summary answer list (below context)
  summaryAnswerList: { gap: SPACING.sm, marginTop: SPACING.sm },
  summaryAnswerRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: '#fff', borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
  },
  summaryQBadge: {
    width: 30, height: 30, borderRadius: 8, backgroundColor: COLORS.primary + '18',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  summaryQBadgeText: { fontSize: FONT_SIZES.xs, fontWeight: '800', color: COLORS.primary },
  summaryAnswerInput: {
    flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text,
    paddingVertical: 4, borderBottomWidth: 1.5, borderBottomColor: COLORS.border,
  },
  // Selector chip (word-bank per-blank row)
  selectorRow: {
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: '#fff', marginBottom: SPACING.sm, overflow: 'hidden',
  },
  selectorChip: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
  },
  selectorChipLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 },
  selectorChipFilled: { backgroundColor: COLORS.primary + '08' },
  selectorChipLabel: { fontSize: FONT_SIZES.sm, color: COLORS.text },
  selectorChipValue: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.primary },
  selectorChipPlaceholder: { fontSize: FONT_SIZES.sm, color: '#94A3B8' },
  selectorList: {
    borderTopWidth: 1, borderTopColor: COLORS.border + '60',
    maxHeight: 220,
  },
  selectorListItem: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingHorizontal: SPACING.md, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.border + '40',
  },
  selectorListItemActive: { backgroundColor: COLORS.primary + '10' },
  selectorListLetter: {
    width: 28, height: 28, borderRadius: 6, backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center',
  },
  selectorListLetterActive: { backgroundColor: COLORS.primary },
  selectorListLetterText: { fontSize: 13, fontWeight: '800', color: COLORS.primary },
  selectorListLetterTextActive: { color: '#fff' },
  selectorListText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text },
});

// ─── Summary Completion sub-components ───────────────────────────────────────

// Per-blank selector row: tap to expand inline option list (word-bank variant)
function SummaryBlankSelector({
  qNum, value, displayLabel, options, answers, onSelect, onClear,
}: {
  qNum: number;
  value: string;
  displayLabel: string;
  options: Record<string, string>;
  answers: Record<string, string>;
  onSelect: (letter: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const filled = !!value;
  const usedLetters = new Set(Object.values(answers).filter(v => v && v !== value));

  return (
    <View style={qStyles.selectorRow}>
      <TouchableOpacity
        style={[qStyles.selectorChip, filled && qStyles.selectorChipFilled]}
        onPress={() => setOpen(o => !o)}
        activeOpacity={0.75}
      >
        <View style={qStyles.selectorChipLeft}>
          <View style={qStyles.summaryQBadge}>
            <Text style={qStyles.summaryQBadgeText}>{qNum}</Text>
          </View>
          {filled ? (
            <Text style={qStyles.selectorChipValue}>{displayLabel}</Text>
          ) : (
            <Text style={qStyles.selectorChipPlaceholder}>Tap to select an answer…</Text>
          )}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {filled && (
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation?.(); onClear(); setOpen(false); }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.textSecondary} />
        </View>
      </TouchableOpacity>

      {open && (
        <ScrollView style={qStyles.selectorList} nestedScrollEnabled>
          {Object.entries(options).map(([letter, text]) => {
            const isActive = value === letter;
            const isUsed = !isActive && usedLetters.has(letter);
            return (
              <TouchableOpacity
                key={letter}
                style={[qStyles.selectorListItem, isActive && qStyles.selectorListItemActive]}
                onPress={() => { onSelect(letter); setOpen(false); }}
                disabled={isUsed}
                activeOpacity={0.7}
              >
                <View style={[qStyles.selectorListLetter, isActive && qStyles.selectorListLetterActive]}>
                  <Text style={[qStyles.selectorListLetterText, isActive && qStyles.selectorListLetterTextActive]}>
                    {letter}
                  </Text>
                </View>
                <Text style={[qStyles.selectorListText, isUsed && { color: '#CBD5E1' }]}>
                  {String(text)}
                </Text>
                {isActive && <Ionicons name="checkmark" size={16} color={COLORS.primary} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const DIAGRAM_TYPES = new Set(['diagram_labelling', 'diagram_completion', 'map_labelling', 'plan_labelling']);
const MATCHING_TYPES = new Set(['matching', 'matching_headings', 'matching_features', 'matching_information', 'matching_sentence_endings']);




// ─── Render question groups (Listening / Reading) ─────────────────────────────
// partIdx + groupIdx together guarantee a globally-unique key across all parts.
function renderGroup(
  group: any,
  answers: Record<string, string>,
  setAnswer: (k: string, v: string) => void,
  groupIdx = 0,
  partIdx = 0,
) {
  const type = group.question_type ?? group.type ?? 'fill';
  // Key: p{partIdx}-g{groupIdx}-{type} — always unique across parts & groups
  const baseKey = `p${partIdx}-g${groupIdx}-${type}`;

  // ── Resolve questions array from the 3 possible data shapes ──────────────
  // Shape A: MCQ / multi-select  → group.items[]  (question_text + options)
  // Shape B: Note/Form/Summary   → group.content[].points[]  (nested)
  // Shape C: Reading flat        → group.content[]  (direct items)
  // Guard: group.questions is often a range string like "1–5", never an array
  let questions: any[] = [];

  if (Array.isArray(group.items)) {
    // Shape A — MCQ, Yes/No/Not Given, True/False/Not Given, multiple choice
    questions = group.items;
  } else if (Array.isArray(group.content)) {
    const firstItem = group.content[0];
    if (firstItem && Array.isArray(firstItem.points)) {
      // Shape B — flatten all points from all content sections
      questions = group.content.flatMap((section: any) => section.points ?? []);
    } else {
      // Shape C — content items are the questions directly
      questions = group.content;
    }
  } else if (Array.isArray(group.points)) {
    questions = group.points;
  }
  const answerableQuestions = questions.filter((q: any) => q.question_number != null || Array.isArray(q.question_numbers));

  // ── Determine render type ─────────────────────────────────────────────────
  const isMatchingType = MATCHING_TYPES.has(type.toLowerCase().replace(/ /g, '_'));
  const isDiagramType = DIAGRAM_TYPES.has(type.toLowerCase().replace(/ /g, '_'));
  const isMCQ = type.toLowerCase().includes('multiple') || Array.isArray(group.items);

  // Yes/No/Not Given and True/False/Not Given — render as MCQ with synthetic options
  const isTFNG = /true.false|yes.no/i.test(type);
  const tfOptions = /yes.no/i.test(type)
    ? { YES: 'Yes', NO: 'No', 'NOT GIVEN': 'Not Given' }
    : { TRUE: 'True', FALSE: 'False', 'NOT GIVEN': 'Not Given' };

  // options_box for Summary/Note Completion with word bank (e.g. Part 3 Q27-31)
  const optionsBox = group.options_box ?? null;

  // Mutable ref for tracking which blank is focused (word-bank Summary Completion)
  // renderGroup is a plain function, so we use a closure-scoped object
  const focusedBlankRef: { current: number | null } = { current: null };

  if (isDiagramType) {
    return (
      <DiagramMapBlock
        key={baseKey}
        group={group}
        answers={answers}
        onAnswer={setAnswer}
      />
    );
  }

  if (isMatchingType) {
    return (
      <MatchingBlock
        key={baseKey}
        group={group}
        answers={answers}
        onAnswer={setAnswer}
      />
    );
  }

  // Content sections with headings (Note Completion, Form Completion, Summary Completion)
  const hasSections = Array.isArray(group.content) && group.content[0] && Array.isArray(group.content[0].points);

  // ── Helper: render passage context paragraph (blanks shown as numbered badges, display only)
  const renderPassageContext = (rawText: string, cKey: string) => {
    // Replace "18 [blank]" with highlighted Q-number badge marker
    const regex = /(\d+)\s*\[blank\]/g;
    const segments: Array<{ type: 'text' | 'badge'; content: string }> = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(rawText)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ type: 'text', content: rawText.slice(lastIndex, match.index) });
      }
      segments.push({ type: 'badge', content: match[1] });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < rawText.length) {
      segments.push({ type: 'text', content: rawText.slice(lastIndex) });
    }

    // Render as flex-wrap row so badges sit inline with text
    return (
      <View style={qStyles.passageContextWrap}>
        <Text style={qStyles.passageContextText}>
          {segments.map((seg, i) =>
            seg.type === 'badge' ? (
              <Text key={`${cKey}-seg${i}`} style={qStyles.blankBadge}> {seg.content} </Text>
            ) : (
              <Text key={`${cKey}-seg${i}`}>{seg.content}</Text>
            )
          )}
        </Text>
      </View>
    );
  };

  // ── Helper: Summary Completion section renderer ───────────────────────────────
  // Layout: [Context paragraph with numbered blank badges] → [Answer inputs/selectors]
  const renderSummaryInline = (section: any, sKey: string) => {
    const rawText: string = section.text || '';
    const points: Array<{ question_number: number }> = (section.points || [])
      .filter((p: any) => typeof p.question_number === 'number');

    const hasWordBank = !!(optionsBox && optionsBox.options);

    return (
      <View key={sKey} style={qStyles.sectionBlock}>
        {section.heading && (
          <Text style={qStyles.sectionHeading}>{section.heading}</Text>
        )}

        {/* Passage context — display only with blank number badges */}
        {rawText.length > 0 && renderPassageContext(rawText, sKey)}

        {/* Answer inputs below the context */}
        <View style={qStyles.summaryAnswerList}>
          {points.map((p) => {
            const qNum = p.question_number;
            const qKey = String(qNum);
            const currentVal = answers[qKey] || '';

            if (hasWordBank) {
              // Word-bank variant: show a tappable selector chip per blank
              const displayLabel = optionsBox!.options[currentVal]
                ? `${currentVal} — ${optionsBox!.options[currentVal]}`
                : '';
              return (
                <SummaryBlankSelector
                  key={qKey}
                  qNum={qNum}
                  value={currentVal}
                  displayLabel={displayLabel}
                  options={optionsBox!.options}
                  answers={answers}
                  onSelect={(letter) => setAnswer(qKey, letter)}
                  onClear={() => setAnswer(qKey, '')}
                />
              );
            }

            // Free-text variant: labeled TextInput row
            return (
              <View key={qKey} style={qStyles.summaryAnswerRow}>
                <View style={qStyles.summaryQBadge}>
                  <Text style={qStyles.summaryQBadgeText}>{qNum}</Text>
                </View>
                <TextInput
                  style={qStyles.summaryAnswerInput}
                  value={currentVal}
                  onChangeText={v => setAnswer(qKey, v)}
                  placeholder="Type answer..."
                  placeholderTextColor="#94A3B8"
                  returnKeyType="done"
                />
              </View>
            );
          })}
        </View>
      </View>
    );
  };


  return (
    <View key={baseKey}>
      {group.instructions && <Text style={styles.instructions}>{group.instructions}</Text>}


      {hasSections ? (
        // Detect if each section is a Summary Completion (has text + points with Q numbers)
        group.content.map((section: any, si: number) => {
          const sKey = `${baseKey}-s${si}`;
          const sectionPoints = section.points ?? [];
          const hasSummaryText = typeof section.text === 'string' && section.text.includes('[blank]');

          if (hasSummaryText) {
            // Summary Completion — render paragraph with inline blanks
            return renderSummaryInline(section, sKey);
          }

          // Note/Form Completion — render each point as fill or MCQ
          return (
            <View key={sKey} style={qStyles.sectionBlock}>
              {section.heading && (
                <Text style={qStyles.sectionHeading}>{section.heading}</Text>
              )}
              {section.text && (
                <Text style={qStyles.sectionText}>{section.text}</Text>
              )}
              {sectionPoints
                .filter((q: any) => q.question_number != null)
                .map((q: any, qi: number) => {
                  const num = String(q.question_number);
                  const qKey = `${sKey}-${num}`;
                  if (isTFNG) {
                    return <MCQQuestion key={qKey} q={{ ...q, options: tfOptions }} answers={answers} onAnswer={(k, v) => setAnswer(k, v)} />;
                  }
                  if (optionsBox) {
                    return <MCQQuestion key={qKey} q={{ ...q, options: optionsBox.options }} answers={answers} onAnswer={(k, v) => setAnswer(k, v)} />;
                  }
                  return <FillQuestion key={qKey} q={q} answer={answers[num] || ''} onAnswer={v => setAnswer(num, v)} />;
                })}
            </View>
          );
        })
      ) : (
        // Flat render — MCQ, TFNG, or plain fill-in
        answerableQuestions.map((q: any, qi: number) => {
          const num = q.question_number != null ? String(q.question_number) : `${baseKey}-qi${qi}`;
          const qKey = `${baseKey}-${num}`;

          if (isTFNG) {
            const enriched = { ...q, options: tfOptions };
            return <MCQQuestion key={qKey} q={enriched} answers={answers} onAnswer={(k, v) => setAnswer(k, v)} />;
          }
          if (isMCQ) {
            return <MCQQuestion key={qKey} q={q} answers={answers} onAnswer={(k, v) => setAnswer(k, v)} />;
          }
          return <FillQuestion key={qKey} q={q} answer={answers[num] || ''} onAnswer={v => setAnswer(num, v)} />;
        })
      )}
    </View>
  );
}

// ─── AI Grading Overlay (Writing / Speaking) ──────────────────────────────────
function AIGradingOverlay({ onGoBack }: { onGoBack: () => void }) {
  return (
    <View style={overlayStyles.container}>
      <View style={overlayStyles.spinnerWrapper}>
        <ActivityIndicator size="large" color="#D51025" />
      </View>
      <Text style={overlayStyles.title}>Calculating your score…</Text>
      <Text style={overlayStyles.subtitle}>
        Our AI examiner is grading your responses.{'\n'}This may take a minute.
      </Text>
      <TouchableOpacity style={overlayStyles.backBtn} onPress={onGoBack}>
        <Ionicons name="arrow-back-outline" size={16} color="rgba(255,255,255,0.8)" />
        <Text style={overlayStyles.backBtnText}>Go back to mock tests</Text>
      </TouchableOpacity>
      <Text style={overlayStyles.note}>You'll be redirected automatically when done.</Text>
    </View>
  );
}

const overlayStyles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,10,10,0.93)', alignItems: 'center', justifyContent: 'center', padding: SPACING.xl, zIndex: 200 },
  spinnerWrapper: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl },
  title: { color: '#fff', fontSize: FONT_SIZES.xl, fontWeight: '800', marginBottom: SPACING.sm, textAlign: 'center' },
  subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: FONT_SIZES.sm, textAlign: 'center', lineHeight: 20, marginBottom: SPACING.xxl },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: SPACING.md },
  backBtnText: { color: 'rgba(255,255,255,0.8)', fontWeight: '600', fontSize: FONT_SIZES.sm },
  note: { color: 'rgba(255,255,255,0.25)', fontSize: FONT_SIZES.xs, textAlign: 'center' },
});

// ─── Question Navigator Drawer ────────────────────────────────────────────────
const DRAWER_HEIGHT = Math.min(Dimensions.get('window').height * 0.55, 420);

function QuestionNavigatorDrawer({
  open,
  onClose,
  totalQuestions,
  answers,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  totalQuestions: number;
  answers: Record<string, string>;
  onSelect: (n: number) => void;
}) {
  const slideAnim = useRef(new Animated.Value(DRAWER_HEIGHT)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: open ? 0 : DRAWER_HEIGHT,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  }, [open]);

  const numbers = Array.from({ length: totalQuestions }, (_, i) => i + 1);
  const answeredCount = Object.keys(answers).length;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={nav.backdrop} />
        </TouchableWithoutFeedback>
      )}
      {/* Sheet */}
      <Animated.View style={[nav.sheet, { transform: [{ translateY: slideAnim }] }]}>
        {/* Handle */}
        <View style={nav.handle} />
        {/* Header */}
        <View style={nav.sheetHeader}>
          <Text style={nav.sheetTitle}>Question Navigator</Text>
          <View style={nav.legend}>
            <View style={nav.legendRow}>
              <View style={[nav.dot, { backgroundColor: COLORS.primary }]} />
              <Text style={nav.legendText}>{answeredCount} Answered</Text>
            </View>
            <View style={nav.legendRow}>
              <View style={[nav.dot, { backgroundColor: '#E5E7EB' }]} />
              <Text style={nav.legendText}>{totalQuestions - answeredCount} Unanswered</Text>
            </View>
          </View>
        </View>
        {/* Grid */}
        <ScrollView
          contentContainerStyle={nav.grid}
          showsVerticalScrollIndicator={false}
        >
          {numbers.map(n => {
            const answered = !!answers[String(n)];
            return (
              <TouchableOpacity
                key={n}
                style={[nav.cell, answered && nav.cellAnswered]}
                onPress={() => { onClose(); setTimeout(() => onSelect(n), 150); }}
                activeOpacity={0.75}
              >
                <Text style={[nav.cellText, answered && nav.cellTextAnswered]}>{n}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>
    </>
  );
}

const nav = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 90 },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: DRAWER_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    zIndex: 100,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 20,
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB',
    alignSelf: 'center', marginTop: 12, marginBottom: 8,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
  sheetTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  legend: { flexDirection: 'row', gap: SPACING.md },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 10, color: COLORS.textSecondary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 8 },
  cell: {
    width: 44, height: 44, borderRadius: RADIUS.md,
    backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },
  cellAnswered: { backgroundColor: COLORS.primary + '18', borderColor: COLORS.primary },
  cellText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textMuted },
  cellTextAnswered: { color: COLORS.primary },
});

// ─── Main Exam Player ─────────────────────────────────────────────────────────
export default function ExamPlayerScreen() {
  const router = useRouter();
  const { examId } = useLocalSearchParams<{ examId: string }>();
  const { user } = useAuth();

  const [exam, setExam] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [writingAnswers, setWritingAnswers] = useState({ task1: '', task2: '' });
  const [speakingAnswers, setSpeakingAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAiGrading, setIsAiGrading] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [examReady, setExamReady] = useState(false); // false = still in prep screen
  // Tracks which Listening part is currently active (for per-part audio)
  const [activeListeningPartIndex, setActiveListeningPartIndex] = useState(0);

  // Question navigator: track Y-offsets per part via onLayout
  const scrollViewRef = useRef<ScrollView>(null);
  const partOffsetsRef = useRef<Record<number, number>>({}); // partIndex → Y offset

  // Scroll to a question number (estimates part based on question ranges)
  const scrollToQuestion = useCallback((n: number) => {
    if (!exam) return;
    const questions = exam.questions as any;
    const parts = questions?.parts || questions?.passages || questions?.tasks || [];
    if (parts.length === 0) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    // Find which part contains question n by scanning question_number in groups
    let targetPartIndex = 0;
    for (let pi = 0; pi < parts.length; pi++) {
      const groups = parts[pi].question_groups || parts[pi].groups || parts[pi].content || [];
      for (const g of groups) {
        const allNums: number[] = [];
        const collectNums = (obj: any) => {
          if (!obj || typeof obj !== 'object') return;
          if (Array.isArray(obj)) { obj.forEach(collectNums); return; }
          if ('question_number' in obj) { allNums.push(Number(obj.question_number)); return; }
          if ('question_numbers' in obj) { (obj.question_numbers as number[]).forEach(x => allNums.push(x)); return; }
          Object.values(obj).forEach(collectNums);
        };
        collectNums(g);
        if (allNums.some(num => num === n)) { targetPartIndex = pi; break; }
      }
    }
    const yOffset = partOffsetsRef.current[targetPartIndex] ?? 0;
    scrollViewRef.current?.scrollTo({ y: Math.max(0, yOffset - 16), animated: true });
  }, [exam]);

  const [volume, setVolume] = useState(1.0);

  // Derive audio URL from the currently active Listening part.
  // Data structure: questions.parts[i].audio_url (per-part, not top-level)
  const listeningParts = exam?.questions?.parts ?? [];
  const audioUrl = listeningParts[activeListeningPartIndex]?.audio_url ?? null;
  const player = useAudioPlayer(audioUrl || '');

  useEffect(() => {
    if (player) player.volume = volume;
  }, [volume, player]);

  // Auto-play audio ONLY when the exam is active (never on prep screen)
  useEffect(() => {
    if (!examReady) return;
    if (audioUrl && player && !player.playing) {
      player.play();
    }
  }, [audioUrl, examReady]);

  // Stop audio and switch part
  const handleListeningPartChange = (index: number) => {
    if (player.playing) player.pause();
    setActiveListeningPartIndex(index);
  };

  const { elapsed, display: timerDisplay } = useTimer(
    (exam?.duration ?? 60) * 60,
    timerRunning,
  );

  useEffect(() => { loadExam(); }, [examId]);

  const loadExam = async () => {
    try {
      const examData = await ieltsExamsApi.getExam(examId);
      setExam(examData);
      // Session created but timer doesn't start until user confirms prep screen
      if (user) {
        const sess = await ieltsExamsApi.createSession(examId, user.id);
        setSession(sess);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Poll for AI Grading (Speaking & Writing)
  useGradingPoll({
    sessionId: session?.id || null,
    enabled: isAiGrading,
    onDone: (sid) => {
      setIsAiGrading(false);
      router.replace(`/ielts/intensive/result/${sid}` as any);
    },
    onError: (msg) => {
      setIsAiGrading(false);
      Alert.alert('Grading Error', msg, [
        { text: 'View History', onPress: () => router.replace('/(tabs)/ielts') }
      ]);
    }
  });

  const handleStartExam = () => {
    setExamReady(true);
    setTimerRunning(true);
  };

  const setAnswer = useCallback((key: string, value: string) =>
    setAnswers(prev => ({ ...prev, [key]: value })), []);


  const buildSubmitPayload = () => {
    const type = exam?.type;
    if (type === 'WRITING') return { task1: writingAnswers.task1, task2: writingAnswers.task2 };
    if (type === 'SPEAKING') return speakingAnswers;
    return answers;
  };

  const handleSubmit = async () => {
    Alert.alert(
      'Submit Test?',
      'You cannot change answers after submitting.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            if (!session) return;
            try {
              setSubmitting(true);
              setTimerRunning(false);
              const payload = buildSubmitPayload();
              const isAiType = exam?.type === 'WRITING' || exam?.type === 'SPEAKING';
              if (isAiType) setIsAiGrading(true);
              await ieltsExamsApi.submitSession(session.id, payload, elapsed);
              
              if (!isAiType) {
                router.replace(`/ielts/intensive/result/${session.id}` as any);
              }
            } catch (e) {
              setIsAiGrading(false);
              Alert.alert('Error', 'Failed to submit. Try again.');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading exam…</Text>
      </View>
    );
  }

  if (!exam) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Exam not found.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: COLORS.primary }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Preparation Screen (matches web version) ─────────────────────────────
  if (!examReady) {
    const prepType: string = exam.type || 'LISTENING';
    const prepParts: any[] = exam.questions?.parts || exam.questions?.passages || exam.questions?.tasks || [];
    const isSpeaking = prepType === 'SPEAKING';

    // YouTube video IDs — same as web
    const videoId =
      prepType === 'READING' ? 'zectOHoEduM' :
      prepType === 'WRITING' ? 'ZU7RjBvAj2E' :
      prepType === 'SPEAKING' ? '' :
      'UFjDeMuyPMs'; // LISTENING default

    // Split title: "Cambridge IELTS 17 - Listening Test 1" → group / test
    const titleParts = (exam.title || '').split(' - ');
    const groupTitle = titleParts[0]?.trim() || exam.title;
    const testTitle = titleParts.slice(1).join(' - ').trim();

    // Skill icon name
    const skillIcon = prepType === 'READING' ? 'book-outline' :
      prepType === 'WRITING' ? 'pencil-outline' :
      prepType === 'SPEAKING' ? 'mic-outline' : 'headset-outline';

    // Questions/structure description
    const questionsLabel = isSpeaking ? 'Structure' : prepType === 'WRITING' ? 'Tasks' : 'Questions';
    const questionsValue = isSpeaking ? '3 Parts · multiple questions' :
      prepType === 'WRITING' ? '2 tasks' : '40 questions';

    // Notice text per skill
    const noticeText = isSpeaking
      ? 'Make sure your microphone is connected and allowed. Speak clearly and at a natural pace.'
      : prepType === 'LISTENING'
      ? 'Make sure your headphones or speakers are on. Audio will play automatically when you start.'
      : 'Ensure you have a quiet environment and are ready to focus for the duration of the test.';

    // Chips
    const chips = prepType === 'WRITING'
      ? ['2 Tasks', '60 Minutes', 'Computer Based']
      : prepType === 'READING'
      ? ['3 Sections', '40 Questions', 'Computer Based']
      : ['4 Sections', '40 Questions', 'Computer Based'];

    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.prepContainer}>
          {/* Header nav */}
          <View style={styles.prepHeader}>
            <TouchableOpacity onPress={() => router.back()} style={styles.prepBack}>
              <Ionicons name="arrow-back" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.prepHeaderTitle}>Exam Preparation</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView contentContainerStyle={styles.prepScroll} showsVerticalScrollIndicator={false}>

            {/* Cambridge IELTS badge + title */}
            <View style={styles.prepTitleSection}>
              <View style={styles.prepCamBadge}>
                <Ionicons name="book-outline" size={12} color={COLORS.primary} />
                <Text style={styles.prepCamBadgeText}>Cambridge IELTS</Text>
              </View>
              <Text style={styles.prepGroupTitle}>{groupTitle}</Text>
              {testTitle ? <Text style={styles.prepTestTitle}>{testTitle}</Text> : null}
              {/* Decorative bar */}
              <View style={styles.prepDecorRow}>
                <View style={[styles.prepDecorBar, { width: 40, backgroundColor: COLORS.primary }]} />
                <View style={[styles.prepDecorBar, { width: 12, backgroundColor: '#D1D5DB' }]} />
                <View style={[styles.prepDecorBar, { width: 12, backgroundColor: '#E5E7EB' }]} />
              </View>
            </View>

            {/* Main card */}
            <View style={styles.prepCard}>
              {/* LEFT — Exam details */}
              <View style={styles.prepCardLeft}>
                <Text style={styles.prepSectionLabel}>Exam Details</Text>

                {/* Duration */}
                <View style={styles.prepDetailRow}>
                  <View style={styles.prepDetailIcon}>
                    <Ionicons name="timer-outline" size={18} color={COLORS.primary} />
                  </View>
                  <View>
                    <Text style={styles.prepDetailMeta}>Duration</Text>
                    <Text style={styles.prepDetailValue}>{exam.duration ?? 60} minutes</Text>
                  </View>
                </View>

                {/* Skill */}
                <View style={styles.prepDetailRow}>
                  <View style={styles.prepDetailIcon}>
                    <Ionicons name={skillIcon as any} size={18} color={COLORS.primary} />
                  </View>
                  <View>
                    <Text style={styles.prepDetailMeta}>Skill</Text>
                    <Text style={styles.prepDetailValue}>
                      {prepType.charAt(0) + prepType.slice(1).toLowerCase()}
                    </Text>
                  </View>
                </View>

                {/* Questions */}
                <View style={styles.prepDetailRow}>
                  <View style={styles.prepDetailIcon}>
                    <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.primary} />
                  </View>
                  <View>
                    <Text style={styles.prepDetailMeta}>{questionsLabel}</Text>
                    <Text style={styles.prepDetailValue}>{questionsValue}</Text>
                  </View>
                </View>

                {/* Notice */}
                <View style={styles.prepNoticeBox}>
                  <Text style={styles.prepNoticeText}>{noticeText}</Text>
                </View>
              </View>

              {/* Divider */}
              <View style={styles.prepCardDivider} />

              {/* RIGHT — YouTube video */}
              <View style={styles.prepCardRight}>
                <View style={styles.prepVideoHeader}>
                  <Ionicons name="play-circle-outline" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.prepSectionLabel}>Test Instructions</Text>
                </View>

                {videoId ? (
                  <>
                    <View style={styles.prepVideoWrapper}>
                      <WebView
                        style={styles.prepVideo}
                        source={{ uri: `https://www.youtube.com/embed/${videoId}` }}
                        allowsFullscreenVideo
                        mediaPlaybackRequiresUserAction={false}
                        javaScriptEnabled
                      />
                    </View>
                    <Text style={styles.prepVideoCaption}>
                      Watch the full tutorial before attempting the test to familiarise yourself with the format.
                    </Text>
                  </>
                ) : (
                  <View style={styles.prepNoVideo}>
                    <Ionicons name="mic-outline" size={40} color={COLORS.textSecondary} />
                    <Text style={styles.prepNoVideoText}>Speaking test — use the device microphone during the exam.</Text>
                  </View>
                )}

                {/* Chips */}
                <View style={styles.prepChipRow}>
                  {chips.map(chip => (
                    <View key={chip} style={styles.prepChip}>
                      <Text style={styles.prepChipText}>{chip}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>

          {/* CTA */}
          <View style={styles.prepFooter}>
            <TouchableOpacity style={styles.prepStartBtn} onPress={handleStartExam} activeOpacity={0.85}>
              <Text style={styles.prepStartBtnText}>Start Test</Text>
              <View style={styles.prepStartBtnIcon}>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const examType: string = exam.type || 'LISTENING';
  const questions = exam.questions as any;
  const parts = questions?.parts || questions?.passages || questions?.tasks || [];

  // Writing
  const isWriting = examType === 'WRITING';
  const writingTasks = questions?.tasks || [];

  // Speaking
  const isSpeaking = examType === 'SPEAKING';
  const speakingParts = questions?.parts || [];

  // Reading
  const isReading = examType === 'READING';

  // Answered count display
  const answeredCount = isWriting
    ? [writingAnswers.task1, writingAnswers.task2].filter(v => v.trim()).length
    : isSpeaking
      ? Object.values(speakingAnswers).filter(v => v.trim()).length
      : Object.keys(answers).length;

  const totalCount = isWriting ? 2 : isSpeaking
    ? speakingParts.reduce((s: number, p: any) => s + (p.questions?.length || (p.cue_card ? 1 : 0)), 0)
    : undefined;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Sticky header */}
      <View style={styles.examHeader}>
        <TouchableOpacity
          onPress={() =>
            Alert.alert('Exit Test?', 'Progress will be saved.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Exit', style: 'destructive', onPress: () => router.back() },
            ])
          }
        >
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.examTitleContainer}>
          <Text style={styles.examTitle} numberOfLines={1}>{exam.title?.split(' - ')[1] ?? exam.title}</Text>
          <Badge label={examType} color="#fff" bg="rgba(255,255,255,0.2)" />
        </View>
        <View style={[styles.timerBadge, elapsed > (exam.duration - 5) * 60 && styles.timerWarning]}>
          <Ionicons name="timer-outline" size={14} color="#fff" />
          <Text style={styles.timerText}>{timerDisplay}</Text>
        </View>
      </View>

      {/* Audio bar (Listening only) — no pause/seek per exam rules */}
      {audioUrl && (
        <View style={styles.audioBannerContainer}>
          <View style={styles.audioBanner}>
            <View style={styles.audioStatusDot}>
              <View style={[styles.audioStatusDotInner, player.playing && styles.audioStatusDotActive]} />
            </View>
            <Text style={styles.audioLabel}>
              {player.playing ? 'Audio playing…' : 'Preparing audio…'}
            </Text>
            <View style={styles.volumeControl}>
              <TouchableOpacity onPress={() => setVolume(Math.max(0, volume - 0.2))} style={styles.volBtn}>
                <Ionicons name="volume-low" size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
              <View style={styles.volumeTrack}>
                <View style={[styles.volumeFill, { width: `${volume * 100}%` as any }]} />
              </View>
              <TouchableOpacity onPress={() => setVolume(Math.min(1, volume + 0.2))} style={styles.volBtn}>
                <Ionicons name="volume-high" size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Writing board */}
      {isWriting && (
        <WritingExamBlock
          tasks={writingTasks}
          answers={writingAnswers}
          onChange={setWritingAnswers}
        />
      )}

      {/* Speaking board */}
      {isSpeaking && (
        <SpeakingExamBlock
          parts={speakingParts}
          answers={speakingAnswers}
          onChange={setSpeakingAnswers}
          onSubmit={handleSubmit}
        />
      )}

      {/* Reading board */}
      {isReading && (
        <ReadingExamBlock
          parts={parts}
          answers={answers}
          onChange={setAnswer}
          renderGroup={renderGroup as any}
        />
      )}

      {/* Listening questions */}
      {!isWriting && !isSpeaking && !isReading && (
        <>
          {/* Part selector tabs — only shown when there are multiple parts */}
          {parts.length > 1 && (
            <View style={styles.listeningPartTabs}>
              {parts.map((part: any, pi: number) => {
                const isActive = activeListeningPartIndex === pi;
                return (
                  <TouchableOpacity
                    key={pi}
                    style={[styles.listeningPartTab, isActive && styles.listeningPartTabActive]}
                    onPress={() => handleListeningPartChange(pi)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.listeningPartTabLabel, isActive && styles.listeningPartTabLabelActive]}>
                      Part {part.part_number || pi + 1}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollArea}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 120 }}
          >
            {parts.length > 0 ? (() => {
              // Only render the active part — switching tab changes both audio and questions
              const pi = activeListeningPartIndex;
              const part = parts[pi];
              if (!part) return null;
              const groups = part.question_groups || part.groups || part.content || [];
              return (
                <View
                  key={pi}
                  style={styles.partSection}
                  onLayout={(e) => {
                    partOffsetsRef.current[pi] = e.nativeEvent.layout.y;
                  }}
                >
                  <Text style={styles.partTitle}>
                    Part {part.part_number || pi + 1}
                    {part.topic ? ` — ${part.topic}` : ''}
                  </Text>
                  {part.part_type && (
                    <Text style={styles.instructions}>{part.part_type}</Text>
                  )}
                  {groups.map((g: any, gi: number) => renderGroup(g, answers, setAnswer, gi, pi))}
                </View>
              );
            })() : (
              (questions.groups || []).map((g: any, gi: number) => renderGroup(g, answers, setAnswer, gi, 0))
            )}
          </ScrollView>
        </>
      )}

      {/* Submit bar */}
      <View style={styles.submitBar}>
        {/* Navigator toggle */}
        <TouchableOpacity
          style={styles.navToggleBtn}
          onPress={() => setNavOpen(v => !v)}
          activeOpacity={0.8}
        >
          <Ionicons name="grid-outline" size={18} color={COLORS.primary} />
          <Text style={styles.navToggleText}>
            {Object.keys(answers).length}/{totalCount ?? '?'}
          </Text>
        </TouchableOpacity>

        <Button
          title={submitting ? 'Submitting…' : 'Submit Test'}
          onPress={handleSubmit}
          loading={submitting}
          size="lg"
        />
      </View>

      {/* Question Navigator Drawer (Listening/Reading only) */}
      {!isWriting && !isSpeaking && totalCount !== undefined && (
        <QuestionNavigatorDrawer
          open={navOpen}
          onClose={() => setNavOpen(false)}
          totalQuestions={totalCount}
          answers={answers}
          onSelect={scrollToQuestion}
        />
      )}

      {/* AI Grading overlay */}
      {isAiGrading && (
        <AIGradingOverlay onGoBack={() => router.replace('/ielts/intensive' as any)} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: SPACING.md, color: COLORS.textSecondary },
  errorText: { fontSize: FONT_SIZES.lg, color: COLORS.error, marginBottom: SPACING.md },
  examHeader: {
    backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, gap: SPACING.md,
  },
  examTitleContainer: { flex: 1, gap: 4 },
  examTitle: { color: '#fff', fontSize: FONT_SIZES.sm, fontWeight: '700' },
  timerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  timerWarning: { backgroundColor: '#ef4444' },
  timerText: { color: '#fff', fontSize: FONT_SIZES.sm, fontWeight: '700', fontVariant: ['tabular-nums'] },
  
  audioBannerContainer: { backgroundColor: '#EEF2FF', borderBottomWidth: 1, borderColor: '#C7D2FE' },
  audioBanner: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.sm },
  audioStatusDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#C7D2FE', alignItems: 'center', justifyContent: 'center' },
  audioStatusDotInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#94A3B8' },
  audioStatusDotActive: { backgroundColor: '#EF4444' },
  audioLabel: { flex: 1, fontSize: FONT_SIZES.md, color: COLORS.primary, fontWeight: '600' },
  volumeControl: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  volBtn: { padding: 4 },
  volumeTrack: { width: 60, height: 6, backgroundColor: '#C7D2FE', borderRadius: 3, overflow: 'hidden' },
  volumeFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  scrollArea: { flex: 1 },
  partSection: { marginBottom: SPACING.xxl },
  partTitle: {
    fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text,
    marginBottom: SPACING.lg, paddingBottom: SPACING.sm, borderBottomWidth: 2, borderColor: COLORS.primary,
  },
  passageBox: {
    maxHeight: 220, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border,
  },
  passageText: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  instructions: {
    fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontStyle: 'italic',
    marginBottom: SPACING.md, padding: SPACING.md, backgroundColor: '#FFF9C4',
    borderRadius: RADIUS.md, borderLeftWidth: 3, borderLeftColor: COLORS.warning,
  },
  submitBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: '#fff',
    borderTopWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 8,
  },
  answeredCount: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontWeight: '600' },
  navToggleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.primary + '12', borderRadius: RADIUS.xl,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1.5, borderColor: COLORS.primary + '30',
  },
  navToggleText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.primary },
  // Listening part tab bar
  listeningPartTabs: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderBottomWidth: 1, borderColor: COLORS.border,
  },
  listeningPartTab: {
    flex: 1, alignItems: 'center', paddingVertical: SPACING.md,
    borderBottomWidth: 3, borderBottomColor: 'transparent',
  },
  listeningPartTabActive: { borderBottomColor: COLORS.primary },
  listeningPartTabLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textSecondary },
  listeningPartTabLabelActive: { color: COLORS.primary },

  // ── Preparation Screen (web-matched) ─────────────────────────────────────
  prepContainer: { flex: 1, backgroundColor: '#F9FAFB' },
  prepHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderColor: COLORS.border, backgroundColor: '#fff',
  },
  prepBack: { padding: 4 },
  prepHeaderTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  prepScroll: { padding: SPACING.lg, paddingBottom: 120 },

  // Title section
  prepTitleSection: { alignItems: 'center', marginBottom: SPACING.xl },
  prepCamBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.primary + '20', paddingHorizontal: SPACING.md, paddingVertical: 5,
    borderRadius: 99, marginBottom: SPACING.md,
  },
  prepCamBadgeText: { fontSize: FONT_SIZES.xs, fontWeight: '800', color: '#111', letterSpacing: 0.8, textTransform: 'uppercase' },
  prepGroupTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '900', color: '#111', textAlign: 'center', lineHeight: 34 },
  prepTestTitle: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: '#6B7280', textAlign: 'center', marginTop: 4 },
  prepDecorRow: { flexDirection: 'row', gap: 6, marginTop: SPACING.md, alignItems: 'center' },
  prepDecorBar: { height: 3, borderRadius: 99 },

  // Main card
  prepCard: {
    backgroundColor: '#fff', borderRadius: 24, borderWidth: 1, borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 24, elevation: 4,
  },
  prepCardLeft: { padding: SPACING.xl, gap: SPACING.md },
  prepCardDivider: { height: 1, backgroundColor: '#E5E7EB' },
  prepCardRight: { padding: SPACING.xl, gap: SPACING.md },
  prepSectionLabel: { fontSize: FONT_SIZES.xs, fontWeight: '900', color: '#9CA3AF', letterSpacing: 1.2, textTransform: 'uppercase' },

  // Detail rows
  prepDetailRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: '#F9FAFB', borderRadius: RADIUS.xl, padding: SPACING.md,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  prepDetailIcon: {
    width: 40, height: 40, borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary + '20', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  prepDetailMeta: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.8 },
  prepDetailValue: { fontSize: FONT_SIZES.md, fontWeight: '800', color: '#111', marginTop: 2 },
  prepNoticeBox: {
    backgroundColor: '#F9FAFB', borderRadius: RADIUS.xl, padding: SPACING.md,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  prepNoticeText: { fontSize: FONT_SIZES.sm, color: '#4B5563', fontWeight: '500', lineHeight: 22 },

  // Video section
  prepVideoHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  prepVideoWrapper: {
    borderRadius: RADIUS.xl, overflow: 'hidden', backgroundColor: '#000',
    aspectRatio: 16 / 9,
    borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 3,
  },
  prepVideo: { flex: 1 },
  prepVideoCaption: { fontSize: FONT_SIZES.xs, color: '#9CA3AF', textAlign: 'center', lineHeight: 18 },
  prepNoVideo: { alignItems: 'center', justifyContent: 'center', padding: SPACING.xxl, gap: SPACING.md },
  prepNoVideoText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },

  // Chips
  prepChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  prepChip: {
    backgroundColor: '#F3F4F6', borderRadius: 99, paddingHorizontal: SPACING.md, paddingVertical: 5,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  prepChipText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: '#6B7280' },

  // Footer
  prepFooter: {
    padding: SPACING.xl, borderTopWidth: 1, borderColor: COLORS.border, backgroundColor: '#fff',
  },
  prepStartBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.primary, borderRadius: 99,
    paddingVertical: SPACING.md, paddingLeft: SPACING.xl, paddingRight: SPACING.md,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
    alignSelf: 'center', minWidth: 200,
  },
  prepStartBtnText: { fontSize: FONT_SIZES.md, fontWeight: '900', color: '#111', letterSpacing: 0.3, textTransform: 'uppercase', paddingLeft: SPACING.sm },
  prepStartBtnIcon: {
    width: 32, height: 32, borderRadius: 99, backgroundColor: '#111',
    alignItems: 'center', justifyContent: 'center',
  },
});
