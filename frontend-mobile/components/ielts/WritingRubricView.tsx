import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, RADIUS, FONT_SIZES, FONTS } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface CriterionFeedback {
  band: number;
  strengths: string[];
  weak_areas: string[];
  how_to_improve: string[];
  mistakes?: { original: string; correction: string; explanation: string }[];
}

interface TaskFeedback {
  band: number;
  criteria: {
    task_achievement: CriterionFeedback;
    coherence_and_cohesion: CriterionFeedback;
    lexical_resource: CriterionFeedback;
    grammatical_range_and_accuracy: CriterionFeedback;
  };
}

export interface WritingFeedback {
  overall_band: number;
  task1: TaskFeedback;
  task2: TaskFeedback;
}

interface WritingRubricViewProps {
  feedback: WritingFeedback;
  answers?: { task1?: string; task2?: string };
  exam?: any;
  practicePart?: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CRITERIA_KEYS = [
  'task_achievement',
  'coherence_and_cohesion',
  'lexical_resource',
  'grammatical_range_and_accuracy',
] as const;

type CriterionKey = (typeof CRITERIA_KEYS)[number];

const CRITERIA_LABELS: Record<CriterionKey, string> = {
  task_achievement: 'Task Achievement / Response',
  coherence_and_cohesion: 'Coherence & Cohesion',
  lexical_resource: 'Lexical Resource',
  grammatical_range_and_accuracy: 'Grammatical Range & Accuracy',
};

const CRITERIA_SHORT: Record<CriterionKey, string> = {
  task_achievement: 'TA',
  coherence_and_cohesion: 'C&C',
  lexical_resource: 'LR',
  grammatical_range_and_accuracy: 'GRA',
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
  score: { fontFamily: FONTS.bold, lineHeight: undefined },
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

function MistakesTable({
  mistakes,
}: {
  mistakes: { original: string; correction: string; explanation: string }[];
}) {
  const { colors } = useTheme();
  if (!mistakes?.length) return null;
  return (
    <View style={[mt.container, { borderColor: colors.border }]}>
      <Text style={mt.label}>Annotated Mistakes</Text>
      {mistakes.map((m, i) => (
        <View
          key={i}
          style={[mt.row, { borderColor: colors.border, backgroundColor: colors.card }]}
        >
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
  label: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#ef4444',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
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
  data?: CriterionFeedback;
}) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(true);
  if (!data) return null;
  const color = bandColor(data.band ?? 0);
  const label = CRITERIA_LABELS[criterionKey];

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  return (
    <View style={[cc.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity style={cc.header} onPress={toggle} activeOpacity={0.8}>
        <View style={cc.headerLeft}>
          <View style={[cc.keyBadge, { backgroundColor: color + '18', borderColor: color }]}>
            <Text style={[cc.keyText, { color }]}>{CRITERIA_SHORT[criterionKey]}</Text>
          </View>
          <Text style={[cc.label, { color: colors.text }]} numberOfLines={2}>
            {label}
          </Text>
        </View>
        <View style={cc.headerRight}>
          <View style={[cc.bandChip, { backgroundColor: color + '18', borderColor: color }]}>
            <Text style={[cc.bandValue, { color }]}>{(data.band ?? 0).toFixed(1)}</Text>
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
          <FeedbackList items={data.strengths} icon="✓" label="Strengths" labelColor="#22c55e" />
          <FeedbackList items={data.weak_areas} icon="⚠" label="Weak Areas" labelColor="#ef4444" />
          <FeedbackList
            items={data.how_to_improve}
            icon=""
            label="How to Improve"
            labelColor="#3b82f6"
          />
          <MistakesTable mistakes={data.mistakes ?? []} />
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
  keyBadge: { borderRadius: RADIUS.sm, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 3 },
  keyText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
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

// ─── Task Score Summary Card ─────────────────────────────────────────────────

function TaskScoreSummary({
  task,
  label,
  data,
}: {
  task: 1 | 2;
  label: string;
  data?: TaskFeedback;
}) {
  const { colors } = useTheme();
  if (!data) return null;
  const color = bandColor(data.band ?? 0);
  return (
    <View style={[ts.card, { backgroundColor: colors.card, borderColor: color + '40' }]}>
      <View style={ts.header}>
        <Text style={[ts.taskLabel, { color: colors.text }]}>{label}</Text>
        <BandCircle band={data.band ?? 0} size={44} />
      </View>
      <View style={ts.criteriaList}>
        {CRITERIA_KEYS.map((key) => {
          const c = data.criteria?.[key];
          if (!c) return null;
          const cColor = bandColor(c.band ?? 0);
          return (
            <View key={key} style={ts.criteriaRow}>
              <Text style={[ts.criteriaLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                {CRITERIA_SHORT[key]}
              </Text>
              <View style={[ts.barTrack, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    ts.barFill,
                    { width: `${((c.band ?? 0) / 9) * 100}%` as any, backgroundColor: cColor },
                  ]}
                />
              </View>
              <Text style={[ts.criteriaScore, { color: cColor }]}>{(c.band ?? 0).toFixed(1)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
const ts = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  taskLabel: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold },
  criteriaList: { gap: 6 },
  criteriaRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  criteriaLabel: { width: 36, fontSize: 10, fontWeight: '700' },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 3 },
  criteriaScore: { width: 32, fontSize: 12, fontFamily: FONTS.bold, textAlign: 'right' },
});

// ─── Answer Preview ──────────────────────────────────────────────────────────

function AnswerPreview({
  taskNum,
  answer,
  prompt,
  imageUrl,
}: {
  taskNum: number;
  answer?: string;
  prompt?: string;
  imageUrl?: string;
}) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const wc = wordCount(answer);

  return (
    <View style={[ap.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity
        style={ap.header}
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setExpanded((v) => !v);
        }}
        activeOpacity={0.8}
      >
        <View style={ap.headerLeft}>
          <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} />
          <Text style={[ap.headerTitle, { color: colors.text }]}>
            Task {taskNum} — Your Response
          </Text>
        </View>
        <View style={ap.headerRight}>
          <View style={[ap.wordBadge, { backgroundColor: colors.surface }]}>
            <Text style={[ap.wordCount, { color: colors.textSecondary }]}>{wc} words</Text>
          </View>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.textMuted}
          />
        </View>
      </TouchableOpacity>
      {expanded && (
        <View style={[ap.body, { borderColor: colors.border }]}>
          {prompt ? (
            <View
              style={[
                ap.promptBox,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={[ap.promptLabel, { color: colors.textMuted }]}>Prompt</Text>
              <Text style={[ap.promptText, { color: colors.text }]}>{prompt}</Text>
            </View>
          ) : null}
          <View style={[ap.answerBox, { backgroundColor: colors.surface }]}>
            <Text style={[ap.answerText, { color: colors.text }]}>
              {answer || (
                <Text style={[ap.emptyText, { color: colors.textMuted }]}>No answer provided.</Text>
              )}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
const ap = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  headerTitle: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  wordBadge: {
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  wordCount: { fontSize: 11, fontWeight: '700' },
  body: { borderTopWidth: 1, padding: SPACING.md, gap: SPACING.md },
  promptBox: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
  },
  promptLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  promptText: { fontSize: FONT_SIZES.sm, lineHeight: 20 },
  answerBox: { borderRadius: RADIUS.md, padding: SPACING.md },
  answerText: { fontSize: FONT_SIZES.sm, lineHeight: 22 },
  emptyText: { fontStyle: 'italic' },
});

// ─── Main Component ──────────────────────────────────────────────────────────

export default function WritingRubricView({
  feedback,
  answers,
  exam,
  practicePart,
}: WritingRubricViewProps) {
  const { colors } = useTheme();
  const [activeTask, setActiveTask] = useState<1 | 2>(practicePart === 2 ? 2 : 1);

  const showTask1 = (!practicePart || practicePart === 1) && !!feedback.task1;
  const showTask2 = (!practicePart || practicePart === 2) && !!feedback.task2;

  const currentFeedback = activeTask === 1 ? feedback.task1 : feedback.task2;
  const currentAnswer = activeTask === 1 ? answers?.task1 : answers?.task2;

  const tasks: any[] = exam?.questions?.tasks ?? [];
  const currentPrompt = tasks.find((t: any) => t.task_number === activeTask);

  const overallColor = bandColor(feedback.overall_band);

  return (
    <View style={wr.container}>
      {/* Overall Band */}
      <View
        style={[wr.overallCard, { backgroundColor: colors.card, borderColor: overallColor + '40' }]}
      >
        <BandCircle band={feedback.overall_band} size={64} />
        <View style={wr.overallInfo}>
          <Text style={[wr.overallTitle, { color: colors.text }]}>Overall Writing Band</Text>
          <Text style={[wr.overallSub, { color: colors.textSecondary }]}>
            Task 1 · Task 2 Combined
          </Text>
          <View style={wr.overallRow}>
            {showTask1 && feedback.task1 && (
              <View
                style={[wr.taskChip, { backgroundColor: bandColor(feedback.task1.band ?? 0) + '18' }]}
              >
                <Text style={[wr.taskChipText, { color: bandColor(feedback.task1.band ?? 0) }]}>
                  T1 {(feedback.task1.band ?? 0).toFixed(1)}
                </Text>
              </View>
            )}
            {showTask2 && feedback.task2 && (
              <View
                style={[wr.taskChip, { backgroundColor: bandColor(feedback.task2.band ?? 0) + '18' }]}
              >
                <Text style={[wr.taskChipText, { color: bandColor(feedback.task2.band ?? 0) }]}>
                  T2 {(feedback.task2.band ?? 0).toFixed(1)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Score Summary side by side */}
      <View style={wr.summaryRow}>
        {showTask1 && <TaskScoreSummary task={1} label="Task 1 Breakdown" data={feedback.task1} />}
        {showTask1 && showTask2 && <View style={{ width: SPACING.md }} />}
        {showTask2 && <TaskScoreSummary task={2} label="Task 2 Breakdown" data={feedback.task2} />}
      </View>

      {/* Task Selector */}
      <View style={[wr.taskTabs, { backgroundColor: colors.surface }]}>
        {showTask1 && (
          <TouchableOpacity
            style={[wr.tab, activeTask === 1 && { backgroundColor: colors.primary }]}
            onPress={() => setActiveTask(1)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="bar-chart-outline"
              size={14}
              color={activeTask === 1 ? '#fff' : colors.textSecondary}
            />
            <Text
              style={[
                wr.tabText,
                { color: colors.textSecondary },
                activeTask === 1 && wr.tabTextActive,
              ]}
            >
              Task 1
            </Text>
          </TouchableOpacity>
        )}
        {showTask2 && (
          <TouchableOpacity
            style={[wr.tab, activeTask === 2 && { backgroundColor: colors.primary }]}
            onPress={() => setActiveTask(2)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="document-text-outline"
              size={14}
              color={activeTask === 2 ? '#fff' : colors.textSecondary}
            />
            <Text
              style={[
                wr.tabText,
                { color: colors.textSecondary },
                activeTask === 2 && wr.tabTextActive,
              ]}
            >
              Task 2
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Answer Preview */}
      <AnswerPreview taskNum={activeTask} answer={currentAnswer} prompt={currentPrompt?.prompt} />

      {/* Criteria Cards */}
      <Text style={[wr.sectionHeader, { color: colors.textSecondary }]}>
        Detailed Feedback — Task {activeTask}
      </Text>
      {currentFeedback?.criteria && CRITERIA_KEYS.map((key) => (
        <CriterionCard
          key={`${activeTask}-${key}`}
          criterionKey={key}
          data={currentFeedback.criteria[key]}
        />
      ))}
    </View>
  );
}

const wr = StyleSheet.create({
  container: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  overallCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
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
  overallInfo: { flex: 1 },
  overallTitle: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold },
  overallSub: {
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
    marginBottom: SPACING.sm,
  },
  overallRow: { flexDirection: 'row', gap: SPACING.sm },
  taskChip: { borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  taskChipText: { fontSize: 12, fontFamily: FONTS.bold },
  summaryRow: { flexDirection: 'row', marginBottom: SPACING.lg },
  taskTabs: {
    flexDirection: 'row',
    borderRadius: RADIUS.full,
    padding: 4,
    marginBottom: SPACING.lg,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    borderRadius: RADIUS.full,
    paddingVertical: 9,
  },
  tabActive: {},
  tabText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold },
  tabTextActive: { color: '#fff' },
  sectionHeader: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
  },
});
