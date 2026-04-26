import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  TouchableOpacity, RefreshControl, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Polyline, Line, Circle, Text as SvgText } from 'react-native-svg';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { ieltsProfileApi, ieltsExamsApi, ieltsAdvancedApi } from '@/services/ielts.api';
import { SectionHeader, ScoreBadge, Badge, EmptyState, Chip } from '@/components/ui';

const { width: SCREEN_W } = Dimensions.get('window');
const CHART_W = SCREEN_W - SPACING.lg * 2 - SPACING.lg * 2;
const CHART_H = 160;

function getIeltsBandFromScore(score: number) {
  if (score >= 39) return 9.0; if (score >= 37) return 8.5; if (score >= 35) return 8.0;
  if (score >= 32) return 7.5; if (score >= 30) return 7.0; if (score >= 26) return 6.5;
  if (score >= 23) return 6.0; if (score >= 18) return 5.5; if (score >= 16) return 5.0;
  if (score >= 13) return 4.5; if (score >= 10) return 4.0; return 1.0;
}

function BandChart({ points, color }: { points: { band: number; label: string }[]; color: string }) {
  if (points.length < 2) {
    return (
      <View style={chartStyles.empty}>
        <Text style={chartStyles.emptyText}>Not enough data yet</Text>
      </View>
    );
  }

  const pad = 28;
  const w = CHART_W - pad * 2;
  const h = CHART_H - pad * 2;
  const maxBand = 9;
  const minBand = 1;

  const toX = (i: number) => pad + (i / (points.length - 1)) * w;
  const toY = (band: number) => pad + h - ((band - minBand) / (maxBand - minBand)) * h;

  const polyPoints = points.map((p, i) => `${toX(i)},${toY(p.band)}`).join(' ');

  return (
    <Svg width={CHART_W} height={CHART_H}>
      {/* Grid lines */}
      {[3, 5, 7, 9].map(b => (
        <Line
          key={b}
          x1={pad} y1={toY(b)} x2={CHART_W - pad} y2={toY(b)}
          stroke={COLORS.border} strokeWidth={1} strokeDasharray="4,4"
        />
      ))}
      {/* Line */}
      <Polyline points={polyPoints} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {/* Dots */}
      {points.map((p, i) => (
        <React.Fragment key={i}>
          <Circle cx={toX(i)} cy={toY(p.band)} r={5} fill={color} />
          <SvgText x={toX(i)} y={toY(p.band) - 10} textAnchor="middle" fontSize={9} fill={color} fontWeight="700">
            {p.band.toFixed(1)}
          </SvgText>
        </React.Fragment>
      ))}
    </Svg>
  );
}

const chartStyles = StyleSheet.create({
  empty: { height: CHART_H, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm },
});

const SKILLS = [
  { key: 'LISTENING', label: 'Listening', color: '#E11D48' },
  { key: 'READING',   label: 'Reading',   color: '#2563EB' },
  { key: 'WRITING',   label: 'Writing',   color: '#D97706' },
  { key: 'SPEAKING',  label: 'Speaking',  color: '#7C3AED' },
];

