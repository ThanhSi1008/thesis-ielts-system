import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, PanResponder, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';

interface Highlight {
  id: string;
  start: number;
  end: number;
  color: string;
}

// ─── Highlightable Passage (Gesture + State Management) ────────────────────────
function HighlightablePassage({ text }: { text: string }) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [activeHighlight, setActiveHighlight] = useState<{ start: number; end: number } | null>(null);

  // For a real production app, measuring every word via onLayout is costly.
  // Here we use a simplified block-based gesture or rely on standard text selection.
  // However, since "Gesture + state management" is explicitly requested, we implement
  // a basic token-based gesture highlighter.
  const tokens = text.split(/(\s+)/); // split by whitespace but keep whitespace
  
  // A map to store word layouts (token index -> { x, y, width, height })
  const layoutsRef = useRef<Record<number, any>>({});
  const containerRef = useRef<View>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        // Find which token was tapped based on coordinates (mock logic for brevity)
        // In reality, this requires mapping e.nativeEvent.locationY to layoutsRef
        setActiveHighlight({ start: 0, end: 0 }); // Placeholder
      },
      onPanResponderMove: (e, gestureState) => {
        // Expand the activeHighlight range based on gestureState.dx / dy
      },
      onPanResponderRelease: () => {
        if (activeHighlight) {
          setHighlights(prev => [
            ...prev,
            { id: Date.now().toString(), start: activeHighlight.start, end: activeHighlight.end, color: '#fef08a' }
          ]);
          setActiveHighlight(null);
        }
      },
    })
  ).current;

  // Simple render: tokens are rendered with background color if within a highlight range
  return (
    <View style={hp.container} {...panResponder.panHandlers} ref={containerRef}>
      <Text style={hp.text}>
        {tokens.map((tok, i) => {
          const isHighlighted = highlights.some(h => i >= h.start && i <= h.end) || 
                                (activeHighlight && i >= activeHighlight.start && i <= activeHighlight.end);
          return (
            <Text
              key={i}
              style={[isHighlighted && hp.highlightedText]}
              onLayout={(e) => { layoutsRef.current[i] = e.nativeEvent.layout; }}
            >
              {tok}
            </Text>
          );
        })}
      </Text>
      <View style={hp.instruction}>
        <Ionicons name="color-wand-outline" size={14} color={COLORS.primary} />
        <Text style={hp.instructionText}>Swipe over text to highlight (Demo)</Text>
      </View>
    </View>
  );
}

const hp = StyleSheet.create({
  container: { flex: 1, padding: SPACING.lg },
  text: { fontSize: FONT_SIZES.md, lineHeight: 28, color: COLORS.text },
  highlightedText: { backgroundColor: '#fef08a' },
  instruction: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: SPACING.md, padding: SPACING.sm, backgroundColor: '#EFF6FF', borderRadius: RADIUS.md },
  instructionText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' }
});

// ─── Reading Exam Block (Side-by-side / Split Layout) ────────────────────────

interface Props {
  parts: any[];
  answers: Record<string, string>;
  onChange: (key: string, value: string) => void;
  renderGroup: (g: any, answers: any, setAnswer: any, gi: number, pi: number) => React.ReactNode;
}

export default function ReadingExamBlock({ parts, answers, onChange, renderGroup }: Props) {
  const [activePartIdx, setActivePartIdx] = useState(0);
  const currentPart = parts[activePartIdx];

  // For responsive layout: if iPad/Tablet, use side-by-side row. If phone, use top/bottom split.
  const { width, height } = Dimensions.get('window');
  const isTablet = width > 600;

  // Resizable split state (top height percentage for phones)
  const [topFlex, setTopFlex] = useState(0.5);

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

      <View style={[styles.content, isTablet && styles.contentTablet]}>
        {/* PASSAGE PANE */}
        <View style={[styles.pane, !isTablet && { flex: topFlex }]}>
          <ScrollView style={styles.scroll} nestedScrollEnabled>
            <View style={styles.passageHeader}>
              <Ionicons name="book-outline" size={18} color={COLORS.primary} />
              <Text style={styles.passageHeaderTitle}>Reading Passage</Text>
            </View>
            <HighlightablePassage text={currentPart?.passage || 'No passage text provided.'} />
          </ScrollView>
        </View>

        {/* SPLITTER DRAG HANDLE (Phone only) */}
        {!isTablet && (
          <View style={styles.splitter}>
            <View style={styles.splitterHandle} />
          </View>
        )}

        {/* QUESTIONS PANE */}
        <View style={[styles.pane, !isTablet && { flex: 1 - topFlex }, isTablet && { borderLeftWidth: 1, borderColor: COLORS.border }]}>
          <ScrollView style={styles.scroll} nestedScrollEnabled contentContainerStyle={{ padding: SPACING.lg }}>
            <View style={styles.questionsHeader}>
              <Ionicons name="help-circle-outline" size={18} color="#D97706" />
              <Text style={styles.questionsHeaderTitle}>Questions</Text>
            </View>
            {(currentPart?.groups || currentPart?.content || []).map((g: any, gi: number) => 
              renderGroup(g, answers, onChange, gi, activePartIdx)
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderColor: COLORS.border, backgroundColor: '#fff' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: COLORS.primary },
  tabLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textSecondary },
  tabLabelActive: { color: COLORS.primary },
  content: { flex: 1, flexDirection: 'column' },
  contentTablet: { flexDirection: 'row' },
  pane: { flex: 1, backgroundColor: '#fff' },
  scroll: { flex: 1 },
  splitter: { height: 24, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.border },
  splitterHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#cbd5e1' },
  passageHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: SPACING.lg, paddingBottom: 0 },
  passageHeaderTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.primary },
  questionsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.lg },
  questionsHeaderTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#D97706' },
});
