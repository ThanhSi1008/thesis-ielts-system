import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '@/constants';
import { vocabLabApi } from '@/services/features.api';

export function StatsTab() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => { 
    vocabLabApi.getStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false)); 
  }, []);

  if (loading) return <View style={s.center}><ActivityIndicator color={COLORS.primary} /></View>;
  if (!stats) return <View style={s.center}><Text style={{ color: COLORS.textSecondary }}>No data yet.</Text></View>;

  const total = Math.max(stats.totalCount ?? stats.totalCards ?? 0, 1);
  const rows = [
    { label: 'New',       count: stats.newCount ?? 0,      color: '#3B82F6' },
    { label: 'Learning',  count: stats.learningCount ?? 0,  color: '#EF4444' },
    { label: 'Reviewing', count: stats.reviewCount ?? 0,    color: '#10B981' },
  ];

  return (
    <ScrollView contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 100 }}>
      <Text style={s.statsTitle}>Card Distribution</Text>
      {rows.map(r => (
        <View key={r.label} style={s.statBar}>
          <Text style={[s.statBarLabel, { color: r.color }]}>{r.label}</Text>
          <View style={s.barBg}>
            <View style={[s.barFill, { width: `${(r.count / total) * 100}%` as any, backgroundColor: r.color }]} />
          </View>
          <Text style={s.statBarCount}>{r.count}</Text>
        </View>
      ))}
      <View style={s.totalRow}>
        <Text style={s.totalLabel}>Total</Text>
        <Text style={s.totalVal}>{stats.totalCount ?? stats.totalCards ?? 0}</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  statsTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.xl },
  statBar: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.md },
  statBarLabel: { width: 72, fontSize: FONT_SIZES.sm, fontWeight: '700' },
  barBg: { flex: 1, height: 10, backgroundColor: COLORS.border, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  statBarCount: { width: 36, textAlign: 'right', fontWeight: '700', color: COLORS.text },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: SPACING.lg, borderTopWidth: 1, borderColor: COLORS.border, marginTop: SPACING.sm },
  totalLabel: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text },
  totalVal: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text },
});
