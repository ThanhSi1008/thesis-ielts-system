import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { ieltsExamsApi } from '@/services/ielts.api';
import { Chip, Badge, ScoreBadge, EmptyState } from '@/components/ui';

function getIeltsBandFromScore(score: number) {
  if (score >= 39) return 9.0; if (score >= 37) return 8.5; if (score >= 35) return 8.0;
  if (score >= 32) return 7.5; if (score >= 30) return 7.0; if (score >= 26) return 6.5;
  if (score >= 23) return 6.0; if (score >= 18) return 5.5; if (score >= 16) return 5.0;
  if (score >= 13) return 4.5; if (score >= 10) return 4.0; return 1.0;
}

const SKILL_FILTERS = [
  { key: 'ALL', label: 'All', color: COLORS.primary },
  { key: 'LISTENING', label: 'Listening', color: '#E11D48' },
  { key: 'READING', label: 'Reading', color: '#2563EB' },
  { key: 'WRITING', label: 'Writing', color: '#D97706' },
  { key: 'SPEAKING', label: 'Speaking', color: '#7C3AED' },
];

export default function HistoryScreen() {
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const fetchHistory = async () => {
    try {
      const data = await ieltsExamsApi.getHistory();
      setHistory(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const filtered = filter === 'ALL' ? history : history.filter(h => h.skill === filter);

  const skillColorMap: Record<string, string> = {
    LISTENING: '#E11D48', READING: '#2563EB', WRITING: '#D97706', SPEAKING: '#7C3AED',
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test History</Text>
        <Text style={styles.headerCount}>{history.length} tests</Text>
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm }}
      >
        {SKILL_FILTERS.map(f => (
          <Chip
            key={f.key}
            label={f.label}
            active={filter === f.key}
            onPress={() => setFilter(f.key)}
          />
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchHistory(); }} />}
        >
          {filtered.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No tests found"
              subtitle={filter === 'ALL' ? 'Complete a mock test to see history.' : `No ${filter.toLowerCase()} tests yet.`}
              action={{ label: 'Take a Test', onPress: () => router.push('/ielts/intensive' as any) }}
            />
          ) : (
            filtered.map((h, i) => {
              const band = getIeltsBandFromScore(h.rawScore ?? 0);
              const color = skillColorMap[h.skill] ?? COLORS.primary;
              const date = new Date(h.dateTaken).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
              });
              const title = h.examTitle?.split(' - ')[0] ?? h.examTitle;
              const subtitle = h.examTitle?.split(' - ')[1];

              return (
                <View key={i} style={styles.historyCard}>
                  <View style={[styles.skillStripe, { backgroundColor: color }]} />
                  <View style={styles.cardContent}>
                    <View style={styles.cardTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
                        {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
                        <Text style={styles.cardDate}>{date}</Text>
                      </View>
                      <View style={styles.cardRight}>
                        <ScoreBadge band={band} />
                        <Text style={styles.rawScore}>{h.rawScore ?? 0}/40</Text>
                      </View>
                    </View>
                    <View style={styles.cardMeta}>
                      <Badge label={h.skill} color={color} />
                      {h.timeTaken && (
                        <Text style={styles.metaText}>
                          ⏱ {Math.floor(h.timeTaken / 60)}:{String(h.timeTaken % 60).padStart(2, '0')}
                        </Text>
                      )}
                      {h.difficulty && <Text style={styles.metaText}>📊 {h.difficulty}</Text>}
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
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
  headerCount: { color: '#BFDBFE', fontSize: FONT_SIZES.sm, fontWeight: '600' },
  filterBar: { borderBottomWidth: 1, borderColor: COLORS.border, maxHeight: 56 },
  historyCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  skillStripe: { width: 5 },
  cardContent: { flex: 1, padding: SPACING.md },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm },
  cardTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  cardSubtitle: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 1 },
  cardDate: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 4 },
  cardRight: { alignItems: 'flex-end', gap: 4, marginLeft: SPACING.sm },
  rawScore: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: '600' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flexWrap: 'wrap' },
  metaText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
});
