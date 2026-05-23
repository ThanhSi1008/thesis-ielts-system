import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS, ROUTES } from '@/constants';
import { ieltsExamsApi } from '@/services/ielts.api';
import { useTheme } from '@/contexts/ThemeContext';
import { Button, toast } from '@/components/ui';
import WritingRubricView from '@/components/ielts/WritingRubricView';
import SpeakingRubricView from '@/components/ielts/SpeakingRubricView';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SKILL_COLOR = {
  LISTENING: '#3B82F6',
  READING: '#10B981',
  WRITING: '#EC4899',
  SPEAKING: '#F59E0B',
};

// ─── Extract correct answers recursively ──────────────────────────────────────
function extractCorrectAnswers(obj: any, map: Map<string, any>) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    obj.forEach((x) => extractCorrectAnswers(x, map));
    return;
  }
  if ('question_number' in obj && 'answer' in obj) {
    map.set(String(obj.question_number), obj.answer);
    return;
  }
  if ('question_numbers' in obj && 'answer' in obj) {
    let ans = obj.answer;
    if (typeof ans === 'string' && ans.includes(',')) {
      ans = ans.split(',').map((s: string) => s.trim());
    }
    for (const n of obj.question_numbers as number[]) {
      map.set(String(n), ans);
    }
    return;
  }
  Object.values(obj).forEach((v) => extractCorrectAnswers(v, map));
}

function normalizeAns(a: any): string {
  if (!a) return '';
  if (Array.isArray(a)) return a.filter(Boolean).join(', ');
  return String(a);
}

function checkCorrect(userAns: any, correctAns: any): boolean {
  const un = normalizeAns(userAns)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  if (!un) return false;
  const candidates = Array.isArray(correctAns) ? correctAns : [String(correctAns)];
  for (const c of candidates) {
    const variants: string[] = [];
    const parts = String(c)
      .split('/')
      .map((p) => p.trim());
    for (const p of parts) {
      const m = p.match(/^(.*?)\((.*?)\)(.*)$/);
      if (m) {
        variants.push((m[1] + m[3]).trim());
        variants.push((m[1] + m[2] + m[3]).trim());
      } else {
        variants.push(p);
      }
    }
    for (const v of variants) {
      if (un === v.toLowerCase().replace(/[^a-z0-9]/g, '')) return true;
    }
  }
  return false;
}

