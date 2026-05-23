import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text as RNText,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Polyline, Line, Circle, Text as SvgText, Rect, G } from 'react-native-svg';
import { COLORS, FONTS, SPACING, RADIUS, FONT_SIZES, ROUTES, navigation } from '@/constants';
import {
  ieltsProfileApi,
  ieltsExamsApi,
  ieltsAdvancedApi,
  ieltsStatisticsApi,
} from '@/services';
import { SectionHeader, ScoreBadge, Badge, EmptyState, Chip, FeatureLock } from '@/components/ui/index';
import { SharedDrawer } from '@/components/ui/SharedDrawer';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import {
  OverviewStatsTab,
  FoundationStatsTab,
  BasicStatsTab,
} from '@/components/ielts/stats';
import { ProgressBar, Text } from '@/components/atoms';
import {
  IeltsOverviewStats,
  IeltsFoundationStats,
  IeltsBasicStats,
  IeltsIntensiveStats,
} from '@/types';

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
        <RNText style={chartStyles.emptyText}>Not enough data yet</RNText>
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
  { key: 'LISTENING', label: 'Listening', color: COLORS.skill.listening },
  { key: 'READING', label: 'Reading', color: COLORS.skill.reading },
  { key: 'WRITING', label: 'Writing', color: COLORS.skill.writing },
  { key: 'SPEAKING', label: 'Speaking', color: COLORS.skill.speaking },
];

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'foundation', label: 'Foundation' },
  { key: 'basic', label: 'Basic' },
  { key: 'advanced', label: 'Advanced' },
] as const;

