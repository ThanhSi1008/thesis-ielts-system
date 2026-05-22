import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface Mistake {
  original: string;
  correction: string;
  explanation: string;
}

interface CriterionFeedback {
  band: number;
  strengths: string[];
  weak_areas: string[];
  how_to_improve: string[];
  mistakes?: Mistake[];
}

export interface SpeakingFeedback {
  overall_band: number;
  criteria: {
    fluency_and_coherence: CriterionFeedback;
    lexical_resource: CriterionFeedback;
    grammatical_range_and_accuracy: CriterionFeedback;
    pronunciation: CriterionFeedback;
  };
}

interface SpeakingRubricViewProps {
  feedback: SpeakingFeedback;
  answers?: Record<string, any>;
  exam?: any;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CRITERIA_KEYS = [
  'fluency_and_coherence',
  'lexical_resource',
  'grammatical_range_and_accuracy',
  'pronunciation',
] as const;

type CriterionKey = (typeof CRITERIA_KEYS)[number];

const CRITERIA_LABELS: Record<CriterionKey, string> = {
  fluency_and_coherence: 'Fluency & Coherence',
  lexical_resource: 'Lexical Resource',
  grammatical_range_and_accuracy: 'Grammatical Range & Accuracy',
  pronunciation: 'Pronunciation',
};

const CRITERIA_SHORT: Record<CriterionKey, string> = {
  fluency_and_coherence: 'F&C',
  lexical_resource: 'LR',
  grammatical_range_and_accuracy: 'GRA',
  pronunciation: 'PRO',
};

const CRITERIA_ICONS: Record<CriterionKey, string> = {
  fluency_and_coherence: 'chatbubbles-outline',
  lexical_resource: 'book-outline',
  grammatical_range_and_accuracy: 'checkmark-circle-outline',
  pronunciation: 'mic-outline',
};

const PART_LABELS: Record<string, string> = {
  '1': 'Part 1 — Introduction & Interview',
  '2': 'Part 2 — Long Turn (Cue Card)',
  '3': 'Part 3 — Discussion',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function bandColor(band: number): string {
  if (band >= 8.0) return '#22c55e';
  if (band >= 6.5) return '#3b82f6';
  if (band >= 5.0) return '#f59e0b';
  return '#ef4444';
}

function wordCount(text?: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function BandCircle({ band, size = 48 }: { band: number; size?: number }) {
  const color = bandColor(band);
  return (
    <View
      style={[
        bc.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: color,
          backgroundColor: color + '15',
        },
      ]}
    >
      <Text style={[bc.score, { color, fontSize: size * 0.3 }]}>{band.toFixed(1)}</Text>
    </View>
  );
}
const bc = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  score: { fontFamily: FONTS.bold },
});

