import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';

import { toast } from '@/components/ui';
import { COLORS, SPACING, RADIUS, FONT_SIZES, ROUTES, FONTS } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ConfirmDialog, SuccessCelebration } from '@/components';
import { useAnswerState, useExitConfirm, useGradingPoll } from '@/hooks';
import { ieltsExamsApi } from '@/services';
import {
  ExamHeader,
  ExamAudioPlayer,
  AIGradingOverlay,
  renderGroup,
} from '@/components/intensive';

import { normalizePart } from '@/lib/exam-parser';
import WritingExamBlock from '@/components/ielts/WritingExamBlock';
import SpeakingExamBlock from '@/components/ielts/SpeakingExamBlock';
import ReadingExamBlock from '@/components/ielts/ReadingExamBlock';

const SKILL_COLOR = {
  LISTENING: '#3B82F6',
  READING: '#10B981',
  WRITING: '#EC4899',
  SPEAKING: '#F59E0B',
};

// ─── Extract hints helper ────────────────────────────────────────────────────
function extractHints(obj: any, hintsArray: { qNum: string; text: string }[]) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    obj.forEach((x) => extractHints(x, hintsArray));
    return;
  }
  if ('question_number' in obj && (obj.hint || obj.explanation)) {
    const text = obj.hint || obj.explanation?.rationale || obj.explanation?.reason || (typeof obj.explanation === 'string' ? obj.explanation : '');
    if (text) {
      hintsArray.push({
        qNum: String(obj.question_number),
        text,
      });
    }
    return;
  }
  if ('question_numbers' in obj && (obj.hint || obj.explanation)) {
    const text = obj.hint || obj.explanation?.rationale || obj.explanation?.reason || (typeof obj.explanation === 'string' ? obj.explanation : '');
    if (text) {
      for (const n of obj.question_numbers as number[]) {
        hintsArray.push({ qNum: String(n), text });
      }
    }
    return;
  }
  Object.values(obj).forEach((v) => extractHints(v, hintsArray));
}