export default function StatisticsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();

  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'foundation' | 'basic' | 'advanced'>('overview');

  // Loading States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [foundationLoading, setFoundationLoading] = useState(false);
  const [basicLoading, setBasicLoading] = useState(false);
  const [advancedLoading, setAdvancedLoading] = useState(false);

  // Tab Data States
  const [overviewStats, setOverviewStats] = useState<IeltsOverviewStats | null>(null);
  const [foundationStats, setFoundationStats] = useState<IeltsFoundationStats | null>(null);
  const [basicStats, setBasicStats] = useState<IeltsBasicStats | null>(null);
  const [intensiveStats, setIntensiveStats] = useState<IeltsIntensiveStats | null>(null);

  // Legacy/Advanced Stats States
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

  // Drawer Animation
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-280)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.spring(drawerAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
      Animated.timing(backdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  };
  const closeDrawer = () => {
    Animated.parallel([
      Animated.spring(drawerAnim, {
        toValue: -280,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }),
      Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setDrawerOpen(false));
  };
  const handleNavPress = (route: string) => {
    closeDrawer();
    if (route !== ROUTES.ieltsStatistics) {
      navigation.push(route);
    }
  };

  // --- API FETHES (LAZY-LOADED) ---

  const fetchOverview = async (showLoading = true) => {
    if (showLoading) setOverviewLoading(true);
    try {
      const [statsRes, profileRes, streakRes] = await Promise.allSettled([
        ieltsStatisticsApi.getOverview(),
        ieltsProfileApi.get(),
        ieltsProfileApi.getStreak(),
      ]);
      if (statsRes.status === 'fulfilled') setOverviewStats(statsRes.value);
      if (profileRes.status === 'fulfilled') setProfile(profileRes.value);
      if (streakRes.status === 'fulfilled') setStreak(streakRes.value);
    } catch (e) {
      console.error('Failed to fetch Overview Stats:', e);
    } finally {
      setOverviewLoading(false);
      setLoading(false);
    }
  };

  const fetchFoundation = async (showLoading = true) => {
    if (showLoading) setFoundationLoading(true);
    try {
      const res = await ieltsStatisticsApi.getFoundation();
      setFoundationStats(res);
    } catch (e) {
      console.error('Failed to fetch Foundation Stats:', e);
    } finally {
      setFoundationLoading(false);
    }
  };

  const fetchBasic = async (showLoading = true) => {
    if (showLoading) setBasicLoading(true);
    try {
      const res = await ieltsStatisticsApi.getBasic();
      setBasicStats(res);
    } catch (e) {
      console.error('Failed to fetch Basic Stats:', e);
    } finally {
      setBasicLoading(false);
    }
  };

  const fetchAdvanced = async (showLoading = true) => {
    if (showLoading) setAdvancedLoading(true);
    try {
      const [advRes, intRes, historyRes, listeningRes, readingRes] = await Promise.allSettled([
        ieltsStatisticsApi.getAdvanced(),
        ieltsStatisticsApi.getIntensive(),
        ieltsExamsApi.getHistory(),
        ieltsAdvancedApi.getListeningHistory(),
        ieltsAdvancedApi.getReadingHistory(),
      ]);

      if (advRes.status === 'fulfilled' && advRes.value) {
        // Sync listening & reading accuracy into a flat map for compatibility
        const mergedAccuracy: Record<string, { correct: number; total: number; attempted: number }> = {};
        if (advRes.value.listening?.accuracy) {
          Object.assign(mergedAccuracy, advRes.value.listening.accuracy);
        }
        if (advRes.value.reading?.accuracy) {
          Object.assign(mergedAccuracy, advRes.value.reading.accuracy);
        }
        setAdvStats(mergedAccuracy);
      }
      if (intRes.status === 'fulfilled') setIntensiveStats(intRes.value);
      if (historyRes.status === 'fulfilled') setMockHistory(historyRes.value as any[]);
      if (listeningRes.status === 'fulfilled') setAdvListening(listeningRes.value as any[]);
      if (readingRes.status === 'fulfilled') setAdvReading(readingRes.value as any[]);
    } catch (e) {
      console.error('Failed to fetch Advanced Stats:', e);
    } finally {
      setAdvancedLoading(false);
    }
  };

  // Handle lazy loading when tab switches
  useEffect(() => {
    if (activeTab === 'overview' && !overviewStats) {
      fetchOverview();
    } else if (activeTab === 'foundation' && !foundationStats) {
      fetchFoundation();
    } else if (activeTab === 'basic' && !basicStats) {
      fetchBasic();
    } else if (activeTab === 'advanced' && !intensiveStats) {
      fetchAdvanced();
    }
  }, [activeTab]);

  // Initial load
  useEffect(() => {
    fetchOverview();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'overview') await fetchOverview(false);
    else if (activeTab === 'foundation') await fetchFoundation(false);
    else if (activeTab === 'basic') await fetchBasic(false);
    else if (activeTab === 'advanced') await fetchAdvanced(false);
    setRefreshing(false);
  };

  // Helper values for rendering Advanced Tab
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

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewStatsTab stats={overviewStats} loading={overviewLoading} />;
      case 'foundation':
        return <FoundationStatsTab stats={foundationStats} loading={foundationLoading} />;
      case 'basic':
        return <BasicStatsTab stats={basicStats} loading={basicLoading} />;
      case 'advanced':
        return (
          <FeatureLock requiredTier="PREMIUM" featureName="IELTS Advanced Statistics">
            {advancedLoading ? (
              <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            ) : (
              <View style={{ paddingBottom: 40 }}>
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
                    <View style={[styles.advCard, { borderColor: COLORS.skill.listening, backgroundColor: colors.card }]}>
                      <RNText style={styles.advIcon}>🎧</RNText>
                      <RNText style={[styles.advCount, { color: colors.text }]}>{advListening.length}</RNText>
                      <RNText style={styles.advLabel}>Listening</RNText>
                    </View>
                    <View style={[styles.advCard, { borderColor: COLORS.skill.reading, backgroundColor: colors.card }]}>
                      <RNText style={styles.advIcon}>📖</RNText>
                      <RNText style={[styles.advCount, { color: colors.text }]}>{advReading.length}</RNText>
                      <RNText style={styles.advLabel}>Reading</RNText>
                    </View>
                  </View>
                </View>

                {/* Intensive Section */}
                {intensiveStats && <IntensiveStatsSection stats={intensiveStats} />}

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
                      <View key={i} style={[styles.historyRow, { borderColor: colors.border }]}>
                        <View style={{ flex: 1 }}>
                          <RNText style={[styles.historyTitle, { color: colors.text }]} numberOfLines={1}>
                            {h.examTitle?.split(' - ')[1] ?? h.examTitle}
                          </RNText>
                          <RNText style={styles.historyDate}>
                            {new Date(h.dateTaken).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </RNText>
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
              </View>
            )}
          </FeatureLock>
        );
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── Synchronized Theme-Aware Header ── */}
      <View
        style={{
          backgroundColor: colors.background,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: SPACING.md,
          paddingBottom: SPACING.sm,
          paddingTop: insets.top + 8,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity
          style={{
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={openDrawer}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Open menu drawer"
          accessibilityHint="Double tap to open the navigation menu"
        >
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>

        <RNText
          style={{
            flex: 1,
            color: colors.text,
            fontSize: FONT_SIZES.lg,
            fontFamily: FONTS.bold,
            textAlign: 'center',
          }}
        >
          My Statistics
        </RNText>

        <View style={{ width: 44 }} />
      </View>

      {/* ── Tabs Pill Bar ── */}
      <View style={[styles.tabBarContainer, { borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarScroll}>
          {TABS.map((t) => {
            const active = activeTab === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                style={[
                  styles.tabPill,
                  { borderColor: colors.border },
                  active && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => setActiveTab(t.key)}
                activeOpacity={0.8}
              >
                <RNText style={[styles.tabPillText, { color: active ? '#212529' : colors.textSecondary }]}>
                  {t.label}
                </RNText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {renderActiveTabContent()}
      </ScrollView>

      <SharedDrawer
        drawerOpen={drawerOpen}
        drawerAnim={drawerAnim}
        backdropAnim={backdropAnim}
        insetsTop={insets.top}
        onClose={closeDrawer}
        onOpen={openDrawer}
        onNavPress={handleNavPress}
      />
    </View>
  );
}

// ─── Submission Volume Bar Chart ──────────────────────────────────────────────
const VOL_SKILLS = [
  { key: 'ALL', label: 'All', color: COLORS.primary },
  { key: 'LISTENING', label: 'L', color: COLORS.skill.listening },
  { key: 'READING', label: 'R', color: COLORS.skill.reading },
  { key: 'WRITING', label: 'W', color: COLORS.skill.writing },
  { key: 'SPEAKING', label: 'S', color: COLORS.skill.speaking },
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
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
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
              style={[
                vs.pill,
                { borderColor: colors.border, backgroundColor: colors.card },
                active && { backgroundColor: s.color, borderColor: s.color },
              ]}
              onPress={() => setVolumeSkill(s.key)}
              activeOpacity={0.8}
            >
              <RNText style={[vs.pillText, { color: colors.textSecondary }, active && { color: '#fff' }]}>{s.label}</RNText>
            </TouchableOpacity>
          );
        })}
      </View>

      <View
        style={[
          styles.chartCard,
          { paddingHorizontal: SPACING.sm, paddingVertical: SPACING.md, backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {total === 0 ? (
          <View style={{ height: BAR_H, alignItems: 'center', justifyContent: 'center' }}>
            <RNText style={{ color: COLORS.textMuted, fontSize: FONT_SIZES.sm }}>
              No submissions yet
            </RNText>
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
  },
  pillText: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.bold },
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
        <RNText style={ab.typeName} numberOfLines={1}>
          {label}
        </RNText>
        <RNText style={[ab.pct, { color }]}>{pct}%</RNText>
      </View>
      <View style={ab.track}>
        <View style={[ab.fill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
      <RNText style={ab.fraction}>
        {correct}/{total} correct
      </RNText>
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
  stats: Record<string, { correct: number; total: number; attempted: number }> | null | undefined;
}) {
  const { colors } = useTheme();
  const entries = Object.entries(stats || {}).sort((a, b) => {
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
        <View style={[as.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <RNText style={as.emptyIcon}>📊</RNText>
          <RNText style={as.emptyText}>No practice data yet</RNText>
          <RNText style={as.emptySub}>
            Start an advanced practice session to track accuracy per question type.
          </RNText>
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
      <View style={[as.overallCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={as.overallLeft}>
          <RNText style={[as.overallLabel, { color: colors.text }]}>Overall Accuracy</RNText>
          <RNText style={as.overallSub}>
            {totalCorrect}/{totalAttempted} correct across all types
          </RNText>
        </View>
        <View
          style={[
            as.overallBadge,
            { backgroundColor: overallColor + '15', borderColor: overallColor + '40' },
          ]}
        >
          <RNText style={[as.overallPct, { color: overallColor }]}>{overallPct}%</RNText>
        </View>
      </View>

      {/* Strength / Weakness zone pills */}
      {(weakTypes.length > 0 || strongTypes.length > 0) && (
        <View style={as.zonesRow}>
          {strongTypes.length > 0 && (
            <View style={[as.zoneChip, as.zoneGreen]}>
              <RNText style={as.zoneIcon}>💪</RNText>
              <View>
                <RNText style={[as.zoneTitle, { color: '#16a34a' }]}>Strong</RNText>
                <RNText style={as.zoneSub} numberOfLines={1}>
                  {strongTypes
                    .slice(0, 2)
                    .map(([t]) => QT_LABEL[t] ?? t)
                    .join(', ')}
                  {strongTypes.length > 2 ? ` +${strongTypes.length - 2}` : ''}
                </RNText>
              </View>
            </View>
          )}
          {weakTypes.length > 0 && (
            <View style={[as.zoneChip, as.zoneRed]}>
              <RNText style={as.zoneIcon}>⚠️</RNText>
              <View>
                <RNText style={[as.zoneTitle, { color: '#DC2626' }]}>Needs Work</RNText>
                <RNText style={as.zoneSub} numberOfLines={1}>
                  {weakTypes
                    .slice(0, 2)
                    .map(([t]) => QT_LABEL[t] ?? t)
                    .join(', ')}
                  {weakTypes.length > 2 ? ` +${weakTypes.length - 2}` : ''}
                </RNText>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Per-type accuracy bars */}
      <View style={[as.barsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
    borderRadius: RADIUS.xl,
    borderWidth: 1,
  },
  emptyIcon: { fontSize: 40, marginBottom: SPACING.sm },
  emptyText: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold },
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
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  overallLeft: { flex: 1 },
  overallLabel: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold },
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
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
});

// ─── Intensive Stats Section Component ──────────────────────────────────────────
function IntensiveStatsSection({ stats }: { stats: IeltsIntensiveStats | null }) {
  const { colors } = useTheme();
  if (!stats) return null;

  const skillColorMap = {
    listening: COLORS.skill.listening,
    reading: COLORS.skill.reading,
    writing: COLORS.skill.writing,
    speaking: COLORS.skill.speaking,
  };

  return (
    <View style={intensiveStyles.container}>
      <SectionHeader title="Intensive Exam Progress" subtitle="Mock tests analytics" />
      <View style={[intensiveStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={intensiveStyles.summaryRow}>
          <View style={intensiveStyles.summaryItem}>
            <RNText style={[intensiveStyles.summaryValue, { color: colors.text }]}>
              {stats.completedExams} / {stats.totalExams}
            </RNText>
            <RNText style={intensiveStyles.summaryLabel}>Exams Taken</RNText>
          </View>
          <View
            style={[
              intensiveStyles.summaryItem,
              { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border },
            ]}
          >
            <RNText style={[intensiveStyles.summaryValue, { color: COLORS.primary }]}>
              {stats.averageBand?.toFixed(1) ?? '—'}
            </RNText>
            <RNText style={intensiveStyles.summaryLabel}>Avg Band</RNText>
          </View>
          <View style={intensiveStyles.summaryItem}>
            <RNText style={[intensiveStyles.summaryValue, { color: colors.success }]}>
              {stats.bestBand?.toFixed(1) ?? '—'}
            </RNText>
            <RNText style={intensiveStyles.summaryLabel}>Best Band</RNText>
          </View>
        </View>

        <View style={intensiveStyles.divider} />

        <RNText style={[intensiveStyles.sectionTitle, { color: colors.text }]}>Intensive Skill Breakdown</RNText>
        <View style={intensiveStyles.skillsList}>
          {(Object.keys(stats.skillBreakdown || {}) as Array<keyof typeof stats.skillBreakdown>).map((skill) => {
            const val = stats.skillBreakdown?.[skill];
            const percent = val ? (val / 9.0) * 100 : 0;
            const skillColor = skillColorMap[skill] || colors.primary;

            return (
              <View key={skill} style={intensiveStyles.skillRow}>
                <View style={intensiveStyles.skillHeader}>
                  <RNText style={[intensiveStyles.skillLabel, { color: colors.textSecondary }]}>
                    {skill.toUpperCase()}
                  </RNText>
                  <RNText style={[intensiveStyles.skillValue, { color: skillColor }]}>
                    {val ? `Band ${val.toFixed(1)}` : '—'}
                  </RNText>
                </View>
                <ProgressBar value={percent} max={100} height={6} color={skillColor} />
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const intensiveStyles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  card: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
  },
  summaryLabel: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.md,
  },
  skillsList: {
    gap: SPACING.md,
  },
  skillRow: {
    marginBottom: 2,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  skillLabel: {
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
  skillValue: {
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
});

function createStyles(colors: any) {
  return StyleSheet.create({
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    tabBarContainer: {
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.sm,
      borderBottomWidth: 1,
    },
    tabBarScroll: {
      gap: SPACING.sm,
    },
    tabPill: {
      paddingHorizontal: SPACING.lg,
      paddingVertical: 6,
      borderRadius: RADIUS.full,
      borderWidth: 1.5,
      marginHorizontal: 2,
    },
    tabPillText: {
      fontSize: FONT_SIZES.sm,
      fontFamily: FONTS.bold,
    },
    section: { paddingHorizontal: SPACING.lg, marginTop: SPACING.lg },
    chartCard: {
      backgroundColor: colors.card,
      borderRadius: RADIUS.xl,
      padding: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
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
      borderRadius: RADIUS.xl,
      borderWidth: 2,
    },
    advIcon: { fontSize: 28, marginBottom: SPACING.sm },
    advCount: { fontSize: FONT_SIZES.xxl, fontFamily: FONTS.bold },
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
    },
    historyTitle: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
    historyDate: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
    historyRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  });
}
