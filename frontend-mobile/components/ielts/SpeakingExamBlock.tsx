import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';

interface SpeakingPart {
  part_number?: number;
  topic?: string;
  cue_card?: string;
  questions?: Array<{ text?: string; question?: string }>;
}

interface Props {
  parts: SpeakingPart[];
  answers: Record<string, string>;
  onChange: (a: Record<string, string>) => void;
}

const PART_COLORS = ['#2563EB', '#059669', '#D97706'];

export default function SpeakingExamBlock({ parts, answers, onChange }: Props) {
  const [activePartIdx, setActivePartIdx] = useState(0);
  const currentPart = parts[activePartIdx];

  const getKey = (partIdx: number, qIdx: number) => `${partIdx}-${qIdx}`;

  const handleChange = (partIdx: number, qIdx: number, text: string) => {
    onChange({ ...answers, [getKey(partIdx, qIdx)]: text });
  };

  const answeredCount = Object.values(answers).filter(v => v.trim()).length;
  const totalQuestions = parts.reduce((sum, p) => {
    return sum + (p.questions?.length || (p.cue_card ? 1 : 0));
  }, 0);

  return (
    <View style={styles.container}>
      {/* Part tabs */}
      <View style={styles.tabs}>
        {parts.map((part, idx) => {
          const color = PART_COLORS[idx] || COLORS.primary;
          const active = activePartIdx === idx;
          // Check if this part has all answers filled
          const partQCount = part.questions?.length || (part.cue_card ? 1 : 0);
          const partAnswered = Array.from({ length: partQCount }, (_, qi) => answers[getKey(idx, qi)] || '').filter(v => v.trim()).length;
          const partDone = partQCount > 0 && partAnswered === partQCount;
          return (
            <TouchableOpacity
              key={idx}
              style={[styles.tab, active && { borderBottomColor: color }]}
              onPress={() => setActivePartIdx(idx)}
              activeOpacity={0.8}
            >
              {partDone && <Text style={[styles.tabCheck, { color }]}>✓ </Text>}
              <Text style={[styles.tabLabel, active && { color }]}>
                Part {part.part_number || idx + 1}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 20 }}>
        {/* Info banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="mic-outline" size={16} color="#7C3AED" />
          <Text style={styles.infoText}>
            Voice recording is not available on mobile. Type your spoken responses below — they will be graded by AI.
          </Text>
        </View>

        {/* Part topic */}
        {currentPart?.topic && (
          <View style={styles.topicBox}>
            <Text style={styles.topicLabel}>Topic</Text>
            <Text style={styles.topicText}>{currentPart.topic}</Text>
          </View>
        )}

        {/* Cue card (Part 2) */}
        {currentPart?.cue_card && (
          <View style={styles.cueCard}>
            <Text style={styles.cueCardLabel}>Cue Card</Text>
            <Text style={styles.cueCardText}>{currentPart.cue_card}</Text>
            <TextInput
              style={styles.answerInput}
              multiline
              value={answers[getKey(activePartIdx, 0)] || ''}
              onChangeText={t => handleChange(activePartIdx, 0, t)}
              placeholder="Describe the topic on the cue card…"
              placeholderTextColor={COLORS.textMuted}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>
              {(answers[getKey(activePartIdx, 0)] || '').trim().split(/\s+/).filter(Boolean).length} words
            </Text>
          </View>
        )}

        {/* Questions (Part 1 & 3) */}
        {currentPart?.questions?.map((q, qIdx) => {
          const key = getKey(activePartIdx, qIdx);
          const wordCount = (answers[key] || '').trim().split(/\s+/).filter(Boolean).length;
          return (
            <View key={key} style={styles.questionBlock}>
              <Text style={styles.questionNumber}>Q{qIdx + 1}</Text>
              <Text style={styles.questionText}>{q.text || q.question}</Text>
              <TextInput
                style={styles.answerInput}
                multiline
                value={answers[key] || ''}
                onChangeText={t => handleChange(activePartIdx, qIdx, t)}
                placeholder="Answer this question in spoken English…"
                placeholderTextColor={COLORS.textMuted}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{wordCount} words</Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Progress */}
      <View style={styles.progressBar}>
        <Text style={styles.progressText}>{answeredCount}/{totalQuestions} answered</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderColor: COLORS.border },
  tab: {
    flex: 1, alignItems: 'center', paddingVertical: SPACING.md,
    borderBottomWidth: 3, borderBottomColor: 'transparent',
  },
  tabLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textSecondary },
  tabCheck: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
  scroll: { flex: 1 },
  infoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm,
    backgroundColor: '#F5F3FF', borderRadius: RADIUS.md, padding: SPACING.md,
    borderLeftWidth: 3, borderLeftColor: '#7C3AED', marginBottom: SPACING.lg,
  },
  infoText: { flex: 1, fontSize: FONT_SIZES.xs, color: '#5B21B6', lineHeight: 18 },
  topicBox: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border,
  },
  topicLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  topicText: { fontSize: FONT_SIZES.md, color: COLORS.text, fontWeight: '600' },
  cueCard: {
    backgroundColor: '#FFFBEB', borderRadius: RADIUS.lg, padding: SPACING.lg,
    marginBottom: SPACING.lg, borderWidth: 1, borderColor: '#FDE68A',
  },
  cueCardLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#D97706', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  cueCardText: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20, marginBottom: SPACING.md },
  questionBlock: {
    backgroundColor: '#fff', borderRadius: RADIUS.xl, padding: SPACING.lg,
    marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border,
  },
  questionNumber: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  questionText: { fontSize: FONT_SIZES.md, color: COLORS.text, lineHeight: 22, marginBottom: SPACING.md },
  answerInput: {
    minHeight: 100, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md,
    padding: SPACING.md, fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20,
    marginBottom: 4,
  },
  charCount: { fontSize: 11, color: COLORS.textMuted, textAlign: 'right', marginBottom: SPACING.xs },
  progressBar: {
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderTopWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface,
  },
  progressText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: '600' },
});
