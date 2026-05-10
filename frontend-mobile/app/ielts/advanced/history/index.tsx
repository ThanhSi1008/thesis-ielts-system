import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl, TextInput, Platform,
  LayoutAnimation, UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { ieltsAdvancedApi } from '@/services/ielts.api';
import { EmptyState } from '@/components/ui';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SKILLS = [
  { key: 'LISTENING', label: 'Listening', icon: 'headset-outline' as const,  color: '#E11D48' },
  { key: 'READING',   label: 'Reading',   icon: 'book-outline' as const,      color: '#2563EB' },
  { key: 'WRITING',   label: 'Writing',   icon: 'create-outline' as const,    color: '#D97706' },
  { key: 'SPEAKING',  label: 'Speaking',  icon: 'mic-outline' as const,       color: '#7C3AED' },
];

const PART_LABEL: Record<string, Record<number, string>> = {
  LISTENING: { 1: 'Basic Conv.', 2: 'Monologue', 3: 'Discussion', 4: 'Lecture' },
  READING:   { 1: 'Passage 1',   2: 'Passage 2', 3: 'Passage 3',  4: 'Full Test' },
  WRITING:   { 1: 'Task 1',      2: 'Task 2',    3: 'Part 3',     4: 'Part 4' },
  SPEAKING:  { 1: 'Part 1',      2: 'Part 2',    3: 'Part 3',     4: 'Part 4' },
};

// ─── Session Card ─────────────────────────────────────────────────────────────
function SessionCard({ item, onPress }: { item: any; onPress: () => void }) {
  const skill = item.skill ?? 'LISTENING';
  const color = SKILLS.find(s => s.key === skill)?.color ?? COLORS.primary;
  const date = new Date(item.dateTaken).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
  const title = (item.examTitle ?? 'Practice Session').split(' - ')[0];
  const partLabel = item.practicePart ? PART_LABEL[skill]?.[item.practicePart] : null;
  const score = item.rawScore ?? null;
  const total = item.totalQuestions ?? null;
  const pct = score != null && total ? Math.round((score / total) * 100) : null;

  return (
    <TouchableOpacity style={sc.card} onPress={onPress} activeOpacity={0.85}>
      <View style={[sc.stripe, { backgroundColor: color }]} />
      <View style={sc.body}>
        <View style={sc.top}>
          <View style={{ flex: 1, marginRight: SPACING.sm }}>
            <Text style={sc.title} numberOfLines={2}>{title}</Text>
            <Text style={sc.date}>{date}</Text>
          </View>
          {score != null && (
            <View style={[sc.scoreBadge, { borderColor: color + '60', backgroundColor: color + '12' }]}>
              <Text style={[sc.scoreText, { color }]}>{score}{total != null ? `/${total}` : ''}</Text>
              {pct != null && <Text style={[sc.bandText, { color: color + 'AA' }]}>{pct}%</Text>}
            </View>
          )}
        </View>
        <View style={sc.meta}>
          {partLabel && (
            <View style={[sc.partBadge, { borderColor: color + '50', backgroundColor: color + '0D' }]}>
              <Text style={[sc.partText, { color }]}>Part {item.practicePart} · {partLabel}</Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} style={{ marginLeft: 'auto' }} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const sc = StyleSheet.create({
  card: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: RADIUS.xl,
    marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  stripe: { width: 4 },
  body: { flex: 1, padding: SPACING.md },
  top: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm },
  title: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold, color: COLORS.text },
  date: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  scoreBadge: { alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.lg, borderWidth: 1.5, minWidth: 52 },
  scoreText: { fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold, lineHeight: 24 },
  bandText: { fontSize: 9, fontFamily: FONTS.medium },
  meta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flexWrap: 'wrap' },
  partBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.sm, borderWidth: 1 },
  partText: { fontSize: 10, fontFamily: FONTS.bold },
});

// ─── Skill Section (accordion) ────────────────────────────────────────────────
function SkillSection({
  skill, items, isOpen, onToggle, onCardPress,
}: {
  skill: typeof SKILLS[0];
  items: any[];
  isOpen: boolean;
  onToggle: () => void;
  onCardPress: (item: any) => void;
}) {
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  };

  return (
    <View style={ss.container}>
      {/* Accordion header */}
      <TouchableOpacity style={[ss.header, { borderLeftColor: skill.color }]} onPress={toggle} activeOpacity={0.8}>
        <View style={[ss.iconBg, { backgroundColor: skill.color + '18' }]}>
          <Ionicons name={skill.icon} size={16} color={skill.color} />
        </View>
        <Text style={ss.label}>{skill.label}</Text>
        <View style={[ss.countBadge, { backgroundColor: skill.color + '15' }]}>
          <Text style={[ss.countText, { color: skill.color }]}>{items.length}</Text>
        </View>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={COLORS.textMuted}
        />
      </TouchableOpacity>

      {/* Sessions list */}
      {isOpen && (
        <View style={ss.body}>
          {items.length === 0 ? (
            <View style={ss.empty}>
              <Text style={ss.emptyText}>No {skill.label} sessions yet.</Text>
            </View>
          ) : (
            items.map((item, idx) => (
              <SessionCard
                key={item.id ?? item.sessionId ?? idx}
                item={item}
                onPress={() => onCardPress(item)}
              />
            ))
          )}
        </View>
      )}
    </View>
  );
}

