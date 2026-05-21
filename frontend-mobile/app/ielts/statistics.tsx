import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Polyline, Line, Circle, Text as SvgText, Rect, G } from 'react-native-svg';
import { COLORS, FONTS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { ieltsProfileApi, ieltsExamsApi, ieltsAdvancedApi } from '@/services/ielts.api';
import { SectionHeader, ScoreBadge, Badge, EmptyState, Chip } from '@/components/ui';

const { width: SCREEN_W } = Dimensions.get('window');
const CHART_W = SCREEN_W - SPACING.lg * 2 - SPACING.lg * 2;
const CHART_H = 160;

function getIeltsBandFromScore(score: number) {
  if (score >= 39) return 9.0;
  if (score >= 37) return 8.5;
  if (score >= 35) return 8.0;
  if (score >= 32) return 7.5;
  if (score >= 30) return 7.0;
  if (score >= 26) return 6.5;
  if (score >= 23) return 6.0;
  if (score >= 18) return 5.5;
  if (score >= 16) return 5.0;
  if (score >= 13) return 4.5;
  if (score >= 10) return 4.0;
  return 1.0;
}

/** Writing/Speaking use direct AI score (0–9); L/R use raw→band table */
function getBandForItem(h: any): number {
  if (h.skill === 'WRITING' || h.skill === 'SPEAKING') {
    return h.writingScore ?? h.rawScore ?? 0;
  }
  return getIeltsBandFromScore(h.rawScore ?? 0);
}

function BandChart({
  points,
  color,
}: {
  points: { band: number; label: string }[];
  color: string;
}) {
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
      {[3, 5, 7, 9].map((b) => (
        <Line
          key={b}
          x1={pad}
          y1={toY(b)}
          x2={CHART_W - pad}
          y2={toY(b)}
          stroke={COLORS.border}
          strokeWidth={1}
          strokeDasharray="4,4"
        />
      ))}
      {/* Line */}
      <Polyline
        points={polyPoints}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Dots */}
      {points.map((p, i) => (
        <React.Fragment key={i}>
          <Circle cx={toX(i)} cy={toY(p.band)} r={5} fill={color} />
          <SvgText
            x={toX(i)}
            y={toY(p.band) - 10}
            textAnchor="middle"
            fontSize={9}
            fill={color}
            fontFamily={FONTS.bold}
          >
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
  { key: 'READING', label: 'Reading', color: '#2563EB' },
  { key: 'WRITING', label: 'Writing', color: '#D97706' },
  { key: 'SPEAKING', label: 'Speaking', color: '#7C3AED' },
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
  const [advStats, setAdvStats] = useState<
    Record<string, { correct: number; total: number; attempted: number }>
  >({});
  const [activeSkill, setActiveSkill] = useState('LISTENING');
  const [volumeSkill, setVolumeSkill] = useState('ALL');

  const fetchData = async () => {
    try {
      const [profileRes, streakRes, historyRes, advListRes, advReadRes, statsRes] =
        await Promise.allSettled([
          ieltsProfileApi.get(),
          ieltsProfileApi.getStreak(),
          ieltsExamsApi.getHistory(),
          ieltsAdvancedApi.getListeningHistory(),
          ieltsAdvancedApi.getReadingHistory(),
          ieltsAdvancedApi.getStatistics(),
        ]);
      if (profileRes.status === 'fulfilled') setProfile(profileRes.value);
      if (streakRes.status === 'fulfilled') setStreak(streakRes.value);
      if (historyRes.status === 'fulfilled') setMockHistory(historyRes.value as any[]);
      if (advListRes.status === 'fulfilled') setAdvListening(advListRes.value as any[]);
      if (advReadRes.status === 'fulfilled') setAdvReading(advReadRes.value as any[]);
      if (statsRes.status === 'fulfilled') setAdvStats(statsRes.value ?? {});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const skillHistory = mockHistory
    .filter((h) => h.skill === activeSkill)
    .sort((a, b) => new Date(a.dateTaken).getTime() - new Date(b.dateTaken).getTime())
    .slice(-10)
    .map((h) => ({ band: getBandForItem(h), label: h.examTitle?.split(' - ')[1] ?? '' }));

  const latestMock = mockHistory
    .filter((h) => h.skill === activeSkill)
    .sort((a, b) => new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime())[0];
  const latestBand = latestMock ? getBandForItem(latestMock) : null;

  const totalPractice = advListening.length + advReading.length;

  const skillColor = SKILLS.find((s) => s.key === activeSkill)?.color ?? COLORS.primary;

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchData();
            }}
          />
        }
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
                  Target Band {profile.targetBand?.toFixed(1) ?? '—'} ·{' '}
                  {profile.dailyCommitmentMins ?? 30}m/day
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
          {SKILLS.map((s) => (
            <Chip
              key={s.key}
              label={s.label}
              active={activeSkill === s.key}
              onPress={() => setActiveSkill(s.key)}
            />
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

        {/* Submission Volume */}
        <SubmissionVolumeSection
          history={mockHistory}
          volumeSkill={volumeSkill}
          setVolumeSkill={setVolumeSkill}
        />

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

        {/* Question-type accuracy bars */}
        <AdvancedStatsSection stats={advStats} />

        {/* Recent history */}
        <View style={styles.section}>
          <SectionHeader title="Recent Tests" />
          {mockHistory.length === 0 ? (
            <EmptyState
              icon="📝"
              title="No tests yet"
              subtitle="Complete a mock test to see results here"
            />
          ) : (
            mockHistory.slice(0, 8).map((h, i) => (
              <View key={i} style={styles.historyRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyTitle} numberOfLines={1}>
                    {h.examTitle?.split(' - ')[1] ?? h.examTitle}
                  </Text>
                  <Text style={styles.historyDate}>
                    {new Date(h.dateTaken).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={styles.historyRight}>
                  <Badge
                    label={h.skill}
                    color={SKILLS.find((s) => s.key === h.skill)?.color ?? COLORS.primary}
                  />
                  <ScoreBadge band={getBandForItem(h)} />
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Submission Volume Bar Chart ──────────────────────────────────────────────
const VOL_SKILLS = [
  { key: 'ALL', label: 'All', color: COLORS.primary },
  { key: 'LISTENING', label: 'L', color: '#E11D48' },
  { key: 'READING', label: 'R', color: '#2563EB' },
  { key: 'WRITING', label: 'W', color: '#D97706' },
  { key: 'SPEAKING', label: 'S', color: '#7C3AED' },
];

function getMonthlyVolume(history: any[], skill: string) {
  const now = new Date();
  const months: { label: string; key: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleString('en-US', { month: 'short' }),
      count: 0,
    });
  }
  const filtered = skill === 'ALL' ? history : history.filter((h) => h.skill === skill);
  filtered.forEach((h) => {
    const d = new Date(h.dateTaken);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const m = months.find((x) => x.key === key);
    if (m) m.count++;
  });
  return months;
}

function SubmissionVolumeSection({
  history,
  volumeSkill,
  setVolumeSkill,
}: {
  history: any[];
  volumeSkill: string;
  setVolumeSkill: (s: string) => void;
}) {
  const months = getMonthlyVolume(history, volumeSkill);
  const maxCount = Math.max(...months.map((m) => m.count), 1);
  const total = months.reduce((s, m) => s + m.count, 0);
  const barColor = VOL_SKILLS.find((s) => s.key === volumeSkill)?.color ?? COLORS.primary;

  const BAR_W = CHART_W;
  const BAR_H = 120;
  const PAD_L = 28;
  const PAD_B = 24;
  const PAD_T = 12;
  const chartInnerW = BAR_W - PAD_L - 8;
  const chartInnerH = BAR_H - PAD_T - PAD_B;
  const colW = chartInnerW / months.length;
  const barWidth = colW * 0.55;

  return (
    <View style={vs.section}>
      <SectionHeader title="Submission Volume" subtitle={`${total} tests in the last 6 months`} />

      {/* Skill filter pills */}
      <View style={vs.pillRow}>
        {VOL_SKILLS.map((s) => {
          const active = volumeSkill === s.key;
          return (
            <TouchableOpacity
              key={s.key}
              style={[vs.pill, active && { backgroundColor: s.color, borderColor: s.color }]}
              onPress={() => setVolumeSkill(s.key)}
              activeOpacity={0.8}
            >
              <Text style={[vs.pillText, active && { color: '#fff' }]}>{s.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View
        style={[styles.chartCard, { paddingHorizontal: SPACING.sm, paddingVertical: SPACING.md }]}
      >
        {total === 0 ? (
          <View style={{ height: BAR_H, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZES.sm }}>
              No submissions yet
            </Text>
          </View>
        ) : (
          <Svg width={BAR_W} height={BAR_H}>
            {/* Y-axis grid lines */}
            {[0, Math.ceil(maxCount / 2), maxCount].map((v, i) => {
              const y = PAD_T + chartInnerH - (v / maxCount) * chartInnerH;
              return (
                <G key={i}>
                  <Line
                    x1={PAD_L}
                    y1={y}
                    x2={BAR_W - 8}
                    y2={y}
                    stroke={COLORS.border}
                    strokeWidth={1}
                    strokeDasharray="3,3"
                  />
                  <SvgText
                    x={PAD_L - 4}
                    y={y + 4}
                    fontSize={9}
                    fill={COLORS.textMuted}
                    textAnchor="end"
                    fontFamily={FONTS.medium}
                  >
                    {v}
                  </SvgText>
                </G>
              );
            })}

            {/* Bars */}
            {months.map((m, i) => {
              const barH = maxCount > 0 ? (m.count / maxCount) * chartInnerH : 0;
              const x = PAD_L + i * colW + (colW - barWidth) / 2;
              const y = PAD_T + chartInnerH - barH;
              return (
                <G key={m.key}>
                  {/* Background track */}
                  <Rect
                    x={x}
                    y={PAD_T}
                    width={barWidth}
                    height={chartInnerH}
                    rx={3}
                    fill={barColor + '15'}
                  />
                  {/* Filled bar */}
                  {m.count > 0 && (
                    <Rect x={x} y={y} width={barWidth} height={barH} rx={3} fill={barColor} />
                  )}
                  {/* Count label above bar */}
                  {m.count > 0 && (
                    <SvgText
                      x={x + barWidth / 2}
                      y={y - 3}
                      fontSize={9}
                      textAnchor="middle"
                      fill={barColor}
                      fontFamily={FONTS.bold}
                    >
                      {m.count}
                    </SvgText>
                  )}
                  {/* Month label */}
                  <SvgText
                    x={x + barWidth / 2}
                    y={BAR_H - 4}
                    fontSize={9}
                    textAnchor="middle"
                    fill={COLORS.textMuted}
                    fontFamily={FONTS.medium}
                  >
                    {m.label}
                  </SvgText>
                </G>
              );
            })}
          </Svg>
        )}
      </View>
    </View>
  );
}

const vs = StyleSheet.create({
  section: { paddingHorizontal: SPACING.lg, marginTop: SPACING.lg },
  pillRow: { flexDirection: 'row', gap: SPACING.xs, marginBottom: SPACING.sm, flexWrap: 'wrap' },
  pill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
  },
  pillText: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.bold, color: COLORS.textSecondary },
});

// ─── Question-type label map ─────────────────────────────────────────────────
const QT_LABEL: Record<string, string> = {
  multiple_choice: 'Multiple Choice',
  fill_in_blank: 'Fill in Blank',
  short_answer: 'Short Answer',
  matching: 'Matching',
  matching_headings: 'Matching Headings',
  matching_features: 'Matching Features',
  matching_information: 'Matching Info',
  matching_sentence_endings: 'Sentence Endings',
  true_false_not_given: 'T/F/NG',
  yes_no_not_given: 'Y/N/NG',
  diagram_labelling: 'Diagram Label',
  diagram_completion: 'Diagram Completion',
  map_labelling: 'Map Label',
  plan_labelling: 'Plan Label',
  sentence_completion: 'Sentence Completion',
  summary_completion: 'Summary Completion',
  note_completion: 'Note Completion',
  table_completion: 'Table Completion',
  flowchart_completion: 'Flowchart',
  unknown: 'Other',
};

function AccuracyBar({ type, correct, total }: { type: string; correct: number; total: number }) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const color = pct >= 80 ? '#16a34a' : pct >= 60 ? '#2563EB' : pct >= 40 ? '#D97706' : '#DC2626';
  const label = QT_LABEL[type] ?? type.replace(/_/g, ' ');

  return (
    <View style={ab.row}>
      <View style={ab.labelRow}>
        <Text style={ab.typeName} numberOfLines={1}>
          {label}
        </Text>
        <Text style={[ab.pct, { color }]}>{pct}%</Text>
      </View>
      <View style={ab.track}>
        <View style={[ab.fill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={ab.fraction}>
        {correct}/{total} correct
      </Text>
    </View>
  );
}

const ab = StyleSheet.create({
  row: { marginBottom: SPACING.md },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  typeName: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
    textTransform: 'capitalize',
  },
  pct: { fontSize: FONT_SIZES.sm, fontWeight: '800' },
  track: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 3,
  },
  fill: { height: '100%', borderRadius: 4 },
  fraction: { fontSize: 11, color: COLORS.textMuted, fontFamily: FONTS.regular },
});

function AdvancedStatsSection({
  stats,
}: {
  stats: Record<string, { correct: number; total: number; attempted: number }>;
}) {
  const entries = Object.entries(stats).sort((a, b) => {
    const pctA = a[1].total > 0 ? a[1].correct / a[1].total : 0;
    const pctB = b[1].total > 0 ? b[1].correct / b[1].total : 0;
    return pctB - pctA; // highest accuracy first
  });

  if (entries.length === 0) {
    return (
      <View style={as.section}>
        <SectionHeader
          title="Question-Type Accuracy"
          subtitle="Complete practice sessions to see data"
        />
        <View style={as.empty}>
          <Text style={as.emptyIcon}>📊</Text>
          <Text style={as.emptyText}>No practice data yet</Text>
          <Text style={as.emptySub}>
            Start an advanced practice session to track accuracy per question type.
          </Text>
        </View>
      </View>
    );
  }

  const totalAttempted = entries.reduce((s, [, v]) => s + v.total, 0);
  const totalCorrect = entries.reduce((s, [, v]) => s + v.correct, 0);
  const overallPct = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  const overallColor =
    overallPct >= 80
      ? '#16a34a'
      : overallPct >= 60
        ? '#2563EB'
        : overallPct >= 40
          ? '#D97706'
          : '#DC2626';

  const weakTypes = entries.filter(([, v]) => v.total > 0 && v.correct / v.total < 0.5);
  const strongTypes = entries.filter(([, v]) => v.total > 0 && v.correct / v.total >= 0.8);

  return (
    <View style={as.section}>
      <SectionHeader
        title="Question-Type Accuracy"
        subtitle={`${entries.length} types · ${totalAttempted} questions total`}
      />

      {/* Overall accuracy summary pill */}
      <View style={as.overallCard}>
        <View style={as.overallLeft}>
          <Text style={as.overallLabel}>Overall Accuracy</Text>
          <Text style={as.overallSub}>
            {totalCorrect}/{totalAttempted} correct across all types
          </Text>
        </View>
        <View
          style={[
            as.overallBadge,
            { backgroundColor: overallColor + '15', borderColor: overallColor + '40' },
          ]}
        >
          <Text style={[as.overallPct, { color: overallColor }]}>{overallPct}%</Text>
        </View>
      </View>

      {/* Strength / Weakness zone pills */}
      {(weakTypes.length > 0 || strongTypes.length > 0) && (
        <View style={as.zonesRow}>
          {strongTypes.length > 0 && (
            <View style={[as.zoneChip, as.zoneGreen]}>
              <Text style={as.zoneIcon}>💪</Text>
              <View>
                <Text style={[as.zoneTitle, { color: '#16a34a' }]}>Strong</Text>
                <Text style={as.zoneSub} numberOfLines={1}>
                  {strongTypes
                    .slice(0, 2)
                    .map(([t]) => QT_LABEL[t] ?? t)
                    .join(', ')}
                  {strongTypes.length > 2 ? ` +${strongTypes.length - 2}` : ''}
                </Text>
              </View>
            </View>
          )}
          {weakTypes.length > 0 && (
            <View style={[as.zoneChip, as.zoneRed]}>
              <Text style={as.zoneIcon}>⚠️</Text>
              <View>
                <Text style={[as.zoneTitle, { color: '#DC2626' }]}>Needs Work</Text>
                <Text style={as.zoneSub} numberOfLines={1}>
                  {weakTypes
                    .slice(0, 2)
                    .map(([t]) => QT_LABEL[t] ?? t)
                    .join(', ')}
                  {weakTypes.length > 2 ? ` +${weakTypes.length - 2}` : ''}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Per-type accuracy bars */}
      <View style={as.barsCard}>
        {entries.map(([type, { correct, total }]) => (
          <AccuracyBar key={type} type={type} correct={correct} total={total} />
        ))}
      </View>
    </View>
  );
}

const as = StyleSheet.create({
  section: { paddingHorizontal: SPACING.lg, marginTop: SPACING.lg },
  empty: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyIcon: { fontSize: 40, marginBottom: SPACING.sm },
  emptyText: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold, color: COLORS.text },
  emptySub: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: SPACING.xl,
  },
  overallCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  overallLeft: { flex: 1 },
  overallLabel: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold, color: COLORS.text },
  overallSub: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  overallBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    marginLeft: SPACING.md,
  },
  overallPct: { fontSize: FONT_SIZES.xl, fontWeight: '900' },
  zonesRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  zoneChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  zoneGreen: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  zoneRed: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  zoneIcon: { fontSize: 20 },
  zoneTitle: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold },
  zoneSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 1, maxWidth: 120 },
  barsCard: {
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
});

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
  headerTitle: { color: '#fff', fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold },
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
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  profileName: { fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold, color: COLORS.text },
  profileSub: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  streakFire: { fontSize: 18 },
  streakVal: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold, color: '#D97706' },
  overviewRow: { flexDirection: 'row' },
  overviewItem: { flex: 1, alignItems: 'center' },
  overviewMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: COLORS.border },
  overviewValue: { fontSize: FONT_SIZES.xl, fontFamily: FONTS.bold, color: COLORS.text },
  overviewLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
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
  advCount: { fontSize: FONT_SIZES.xxl, fontFamily: FONTS.bold, color: COLORS.text },
  advLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
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
