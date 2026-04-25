import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { ieltsProfileApi, ieltsExamsApi } from '@/services/ielts.api';
import { useAuth } from '@/contexts/AuthContext';
import { SectionHeader, Badge, ScoreBadge, EmptyState } from '@/components/ui';

function getIeltsBand(score: number) {
  if (score >= 39) return 9.0; if (score >= 37) return 8.5; if (score >= 35) return 8.0;
  if (score >= 32) return 7.5; if (score >= 30) return 7.0; if (score >= 26) return 6.5;
  if (score >= 23) return 6.0; if (score >= 18) return 5.5; if (score >= 16) return 5.0;
  if (score >= 13) return 4.5; if (score >= 10) return 4.0; if (score >= 8) return 3.5;
  if (score >= 6) return 3.0; if (score >= 4) return 2.5; if (score >= 2) return 2.0;
  return 1.0;
}

const SKILL_CONFIG = [
  { key: 'LISTENING', label: 'Listening', icon: '🎧', color: '#E11D48', bg: '#FFF1F2', route: '/ielts/intensive?skill=LISTENING' },
  { key: 'READING',   label: 'Reading',   icon: '📖', color: '#2563EB', bg: '#EFF6FF', route: '/ielts/intensive?skill=READING' },
  { key: 'WRITING',   label: 'Writing',   icon: '✍️', color: '#D97706', bg: '#FFFBEB', route: '/ielts/intensive?skill=WRITING' },
  { key: 'SPEAKING',  label: 'Speaking',  icon: '🎤', color: '#7C3AED', bg: '#F5F3FF', route: '/ielts/intensive?skill=SPEAKING' },
];

export default function IeltsHubScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [streak, setStreak] = useState<{ currentStreak: number; longestStreak: number } | null>(null);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [profileRes, streakRes, historyRes] = await Promise.allSettled([
        ieltsProfileApi.get(),
        ieltsProfileApi.getStreak(),
        ieltsExamsApi.getHistory(),
      ]);
      if (profileRes.status === 'fulfilled') setProfile(profileRes.value);
      if (streakRes.status === 'fulfilled') setStreak(streakRes.value);
      if (historyRes.status === 'fulfilled') setRecentHistory((historyRes.value as any[]).slice(0, 5));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const firstName = user?.firstName || user?.email?.split('@')[0] || 'Student';

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back 👋</Text>
          <Text style={styles.name}>{firstName}</Text>
        </View>
        <View style={styles.streakBadge}>
          <Text style={styles.streakFire}>🔥</Text>
          <Text style={styles.streakCount}>{streak?.currentStreak ?? 0}</Text>
        </View>
      </View>

      {/* Profile stats row */}
      {profile && (
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{profile.targetBand?.toFixed(1) ?? '—'}</Text>
            <Text style={styles.statLabel}>Target Band</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxMid]}>
            <Text style={styles.statValue}>{streak?.longestStreak ?? 0}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{profile.dailyCommitmentMins ?? 30}m</Text>
            <Text style={styles.statLabel}>Daily Goal</Text>
          </View>
        </View>
      )}

      {/* Skill cards */}
      <View style={styles.section}>
        <SectionHeader title="Practice Skills" subtitle="Choose a skill to start" />
        <View style={styles.skillGrid}>
          {SKILL_CONFIG.map((s) => (
            <TouchableOpacity
              key={s.key}
              style={[styles.skillCard, { backgroundColor: s.bg }]}
              onPress={() => router.push(s.route as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.skillIcon}>{s.icon}</Text>
              <Text style={[styles.skillLabel, { color: s.color }]}>{s.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={s.color} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick access */}
      <View style={styles.section}>
        <SectionHeader title="Quick Access" />
        <View style={styles.quickRow}>
          {[
            { icon: '📊', label: 'Statistics', route: '/ielts/statistics' },
            { icon: '📋', label: 'History', route: '/ielts/history' },
            { icon: '🎯', label: 'Advanced', route: '/ielts/advanced' },
            { icon: '🗺️', label: 'Roadmap', route: '/ielts/roadmap' },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.quickCard}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.quickIcon}>{item.icon}</Text>
              <Text style={styles.quickLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent activity */}
      <View style={styles.section}>
        <SectionHeader
          title="Recent Activity"
          right={
            <TouchableOpacity onPress={() => router.push('/ielts/history' as any)}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          }
        />
        {recentHistory.length === 0 ? (
          <EmptyState icon="📝" title="No tests yet" subtitle="Complete a mock test to see results here" />
        ) : (
          recentHistory.map((h, i) => {
            const band = getIeltsBand(h.rawScore ?? 0);
            return (
              <View key={i} style={styles.historyRow}>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyTitle} numberOfLines={1}>
                    {h.examTitle?.split(' - ')[1] ?? h.examTitle}
                  </Text>
                  <Text style={styles.historyDate}>
                    {new Date(h.dateTaken).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
                <View style={styles.historyRight}>
                  <Badge label={h.skill} color={SKILL_CONFIG.find(s => s.key === h.skill)?.color ?? COLORS.primary} />
                  <ScoreBadge band={band} />
                </View>
              </View>
            );
          })
        )}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingTop: 56,
    paddingBottom: SPACING.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: { color: '#BFDBFE', fontSize: FONT_SIZES.sm, marginBottom: 2 },
  name: { color: '#fff', fontSize: FONT_SIZES.xxl, fontWeight: '800' },
  streakBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakFire: { fontSize: 20 },
  streakCount: { color: '#fff', fontSize: FONT_SIZES.lg, fontWeight: '800' },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginTop: -SPACING.lg,
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: SPACING.md,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statBoxMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: COLORS.border },
  statValue: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  section: { paddingHorizontal: SPACING.lg, marginTop: SPACING.xl },
  skillGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  skillCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    gap: SPACING.sm,
  },
  skillIcon: { fontSize: 24 },
  skillLabel: { flex: 1, fontSize: FONT_SIZES.md, fontWeight: '700' },
  quickRow: { flexDirection: 'row', gap: SPACING.sm },
  quickCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickIcon: { fontSize: 24, marginBottom: SPACING.xs },
  quickLabel: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.text, textAlign: 'center' },
  seeAll: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: '600' },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  historyInfo: { flex: 1, marginRight: SPACING.sm },
  historyTitle: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  historyDate: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  historyRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
});