export default function PracticePlayerScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { user } = useAuth();
  const { isPremium, loading: subLoading } = useSubscription();
  const { colors, isDark } = useTheme();

  // Verify subscription status
  useEffect(() => {
    if (!subLoading && !isPremium) {
      router.replace(ROUTES.pricing);
    }
  }, [isPremium, subLoading]);

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAiGrading, setIsAiGrading] = useState(false);
  const [activeListeningPartIndex, setActiveListeningPartIndex] = useState(0);
  const [volume, setVolume] = useState(1.0);

  const [showSuccess, setShowSuccess] = useState(false);
  const [pendingResultSessionId, setPendingResultSessionId] = useState<string | null>(null);

  const [gradingErrorVisible, setGradingErrorVisible] = useState(false);
  const [gradingErrorMessage, setGradingErrorMessage] = useState('');
  const [submitConfirmVisible, setSubmitConfirmVisible] = useState(false);
  const [hintsVisible, setHintsVisible] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  // Fetch session data on mount
  const loadSession = useCallback(async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      const data = await ieltsExamsApi.getSession(sessionId);
      setSession(data);
    } catch (err) {
      if (__DEV__) console.error('Failed to load session details', err);
      toast.error('Could not load practice session. Please try again.');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [sessionId, router]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const exam = session?.exam;
  const examType = exam?.type || 'LISTENING';
  const practicePart = session?.practicePart;
  const activeColor = SKILL_COLOR[examType as keyof typeof SKILL_COLOR] || COLORS.primary;

  const styles = createStyles(colors, isDark, activeColor);

  const {
    answers,
    setAnswers,
    writingAnswers,
    setWritingAnswers,
    speakingAnswers,
    setSpeakingAnswers,
    setAnswer,
    getAnsweredCount,
    getTotalCount,
    buildSubmitPayload,
  } = useAnswerState(examType);

  // Load existing answers if resuming
  useEffect(() => {
    if (session?.answers) {
      if (examType === 'WRITING') {
        setWritingAnswers({
          task1: session.answers.task1 || '',
          task2: session.answers.task2 || '',
        });
      } else if (examType === 'SPEAKING') {
        setSpeakingAnswers(session.answers || {});
      } else {
        setAnswers(session.answers || {});
      }
    }
  }, [session, examType, setAnswers, setWritingAnswers, setSpeakingAnswers]);

  // Relaxed Count-Up Timer logic
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (loading || !session) return;
    if (session.timeTaken) {
      setElapsed(session.timeTaken);
    }
  }, [session, loading]);

  useEffect(() => {
    if (loading || !session || submitting || isAiGrading) return;
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, session, submitting, isAiGrading]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');
  const timerDisplay = `${mm}:${ss}`;

  // Autosave for Writing Practice
  const lastSavedRef = useRef<string>('');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (examType !== 'WRITING' || !session?.id || loading) return;
    
    const timer = setInterval(async () => {
      const currentText = practicePart === 1 ? writingAnswers.task1 : writingAnswers.task2;
      if (!currentText.trim() || currentText === lastSavedRef.current) return;

      setIsSaving(true);
      try {
        const payload = buildSubmitPayload(examType);
        await ieltsExamsApi.saveProgress(session.id, payload, elapsed);
        lastSavedRef.current = currentText;
        const now = new Date();
        setLastSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch (e) {
        if (__DEV__) console.warn('Autosave failed:', e);
      } finally {
        setIsSaving(false);
      }
    }, 30000); // Autosave every 30 seconds

    return () => clearInterval(timer);
  }, [session?.id, examType, writingAnswers, practicePart, elapsed, buildSubmitPayload, loading]);

  // Audio configuration for Listening Practice
  const questionsData = exam?.questions || {};
  const listeningParts = useMemo(() => {
    const allParts = questionsData.parts || [];
    if (practicePart !== null && practicePart !== undefined) {
      const p = allParts.find((item: any) => item.part_number === practicePart);
      return p ? [normalizePart(p)] : allParts.map((item: any) => normalizePart(item));
    }
    return allParts.map((item: any) => normalizePart(item));
  }, [questionsData, practicePart]);

  const audioUrl = listeningParts[activeListeningPartIndex]?.audio_url ?? null;
  const player = useAudioPlayer(audioUrl || '');
  const playerStatus = useAudioPlayerStatus(player);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  useEffect(() => {
    const setupAudio = async () => {
      try {
        await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
      } catch (e) {
        console.warn('Failed to set audio mode:', e);
      }
    };
    setupAudio();
  }, []);

  useEffect(() => {
    if (player) player.volume = volume;
  }, [volume, player]);

  useEffect(() => {
    if (!loading && session && audioUrl && player && !player.playing) {
      player.play();
    }
  }, [audioUrl, loading, session, player]);

  // Clean up player on unmount
  useEffect(() => {
    return () => {
      if (player) {
        try {
          player.pause();
        } catch (e) {}
      }
    };
  }, [player]);

  const handleTogglePlay = useCallback(() => {
    if (player) {
      if (player.playing) {
        player.pause();
      } else {
        player.play();
      }
    }
  }, [player]);

  const handleSeek = useCallback(
    (pos: number) => {
      if (player) {
        player.seekTo(pos);
      }
    },
    [player],
  );

  const handleSkip = useCallback(
    (delta: number) => {
      if (player && playerStatus.duration) {
        const next = Math.max(0, Math.min(playerStatus.duration, (playerStatus.currentTime || 0) + delta));
        player.seekTo(next);
      }
    },
    [player, playerStatus],
  );

  const handlePlaybackSpeedChange = useCallback(
    (speed: number) => {
      setPlaybackSpeed(speed);
      if (player) {
        const anyPlayer = player as any;
        if (typeof anyPlayer.setPlaybackSpeed === 'function') {
          anyPlayer.setPlaybackSpeed(speed);
        } else if ('playbackSpeed' in anyPlayer) {
          anyPlayer.playbackSpeed = speed;
        } else if ('speed' in anyPlayer) {
          anyPlayer.speed = speed;
        }
      }
    },
    [player],
  );

  // Extract hints for active section
  const activePartData = useMemo(() => {
    if (!exam?.questions) return null;
    const qData = exam.questions;
    if (examType === 'WRITING') {
      const tasks = qData.tasks || [];
      return tasks.find((t: any) => t.task_number === practicePart) || null;
    } else if (examType === 'SPEAKING') {
      const parts = qData.parts || [];
      return parts.find((p: any) => p.part_number === practicePart) || null;
    } else if (examType === 'READING') {
      const passages = qData.passages || qData.parts || [];
      if (practicePart !== null && practicePart !== undefined) {
        return passages[practicePart - 1] || null;
      }
      return passages;
    } else {
      const parts = qData.parts || [];
      return parts.find((p: any) => p.part_number === practicePart) || null;
    }
  }, [exam, examType, practicePart]);

  const hintsList = useMemo(() => {
    const list: { qNum: string; text: string }[] = [];
    if (activePartData) {
      extractHints(activePartData, list);
    }
    return list;
  }, [activePartData]);

  // Routing after submit or grading is complete
  const onGradingDone = useCallback(
    (sid: string) => {
      setIsAiGrading(false);
      router.replace(`/ielts/intensive/practice/result/${sid}`);
    },
    [router],
  );

  const onGradingError = useCallback((msg: string) => {
    setIsAiGrading(false);
    setGradingErrorMessage(msg);
    setGradingErrorVisible(true);
  }, []);

  // Poll grading status
  useGradingPoll({
    sessionId: session?.id || null,
    enabled: isAiGrading,
    onDone: onGradingDone,
    onError: onGradingError,
  });

  const handleSaveProgress = useCallback(async () => {
    if (!session) return;
    try {
      const payload = buildSubmitPayload(examType);
      await ieltsExamsApi.saveProgress(session.id, payload, elapsed);
      toast.success('Practice progress saved.');
    } catch (e) {
      toast.error('Failed to save progress.');
    }
  }, [session, examType, buildSubmitPayload, elapsed]);

  const handleDiscardProgress = useCallback(async () => {
    if (!session) return;
    try {
      await ieltsExamsApi.deleteSession(session.id);
      toast.info('Practice session discarded.');
    } catch (e) {
      if (__DEV__) console.error('Failed to discard session:', e);
    }
  }, [session]);

  const {
    isVisible: exitConfirmVisible,
    showDialog: showExitConfirm,
    hideDialog: hideExitConfirm,
    confirmSave: handleExitSave,
    confirmDiscard: handleExitDiscard,
  } = useExitConfirm(
    !submitting && !isAiGrading && session !== null,
    handleSaveProgress,
    handleDiscardProgress
  );

  const handleExitPress = () => {
    showExitConfirm();
  };

  const handleSuccessClose = useCallback(() => {
    setShowSuccess(false);
    if (pendingResultSessionId) {
      if (examType !== 'WRITING' && examType !== 'SPEAKING') {
        router.replace(`/ielts/intensive/practice/result/${pendingResultSessionId}`);
      }
    } else {
      router.replace('/ielts/intensive/custom');
    }
  }, [pendingResultSessionId, examType, router]);

  const executeSubmit = async () => {
    if (!session) return;
    try {
      setSubmitting(true);
      if (player && player.playing) player.pause();
      const payload = buildSubmitPayload(examType);
      
      const isAiType = examType === 'WRITING' || examType === 'SPEAKING';
      if (isAiType) {
        setIsAiGrading(true);
      }

      await ieltsExamsApi.submitSession(session.id, payload, elapsed);
      
      setPendingResultSessionId(session.id);
      setShowSuccess(true);
    } catch (e) {
      setIsAiGrading(false);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const writingTasks = useMemo(() => {
    const tasks = questionsData.tasks || [];
    if (practicePart !== null && practicePart !== undefined) {
      const t = tasks.find((item: any) => item.task_number === practicePart);
      return t ? [normalizePart(t)] : tasks.map((item: any) => normalizePart(item));
    }
    return tasks.map((item: any) => normalizePart(item));
  }, [questionsData, practicePart]);

  const speakingParts = useMemo(() => {
    const parts = questionsData.parts || [];
    if (practicePart !== null && practicePart !== undefined) {
      const p = parts.find((item: any) => item.part_number === practicePart);
      return p ? [normalizePart(p)] : parts.map((item: any) => normalizePart(item));
    }
    return parts.map((item: any) => normalizePart(item));
  }, [questionsData, practicePart]);

  const readingParts = useMemo(() => {
    const passages = questionsData.passages || questionsData.parts || [];
    if (practicePart !== null && practicePart !== undefined) {
      const p = passages[practicePart - 1];
      return p ? [normalizePart(p)] : passages.map((item: any) => normalizePart(item));
    }
    return passages.map((item: any) => normalizePart(item));
  }, [questionsData, practicePart]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Setting up practice player...</Text>
      </View>
    );
  }

  if (!session || !exam) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={styles.errorText}>Practice session not found.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: colors.primary, marginTop: 12 }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isAiGrading) {
    return <AIGradingOverlay onGoBack={handleExitPress} />;
  }

  const isWriting = examType === 'WRITING';
  const isSpeaking = examType === 'SPEAKING';
  const isReading = examType === 'READING';
  const isListening = examType === 'LISTENING';

  const answeredCount = getAnsweredCount(examType);
  const totalCount = getTotalCount(examType, exam);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Practice Custom Header */}
      <ExamHeader
        title={`${examType} Practice — Part ${practicePart}`}
        examType="PRACTICE"
        timerDisplay={timerDisplay}
        isTimerWarning={false}
        onExitPress={handleExitPress}
      />

      {audioUrl && (
        <ExamAudioPlayer
          isPlaying={player.playing}
          volume={volume}
          onVolumeChange={setVolume}
          mode="practice"
          duration={playerStatus.duration}
          currentTime={playerStatus.currentTime}
          currentPartIndex={activeListeningPartIndex}
          totalParts={listeningParts.length}
          onTogglePlay={handleTogglePlay}
          onSeek={handleSeek}
          onSkip={handleSkip}
          playbackSpeed={playbackSpeed}
          onPlaybackSpeedChange={handlePlaybackSpeedChange}
          isLoading={playerStatus.isBuffering}
        />
      )}

      {/* Main Content Area */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 160 }}
        >
          {/* Hints Section */}
          {hintsList.length > 0 && (
            <View style={styles.hintCard}>
              <TouchableOpacity
                style={styles.hintHeader}
                onPress={() => setHintsVisible(!hintsVisible)}
                activeOpacity={0.8}
              >
                <View style={styles.hintTitleRow}>
                  <Ionicons name="bulb" size={18} color="#F59E0B" />
                  <Text style={styles.hintTitle}>Gợi ý Luyện tập ({hintsList.length})</Text>
                </View>
                <Ionicons
                  name={hintsVisible ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
              
              {hintsVisible && (
                <View style={styles.hintBody}>
                  {hintsList.map((h, idx) => (
                    <View key={idx} style={styles.hintItem}>
                      <Text style={styles.hintQNum}>Q{h.qNum}:</Text>
                      <Text style={styles.hintText}>{h.text}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
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
              onSubmit={() => setSubmitConfirmVisible(true)}
            />
          )}

          {isReading && (
            <ReadingExamBlock
              parts={readingParts}
              answers={answers}
              onChange={setAnswer}
              renderGroup={renderGroup as any}
            />
          )}

          {isListening && (
            <View style={styles.listeningPartSection}>
              {listeningParts.map((part: any, pi: number) => {
                const groups = part.question_groups || part.groups || part.content || [];
                return (
                  <View key={pi} style={styles.partBlock}>
                    <Text style={styles.partTitle}>
                      Part {part.part_number || practicePart || 1}
                      {part.topic ? ` — ${part.topic}` : ''}
                    </Text>
                    {part.part_type && (
                      <Text style={styles.instructions}>{part.part_type}</Text>
                    )}
                    {groups.map((g: any, gi: number) =>
                      renderGroup(g, answers, setAnswer, gi, pi, colors, isDark),
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Practice Submit Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            Tiến độ: <Text style={styles.progressHighlight}>{answeredCount}/{totalCount || '?'}</Text> câu
          </Text>
          {isWriting && isSaving && (
            <Text style={styles.autosaveText}>✍️ Đang tự động lưu...</Text>
          )}
          {isWriting && !isSaving && lastSavedTime && (
            <Text style={styles.autosaveText}>✓ Đã lưu {lastSavedTime}</Text>
          )}
        </View>
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.saveBtn]}
            onPress={handleExitPress}
            activeOpacity={0.8}
          >
            <Ionicons name="save-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.saveBtnText}>Lưu & Thoát</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.submitBtn]}
            onPress={() => setSubmitConfirmVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
            <Text style={styles.submitBtnText}>Nộp Bài</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dialogs */}
      <ConfirmDialog
        visible={exitConfirmVisible}
        onClose={hideExitConfirm}
        title="Thoát Luyện Tập?"
        message="Bạn đang trong phiên luyện tập. Bạn có muốn lưu lại kết quả đã làm hay hủy phiên tập này?"
        variant="warning"
        primaryAction={{
          title: "Lưu & Thoát",
          onPress: handleExitSave,
        }}
        secondaryAction={{
          title: "Hủy Phiên Tập",
          onPress: handleExitDiscard,
        }}
      />

      <SuccessCelebration visible={showSuccess} onClose={handleSuccessClose} />

      <ConfirmDialog
        visible={submitConfirmVisible}
        onClose={() => setSubmitConfirmVisible(false)}
        title="Nộp Bài Luyện Tập?"
        message="Bạn có chắc chắn muốn nộp bài để xem đáp án và nhận đánh giá từ AI không?"
        variant="info"
        primaryAction={{
          title: "Nộp Bài",
          onPress: () => {
            setSubmitConfirmVisible(false);
            executeSubmit();
          },
        }}
        secondaryAction={{
          title: "Hủy",
          onPress: () => setSubmitConfirmVisible(false),
        }}
      />

      <ConfirmDialog
        visible={gradingErrorVisible}
        onClose={() => setGradingErrorVisible(false)}
        title="Lỗi Chấm Điểm"
        message={gradingErrorMessage || "Có lỗi xảy ra trong quá trình AI chấm điểm bài nói/viết của bạn. Vui lòng thử lại."}
        variant="destructive"
        primaryAction={{
          title: "Đồng Ý",
          onPress: () => setGradingErrorVisible(false),
        }}
      />
    </SafeAreaView>
  );
}

function createStyles(colors: any, isDark: boolean, activeColor: string) {
  return StyleSheet.create({
    safeArea: { flex: 1 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    loadingText: { marginTop: 12, fontSize: FONT_SIZES.md, fontFamily: FONTS.medium },
    errorText: { fontSize: FONT_SIZES.md, color: colors.error, fontFamily: FONTS.bold },
    scrollArea: { flex: 1 },
    
    // Hint Accordion Card
    hintCard: {
      margin: SPACING.md,
      backgroundColor: isDark ? colors.surface : '#FEF3C7',
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#FCD34D',
      overflow: 'hidden',
    },
    hintHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: SPACING.md,
    },
    hintTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    hintTitle: {
      fontSize: 14,
      fontFamily: FONTS.bold,
      color: isDark ? colors.text : '#92400E',
    },
    hintBody: {
      paddingHorizontal: SPACING.md,
      paddingBottom: SPACING.md,
      gap: SPACING.sm,
    },
    hintItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 6,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border + '30',
      paddingBottom: 6,
    },
    hintQNum: {
      fontSize: 12,
      fontFamily: FONTS.bold,
      color: activeColor,
      minWidth: 32,
    },
    hintText: {
      flex: 1,
      fontSize: 12,
      fontFamily: FONTS.regular,
      color: colors.textSecondary,
      lineHeight: 18,
    },

    // Listening Block
    listeningPartSection: { padding: SPACING.md },
    partBlock: { gap: SPACING.md },
    partTitle: { fontSize: 18, fontFamily: FONTS.bold, color: colors.text, marginBottom: 4 },
    instructions: {
      fontSize: 12,
      fontFamily: FONTS.medium,
      color: colors.textSecondary,
      backgroundColor: isDark ? colors.surface : '#EFF6FF',
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      borderLeftWidth: 4,
      borderLeftColor: activeColor,
      lineHeight: 18,
    },

    // Bottom action bar
    bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingHorizontal: SPACING.lg,
      paddingTop: SPACING.sm,
      paddingBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: 8,
      elevation: 10,
    },
    progressRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.sm,
    },
    progressText: {
      fontSize: 12,
      fontFamily: FONTS.medium,
      color: colors.textSecondary,
    },
    progressHighlight: {
      fontFamily: FONTS.bold,
      color: activeColor,
    },
    autosaveText: {
      fontSize: 11,
      fontStyle: 'italic',
      color: colors.textMuted,
    },
    btnRow: {
      flexDirection: 'row',
      gap: SPACING.md,
    },
    actionBtn: {
      flex: 1,
      height: 48,
      borderRadius: RADIUS.xl,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    saveBtn: {
      backgroundColor: isDark ? colors.surface : '#F3F4F6',
      borderWidth: 1,
      borderColor: colors.border,
    },
    saveBtnText: {
      fontSize: 14,
      fontFamily: FONTS.bold,
      color: colors.textSecondary,
    },
    submitBtn: {
      backgroundColor: activeColor,
      shadowColor: activeColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    submitBtnText: {
      fontSize: 14,
      fontFamily: FONTS.bold,
      color: '#fff',
    },
  });
}
