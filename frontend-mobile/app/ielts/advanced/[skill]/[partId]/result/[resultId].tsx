import React, { useEffect, useState, useCallback } from 'react';
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
import { COLORS, SPACING, RADIUS, FONT_SIZES, ROUTES } from '@/constants';
import { ieltsAdvancedApi } from '@/services/ielts.api';
import { Button } from '@/components/ui';
import AnswerSheet from '@/components/ielts/AnswerSheet';
import TranscriptReview from '@/components/ielts/TranscriptReview';
import PassageReview from '@/components/ielts/PassageReview';
import RichAudioPlayer from '@/components/ielts/RichAudioPlayer';
import { isCorrect } from '@/utils/answerNormalization';
import { useTheme } from '@/contexts/ThemeContext';

// ─── Mirrors backend grading logic to extract correct answers client-side ────────
function extractCorrectAnswers(content: any[]): Record<string, string> {
  const map: Record<string, string> = {};
  if (!Array.isArray(content)) return map;

  for (const group of content) {
    // MCM: answers stored as string[] of correct letters (e.g. ['A','C'])
    if (group.type === 'multiple_choice_multiple' && group.question_numbers && group.answers) {
      const correctStr = (group.answers as string[]).slice().sort().join(', ');
      (group.question_numbers as number[]).forEach((qNum) => {
        map[String(qNum)] = correctStr;
      });
      continue;
    }

    const qs: any[] = [];
    if (group.points) qs.push(...group.points);
    if (Array.isArray(group.questions)) qs.push(...group.questions);
    if (group.type === 'matching' && group.items && group.answers) {
      group.items.forEach((item: any) => {
        const correctData = group.answers[item.id];
        const correctLetter = correctData?.letter || correctData || '';
        qs.push({ question_number: item.id, answer: correctLetter });
      });
    }
    if (group.rows) {
      group.rows.forEach((row: any) => {
        if (row.questions) {
          Object.entries(row.questions).forEach(([k, v]: [string, any]) => {
            qs.push({ question_number: k, ...v });
          });
        }
      });
    }

    for (const q of qs) {
      if (!q.question_number) continue;
      const key = String(q.question_number);
      if (q.acceptable_answers && q.acceptable_answers.length > 0) {
        map[key] = q.acceptable_answers.join('/');
      } else if (q.answer != null) {
        map[key] = String(q.answer);
      }
    }
  }
  return map;
}

// Expand mcm-{idx} keys into individual question-number keys for AnswerSheet display
function normalizeUserAnswers(
  rawAnswers: Record<string, string>,
  content: any[],
): Record<string, string> {
  const out = { ...rawAnswers };
  if (!Array.isArray(content)) return out;
  content.forEach((group, idx) => {
    if (group.type === 'multiple_choice_multiple' && group.question_numbers) {
      const mcmVal = rawAnswers[`mcm-${idx}`];
      if (mcmVal != null) {
        const sortedVal = mcmVal.split(',').filter(Boolean).sort().join(', ');
        (group.question_numbers as number[]).forEach((qNum) => {
          out[String(qNum)] = sortedVal;
        });
      }
    }
  });
  return out;
}

type Tab = 'score' | 'review';

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: SPACING.xl,
      gap: SPACING.md,
      backgroundColor: colors.background,
    },
    emptyTitle: {
      fontSize: FONT_SIZES.lg,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: FONT_SIZES.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      maxWidth: 260,
    },
    retryBtn: {
      marginTop: SPACING.sm,
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.xl,
      backgroundColor: colors.text,
    },
    retryBtnText: {
      color: isDark ? colors.background : '#fff',
      fontSize: FONT_SIZES.md,
      fontWeight: '700',
    },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
    },
    backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    headerCenter: { flex: 1, marginLeft: SPACING.sm },
    headerTitle: { color: '#fff', fontSize: FONT_SIZES.sm, fontWeight: '700' },
    headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: FONT_SIZES.xs, marginTop: 2 },

    // Tab bar
    tabBar: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: SPACING.md,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    tabText: {
      fontSize: FONT_SIZES.xs,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    // Score tab
    scroll: { flex: 1 },
    scoreContent: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: 40 },

    // Card
    card: {
      backgroundColor: colors.card,
      borderRadius: RADIUS.xl,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    cardHeader: {
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md + 2,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    cardTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: colors.text },
    cardHint: { fontSize: FONT_SIZES.xs, color: colors.textSecondary, marginTop: 2 },

    // Score body
    scoreBody: { flexDirection: 'row', padding: SPACING.lg, gap: SPACING.md },
    marksBox: {
      width: 108,
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    marksLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', marginBottom: 4 },
    marksRow: { flexDirection: 'row', alignItems: 'flex-end' },
    marksScore: { fontSize: 30, fontWeight: '900', lineHeight: 36 },
    marksTotal: { fontSize: FONT_SIZES.md, fontWeight: '700', marginBottom: 2, marginLeft: 4 },
    marksPct: { fontSize: FONT_SIZES.xs, fontWeight: '700', marginTop: 4 },

    // Breakdown table
    breakdownTable: { flex: 1 },
    tableHeader: {
      flexDirection: 'row',
      paddingBottom: SPACING.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: 2,
    },
    tableHeaderCell: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
    },
    tableNumCell: { width: 36, textAlign: 'center', fontSize: 12, fontWeight: '600' },
    tableRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    tableTypeText: {
      fontSize: FONT_SIZES.xs,
      fontWeight: '600',
      color: colors.text,
      textTransform: 'capitalize',
    },

    // Per-question chip grid
    chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, padding: SPACING.lg },
    chip: {
      width: 40,
      height: 40,
      borderRadius: RADIUS.md,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipText: { fontSize: FONT_SIZES.sm, fontWeight: '800' },

    // Action buttons
    actions: { flexDirection: 'row', gap: SPACING.md },

    // Review tab
    reviewContainer: {
      flex: 1,
      paddingHorizontal: SPACING.lg,
      paddingTop: SPACING.md,
      paddingBottom: SPACING.md,
      gap: SPACING.md,
    },
    reviewSection: {},
    // Explicit height gives `flex: 1` in AnswerSheet a bounded space to fill;
    // the internal ScrollView can then scroll the rows within that bound.
    answerSheetWrap: { height: 210 },
    reviewPanel: {
      flex: 1,
      minHeight: 140,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: RADIUS.xl,
      backgroundColor: colors.card,
      overflow: 'hidden',
    },
    reviewPanelHeader: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm + 2,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    reviewPanelLabel: {
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
  });