function FeedbackList({
  items,
  icon,
  label,
  labelColor,
}: {
  items: string[];
  icon: string;
  label: string;
  labelColor: string;
}) {
  const { colors } = useTheme();
  if (!items?.length) return null;
  return (
    <View style={fl.container}>
      <Text style={[fl.label, { color: labelColor }]}>{label}</Text>
      {items.map((item, i) => (
        <View key={i} style={fl.row}>
          <Text style={[fl.icon, { color: labelColor }]}>{icon}</Text>
          <Text style={[fl.text, { color: colors.textSecondary }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}
const fl = StyleSheet.create({
  container: { marginBottom: SPACING.md },
  label: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.xs,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.xs, marginBottom: 4 },
  icon: { fontSize: 12, marginTop: 2, width: 14 },
  text: { flex: 1, fontSize: FONT_SIZES.sm, lineHeight: 19 },
});

function MistakesTable({ mistakes }: { mistakes: Mistake[] }) {
  const { colors } = useTheme();
  if (!mistakes?.length) return null;
  return (
    <View style={[mt.container, { borderColor: colors.border }]}>
      <Text style={mt.title}>Annotated Mistakes</Text>
      {mistakes.map((m, i) => (
        <View key={i} style={[mt.row, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <View style={[mt.original, { borderColor: colors.border }]}>
            <Text style={[mt.originalText, { color: colors.text }]}>{m.original}</Text>
          </View>
          <View style={mt.correction}>
            <Text style={[mt.correctionText, { color: colors.text }]}>{m.correction}</Text>
            <Text style={[mt.explanation, { color: colors.textSecondary }]}>{m.explanation}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
const mt = StyleSheet.create({
  container: {
    marginTop: SPACING.md,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
  },
  title: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#ef4444',
    padding: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    borderTopWidth: 1,
  },
  original: { width: '38%', padding: SPACING.sm, borderRightWidth: 1 },
  originalText: {
    fontSize: FONT_SIZES.sm,
    textDecorationLine: 'line-through',
    fontStyle: 'italic',
  },
  correction: { flex: 1, padding: SPACING.sm },
  correctionText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    marginBottom: 2,
  },
  explanation: { fontSize: 11, lineHeight: 16 },
});

function CriterionCard({
  criterionKey,
  data,
}: {
  criterionKey: CriterionKey;
  data: CriterionFeedback;
}) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(true);
  const color = bandColor(data?.band ?? 0);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  return (
    <View style={[cc.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity style={cc.header} onPress={toggle} activeOpacity={0.8}>
        <View style={cc.headerLeft}>
          <View style={[cc.keyBadge, { backgroundColor: color + '18', borderColor: color }]}>
            <Ionicons name={CRITERIA_ICONS[criterionKey] as any} size={14} color={color} />
          </View>
          <Text style={[cc.label, { color: colors.text }]} numberOfLines={2}>
            {CRITERIA_LABELS[criterionKey]}
          </Text>
        </View>
        <View style={cc.headerRight}>
          <View style={[cc.bandChip, { backgroundColor: color + '18', borderColor: color }]}>
            <Text style={[cc.bandValue, { color }]}>{(data?.band ?? 0).toFixed(1)}</Text>
          </View>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.textMuted}
          />
        </View>
      </TouchableOpacity>
      {expanded && (
        <View style={[cc.body, { borderColor: colors.border }]}>
          <FeedbackList
            items={data?.strengths ?? []}
            icon="✓"
            label="Strengths"
            labelColor="#22c55e"
          />
          <FeedbackList
            items={data?.weak_areas ?? []}
            icon="⚠"
            label="Weak Areas"
            labelColor="#ef4444"
          />
          <FeedbackList
            items={data?.how_to_improve ?? []}
            icon=""
            label="How to Improve"
            labelColor="#3b82f6"
          />
          <MistakesTable mistakes={data?.mistakes ?? []} />
        </View>
      )}
    </View>
  );
}
const cc = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  headerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  keyBadge: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    lineHeight: 18,
  },
  bandChip: {
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    minWidth: 44,
    alignItems: 'center',
  },
  bandValue: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold },
  body: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderTopWidth: 1,
    paddingTop: SPACING.md,
  },
});

// ─── Score Summary Radar-style bars ──────────────────────────────────────────

function ScoreSummaryCard({ feedback }: { feedback: SpeakingFeedback }) {
  const { colors } = useTheme();
  const overallColor = bandColor(feedback.overall_band);
  return (
    <View style={[ss.card, { backgroundColor: colors.card, borderColor: overallColor + '40' }]}>
      <View style={ss.header}>
        <BandCircle band={feedback.overall_band} size={60} />
        <View style={ss.headerInfo}>
          <Text style={[ss.title, { color: colors.text }]}>Speaking Performance</Text>
          <Text style={[ss.subtitle, { color: colors.textSecondary }]}>Overall Band Score</Text>
        </View>
      </View>
      <View style={[ss.divider, { backgroundColor: colors.border }]} />
      {CRITERIA_KEYS.map((key) => {
        const cBand = feedback.criteria?.[key]?.band ?? 0;
        const cColor = bandColor(cBand);
        return (
          <View key={key} style={ss.row}>
            <View style={ss.rowLeft}>
              <Ionicons name={CRITERIA_ICONS[key] as any} size={13} color={cColor} />
              <Text style={[ss.rowLabel, { color: colors.textSecondary }]}>{CRITERIA_SHORT[key]}</Text>
            </View>
            <View style={[ss.barTrack, { backgroundColor: colors.border }]}>
              <View
                style={[
                  ss.barFill,
                  { width: `${(cBand / 9) * 100}%` as any, backgroundColor: cColor },
                ]}
              />
            </View>
            <Text style={[ss.rowScore, { color: cColor }]}>{cBand.toFixed(1)}</Text>
          </View>
        );
      })}
    </View>
  );
}
const ss = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.lg, marginBottom: SPACING.md },
  headerInfo: { flex: 1 },
  title: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold },
  subtitle: { fontSize: FONT_SIZES.xs, marginTop: 2 },
  divider: { height: 1, marginBottom: SPACING.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 10 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 4, width: 52 },
  rowLabel: { fontSize: 11, fontWeight: '700' },
  barTrack: {
    flex: 1,
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 4 },
  rowScore: { width: 34, fontSize: 13, fontFamily: FONTS.bold, textAlign: 'right' },
});

// ─── Answer Preview per Part ──────────────────────────────────────────────────

function PartAnswerPreview({ partKey, answer }: { partKey: string; answer?: string }) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const isAudioUrl = Boolean(answer?.startsWith('http'));
  const label = PART_LABELS[partKey] ?? `Part ${partKey}`;

  if (!answer) return null;

  return (
    <View style={[ap.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity
        style={ap.header}
        onPress={() => {
          if (isAudioUrl) return;
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setExpanded((v) => !v);
        }}
        activeOpacity={isAudioUrl ? 1 : 0.8}
      >
        <View style={ap.headerLeft}>
          <Ionicons
            name={isAudioUrl ? 'mic-outline' : 'chatbubble-ellipses-outline'}
            size={15}
            color={isAudioUrl ? colors.primary : colors.textSecondary}
          />
          <Text style={[ap.title, { color: colors.text }]} numberOfLines={1}>
            {label}
          </Text>
        </View>
        <View style={ap.headerRight}>
          <View style={[ap.wordBadge, { backgroundColor: colors.surface }, isAudioUrl && ap.audioBadge]}>
            <Text style={[ap.wordCount, { color: isAudioUrl ? colors.primary : colors.textSecondary }]}>
              {isAudioUrl ? 'Audio recorded' : `${wordCount(answer)} words`}
            </Text>
          </View>
          {!isAudioUrl && (
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={15}
              color={colors.textMuted}
            />
          )}
        </View>
      </TouchableOpacity>
      {expanded && !isAudioUrl && (
        <View style={[ap.body, { borderColor: colors.border }]}>
          <Text style={[ap.answerText, { color: colors.text }]}>{answer}</Text>
        </View>
      )}
    </View>
  );
}
const ap = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  headerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  title: { flex: 1, fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  wordBadge: {
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  wordCount: { fontSize: 11, fontWeight: '700' },
  audioBadge: { backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE' },
  audioLabel: {},
  body: { borderTopWidth: 1, padding: SPACING.md },
  answerText: { fontSize: FONT_SIZES.sm, lineHeight: 22 },
});

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SpeakingRubricView({ feedback, answers, exam }: SpeakingRubricViewProps) {
  const { colors } = useTheme();
  // Collect answer parts from answers record (keys: '1', '2', '3' or 'part1', 'part2', 'part3')
  const partKeys = answers
    ? Object.keys(answers).filter((k) => answers[k] && typeof answers[k] === 'string')
    : [];

  return (
    <View style={sr.container}>
      {/* Score Summary */}
      <ScoreSummaryCard feedback={feedback} />

      {/* Your Responses (collapsible per part) */}
      {partKeys.length > 0 && (
        <View style={sr.answersSection}>
          <Text style={[sr.sectionHeader, { color: colors.textSecondary }]}>Your Responses</Text>
          {partKeys.map((key) => (
            <PartAnswerPreview key={key} partKey={key} answer={answers![key]} />
          ))}
        </View>
      )}

      {/* Detailed Criteria */}
      <Text style={[sr.sectionHeader, { color: colors.textSecondary }]}>Detailed Feedback</Text>
      {CRITERIA_KEYS.map((key) => (
        <CriterionCard key={key} criterionKey={key} data={feedback.criteria?.[key]} />
      ))}
    </View>
  );
}

const sr = StyleSheet.create({
  container: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  answersSection: { marginBottom: SPACING.md },
  sectionHeader: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.md,
  },
});
