import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Polyline, Line, Circle, Text as SvgText } from 'react-native-svg';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { studentTeacherApi } from '@/services/ielts.api';
import { Badge, ScoreBadge, SectionHeader, EmptyState } from '@/components/ui';

const { width: SCREEN_W } = Dimensions.get('window');
const CHART_W = SCREEN_W - SPACING.lg * 4;
const CHART_H = 160;

function getIeltsBandFromScore(score: number) {
  if (score >= 39) return 9.0;
  if (score >= 37) return 8.5;
  if (score >= 35) return 8.0;
  if (score >= 32) return 7.5;
  if (score >= 30) return 7.0;
  if (score >= 26) return 6.5;
  if (score >= 23) return 6.0;
  if (score >= 18) return 5.5;
  if (score >= 16) return 5.0;
  if (score >= 13) return 4.5;
  if (score >= 10) return 4.0;
  return 1.0;
}

function MiniChart({ points, color }: { points: number[]; color: string }) {
  if (points.length < 2)
    return (
      <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZES.sm, padding: SPACING.md }}>
        Not enough data
      </Text>
    );
  const pad = 24;
  const w = CHART_W - pad * 2;
  const h = CHART_H - pad * 2;
  const max = 9,
    min = 1;
  const toX = (i: number) => pad + (i / (points.length - 1)) * w;
  const toY = (v: number) => pad + h - ((v - min) / (max - min)) * h;
  const poly = points.map((p, i) => `${toX(i)},${toY(p)}`).join(' ');
  return (
    <Svg width={CHART_W} height={CHART_H}>
      {[3, 5, 7, 9].map((b) => (
        <Line
          key={b}
          x1={pad}
          y1={toY(b)}
          x2={CHART_W - pad}
          y2={toY(b)}
          stroke={COLORS.border}
          strokeWidth={1}
          strokeDasharray="4,4"
        />
      ))}
      <Polyline
        points={poly}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {points.map((p, i) => (
        <React.Fragment key={i}>
          <Circle cx={toX(i)} cy={toY(p)} r={4} fill={color} />
          <SvgText
            x={toX(i)}
            y={toY(p) - 8}
            textAnchor="middle"
            fontSize={9}
            fill={color}
            fontWeight="700"
          >
            {p.toFixed(1)}
          </SvgText>
        </React.Fragment>
      ))}
    </Svg>
  );
}

const SKILL_COLORS: Record<string, string> = {
  LISTENING: COLORS.skill.listening,
  READING: COLORS.skill.reading,
  WRITING: COLORS.skill.writing,
  SPEAKING: COLORS.skill.speaking,
};

export default function StudentDetailScreen() {
  const router = useRouter();
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentTeacherApi
      .getStudentStats(studentId)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  if (!data)
    return (
      <View style={styles.center}>
        <Text>Could not load student data.</Text>
      </View>
    );

  const { profile, streak, mockHistory, advancedListeningHistory, advancedReadingHistory } = data;
  const name =
    [profile?.user?.firstName, profile?.user?.lastName].filter(Boolean).join(' ') ||
    profile?.user?.email ||
    'Student';

  // Group mock history by skill
  const bySkill: Record<string, number[]> = {};
  (mockHistory || []).forEach((h: any) => {
    if (!bySkill[h.skill]) bySkill[h.skill] = [];
    bySkill[h.skill].push(getIeltsBandFromScore(h.rawScore ?? 0));
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: SPACING.md }}>
          <Text style={styles.headerName}>{name}</Text>
          <Text style={styles.headerBadge}>👨‍🏫 Teacher View · Read Only</Text>
        </View>
        <View style={styles.streakBadge}>
          <Text>🔥</Text>
          <Text style={styles.streakVal}>{streak?.currentStreak ?? 0}</Text>
        </View>
      </View>

      {/* Amber banner */}
      <View style={styles.teacherBanner}>
        <Ionicons name="eye-outline" size={16} color="#92400E" />
        <Text style={styles.bannerText}>
          You are viewing <Text style={{ fontWeight: '800' }}>{name}</Text>'s statistics in
          read-only mode.
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View>
              <Text style={styles.profileName}>{name}</Text>
              <Text style={styles.profileEmail}>{profile?.user?.email}</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{profile?.targetBand?.toFixed(1) ?? '—'}</Text>
              <Text style={styles.statLabel}>Target</Text>
            </View>
            <View style={[styles.statItem, styles.statMid]}>
              <Text style={styles.statVal}>{(mockHistory || []).length}</Text>
              <Text style={styles.statLabel}>Tests</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>
                {(advancedListeningHistory || []).length + (advancedReadingHistory || []).length}
              </Text>
              <Text style={styles.statLabel}>Practice</Text>
            </View>
          </View>
        </View>

        {/* Charts per skill */}
        {Object.entries(bySkill).map(([skill, bands]) => (
          <View key={skill} style={styles.section}>
            <SectionHeader
              title={`${skill.charAt(0) + skill.slice(1).toLowerCase()} Trend`}
              subtitle={`${bands.length} tests`}
              right={bands.length > 0 ? <ScoreBadge band={bands[bands.length - 1]} /> : undefined}
            />
            <View style={styles.chartCard}>
              <MiniChart points={bands.slice(-10)} color={SKILL_COLORS[skill] ?? COLORS.primary} />
            </View>
          </View>
        ))}

        {/* Recent history */}
        <View style={styles.section}>
          <SectionHeader title="Recent Tests" />
          {(mockHistory || []).length === 0 ? (
            <EmptyState icon="📋" title="No tests yet" />
          ) : (
            (mockHistory as any[]).slice(0, 10).map((h: any, i: number) => (
              <View key={i} style={styles.histRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.histTitle} numberOfLines={1}>
                    {h.examTitle?.split(' - ')[1] ?? h.examTitle}
                  </Text>
                  <Text style={styles.histDate}>
                    {new Date(h.dateTaken).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={styles.histRight}>
                  <Badge label={h.skill} color={SKILL_COLORS[h.skill] ?? COLORS.primary} />
                  <ScoreBadge band={getIeltsBandFromScore(h.rawScore ?? 0)} />
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerName: { color: '#fff', fontSize: FONT_SIZES.md, fontWeight: '700' },
  headerBadge: { color: '#BFDBFE', fontSize: FONT_SIZES.xs, marginTop: 2 },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  streakVal: { color: '#fff', fontWeight: '800' },
  teacherBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#FEF3C7',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderColor: '#F59E0B',
  },
  bannerText: { flex: 1, fontSize: FONT_SIZES.sm, color: '#92400E' },
  profileCard: {
    margin: SPACING.lg,
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  profileRow: { marginBottom: SPACING.lg },
  profileName: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text },
  profileEmail: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  statsRow: { flexDirection: 'row' },
  statItem: { flex: 1, alignItems: 'center' },
  statMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: COLORS.border },
  statVal: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  section: { paddingHorizontal: SPACING.lg, marginTop: SPACING.lg },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  histRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  histTitle: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  histDate: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  histRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
});
