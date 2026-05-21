import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Rect, Path, G, Line, Text as SvgText, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';

interface ForecastDay {
  date: string;
  dueCount: number;
  cumulativeCount: number;
}

interface ForecastChartProps {
  forecastData?: ForecastDay[];
}

export function ForecastChart({ forecastData = [] }: ForecastChartProps) {
  const [range, setRange] = useState<'7' | '30'>('7');

  if (!forecastData || forecastData.length === 0) {
    return (
      <View style={s.card}>
        <Text style={s.title}>Due Forecast</Text>
        <View style={s.emptyContainer}>
          <Text style={s.emptyText}>No forecast data available</Text>
        </View>
      </View>
    );
  }

  // Filter based on range
  const numDays = range === '7' ? 7 : 30;
  const data = forecastData.slice(0, numDays);

  const dueCounts = data.map((d) => d.dueCount);
  const cumulativeCounts = data.map((d) => d.cumulativeCount);

  const maxDue = Math.max(...dueCounts, 1);
  const maxCum = Math.max(...cumulativeCounts, 1);

  // Layout measurements
  const screenWidth = Dimensions.get('window').width;
  const paddingHorizontal = SPACING.lg * 2;
  const cardPadding = SPACING.md * 2;
  const W = Math.max(screenWidth - paddingHorizontal - cardPadding, 300);
  const H = 160;

  const PAD = { t: 15, r: 15, b: 24, l: 36 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const n = data.length;

  // Calculate Bar coordinates
  const barGap = range === '7' ? 8 : 2;
  const totalGapsW = barGap * (n - 1);
  const barW = (chartW - totalGapsW) / n;

  // Calculate points for the cumulative line/area
  const pts = data.map((d, i) => {
    // Center point on the bar
    const x = PAD.l + i * (barW + barGap) + barW / 2;
    const y = PAD.t + chartH - (d.cumulativeCount / maxCum) * chartH;
    return { x, y };
  });

  let areaPath = '';
  let linePath = '';

  if (pts.length > 0) {
    linePath = `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ');
    areaPath =
      `M ${pts[0].x} ${PAD.t + chartH} ` +
      pts.map((p) => `L ${p.x} ${p.y}`).join(' ') +
      ` L ${pts[pts.length - 1].x} ${PAD.t + chartH} Z`;
  }

  // Filter X-axis labels to avoid crowding
  const xLabels = data.filter((_, i) => {
    if (range === '7') return true;
    return i % 6 === 0 || i === n - 1;
  });

  return (
    <View style={s.card}>
      {/* Header with Switcher */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>Due Forecast</Text>
          <Text style={s.subtitle}>Expected review cards in next {numDays} days</Text>
        </View>
        <View style={s.toggleContainer}>
          <TouchableOpacity
            style={[s.toggleBtn, range === '7' && s.toggleBtnActive]}
            onPress={() => setRange('7')}
            activeOpacity={0.8}
          >
            <Text style={[s.toggleText, range === '7' && s.toggleTextActive]}>7D</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.toggleBtn, range === '30' && s.toggleBtnActive]}
            onPress={() => setRange('30')}
            activeOpacity={0.8}
          >
            <Text style={[s.toggleText, range === '30' && s.toggleTextActive]}>30D</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Legend Row */}
      <View style={s.legendRow}>
        <View style={s.legendItem}>
          <View style={[s.legendColor, { backgroundColor: '#BFDBFE' }]} />
          <Text style={s.legendText}>Due Daily</Text>
        </View>
        <View style={s.legendItem}>
          <View style={[s.legendColor, { backgroundColor: '#EAB308' }]} />
          <Text style={s.legendText}>Cumulative</Text>
        </View>
      </View>

      {/* SVG Canvas */}
      <View style={s.chartWrapper}>
        <Svg width={W} height={H}>
          <Defs>
            <LinearGradient id="cumAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#EAB308" stopOpacity="0.25" />
              <Stop offset="100%" stopColor="#EAB308" stopOpacity="0.0" />
            </LinearGradient>
          </Defs>

          {/* Grid lines (horizontal) */}
          {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
            const y = PAD.t + chartH * (1 - frac);
            const val = Math.round(maxDue * frac);
            return (
              <G key={frac}>
                <Line
                  x1={PAD.l}
                  y1={y}
                  x2={PAD.l + chartW}
                  y2={y}
                  stroke={COLORS.border}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <SvgText
                  x={PAD.l - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fontWeight="600"
                  fill={COLORS.textSecondary}
                >
                  {val}
                </SvgText>
              </G>
            );
          })}

          {/* Daily Due Bars */}
          {data.map((d, i) => {
            const barH = (d.dueCount / maxDue) * chartH;
            const x = PAD.l + i * (barW + barGap);
            const y = PAD.t + chartH - barH;
            return (
              <Rect
                key={d.date}
                x={x}
                y={y}
                width={barW}
                height={barH}
                fill="#BFDBFE"
                rx={Math.min(barW / 2, 3)}
              />
            );
          })}

          {/* Cumulative Area */}
          {areaPath ? <Path d={areaPath} fill="url(#cumAreaGrad)" /> : null}

          {/* Cumulative Line */}
          {linePath ? (
            <Path
              d={linePath}
              fill="none"
              stroke="#EAB308"
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ) : null}

          {/* Data Points */}
          {pts.map((p, i) => (
            <Circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={range === '7' ? 3.5 : 2}
              fill="#EAB308"
              stroke="#fff"
              strokeWidth={1.5}
            />
          ))}

          {/* X Axis Line */}
          <Line
            x1={PAD.l}
            y1={PAD.t + chartH}
            x2={PAD.l + chartW}
            y2={PAD.t + chartH}
            stroke={COLORS.border}
            strokeWidth={1.5}
          />

          {/* X Axis Labels */}
          {xLabels.map((d) => {
            const i = data.indexOf(d);
            const x = PAD.l + i * (barW + barGap) + barW / 2;
            const dateObj = new Date(d.date);
            const formattedDate = isNaN(dateObj.getTime())
              ? d.date
              : `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
            return (
              <SvgText
                key={d.date}
                x={x}
                y={H - 6}
                textAnchor="middle"
                fontSize="9"
                fontWeight="600"
                fill={COLORS.textSecondary}
              >
                {formattedDate}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
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
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: RADIUS.md,
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  toggleBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1.5,
    elevation: 2,
  },
  toggleText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  toggleTextActive: {
    color: COLORS.primary,
  },
  legendRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chartWrapper: {
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  emptyContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});
