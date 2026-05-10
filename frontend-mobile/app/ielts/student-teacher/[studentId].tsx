import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS } from '@/constants';
import { studentTeacherApi } from '@/services/ielts.api';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getIeltsBandFromScore(score: number) {
  if (score >= 39) return 9.0; if (score >= 37) return 8.5; if (score >= 35) return 8.0;
  if (score >= 32) return 7.5; if (score >= 30) return 7.0; if (score >= 26) return 6.5;
  if (score >= 23) return 6.0; if (score >= 18) return 5.5; if (score >= 16) return 5.0;
  if (score >= 13) return 4.5; if (score >= 10) return 4.0; return 1.0;
}

function getBandForItem(h: any): number {
  if (h.skill === 'WRITING' || h.skill === 'SPEAKING') {
    return h.writingScore ?? h.speakingScore ?? h.rawScore ?? 0;
  }
  return getIeltsBandFromScore(h.rawScore ?? 0);
}

function bandColor(band: number) {
  if (band >= 7.5) return '#16a34a';
  if (band >= 6.0) return '#2563EB';
  if (band >= 5.0) return '#D97706';
  return '#DC2626';
}

const SKILLS = [
  { key: 'LISTENING', label: 'Listening', icon: '🎧', color: '#E11D48' },
  { key: 'READING',   label: 'Reading',   icon: '📖', color: '#2563EB' },
  { key: 'WRITING',   label: 'Writing',   icon: '✍️', color: '#D97706' },
  { key: 'SPEAKING',  label: 'Speaking',  icon: '🎤', color: '#7C3AED' },
];

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <View style={[sc.card, { borderTopColor: color }]}>
      <Text style={[sc.value, { color }]}>{value}</Text>
      <Text style={sc.label}>{label}</Text>
      {sub ? <Text style={sc.sub}>{sub}</Text> : null}
    </View>
  );
}
const sc = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: '#fff', borderRadius: RADIUS.xl, padding: SPACING.md,
    borderTopWidth: 3, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  value: { fontSize: FONT_SIZES.xl, fontFamily: FONTS.bold },
  label: { fontSize: 10, color: COLORS.textSecondary, marginTop: 2, textAlign: 'center' },
  sub: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
});

// ─── Accuracy bar ─────────────────────────────────────────────────────────────
function AccuracyBar({ label, correct, total }: { label: string; correct: number; total: number }) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const color = pct >= 70 ? '#16a34a' : pct >= 50 ? '#D97706' : '#DC2626';
  return (
    <View style={{ marginBottom: SPACING.sm }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
        <Text style={{ fontSize: 11, color: COLORS.text }}>{label}</Text>
        <Text style={{ fontSize: 11, fontFamily: FONTS.bold, color }}>{pct}%</Text>
      </View>
      <View style={{ height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' }}>
        <View style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: 3 }} />
      </View>
    </View>
  );
}

