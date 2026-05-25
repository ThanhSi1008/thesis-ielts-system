import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight, Layout } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Markdown from 'react-native-markdown-display';
import { TextWithLookup } from '@/components/global/TextWithLookup';

import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS, SHADOWS, ROUTES } from '@/constants';
import { API_BASE_URL } from '@/constants';
import { apiClient } from '@/services/api-client';
import { Stack } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Breadcrumb } from '@/components';

/* ─── Types ─── */
interface LessonBlock {
  type: string;
  title?: string;
  content?: string;
}
interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  hint?: string;
  explanation?: string;
}
interface Lesson {
  id: string;
  title: string;
  chapter: string;
  content: LessonBlock[];
  quiz?: QuizQuestion[];
  skill?: { name: string };
}

/* ─── Block style config ─── */
const BLOCK_CONFIG: Record<
  string,
  {
    bg: string;
    border: string;
    iconName: React.ComponentProps<typeof Ionicons>['name'];
    iconColor: string;
    label: string;
  }
> = {
  traps: {
    bg: '#FFF0F0',
    border: '#FFD6D6',
    iconName: 'alert-circle',
    iconColor: '#EF4444',
    label: 'Common Traps',
  },
  strategy: {
    bg: '#FFF9E6',
    border: '#FFF0C2',
    iconName: 'bulb-outline',
    iconColor: '#D97706',
    label: 'Strategy',
  },
  tips: {
    bg: '#EFF6FF',
    border: '#BFDBFE',
    iconName: 'information-circle',
    iconColor: '#3B82F6',
    label: 'Pro Tips',
  },
  overview: {
    bg: '#F6F6F6',
    border: '#E5E7EB',
    iconName: 'book-outline',
    iconColor: '#6B7280',
    label: 'Overview',
  },
  section: {
    bg: 'transparent',
    border: 'transparent',
    iconName: 'document-text-outline',
    iconColor: '#374151',
    label: '',
  },
};

