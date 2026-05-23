import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { G, Text as SvgText, Path as SvgPath } from 'react-native-svg';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';

interface MaturityStats {
  young: number;
  mature: number;
  suspended: number;
}

interface MaturityDonutProps {
  maturityData?: MaturityStats;
}

interface Segment {
  label: string;
  count: number;
  color: string;
  pct: number;
}

const SIZE = 180;
const RADIUS_OUTER = 70;
const RADIUS_INNER = 46; // thickness = 24
const CX = SIZE / 2;
const CY = SIZE / 2;

function polarToXY(angleDeg: number, r: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function describeArc(startDeg: number, endDeg: number): string {
  const gap = 0;
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

export function MaturityDonut({ maturityData }: MaturityDonutProps) {
  const maturity = maturityData ?? { young: 0, mature: 0, suspended: 0 };
  const total = maturity.young + maturity.mature + maturity.suspended;

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const segments: Segment[] = [
    {
      label: 'Young (<21d)',
      count: maturity.young,
      color: '#F59E0B',
      pct: total > 0 ? (maturity.young / total) * 100 : 0,
    },
    {
      label: 'Mature (≥21d)',
      count: maturity.mature,
      color: '#10B981',
      pct: total > 0 ? (maturity.mature / total) * 100 : 0,
    },
    {
      label: 'Struggling',
      count: maturity.suspended,
      color: '#9CA3AF',
      pct: total > 0 ? (maturity.suspended / total) * 100 : 0,
    },
  ];

  const paths: { d: string; color: string; label: string }[] = [];
  let cumulative = 0;

  for (const seg of segments) {
    if (seg.count === 0 || total === 0) continue;
    const startDeg = (cumulative / total) * 360;
    const endDeg = ((cumulative + seg.count) / total) * 360;
    paths.push({
      d: describeArc(startDeg, endDeg),
      color: seg.color,
      label: seg.label,
    });
    cumulative += seg.count;
  }

  return (
    <View style={s.card}>
      <Text style={s.title}>Card Maturity</Text>
      <Text style={s.subtitle}>How well-learned are your review cards?</Text>

      {total === 0 ? (
        <View style={s.emptyContainer}>
          <Text style={s.emptyText}>No review cards yet</Text>
        </View>
      ) : (
        <View style={s.content}>
          <Animated.View style={[s.chartWrapper, { opacity: fadeAnim }]}>
            <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
              <G>
                {paths.map((p) => (
                  <SvgPath key={p.label} d={p.d} fill={p.color} />
                ))}
                {/* Center text */}
                <SvgText
                  x={CX}
                  y={CY - 6}
                  textAnchor="middle"
                  fontSize="22"
                  fontWeight="800"
                  fill={COLORS.text}
                >
                  {total}
                </SvgText>
                <SvgText
                  x={CX}
                  y={CY + 12}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill={COLORS.textSecondary}
                >
                  review
                </SvgText>
              </G>
            </Svg>
          </Animated.View>

          {/* Legend and Bar Row */}
          <View style={s.legendList}>
            {segments.map((seg) => {
              if (seg.count === 0 && total > 0) return null; // hide 0 counts if we have data to avoid cluttering
              return (
                <View key={seg.label} style={s.legendRow}>
                  <View style={s.legendHeader}>
                    <View style={[s.dot, { backgroundColor: seg.color }]} />
                    <Text style={s.legendLabel} numberOfLines={1}>
                      {seg.label}
                    </Text>
                  </View>
                  <View style={s.legendStats}>
                    <Text style={[s.count, { color: seg.color }]}>{seg.count}</Text>
                    <Text style={s.pct}>{seg.pct.toFixed(0)}%</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}
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
  content: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendList: {
    width: '100%',
    gap: SPACING.xs,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    paddingTop: SPACING.md,
    marginTop: SPACING.xs,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  legendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  legendStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  count: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    minWidth: 20,
    textAlign: 'right',
  },
  pct: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    minWidth: 28,
    textAlign: 'right',
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
