import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAudioPlayer } from 'expo-audio';

import { toast } from '@/components/ui';

import { COLORS, SPACING, RADIUS, FONT_SIZES, ROUTES } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui';
import { ConfirmDialog, SuccessCelebration } from '@/components';
import { useAnswerState, useExamSession, useExamTimer, useExitConfirm } from '@/hooks';
import { ieltsExamsApi } from '@/services';
import {
  ExamHeader,
  ExamAudioPlayer,
  ExamAnswerSheet,
  AIGradingOverlay,
  PreparationScreen,
  renderGroup,
} from '@/components/intensive';

import WritingExamBlock from '@/components/ielts/WritingExamBlock';
import SpeakingExamBlock from '@/components/ielts/SpeakingExamBlock';
import ReadingExamBlock from '@/components/ielts/ReadingExamBlock';

export default function ExamPlayerScreen() {
  const router = useRouter();
  const { examId } = useLocalSearchParams<{ examId: string }>();
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);

  // Verify subscription status
  useEffect(() => {
    if (!isPremium) {
      router.replace(ROUTES.pricing);
    }
  }, [isPremium]);

  const [examReady, setExamReady] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [activeListeningPartIndex, setActiveListeningPartIndex] = useState(0);
  const [volume, setVolume] = useState(1.0);

  const [showSuccess, setShowSuccess] = useState(false);
  const [pendingResultSessionId, setPendingResultSessionId] = useState<string | null>(null);

  const [gradingErrorVisible, setGradingErrorVisible] = useState(false);
  const [gradingErrorMessage, setGradingErrorMessage] = useState('');
  const [submitConfirmVisible, setSubmitConfirmVisible] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const partOffsetsRef = useRef<Record<number, number>>({});

  const onGradingDone = useCallback(
    (sid: string) => {
      router.replace(ROUTES.ieltsIntensiveResult(sid) as any);
    },
    [router],
  );

  const onGradingError = useCallback(
    (msg: string) => {
      setGradingErrorMessage(msg);
      setGradingErrorVisible(true);
    },
    [],
  );

  const { exam, session, loading, submitting, isAiGrading, submitSession } = useExamSession({
    examId,
    userId: user?.id,
    onGradingDone,
    onGradingError,
  });

  const {
    answers,
    setAnswer,
    writingAnswers,
    setWritingAnswers,
    speakingAnswers,
    setSpeakingAnswers,
    getAnsweredCount,
    getTotalCount,
    buildSubmitPayload,
  } = useAnswerState(exam?.type);

  const handleExpire = useCallback(async () => {
    toast.info('Your exam is being automatically submitted.');
    if (!session) return;
    const payload = buildSubmitPayload(exam?.type);
    await submitSession(payload, (exam?.duration ?? 60) * 60);
    if (exam?.type !== 'WRITING' && exam?.type !== 'SPEAKING') {
      router.replace(ROUTES.ieltsIntensiveResult(session.id) as any);
    }
  }, [session, exam, submitSession, router, buildSubmitPayload]);

  const {
    elapsed,
    display: timerDisplay,
    isWarning: isTimerWarning,
  } = useExamTimer(exam?.duration ?? 60, timerRunning, handleExpire);

  const handleSaveProgress = useCallback(async () => {
    if (!session) return;
    try {
      const payload = buildSubmitPayload(exam?.type);
      await ieltsExamsApi.saveProgress(session.id, payload, elapsed);
      toast.success('Progress saved successfully.');
    } catch (e) {
      toast.error('Failed to save progress.');
    }
  }, [session, exam, buildSubmitPayload, elapsed]);

  const handleDiscardProgress = useCallback(async () => {
    if (!session) return;
    try {
      await ieltsExamsApi.deleteSession(session.id);
      toast.info('Exam session discarded.');
    } catch (e) {
      console.error('Failed to discard session:', e);
    }
  }, [session]);

  const {
    isVisible: exitConfirmVisible,
    showDialog: showExitConfirm,
    hideDialog: hideExitConfirm,
    confirmSave: handleExitSave,
    confirmDiscard: handleExitDiscard,
  } = useExitConfirm(
    examReady && !submitting && !isAiGrading,
    handleSaveProgress,
    handleDiscardProgress
  );

  const scrollToQuestion = useCallback(
    (n: number) => {
      if (!exam) return;
      const questionsData = exam.questions as any;
      const partsData =
        questionsData?.parts || questionsData?.passages || questionsData?.tasks || [];
      if (partsData.length === 0) {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        return;
      }
      let targetPartIndex = 0;
      for (let pi = 0; pi < partsData.length; pi++) {
        const groups =
          partsData[pi].question_groups || partsData[pi].groups || partsData[pi].content || [];
        for (const g of groups) {
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
          if (allNums.some((num) => num === n)) {
            targetPartIndex = pi;
            break;
          }
        }
      }
      const yOffset = partOffsetsRef.current[targetPartIndex] ?? 0;
      scrollViewRef.current?.scrollTo({ y: Math.max(0, yOffset - 16), animated: true });
    },
    [exam],
  );

  const listeningParts = exam?.questions?.parts ?? [];
  const audioUrl = listeningParts[activeListeningPartIndex]?.audio_url ?? null;
  const player = useAudioPlayer(audioUrl || '');

  useEffect(() => {
    if (player) player.volume = volume;
  }, [volume, player]);

  useEffect(() => {
    if (!examReady) return;
    if (audioUrl && player && !player.playing) {
      player.play();
    }
  }, [audioUrl, examReady, player]);

  const handleListeningPartChange = (index: number) => {
    if (player.playing) player.pause();
    setActiveListeningPartIndex(index);
  };

  const handleStartExam = () => {
    setExamReady(true);
    setTimerRunning(true);
  };

  const handleExitPress = () => {
    showExitConfirm();
  };

  const handleSuccessClose = useCallback(() => {
    setShowSuccess(false);

    // If it's a standard Listening/Reading exam (non-AI), redirect to results instantly
    if (pendingResultSessionId && exam?.type !== 'WRITING' && exam?.type !== 'SPEAKING') {
      setExamReady(false); // disable exit intercept
      router.replace(ROUTES.ieltsIntensiveResult(pendingResultSessionId) as any);
    } else if (exam?.type === 'WRITING' || exam?.type === 'SPEAKING') {
      // For Writing/Speaking (AI graded) exams, they will stay on this screen
      // which shows the AIGradingOverlay while polling in the background.
      // Do NOT set examReady to false yet, because we need to render the grading overlay!
      // Once grading completes, useExamSession will call onGradingDone which redirects them.
    } else {
      // Fallback: if no pending ID (e.g. error or unknown state), exit to intensive dashboard
      setExamReady(false);
      router.replace(ROUTES.ieltsIntensive as any);
    }
  }, [pendingResultSessionId, exam?.type, router]);

  const handleSubmit = async () => {
    setSubmitConfirmVisible(true);
  };

  const executeSubmit = async () => {
    if (!session) return;
    try {
      setTimerRunning(false);
      if (player && player.playing) player.pause();
      const payload = buildSubmitPayload(exam?.type);
      const res = await submitSession(payload, elapsed);
      if (res) {
        // Do NOT call setExamReady(false) here, because we want the page to stay active
        // so that SuccessCelebration is NOT unmounted prematurely,
        // and AIGradingOverlay renders correctly when SuccessCelebration closes.
        if (res.sessionId) {
          setPendingResultSessionId(res.sessionId);
        }
        setShowSuccess(true);
      }
    } catch (e) {
      toast.error('Failed to submit. Try again.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]} accessible={true} accessibilityLabel="Loading exam player, please wait.">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text allowFontScaling={true} style={[styles.loadingText, { color: colors.textSecondary }]}>Loading exam…</Text>
      </View>
    );
  }

  if (!exam) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]} accessible={true} accessibilityLabel="Exam not found.">
        <Text allowFontScaling={true} style={styles.errorText}>Exam not found.</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Double tap to return to the previous screen"
        >
          <Text allowFontScaling={true} style={{ color: colors.primary }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!examReady) {
    return (
      <PreparationScreen exam={exam} onStartExam={handleStartExam} onBack={() => router.back()} />
    );
  }

  const examType: string = exam.type || 'LISTENING';
  const questionsData = exam.questions as any;
  const parts = questionsData?.parts || questionsData?.passages || questionsData?.tasks || [];

  const isWriting = examType === 'WRITING';
  const writingTasks = questionsData?.tasks || [];

  const isSpeaking = examType === 'SPEAKING';
  const speakingParts = questionsData?.parts || [];

  const isReading = examType === 'READING';

  const answeredCount = getAnsweredCount(examType);
  const totalCount = getTotalCount(examType, exam);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <ExamHeader
        title={exam.title}
        examType={examType}
        timerDisplay={timerDisplay}
        isTimerWarning={isTimerWarning}
        onExitPress={handleExitPress}
      />

      {audioUrl && (
        <ExamAudioPlayer isPlaying={player.playing} volume={volume} onVolumeChange={setVolume} />
      )}

      {isWriting && (
        <WritingExamBlock
          tasks={writingTasks}
          answers={writingAnswers}
          onChange={setWritingAnswers}
        />
      )}

      {isSpeaking && (
        <SpeakingExamBlock
          parts={speakingParts}
          answers={speakingAnswers}
          onChange={setSpeakingAnswers}
          onSubmit={handleSubmit}
        />
      )}

      {isReading && (
        <ReadingExamBlock
          parts={parts}
          answers={answers}
          onChange={setAnswer}
          renderGroup={renderGroup as any}
        />
      )}

      {!isWriting && !isSpeaking && !isReading && (
        <>
          {parts.length > 1 && (
            <View
              style={[
                styles.listeningPartTabs,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              accessible={true}
              accessibilityRole="tablist"
              accessibilityLabel="Listening parts navigation"
            >
              {parts.map((part: any, pi: number) => {
                const isActive = activeListeningPartIndex === pi;
                return (
                  <TouchableOpacity
                    key={pi}
                    style={[styles.listeningPartTab, isActive && styles.listeningPartTabActive]}
                    onPress={() => handleListeningPartChange(pi)}
                    activeOpacity={0.8}
                    accessible={true}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: isActive }}
                    accessibilityLabel={`Part ${part.part_number || pi + 1}`}
                    accessibilityHint="Double tap to switch to this section of the listening test"
                  >
                    <Text
                      allowFontScaling={true}
                      style={[
                        styles.listeningPartTabLabel,
                        { color: colors.textSecondary },
                        isActive && [styles.listeningPartTabLabelActive, { color: colors.primary }],
                      ]}
                    >
                      Part {part.part_number || pi + 1}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollArea}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 120 }}
          >
            {parts.length > 0
              ? (() => {
                  const pi = activeListeningPartIndex;
                  const part = parts[pi];
                  if (!part) return null;
                  const groups = part.question_groups || part.groups || part.content || [];
                  return (
                    <View
                      key={pi}
                      style={styles.partSection}
                      onLayout={(e) => {
                        partOffsetsRef.current[pi] = e.nativeEvent.layout.y;
                      }}
                      accessible={true}
                      accessibilityLabel={`Listening Section Part ${part.part_number || pi + 1}${part.topic ? ', Topic: ' + part.topic : ''}`}
                    >
                      <Text allowFontScaling={true} style={[styles.partTitle, { color: colors.text }]}>
                        Part {part.part_number || pi + 1}
                        {part.topic ? ` — ${part.topic}` : ''}
                      </Text>
                      {part.part_type && (
                        <Text
                          allowFontScaling={true}
                          style={[
                            styles.instructions,
                            {
                              backgroundColor: isDark ? colors.surface : '#FFF9C4',
                              color: colors.textSecondary,
                              borderLeftColor: isDark ? colors.border : colors.warning,
                            },
                          ]}
                        >
                          {part.part_type}
                        </Text>
                      )}
                      {groups.map((g: any, gi: number) =>
                        renderGroup(g, answers, setAnswer, gi, pi, colors, isDark),
                      )}
                    </View>
                  );
                })()
              : (questionsData.groups || []).map((g: any, gi: number) =>
                  renderGroup(g, answers, setAnswer, gi, 0, colors, isDark),
                )}
          </ScrollView>
        </>
      )}

      <View
        style={[styles.submitBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}
      >
        <TouchableOpacity
          style={[
            styles.navToggleBtn,
            {
              backgroundColor: isDark ? colors.surface : COLORS.primary + '12',
              borderColor: isDark ? colors.border : COLORS.primary + '30',
            },
          ]}
          onPress={() => setNavOpen((v) => !v)}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Answer sheet: ${answeredCount} of ${totalCount ?? '?'} answered`}
          accessibilityHint="Double tap to toggle the interactive answer sheet drawer"
        >
          <Ionicons name="grid-outline" size={18} color={colors.primary} />
          <Text allowFontScaling={true} style={[styles.navToggleText, { color: colors.primary }]}>
            {answeredCount}/{totalCount ?? '?'}
          </Text>
        </TouchableOpacity>

        <Button
          title={submitting ? 'Submitting…' : 'Submit Test'}
          onPress={handleSubmit}
          loading={submitting}
          size="lg"
        />
      </View>

      {!isWriting && !isSpeaking && totalCount !== undefined && (
        <ExamAnswerSheet
          open={navOpen}
          onClose={() => setNavOpen(false)}
          totalQuestions={totalCount}
          answers={answers}
          onSelect={scrollToQuestion}
        />
      )}

      {isAiGrading && (
        <AIGradingOverlay
          onGoBack={() => {
            setExamReady(false);
            router.replace(ROUTES.ieltsIntensive as any);
          }}
        />
      )}

      <ConfirmDialog
        visible={exitConfirmVisible}
        onClose={hideExitConfirm}
        title="Exit Exam?"
        message="You are currently in an active exam session. Do you want to save your progress and exit, or discard your answers?"
        variant="warning"
        primaryAction={{
          title: "Save & Exit",
          onPress: handleExitSave,
        }}
        secondaryAction={{
          title: "Discard & Exit",
          onPress: handleExitDiscard,
        }}
      />

      <SuccessCelebration
        visible={showSuccess}
        onClose={handleSuccessClose}
      />

      <ConfirmDialog
        visible={submitConfirmVisible}
        onClose={() => setSubmitConfirmVisible(false)}
        title="Submit Exam?"
        message="Are you sure you want to submit your answers for grading?"
        variant="info"
        primaryAction={{
          title: "Submit",
          onPress: () => {
            setSubmitConfirmVisible(false);
            executeSubmit();
          },
        }}
        secondaryAction={{
          title: "Cancel",
          onPress: () => setSubmitConfirmVisible(false),
        }}
      />

      <ConfirmDialog
        visible={gradingErrorVisible}
        onClose={() => setGradingErrorVisible(false)}
        title="Grading Error"
        message={gradingErrorMessage || "An error occurred while grading your exam. Please try again."}
        variant="destructive"
        primaryAction={{
          title: "OK",
          onPress: () => setGradingErrorVisible(false),
        }}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    loadingText: { marginTop: SPACING.md, color: colors.textSecondary },
    errorText: { fontSize: FONT_SIZES.lg, color: colors.error, marginBottom: SPACING.md },
    scrollArea: { flex: 1 },
    partSection: { marginBottom: SPACING.xxl },
    partTitle: {
      fontSize: FONT_SIZES.lg,
      fontWeight: '800',
      color: colors.text,
      marginBottom: SPACING.lg,
      paddingBottom: SPACING.sm,
      borderBottomWidth: 2,
      borderColor: colors.primary,
    },
    instructions: {
      fontSize: FONT_SIZES.sm,
      color: colors.textSecondary,
      fontStyle: 'italic',
      marginBottom: SPACING.md,
      padding: SPACING.md,
      backgroundColor: isDark ? colors.surface : '#FFF9C4',
      borderRadius: RADIUS.md,
      borderLeftWidth: 3,
      borderLeftColor: isDark ? colors.border : colors.warning,
    },
    submitBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 8,
    },
    navToggleBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      borderRadius: RADIUS.xl,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1.5,
    },
    navToggleText: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
    listeningPartTabs: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    listeningPartTab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: SPACING.md,
      borderBottomWidth: 3,
      borderBottomColor: 'transparent',
    },
    listeningPartTabActive: { borderBottomColor: colors.primary },
    listeningPartTabLabel: {
      fontSize: FONT_SIZES.sm,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    listeningPartTabLabelActive: { color: colors.primary },
  });