/* ─── Quiz component ─── */
function Quiz({
  questions,
  onComplete,
  onNext,
}: {
  questions: QuizQuestion[];
  onComplete: () => void;
  onNext: () => void;
}) {
  const { colors, isDark } = useTheme();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = questions.reduce((acc, q, idx) => {
    const sel = answers[idx];
    if (!sel) return acc;
    const isCorrect = q.options.some((opt, i) => {
      const letter = opt.match(/^([A-D])[.)]/)?.[1] ?? String.fromCharCode(65 + i);
      return (opt === q.answer || letter === q.answer) && (sel === opt || sel === letter);
    });
    return acc + (isCorrect ? 1 : 0);
  }, 0);

  const passed = questions.length > 0 && score === questions.length;

  useEffect(() => {
    if (submitted && passed) onComplete();
  }, [submitted, passed]);

  return (
    <View style={qStyles.container}>
      <Text allowFontScaling={true} style={[qStyles.header, { color: colors.text }]}>Check Your Understanding</Text>
      {questions.map((q, idx) => {
        const sel = answers[idx];
        return (
          <View
            key={idx}
            style={[qStyles.qCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            accessible={true}
            accessibilityLabel={`Question ${idx + 1}: ${q.question}`}
          >
            <Text allowFontScaling={true} style={qStyles.qNum}>{idx + 1}.</Text>
            <Text allowFontScaling={true} style={[qStyles.qText, { color: colors.text }]}>{q.question}</Text>
            {q.options.map((opt, i) => {
              const letter = opt.match(/^([A-D])[.)]/)?.[1] ?? String.fromCharCode(65 + i);
              const label = opt.replace(/^([A-D])[.)]\s*/, '');
              const isThisSelected = sel === letter || sel === opt;
              const isThisCorrect = opt === q.answer || letter === q.answer;

              let bg: string = colors.surface;
              let borderColor: string = colors.border;
              let textColor: string = colors.text;
              if (submitted && isThisCorrect) {
                bg = isDark ? '#064E3B' : '#DCFCE7';
                borderColor = isDark ? '#059669' : '#86EFAC';
                textColor = isDark ? '#D1FAE5' : '#166534';
              } else if (submitted && isThisSelected && !isThisCorrect) {
                bg = isDark ? '#450A0A' : '#FEE2E2';
                borderColor = isDark ? '#DC2626' : '#FCA5A5';
                textColor = isDark ? '#FEE2E2' : '#991B1B';
              } else if (!submitted && isThisSelected) {
                bg = isDark ? '#78350F' : '#FFF9E6';
                borderColor = isDark ? '#D97706' : '#FCD34D';
                textColor = colors.text;
              }

              let stateHint = '';
              if (submitted) {
                stateHint = isThisCorrect ? ', Correct Answer' : (isThisSelected ? ', Incorrect selection' : '');
              }

              return (
                <TouchableOpacity
                  key={letter}
                  style={[qStyles.option, { backgroundColor: bg, borderColor }]}
                  onPress={() => !submitted && setAnswers((p) => ({ ...p, [idx]: letter }))}
                  activeOpacity={submitted ? 1 : 0.8}
                  accessible={true}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isThisSelected, disabled: submitted }}
                  accessibilityLabel={`Option ${letter}: ${label}${stateHint}`}
                  accessibilityHint={submitted ? '' : 'Double tap to select this option'}
                >
                  <View
                    style={[
                      qStyles.bullet,
                      { backgroundColor: colors.card, borderColor: colors.border },
                      isThisSelected &&
                        !submitted && {
                          backgroundColor: colors.primary,
                          borderColor: colors.primary,
                        },
                    ]}
                  >
                    <Text
                      allowFontScaling={true}
                      style={[
                        qStyles.bulletLetter,
                        { color: colors.textSecondary },
                        isThisSelected && !submitted && { color: colors.onPrimary },
                      ]}
                    >
                      {letter}
                    </Text>
                  </View>
                  <Text allowFontScaling={true} style={[qStyles.optText, { color: textColor }]}>{label}</Text>
                  {submitted && isThisCorrect && (
                    <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                  )}
                  {submitted && isThisSelected && !isThisCorrect && (
                    <Ionicons name="close-circle" size={18} color="#DC2626" />
                  )}
                </TouchableOpacity>
              );
            })}
            {submitted && q.explanation && (
              <View
                style={[
                  qStyles.explanation,
                  { backgroundColor: score === questions.length ? (isDark ? '#064E3B' : '#F0FDF4') : (isDark ? '#450A0A' : '#FEF2F2') },
                ]}
                accessible={true}
                accessibilityLabel={`Explanation: ${q.explanation}`}
              >
                <Text allowFontScaling={true} style={{ fontSize: FONT_SIZES.sm, color: colors.text, lineHeight: 20 }}>
                  {score === questions.length ? '✅ Correct! ' : '❌ '}
                  {q.explanation}
                </Text>
              </View>
            )}
          </View>
        );
      })}

      {/* Submit bar */}
      <View style={[qStyles.bar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text allowFontScaling={true} style={[qStyles.answered, { color: colors.textSecondary }]}>
          {Object.keys(answers).length} / {questions.length} answered
        </Text>
        {!submitted ? (
          <TouchableOpacity
            style={[
              qStyles.submitBtn,
              { backgroundColor: colors.primary },
              Object.keys(answers).length < questions.length && { opacity: 0.5 },
            ]}
            onPress={() => setSubmitted(true)}
            disabled={Object.keys(answers).length < questions.length}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Submit quiz"
            accessibilityHint="Double tap to submit your answers for verification"
            accessibilityState={{ disabled: Object.keys(answers).length < questions.length }}
          >
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.onPrimary} />
            <Text allowFontScaling={true} style={[qStyles.submitText, { color: colors.onPrimary }]}>Submit</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
            <TouchableOpacity
              style={[qStyles.retryBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => {
                setAnswers({});
                setSubmitted(false);
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Retry quiz"
              accessibilityHint="Double tap to reset the quiz and start over"
            >
              <Ionicons name="refresh" size={14} color={colors.textSecondary} />
              <Text allowFontScaling={true} style={[qStyles.retryText, { color: colors.textSecondary }]}>Retry</Text>
            </TouchableOpacity>
            {passed && (
              <TouchableOpacity
                style={[qStyles.nextBtn, { backgroundColor: colors.primary }]}
                onPress={onNext}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Next Step"
                accessibilityHint="Double tap to load the next recommended activity"
              >
                <Text allowFontScaling={true} style={[qStyles.nextText, { color: colors.onPrimary }]}>Next Step</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.onPrimary} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const qStyles = StyleSheet.create({
  container: { marginTop: SPACING.xl },
  header: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  qCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    borderCurve: 'continuous',
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    boxShadow: SHADOWS.sm,
  },
  qNum: { fontSize: FONT_SIZES.xl, fontWeight: '900', color: '#D1D5DB', marginBottom: SPACING.sm },
  qText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  bullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bulletLetter: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textSecondary },
  optText: { flex: 1, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  explanation: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderCurve: 'continuous',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    borderCurve: 'continuous',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.md,
    boxShadow: SHADOWS.md,
  },
  answered: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textMuted },
  submitBtn: {
    flexDirection: 'row',
    gap: SPACING.xs,
    alignItems: 'center',
    backgroundColor: '#FCD34D',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderCurve: 'continuous',
  },
  submitText: { fontWeight: '700', color: COLORS.text },
  retryBtn: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  retryText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textSecondary },
  nextBtn: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    backgroundColor: '#FCD34D',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderCurve: 'continuous',
  },
  nextText: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: COLORS.text },
});

const markdownRules = {
  text: (node: any, children: any, parent: any, styles: any) => {
    return <TextWithLookup key={node.key} content={node.content} style={styles.text} />;
  },
};

/* ─── Main screen ─── */
export default function LessonViewerScreen() {
  const router = useRouter();
  const { lessonId, skill } = useLocalSearchParams<{ lessonId: string; skill: string }>();
  const { colors, isDark } = useTheme();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  const breadcrumbItems = useMemo(() => {
    const skillName = skill ? skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase() : '';
    return [
      { label: 'IELTS', route: '/(tabs)/ielts' },
      { label: 'Basic', route: '/(tabs)/ielts' },
      { label: skillName, route: `/ielts/basic/library/${skill}/lessons` },
      { label: lesson?.title || 'Lesson' },
    ];
  }, [skill, lesson?.title]);

  // Dynamic block styling matching dark mode
  const getBlockStyles = useCallback((type: string) => {
    if (isDark) {
      switch (type) {
        case 'traps':
          return { bg: '#450A0A', border: '#7F1D1D', iconColor: '#F87171' };
        case 'strategy':
          return { bg: '#78350F', border: '#92400E', iconColor: '#FBBF24' };
        case 'tips':
          return { bg: '#0C4A6E', border: '#075985', iconColor: '#38BDF8' };
        case 'overview':
          return { bg: '#1E293B', border: '#334155', iconColor: '#94A3B8' };
        default:
          return { bg: 'transparent', border: 'transparent', iconColor: '#94A3B8' };
      }
    } else {
      switch (type) {
        case 'traps':
          return { bg: '#FFF0F0', border: '#FFD6D6', iconColor: '#EF4444' };
        case 'strategy':
          return { bg: '#FFF9E6', border: '#FFF0C2', iconColor: '#D97706' };
        case 'tips':
          return { bg: '#EFF6FF', border: '#BFDBFE', iconColor: '#3B82F6' };
        case 'overview':
          return { bg: '#F6F6F6', border: '#E5E7EB', iconColor: '#6B7280' };
        default:
          return { bg: 'transparent', border: 'transparent', iconColor: '#374151' };
      }
    }
  }, [isDark]);

  // Dynamic markdown styling supporting dark mode text colors
  const dynamicMarkdownStyles = useMemo(() => StyleSheet.create({
    body: {
      fontFamily: FONTS.medium,
      fontSize: FONT_SIZES.sm,
      color: colors.text,
      lineHeight: 22,
    },
    strong: {
      fontFamily: FONTS.bold,
      fontWeight: '700',
      color: colors.text,
    },
    em: {
      fontStyle: 'italic',
      color: colors.text,
    },
    list_item: {
      flexDirection: 'row',
      marginBottom: 4,
    },
    bullet_list: {
      marginTop: 4,
      marginBottom: 8,
    },
  }), [colors]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiClient.get<Lesson>(`/ielts/lessons/${lessonId}`);
        setLesson(res);
      } catch (e) {
        if (__DEV__) console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (lessonId) fetch();
  }, [lessonId]);

  const handleComplete = async () => {
    try {
      await apiClient.post('/ielts/progress/mark-completed', { lessonId });
    } catch (e) {
      if (__DEV__) console.error('Failed to mark lesson complete', e);
    }
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
      if (nextItem) {
        const skillSlug = (
          typeof nextItem.skill === 'object' ? nextItem.skill.name : nextItem.skill
        ).toLowerCase();
        if (nextItem.type === 'lesson') {
          router.replace((ROUTES.ieltsBasicLesson(nextItem.id) + `?skill=${skillSlug}`) as any);
        } else {
          const q = nextItem.lessonId
            ? `?lessonId=${nextItem.lessonId}&skill=${skillSlug}`
            : `?skill=${skillSlug}`;
          router.replace((ROUTES.ieltsBasicExercise(nextItem.id) + q) as any);
        }
      } else {
        router.back();
      }
    } catch (e) {
      router.back();
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]} accessible={true} accessibilityLabel="Loading lesson details, please wait.">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text allowFontScaling={true} style={[styles.loadingText, { color: colors.textSecondary }]}>Loading lesson…</Text>
      </View>
    );
  }
  if (!lesson) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]} accessible={true} accessibilityLabel="Lesson not found.">
        <Text allowFontScaling={true} style={{ color: colors.error, fontWeight: '700' }}>Lesson not found.</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: SPACING.md }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Double tap to return to the library"
        >
          <Text allowFontScaling={true} style={{ color: colors.primary }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.safe, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: lesson.title,
          headerBackTitle: lesson.skill?.name ?? skill ?? 'Back',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={{ marginBottom: SPACING.md }}>
          <Breadcrumb items={breadcrumbItems} />
        </View>

        {/* Content blocks */}
        {Array.isArray(lesson.content) &&
          lesson.content.map((block, idx) => {
            const cfg = BLOCK_CONFIG[block.type] ?? BLOCK_CONFIG.section;
            const isSection = block.type === 'section' || !BLOCK_CONFIG[block.type];
            const dynamicStyles = getBlockStyles(block.type);
            return (
              <Animated.View
                key={idx}
                entering={FadeInDown.delay(idx * 100).duration(500)}
                style={[
                  styles.block,
                  { backgroundColor: dynamicStyles.bg, borderColor: dynamicStyles.border },
                  isSection && styles.blockSection,
                ]}
                accessible={true}
                accessibilityLabel={`${cfg.label ? cfg.label + ': ' : ''}${block.title || ''}`}
              >
                {block.title || cfg.label ? (
                  <View style={styles.blockHeader}>
                    {!isSection && <Ionicons name={cfg.iconName} size={18} color={dynamicStyles.iconColor} />}
                    <Text allowFontScaling={true} style={[styles.blockTitle, { color: colors.textSecondary }, isSection && [styles.blockTitleSection, { color: colors.text }]]}>
                      {block.title || cfg.label}
                    </Text>
                  </View>
                ) : null}
                {block.content ? (
                  <View
                    style={[isSection && { paddingLeft: 0 }, !isSection && { paddingLeft: 26 }]}
                  >
                    <Markdown style={dynamicMarkdownStyles} rules={markdownRules}>
                      {block.content}
                    </Markdown>
                  </View>
                ) : null}
              </Animated.View>
            );
          })}

        {/* Quiz */}
        {Array.isArray(lesson.quiz) && lesson.quiz.length > 0 && (
          <Quiz
            questions={lesson.quiz.slice(0, 4)}
            onComplete={handleComplete}
            onNext={handleNext}
          />
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
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
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
  },
  breadcrumb: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text, marginTop: 2 },

  scroll: { padding: SPACING.lg },
  block: {
    borderRadius: RADIUS.xl,
    borderCurve: 'continuous',
    borderWidth: 1,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  blockSection: {
    borderWidth: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: SPACING.sm,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  blockTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: COLORS.textSecondary,
  },
  blockTitleSection: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    textTransform: 'none',
    letterSpacing: 0,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
});

const markdownStyles = StyleSheet.create({
  body: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 22,
  },
  strong: {
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  em: {
    fontStyle: 'italic',
  },
  list_item: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bullet_list: {
    marginTop: 4,
    marginBottom: 8,
  },
});