export default function StatisticsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [streak, setStreak] = useState<any>(null);
  const [mockHistory, setMockHistory] = useState<any[]>([]);
  const [advListening, setAdvListening] = useState<any[]>([]);
  const [advReading, setAdvReading] = useState<any[]>([]);
  const [activeSkill, setActiveSkill] = useState('LISTENING');

  const fetchData = async () => {
    try {
      const [profileRes, streakRes, historyRes, advListRes, advReadRes] = await Promise.allSettled([
        ieltsProfileApi.get(),
        ieltsProfileApi.getStreak(),
        ieltsExamsApi.getHistory(),
        ieltsAdvancedApi.getListeningHistory(),
        ieltsAdvancedApi.getReadingHistory(),
      ]);
      if (profileRes.status === 'fulfilled') setProfile(profileRes.value);
      if (streakRes.status === 'fulfilled') setStreak(streakRes.value);
      if (historyRes.status === 'fulfilled') setMockHistory(historyRes.value as any[]);
      if (advListRes.status === 'fulfilled') setAdvListening(advListRes.value as any[]);
      if (advReadRes.status === 'fulfilled') setAdvReading(advReadRes.value as any[]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const skillHistory = mockHistory
    .filter(h => h.skill === activeSkill)
    .sort((a, b) => new Date(a.dateTaken).getTime() - new Date(b.dateTaken).getTime())
    .slice(-10)
    .map(h => ({ band: getIeltsBandFromScore(h.rawScore ?? 0), label: h.examTitle?.split(' - ')[1] ?? '' }));

  const latestMock = mockHistory.filter(h => h.skill === activeSkill)[0];
  const latestBand = latestMock ? getIeltsBandFromScore(latestMock.rawScore) : null;

  const totalPractice = advListening.length + advReading.length;

  const skillColor = SKILLS.find(s => s.key === activeSkill)?.color ?? COLORS.primary;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Statistics</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Profile summary */}
        {profile && (
          <View style={styles.profileCard}>
            <View style={styles.profileRow}>
              <View>
                <Text style={styles.profileName}>
                  {profile.user?.firstName || profile.user?.email || 'Student'}
                </Text>
                <Text style={styles.profileSub}>
                  Target Band {profile.targetBand?.toFixed(1) ?? '—'} · {profile.dailyCommitmentMins ?? 30}m/day
                </Text>
              </View>
              <View style={styles.streakPill}>
                <Text style={styles.streakFire}>🔥</Text>
                <Text style={styles.streakVal}>{streak?.currentStreak ?? 0}</Text>
              </View>
            </View>

            <View style={styles.overviewRow}>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewValue}>{mockHistory.length}</Text>
                <Text style={styles.overviewLabel}>Mock Tests</Text>
              </View>
              <View style={[styles.overviewItem, styles.overviewMid]}>
                <Text style={styles.overviewValue}>{totalPractice}</Text>
                <Text style={styles.overviewLabel}>Practice Sessions</Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewValue}>{streak?.longestStreak ?? 0}</Text>
                <Text style={styles.overviewLabel}>Best Streak</Text>
              </View>
            </View>
          </View>
        )}

        {/* Skill selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm }}
        >
          {SKILLS.map(s => (
            <Chip key={s.key} label={s.label} active={activeSkill === s.key} onPress={() => setActiveSkill(s.key)} />
          ))}
        </ScrollView>

        {/* Band trend chart */}
        <View style={styles.section}>
          <SectionHeader
            title={`${activeSkill.charAt(0) + activeSkill.slice(1).toLowerCase()} Trend`}
            subtitle="Last 10 mock tests"
            right={latestBand ? <ScoreBadge band={latestBand} /> : undefined}
          />
          <View style={styles.chartCard}>
            <BandChart points={skillHistory} color={skillColor} />
          </View>
        </View>

        {/* Advanced practice summary */}
        <View style={styles.section}>
          <SectionHeader title="Advanced Practice" subtitle="Listening & Reading parts" />
          <View style={styles.advRow}>
            <View style={[styles.advCard, { borderColor: '#E11D48' }]}>
              <Text style={styles.advIcon}>🎧</Text>
              <Text style={styles.advCount}>{advListening.length}</Text>
              <Text style={styles.advLabel}>Listening</Text>
            </View>
            <View style={[styles.advCard, { borderColor: '#2563EB' }]}>
              <Text style={styles.advIcon}>📖</Text>
              <Text style={styles.advCount}>{advReading.length}</Text>
              <Text style={styles.advLabel}>Reading</Text>
            </View>
          </View>
        </View>

        {/* Recent history */}
        <View style={styles.section}>
          <SectionHeader title="Recent Tests" />
          {mockHistory.length === 0 ? (
            <EmptyState icon="📝" title="No tests yet" subtitle="Complete a mock test to see results here" />
          ) : (
            mockHistory.slice(0, 8).map((h, i) => (
              <View key={i} style={styles.historyRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyTitle} numberOfLines={1}>
                    {h.examTitle?.split(' - ')[1] ?? h.examTitle}
                  </Text>
                  <Text style={styles.historyDate}>
                    {new Date(h.dateTaken).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                </View>
                <View style={styles.historyRight}>
                  <Badge label={h.skill} color={SKILLS.find(s => s.key === h.skill)?.color ?? COLORS.primary} />
                  <ScoreBadge band={getIeltsBandFromScore(h.rawScore ?? 0)} />
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: { color: '#fff', fontSize: FONT_SIZES.lg, fontWeight: '700' },
  profileCard: {
    margin: SPACING.lg,
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
  profileRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.lg },
  profileName: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text },
  profileSub: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  streakPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF3C7', paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full },
  streakFire: { fontSize: 18 },
  streakVal: { fontSize: FONT_SIZES.md, fontWeight: '800', color: '#D97706' },
  overviewRow: { flexDirection: 'row' },
  overviewItem: { flex: 1, alignItems: 'center' },
  overviewMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: COLORS.border },
  overviewValue: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text },
  overviewLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  section: { paddingHorizontal: SPACING.lg, marginTop: SPACING.lg },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  advRow: { flexDirection: 'row', gap: SPACING.md },
  advCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    borderWidth: 2,
  },
  advIcon: { fontSize: 28, marginBottom: SPACING.sm },
  advCount: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text },
  advLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 4 },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  historyTitle: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  historyDate: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  historyRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
});
