import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';

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
              <Text style={pr.sectionLetter}>{sectionMatch[1].toUpperCase()}</Text>
              {sectionMatch[2].trim().length > 0 && (
                <Text style={pr.paragraph}>{parseInline(sectionMatch[2].trim(), key)}</Text>
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
              <Text key={key} style={pr.heading}>
                {inner}
              </Text>
            );
          }
          return null;
        }

        return (
          <Text key={key} style={pr.paragraph}>
            {parseInline(para, key)}
          </Text>
        );
      })}
    </View>
  );
}

const pr = StyleSheet.create({
  container: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
  paragraph: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 28,
    marginBottom: SPACING.md,
  },
  heading: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  sectionBlock: { marginBottom: SPACING.sm },
  sectionLetter: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 2,
  },
});

// ─── Reading Exam Block ───────────────────────────────────────────────────────

interface Props {
  parts: any[];
  answers: Record<string, string>;
  onChange: (key: string, value: string) => void;
  renderGroup: (g: any, answers: any, setAnswer: any, gi: number, pi: number) => React.ReactNode;
}

export default function ReadingExamBlock({ parts, answers, onChange, renderGroup }: Props) {
  const [activePartIdx, setActivePartIdx] = useState(0);
  const currentPart = parts[activePartIdx];
  const { width } = Dimensions.get('window');
  const isTablet = width > 600;

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
    <View style={styles.container}>
      {/* Part tabs */}
      <View style={styles.tabs}>
        {parts.map((part, idx) => {
          const active = activePartIdx === idx;
          return (
            <TouchableOpacity
              key={idx}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setActivePartIdx(idx)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                Part {part.part_number || idx + 1}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Context bar: topic + question range */}
      {(currentPart?.topic || qRange) && (
        <View style={styles.contextBar}>
          {currentPart?.topic && (
            <Text style={styles.contextTopic} numberOfLines={1}>
              {currentPart.topic}
            </Text>
          )}
          {qRange && <Text style={styles.contextRange}>Questions {qRange}</Text>}
        </View>
      )}

      <View style={[styles.content, isTablet && styles.contentRow]}>
        {/* PASSAGE PANE */}
        <View
          style={[
            styles.pane,
            !isTablet && { flex: topFlex },
            isTablet && { flex: 1, borderRightWidth: 1, borderColor: COLORS.border },
          ]}
        >
          <ScrollView style={styles.scroll} nestedScrollEnabled showsVerticalScrollIndicator>
            <View style={styles.paneHeader}>
              <Ionicons name="book-outline" size={16} color={COLORS.primary} />
              <Text style={styles.paneHeaderText}>Reading Passage</Text>
            </View>
            {currentPart?.topic && <Text style={styles.passageTopic}>{currentPart.topic}</Text>}
            <PassageRenderer
              text={currentPart?.passage_text || currentPart?.passage || ''}
              topic={currentPart?.topic}
            />
          </ScrollView>
        </View>

        {/* DRAG SPLITTER (phone) */}
        {!isTablet && (
          <View style={styles.splitter} {...panResponder.panHandlers}>
            <View style={styles.splitterHandle} />
          </View>
        )}

        {/* QUESTIONS PANE */}
        <View style={[styles.pane, !isTablet && { flex: 1 - topFlex }]}>
          <ScrollView
            style={styles.scroll}
            nestedScrollEnabled
            contentContainerStyle={{ padding: SPACING.lg, paddingBottom: SPACING.xxl }}
          >
            <View style={styles.paneHeader}>
              <Ionicons name="help-circle-outline" size={16} color="#D97706" />
              <Text style={[styles.paneHeaderText, { color: '#D97706' }]}>Questions</Text>
            </View>
            {groups.map((g: any, gi: number) =>
              renderGroup(g, answers, onChange, gi, activePartIdx),
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: COLORS.primary },
  tabLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textSecondary },
  tabLabelActive: { color: COLORS.primary },
  contextBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2F1EF',
    borderBottomWidth: 1,
    borderColor: '#E2E1DF',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
  },
  contextTopic: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  contextRange: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: '500' },
  content: { flex: 1, flexDirection: 'column' },
  contentRow: { flexDirection: 'row' },
  pane: { flex: 1, backgroundColor: '#FAF9F8' },
  scroll: { flex: 1 },
  paneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: SPACING.lg,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderColor: COLORS.border + '40',
  },
  paneHeaderText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.primary },
  passageTopic: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  splitter: {
    height: 22,
    backgroundColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  splitterHandle: { width: 44, height: 4, borderRadius: 2, backgroundColor: '#B0B0B0' },
});
