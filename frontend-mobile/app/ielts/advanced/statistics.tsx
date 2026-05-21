import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { ieltsAdvancedApi } from '@/services/ielts.api';
import { getQuestionTypeLabel } from '@/constants/ieltsQuestionTypes';

const SKILLS = [
  { key: 'listening', label: 'Listening', color: COLORS.skill.listening },
  { key: 'reading', label: 'Reading', color: COLORS.skill.reading },
  { key: 'writing', label: 'Writing', color: COLORS.skill.writing },
  { key: 'speaking', label: 'Speaking', color: COLORS.skill.speaking },
] as const;

type SkillKey = (typeof SKILLS)[number]['key'];

// Listening stats use scoreData across all ieltsPracticeSession records.
// The statistics endpoint returns aggregated data across all skills.
// Shape: Record<questionType, { correct, total, attempted }>
// For the skill filter we approximate: Listening = session-level data (endpoint returns all).
// Since backend doesn't segment by skill yet, Listening tab shows all stats;
// Writing/Speaking show a coming-soon placeholder.

export default function StatisticsScreen() {
  const router = useRouter();
  const [activeSkill, setActiveSkill] = useState<SkillKey>('listening');
  const [stats, setStats] = useState<
    Record<string, { correct: number; total: number; attempted: number }>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    ieltsAdvancedApi
      .getStatistics()
      .then((data) => setStats(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const skill = SKILLS.find((s) => s.key === activeSkill)!;
  const isComingSoon = activeSkill === 'writing' || activeSkill === 'speaking';

  const entries = Object.entries(stats).sort((a, b) => b[1].total - a[1].total);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Statistics</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Skill tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        contentContainerStyle={styles.tabContent}
      >
        {SKILLS.map((s) => (
          <TouchableOpacity
            key={s.key}
            style={[
              styles.tabChip,
              activeSkill === s.key && { backgroundColor: s.color, borderColor: s.color },
            ]}
            onPress={() => setActiveSkill(s.key)}
          >
            <Text style={[styles.tabChipText, activeSkill === s.key && { color: '#fff' }]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>Could not load statistics.</Text>
        </View>
      ) : isComingSoon ? (
        <View style={styles.center}>
          <Ionicons name="construct-outline" size={56} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>Coming Soon</Text>
          <Text style={styles.emptyText}>
            {skill.label} statistics will be available in a future update.
          </Text>
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="stats-chart-outline" size={56} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No Data Yet</Text>
          <Text style={styles.emptyText}>
            Complete some practice sessions to see your statistics.
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          {/* Summary row */}
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: skill.color + '10', borderColor: skill.color + '30' },
            ]}
          >
            {(() => {
              const totalCorrect = entries.reduce((s, [, v]) => s + v.correct, 0);
              const totalQs = entries.reduce((s, [, v]) => s + v.total, 0);
              const overallPct = totalQs > 0 ? Math.round((totalCorrect / totalQs) * 100) : 0;
              return (
                <>
                  <View style={styles.summaryCircle}>
                    <Text style={[styles.summaryPct, { color: skill.color }]}>{overallPct}%</Text>
                    <Text style={[styles.summaryLabel, { color: skill.color }]}>Overall</Text>
                  </View>
                  <View style={styles.summaryMeta}>
                    <Text style={[styles.summaryBig, { color: skill.color }]}>
                      {totalCorrect} / {totalQs}
                    </Text>
                    <Text style={styles.summaryCaption}>
                      correct across {entries.length} question type{entries.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </>
              );
            })()}
          </View>

          <Text style={styles.sectionLabel}>Breakdown by Question Type</Text>

          {entries.map(([type, data]) => {
            const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
            return (
              <View key={type} style={styles.statRow}>
                <View style={styles.statHeader}>
                  <Text style={styles.statType}>{getQuestionTypeLabel(type)}</Text>
                  <Text style={[styles.statScore, { color: skill.color }]}>
                    {data.correct}/{data.total}
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${pct}%` as any, backgroundColor: skill.color },
                    ]}
                  />
                </View>
                <View style={styles.statMeta}>
                  <Text style={styles.statPct}>{pct}% accuracy</Text>
                  <Text style={styles.statAttempted}>
                    {data.attempted} attempt{data.attempted !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.md,
  },

  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: { color: '#fff', fontSize: FONT_SIZES.lg, fontWeight: '700' },

  tabScroll: { flexGrow: 0 },
  tabContent: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  tabChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full ?? 999,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
  },
  tabChipText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textSecondary },

  listContent: { padding: SPACING.lg, paddingBottom: 100, gap: SPACING.sm },

  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    borderWidth: 1,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  summaryCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryPct: { fontSize: 24, fontWeight: '900' },
  summaryLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', textTransform: 'uppercase' },
  summaryMeta: { flex: 1, gap: 4 },
  summaryBig: { fontSize: FONT_SIZES.xl, fontWeight: '800' },
  summaryCaption: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },

  sectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },

  statRow: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  statHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statType: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, flex: 1 },
  statScore: { fontSize: FONT_SIZES.md, fontWeight: '800' },
  progressTrack: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  statMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  statPct: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: '600' },
  statAttempted: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },

  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
  },
});
