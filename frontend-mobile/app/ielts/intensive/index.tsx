import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Image,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS } from '@/constants';
import { ieltsExamsApi } from '@/services/ielts.api';
import { Chip, EmptyState, SectionHeader, Badge } from '@/components/ui';

const SKILLS = [
  { key: 'LISTENING', label: 'Listening', icon: '🎧', color: COLORS.skill.listening },
  { key: 'READING', label: 'Reading', icon: '📖', color: COLORS.skill.reading },
  { key: 'WRITING', label: 'Writing', icon: '✍️', color: COLORS.skill.writing },
  { key: 'SPEAKING', label: 'Speaking', icon: '🎤', color: COLORS.skill.speaking },
];

type StatusFilter = 'all' | 'taken' | 'not-taken';

// ─── Band score helpers (mirrors result screen & web thresholds) ─────────────
function getBandColor(band: number): string {
  if (band >= 8.0) return '#22c55e';
  if (band >= 6.5) return '#3b82f6';
  if (band >= 5.0) return '#f59e0b';
  return '#ef4444';
}

// Convert raw Listening/Reading score (0-40) → IELTS band
function rawToListeningBand(score: number): number {
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
  if (score >= 8) return 3.5;
  if (score >= 6) return 3.0;
  if (score >= 4) return 2.5;
  if (score >= 2) return 2.0;
  return 1.0;
}

function rawToReadingBand(score: number): number {
  if (score >= 39) return 9.0;
  if (score >= 37) return 8.5;
  if (score >= 35) return 8.0;
  if (score >= 33) return 7.5;
  if (score >= 30) return 7.0;
  if (score >= 27) return 6.5;
  if (score >= 23) return 6.0;
  if (score >= 19) return 5.5;
  if (score >= 15) return 5.0;
  if (score >= 13) return 4.5;
  if (score >= 10) return 4.0;
  if (score >= 8) return 3.5;
  if (score >= 6) return 3.0;
  if (score >= 4) return 2.5;
  if (score >= 2) return 2.0;
  return 1.0;
}

// ─── Accordion Group Card ────────────────────────────────────────────────────
interface AccordionGroupProps {
  group: any;
  isCollapsed: boolean;
  onToggle: () => void;
  skillColor: string;
  activeSkill: string;
  onTestPress: (examId: string) => void;
}