const ss = StyleSheet.create({
  container: { marginBottom: SPACING.sm },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: '#fff', padding: SPACING.md,
    borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.border,
    borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  iconBg: { width: 32, height: 32, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1, fontSize: FONT_SIZES.md, fontFamily: FONTS.bold, color: COLORS.text },
  countBadge: { borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 2 },
  countText: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.bold },
  body: { paddingTop: SPACING.sm, paddingHorizontal: 2 },
  empty: { paddingVertical: SPACING.lg, alignItems: 'center' },
  emptyText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AdvancedHistoryScreen() {
  const router = useRouter();
  const [allHistory, setAllHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  // Track which skill sections are open (all open by default)
  const [openSkills, setOpenSkills] = useState<Set<string>>(
    new Set(SKILLS.map(s => s.key))
  );

  const load = useCallback(async () => {
    try {
      const [listening, reading] = await Promise.all([
        ieltsAdvancedApi.getListeningHistory(),
        ieltsAdvancedApi.getReadingHistory(),
      ]);
      const normalizeListening = (Array.isArray(listening) ? listening : []).map((s: any) => ({
        id: s.id,
        skill: 'LISTENING',
        partId: s.partId,
        dateTaken: s.createdAt,
        examTitle: s.part?.title ?? 'Listening Practice',
        practicePart: s.part?.partNumber ?? null,
        rawScore: s.totalScore ?? null,
        totalQuestions: s.totalQuestions ?? null,
      }));
      const normalizeReading = (Array.isArray(reading) ? reading : []).map((s: any) => ({
        id: s.id,
        skill: 'READING',
        partId: s.partId,
        dateTaken: s.createdAt,
        examTitle: s.part?.title ?? 'Reading Practice',
        practicePart: s.part?.partNumber ?? null,
        rawScore: s.totalScore ?? null,
        totalQuestions: s.totalQuestions ?? null,
      }));
      const merged = [...normalizeListening, ...normalizeReading].sort(
        (a, b) => new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime(),
      );
      setAllHistory(merged);
    } catch (err) { console.error('[AdvancedHistory] load failed:', err); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleSkill = useCallback((key: string) => {
    setOpenSkills(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const handleCardPress = useCallback((item: any) => {
    const id = item.id;
    if (!id || !item.partId) return;
    const skillPath = (item.skill ?? 'LISTENING').toLowerCase();
    router.push(`/ielts/advanced/${skillPath}/${item.partId}/result/${id}` as any);
  }, [router]);

  // Group by skill, apply search filter
  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SKILLS.map(skill => {
      const items = allHistory.filter(h => {
        if (h.skill !== skill.key) return false;
        if (q && !(h.examTitle ?? '').toLowerCase().includes(q)) return false;
        return true;
      }).sort((a, b) => new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime());
      return { skill, items };
    });
  }, [allHistory, search]);

  const totalCount = allHistory.length;
  const filteredCount = grouped.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Advanced History</Text>
          <Text style={s.headerSub}>{filteredCount}/{totalCount} sessions</Text>
        </View>
        {/* Collapse/Expand All */}
        <TouchableOpacity
          style={s.collapseBtn}
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setOpenSkills(openSkills.size > 0 ? new Set() : new Set(SKILLS.map(s => s.key)));
          }}
        >
          <Ionicons
            name={openSkills.size > 0 ? 'contract-outline' : 'expand-outline'}
            size={18}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={s.searchRow}>
        <View style={s.searchBox}>
          <Ionicons name="search-outline" size={14} color={COLORS.textMuted} />
          <TextInput
            style={s.searchInput}
            placeholder="Search sessions…"
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {search.length > 0 && Platform.OS === 'android' && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={14} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Summary pills */}
      <View style={s.summaryRow}>
        {SKILLS.map(skill => {
          const count = grouped.find(g => g.skill.key === skill.key)?.items.length ?? 0;
          return (
            <TouchableOpacity
              key={skill.key}
              style={[s.summaryPill, { borderColor: skill.color + '50', backgroundColor: skill.color + '0D' }]}
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setOpenSkills(new Set([skill.key]));
              }}
            >
              <Ionicons name={skill.icon} size={11} color={skill.color} />
              <Text style={[s.summaryText, { color: skill.color }]}>{count}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : allHistory.length === 0 ? (
        <EmptyState
          icon="🏋️"
          title="No practice sessions yet"
          subtitle="Complete an Advanced practice test to see your history here."
          action={{ label: 'Go to Advanced', onPress: () => router.push('/ielts/advanced' as any) }}
        />
      ) : (
        <FlatList
          data={grouped}
          keyExtractor={g => g.skill.key}
          contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={COLORS.primary}
            />
          }
          renderItem={({ item: g }) => (
            <SkillSection
              skill={g.skill}
              items={g.items}
              isOpen={openSkills.has(g.skill.key)}
              onToggle={() => toggleSkill(g.skill.key)}
              onCardPress={handleCardPress}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 60 },

  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: FONT_SIZES.xs, marginTop: 1 },
  collapseBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  searchRow: {
    backgroundColor: '#fff', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderBottomWidth: 1, borderColor: COLORS.border,
  },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.background, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md, borderWidth: 1, borderColor: COLORS.border, height: 36,
  },
  searchInput: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, padding: 0 },

  summaryRow: {
    flexDirection: 'row', gap: SPACING.sm,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    backgroundColor: '#fff', borderBottomWidth: 1, borderColor: COLORS.border,
  },
  summaryPill: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 5, borderRadius: RADIUS.lg, borderWidth: 1.5,
  },
  summaryText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold },
});
