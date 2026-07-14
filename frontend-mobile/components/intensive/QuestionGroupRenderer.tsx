import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';
import { isCorrect } from '@/utils/answerNormalization';

import DiagramMapBlock from '@/components/ielts/DiagramMapBlock';
import MatchingBlock from '@/components/ielts/MatchingBlock';
import MCMultipleBlock from '@/components/ielts/MCMultipleBlock';
import FormCompletionBlock from '@/components/ielts/FormCompletionBlock';

function LocateButton({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} hitSlop={8} style={{ padding: 4 }}>
      <Ionicons name="locate-outline" size={16} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

// ─── MCQ Question ────────────────────────────────────────────────────────────
function MCQQuestionComponent({
  q,
  answers,
  onAnswer,
  onLocate,
  mode = 'edit',
  correctAnswers,
}: {
  q: any;
  answers: Record<string, string>;
  onAnswer: (key: string, value: string) => void;
  onLocate?: (qNum: number) => void;
  mode?: 'edit' | 'review';
  correctAnswers?: Record<string, string>;
}) {
  const { colors, isDark } = useTheme();
  const qStyles = createQStyles(colors, isDark);

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

  const qNums: string[] = q.question_numbers
    ? (q.question_numbers as number[]).map(String)
    : q.question_number != null
      ? [String(q.question_number)]
      : [];
  const isMulti = qNums.length > 1;
  const displayNum = qNums.join(' & ');

  const selectedLetters: string[] = qNums.map((k) => answers[k] || '').filter(Boolean);
  const isSelected = (letter: string) => selectedLetters.includes(letter);

  const handlePress = (letter: string) => {
    if (mode === 'review') return;
    if (!isMulti) {
      const key = qNums[0];
      if (!key) return;
      onAnswer(key, answers[key] === letter ? '' : letter);
      return;
    }
    if (isSelected(letter)) {
      const slotKey = qNums.find((k) => answers[k] === letter);
      if (slotKey) onAnswer(slotKey, '');
    } else {
      const emptySlot = qNums.find((k) => !answers[k]);
      if (emptySlot) onAnswer(emptySlot, letter);
      else onAnswer(qNums[qNums.length - 1], letter);
    }
  };

  return (
    <View style={[qStyles.block, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={[qStyles.qNumber, { color: colors.primary }]}>Q{displayNum}</Text>
        {onLocate && qNums.length === 1 && (
          <LocateButton onPress={() => onLocate(Number(qNums[0]))} />
        )}
      </View>
      {isMulti && (
        <Text
          style={[
            qStyles.multiHint,
            isDark
              ? { backgroundColor: 'rgba(217, 119, 6, 0.15)', color: '#fbbf24' }
              : { backgroundColor: '#FEF3C7', color: '#D97706' },
          ]}
        >
          Choose {qNums.length} letters
        </Text>
      )}
      <Text style={[qStyles.qText, { color: colors.text }]}>{questionText}</Text>
      {optionEntries.map(({ letter, label }) => {
        const sel = isSelected(letter);

        const isCorrectOpt = correctAnswers
          ? qNums.some((qNum) => {
              const list = (correctAnswers[qNum] || '')
                .split(',')
                .map((s) => s.trim().toUpperCase());
              return list.includes(letter.toUpperCase());
            })
          : false;

        let optionStyle: any = null;
        let bulletStyle: any = null;
        let bulletTextOverride: React.ReactNode = null;

        if (mode === 'review') {
          if (sel) {
            if (isCorrectOpt) {
              optionStyle = { borderColor: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.08)' };
              bulletStyle = { backgroundColor: '#22c55e', borderColor: '#22c55e' };
              bulletTextOverride = <Ionicons name="checkmark" size={12} color="#fff" />;
            } else {
              optionStyle = { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.08)' };
              bulletStyle = { backgroundColor: '#ef4444', borderColor: '#ef4444' };
              bulletTextOverride = <Ionicons name="close" size={12} color="#fff" />;
            }
          } else {
            if (isCorrectOpt) {
              optionStyle = {
                borderColor: '#22c55e',
                borderStyle: 'dashed',
                backgroundColor: 'rgba(34, 197, 94, 0.03)',
              };
              bulletStyle = { borderColor: '#22c55e', backgroundColor: 'transparent' };
              bulletTextOverride = <Ionicons name="checkmark" size={12} color="#22c55e" />;
            }
          }
        }

        return (
          <TouchableOpacity
            key={letter}
            style={[
              qStyles.option,
              { backgroundColor: colors.surface, borderColor: colors.border },
              sel && { borderColor: colors.primary, backgroundColor: colors.primary + '18' },
              optionStyle,
            ]}
            onPress={() => handlePress(letter)}
            activeOpacity={mode === 'review' ? 1 : 0.8}
          >
            <View
              style={[
                qStyles.optionBullet,
                { backgroundColor: colors.card, borderColor: colors.border },
                sel && { backgroundColor: colors.primary, borderColor: colors.primary },
                isMulti && qStyles.optionBulletMulti,
                isMulti && sel && { backgroundColor: colors.primary, borderColor: colors.primary },
                bulletStyle,
              ]}
            >
              {bulletTextOverride ? (
                bulletTextOverride
              ) : isMulti && sel ? (
                <Ionicons name="checkmark" size={12} color="#fff" />
              ) : (
                <Text
                  style={[
                    qStyles.optionLetter,
                    { color: colors.textSecondary },
                    sel && { color: '#fff' },
                  ]}
                >
                  {letter}
                </Text>
              )}
            </View>
            <Text
              style={[
                qStyles.optionText,
                { color: colors.text },
                sel && { color: colors.primary, fontWeight: '600' },
                mode === 'review' && isCorrectOpt && { color: '#16a34a', fontWeight: '600' },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}

      {mode === 'review' && (q.explanation || q.hint || q.explain) && (
        <View
          style={{
            marginTop: SPACING.md,
            padding: SPACING.md,
            borderRadius: RADIUS.lg,
            borderLeftWidth: 3,
            borderLeftColor: colors.primary,
            backgroundColor: isDark ? 'rgba(99, 102, 241, 0.08)' : colors.primary + '08',
            gap: 4,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="book-outline" size={14} color={colors.primary} />
            <Text style={{ fontSize: FONT_SIZES.xs, fontWeight: '700', color: colors.primary }}>
              EXPLANATION
            </Text>
          </View>
          <Text style={{ fontSize: FONT_SIZES.sm, color: colors.textSecondary, lineHeight: 20 }}>
            {q.explanation || q.hint || q.explain}
          </Text>
        </View>
      )}
    </View>
  );
}

export const MCQQuestion = React.memo(MCQQuestionComponent, (prev, next) => {
  const qNumsPrev = prev.q.question_numbers
    ? (prev.q.question_numbers as number[]).map(String)
    : prev.q.question_number != null
      ? [String(prev.q.question_number)]
      : [];
  for (const k of qNumsPrev) {
    if (prev.answers[k] !== next.answers[k]) return false;
    if (prev.correctAnswers?.[k] !== next.correctAnswers?.[k]) return false;
  }
  return (
    prev.q === next.q &&
    prev.mode === next.mode &&
    prev.onLocate === next.onLocate
  );
});

// ─── Fill blank Question ──────────────────────────────────────────────────────
function FillQuestionComponent({
  q,
  answer,
  onAnswer,
  onLocate,
  mode = 'edit',
  correctAnswers,
}: {
  q: any;
  answer: string;
  onAnswer: (v: string) => void;
  onLocate?: (qNum: number) => void;
  mode?: 'edit' | 'review';
  correctAnswers?: Record<string, string>;
}) {
  const { colors, isDark } = useTheme();
  const qStyles = createQStyles(colors, isDark);
  const questionText = q.question_text || q.question || q.text || '';
  const contextNote = q.note || q.additional_info || q.context || null;
  const qNums: string[] = q.question_numbers
    ? (q.question_numbers as number[]).map(String)
    : q.question_number != null
      ? [String(q.question_number)]
      : [];

  const qNum = qNums[0] || '';
  const correctVal = correctAnswers?.[qNum] || q.answer || '';
  const isCorrectAns = mode === 'review' ? isCorrect(answer, correctVal) : false;

  let inputStyle: any = null;
  if (mode === 'review') {
    if (isCorrectAns) {
      inputStyle = {
        borderColor: '#22c55e',
        color: '#15803d',
        backgroundColor: 'rgba(34, 197, 94, 0.04)',
      };
    } else {
      inputStyle = {
        borderColor: '#ef4444',
        color: '#b91c1c',
        backgroundColor: 'rgba(239, 68, 68, 0.04)',
      };
    }
  }

  return (
    <View style={[qStyles.block, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={[qStyles.qNumber, { color: colors.primary }]}>Q{qNums.join(' & ')}</Text>
        {onLocate && qNums.length === 1 && (
          <LocateButton onPress={() => onLocate(Number(qNums[0]))} />
        )}
      </View>
      {questionText ? (
        <Text style={[qStyles.qText, { color: colors.text }]}>{questionText}</Text>
      ) : null}
      {contextNote ? (
        <View
          style={[
            qStyles.contextNote,
            { backgroundColor: colors.surface, borderColor: colors.border + '80' },
          ]}
        >
          <Ionicons name="information-circle-outline" size={13} color={colors.textSecondary} />
          <Text style={[qStyles.contextNoteText, { color: colors.textSecondary }]}>
            {contextNote}
          </Text>
        </View>
      ) : null}
      <TextInput
        style={[qStyles.input, { borderColor: colors.border, color: colors.text }, inputStyle]}
        value={answer}
        onChangeText={onAnswer}
        placeholder={mode === 'review' ? 'No answer' : 'Type your answer…'}
        placeholderTextColor={colors.textMuted}
        returnKeyType="done"
        editable={mode !== 'review'}
      />

      {mode === 'review' && !isCorrectAns && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            marginTop: SPACING.sm,
            paddingHorizontal: SPACING.md,
            paddingVertical: 6,
            backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : '#DCFCE7',
            borderColor: isDark ? '#22c55e' : '#86EFAC',
            borderWidth: 1,
            borderRadius: RADIUS.md,
            alignSelf: 'flex-start',
          }}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={14}
            color={isDark ? '#4ade80' : '#15803D'}
          />
          <Text
            style={{
              fontSize: FONT_SIZES.xs,
              fontWeight: '700',
              color: isDark ? '#4ade80' : '#15803D',
            }}
          >
            Correct Answer: {correctVal}
          </Text>
        </View>
      )}

      {mode === 'review' && (q.explanation || q.hint || q.explain) && (
        <View
          style={{
            marginTop: SPACING.md,
            padding: SPACING.md,
            borderRadius: RADIUS.lg,
            borderLeftWidth: 3,
            borderLeftColor: colors.primary,
            backgroundColor: isDark ? 'rgba(99, 102, 241, 0.08)' : colors.primary + '08',
            gap: 4,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="book-outline" size={14} color={colors.primary} />
            <Text style={{ fontSize: FONT_SIZES.xs, fontWeight: '700', color: colors.primary }}>
              EXPLANATION
            </Text>
          </View>
          <Text style={{ fontSize: FONT_SIZES.sm, color: colors.textSecondary, lineHeight: 20 }}>
            {q.explanation || q.hint || q.explain}
          </Text>
        </View>
      )}
    </View>
  );
}

export const FillQuestion = React.memo(FillQuestionComponent, (prev, next) => {
  const qNumsPrev = prev.q.question_numbers
    ? (prev.q.question_numbers as number[]).map(String)
    : prev.q.question_number != null
      ? [String(prev.q.question_number)]
      : [];
  for (const k of qNumsPrev) {
    if (prev.answer !== next.answer) return false;
    if (prev.correctAnswers?.[k] !== next.correctAnswers?.[k]) return false;
  }
  return (
    prev.q === next.q &&
    prev.mode === next.mode &&
    prev.onLocate === next.onLocate
  );
});

// ─── Summary Blank Selector ──────────────────────────────────────────────────
function SummaryBlankSelectorComponent({
  qNum,
  value,
  displayLabel,
  options,
  answers,
  onSelect,
  onClear,
  mode = 'edit',
  correctAnswers,
}: {
  qNum: number;
  value: string;
  displayLabel: string;
  options: Record<string, string>;
  answers: Record<string, string>;
  onSelect: (letter: string) => void;
  onClear: () => void;
  mode?: 'edit' | 'review';
  correctAnswers?: Record<string, string>;
}) {
  const { colors, isDark } = useTheme();
  const qStyles = createQStyles(colors, isDark);
  const [open, setOpen] = React.useState(false);
  const filled = !!value;
  const usedLetters = new Set(Object.values(answers).filter((v) => v && v !== value));

  const qKey = String(qNum);
  const correctLetter = correctAnswers?.[qKey] || '';
  const isCorrectAns = mode === 'review' ? isCorrect(value, correctLetter) : false;

  let chipStyle: any = null;
  if (mode === 'review') {
    if (isCorrectAns) {
      chipStyle = { borderColor: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.04)' };
    } else {
      chipStyle = { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.04)' };
    }
  }

  return (
    <View
      style={[qStyles.selectorRow, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <TouchableOpacity
        style={[
          qStyles.selectorChip,
          filled && { backgroundColor: colors.primary + '08' },
          chipStyle,
        ]}
        onPress={() => {
          if (mode === 'review') return;
          setOpen((o) => !o);
        }}
        activeOpacity={mode === 'review' ? 1 : 0.75}
      >
        <View style={qStyles.selectorChipLeft}>
          <View style={[qStyles.summaryQBadge, { backgroundColor: colors.primary + '18' }]}>
            <Text style={[qStyles.summaryQBadgeText, { color: colors.primary }]}>{qNum}</Text>
          </View>
          {filled ? (
            <Text
              style={[
                qStyles.selectorChipValue,
                { color: colors.primary },
                mode === 'review' && isCorrectAns && { color: '#16a34a' },
                mode === 'review' && !isCorrectAns && { color: '#dc2626' },
              ]}
            >
              {displayLabel}
            </Text>
          ) : (
            <Text style={[qStyles.selectorChipPlaceholder, { color: colors.textSecondary }]}>
              {mode === 'review' ? 'No answer' : 'Tap to select an answer…'}
            </Text>
          )}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {filled && mode !== 'review' && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation?.();
                onClear();
                setOpen(false);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
          {mode !== 'review' && (
            <Ionicons
              name={open ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={colors.textSecondary}
            />
          )}
        </View>
      </TouchableOpacity>

      {mode === 'review' && !isCorrectAns && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            marginTop: 4,
            marginLeft: SPACING.md,
            marginBottom: SPACING.sm,
            paddingHorizontal: 8,
            paddingVertical: 4,
            backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : '#DCFCE7',
            borderColor: isDark ? '#22c55e' : '#86EFAC',
            borderWidth: 1,
            borderRadius: RADIUS.md,
            alignSelf: 'flex-start',
          }}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={12}
            color={isDark ? '#4ade80' : '#15803D'}
          />
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              color: isDark ? '#4ade80' : '#15803D',
            }}
          >
            Correct: {correctLetter} {options[correctLetter] ? `— ${options[correctLetter]}` : ''}
          </Text>
        </View>
      )}

      {open && (
        <ScrollView
          style={[qStyles.selectorList, { borderTopColor: colors.border + '80' }]}
          nestedScrollEnabled
        >
          {Object.entries(options).map(([letter, text]) => {
            const isActive = value === letter;
            const isUsed = !isActive && usedLetters.has(letter);
            return (
              <TouchableOpacity
                key={letter}
                style={[
                  qStyles.selectorListItem,
                  { borderBottomColor: colors.border + '40' },
                  isActive && { backgroundColor: colors.primary + '15' },
                ]}
                onPress={() => {
                  onSelect(letter);
                  setOpen(false);
                }}
                disabled={isUsed}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    qStyles.selectorListLetter,
                    { backgroundColor: isDark ? colors.surface : '#EFF6FF' },
                    isActive && { backgroundColor: colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      qStyles.selectorListLetterText,
                      { color: colors.primary },
                      isActive && { color: '#fff' },
                    ]}
                  >
                    {letter}
                  </Text>
                </View>
                <Text
                  style={[
                    qStyles.selectorListText,
                    { color: colors.text },
                    isUsed && { color: colors.textDisabled },
                  ]}
                >
                  {String(text)}
                </Text>
                {isActive && <Ionicons name="checkmark" size={16} color={colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

export const SummaryBlankSelector = React.memo(SummaryBlankSelectorComponent, (prev, next) => {
  return (
    prev.qNum === next.qNum &&
    prev.value === next.value &&
    prev.displayLabel === next.displayLabel &&
    prev.answers === next.answers &&
    prev.mode === next.mode &&
    prev.correctAnswers?.[String(prev.qNum)] === next.correctAnswers?.[String(prev.qNum)]
  );
});

// ─── Table Completion Block ──────────────────────────────────────────────────
function TableCompletionBlock({
  group,
  answers,
  onAnswer,
  onLocate,
  mode = 'edit',
  correctAnswers,
}: {
  group: any;
  answers: Record<string, string>;
  onAnswer: (key: string, value: string) => void;
  onLocate?: (qNum: number) => void;
  mode?: 'edit' | 'review';
  correctAnswers?: Record<string, string>;
}) {
  const { colors, isDark } = useTheme();
  const qStyles = createQStyles(colors, isDark);
  const tableData = group.table || group;
  let headers: string[] = Array.isArray(tableData.headers) ? tableData.headers : [];
  const rows: any[] = Array.isArray(tableData.rows) ? tableData.rows : [];

  // Fallback if headers are empty but rows are objects:
  if (headers.length === 0 && rows.length > 0 && !Array.isArray(rows[0])) {
    const allKeys = new Set<string>();
    rows.forEach(r => {
      if (r && typeof r === 'object') {
        Object.keys(r).forEach(k => {
          if (k !== 'questions') allKeys.add(k);
        });
      }
    });
    headers = Array.from(allKeys);
  }

  const rawQuestions = (Array.isArray(group.questions) ? group.questions : null) || group.items || [];
  const questionsList = Array.isArray(rawQuestions) ? rawQuestions : [];

  // Merge group questions and row-specific questions
  const qMap: Record<number, any> = { ...Object.fromEntries(questionsList.map((q: any) => [q.question_number, q])) };
  rows.forEach((row: any) => {
    if (Array.isArray(row)) {
      row.forEach((cell: any) => {
        if (cell && typeof cell.question_number === 'number') {
          qMap[cell.question_number] = {
            question_number: cell.question_number,
            answer: cell.answer || cell.text || '',
            ...cell,
          };
        }
      });
    } else if (row && row.questions) {
      Object.entries(row.questions).forEach(([qNumStr, qData]: [string, any]) => {
        qMap[Number(qNumStr)] = {
          question_number: Number(qNumStr),
          ...(typeof qData === 'object' ? qData : { answer: qData }),
        };
      });
    }
  });

  if (rows.length === 0) {
    return (
      <FormCompletionBlock
        key={group.id || `table-fallback-${group.instructions}`}
        group={group}
        answers={answers}
        onAnswer={onAnswer}
        mode={mode}
        correctAnswers={correctAnswers}
      />
    );
  }

  const maxCols = Math.max(headers.length, ...rows.map(r => Array.isArray(r) ? r.length : 0));

  const renderTableInput = (qNum: number) => {
    const key = String(qNum);
    const value = answers[key] || '';
    const qData = qMap[qNum] || {};
    const correctVal = correctAnswers?.[key] || qData.answer || '';
    const isCorrectAns = mode === 'review' ? isCorrect(value, correctVal) : false;

    let inputBorderColor = colors.border;
    let inputBgColor = colors.card;
    let inputTextColor = colors.text;

    if (mode === 'review') {
      if (value) {
        if (isCorrectAns) {
          inputBorderColor = '#22c55e';
          inputBgColor = 'rgba(34, 197, 94, 0.08)';
          inputTextColor = '#16a34a';
        } else {
          inputBorderColor = '#ef4444';
          inputBgColor = 'rgba(239, 68, 68, 0.08)';
          inputTextColor = '#ef4444';
        }
      } else {
        inputBorderColor = '#ef4444';
        inputBgColor = 'rgba(239, 68, 68, 0.03)';
        inputTextColor = '#ef4444';
      }
    }

    return (
      <View style={{ gap: 2, marginVertical: 2 }} key={key}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: inputBorderColor,
            backgroundColor: inputBgColor,
            borderRadius: RADIUS.md,
            paddingHorizontal: 8,
            paddingVertical: 4,
            minWidth: 80,
            maxWidth: 150,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: 'bold',
              color: mode === 'review' ? (isCorrectAns ? '#16a34a' : '#ef4444') : colors.primary,
              marginRight: 4,
            }}
          >
            {qNum}
          </Text>
          <TextInput
            style={{
              flex: 1,
              fontSize: FONT_SIZES.sm,
              color: inputTextColor,
              padding: 0,
              margin: 0,
              fontWeight: '600',
              height: 20,
            }}
            value={value}
            onChangeText={(v) => onAnswer(key, v)}
            placeholder="..."
            placeholderTextColor={colors.textMuted}
            editable={mode !== 'review'}
            returnKeyType="done"
          />
          {mode === 'review' && (
            <Ionicons
              name={isCorrectAns ? 'checkmark-circle' : 'close-circle'}
              size={12}
              color={isCorrectAns ? '#22c55e' : '#ef4444'}
              style={{ marginLeft: 4 }}
            />
          )}
        </View>
        {mode === 'review' && !isCorrectAns && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, paddingLeft: 2 }}>
            <Ionicons name="checkmark-circle-outline" size={10} color="#16a34a" />
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#16a34a' }} numberOfLines={1}>
              {correctVal}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderCellText = (text: string, cellQNum?: number) => {
    const blankRegex = /(\d+)\s*(?:_+|\.{3,}|\[blank\])/g;
    const matches = Array.from(text.matchAll(blankRegex));

    if (matches.length === 0) {
      if (cellQNum) {
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
            {text ? <Text style={{ fontSize: FONT_SIZES.sm, color: colors.text }}>{text}</Text> : null}
            {renderTableInput(cellQNum)}
          </View>
        );
      }
      return <Text style={{ fontSize: FONT_SIZES.sm, color: colors.text }}>{text}</Text>;
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const matchText = match[0];
      const matchIndex = match.index ?? 0;
      const qNum = Number(match[1]);

      if (matchIndex > lastIndex) {
        parts.push(
          <Text key={`text-${lastIndex}`} style={{ fontSize: FONT_SIZES.sm, color: colors.text }}>
            {text.slice(lastIndex, matchIndex)}
          </Text>
        );
      }

      parts.push(
        <View key={`input-wrap-${qNum}`} style={{ marginHorizontal: 2 }}>
          {renderTableInput(qNum)}
        </View>
      );

      lastIndex = matchIndex + matchText.length;
    }

    if (lastIndex < text.length) {
      parts.push(
        <Text key={`text-${lastIndex}`} style={{ fontSize: FONT_SIZES.sm, color: colors.text }}>
          {text.slice(lastIndex)}
        </Text>
      );
    }

    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
        {parts}
      </View>
    );
  };

  const renderObjectCell = (val: any, row: any) => {
    if (Array.isArray(val)) {
      return (
        <View style={{ gap: 4 }}>
          {val.map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 4 }}>
              <Text style={{ color: colors.textSecondary, marginTop: 4 }}>•</Text>
              <View style={{ flex: 1 }}>{renderCellText(String(item))}</View>
            </View>
          ))}
        </View>
      );
    }
    return renderCellText(String(val));
  };

  return (
    <View style={{ marginBottom: SPACING.xl }}>
      {group.instructions ? (
        <Text style={[qStyles.instructions, { color: colors.textSecondary, backgroundColor: colors.surface, borderLeftColor: colors.primary }]}>
          {group.instructions}
        </Text>
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator style={{ marginVertical: SPACING.md }}>
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: RADIUS.lg,
            overflow: 'hidden',
            backgroundColor: colors.card,
          }}
        >
          {/* Header row */}
          {headers.length > 0 && (
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: isDark ? colors.surface : '#F8FAFC',
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              {headers.map((header: string, hIdx: number) => (
                <View
                  key={`h-${hIdx}`}
                  style={{
                    width: 160,
                    padding: 12,
                    borderRightWidth: hIdx === headers.length - 1 ? 0 : 1,
                    borderRightColor: colors.border,
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontWeight: '800', color: colors.primary, fontSize: FONT_SIZES.sm }}>
                    {header}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Rows */}
          {rows.map((row: any, rIdx: number) => (
            <View
              key={`r-${rIdx}`}
              style={{
                flexDirection: 'row',
                borderBottomWidth: rIdx === rows.length - 1 ? 0 : 1,
                borderBottomColor: colors.border,
                backgroundColor: rIdx % 2 === 1 ? (isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC40') : colors.card,
              }}
            >
              {Array.from({ length: maxCols }).map((_, cIdx: number) => {
                const isRowArray = Array.isArray(row);
                if (isRowArray) {
                  const cell = row[cIdx];
                  return (
                    <View
                      key={`c-${rIdx}-${cIdx}`}
                      style={{
                        width: 160,
                        padding: 12,
                        borderRightWidth: cIdx === maxCols - 1 ? 0 : 1,
                        borderRightColor: colors.border,
                        justifyContent: 'center',
                      }}
                    >
                      {cell ? renderCellText(cell.text || '', cell.question_number) : null}
                    </View>
                  );
                } else {
                  const header = headers[cIdx];
                  const cellVal = header ? row[header] : undefined;
                  return (
                    <View
                      key={`c-${rIdx}-${cIdx}`}
                      style={{
                        width: 160,
                        padding: 12,
                        borderRightWidth: cIdx === maxCols - 1 ? 0 : 1,
                        borderRightColor: colors.border,
                        justifyContent: 'center',
                      }}
                    >
                      {cellVal !== undefined ? renderObjectCell(cellVal, row) : null}
                    </View>
                  );
                }
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const DIAGRAM_TYPES = new Set([
  'diagram_labelling',
  'diagram_completion',
  'map_labelling',
  'plan_labelling',
]);
const MATCHING_TYPES = new Set([
  'matching',
  'matching_headings',
  'matching_features',
  'matching_information',
  'matching_sentence_endings',
]);

// ─── Render question groups ──────────────────────────────────────────────────
export function renderGroup(
  group: any,
  answers: Record<string, string>,
  setAnswer: (k: string, v: string) => void,
  groupIdx = 0,
  partIdx = 0,
  colors?: any,
  isDark?: boolean,
  onLocate?: (qNum: number) => void,
  mode: 'edit' | 'review' = 'edit',
  correctAnswers?: Record<string, string>,
) {
  const type = group.question_type || group.type || 'fill';
  const qStyles = createQStyles(colors || {}, isDark || false);
  const baseKey = `p${partIdx}-g${groupIdx}-${type}`;

  let questions: any[] = [];

  if (Array.isArray(group.items)) {
    questions = group.items;
  } else if (Array.isArray(group.content)) {
    const firstItem = group.content[0];
    if (firstItem && Array.isArray(firstItem.points)) {
      questions = group.content.flatMap((section: any) => section.points || []);
    } else {
      questions = group.content;
    }
  } else if (Array.isArray(group.points)) {
    questions = group.points;
  }
  const answerableQuestions = questions.filter(
    (q: any) => q.question_number != null || Array.isArray(q.question_numbers),
  );

  const originalType = (group.type || '').toLowerCase();
  const isTable = type.toLowerCase().includes('table') || originalType.includes('table') || !!group.table;
  const isMCMulti = type.toLowerCase().includes('multiple_choice_multiple') || type.toLowerCase().includes('more_than_one_answer') || originalType.includes('multiple_choice_multiple') || originalType.includes('more_than_one_answer');

  const isMatchingType = MATCHING_TYPES.has(type.toLowerCase().replace(/ /g, '_'));
  const isDiagramType = DIAGRAM_TYPES.has(type.toLowerCase().replace(/ /g, '_'));
  const isMCQ = type.toLowerCase().includes('multiple') || Array.isArray(group.items) || isMCMulti;

  const isTFNG = /true.false|yes.no/i.test(type);
  const tfOptions = /yes.no/i.test(type)
    ? { YES: 'Yes', NO: 'No', 'NOT GIVEN': 'Not Given' }
    : { TRUE: 'True', FALSE: 'False', 'NOT GIVEN': 'Not Given' };

  const optionsBox = group.options_box || null;

  if (isDiagramType) {
    return (
      <DiagramMapBlock
        key={baseKey}
        group={group}
        answers={answers}
        onAnswer={setAnswer}
        mode={mode}
        correctAnswers={correctAnswers}
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
        mode={mode}
        correctAnswers={correctAnswers}
      />
    );
  }

  if (isTable) {
    return (
      <TableCompletionBlock
        key={baseKey}
        group={group}
        answers={answers}
        onAnswer={setAnswer}
        onLocate={onLocate}
        mode={mode}
        correctAnswers={correctAnswers}
      />
    );
  }

  if (isMCMulti) {
    return (
      <MCMultipleBlock
        key={baseKey}
        group={group}
        groupIdx={groupIdx}
        answer={answers[`mcm-${groupIdx}`] || ''}
        onAnswer={setAnswer}
        mode={mode}
        correctAnswers={correctAnswers}
      />
    );
  }

  const hasSections =
    Array.isArray(group.content) &&
    group.content.some((section: any) => section && Array.isArray(section.points));

  const FORM_TYPES = new Set([
    'form_completion',
    'note_completion',
    'flowchart_completion',
    'flow_chart',
  ]);
  if (FORM_TYPES.has(type.toLowerCase().replace(/ /g, '_')) && !hasSections) {
    return (
      <FormCompletionBlock
        key={baseKey}
        group={group}
        answers={answers}
        onAnswer={setAnswer}
        mode={mode}
        correctAnswers={correctAnswers}
      />
    );
  }

  const renderPassageContext = (rawText: string, cKey: string) => {
    const regex = /(\d+)\s*\[blank\]/g;
    const segments: { type: 'text' | 'badge'; content: string }[] = [];
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

    return (
      <View
        style={[
          qStyles.passageContextWrap,
          colors && {
            backgroundColor: isDark ? colors.surface : '#F8F9FA',
            borderColor: colors.border,
            borderLeftColor: colors.primary + '80',
          },
        ]}
      >
        <Text style={[qStyles.passageContextText, colors && { color: colors.text }]}>
          {segments.map((seg, i) =>
            seg.type === 'badge' ? (
              <Text
                key={`${cKey}-seg${i}`}
                style={[qStyles.blankBadge, colors && { backgroundColor: colors.primary }]}
              >
                {' '}
                {seg.content}{' '}
              </Text>
            ) : (
              <Text key={`${cKey}-seg${i}`}>{seg.content}</Text>
            ),
          )}
        </Text>
      </View>
    );
  };

  const renderSummaryInline = (section: any, sKey: string) => {
    const rawText: string = section.text || '';
    const points: { question_number: number }[] = (section.points || []).filter(
      (p: any) => typeof p.question_number === 'number',
    );
    const hasWordBank = !!(optionsBox && optionsBox.options);

    return (
      <View key={sKey} style={qStyles.sectionBlock}>
        {section.heading && (
          <Text
            style={[
              qStyles.sectionHeading,
              colors && { color: colors.primary, borderBottomColor: colors.border + '60' },
            ]}
          >
            {section.heading}
          </Text>
        )}
        {rawText.length > 0 && renderPassageContext(rawText, sKey)}
        <View style={qStyles.summaryAnswerList}>
          {points.map((p) => {
            const qNum = p.question_number;
            const qKey = String(qNum);
            const currentVal = answers[qKey] || '';

            if (hasWordBank) {
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
                  mode={mode}
                  correctAnswers={correctAnswers}
                />
              );
            }

            return (
              <View key={qKey}>
                <View
                  style={[
                    qStyles.summaryAnswerRow,
                    colors && { backgroundColor: colors.card, borderColor: colors.border },
                    mode === 'review' &&
                      answers[qKey] &&
                      isCorrect(answers[qKey], correctAnswers?.[qKey] || '') && {
                        borderColor: '#22c55e',
                        backgroundColor: 'rgba(34,197,94,0.04)',
                      },
                    mode === 'review' &&
                      answers[qKey] &&
                      !isCorrect(answers[qKey], correctAnswers?.[qKey] || '') && {
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239,68,68,0.04)',
                      },
                  ]}
                >
                  <View
                    style={[
                      qStyles.summaryQBadge,
                      colors && { backgroundColor: colors.primary + '18' },
                    ]}
                  >
                    <Text style={[qStyles.summaryQBadgeText, colors && { color: colors.primary }]}>
                      {qNum}
                    </Text>
                  </View>
                  <TextInput
                    style={[
                      qStyles.summaryAnswerInput,
                      colors && { color: colors.text, borderBottomColor: colors.border },
                      mode === 'review' &&
                        answers[qKey] &&
                        isCorrect(answers[qKey], correctAnswers?.[qKey] || '') && {
                          color: '#15803d',
                        },
                      mode === 'review' &&
                        answers[qKey] &&
                        !isCorrect(answers[qKey], correctAnswers?.[qKey] || '') && {
                          color: '#b91c1c',
                        },
                    ]}
                    value={currentVal}
                    onChangeText={(v) => setAnswer(qKey, v)}
                    placeholder={mode === 'review' ? 'No answer' : 'Type answer...'}
                    placeholderTextColor={colors ? colors.textMuted : '#94A3B8'}
                    returnKeyType="done"
                    editable={mode !== 'review'}
                  />
                </View>
                {mode === 'review' && !isCorrect(answers[qKey], correctAnswers?.[qKey] || '') && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      marginTop: 4,
                      marginLeft: SPACING.md,
                      marginBottom: SPACING.sm,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : '#DCFCE7',
                      borderColor: isDark ? '#22c55e' : '#86EFAC',
                      borderWidth: 1,
                      borderRadius: RADIUS.md,
                      alignSelf: 'flex-start',
                    }}
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={12}
                      color={isDark ? '#4ade80' : '#15803D'}
                    />
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '700',
                        color: isDark ? '#4ade80' : '#15803D',
                      }}
                    >
                      Correct: {correctAnswers?.[qKey] || ''}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View key={baseKey}>
      {group.instructions && <Text style={[qStyles.instructions]}>{group.instructions}</Text>}

      {hasSections
        ? group.content.map((section: any, si: number) => {
            const sKey = `${baseKey}-s${si}`;
            const sectionPoints = section.points ?? [];
            const hasSummaryText =
              typeof section.text === 'string' && section.text.includes('[blank]');

            if (hasSummaryText) {
              return renderSummaryInline(section, sKey);
            }

            return (
              <View key={sKey} style={qStyles.sectionBlock}>
                {section.heading && (
                  <Text
                    style={[
                      qStyles.sectionHeading,
                      colors && { color: colors.primary, borderBottomColor: colors.border + '60' },
                    ]}
                  >
                    {section.heading}
                  </Text>
                )}
                {section.text && (
                  <Text style={[qStyles.sectionText, colors && { color: colors.text }]}>
                    {section.text}
                  </Text>
                )}
                {sectionPoints
                  .filter((q: any) => q.question_number != null)
                  .map((q: any) => {
                    const num = String(q.question_number);
                    const qKey = `${sKey}-${num}`;
                    if (isTFNG) {
                      return (
                        <MCQQuestion
                          key={qKey}
                          q={{ ...q, options: tfOptions }}
                          answers={answers}
                          onAnswer={setAnswer}
                          onLocate={onLocate}
                          mode={mode}
                          correctAnswers={correctAnswers}
                        />
                      );
                    }
                    if (optionsBox?.options) {
                      const currentVal = answers[num] || '';
                      const displayLabel = optionsBox.options[currentVal]
                        ? `${currentVal} — ${optionsBox.options[currentVal]}`
                        : '';
                      return (
                        <SummaryBlankSelector
                          key={qKey}
                          qNum={Number(num)}
                          value={currentVal}
                          displayLabel={displayLabel}
                          options={optionsBox.options}
                          answers={answers}
                          onSelect={(letter) => setAnswer(num, letter)}
                          onClear={() => setAnswer(num, '')}
                          mode={mode}
                          correctAnswers={correctAnswers}
                        />
                      );
                    }
                    if (isMCQ || q.options || q.type === 'multiple_choice' || String(q.question_type || q.type || '').toLowerCase().includes('multiple_choice')) {
                      return (
                        <MCQQuestion
                          key={qKey}
                          q={q}
                          answers={answers}
                          onAnswer={setAnswer}
                          onLocate={onLocate}
                          mode={mode}
                          correctAnswers={correctAnswers}
                        />
                      );
                    }
                    return (
                      <FillQuestion
                        key={qKey}
                        q={q}
                        answer={answers[num] || ''}
                        onAnswer={(v) => setAnswer(num, v)}
                        onLocate={onLocate}
                        mode={mode}
                        correctAnswers={correctAnswers}
                      />
                    );
                  })}
              </View>
            );
          })
        : answerableQuestions.map((q: any, qi: number) => {
            const num =
              q.question_number != null ? String(q.question_number) : `${baseKey}-qi${qi}`;
            const qKey = `${baseKey}-${num}`;

            if (isTFNG) {
              return (
                <MCQQuestion
                  key={qKey}
                  q={{ ...q, options: tfOptions }}
                  answers={answers}
                  onAnswer={setAnswer}
                  onLocate={onLocate}
                  mode={mode}
                  correctAnswers={correctAnswers}
                />
              );
            }
            if (optionsBox?.options) {
              const currentVal = answers[num] || '';
              const displayLabel = optionsBox.options[currentVal]
                ? `${currentVal} — ${optionsBox.options[currentVal]}`
                : '';
              return (
                <SummaryBlankSelector
                  key={qKey}
                  qNum={Number(num)}
                  value={currentVal}
                  displayLabel={displayLabel}
                  options={optionsBox.options}
                  answers={answers}
                  onSelect={(letter) => setAnswer(num, letter)}
                  onClear={() => setAnswer(num, '')}
                  mode={mode}
                  correctAnswers={correctAnswers}
                />
              );
            }
            if (isMCQ) {
              return (
                <MCQQuestion
                  key={qKey}
                  q={q}
                  answers={answers}
                  onAnswer={setAnswer}
                  onLocate={onLocate}
                  mode={mode}
                  correctAnswers={correctAnswers}
                />
              );
            }
            return (
              <FillQuestion
                key={qKey}
                q={q}
                answer={answers[num] || ''}
                onAnswer={(v) => setAnswer(num, v)}
                onLocate={onLocate}
                mode={mode}
                correctAnswers={correctAnswers}
              />
            );
          })}
    </View>
  );
}

const createQStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    block: {
      marginBottom: SPACING.xl,
      padding: SPACING.lg,
      borderRadius: RADIUS.xl,
      borderWidth: 1,
    },
    qNumber: {
      fontSize: FONT_SIZES.xs,
      fontWeight: '700',
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    multiHint: {
      fontSize: FONT_SIZES.xs,
      fontWeight: '600',
      marginBottom: SPACING.sm,
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 99,
    },
    qText: { fontSize: FONT_SIZES.md, marginBottom: SPACING.md, lineHeight: 22 },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: SPACING.md,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      marginBottom: SPACING.sm,
    },
    optionBullet: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: SPACING.md,
    },
    optionBulletMulti: { borderRadius: 6 },
    optionLetter: { fontWeight: '700', fontSize: FONT_SIZES.sm },
    optionText: { flex: 1, fontSize: FONT_SIZES.md },
    input: {
      borderWidth: 1,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      fontSize: FONT_SIZES.md,
    },
    contextNote: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 4,
      marginBottom: SPACING.sm,
      padding: SPACING.sm,
      borderRadius: RADIUS.sm,
      borderWidth: 1,
    },
    contextNoteText: {
      flex: 1,
      fontSize: FONT_SIZES.xs,
      lineHeight: 18,
    },
    sectionBlock: { marginBottom: SPACING.lg },
    sectionHeading: {
      fontSize: FONT_SIZES.sm,
      fontWeight: '700',
      marginBottom: SPACING.sm,
      paddingBottom: 4,
      borderBottomWidth: 1,
    },
    sectionText: {
      fontSize: FONT_SIZES.sm,
      lineHeight: 22,
      marginBottom: SPACING.md,
    },
    passageContextWrap: {
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderLeftWidth: 3,
      padding: SPACING.md,
      marginBottom: SPACING.lg,
    },
    passageContextText: {
      fontSize: FONT_SIZES.sm,
      lineHeight: 26,
    },
    blankBadge: {
      color: '#fff',
      fontWeight: '800',
      fontSize: 11,
      borderRadius: 4,
      paddingHorizontal: 5,
      overflow: 'hidden',
    },
    summaryAnswerList: { gap: SPACING.sm, marginTop: SPACING.sm },
    summaryAnswerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
    },
    summaryQBadge: {
      width: 30,
      height: 30,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    summaryQBadgeText: { fontSize: FONT_SIZES.xs, fontWeight: '800' },
    summaryAnswerInput: {
      flex: 1,
      fontSize: FONT_SIZES.sm,
      paddingVertical: 4,
      borderBottomWidth: 1.5,
    },
    selectorRow: {
      borderRadius: RADIUS.md,
      borderWidth: 1,
      marginBottom: SPACING.sm,
      overflow: 'hidden',
    },
    selectorChip: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.md,
    },
    selectorChipLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 },
    selectorChipLabel: { fontSize: FONT_SIZES.sm },
    selectorChipValue: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
    selectorChipPlaceholder: { fontSize: FONT_SIZES.sm },
    selectorList: {
      borderTopWidth: 1,
      maxHeight: 220,
    },
    selectorListItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
      paddingHorizontal: SPACING.md,
      paddingVertical: 10,
      borderBottomWidth: 1,
    },
    selectorListLetter: {
      width: 28,
      height: 28,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectorListLetterText: { fontSize: 13, fontWeight: '800' },
    selectorListText: { flex: 1, fontSize: FONT_SIZES.sm },
    instructions: {
      fontSize: FONT_SIZES.sm,
      fontStyle: 'italic',
      marginBottom: SPACING.md,
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      borderLeftWidth: 3,
    },
  });