// ─── Session row ──────────────────────────────────────────────────────────────
function SessionRow({ item, activeSkill }: { item: any; activeSkill: string }) {
  const band = getBandForItem(item);
  const color = bandColor(band);
  const isWS = item.skill === 'WRITING' || item.skill === 'SPEAKING';
  const date = new Date(item.dateTaken).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <View style={sr.row}>
      <View style={[sr.bandBadge, { borderColor: color }]}>
        <Text style={[sr.bandValue, { color }]}>{band.toFixed(1)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={sr.title} numberOfLines={1}>{item.examTitle}</Text>
        <Text style={sr.meta}>{date}{item.practicePart ? ` · Part ${item.practicePart}` : ''}</Text>
      </View>
      <Text style={[sr.score, { color }]}>
        {isWS ? `Band ${band.toFixed(1)}` : `${item.rawScore}/${item.maxScore}`}
      </Text>
    </View>
  );
}
const sr = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderColor: COLORS.border },
  bandBadge: { width: 40, height: 40, borderRadius: 20, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  bandValue: { fontSize: 13, fontFamily: FONTS.bold },
  title: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold, color: COLORS.text },
  meta: { fontSize: 10, color: COLORS.textSecondary, marginTop: 1 },
  score: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.bold },
});

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function StudentDetailScreen() {
  const router = useRouter();
  const { studentId } = useLocalSearchParams<{ studentId: string }>();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSkill, setActiveSkill] = useState('LISTENING');

  const load = async () => {
    try {
      const res = await studentTeacherApi.getStudentStats(studentId);
      setData(res);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, [studentId]);

  const profile = data?.ieltsProfile;
  const user = profile?.user ?? {};
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Student';

  // Combine mock + advanced history
  const allHistory: any[] = [
    ...(data?.mockHistory ?? []),
    ...(data?.advancedListeningHistory ?? []),
    ...(data?.advancedReadingHistory ?? []),
  ];

  // Filter by active skill
  const filteredHistory = allHistory.filter(h => h.skill === activeSkill);

  // Per-skill best band
  const bestBand = (skill: string) => {
    const items = allHistory.filter(h => h.skill === skill);
    if (items.length === 0) return null;
    return Math.max(...items.map(getBandForItem));
  };

  // Question type accuracy (mock history only, from result)
  const questionTypeStats: Record<string, { correct: number; total: number }> = {};
  (data?.mockHistory ?? []).forEach((h: any) => {
    if (h.questionTypeStats) {
      Object.entries(h.questionTypeStats).forEach(([qt, v]: [string, any]) => {
        if (!questionTypeStats[qt]) questionTypeStats[qt] = { correct: 0, total: 0 };
        questionTypeStats[qt].correct += v.correct ?? 0;
        questionTypeStats[qt].total += v.total ?? 0;
      });
    }
  });
  const qtEntries = Object.entries(questionTypeStats).sort((a, b) => b[1].total - a[1].total).slice(0, 8);

  const totalSessions = allHistory.length;

  if (loading) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Student Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle} numberOfLines={1}>{name}</Text>
          <Text style={s.headerSub}>Teacher Mode · Student Stats</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 60 }}
      >
        {/* Student info */}
        <View style={s.studentCard}>
          <View style={s.studentAvatar}>
            <Text style={s.studentInitials}>
              {(user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '') || '?'}
            </Text>
          </View>
          <View>
            <Text style={s.studentName}>{name}</Text>
            <Text style={s.studentEmail}>{user.email}</Text>
            {profile?.targetBand && (
              <Text style={s.studentTarget}>🎯 Target Band {profile.targetBand}</Text>
            )}
          </View>
        </View>

        {/* Overall summary */}
        <Text style={s.sectionTitle}>Overview</Text>
        <View style={s.statRow}>
          <StatCard label="Sessions" value={String(totalSessions)} color={COLORS.primary} />
          {SKILLS.slice(0, 2).map(sk => {
            const b = bestBand(sk.key);
            return <StatCard key={sk.key} label={`${sk.icon} Best`} value={b != null ? `Band ${b.toFixed(1)}` : '—'} color={sk.color} />;
          })}
        </View>
        <View style={[s.statRow, { marginTop: SPACING.sm }]}>
          {SKILLS.slice(2).map(sk => {
            const b = bestBand(sk.key);
            return <StatCard key={sk.key} label={`${sk.icon} Best`} value={b != null ? `Band ${b.toFixed(1)}` : '—'} color={sk.color} />;
          })}
        </View>

        {/* Question type accuracy */}
        {qtEntries.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Question-Type Accuracy</Text>
            <View style={s.card}>
              {qtEntries.map(([qt, v]) => (
                <AccuracyBar key={qt} label={qt.replace(/_/g, ' ')} correct={v.correct} total={v.total} />
              ))}
            </View>
          </>
        )}

        {/* Skill filter + history */}
        <Text style={s.sectionTitle}>Session History</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.md }}>
          <View style={{ flexDirection: 'row', gap: SPACING.sm, paddingRight: SPACING.lg }}>
            {SKILLS.map(sk => {
              const active = activeSkill === sk.key;
              return (
                <TouchableOpacity
                  key={sk.key}
                  style={[s.filterChip, active && { backgroundColor: sk.color + '18', borderColor: sk.color }]}
                  onPress={() => setActiveSkill(sk.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.filterChipText, active && { color: sk.color, fontFamily: FONTS.bold }]}>
                    {sk.icon} {sk.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {filteredHistory.length === 0 ? (
          <View style={s.emptyBox}>
            <Text style={s.emptyText}>No {activeSkill.toLowerCase()} sessions yet.</Text>
          </View>
        ) : (
          <View style={s.card}>
            {filteredHistory.map((item, i) => (
              <SessionRow key={item.id ?? i} item={item} activeSkill={activeSkill} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: COLORS.primary, flexDirection: 'row',
    alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, gap: SPACING.md,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: FONT_SIZES.md, fontFamily: FONTS.bold },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 1 },
  studentCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.lg, backgroundColor: '#fff', borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  studentAvatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center' },
  studentInitials: { color: '#fff', fontSize: FONT_SIZES.xl, fontFamily: FONTS.bold },
  studentName: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold, color: COLORS.text },
  studentEmail: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  studentTarget: { fontSize: FONT_SIZES.xs, color: COLORS.primary, marginTop: 4, fontFamily: FONTS.bold },
  sectionTitle: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SPACING.md, marginTop: SPACING.lg },
  statRow: { flexDirection: 'row', gap: SPACING.sm },
  card: { backgroundColor: '#fff', borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  filterChip: { paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: '#fff' },
  filterChipText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  emptyBox: { alignItems: 'center', paddingVertical: SPACING.xl, backgroundColor: '#fff', borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.border },
  emptyText: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm },
});
