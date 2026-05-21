import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, G, Line, Text as SvgText } from 'react-native-svg';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';

interface HourActivity {
  hour: number;
  count: number;
}

interface HourlyActivityChartProps {
  hourlyData?: HourActivity[];
}

const HOUR_LABELS = [
  '12a', '', '', '3a', '', '', '6a', '', '', '9a', '', '',
  '12p', '', '', '3p', '', '', '6p', '', '', '9p', '', ''
];

export function HourlyActivityChart({ hourlyData = [] }: HourlyActivityChartProps) {
  if (!hourlyData || hourlyData.length === 0) {
    return (
      <View style={s.card}>
        <Text style={s.title}>Study Hours</Text>
        <View style={s.emptyContainer}>
          <Text style={s.emptyText}>No study activity logged yet</Text>
        </View>
      </View>
    );
  }

  // Pre-fill / Ensure exactly 24 hours
  const hourly = Array.from({ length: 24 }, (_, hour) => {
    const existing = hourlyData.find((h) => h.hour === hour);
    return { hour, count: existing ? existing.count : 0 };
  });

  const counts = hourly.map((h) => h.count);
  const maxCount = Math.max(...counts, 1);

  // Layout measurements
  const screenWidth = Dimensions.get('window').width;
  const paddingHorizontal = SPACING.lg * 2;
  const cardPadding = SPACING.md * 2;
  const W = Math.max(screenWidth - paddingHorizontal - cardPadding, 300);
  const H = 140;

  const PAD = { t: 15, r: 10, b: 20, l: 24 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;

  const n = 24;
  const barGap = 1.5;
  const totalGapsW = barGap * (n - 1);
  const barW = (chartW - totalGapsW) / n;

  return (
    <View style={s.card}>
      <Text style={s.title}>Study Hours</Text>
      <Text style={s.subtitle}>Review distribution by time of day (all-time)</Text>

      <View style={s.chartWrapper}>
        <Svg width={W} height={H}>
          {/* Horizontal grid lines */}
          {[0, 0.5, 1].map((frac) => {
            const y = PAD.t + chartH * (1 - frac);
            const val = Math.round(maxCount * frac);
            return (
              <G key={frac}>
                <Line
                  x1={PAD.l}
                  y1={y}
                  x2={PAD.l + chartW}
                  y2={y}
                  stroke={COLORS.border}
                  strokeWidth={0.8}
                  strokeDasharray="4 4"
                />
                <SvgText
                  x={PAD.l - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="8"
                  fontWeight="600"
                  fill={COLORS.textSecondary}
                >
                  {val}
                </SvgText>
              </G>
            );
          })}

          {/* Activity Bars */}
          {hourly.map((h, i) => {
            const barH = (h.count / maxCount) * chartH;
            const x = PAD.l + i * (barW + barGap);
            const y = PAD.t + chartH - barH;
            const isZero = h.count === 0;

            return (
              <G key={h.hour}>
                {/* Bar */}
                <Rect
                  x={x}
                  y={isZero ? PAD.t + chartH - 2 : y}
                  width={barW}
                  height={isZero ? 2 : barH}
                  fill={isZero ? '#F3F4F6' : '#FFC600'}
                  rx={Math.min(barW / 2, 1.5)}
                />
              </G>
            );
          })}

          {/* Base Axis Line */}
          <Line
            x1={PAD.l}
            y1={PAD.t + chartH}
            x2={PAD.l + chartW}
            y2={PAD.t + chartH}
            stroke={COLORS.border}
            strokeWidth={1}
          />

          {/* Hour labels */}
          {hourly.map((h, i) => {
            const label = HOUR_LABELS[h.hour];
            if (!label) return null;

            const x = PAD.l + i * (barW + barGap) + barW / 2;
            return (
              <SvgText
                key={h.hour}
                x={x}
                y={H - 4}
                textAnchor="middle"
                fontSize="8"
                fontWeight="700"
                fill={COLORS.textMuted}
              >
                {label}
              </SvgText>
            );
          })}
        </Svg>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  chartWrapper: {
    alignItems: 'center',
  },
  emptyContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});
