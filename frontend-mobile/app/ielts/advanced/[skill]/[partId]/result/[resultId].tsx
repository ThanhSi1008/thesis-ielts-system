import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { ieltsAdvancedApi } from '@/services/ielts.api';
import { Button } from '@/components/ui';

export default function AdvancedResultScreen() {
  const router = useRouter();
  const { skill, partId, resultId } = useLocalSearchParams<{ skill: string; partId: string; resultId: string }>();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = skill === 'listening'
          ? await ieltsAdvancedApi.getListeningHistoryDetail(resultId)
          : await ieltsAdvancedApi.getReadingHistory();
        setResult(data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [resultId]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  const accentColor = skill === 'listening' ? '#E11D48' : '#2563EB';
  const pct = result ? Math.round((result.totalScore / result.totalQuestions) * 100) : 0;

  const scoreData: Record<string, { correct: number; total: number }> = result?.scoreData || {};

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: accentColor + '12' }]}>
          <View style={[styles.circle, { borderColor: accentColor }]}>
            <Text style={[styles.pctText, { color: accentColor }]}>{pct}%</Text>
            <Text style={[styles.pctLabel, { color: accentColor }]}>Score</Text>
          </View>
          <Text style={styles.heroTitle}>Practice Complete!</Text>
          <Text style={styles.heroSub}>{result?.totalScore ?? 0} / {result?.totalQuestions ?? 0} correct</Text>
        </View>

        {/* Breakdown */}
        {Object.entries(scoreData).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Question Type Breakdown</Text>
            {Object.entries(scoreData).map(([type, stats]) => {
              const typePct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
              return (
                <View key={type} style={styles.breakdownRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.breakdownType}>{type.replace(/_/g, ' ')}</Text>
                    <View style={styles.progressBg}>
                      <View style={[styles.progressFill, { width: `${typePct}%` as any, backgroundColor: accentColor }]} />
                    </View>
                  </View>
                  <Text style={[styles.breakdownScore, { color: accentColor }]}>{stats.correct}/{stats.total}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button title="Back to Practice" variant="outline" onPress={() => router.replace(`/ielts/advanced` as any)} fullWidth />
          <View style={{ height: SPACING.sm }} />
          <Button title="Try Again" onPress={() => router.replace(`/ielts/advanced/${skill}/${partId}` as any)} fullWidth />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', padding: SPACING.xxxl },
  circle: {
    width: 110, height: 110, borderRadius: 55, borderWidth: 4,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
    marginBottom: SPACING.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  pctText: { fontSize: 36, fontWeight: '900' },
  pctLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', textTransform: 'uppercase' },
  heroTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.xs },
  heroSub: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
  section: { padding: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  breakdownRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  breakdownType: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text, textTransform: 'capitalize', marginBottom: 6 },
  progressBg: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  breakdownScore: { fontSize: FONT_SIZES.md, fontWeight: '800', minWidth: 48, textAlign: 'right' },
  actions: { padding: SPACING.xl },
});
