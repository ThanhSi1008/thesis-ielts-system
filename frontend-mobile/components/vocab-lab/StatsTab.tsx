import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import Svg, { G, Text as SvgText } from 'react-native-svg';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '@/constants';
import { vocabLabApi } from '@/services/features.api';
import { ForecastChart } from './ForecastChart';
import { HourlyActivityChart } from './HourlyActivityChart';
import { MaturityDonut } from './MaturityDonut';

// react-native-svg Path is not exported by name in all versions — import directly
import { Path as SvgPath } from 'react-native-svg';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Segment {
  label: string;
  count: number;
  color: string;
  pct: number;
}

// ─── Donut chart (pure SVG, no extra libs) ────────────────────────────────────
const SIZE = 220;
const RADIUS_OUTER = 88;
const RADIUS_INNER = 56; // thickness = 32
const CX = SIZE / 2;
const CY = SIZE / 2;

function polarToXY(angleDeg: number, r: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function describeArc(startDeg: number, endDeg: number): string {
  const gap = 0; // no gap between segments for simplicity
  const s = polarToXY(startDeg + gap, RADIUS_OUTER);
  const e = polarToXY(endDeg - gap, RADIUS_OUTER);
  const si = polarToXY(endDeg - gap, RADIUS_INNER);
  const ei = polarToXY(startDeg + gap, RADIUS_INNER);
  const large = endDeg - startDeg > 180 ? 1 : 0;

  return [
    `M ${s.x} ${s.y}`,
    `A ${RADIUS_OUTER} ${RADIUS_OUTER} 0 ${large} 1 ${e.x} ${e.y}`,
    `L ${si.x} ${si.y}`,
    `A ${RADIUS_INNER} ${RADIUS_INNER} 0 ${large} 0 ${ei.x} ${ei.y}`,
    'Z',
  ].join(' ');
}

interface DonutChartProps {
  segments: Segment[];
  total: number;
}

function DonutChart({ segments, total }: DonutChartProps) {
  // Animated rotation for entrance effect
  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(spinAnim, { toValue: 1, tension: 40, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const paths: { d: string; color: string; label: string; midAngle: number; pct: number }[] = [];
  let cumulative = 0;

  for (const seg of segments) {
    if (seg.count === 0) {
      cumulative += 0;
      continue;
    }
    const startDeg = (cumulative / total) * 360;
    const endDeg = ((cumulative + seg.count) / total) * 360;
    const midAngle = (startDeg + endDeg) / 2;
    paths.push({
      d: describeArc(startDeg, endDeg),
      color: seg.color,
      label: seg.label,
      midAngle,
      pct: seg.pct,
    });
    cumulative += seg.count;
  }

  return (
    <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <G>
          {paths.map((p) => (
            <G key={p.label}>
              {/* Segment arc (filled path using Polygon-equivalent) */}
              <SvgPath d={p.d} fill={p.color} />
            </G>
          ))}
          {/* Center label */}
          <SvgText
            x={CX}
            y={CY - 10}
            textAnchor="middle"
            fontSize="28"
            fontWeight="800"
            fill={COLORS.text}
          >
            {total}
          </SvgText>
          <SvgText
            x={CX}
            y={CY + 14}
            textAnchor="middle"
            fontSize="13"
            fontWeight="600"
            fill={COLORS.textSecondary}
          >
            cards
          </SvgText>
        </G>
      </Svg>
    </Animated.View>
  );
}

// ─── Legend row ──────────────────────────────────────────────────────────────
function LegendRow({ label, count, color, pct }: Segment) {
  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: pct / 100,
      duration: 700,
      delay: 100,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  return (
    <View style={l.row}>
      <View style={[l.dot, { backgroundColor: color }]} />
      <Text style={l.label}>{label}</Text>
      <View style={l.barBg}>
        <Animated.View
          style={[
            l.barFill,
            {
              backgroundColor: color,
              width: barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            },
          ]}
        />
      </View>
      <Text style={[l.count, { color }]}>{count}</Text>
      <Text style={l.pct}>{pct.toFixed(0)}%</Text>
    </View>
  );
}
const l = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  dot: { width: 10, height: 10, borderRadius: 5 },
  label: { width: 72, fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  barBg: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 4 },
  count: { width: 36, textAlign: 'right', fontWeight: '800', fontSize: FONT_SIZES.sm },
  pct: {
    width: 40,
    textAlign: 'right',
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
});

// ─── StatsTab ─────────────────────────────────────────────────────────────────
export function StatsTab() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vocabLabApi
      .getStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <View style={s.center}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  if (!stats)
    return (
      <View style={s.center}>
        <Text style={{ color: COLORS.textSecondary }}>No data yet.</Text>
      </View>
    );

  const rawTotal = stats.totalCount ?? stats.totalCards ?? 0;
  const total = Math.max(rawTotal, 1); // prevent /0

  const segments: Segment[] = [
    {
      label: 'New',
      count: stats.newCount ?? 0,
      color: '#3B82F6',
      pct: ((stats.newCount ?? 0) / total) * 100,
    },
    {
      label: 'Learning',
      count: stats.learningCount ?? 0,
      color: '#F97316',
      pct: ((stats.learningCount ?? 0) / total) * 100,
    },
    {
      label: 'Review',
      count: stats.reviewCount ?? 0,
      color: '#10B981',
      pct: ((stats.reviewCount ?? 0) / total) * 100,
    },
  ];

  // Fill remaining if counts don't add up (floating point, relearning, etc.)
  const accounted = segments.reduce((a, s) => a + s.count, 0);
  const other = rawTotal - accounted;
  if (other > 0) {
    segments.push({ label: 'Other', count: other, color: '#94A3B8', pct: (other / total) * 100 });
  }

  return (
    <ScrollView contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 100 }}>
      <Text style={s.title}>Card Distribution</Text>

      {/* Donut chart */}
      <View style={s.chartContainer}>
        {rawTotal === 0 ? (
          <View style={s.emptyChart}>
            <Text style={s.emptyEmoji}>📭</Text>
            <Text style={s.emptyText}>No cards yet</Text>
          </View>
        ) : (
          <DonutChart segments={segments} total={rawTotal} />
        )}
      </View>

      {/* Legend + bar rows */}
      <View style={s.legendCard}>
        {segments.map((seg) => (
          <LegendRow key={seg.label} {...seg} />
        ))}

        <View style={s.divider} />

        {/* Total row */}
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>Total Cards</Text>
          <Text style={s.totalVal}>{rawTotal}</Text>
        </View>
      </View>

      {/* Maturity Distribution Donut Chart */}
      <MaturityDonut maturityData={stats.maturityDistribution} />

      {/* 30-Day / 7-Day Forecast Chart */}
      <ForecastChart forecastData={stats.forecast} />

      {/* 24-Hour Hourly Activity Chart */}
      <HourlyActivityChart hourlyData={stats.hourlyActivity} />

      {/* "No cards to review" hint */}
      {rawTotal > 0 && (stats.newCount ?? 0) === rawTotal && (
        <View style={s.hintCard}>
          <Text style={s.hintText}>
            🌱 All cards are new! Start a study session to begin learning.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  emptyChart: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZE / 2,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: SPACING.sm },
  legendCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.md },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text },
  totalVal: { fontSize: FONT_SIZES.xl, fontWeight: '900', color: COLORS.text },
  hintCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  hintText: { fontSize: FONT_SIZES.sm, color: '#1D4ED8', fontWeight: '600', lineHeight: 20 },
});