export default function AdvancedResultScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const s = createStyles(colors, isDark);
  const { skill, partId, resultId } = useLocalSearchParams<{
    skill: string;
    partId: string;
    resultId: string;
  }>();

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('score');
  const [locatedQuestion, setLocatedQuestion] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data =
          skill === 'listening'
            ? await ieltsAdvancedApi.getListeningHistoryDetail(resultId)
            : await ieltsAdvancedApi.getReadingHistoryDetail(resultId);
        console.log('[RESULT] raw response:', JSON.stringify(data, null, 2)); // DEBUG
        setResult(data);
      } catch (e) {
        console.error('[Result] load failed:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [resultId, skill]);

  const handleLocate = useCallback((qNum: number) => {
    setLocatedQuestion(null);
    setTimeout(() => setLocatedQuestion(qNum), 50);
    setActiveTab('review');
  }, []);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!result) {
    return (
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <View style={s.center}>
          <Ionicons name="cloud-offline-outline" size={52} color={colors.textMuted} />
          <Text style={s.emptyTitle}>Could Not Load Result</Text>
          <Text style={s.emptyText}>Please go back and try again.</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => router.back()}>
            <Text style={s.retryBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isListening = skill === 'listening';
  const accentColor = isListening ? COLORS.skill.listening : COLORS.skill.reading;

  const totalScore: number = result.totalScore ?? 0;
  const totalQuestions: number = result.totalQuestions ?? 0;
  const pct = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
  const scoreData: Record<string, { correct: number; total: number }> = result.scoreData || {};

  const content: any[] = result.part?.content || [];
  const correctAnswers = extractCorrectAnswers(content);
  const userAnswers: Record<string, string> = normalizeUserAnswers(result.answers || {}, content);

  const audioUrl: string | undefined = result.part?.audioUrl;
  const transcript: any[] | undefined = result.part?.transcript;
  const passage: string | undefined = result.part?.passage;
  const passageWithLocations: any[] = result.part?.passageWithLocations ?? [];

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      {/* ── Colored header ── */}
      <View style={[s.header, { backgroundColor: accentColor }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Practice Result</Text>
          <Text style={s.headerSub} numberOfLines={1}>
            {isListening ? 'Listening' : 'Reading'}
            {result.part?.title ? ` · ${result.part.title}` : ''}
          </Text>
        </View>
      </View>

      {/* ── Tab bar ── */}
      <View style={s.tabBar}>
        {(['score', 'review'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              s.tab,
              activeTab === tab && { borderBottomColor: accentColor, borderBottomWidth: 2 },
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[s.tabText, { color: activeTab === tab ? accentColor : colors.textMuted }]}
            >
              {tab === 'score' ? 'Score' : 'Review'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Score tab ── */}
      {activeTab === 'score' && (
        <ScrollView
          style={s.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scoreContent}
        >
          {/* Score Report card */}
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Text style={s.cardTitle}>Score Report</Text>
            </View>
            <View style={s.scoreBody}>
              {/* Marks box */}
              <View style={[s.marksBox, { backgroundColor: accentColor + '18' }]}>
                <Text style={[s.marksLabel, { color: accentColor }]}>Marks</Text>
                <View style={s.marksRow}>
                  <Text style={[s.marksScore, { color: accentColor }]}>{totalScore}</Text>
                  <Text style={[s.marksTotal, { color: accentColor + '80' }]}>
                    / {totalQuestions}
                  </Text>
                </View>
                <Text style={[s.marksPct, { color: accentColor + 'BB' }]}>{pct}%</Text>
              </View>

              {/* Breakdown table */}
              <View style={s.breakdownTable}>
                <View style={s.tableHeader}>
                  <Text style={[s.tableHeaderCell, { flex: 1 }]}>Type</Text>
                  <Text style={[s.tableHeaderCell, s.tableNumCell]}>Cor</Text>
                  <Text style={[s.tableHeaderCell, s.tableNumCell, { textAlign: 'right' }]}>
                    Tot
                  </Text>
                </View>
                {Object.entries(scoreData).map(([type, stats]) => (
                  <View key={type} style={s.tableRow}>
                    <Text style={[s.tableTypeText, { flex: 1 }]} numberOfLines={2}>
                      {type.replace(/_/g, ' ')}
                    </Text>
                    <Text style={[s.tableNumCell, { color: accentColor, fontWeight: '700' }]}>
                      {stats.correct}
                    </Text>
                    <Text style={[s.tableNumCell, { textAlign: 'right', color: colors.textMuted }]}>
                      {stats.total}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Per-question grid card */}
          {totalQuestions > 0 && (
            <View style={s.card}>
              <View style={s.cardHeader}>
                <Text style={s.cardTitle}>Per-Question Summary</Text>
                <Text style={s.cardHint}>
                  Tap a number to locate it in the {isListening ? 'transcript' : 'passage'}.
                </Text>
              </View>
              <View style={s.chipGrid}>
                {Array.from({ length: totalQuestions }, (_, i) => {
                  const q = i + 1;
                  const ua = userAnswers[String(q)] ?? '';
                  const ca = correctAnswers[String(q)] ?? '';
                  const answered = ua.trim().length > 0;
                  const ok = answered && isCorrect(ua, ca);
                  return (
                    <TouchableOpacity
                      key={q}
                      style={[
                        s.chip,
                        {
                          backgroundColor: !answered
                            ? colors.surface
                            : ok
                              ? isDark
                                ? 'rgba(22,163,74,0.15)'
                                : '#F0FDF4'
                              : isDark
                                ? 'rgba(220,38,38,0.15)'
                                : '#FFF1F2',
                          borderColor: !answered
                            ? colors.border
                            : ok
                              ? isDark
                                ? '#22c55e'
                                : '#86EFAC'
                              : isDark
                                ? '#f87171'
                                : '#FCA5A5',
                        },
                      ]}
                      onPress={() => handleLocate(q)}
                    >
                      <Text
                        style={[
                          s.chipText,
                          { color: !answered ? colors.textMuted : ok ? '#16A34A' : '#DC2626' },
                        ]}
                      >
                        {q}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Action buttons */}
          <View style={s.actions}>
            <View style={{ flex: 1 }}>
              <Button
                title="Back to Hub"
                variant="outline"
                onPress={() => router.replace(ROUTES.ieltsAdvanced)}
                fullWidth
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                title="Try Again"
                onPress={() =>
                  router.replace(ROUTES.ieltsAdvancedSkillPart(skill as string, partId as string))
                }
                fullWidth
              />
            </View>
          </View>
        </ScrollView>
      )}

      {/* ── Review tab ── */}
      {activeTab === 'review' && (
        <View style={s.reviewContainer}>
          {/* Audio player (listening only) */}
          {isListening && audioUrl && (
            <View style={s.reviewSection}>
              <RichAudioPlayer audioUrl={audioUrl} accentColor={accentColor} />
            </View>
          )}

          {/* Answer sheet — explicit height so internal ScrollView gets a bound */}
          <View style={s.answerSheetWrap}>
            <AnswerSheet
              answers={userAnswers}
              correctAnswers={correctAnswers}
              totalQuestions={totalQuestions}
              accentColor={accentColor}
            />
          </View>

          {/* Transcript (listening) */}
          {isListening && transcript && transcript.length > 0 && (
            <View style={s.reviewPanel}>
              <View style={s.reviewPanelHeader}>
                <Text style={[s.reviewPanelLabel, { color: accentColor }]}>Transcript</Text>
              </View>
              <TranscriptReview
                transcript={transcript}
                locatedQuestion={locatedQuestion}
                accentColor={accentColor}
              />
            </View>
          )}

          {/* Passage (reading) */}
          {!isListening && passage && (
            <View style={s.reviewPanel}>
              <View style={s.reviewPanelHeader}>
                <Text style={[s.reviewPanelLabel, { color: accentColor }]}>Reading Passage</Text>
              </View>
              <PassageReview
                passage={passage}
                passageWithLocations={passageWithLocations}
                locatedQuestion={locatedQuestion}
                accentColor={accentColor}
              />
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
