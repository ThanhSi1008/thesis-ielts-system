import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { ieltsAdvancedApi } from '@/services/ielts.api';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ScoreBadge({ score, total, color }: { score: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  return (
    <View style={[badge.container, { borderColor: color + '50', backgroundColor: color + '10' }]}>
      <Text style={[badge.score, { color }]}>
        {score}/{total}
      </Text>
      <Text style={[badge.pct, { color: color + 'BB' }]}>{pct}%</Text>
    </View>
  );
}

const badge = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 60,
  },
  score: { fontSize: FONT_SIZES.md, fontWeight: '800' },
  pct: { fontSize: FONT_SIZES.xs, fontWeight: '600', marginTop: 1 },
});

function SessionRow({
  item,
  accentColor,
  onPress,
}: {
  item: any;
  accentColor: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[row.card, { borderLeftColor: accentColor }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={row.body}>
        <View style={row.top}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
          <Text style={row.date}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={row.bottom}>
          <Text style={row.viewText}>View Details</Text>
          <Ionicons name="chevron-forward" size={14} color={accentColor} />
        </View>
      </View>
      <ScoreBadge
        score={item.totalScore ?? 0}
        total={item.totalQuestions ?? 0}
        color={accentColor}
      />
    </TouchableOpacity>
  );
}

const row = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  body: { flex: 1, gap: 6 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  date: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  bottom: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.primary },
});

export default function PartHistoryScreen() {
  const router = useRouter();
  const { skill, partId } = useLocalSearchParams<{ skill: string; partId: string }>();

  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isListening = skill === 'listening';
  const accentColor = isListening ? '#E11D48' : '#2563EB';

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const data = isListening
        ? await ieltsAdvancedApi.getListeningHistoryByPart(partId)
        : await ieltsAdvancedApi.getReadingHistoryByPart(partId);
      console.log('[PartHistory] raw response:', JSON.stringify(data));
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[PartHistory] load failed:', err);
      setLoadError('Could not load history. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [partId, isListening]);

  useEffect(() => {
    load();
  }, [load]);

  const goToResult = useCallback(
    (sessionId: string) => {
      router.push(`/ielts/advanced/${skill}/${partId}/result/${sessionId}` as any);
    },
    [router, skill, partId],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: accentColor }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Answers</Text>
          <Text style={styles.headerSub}>
            {isListening ? 'Listening' : 'Reading'} · {sessions.length} attempt
            {sessions.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.practiceBtn}
          onPress={() => router.replace(`/ielts/advanced/${skill}/${partId}` as any)}
        >
          <Ionicons name="play-circle-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={accentColor} />
        </View>
      ) : loadError ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={52} color="#94A3B8" />
          <Text style={styles.emptyTitle}>Load Failed</Text>
          <Text style={styles.emptyText}>{loadError}</Text>
          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: accentColor }]}
            onPress={() => {
              setLoading(true);
              load();
            }}
          >
            <Text style={styles.startBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="documents-outline" size={52} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No Attempts Yet</Text>
          <Text style={styles.emptyText}>
            Complete this practice part to see your results here.
          </Text>
          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: accentColor }]}
            onPress={() => router.replace(`/ielts/advanced/${skill}/${partId}` as any)}
          >
            <Text style={styles.startBtnText}>Start Practice</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              tintColor={accentColor}
            />
          }
          renderItem={({ item }) => (
            <SessionRow item={item} accentColor={accentColor} onPress={() => goToResult(item.id)} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: FONT_SIZES.md, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: FONT_SIZES.xs, marginTop: 2 },
  practiceBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
  },
  startBtn: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
  },
  startBtnText: { color: '#fff', fontSize: FONT_SIZES.md, fontWeight: '700' },
});