function AccordionGroup({
  group,
  isCollapsed,
  onToggle,
  skillColor,
  activeSkill,
  onTestPress,
}: AccordionGroupProps) {
  const rotateAnim = useRef(new Animated.Value(isCollapsed ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(rotateAnim, {
      toValue: isCollapsed ? 1 : 0,
      useNativeDriver: true,
      stiffness: 180,
      damping: 20,
    }).start();
  }, [isCollapsed]);

  const chevronRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-180deg'],
  });

  const isWS = activeSkill === 'WRITING' || activeSkill === 'SPEAKING';
  const completedCount = group.completedCount ?? 0;
  const totalTests = group.tests?.length ?? 0;

  return (
    <View style={acc.card}>
      {/* ── Header (always visible, tappable) ─── */}
      <TouchableOpacity style={acc.header} onPress={onToggle} activeOpacity={0.8}>
        {/* Book cover or placeholder */}
        {group.imageUrl ? (
          <Image source={{ uri: group.imageUrl }} style={acc.cover} resizeMode="cover" />
        ) : (
          <View style={acc.coverPlaceholder}>
            <Text style={acc.coverPlaceholderText} numberOfLines={3}>
              {group.title.replace('Cambridge IELTS ', 'IELTS\n')}
            </Text>
          </View>
        )}

        {/* Group info */}
        <View style={acc.headerInfo}>
          <Text style={acc.groupTitle} numberOfLines={2}>
            {group.title}
          </Text>
          <View style={acc.stats}>
            <View style={acc.statPill}>
              <Ionicons name="checkmark-circle-outline" size={11} color="#16a34a" />
              <Text style={acc.statText}>{completedCount} completed</Text>
            </View>
            <View style={acc.statPill}>
              <Ionicons name="documents-outline" size={11} color={COLORS.textMuted} />
              <Text style={acc.statText}>
                {totalTests} test{totalTests !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          {/* Progress bar */}
          <View style={acc.progressTrack}>
            <View
              style={[
                acc.progressFill,
                {
                  width: `${totalTests > 0 ? (completedCount / totalTests) * 100 : 0}%` as any,
                  backgroundColor: skillColor,
                },
              ]}
            />
          </View>
        </View>

        {/* Chevron */}
        <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
          <Ionicons name="chevron-up" size={20} color={COLORS.textMuted} />
        </Animated.View>
      </TouchableOpacity>

      {/* ── Tests list (hidden when collapsed) ─── */}
      {!isCollapsed && (
        <View>
          {group.tests?.map((test: any) => (
            <TouchableOpacity
              key={test.examId}
              style={acc.testRow}
              onPress={() => onTestPress(test.examId)}
              activeOpacity={0.8}
            >
              <View style={acc.testLeft}>
                <View style={[acc.testNumBadge, { backgroundColor: skillColor + '18' }]}>
                  <Text style={[acc.testNum, { color: skillColor }]}>{test.testNumber}</Text>
                </View>
                <View>
                  <Text style={acc.testTitle}>Test {test.testNumber}</Text>
                  <Text style={acc.testMeta}>{test.durationMinutes} min</Text>
                </View>
              </View>
              <View style={acc.testRight}>
                {test.myScore !== undefined ? (
                  (() => {
                    // Derive band float from myScore depending on skill
                    const band = isWS
                      ? (test.myScore as number)
                      : activeSkill === 'READING'
                        ? rawToReadingBand(test.myScore as number)
                        : rawToListeningBand(test.myScore as number);
                    const color = getBandColor(band);
                    return (
                      <View
                        style={[
                          acc.bandPill,
                          { backgroundColor: color + '18', borderColor: color },
                        ]}
                      >
                        <Text style={[acc.bandPillLabel, { color }]}>Band</Text>
                        <Text style={[acc.bandPillScore, { color }]}>{band.toFixed(1)}</Text>
                      </View>
                    );
                  })()
                ) : (
                  <Text style={acc.notAttempted}>Not tried</Text>
                )}
                <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const acc = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, gap: SPACING.md },
  cover: { width: 48, height: 66, borderRadius: RADIUS.sm },
  coverPlaceholder: {
    width: 48,
    height: 66,
    borderRadius: RADIUS.sm,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  coverPlaceholderText: {
    fontSize: 8,
    fontFamily: FONTS.bold,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 11,
  },
  headerInfo: { flex: 1 },
  groupTitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 6,
    lineHeight: 18,
  },
  stats: { flexDirection: 'row', gap: SPACING.sm, marginBottom: 6 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statText: { fontSize: 10, color: COLORS.textSecondary },
  progressTrack: { height: 4, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  testRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  testLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  testNumBadge: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testNum: { fontSize: FONT_SIZES.md, fontWeight: '800' },
  testTitle: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold, color: COLORS.text },
  testMeta: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 1 },
  testRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  myScore: { alignItems: 'flex-end' },
  myScoreLabel: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '600' },
  myScoreValue: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold, color: COLORS.success },
  notAttempted: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, fontStyle: 'italic' },
  bandPill: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    minWidth: 56,
  },
  bandPillLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  bandPillScore: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold, lineHeight: 20 },
});

