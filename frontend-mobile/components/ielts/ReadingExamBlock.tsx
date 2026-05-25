import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { TextWithLookup } from '../global/TextWithLookup';
import { useTheme } from '@/contexts/ThemeContext';
import PassageReview from './PassageReview';

// ─── Passage Text Sanitizer ──────────────────────────────────────────────────
// Mirrors web TakeReadingBoard.tsx logic exactly:
//   1. Remove inline Q-number annotations: *(Q12 — FALSE: reason)* or (Q3)
//   2. Remove **`highlighted word`** markers → just the word
//   3. Remove `word` code-span markers → just the word
//   4. Skip the first line if it is a duplicate of the topic
function stripPassageAnnotations(raw: string, topic: string): string {
  const topicClean = topic.trim().toLowerCase();
  return raw
    .split('\n')
    .filter((line) => {
      const stripped = line.replace(/\*\*/g, '').trim().toLowerCase();
      return stripped !== topicClean; // drop duplicate title
    })
    .map((line) => {
      let text = line;
      // Remove *(Q27, Q28 — strategic alliance)* style annotations
      text = text.replace(/\s*(?:\*)?\(Q[\d,\s–\-]+[^)]*\)(?:\*)?/g, '');
      // Remove **`word`** → word (highlighted answer words in passage)
      text = text.replace(/\*\*`(.*?)`\*\*/g, '$1');
      // Remove remaining `word` → word
      text = text.replace(/`(.*?)`/g, '$1');
      return text;
    })
    .join('\n');
}

