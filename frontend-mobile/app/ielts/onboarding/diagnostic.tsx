import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal as RNModal,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { COLORS, SPACING, RADIUS, FONT_SIZES, API_BASE_URL, FONTS, ROUTES } from '@/constants';
import { ieltsProfileApi } from '@/services/ielts.api';
import { AudioPlayer } from '@/components/ui/AudioPlayer';
import { ContentGroupView } from '@/components/ielts/exercise/ContentGroupView';
import { writingClozeData } from '@/constants/writingClozeData';
import { Button } from '@/components/ui';

const { height: SCREEN_H } = Dimensions.get('window');

interface Scores {
  listening: number;
  reading: number;
  writing: number;
  overall: number;
}

/* ─── Score calculation (port of SharedScoreUtils.ts) ─── */
function calcScore(content: any[] | undefined, answers: Record<string | number, string>): number {
  if (!content) return 0;
  let s = 0;
  content.forEach((g: any, gi: number) => {
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
        qs.forEach((q: any) => {
          const ua = (answers[q.question_number] ?? '').toUpperCase();
          if (ua === (q.answer ?? '').toUpperCase()) s++;
        });
      }
    }
  });
  return s;
}

function getTotalQuestions(content: any[] | undefined): number {
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

export default function DiagnosticScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    targetBand: string;
    commitment: string;
    examDate?: string;
  }>();

  const [stage, setStage] = useState<'listening' | 'reading' | 'writing' | 'finish'>('listening');
  const [exercises, setExercises] = useState<{ listening: any; reading: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Answers State
  const [listeningAnswers, setListeningAnswers] = useState<Record<string | number, string>>({});
  const [readingAnswers, setReadingAnswers] = useState<Record<string | number, string>>({});
  const [writingAnswers, setWritingAnswers] = useState<Record<number, string>>({});

  // Writing blank picker modal state
  const [activeBlankId, setActiveBlankId] = useState<number | null>(null);
  const [blankPickerVisible, setBlankPickerVisible] = useState(false);

  // Final Scores
  const [scores, setScores] = useState<Scores>({
    listening: 0,
    reading: 0,
    writing: 0,
    overall: 0,
  });

  useEffect(() => {
    const fetchPlacement = async () => {
      try {
        const res = await ieltsProfileApi.getPlacementExercises();
        setExercises(res);
      } catch (err) {
        if (__DEV__) console.error('Failed to load placement exercises:', err);
        Alert.alert('Error', 'Could not load diagnostic test. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlacement();
  }, []);

  const handleListeningNext = () => {
    if (!exercises?.listening) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const score = calcScore(exercises.listening.content, listeningAnswers);
    const total = getTotalQuestions(exercises.listening.content);
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    setScores((prev) => ({ ...prev, listening: percentage }));
    setStage('reading');
  };

  const handleReadingNext = () => {
    if (!exercises?.reading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const score = calcScore(exercises.reading.content, readingAnswers);
    const total = getTotalQuestions(exercises.reading.content);
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    setScores((prev) => ({ ...prev, reading: percentage }));
    setStage('writing');
  };

  const handleWritingNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    let score = 0;
    writingClozeData.paragraph.forEach((p: any) => {
      if (p.type === 'blank') {
        const correctOpt = p.options[p.correct];
        if (writingAnswers[p.id] === correctOpt) {
          score++;
        }
      }
    });
    const percentage = Math.round((score / writingClozeData.totalBlanks) * 100);

    setScores((prev) => {
      const overall = Math.round((prev.listening + prev.reading + percentage) / 3);
      return {
        ...prev,
        writing: percentage,
        overall,
      };
    });
    setStage('finish');
  };

  const handleFinishOnboarding = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitting(true);
    try {
      await ieltsProfileApi.onboarding({
        targetBand: parseFloat(params.targetBand || '6.5'),
        dailyCommitmentMins: parseInt(params.commitment || '30', 10),
        examDate: params.examDate || null,
        takePlacement: true,
        placementScore: scores.overall,
        placementListening: scores.listening,
        placementReading: scores.reading,
        placementWriting: scores.writing,
      });
      router.replace(ROUTES.ieltsRoadmap);
    } catch (e: any) {
      if (__DEV__) console.error('Diagnostic Complete Error:', e?.response?.data || e.message || e);
      Alert.alert('Error', 'Could not generate your custom roadmap. Try again.');
      setSubmitting(false);
    }
  };

  const activeBlankOptions = useMemo(() => {
    if (activeBlankId === null) return [];
    const blank = writingClozeData.paragraph.find(
      (p) => p.type === 'blank' && p.id === activeBlankId,
    );
    return blank ? (blank.options as string[]) : [];
  }, [activeBlankId]);

  const selectBlankAnswer = (ans: string) => {
    if (activeBlankId === null) return;
    Haptics.selectionAsync();
    setWritingAnswers((prev) => ({ ...prev, [activeBlankId]: ans }));
    setBlankPickerVisible(false);
    setActiveBlankId(null);
  };

  const getQuality = (score: number) => {
    if (score >= 90)
      return { text: 'Excellent', color: '#16A34A', desc: "You'll skip basic lessons entirely." };
    if (score >= 70)
      return {
        text: 'Good',
        color: '#2563EB',
        desc: "You'll practice 1 focused exercise per lesson.",
      };
    if (score >= 50)
      return {
        text: 'Moderate',
        color: '#D97706',
        desc: "You'll practice 2 core exercises per lesson.",
      };
    return {
      text: 'Beginner',
      color: '#DC2626',
      desc: "You'll cover all standard step lessons & exercises.",
    };
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading placement test...</Text>
      </View>
    );
  }

  const steps = ['listening', 'reading', 'writing', 'finish'];
  const currentIndex = steps.indexOf(stage);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Modern High-Fidelity Header & Stepper */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Diagnostic Quiz</Text>
        <View style={styles.stepperRow}>
          {['Listening', 'Reading', 'Writing', 'Finish'].map((label, idx) => {
            const isActive = idx === currentIndex;
            const isDone = idx < currentIndex;
            return (
              <View key={label} style={styles.stepIndicatorWrapper}>
                <View
                  style={[
                    styles.stepBadge,
                    isDone && styles.badgeDone,
                    isActive && styles.badgeActive,
                  ]}
                >
                  {isDone ? (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  ) : (
                    <Text style={[styles.stepNum, isActive && styles.stepNumActive]}>
                      {idx + 1}
                    </Text>
                  )}
                </View>
                <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>{label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Main Multi-Stage Content Panel */}
      <View style={styles.body}>
        {stage === 'listening' && exercises?.listening && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.stageContainer}>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.stageIntro}>
                <Ionicons name="headset-outline" size={24} color={COLORS.skill.listening} />
                <Text style={styles.stageTitle}>
                  {exercises.listening.topic ?? 'Listening Placement'}
                </Text>
              </View>

              {exercises.listening.audioUrl && (
                <View style={styles.audioContainer}>
                  <AudioPlayer
                    url={
                      exercises.listening.audioUrl.startsWith('http')
                        ? exercises.listening.audioUrl
                        : `${API_BASE_URL}${exercises.listening.audioUrl}`
                    }
                  />
                </View>
              )}

              {exercises.listening.content?.map((group: any, gi: number) => (
                <ContentGroupView
                  key={gi}
                  group={group}
                  gi={gi}
                  answers={listeningAnswers}
                  submitted={false}
                  onAnswer={(k, v) => setListeningAnswers((p) => ({ ...p, [k]: v }))}
                />
              ))}
            </ScrollView>

            <View style={styles.footer}>
              <Button
                title="Submit & Next Step"
                onPress={handleListeningNext}
                variant="primary"
                size="lg"
              />
            </View>
          </Animated.View>
        )}

        {stage === 'reading' && exercises?.reading && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.stageContainer}>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.stageIntro}>
                <Ionicons name="book-outline" size={24} color={COLORS.skill.reading} />
                <Text style={styles.stageTitle}>
                  {exercises.reading.topic ?? 'Reading Placement'}
                </Text>
              </View>

              {exercises.reading.passage && (
                <View style={styles.passageContainer}>
                  <Text style={styles.passageHeader}>📖 Passage</Text>
                  <Text style={styles.passageText}>{exercises.reading.passage}</Text>
                </View>
              )}

              {exercises.reading.content?.map((group: any, gi: number) => (
                <ContentGroupView
                  key={gi}
                  group={group}
                  gi={gi}
                  answers={readingAnswers}
                  submitted={false}
                  onAnswer={(k, v) => setReadingAnswers((p) => ({ ...p, [k]: v }))}
                />
              ))}
            </ScrollView>

            <View style={styles.footer}>
              <Button
                title="Submit & Next Step"
                onPress={handleReadingNext}
                variant="primary"
                size="lg"
              />
            </View>
          </Animated.View>
        )}

        {stage === 'writing' && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.stageContainer}>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.stageIntro}>
                <Ionicons name="create-outline" size={24} color={COLORS.skill.writing} />
                <Text style={styles.stageTitle}>Writing Vocabulary Check</Text>
              </View>
              <Text style={styles.stageSubtitle}>{writingClozeData.instructions}</Text>

              {/* High-Fidelity Paragraph Cloze rendering with Touch Blanks */}
              <View style={styles.clozeContainer}>
                <View style={styles.clozeTextWrapper}>
                  {writingClozeData.paragraph.map((part: any, i: number) => {
                    if (part.type === 'text') {
                      return (
                        <Text key={i} style={styles.clozeText}>
                          {part.content}
                        </Text>
                      );
                    }
                    if (part.type === 'blank') {
                      const selectedVal = writingAnswers[part.id];
                      return (
                        <TouchableOpacity
                          key={i}
                          style={[
                            styles.clozeBlankPill,
                            selectedVal && styles.clozeBlankPillFilled,
                          ]}
                          onPress={() => {
                            setActiveBlankId(part.id);
                            setBlankPickerVisible(true);
                          }}
                        >
                          <Text
                            style={[
                              styles.clozeBlankText,
                              selectedVal && styles.clozeBlankTextFilled,
                            ]}
                          >
                            {selectedVal || `Blank ${part.id}`}
                          </Text>
                          <Ionicons
                            name="chevron-down"
                            size={12}
                            color={selectedVal ? '#fff' : COLORS.primary}
                          />
                        </TouchableOpacity>
                      );
                    }
                    return null;
                  })}
                </View>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <Button
                title="Submit & Calculate Score"
                onPress={handleWritingNext}
                variant="primary"
                size="lg"
              />
            </View>
          </Animated.View>
        )}

        {stage === 'finish' && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.stageContainer}>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.scrollContentFinish}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.successIconWrapper}>
                <Ionicons name="checkmark-circle" size={64} color="#16A34A" />
              </View>

              <Text style={styles.finishTitle}>Diagnostic Complete!</Text>
              <Text style={styles.finishSubtitle}>
                We've evaluated your English proficiency level and optimized your personalized
                roadmap study tasks.
              </Text>

              {/* Breakdown Cards */}
              <View style={styles.breakdownList}>
                {[
                  { label: 'Listening', score: scores.listening, icon: 'headset-outline' },
                  { label: 'Reading', score: scores.reading, icon: 'book-outline' },
                  { label: 'Writing', score: scores.writing, icon: 'create-outline' },
                ].map((item) => {
                  const qual = getQuality(item.score);
                  return (
                    <View key={item.label} style={styles.breakdownCard}>
                      <View style={styles.cardHeaderRow}>
                        <View style={styles.iconNameRow}>
                          <Ionicons name={item.icon as any} size={20} color={qual.color} />
                          <Text style={styles.cardLabel}>{item.label}</Text>
                        </View>
                        <View style={styles.badgeWrap}>
                          <Text style={[styles.cardScore, { color: qual.color }]}>
                            {item.score}%
                          </Text>
                          <Text style={[styles.cardQualText, { color: qual.color }]}>
                            {qual.text}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.progressBarBg}>
                        <View
                          style={[
                            styles.progressBarActive,
                            { width: `${item.score}%`, backgroundColor: qual.color },
                          ]}
                        />
                      </View>
                      <Text style={styles.cardDesc}>{qual.desc}</Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <Button
                title={submitting ? 'Generating Roadmap...' : 'Continue to My Roadmap'}
                onPress={handleFinishOnboarding}
                loading={submitting}
                variant="primary"
                size="lg"
              />
            </View>
          </Animated.View>
        )}
      </View>

      {/* High-Fidelity Blank Selector Bottom Action Sheet */}
      <RNModal visible={blankPickerVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalOverlayDismiss}
            activeOpacity={1}
            onPress={() => {
              setBlankPickerVisible(false);
              setActiveBlankId(null);
            }}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose the correct word</Text>
              <TouchableOpacity
                onPress={() => {
                  setBlankPickerVisible(false);
                  setActiveBlankId(null);
                }}
              >
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {activeBlankOptions.map((opt) => {
                const isSelected = activeBlankId !== null && writingAnswers[activeBlankId] === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.optionCard, isSelected && styles.optionCardActive]}
                    onPress={() => selectBlankAnswer(opt)}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
                      {opt}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </RNModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  loadingText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    marginTop: 8,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    height: 48,
  },
  stepIndicatorWrapper: {
    alignItems: 'center',
    width: 60,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  badgeActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  badgeDone: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  stepNum: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  stepNumActive: {
    color: COLORS.primary,
  },
  stepLabel: {
    fontFamily: FONTS.medium,
    fontSize: 9,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepLabelActive: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },

  // Main panels
  body: { flex: 1 },
  stageContainer: { flex: 1 },
  scrollContent: {
    padding: SPACING.xl,
    paddingBottom: 40,
  },
  scrollContentFinish: {
    padding: SPACING.xl,
    paddingBottom: 40,
    alignItems: 'center',
  },
  stageIntro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  stageTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.text,
  },
  stageSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
  audioContainer: {
    marginBottom: SPACING.lg,
  },
  passageContainer: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    maxHeight: 200,
    borderCurve: 'continuous',
  },
  passageHeader: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  passageText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },

  // Cloze styling
  clozeContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    borderCurve: 'continuous',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
  },
  clozeTextWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  clozeText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 34,
  },
  clozeBlankPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    borderColor: COLORS.primary,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 4,
    alignSelf: 'center',
  },
  clozeBlankPillFilled: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  clozeBlankText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.primary,
  },
  clozeBlankTextFilled: {
    color: '#fff',
  },

  // Finish screen elements
  successIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    borderColor: '#DCFCE7',
    borderWidth: 1.5,
  },
  finishTitle: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  finishSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  breakdownList: {
    width: '100%',
    gap: 16,
  },
  breakdownCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    borderCurve: 'continuous',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  iconNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardLabel: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text,
  },
  badgeWrap: {
    alignItems: 'flex-end',
  },
  cardScore: {
    fontFamily: FONTS.bold,
    fontSize: 18,
  },
  cardQualText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarActive: {
    height: '100%',
    borderRadius: 3,
  },
  cardDesc: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.textMuted,
  },

  // Footer bar
  footer: {
    padding: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: '#fff',
  },

  // Modal Action Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalOverlayDismiss: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 40,
    borderCurve: 'continuous',
    maxHeight: SCREEN_H * 0.6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.text,
  },
  modalBody: {
    padding: SPACING.xl,
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    borderCurve: 'continuous',
  },
  optionCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '08',
  },
  optionText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text,
  },
  optionTextActive: {
    color: COLORS.primary,
  },
});