export default function IntensiveScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ skill?: string }>();
  const [activeSkill, setActiveSkill] = useState(params.skill || 'LISTENING');
  const [catalog, setCatalog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

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

  useEffect(() => {
    fetchCatalog(activeSkill);
  }, [activeSkill]);

  // Reset filters when skill changes
  useEffect(() => {
    setSearch('');
    setStatusFilter('all');
  }, [activeSkill]);

  const filteredGroups = useMemo(() => {
    const rawGroups: any[] = catalog?.groups ?? [];
    const q = search.trim().toLowerCase();
    return rawGroups
      .map((g: any) => {
        const titleMatch = !q || g.title?.toLowerCase().includes(q);
        const filteredTests = g.tests.filter((t: any) => {
          const taken = (t.myScore ?? 0) > 0;
          if (statusFilter === 'taken' && !taken) return false;
          if (statusFilter === 'not-taken' && taken) return false;
          if (q && !titleMatch) {
            // match individual test by number
            return String(t.testNumber).includes(q);
          }
          return true;
        });
        return filteredTests.length > 0 ? { ...g, tests: filteredTests } : null;
      })
      .filter(Boolean);
  }, [catalog, search, statusFilter]);

  const hasActiveFilter = search !== '' || statusFilter !== 'all';
  const totalVisible = filteredGroups.reduce((s: number, g: any) => s + g.tests.length, 0);

  // Accordion state: groupId -> collapsed boolean (all start expanded)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = useCallback((id: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const skillInfo = SKILLS.find((s) => s.key === activeSkill)!;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mock Tests</Text>
        <TouchableOpacity
          style={styles.customBtn}
          onPress={() => router.push('/ielts/intensive/custom' as any)}
          activeOpacity={0.8}
        >
          <Ionicons name="construct-outline" size={15} color="#fff" />
          <Text style={styles.customBtnText}>Custom</Text>
        </TouchableOpacity>
      </View>

      {/* Skill tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabs}
        contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm }}
      >
        {SKILLS.map((s) => (
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
        <>
          {/* Search bar */}
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Ionicons
                name="search-outline"
                size={16}
                color={COLORS.textMuted}
                style={{ marginRight: 6 }}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search tests…"
                placeholderTextColor={COLORS.textMuted}
                value={search}
                onChangeText={setSearch}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
            </View>
            {hasActiveFilter && (
              <TouchableOpacity
                onPress={() => {
                  setSearch('');
                  setStatusFilter('all');
                }}
                style={styles.clearBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.clearBtnText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Status filter chips */}
          <View style={styles.filterRow}>
            {(['all', 'taken', 'not-taken'] as StatusFilter[]).map((f) => {
              const labels: Record<StatusFilter, string> = {
                all: 'All',
                taken: '✓ Taken',
                'not-taken': '○ Not Taken',
              };
              const active = statusFilter === f;
              const color =
                f === 'taken' ? '#16a34a' : f === 'not-taken' ? COLORS.textMuted : skillInfo.color;
              return (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.filterChip,
                    active && { backgroundColor: color + '18', borderColor: color },
                  ]}
                  onPress={() => setStatusFilter(f)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.filterChipText, active && { color, fontFamily: FONTS.bold }]}
                  >
                    {labels[f]}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {hasActiveFilter && (
              <Text style={styles.resultCount}>
                {totalVisible} test{totalVisible !== 1 ? 's' : ''}
              </Text>
            )}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchCatalog(activeSkill);
                }}
              />
            }
            contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: 100 }}
          >
            {filteredGroups.length === 0 ? (
              <EmptyState
                icon={hasActiveFilter ? '🔍' : '📭'}
                title={hasActiveFilter ? 'No matches' : 'No tests available'}
                subtitle={
                  hasActiveFilter
                    ? 'Try adjusting your search or filter.'
                    : `No ${skillInfo.label} tests found.`
                }
              />
            ) : (
              filteredGroups.map((group: any) => (
                <AccordionGroup
                  key={group.id}
                  group={group}
                  isCollapsed={collapsedGroups[group.id] ?? false}
                  onToggle={() => toggleGroup(group.id)}
                  skillColor={skillInfo.color}
                  activeSkill={activeSkill}
                  onTestPress={(examId: string) => router.push(`/ielts/intensive/${examId}` as any)}
                />
              ))
            )}
          </ScrollView>
        </>
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
    paddingVertical: SPACING.xxxl,
  },
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
  customBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  customBtnText: { color: '#fff', fontSize: 12, fontFamily: FONTS.bold },
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
  testNumBadge: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testNum: { fontSize: FONT_SIZES.md, fontWeight: '800' },
  testTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text },
  testMeta: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 1 },
  testRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  myScore: { alignItems: 'flex-end' },
  myScoreLabel: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '600' },
  myScoreValue: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.success },
  notAttempted: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, fontStyle: 'italic' },
  // Search + filter
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    height: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, height: 40 },
  clearBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
  },
  clearBtnText: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.bold, color: COLORS.textSecondary },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
  },
  filterChipText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  resultCount: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginLeft: 'auto' as any },
});
