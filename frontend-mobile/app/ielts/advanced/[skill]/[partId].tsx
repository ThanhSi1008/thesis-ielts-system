import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { ConfirmDialog } from '@/components';
import { toast } from '@/components/ui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES, ROUTES } from '@/constants';
import { ieltsAdvancedApi } from '@/services/ielts.api';
import { Button } from '@/components/ui';
import RichAudioPlayer from '@/components/ielts/RichAudioPlayer';
import TranscriptReview from '@/components/ielts/TranscriptReview';
import PassageReview from '@/components/ielts/PassageReview';
import ReadingExamBlock from '@/components/ielts/ReadingExamBlock';
import { ExamAnswerSheet, renderGroup } from '@/components/intensive';
import { extractAllItemsFromPart, questionNumbersFromItems } from '@/lib/exam-parser';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useExamTimer, useExitConfirm } from '@/hooks';

const createStyles = (colors: any) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
    },
    headerTitle: { color: '#fff', fontSize: FONT_SIZES.sm, fontWeight: '700' },
    headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: FONT_SIZES.xs, marginTop: 2 },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
    ansCount: { color: '#fff', fontSize: FONT_SIZES.sm, fontWeight: '700' },
    historyBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },

    audioPlayer: { margin: SPACING.md, marginBottom: 0 },

    transcriptSection: { marginHorizontal: SPACING.md, marginTop: SPACING.sm },
    transcriptToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      borderWidth: 1,
      borderRadius: RADIUS.lg,
      padding: SPACING.sm,
      paddingHorizontal: SPACING.md,
    },
    transcriptToggleText: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
    transcriptPanel: {
      maxHeight: 240,
      marginTop: 4,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: RADIUS.lg,
      backgroundColor: colors.card,
      overflow: 'hidden',
    },

    passagePanel: {
      maxHeight: 220,
      marginHorizontal: SPACING.md,
      marginTop: SPACING.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: RADIUS.lg,
      backgroundColor: colors.card,
      overflow: 'hidden',
      padding: SPACING.sm,
    },
    panelLabel: {
      fontSize: FONT_SIZES.xs,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 4,
      paddingHorizontal: SPACING.sm,
    },

    scroll: { flex: 1 },

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
    timerPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      borderRadius: RADIUS.lg,
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    timerText: {
      fontSize: FONT_SIZES.xs,
      fontWeight: '700',
    },
  });

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function AdvancedPartScreen() {
  const router = useRouter();
  const { isPremium, loading: subLoading } = useSubscription();
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors);

  // Verify subscription status
  useEffect(() => {
    if (!subLoading && !isPremium) {
      router.replace(ROUTES.pricing);
    }
  }, [isPremium, subLoading]);
  const { skill, partId } = useLocalSearchParams<{ skill: string; partId: string }>();
  const [part, setPart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const hasSubmittedRef = useRef(false);
  const [locatedQuestion, setLocatedQuestion] = useState<number | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [confirmSubmitVisible, setConfirmSubmitVisible] = useState(false);

  // Answer Palette, Flagging, and Timed states
  const [navOpen, setNavOpen] = useState(false);
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [isTimed, setIsTimed] = useState(false);

  const isListening = skill === 'listening';
  const accentColor = isListening ? COLORS.skill.listening : COLORS.skill.reading;

  const items = React.useMemo(() => (part ? extractAllItemsFromPart(part) : []), [part]);
  const qNumbers = React.useMemo(() => questionNumbersFromItems(items), [items]);

  const questionsScrollRef = useRef<ScrollView>(null);
  const questionOffsetsRef = useRef<Record<number, number>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const data = isListening
          ? await ieltsAdvancedApi.getListeningPart(partId)
          : await ieltsAdvancedApi.getReadingPart(partId);
        setPart(data);
      } catch (e) {
        if (__DEV__) console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [partId, isListening]);

  const setAnswer = useCallback(
    (key: string, value: string) => setAnswers((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const answeredSet = React.useMemo(() => {
    const s = new Set<number>();
    if (!part) return s;
    const itemsList = extractAllItemsFromPart(part);
    for (const item of itemsList) {
      if ('qns' in item && item.qns) {
        for (const n of item.qns) {
          if (answers[String(n)] && answers[String(n)].trim()) {
            s.add(n);
          }
        }
      } else if ('qn' in item) {
        if (answers[String(item.qn)] && answers[String(item.qn)].trim()) {
          s.add(item.qn);
        }
      }
    }
    return s;
  }, [part, answers]);

  const handleToggleFlag = useCallback((n: number) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(n)) {
        next.delete(n);
      } else {
        next.add(n);
      }
      return next;
    });
  }, []);

  const handleLocate = useCallback(
    (qNum: number) => {
      // Reset to re-trigger scroll effect in child even if same question
      setLocatedQuestion(null);
      setTimeout(() => setLocatedQuestion(qNum), 30);
      if (isListening) setShowTranscript(true);
    },
    [isListening],
  );

  const scrollToQuestion = useCallback(
    (n: number) => {
      setLocatedQuestion(n);
      if (isListening) {
        const y = questionOffsetsRef.current[n];
        if (y != null) {
          questionsScrollRef.current?.scrollTo({ y, animated: true });
        }
      }
    },
    [isListening],
  );

  const executeSubmit = async () => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    setHasSubmitted(true);
    setSubmitting(true);
    try {
      if (__DEV__) console.log('[SUBMIT] sending:', JSON.stringify({ partId, answers }));
      const result = isListening
        ? await ieltsAdvancedApi.submitListening(partId, answers)
        : await ieltsAdvancedApi.submitReading(partId, answers);
      if (__DEV__) console.log('[SUBMIT] response:', JSON.stringify(result));
      router.replace(
        ROUTES.ieltsAdvancedSkillPartResult(skill as string, partId as string, result.id),
      );
    } catch (err) {
      if (__DEV__) console.error('[SUBMIT] error:', err);
      toast.error('Error', 'Submission failed.');
      hasSubmittedRef.current = false;
      setHasSubmitted(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setConfirmSubmitVisible(true);
  };

  // Timed practice countdown
  const timeLimit = isListening ? 30 : 20;
  const timer = useExamTimer(
    timeLimit,
    isTimed && !submitting && !hasSubmitted,
    executeSubmit,
    0
  );

  // Exit warning dialog integration
  const {
    isVisible: exitConfirmVisible,
    showDialog: showExitConfirm,
    hideDialog: hideExitConfirm,
    confirmDiscard: handleExitDiscard,
  } = useExitConfirm(
    answeredSet.size > 0 && !submitting && !hasSubmitted,
    undefined,
    () => {}
  );

  if (subLoading || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const content: any[] = part?.content || [];
  const audioUrl: string | undefined = part?.audioUrl;
  const transcript: any[] | undefined = part?.transcript;
  const passage: string | undefined = part?.passage;
  const passageWithLocations: any[] = part?.passageWithLocations ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: accentColor }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back to previous page"
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: SPACING.md }}>
          <Text style={styles.headerTitle} numberOfLines={1} allowFontScaling={true}>
            {part?.title}
          </Text>
          <Text style={styles.headerSub} allowFontScaling={true}>
            Part {part?.partNumber} · {isListening ? 'Listening' : 'Reading'}
            {qNumbers.length > 0
              ? ` · Questions ${qNumbers[0]} - ${qNumbers[qNumbers.length - 1]}`
              : ''}
          </Text>
        </View>
        <View style={styles.headerActions}>
          {isTimed ? (
            <View
              style={[styles.timerPill, timer.isWarning && { backgroundColor: '#F59E0B22', borderColor: '#F59E0B' }]}
              accessible={true}
              accessibilityLabel={`Countdown timer remaining: ${timer.display}`}
            >
              <Ionicons name="alarm-outline" size={14} color={timer.isWarning ? '#F59E0B' : '#fff'} />
              <Text style={[styles.timerText, { color: timer.isWarning ? '#F59E0B' : '#fff' }]} allowFontScaling={true}>
                {timer.display}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setIsTimed(true);
                toast.success('Timed Practice Enabled', `You have ${timeLimit} minutes to complete this part.`);
              }}
              hitSlop={8}
              style={styles.historyBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Enable timed practice countdown timer"
            >
              <Ionicons name="alarm-outline" size={20} color="#fff" />
            </TouchableOpacity>
          )}

          <Text style={styles.ansCount} allowFontScaling={true}>
            {answeredSet.size}/{qNumbers.length} ans
          </Text>
          <TouchableOpacity
            onPress={() =>
              router.push(ROUTES.ieltsAdvancedSkillPartHistory(skill as string, partId as string))
            }
            hitSlop={8}
            style={styles.historyBtn}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="View practice history and past attempts"
          >
            <Ionicons name="time-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Audio player (listening) */}
      {audioUrl && (
        <RichAudioPlayer audioUrl={audioUrl} accentColor={accentColor} style={styles.audioPlayer} />
      )}

      {/* Collapsible transcript (listening) */}
      {isListening && transcript && transcript.length > 0 && (
        <View style={styles.transcriptSection}>
          <TouchableOpacity
            style={[
              styles.transcriptToggle,
              { borderColor: accentColor + '40', backgroundColor: accentColor + '08' },
            ]}
            onPress={() => setShowTranscript((v) => !v)}
          >
            <Ionicons name="document-text-outline" size={16} color={accentColor} />
            <Text style={[styles.transcriptToggleText, { color: accentColor }]}>
              {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
            </Text>
            <Ionicons
              name={showTranscript ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={accentColor}
              style={{ marginLeft: 'auto' }}
            />
          </TouchableOpacity>
          {showTranscript && (
            <View style={styles.transcriptPanel}>
              <TranscriptReview
                transcript={transcript}
                locatedQuestion={locatedQuestion}
                accentColor={accentColor}
              />
            </View>
          )}
        </View>
      )}

      {/* Reading passage with split-resizable layout (Reading) or basic review */}
      {isListening ? (
        <>
          {/* Questions (Listening) */}
          <ScrollView
            ref={questionsScrollRef}
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 120 }}
          >
            {content.map((g: any, gi: number) => (
              <View
                key={gi}
                onLayout={(e) => {
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
                  allNums.forEach((num) => {
                    questionOffsetsRef.current[num] = e.nativeEvent.layout.y;
                  });
                }}
              >
                {renderGroup(g, answers, setAnswer, gi, 0, colors, isDark, handleLocate)}
              </View>
            ))}
          </ScrollView>
        </>
      ) : (
        <View style={{ flex: 1, marginBottom: 80 }}>
          <ReadingExamBlock
            parts={[part]}
            answers={answers}
            onChange={setAnswer}
            renderGroup={(g, ans, onChange, gi, pi, cls, dark) =>
              renderGroup(g, ans, onChange, gi, pi, cls, dark, handleLocate)
            }
            isAdvanced
            passageWithLocations={passageWithLocations}
            locatedQuestion={locatedQuestion}
            accentColor={accentColor}
          />
        </View>
      )}

      {/* Submit bar */}
      <View style={styles.submitBar}>
        <TouchableOpacity
          style={[
            styles.navToggleBtn,
            {
              backgroundColor: isDark ? colors.surface : colors.primary + '12',
              borderColor: isDark ? colors.border : colors.primary + '30',
            },
          ]}
          onPress={() => setNavOpen((v) => !v)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Answer sheet: ${answeredSet.size} of ${qNumbers.length} answered`}
        >
          <Ionicons name="grid-outline" size={18} color={colors.primary} />
          <Text style={[styles.navToggleText, { color: colors.primary }]}>
            {answeredSet.size}/{qNumbers.length}
          </Text>
        </TouchableOpacity>

        <Button
          title={submitting ? 'Submitting…' : 'Submit'}
          onPress={handleSubmit}
          loading={submitting}
          size="lg"
          style={{ flex: 1, marginLeft: SPACING.md }}
        />
      </View>

      <ConfirmDialog
        visible={confirmSubmitVisible}
        onClose={() => setConfirmSubmitVisible(false)}
        title="Submit Answers?"
        message="You cannot change your answers after submitting."
        variant="confirm"
        primaryAction={{
          title: 'Submit',
          onPress: async () => {
            setConfirmSubmitVisible(false);
            await executeSubmit();
          },
        }}
        secondaryAction={{
          title: 'Cancel',
          onPress: () => setConfirmSubmitVisible(false),
        }}
      />

      <ConfirmDialog
        visible={exitConfirmVisible}
        onClose={hideExitConfirm}
        title="Exit Practice?"
        message="Are you sure you want to exit? Your answers for this practice session will not be saved."
        variant="destructive"
        primaryAction={{
          title: 'Exit & Discard',
          onPress: handleExitDiscard,
        }}
        secondaryAction={{
          title: 'Cancel',
          onPress: hideExitConfirm,
        }}
      />

      {qNumbers.length > 0 && (
        <ExamAnswerSheet
          open={navOpen}
          onClose={() => setNavOpen(false)}
          totalQuestions={qNumbers.length}
          answers={answers}
          onSelect={scrollToQuestion}
          answeredSet={answeredSet}
          flaggedSet={flagged}
          onToggleFlag={handleToggleFlag}
        />
      )}
    </SafeAreaView>
  );
}
