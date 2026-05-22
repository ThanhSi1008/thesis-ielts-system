import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES, API_BASE_URL, FONTS, ROUTES } from '@/constants';
import { apiClient } from '@/services/api-client';
import { useTheme } from '@/contexts/ThemeContext';
import { AudioPlayer } from '@/components/ui/AudioPlayer';
import Markdown from 'react-native-markdown-display';
import { ContentGroupView } from '@/components/ielts/exercise/ContentGroupView';
import { TextWithLookup } from '@/components/global/TextWithLookup';

/* ─── Mobile-friendly Markdown Table Override ─── */
function buildMarkdownRules(): any {
  return {
    text: (node: any, children: any, parent: any, styles: any) => {
      // Vì markdown-it mặc định tắt HTML, <br> sẽ bị parse thành text thường.
      // Ta replace nó thành \n ở bước render này để không làm vỡ cấu trúc Markdown Table lúc parse.
      const content = (node.content || '').replace(/<br\s*\/?>/gi, '\n');
      return (
        <TextWithLookup key={node.key} style={styles.text} content={content} />
      );
    },
    image: (node: any) => (
      <Image
        key={node.key}
        source={{ uri: node.attributes.src }}
        style={{ width: '100%', height: 200, resizeMode: 'contain', marginVertical: 8 }}
      />
    ),
    table: (node: any, children: any) => (
      <ScrollView
        key={node.key}
        horizontal
        showsHorizontalScrollIndicator={true}
        style={{ marginVertical: 12 }}
        contentContainerStyle={{ paddingRight: 24 }} // Extra padding at the end so it doesn't hug the screen edge too tight
      >
        <View
          style={{
            backgroundColor: 'transparent',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}
        >
          {children}
        </View>
      </ScrollView>
    ),
    thead: (node: any, children: any) => (
      <View
        key={node.key}
        style={{
          backgroundColor: 'rgba(0,0,0,0.05)',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(0,0,0,0.08)',
        }}
      >
        {children}
      </View>
    ),
    tbody: (node: any, children: any) => <View key={node.key}>{children}</View>,
    tr: (node: any, children: any) => (
      <View
        key={node.key}
        style={{
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(0,0,0,0.08)',
        }}
      >
        {children}
      </View>
    ),
    th: (node: any, children: any) => (
      <View
        key={node.key}
        style={{
          width: 220,
          padding: 12,
          borderRightWidth: 1,
          borderRightColor: 'rgba(0,0,0,0.08)',
          justifyContent: 'center',
        }}
      >
        {children}
      </View>
    ),
    td: (node: any, children: any) => (
      <View
        key={node.key}
        style={{
          width: 220,
          padding: 12,
          borderRightWidth: 1,
          borderRightColor: 'rgba(0,0,0,0.08)',
        }}
      >
        <View style={{ flex: 1, gap: 4 }}>{children}</View>
      </View>
    ),
  };
}

/* ─── Types (from SharedExerciseTypes.ts) ─── */
interface MCOption {
  letter: string;
  text: string;
}
interface MCQuestion {
  question_number: number;
  text: string;
  options: MCOption[];
  answer: string;
  explanation?: string;
}
interface ContentGroup {
  type: string;
  questions?: MCQuestion[];
  question_numbers?: number[];
  options?: MCOption[];
  answers?: string[];
  instructions?: string;
  points?: any[];
  rows?: any[];
  steps?: any[];
  items?: any[];
  passage?: string;
  [key: string]: unknown;
}
interface Exercise {
  id: string;
  topic?: string;
  audioUrl?: string;
  passage?: string;
  content?: ContentGroup[]; // Optional for writing
  prompt?: string;
  diagramUrl?: string;
  modelAnswer?: Record<string, string>;
}

/* ─── Score calculation (port of SharedScoreUtils.ts) ─── */
function calcScore(
  content: ContentGroup[] | undefined,
  answers: Record<string | number, string>,
): number {
  if (!content) return 0;
  let s = 0;
  content.forEach((g, gi) => {
    if (g.type === 'multiple_choice_multiple') {
      const correct = new Set(((g.answers as string[]) ?? []).map((a) => a.toUpperCase()));
      const raw = String(answers[`mcm-${gi}`] ?? '');
      const selected = raw ? raw.split(',').map((x) => x.toUpperCase()) : [];
      selected.forEach((x) => {
        if (correct.has(x)) s++;
      });
    } else {
      let qs: any[] = [];
      const READING_MATCHING = [
        'matching_headings',
        'matching_features',
        'matching_information',
        'matching_sentence_endings',
      ];
      const isReadingMatching = READING_MATCHING.includes(g.type);
      const isReadingSummary =
        g.type === 'summary_completion' && Array.isArray(g.questions) && (g.summary || g.text);

      if (['table', 'table_completion'].includes(g.type)) {
        qs = (g.rows || []).flatMap((r: any) =>
          Object.entries(r.questions || {}).map(([k, q]: any) => ({
            question_number: Number(k),
            ...q,
          })),
        );
      } else if (['flow_chart', 'flowchart_completion'].includes(g.type)) {
        qs = (g.steps || []).filter((s: any) => s.question).map((s: any) => s.question);
      } else if (g.type === 'summary_completion' && !isReadingSummary) {
        // Listening summary: questions is Record object
        qs = Object.entries(g.questions || {}).map(([k, q]: any) => ({
          question_number: Number(k),
          ...q,
        }));
      } else {
        qs = g.items || (Array.isArray(g.questions) ? g.questions : []) || g.points || [];
      }

      const TEXT_INPUT_TYPES = [
        'short_answer',
        'note_completion',
        'summary_completion',
        'diagram_completion',
        'flowchart_completion',
        'table_completion',
        'sentence_completion',
        'form_completion',
        'flow_chart',
        'table',
        'plan_labelling',
        'diagram_labelling',
        'map_labelling',
      ];

      const isTextInput =
        (TEXT_INPUT_TYPES.includes(g.type) || (!g.type && g.points)) && !isReadingMatching;

      if (isTextInput) {
        qs.forEach((q: any) => {
          const ua = (answers[q.question_number ?? q.id] ?? '').trim().toLowerCase();
          const acceptable: string[] = [];
          if (q.acceptable_answers)
            acceptable.push(...q.acceptable_answers.map((a: string) => a.toLowerCase().trim()));
          if (q.answer) acceptable.push(q.answer.toLowerCase().trim());
          if (q.primary_answer) acceptable.push(q.primary_answer.toLowerCase().trim());
          if (q.text_answer) acceptable.push(q.text_answer.toLowerCase().trim());
          if (q.letter_answer) acceptable.push(q.letter_answer.toLowerCase().trim());

          if (acceptable.includes(ua)) s++;
        });
      } else {
        // Letter-based answers (MCQ, Matching, etc.)
        qs.forEach((q: any) => {
          const ua = (answers[q.question_number] ?? '').toUpperCase();
          if (ua === (q.answer ?? '').toUpperCase()) s++;
        });
      }
    }
  });
  return s;
}

function getTotalQuestions(content: ContentGroup[] | undefined): number {
  if (!content) return 0;
  return content.reduce((acc, g) => {
    if (g.type === 'multiple_choice_multiple') return acc + (g.answers?.length ?? 0);
    if (['table', 'table_completion'].includes(g.type)) {
      return (
        acc +
        (g.rows || []).reduce(
          (rAcc: number, r: any) => rAcc + Object.keys(r.questions || {}).length,
          0,
        )
      );
    }
    if (['flow_chart', 'flowchart_completion'].includes(g.type)) {
      return acc + (g.steps || []).filter((s: any) => s.question).length;
    }
    // Listening summary_completion: questions is Record object
    if (g.type === 'summary_completion' && !Array.isArray(g.questions)) {
      return acc + Object.keys(g.questions || {}).length;
    }
    return (
      acc +
      (g.items?.length ??
        (Array.isArray(g.questions) ? g.questions.length : 0) ??
        g.points?.length ??
        0)
    );
  }, 0);
}

/* ─── Writing Section (Accordion) ─── */
function WritingSection({
  title,
  value,
  onChange,
  submitted,
  modelText,
}: {
  title: string;
  value: string;
  onChange: (v: string) => void;
  submitted: boolean;
  modelText?: string;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <View style={styles.writingSection}>
      <TouchableOpacity
        style={styles.writingSectionHeader}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isOpen ? 'chevron-down' : 'chevron-forward'}
          size={16}
          color={COLORS.textSecondary}
        />
        <Text style={styles.writingSectionLabel}>{title}</Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.writingSectionContent}>
          <TextInput
            style={[
              styles.writingInput,
              submitted && { backgroundColor: '#F9FAFB', borderColor: '#F3F4F6', color: '#4B5563' },
            ]}
            multiline
            value={value}
            onChangeText={onChange}
            placeholder={submitted ? '' : 'Write your answer here...'}
            placeholderTextColor={COLORS.textMuted}
            editable={!submitted}
          />
          {submitted && modelText && (
            <View style={styles.modelAnswerBox}>
              <Text style={styles.modelAnswerText}>{modelText}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

/* ─── Main Screen ─── */
export default function ExerciseViewerScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const { exerciseId, lessonId, skill } = useLocalSearchParams<{
    exerciseId: string;
    lessonId?: string;
    skill: string;
  }>();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string | number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const skillLc = skill?.toLowerCase() ?? '';
        const endpoint =
          skillLc === 'reading'
            ? 'reading-exercises'
            : skillLc === 'writing'
              ? 'writing-exercises'
              : 'listening-exercises';
        const data = await apiClient.get<Exercise>(`/ielts/${endpoint}/${exerciseId}`);
        setExercise(data);
      } catch (e) {
        console.error('Failed to fetch exercise:', e);
      } finally {
        setLoading(false);
      }
    };
    if (exerciseId) fetch();
  }, [exerciseId]);

  const score = useMemo(
    () => (exercise ? calcScore(exercise.content, answers) : 0),
    [exercise, answers, submitted],
  );
  const total = useMemo(() => (exercise ? getTotalQuestions(exercise.content) : 0), [exercise]);
  const isPerfect = submitted && score === total && total > 0;
  const answeredCount = Object.keys(answers).length;

  const setAnswer = (key: string | number, val: string) =>
    setAnswers((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = () => {
    Alert.alert('Submit answers?', 'You cannot change answers after submitting.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Submit',
        onPress: async () => {
          setSubmitted(true);
          const finalScore = exercise ? calcScore(exercise.content, answers) : 0;
          const finalTotal = exercise ? getTotalQuestions(exercise.content) : 0;

          const skillLc = skill?.toLowerCase() ?? '';
          const isWriting = skillLc === 'writing';
          const shouldMarkComplete = isWriting || (finalScore === finalTotal && finalTotal > 0);

          if (shouldMarkComplete) {
            setMarking(true);
            try {
              const fieldName = isWriting
                ? 'writingExerciseId'
                : skillLc === 'reading'
                  ? 'readingExerciseId'
                  : 'listeningExerciseId';

              if (isWriting) {
                await apiClient.post(`/ielts/writing-exercises/${exerciseId}/save-answer`, answers);
              }
              await apiClient.post('/ielts/progress/mark-completed', { [fieldName]: exerciseId });
            } catch (e) {
              console.error('mark-completed failed:', e);
            } finally {
              setMarking(false);
            }
          }
        },
      },
    ]);
  };

  const handleNext = async () => {
    try {
      const data = await apiClient.get<{ steps: any[]; currentStep: number }>('/ielts/roadmap');
      let nextItem: any = null;
      for (const step of data.steps ?? []) {
        for (const item of step.items ?? []) {
          if (!item.isCompleted && !item.isLocked) {
            nextItem = item;
            break;
          }
        }
        if (nextItem) break;
      }
      if (nextItem?.type === 'lesson') {
        router.replace(
          (ROUTES.ieltsBasicLesson(nextItem.id) + `?skill=${nextItem.skill.toLowerCase()}`) as any,
        );
      } else if (nextItem) {
        const q = nextItem.lessonId
          ? `?lessonId=${nextItem.lessonId}&skill=${nextItem.skill.toLowerCase()}`
          : `?skill=${nextItem.skill.toLowerCase()}`;
        router.replace((ROUTES.ieltsBasicExercise(nextItem.id) + q) as any);
      } else {
        router.back();
      }
    } catch {
      router.back();
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading exercise…</Text>
      </View>
    );
  }
  if (!exercise) {
    return (
      <View style={styles.center}>
        <Text style={{ color: COLORS.error, fontWeight: '700' }}>Exercise not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: SPACING.md }}>
          <Text style={{ color: COLORS.primary }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const skillUpper = (skill ?? '').toUpperCase();
  const skillLc = skill?.toLowerCase() ?? '';
  const isWriting = skillLc === 'writing';

  return (
    <View style={[styles.safe, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: exercise.topic ?? 'Exercise',
          headerBackTitle: skillUpper ?? 'Back',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerRight: () => {
            if (isWriting) return null;
            if (!submitted)
              return (
                <Text style={styles.ansCount}>
                  {answeredCount} / {total}
                </Text>
              );
            return (
              <Text style={[styles.ansCount, { color: isPerfect ? '#16A34A' : '#D97706' }]}>
                {score}/{total} ✓
              </Text>
            );
          },
        }}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {exercise.passage && (
          <View style={styles.passageBox}>
            <Text style={styles.passageLabel}>📖 Passage</Text>
            <TextWithLookup style={styles.passageText} content={exercise.passage} />
          </View>
        )}

        {exercise.audioUrl && (
          <AudioPlayer
            url={
              exercise.audioUrl.startsWith('http')
                ? exercise.audioUrl
                : `${API_BASE_URL}${exercise.audioUrl}`
            }
          />
        )}

        {exercise.content &&
          exercise.content.map((group, gi) => (
            <ContentGroupView
              key={gi}
              group={group}
              gi={gi}
              answers={answers}
              submitted={submitted}
              onAnswer={setAnswer}
            />
          ))}

        {isWriting && exercise.prompt && (
          <View style={styles.writingContainer}>
            <View style={styles.writingPromptBox}>
              <Text style={styles.passageLabel}>📝 Prompt</Text>
              <Markdown style={markdownStyles} rules={buildMarkdownRules()}>
                {exercise.prompt || ''}
              </Markdown>

              {exercise.diagramUrl && (
                <View style={styles.diagramContainer}>
                  <Image
                    source={{
                      uri: exercise.diagramUrl.startsWith('http')
                        ? exercise.diagramUrl
                        : `${API_BASE_URL}${exercise.diagramUrl}`,
                    }}
                    style={{ width: width - SPACING.lg * 4, height: 200 }}
                    resizeMode="contain"
                  />
                </View>
              )}
            </View>

            <View style={styles.writingInputsContainer}>
              {['intro', 'overview', 'body1', 'body2'].map((sectionKey) => {
                const label =
                  sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1).replace(/(\d)/, ' $1');
                return (
                  <WritingSection
                    key={sectionKey}
                    title={label}
                    value={answers[sectionKey] || ''}
                    onChange={(v) => !submitted && setAnswer(sectionKey, v)}
                    submitted={submitted}
                    modelText={exercise.modelAnswer?.[sectionKey]}
                  />
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        {!submitted ? (
          <TouchableOpacity
            style={[styles.submitBtn, !isWriting && answeredCount === 0 && { opacity: 0.5 }]}
            onPress={handleSubmit}
            disabled={!isWriting && answeredCount === 0}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
            <Text style={styles.submitText}>
              {isWriting ? 'Save Progress & Show Answer' : 'Submit Answers'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <View>
              {isWriting ? (
                <Text style={[styles.scoreText, { color: '#16A34A' }]}>Progress Saved</Text>
              ) : (
                <>
                  <Text style={[styles.scoreText, { color: isPerfect ? '#16A34A' : '#D97706' }]}>
                    {score} / {total} correct
                  </Text>
                  <Text style={styles.scoreSubtext}>
                    {isPerfect ? '🎉 Perfect score!' : `Keep trying — need ${total - score} more`}
                  </Text>
                </>
              )}
            </View>
            <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
              {!isPerfect && !isWriting && (
                <TouchableOpacity
                  style={styles.retryBtn}
                  onPress={() => {
                    setAnswers({});
                    setSubmitted(false);
                  }}
                >
                  <Ionicons name="refresh" size={14} color="#fff" />
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              )}
              {(isPerfect || isWriting) && (
                <TouchableOpacity style={styles.nextBtn} onPress={handleNext} disabled={marking}>
                  {marking ? (
                    <ActivityIndicator size="small" color={COLORS.text} />
                  ) : (
                    <>
                      <Text style={styles.nextText}>Next Step</Text>
                      <Ionicons name="chevron-forward" size={14} color={COLORS.text} />
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  loadingText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  breadcrumb: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text, marginTop: 2 },
  ansCount: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: COLORS.primary },
  passageBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    maxHeight: 240,
  },
  passageLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  passageText: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    borderTopWidth: 1,
    boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.08)',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: '#1E293B',
    borderRadius: RADIUS.xl,
    borderCurve: 'continuous',
    paddingVertical: SPACING.md,
  },
  submitText: { fontSize: FONT_SIZES.md, fontWeight: '800', color: '#fff' },
  scoreText: { fontSize: FONT_SIZES.lg, fontWeight: '800' },
  scoreSubtext: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1E293B',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderCurve: 'continuous',
  },
  retryText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#fff' },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FCD34D',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderCurve: 'continuous',
  },
  nextText: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text },

  writingContainer: { marginTop: SPACING.md },
  writingPromptBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  writingPromptText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 24,
    fontWeight: '600',
  },
  diagramContainer: {
    marginTop: SPACING.lg,
    backgroundColor: '#fff',
    borderRadius: RADIUS.md,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  writingInputsContainer: { gap: SPACING.lg },
  writingSection: { gap: SPACING.xs },
  writingSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: 4,
  },
  writingSectionLabel: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: '#1F2937' },
  writingSectionContent: { marginTop: 4 },
  writingInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    borderCurve: 'continuous',
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    minHeight: 120,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  modelAnswerBox: {
    marginTop: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: '#F0FDF4',
    borderRadius: RADIUS.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  modelAnswerText: { fontSize: FONT_SIZES.sm, color: '#15803D', lineHeight: 22, fontWeight: '500' },
});

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 24,
  },
  strong: {
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  code_inline: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 4,
    fontFamily: FONTS.medium,
    paddingHorizontal: 4,
  },
  blockquote: {
    backgroundColor: 'rgba(0,0,0,0.035)',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  bullet_list: { marginTop: 4, marginBottom: 8 },
  ordered_list: { marginTop: 4, marginBottom: 8 },
  list_item: { flexDirection: 'row', marginBottom: 4 },
  bullet_list_icon: {
    marginLeft: 0,
    marginRight: 8,
    fontSize: 24,
    lineHeight: 24,
    color: COLORS.text,
  },
  ordered_list_icon: {
    marginLeft: 0,
    marginRight: 8,
    fontSize: FONT_SIZES.md,
    lineHeight: 24,
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  paragraph: { marginTop: 0, marginBottom: 8 },
  table: {
    // handled in rules
  },
  thead: {
    // handled in rules
  },
  tr: {
    // handled in rules
  },
  th: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4B5563',
    textTransform: 'uppercase',
  },
  td: {
    fontSize: 14,
    color: COLORS.text,
  },
});
