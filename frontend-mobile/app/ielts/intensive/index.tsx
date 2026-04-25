import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { ieltsExamsApi } from '@/services/ielts.api';
import { Chip, EmptyState, SectionHeader, Badge } from '@/components/ui';

const SKILLS = [
  { key: 'LISTENING', label: 'Listening', icon: '🎧', color: '#E11D48' },
  { key: 'READING',   label: 'Reading',   icon: '📖', color: '#2563EB' },
  { key: 'WRITING',   label: 'Writing',   icon: '✍️', color: '#D97706' },
  { key: 'SPEAKING',  label: 'Speaking',  icon: '🎤', color: '#7C3AED' },
];

export default function IntensiveScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ skill?: string }>();
  const [activeSkill, setActiveSkill] = useState(params.skill || 'LISTENING');
  const [catalog, setCatalog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCatalog = async (skill: string) => {
    try {
      setLoading(true);
      const data = await ieltsExamsApi.getIntensiveCatalog(skill);
      setCatalog(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchCatalog(activeSkill); }, [activeSkill]);

  const skillInfo = SKILLS.find(s => s.key === activeSkill)!;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mock Tests</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Skill tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabs}
        contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm }}
      >
        {SKILLS.map(s => (
          <Chip
            key={s.key}
            label={`${s.icon} ${s.label}`}
            active={activeSkill === s.key}
            onPress={() => setActiveSkill(s.key)}
          />
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading {skillInfo.label} tests…</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCatalog(activeSkill); }} />}
          contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: 100 }}
        >
          {(!catalog?.groups || catalog.groups.length === 0) ? (
            <EmptyState icon="📭" title="No tests available" subtitle={`No ${skillInfo.label} tests found.`} />
          ) : (
            catalog.groups.map((group: any) => (
              <View key={group.id} style={styles.groupCard}>
                {/* Group header */}
                <View style={styles.groupHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.groupTitle}>{group.title}</Text>
                    <Text style={styles.groupMeta}>
                      {group.tests.length} test{group.tests.length !== 1 ? 's' : ''} · {group.completedCount} completed
                    </Text>
                  </View>
                  <Badge label={skillInfo.label} color={skillInfo.color} />
                </View>

                {/* Tests */}
                {group.tests.map((test: any) => (
                  <TouchableOpacity
                    key={test.examId}
                    style={styles.testRow}
                    onPress={() => router.push(`/ielts/intensive/${test.examId}` as any)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.testLeft}>
                      <View style={[styles.testNumBadge, { backgroundColor: skillInfo.color + '18' }]}>
                        <Text style={[styles.testNum, { color: skillInfo.color }]}>
                          {test.testNumber}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.testTitle}>Test {test.testNumber}</Text>
                        <Text style={styles.testMeta}>{test.durationMinutes} min</Text>
                      </View>
                    </View>
                    <View style={styles.testRight}>
                      {test.myScore !== undefined ? (
                        <View style={styles.myScore}>
                          <Text style={styles.myScoreLabel}>Best</Text>
                          <Text style={styles.myScoreValue}>{test.myScore}/40</Text>
                        </View>
                      ) : (
                        <Text style={styles.notAttempted}>Not tried</Text>
                      )}
                      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.xxxl },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: FONT_SIZES.lg, fontWeight: '700' },
  tabs: { borderBottomWidth: 1, borderColor: COLORS.border, maxHeight: 56 },
  loadingText: { marginTop: SPACING.md, color: COLORS.textSecondary, fontSize: FONT_SIZES.sm },
  groupCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  groupTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  groupMeta: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  testRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  testLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  testNumBadge: { width: 36, height: 36, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  testNum: { fontSize: FONT_SIZES.md, fontWeight: '800' },
  testTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text },
  testMeta: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 1 },
  testRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  myScore: { alignItems: 'flex-end' },
  myScoreLabel: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '600' },
  myScoreValue: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.success },
  notAttempted: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, fontStyle: 'italic' },
});