// ─── Inline Markup Parser ─────────────────────────────────────────────────────
// Handles **bold** and *italic* in passage text
function parseInline(text: string, baseKey: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.*?)\*\*|\*(.*?)\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      parts.push(
        <Text key={`${baseKey}-b${match.index}`} style={{ fontWeight: '700' }}>
          {match[1]}
        </Text>,
      );
    } else if (match[2] !== undefined) {
      parts.push(
        <Text key={`${baseKey}-i${match.index}`} style={{ fontStyle: 'italic' }}>
          {match[2]}
        </Text>,
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

// ─── Passage Renderer ─────────────────────────────────────────────────────────
function PassageRenderer({ text, topic }: { text: string; topic?: string }) {
  const { colors } = useTheme();
  const paragraphs = useMemo(() => {
    const cleaned = stripPassageAnnotations(text, topic || '');
    return cleaned.split('\n').filter((p) => p.trim().length > 0);
  }, [text, topic]);

  return (
    <View style={pr.container}>
      {paragraphs.map((para, i) => {
        const key = `p${i}`;

        // Single-letter section heading: **A** or **A.** at start of line
        const sectionMatch = para.match(/^\*\*\s*([A-Z])\s*\.?\s*\*\*(.*)$/);
        if (sectionMatch) {
          return (
            <View key={key} style={pr.sectionBlock}>
              <Text style={[pr.sectionLetter, { color: colors.text }]}>
                {sectionMatch[1].toUpperCase()}
              </Text>
              {sectionMatch[2].trim().length > 0 && (
                <TextWithLookup
                  style={[pr.paragraph, { color: colors.text }]}
                  content={sectionMatch[2].trim()}
                />
              )}
            </View>
          );
        }

        // Full-line heading: **Some Title** (does NOT have trailing content)
        const headingMatch = para.match(/^\*\*(.*)\*\*$/);
        if (headingMatch) {
          const inner = headingMatch[1].trim();
          if (inner.toLowerCase() !== (topic || '').toLowerCase()) {
            return (
              <TextWithLookup
                key={key}
                style={[pr.heading, { color: colors.text }]}
                content={inner}
              />
            );
          }
          return null;
        }

        return (
          <TextWithLookup key={key} style={[pr.paragraph, { color: colors.text }]} content={para} />
        );
      })}
    </View>
  );
}

const pr = StyleSheet.create({
  container: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
  paragraph: {
    fontSize: FONT_SIZES.md,
    lineHeight: 28,
    marginBottom: SPACING.md,
  },
  heading: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  sectionBlock: { marginBottom: SPACING.sm },
  sectionLetter: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '900',
    marginBottom: 2,
  },
});

// ─── Reading Exam Block ───────────────────────────────────────────────────────

interface Props {
  parts: any[];
  answers: Record<string, string>;
  onChange: (key: string, value: string) => void;
  renderGroup: (
    g: any,
    answers: any,
    setAnswer: any,
    gi: number,
    pi: number,
    colors: any,
    isDark: boolean,
  ) => React.ReactNode;
  isAdvanced?: boolean;
  passageWithLocations?: any[] | null;
  locatedQuestion?: number | null;
  accentColor?: string;
}

export default function ReadingExamBlock({
  parts,
  answers,
  onChange,
  renderGroup,
  isAdvanced = false,
  passageWithLocations = null,
  locatedQuestion = null,
  accentColor,
}: Props) {
  const [activePartIdx, setActivePartIdx] = useState(0);
  const currentPart = parts[activePartIdx];
  const { width } = Dimensions.get('window');
  const isTablet = width > 600;
  const { colors, isDark } = useTheme();

  const questionsScrollRef = React.useRef<ScrollView>(null);
  const questionOffsetsRef = React.useRef<Record<number, number>>({});

  React.useEffect(() => {
    if (locatedQuestion == null) return;
    const y = questionOffsetsRef.current[locatedQuestion];
    if (y != null) {
      questionsScrollRef.current?.scrollTo({ y, animated: true });
    }
  }, [locatedQuestion]);

  // Phone split: topFlex is the passage pane share (0.2–0.8)
  const [topFlex, setTopFlex] = useState(0.48);
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gs) => {
          const screenH = Dimensions.get('window').height - 160;
          setTopFlex((prev) => Math.min(0.8, Math.max(0.2, prev + gs.dy / screenH)));
        },
      }),
    [],
  );

  // Build question range label from question_groups
  const groups: any[] = currentPart?.question_groups || currentPart?.groups || [];
  const qRange = useMemo(() => {
    const nums: number[] = [];
    groups.forEach((g: any) => {
      const raw = String(g.questions || g.questions_range || '');
      const matches = raw.match(/\d+/g);
      if (matches) nums.push(...matches.map(Number));
    });
    if (nums.length === 0) return null;
    return `${Math.min(...nums)}–${Math.max(...nums)}`;
  }, [groups]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Part tabs */}
      {parts.length > 1 && (
        <View style={[styles.tabs, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {parts.map((part, idx) => {
            const active = activePartIdx === idx;
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.tab, active && { borderBottomColor: colors.primary }]}
                onPress={() => setActivePartIdx(idx)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    { color: colors.textSecondary },
                    active && { color: colors.primary },
                  ]}
                >
                  Part {part.part_number || idx + 1}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Context bar: topic + question range */}
      {(currentPart?.topic || qRange) && (
        <View
          style={[
            styles.contextBar,
            { backgroundColor: isDark ? colors.surface : '#F2F1EF', borderColor: colors.border },
          ]}
        >
          {currentPart?.topic && (
            <Text style={[styles.contextTopic, { color: colors.text }]} numberOfLines={1}>
              {currentPart.topic}
            </Text>
          )}
          {qRange && (
            <Text style={[styles.contextRange, { color: colors.textSecondary }]}>
              Questions {qRange}
            </Text>
          )}
        </View>
      )}

      <View style={[styles.content, isTablet && styles.contentRow]}>
        {/* PASSAGE PANE */}
        <View
          style={[
            styles.pane,
            { backgroundColor: colors.background },
            !isTablet && { flex: topFlex },
            isTablet && { flex: 1, borderRightWidth: 1, borderColor: colors.border },
          ]}
        >
          <View style={[styles.paneHeader, { borderColor: colors.border + '40', paddingBottom: SPACING.sm }]}>
            <Ionicons name="book-outline" size={16} color={colors.primary} />
            <Text style={[styles.paneHeaderText, { color: colors.primary }]}>
              Reading Passage
            </Text>
          </View>
          {isAdvanced ? (
            <PassageReview
              passage={currentPart?.passage_text || currentPart?.passage || ''}
              passageWithLocations={passageWithLocations}
              locatedQuestion={locatedQuestion}
              accentColor={accentColor}
            />
          ) : (
            <ScrollView style={styles.scroll} nestedScrollEnabled showsVerticalScrollIndicator>
              {currentPart?.topic && (
                <Text style={[styles.passageTopic, { color: colors.text }]}>{currentPart.topic}</Text>
              )}
              <PassageRenderer
                text={currentPart?.passage_text || currentPart?.passage || ''}
                topic={currentPart?.topic}
              />
            </ScrollView>
          )}
        </View>

        {/* DRAG SPLITTER (phone) */}
        {!isTablet && (
          <View
            style={[
              styles.splitter,
              { backgroundColor: isDark ? colors.surface : '#E8E8E8', borderColor: colors.border },
            ]}
            {...panResponder.panHandlers}
          >
            <View
              style={[
                styles.splitterHandle,
                { backgroundColor: isDark ? colors.border : '#B0B0B0' },
              ]}
            />
          </View>
        )}

        {/* QUESTIONS PANE */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
          style={[
            styles.pane,
            { backgroundColor: colors.background },
            !isTablet && { flex: 1 - topFlex },
          ]}
        >
          <ScrollView
            ref={questionsScrollRef}
            style={styles.scroll}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: SPACING.lg, paddingBottom: SPACING.xxl }}
          >
            <View style={[styles.paneHeader, { borderColor: colors.border + '40' }]}>
              <Ionicons name="help-circle-outline" size={16} color={colors.warning} />
              <Text style={[styles.paneHeaderText, { color: colors.warning }]}>Questions</Text>
            </View>
            {groups.map((g: any, gi: number) => (
              <View
                key={gi}
                onLayout={(e) => {
                  const allNums: number[] = [];
                  const collectNums = (obj: any) => {
                    if (!obj || typeof obj !== 'object') return;
                    if (Array.isArray(obj)) {
                      obj.forEach(collectNums);
                      return;
                    }
                    if ('question_number' in obj) {
                      allNums.push(Number(obj.question_number));
                      return;
                    }
                    if ('question_numbers' in obj) {
                      (obj.question_numbers as number[]).forEach((x) => allNums.push(x));
                      return;
                    }
                    Object.values(obj).forEach(collectNums);
                  };
                  collectNums(g);
                  allNums.forEach((num) => {
                    questionOffsetsRef.current[num] = e.nativeEvent.layout.y;
                  });
                }}
              >
                {renderGroup(g, answers, onChange, gi, activePartIdx, colors, isDark)}
              </View>
            ))}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {},
  tabLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
  tabLabelActive: {},
  contextBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
  },
  contextTopic: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    marginRight: SPACING.sm,
  },
  contextRange: { fontSize: FONT_SIZES.xs, fontWeight: '500' },
  content: { flex: 1, flexDirection: 'column' },
  contentRow: { flexDirection: 'row' },
  pane: { flex: 1 },
  scroll: { flex: 1 },
  paneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: SPACING.lg,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
  },
  paneHeaderText: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
  passageTopic: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  splitter: {
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  splitterHandle: { width: 44, height: 4, borderRadius: 2 },
});