export default function PracticeResultScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { colors, isDark } = useTheme();

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [retaking, setRetaking] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(true);

  // Fetch session details on mount
  useEffect(() => {
    if (!sessionId) return;
    ieltsExamsApi
      .getSession(sessionId)
      .then((data) => setSession(data))
      .catch((e) => {
        if (__DEV__) console.error(e);
        toast.error('Could not load practice result.');
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  // Poll for AI Grading progress if necessary
  useEffect(() => {
    if (!session || !['SUBMITTED', 'GRADING'].includes(session.status)) return;
    const interval = setInterval(async () => {
      try {
        const data = await ieltsExamsApi.getSession(sessionId);
        setSession(data);
        if (!['SUBMITTED', 'GRADING'].includes(data.status)) clearInterval(interval);
      } catch {
        /* ignore */
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [session?.status, sessionId]);

  const exam = session?.exam;
  const examType = exam?.type || 'LISTENING';
  const practicePart = session?.practicePart;
  const isWritingOrSpeaking = examType === 'WRITING' || examType === 'SPEAKING';
  const isPending = ['SUBMITTED', 'GRADING'].includes(session?.status);
  const activeColor = SKILL_COLOR[examType as keyof typeof SKILL_COLOR] || COLORS.primary;

  const styles = createStyles(colors, isDark, activeColor);

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

  const correctMap = useMemo(() => {
    const map = new Map<string, any>();
    if (activePartData && !isWritingOrSpeaking) {
      extractCorrectAnswers(activePartData, map);
    }
    return map;
  }, [activePartData, isWritingOrSpeaking]);

  const userAnswers = session?.answers || {};
  const totalQuestions = correctMap.size;

  const { correctCount, wrongCount, blankCount } = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let blank = 0;

    correctMap.forEach((correctAns, key) => {
      const user = userAnswers[key];
      const hasAns = !!normalizeAns(user);
      if (hasAns) {
        if (checkCorrect(user, correctAns)) {
          correct++;
        } else {
          wrong++;
        }
      } else {
        blank++;
      }
    });

    return { correctCount: correct, wrongCount: wrong, blankCount: blank };
  }, [correctMap, userAnswers]);

  const band = useMemo(() => {
    if (isWritingOrSpeaking) {
      return session?.result?.writingScore ?? session?.result?.speakingScore ?? 0;
    }
    // For Listening/Reading, simple fraction is visual and correct
    return 0;
  }, [session, isWritingOrSpeaking]);

  const timeTaken = session?.timeTaken ?? 0;
  const mm = String(Math.floor(timeTaken / 60)).padStart(2, '0');
  const ss = String(timeTaken % 60).padStart(2, '0');

  const handleRetake = useCallback(async () => {
    if (!session?.exam?.id || !session?.userId) return;
    try {
      setRetaking(true);
      const newSession = await ieltsExamsApi.createSession(
        session.exam.id,
        session.userId,
        session.practicePart
      );
      router.replace(`/ielts/intensive/practice/${newSession.id}`);
    } catch {
      toast.error('Could not start a new practice session. Please try again.');
    } finally {
      setRetaking(false);
    }
  }, [session, router]);

  const handleShare = useCallback(async () => {
    if (!session) return;
    try {
      setSharing(true);
      const scoreStr = isWritingOrSpeaking ? `Band Score: ${band.toFixed(1)}` : `Score: ${correctCount}/${totalQuestions}`;
      const message = [
        `🎓 IELTS ${examType} Practice Result`,
        `📝 Lesson: ${exam.title} (Part ${practicePart})`,
        ``,
        `⭐ ${scoreStr}`,
        `⏱ Time: ${mm}:${ss}`,
        ``,
        `Practiced with IELTS Master AI 🚀`,
      ].join('\n');
      await Share.share({ message, title: `IELTS Practice Result` });
    } catch {
      /* ignore */
    } finally {
      setSharing(false);
    }
  }, [session, exam, examType, practicePart, band, correctCount, totalQuestions, mm, ss, isWritingOrSpeaking]);

  const rawSpeakingFeedback = session?.result?.feedback;
  const speakingFeedback = useMemo(() => {
    if (!rawSpeakingFeedback) return null;
    if (typeof rawSpeakingFeedback === 'string') {
      try {
        return JSON.parse(rawSpeakingFeedback);
      } catch {
        return null;
      }
    }
    return rawSpeakingFeedback;
  }, [rawSpeakingFeedback]);

  const toggleReview = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setReviewOpen((prev) => !prev);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Fetching practice results…</Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.error }}>Result session not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Certificate Hero Block */}
        <View style={styles.certContainer}>
          <View style={styles.certInnerFrame}>
            <Text style={styles.certHeader}>
              {isPending ? '⏳ ĐANG CHẤM BÀI BẰNG AI' : '🏆 HOÀN THÀNH LUYỆN TẬP'}
            </Text>

            <Text style={styles.certSubText}>
              {isPending
                ? 'AI đang chấm điểm bài làm của bạn. Kết quả phân tích chi tiết sẽ hiển thị sau vài giây...'
                : `Kết quả rèn luyện kỹ năng ${examType} cho bài thực hành từ hệ thống IELTS Intensive`}
            </Text>

            <Text style={styles.certExamTitle} numberOfLines={2}>
              {exam?.title}
            </Text>

            <View style={styles.certBody}>
              {isPending ? (
                <View style={styles.pendingContainer}>
                  <ActivityIndicator size="large" color={activeColor} />
                  <Text style={styles.pendingText}>Đang chấm bài, vui lòng đợi...</Text>
                </View>
              ) : (
                <View style={styles.certScoreContainer}>
                  <View style={styles.certSeal}>
                    {isWritingOrSpeaking ? (
                      <Text style={styles.certSealBand}>{band.toFixed(1)}</Text>
                    ) : (
                      <Text style={styles.certSealRaw}>{correctCount}/{totalQuestions}</Text>
                    )}
                    <Text style={styles.certSealText}>
                      {isWritingOrSpeaking ? 'BAND SCORE' : 'ĐÁP ÁN ĐÚNG'}
                    </Text>
                  </View>

                  <View style={styles.certMetaGrid}>
                    <View style={styles.metaRow}>
                      <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                      <Text style={styles.metaLabel}>Thời gian:</Text>
                      <Text style={styles.metaValue}>{mm}:{ss}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Ionicons name="bookmark-outline" size={16} color={colors.textSecondary} />
                      <Text style={styles.metaLabel}>Phần thực hành:</Text>
                      <Text style={styles.metaValue}>Part {practicePart}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Ionicons name="ribbon-outline" size={16} color={colors.textSecondary} />
                      <Text style={styles.metaLabel}>Kỹ năng:</Text>
                      <Text style={styles.metaValue}>{examType}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* AI Analytical Evaluation for Writing & Speaking */}
        {!isPending && isWritingOrSpeaking && (
          <View style={styles.aiReviewBlock}>
            <View style={styles.aiHeader}>
              <Ionicons name="analytics" size={20} color={activeColor} />
              <Text style={styles.aiTitle}>Phân Tích AI Chi Tiết</Text>
            </View>

            {examType === 'WRITING' && session.result && (
              <WritingRubricView
                feedback={
                  typeof session.result.writingFeedback === 'string'
                    ? JSON.parse(session.result.writingFeedback)
                    : session.result.writingFeedback || session.result
                }
                answers={{
                  task1: session.answers?.task1 ?? session.answers?.['1'],
                  task2: session.answers?.task2 ?? session.answers?.['2'],
                }}
                exam={session.exam}
                practicePart={session.practicePart}
              />
            )}

            {examType === 'SPEAKING' && speakingFeedback && (
              <SpeakingRubricView feedback={speakingFeedback} />
            )}
          </View>
        )}

        {/* Side-by-Side Question Review for Listening & Reading */}
        {!isPending && !isWritingOrSpeaking && totalQuestions > 0 && (
          <View style={styles.reviewCard}>
            <TouchableOpacity style={styles.reviewHeader} onPress={toggleReview} activeOpacity={0.8}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="checkbox-outline" size={18} color={activeColor} />
                <Text style={styles.reviewTitle}>Bảng Review Đáp Án</Text>
              </View>
              <Ionicons
                name={reviewOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {reviewOpen && (
              <View style={styles.reviewBody}>
                {/* Stats Summary Row */}
                <View style={styles.statsSummaryRow}>
                  <View style={[styles.statsItem, { backgroundColor: '#DEF7EC' }]}>
                    <Text style={[styles.statsNum, { color: '#03543F' }]}>{correctCount}</Text>
                    <Text style={[styles.statsLabel, { color: '#03543F' }]}>Chính xác</Text>
                  </View>
                  <View style={[styles.statsItem, { backgroundColor: '#FDE8E8' }]}>
                    <Text style={[styles.statsNum, { color: '#9B1C1C' }]}>{wrongCount}</Text>
                    <Text style={[styles.statsLabel, { color: '#9B1C1C' }]}>Làm sai</Text>
                  </View>
                  <View style={[styles.statsItem, { backgroundColor: isDark ? colors.surface : '#F3F4F6' }]}>
                    <Text style={[styles.statsNum, { color: colors.textSecondary }]}>{blankCount}</Text>
                    <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>Để trống</Text>
                  </View>
                </View>

                {/* Table Review Rows */}
                {Array.from(correctMap.keys()).map((qNum) => {
                  const userAns = userAnswers[qNum];
                  const correctAns = correctMap.get(qNum);
                  const isCorrect = userAns && checkCorrect(userAns, correctAns);
                  const hasAnswer = !!normalizeAns(userAns);

                  return (
                    <View key={qNum} style={styles.tableRow}>
                      <View style={styles.rowQNum}>
                        <Text style={styles.rowQNumText}>Q{qNum}</Text>
                      </View>
                      
                      <View style={styles.rowContent}>
                        {isCorrect ? (
                          <View style={styles.correctPill}>
                            <Ionicons name="checkmark-circle" size={14} color="#15803D" />
                            <Text style={styles.correctPillText}>{normalizeAns(userAns)}</Text>
                          </View>
                        ) : (
                          <View style={styles.wrongPillContainer}>
                            <View style={styles.wrongPill}>
                              <Ionicons name="close-circle" size={14} color="#B91C1C" />
                              <Text style={styles.wrongPillText}>
                                {hasAnswer ? normalizeAns(userAns) : 'Để trống'}
                              </Text>
                            </View>
                            <Ionicons name="arrow-forward" size={12} color={colors.textMuted} />
                            <View style={styles.correctFallbackPill}>
                              <Text style={styles.correctFallbackText}>
                                {normalizeAns(correctAns)}
                              </Text>
                            </View>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Action Panel */}
        <View style={styles.actionsPanel}>
          <TouchableOpacity
            style={[styles.btn, styles.btnShare]}
            onPress={handleShare}
            disabled={sharing}
            activeOpacity={0.8}
          >
            {sharing ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Ionicons name="share-social-outline" size={18} color={colors.primary} />
                <Text style={styles.btnShareText}>Chia sẻ kết quả</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.rowBtns}>
            <TouchableOpacity
              style={[styles.btn, styles.btnCatalog]}
              onPress={() => router.replace('/ielts/intensive/custom')}
              activeOpacity={0.8}
            >
              <Ionicons name="book-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.btnCatalogText}>Quay lại Catalog</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnRetake, retaking && { opacity: 0.7 }]}
              onPress={handleRetake}
              disabled={retaking}
              activeOpacity={0.8}
            >
              {retaking ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="refresh-outline" size={18} color="#fff" />
                  <Text style={styles.btnRetakeText}>Luyện lại</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: any, isDark: boolean, activeColor: string) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: 14, fontFamily: FONTS.medium, color: colors.textSecondary },
    
    // Certificate design
    certContainer: {
      margin: SPACING.lg,
      borderWidth: 2,
      borderColor: activeColor,
      borderRadius: RADIUS.xl,
      padding: SPACING.md,
      backgroundColor: colors.card,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.3 : 0.06,
      shadowRadius: 16,
      elevation: 6,
    },
    certInnerFrame: {
      borderWidth: 1,
      borderColor: activeColor + '40',
      borderRadius: RADIUS.lg,
      padding: SPACING.lg,
      alignItems: 'center',
      gap: 12,
    },
    certHeader: {
      fontSize: 12,
      fontFamily: FONTS.bold,
      color: activeColor,
      letterSpacing: 1.5,
      textAlign: 'center',
    },
    certSubText: {
      fontSize: 11,
      fontFamily: FONTS.regular,
      textAlign: 'center',
      lineHeight: 16,
      paddingHorizontal: SPACING.xs,
    },
    certExamTitle: {
      fontSize: 20,
      fontFamily: FONTS.bold,
      color: colors.text,
      textAlign: 'center',
      marginVertical: SPACING.sm,
    },
    certBody: { width: '100%', alignItems: 'center' },
    pendingContainer: { paddingVertical: 20, alignItems: 'center', gap: 10 },
    pendingText: { fontSize: 13, fontFamily: FONTS.medium, color: colors.textSecondary },
    certScoreContainer: { width: '100%', alignItems: 'center', gap: SPACING.md },
    certSeal: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 3,
      borderColor: activeColor,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? colors.surface : '#FFF',
      shadowColor: activeColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
    },
    certSealBand: { fontSize: 32, fontFamily: FONTS.bold, color: activeColor },
    certSealRaw: { fontSize: 24, fontFamily: FONTS.bold, color: activeColor },
    certSealText: { fontSize: 8, fontFamily: FONTS.bold, color: colors.textSecondary, letterSpacing: 0.5 },
    certMetaGrid: {
      width: '100%',
      backgroundColor: isDark ? colors.surface : '#F9FAFB',
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
      gap: 10,
    },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    metaLabel: { flex: 1, fontSize: 12, fontFamily: FONTS.regular, color: colors.textSecondary },
    metaValue: { fontSize: 12, fontFamily: FONTS.bold, color: colors.text },

    // AI Review
    aiReviewBlock: {
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.lg,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: RADIUS.xl,
      padding: SPACING.lg,
    },
    aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.md },
    aiTitle: { fontSize: 16, fontFamily: FONTS.bold, color: colors.text },

    // Side-by-side Answer Sheet
    reviewCard: {
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.lg,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: RADIUS.xl,
      overflow: 'hidden',
    },
    reviewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: SPACING.lg,
    },
    reviewTitle: { fontSize: 16, fontFamily: FONTS.bold, color: colors.text },
    reviewBody: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg, gap: SPACING.md },
    
    // Stats Summary row
    statsSummaryRow: { flexDirection: 'row', gap: SPACING.md },
    statsItem: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 4,
      borderRadius: RADIUS.md,
      alignItems: 'center',
    },
    statsNum: { fontSize: 16, fontFamily: FONTS.bold },
    statsLabel: { fontSize: 9, fontFamily: FONTS.semibold, marginTop: 2 },

    // Table row review
    tableRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border + '40',
      paddingVertical: 8,
      gap: SPACING.md,
    },
    rowQNum: {
      width: 44,
      height: 28,
      borderRadius: 6,
      backgroundColor: isDark ? colors.surface : '#F3F4F6',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 0.5,
      borderColor: colors.border,
    },
    rowQNumText: { fontSize: 12, fontFamily: FONTS.bold, color: colors.textSecondary },
    rowContent: { flex: 1 },
    correctPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'flex-start',
      backgroundColor: '#DEF7EC',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: RADIUS.sm,
    },
    correctPillText: { fontSize: 13, fontFamily: FONTS.semibold, color: '#03543F' },
    wrongPillContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
    wrongPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: '#FDE8E8',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: RADIUS.sm,
    },
    wrongPillText: { fontSize: 13, fontFamily: FONTS.semibold, color: '#9B1C1C', textDecorationLine: 'line-through' },
    correctFallbackPill: {
      backgroundColor: '#DEF7EC',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: RADIUS.sm,
    },
    correctFallbackText: { fontSize: 13, fontFamily: FONTS.semibold, color: '#03543F' },

    // Action button panel
    actionsPanel: { marginHorizontal: SPACING.lg, gap: SPACING.md },
    btn: {
      height: 48,
      borderRadius: RADIUS.xl,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    btnShare: {
      backgroundColor: isDark ? colors.surface : '#EFF6FF',
      borderWidth: 1,
      borderColor: colors.border,
      width: '100%',
    },
    btnShareText: { fontSize: 14, fontFamily: FONTS.bold, color: colors.primary },
    rowBtns: { flexDirection: 'row', gap: SPACING.md },
    btnCatalog: {
      flex: 1,
      backgroundColor: isDark ? colors.surface : '#F3F4F6',
      borderWidth: 1,
      borderColor: colors.border,
    },
    btnCatalogText: { fontSize: 14, fontFamily: FONTS.bold, color: colors.textSecondary },
    btnRetake: {
      flex: 1,
      backgroundColor: activeColor,
      shadowColor: activeColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    btnRetakeText: { fontSize: 14, fontFamily: FONTS.bold, color: '#fff' },
  });
}
