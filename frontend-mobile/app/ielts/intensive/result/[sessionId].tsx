import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { ieltsExamsApi } from '@/services/ielts.api';
import { Button, ScoreBadge } from '@/components/ui';

function getIeltsBandFromScore(score: number) {
  if (score >= 39) return 9.0; if (score >= 37) return 8.5; if (score >= 35) return 8.0;
  if (score >= 32) return 7.5; if (score >= 30) return 7.0; if (score >= 26) return 6.5;
  if (score >= 23) return 6.0; if (score >= 18) return 5.5; if (score >= 16) return 5.0;
  if (score >= 13) return 4.5; if (score >= 10) return 4.0; if (score >= 8) return 3.5;
  if (score >= 6) return 3.0; if (score >= 4) return 2.5; if (score >= 2) return 2.0;
  return 1.0;
}

function getBandColor(band: number) {
  if (band >= 7) return COLORS.success;
  if (band >= 5.5) return COLORS.primary;
  if (band >= 4) return COLORS.warning;
  return COLORS.error;
}

const SCORE_DESCRIPTIONS: Record<string, string> = {
  '9.0': 'Expert', '8.5': 'Very Good', '8.0': 'Very Good',
  '7.5': 'Good', '7.0': 'Good', '6.5': 'Competent',
  '6.0': 'Competent', '5.5': 'Modest', '5.0': 'Modest',
  '4.5': 'Limited', '4.0': 'Limited', '3.5': 'Extremely Limited',
  '3.0': 'Extremely Limited', '2.5': 'Intermittent', '2.0': 'Intermittent',
  '1.0': 'Non User',
};

export default function ResultScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ieltsExamsApi.getSession(sessionId)
      .then(setSession)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading result…</Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.center}>
        <Text>Session not found.</Text>
      </View>
    );
  }

  const rawScore = session.result?.totalScore ?? 0;
  const examType = session.exam?.type;
  const isWritingOrSpeaking = examType === 'WRITING' || examType === 'SPEAKING';

  let band = 0;
  if (isWritingOrSpeaking) {
    band = session.result?.writingScore ?? session.result?.speakingScore ?? 0;
  } else {
    band = getIeltsBandFromScore(rawScore);
  }

  const bandStr = band.toFixed(1);
  const bandColor = getBandColor(band);
  const description = SCORE_DESCRIPTIONS[bandStr] || '';

  const timeTaken = session.timeTaken;
  const mm = timeTaken ? String(Math.floor(timeTaken / 60)).padStart(2, '0') : '--';
  const ss = timeTaken ? String(timeTaken % 60).padStart(2, '0') : '--';

  const isPending = ['SUBMITTED', 'GRADING'].includes(session.status);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.heroSection, { backgroundColor: bandColor + '15' }]}>
          <View style={[styles.bandCircle, { borderColor: bandColor }]}>
            <Text style={[styles.bandScore, { color: bandColor }]}>{bandStr}</Text>
            <Text style={[styles.bandLabel, { color: bandColor }]}>Band</Text>
          </View>
          <Text style={styles.resultTitle}>
            {isPending ? '⏳ Grading in Progress' : '✅ Test Complete'}
          </Text>
          <Text style={styles.description}>{isPending ? 'Your writing/speaking is being graded by AI. Check back soon.' : description}</Text>
          <Text style={styles.examTitle} numberOfLines={2}>{session.exam?.title}</Text>
        </View>

        {/* Stats */}
        {!isPending && (
          <View style={styles.statsSection}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{rawScore}</Text>
              <Text style={styles.statLabel}>Raw Score</Text>
            </View>
            <View style={[styles.statCard, styles.statCardMid]}>
              <Text style={styles.statValue}>{40}</Text>
              <Text style={styles.statLabel}>Max Score</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{mm}:{ss}</Text>
              <Text style={styles.statLabel}>Time Taken</Text>
            </View>
          </View>
        )}

        {/* Percentage bar */}
        {!isPending && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Score Breakdown</Text>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(100, (rawScore / 40) * 100)}%` as any, backgroundColor: bandColor },
                ]}
              />
            </View>
            <Text style={styles.progressLabel}>
              {rawScore} / 40 ({Math.round((rawScore / 40) * 100)}%)
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Back to Tests"
            variant="outline"
            onPress={() => router.replace('/ielts/intensive' as any)}
            fullWidth
          />
          <View style={{ height: SPACING.sm }} />
          <Button
            title="View All History"
            variant="ghost"
            onPress={() => router.replace('/ielts/history' as any)}
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: SPACING.md, color: COLORS.textSecondary },
  heroSection: { alignItems: 'center', padding: SPACING.xxxl, paddingTop: SPACING.xxl },
  bandCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  bandScore: { fontSize: 40, fontWeight: '900', lineHeight: 44 },
  bandLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  resultTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm },
  description: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  examTitle: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, textAlign: 'center' },
  statsSection: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statCard: { flex: 1, alignItems: 'center' },
  statCardMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: COLORS.border },
  statValue: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  section: { paddingHorizontal: SPACING.lg, marginTop: SPACING.xl },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  progressBarBg: { height: 12, backgroundColor: COLORS.border, borderRadius: 6, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 6 },
  progressLabel: { marginTop: SPACING.sm, fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, textAlign: 'right' },
  actions: { padding: SPACING.xl, marginTop: SPACING.lg },
});
