import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Animated,
  ScrollView,
  Platform,
  DeviceEventEmitter,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS, FONT_SIZES, ROUTES, navigation } from '@/constants';
import { ieltsExamsApi, ieltsAdvancedApi } from '@/services';
import { Badge, ScoreBadge, toast } from '@/components/ui';
import { DataScreen, LessonListSkeleton, EmptyState, ConfirmDialog } from '@/components';
import { EmptyStates } from '@/assets/empty-states';
import { useTabBarVisibility } from '@/hooks';
import { SharedDrawer } from '@/components/ui/SharedDrawer';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getBand(score: number) {
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

const SKILL_COLOR: Record<string, string> = {
  LISTENING: COLORS.skill.listening,
  READING: COLORS.skill.reading,
  WRITING: COLORS.skill.writing,
  SPEAKING: COLORS.skill.speaking,
};

const SKILL_TABS = [
  { key: 'LISTENING', label: 'Listening', icon: 'headset-outline' },
  { key: 'READING', label: 'Reading', icon: 'book-outline' },
  { key: 'WRITING', label: 'Writing', icon: 'create-outline' },
  { key: 'SPEAKING', label: 'Speaking', icon: 'mic-outline' },
] as const;

const PART_LABEL: Record<string, Record<number, string>> = {
  LISTENING: { 1: 'Basic Conv.', 2: 'Monologue', 3: 'Discussion', 4: 'Lecture' },
  READING: { 1: 'Passage 1', 2: 'Passage 2', 3: 'Passage 3', 4: 'Passage 4' },
  WRITING: { 1: 'Task 1', 2: 'Task 2', 3: 'Part 3', 4: 'Part 4' },
  SPEAKING: { 1: 'Part 1', 2: 'Part 2', 3: 'Part 3', 4: 'Part 4' },
};

type SortKey = 'date_desc' | 'date_asc' | 'score_desc' | 'score_asc';
const SORT_OPTS: { key: SortKey; label: string }[] = [
  { key: 'date_desc', label: '📅 Newest' },
  { key: 'date_asc', label: '📅 Oldest' },
  { key: 'score_desc', label: '🏆 Highest' },
  { key: 'score_asc', label: '🏆 Lowest' },
];

// ─── Score bar for practice cards ─────────────────────────────────────────────
function ScoreBar({ score, max = 10 }: { score: number; max?: number }) {
  const pct = Math.min(100, Math.round((score / max) * 100));
  const color = pct >= 80 ? '#16a34a' : pct >= 50 ? '#D97706' : COLORS.error;
  return (
    <View style={{ gap: 2 }}>
      <View style={sb.bg}>
        <View style={[sb.fill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={[sb.label, { color }]}>
        {score}/{max}
      </Text>
    </View>
  );
}
const sb = StyleSheet.create({
  bg: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden', width: 56 },
  fill: { height: '100%', borderRadius: 3 },
  label: { fontSize: 11, fontWeight: '800', textAlign: 'right' },
});

// ─── Sort Dropdown ─────────────────────────────────────────────────────────────
function SortPicker({ value, onChange }: { value: SortKey; onChange: (k: SortKey) => void }) {
  const [open, setOpen] = useState(false);
  const curr = SORT_OPTS.find((o) => o.key === value)!;
  return (
    <View style={{ position: 'relative', zIndex: 200 }}>
      <TouchableOpacity style={sp.trigger} onPress={() => setOpen((v) => !v)} activeOpacity={0.8}>
        <Text style={sp.triggerText}>{curr.label}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={12} color={COLORS.textMuted} />
      </TouchableOpacity>
      {open && (
        <View style={sp.dropdown}>
          {SORT_OPTS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[sp.item, value === opt.key && sp.itemActive]}
              onPress={() => {
                onChange(opt.key);
                setOpen(false);
              }}
            >
              <Text
                style={[
                  sp.itemText,
                  value === opt.key && { color: COLORS.primary, fontFamily: FONTS.bold },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
const sp = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
  },
  triggerText: { fontSize: 11, fontFamily: FONTS.medium, color: COLORS.textSecondary },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    width: 140,
    marginTop: 4,
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    zIndex: 300,
  },
  item: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderColor: COLORS.border + '40',
  },
  itemActive: { backgroundColor: COLORS.primary + '0E' },
  itemText: { fontSize: FONT_SIZES.sm, color: COLORS.text },
});

// ─── History Card ──────────────────────────────────────────────────────────────
function HistoryCard({
  item,
  mode,
  onPress,
  onDelete,
  deleting,
}: {
  item: any;
  mode: 'mock' | 'practice';
  onPress: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const color = SKILL_COLOR[item.skill] ?? COLORS.primary;
  const date = new Date(item.dateTaken).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const title = (item.examTitle ?? 'Test').split(' - ')[0];
  const band = getBand(item.rawScore ?? 0);
  const mm = item.timeTaken ? String(Math.floor(item.timeTaken / 60)).padStart(2, '0') : null;
  const ss = item.timeTaken ? String(item.timeTaken % 60).padStart(2, '0') : null;

  const onLongPress = () => {
    if (item.isAdvanced) return;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    onDelete();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={hc.card}
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={450}
        activeOpacity={0.85}
      >
        <View style={[hc.stripe, { backgroundColor: color }]} />
        <View style={hc.body}>
          <View style={hc.top}>
            <View style={{ flex: 1, marginRight: SPACING.sm }}>
              <Text style={hc.title} numberOfLines={2}>
                {title}
              </Text>
              <Text style={hc.date}>{date}</Text>
            </View>
            <View style={hc.right}>
              {deleting ? (
                <ActivityIndicator size="small" color={COLORS.error} />
              ) : mode === 'mock' ? (
                <ScoreBadge band={band} />
              ) : item.isAdvanced ? (
                <ScoreBadge band={item.rawScore ?? 0} />
              ) : (
                <ScoreBar score={item.rawScore ?? 0} />
              )}
            </View>
          </View>
          <View style={hc.meta}>
            {mode === 'practice' && item.practicePart && (
              <View
                style={[hc.partBadge, { borderColor: color + '60', backgroundColor: color + '10' }]}
              >
                <Text style={[hc.partText, { color }]}>Part {item.practicePart}</Text>
              </View>
            )}
            <Badge label={item.skill} color={color} />
            {mm && (
              <Text style={hc.metaText}>
                ⏱ {mm}:{ss}
              </Text>
            )}
            {!item.isAdvanced && <Text style={hc.hint}>Hold to delete</Text>}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
const hc = StyleSheet.create({
  card: {
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
  stripe: { width: 5 },
  body: { flex: 1, padding: SPACING.md },
  top: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm },
  title: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold, color: COLORS.text },
  date: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 4 },
  right: { alignItems: 'flex-end', gap: 4, minWidth: 52 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flexWrap: 'wrap' },
  partBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: RADIUS.sm, borderWidth: 1 },
  partText: { fontSize: 11, fontWeight: '700' },
  metaText: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.medium, color: COLORS.textSecondary },
  hint: { fontSize: 10, color: COLORS.textMuted, fontStyle: 'italic', marginLeft: 'auto' },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────
type Mode = 'mock' | 'practice';

export default function HistoryScreen() {
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { handleScroll } = useTabBarVisibility();
  const flatListRef = useRef<FlatList>(null);

  // Scroll to top on active tab double press
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(
      'SCROLL_TO_TOP',
      ({ target }: { target: string }) => {
        if (target === 'ielts') {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }
      }
    );
    return () => listener.remove();
  }, []);
  const [refreshing, setRefreshing] = useState(false);
  const [mode, setMode] = useState<Mode>('mock');
  const [skill, setSkill] = useState<string>('LISTENING');
  const [activePart, setActivePart] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('date_desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);

  const insets = useSafeAreaInsets();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-280)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.spring(drawerAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
      Animated.timing(backdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  };
  const closeDrawer = () => {
    Animated.parallel([
      Animated.spring(drawerAnim, {
        toValue: -280,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }),
      Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setDrawerOpen(false));
  };
  const handleNavPress = (route: string) => {
    closeDrawer();
    if (route !== ROUTES.ieltsHistory) {
      navigation.push(route);
    }
  };

  const fetchHistory = async () => {
    try {
      const [mockHistory, writingHistory] = await Promise.all([
        ieltsExamsApi.getHistory(),
        ieltsAdvancedApi.getWritingHistory(),
      ]);
      const normalizedMock = Array.isArray(mockHistory) ? mockHistory : [];
      const normalizedWriting = (Array.isArray(writingHistory) ? writingHistory : []).map(
        (s: any) => ({
          id: s.id,
          skill: 'WRITING',
          dateTaken: s.createdAt,
          examTitle: s.prompt?.title ?? 'Writing Practice',
          practicePart: s.prompt?.taskType === 'TASK1' ? 1 : 2,
          rawScore: s.bandScore ?? null,
          totalQuestions: null,
          isAdvanced: true,
        }),
      );
      setHistory([...normalizedMock, ...normalizedWriting]);
    } catch (e) {
      if (__DEV__) console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Reset part filter when skill or mode changes
  useEffect(() => {
    setActivePart(null);
  }, [skill, mode]);

  const handleDelete = useCallback((item: any) => {
    setDeleteItem(item);
  }, []);

  const displayed = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = history.filter((h) => {
      const isMock = !h.practicePart;
      if (mode === 'mock' && !isMock) return false;
      if (mode === 'practice' && isMock) return false;
      if (h.skill !== skill) return false;
      if (mode === 'practice' && activePart !== null && h.practicePart !== activePart) return false;
      if (q && !(h.examTitle ?? '').toLowerCase().includes(q)) return false;
      return true;
    });
    return [...list].sort((a, b) => {
      switch (sort) {
        case 'date_desc':
          return new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime();
        case 'date_asc':
          return new Date(a.dateTaken).getTime() - new Date(b.dateTaken).getTime();
        case 'score_desc':
          return (b.rawScore ?? 0) - (a.rawScore ?? 0);
        case 'score_asc':
          return (a.rawScore ?? 0) - (b.rawScore ?? 0);
        default:
          return 0;
      }
    });
  }, [history, mode, skill, activePart, search, sort]);

  const handleCardPress = useCallback(
    (item: any) => {
      const id = item.id ?? item.sessionId;
      if (!id) return;
      if (item.isAdvanced && item.skill === 'WRITING') {
        navigation.push(`/ielts/advanced/writing/result/${id}`);
        return;
      }
      if (item.practicePart) {
        // Practice → advanced result
        const skillPath = item.skill?.toLowerCase() ?? 'listening';
        navigation.push(ROUTES.ieltsAdvancedSkillPartResult(skillPath, item.examId, id));
      } else {
        // Mock → intensive result
        navigation.push(ROUTES.ieltsIntensiveResult(id));
      }
    },
    [],
  );

  const totalForMode = history
    .filter((h) => (mode === 'mock' ? !h.practicePart : !!h.practicePart))
    .filter((h) => h.skill === skill).length;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Test History</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={s.headerCount}>
            {displayed.length}/{totalForMode}
          </Text>
          <TouchableOpacity onPress={openDrawer}>
            <Ionicons name="menu" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Mode Tabs: Mock / Practice */}
      <View style={s.modeTabs}>
        {(['mock', 'practice'] as Mode[]).map((m) => (
          <TouchableOpacity
            key={m}
            style={[s.modeTab, mode === m && s.modeTabActive]}
            onPress={() => setMode(m)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={m === 'mock' ? 'clipboard-outline' : 'barbell-outline'}
              size={14}
              color={mode === m ? COLORS.primary : COLORS.textMuted}
            />
            <Text style={[s.modeTabText, mode === m && s.modeTabTextActive]}>
              {m === 'mock' ? 'Mock Tests' : 'Practice'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Skill Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.skillBar}
        contentContainerStyle={s.skillBarInner}
      >
        {SKILL_TABS.map((t) => {
          const active = skill === t.key;
          const color = SKILL_COLOR[t.key];
          return (
            <TouchableOpacity
              key={t.key}
              style={[s.skillTab, active && { borderBottomColor: color, borderBottomWidth: 2.5 }]}
              onPress={() => setSkill(t.key)}
              activeOpacity={0.8}
            >
              <Ionicons name={t.icon} size={14} color={active ? color : COLORS.textMuted} />
              <Text style={[s.skillTabText, active && { color, fontFamily: FONTS.bold }]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Part filter pills — practice only */}
      {mode === 'practice' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.partBar}
          contentContainerStyle={s.partBarInner}
        >
          {[null, 1, 2, 3, 4].map((part) => {
            const active = activePart === part;
            const color = SKILL_COLOR[skill];
            const label = part === null ? 'All Parts' : `Part ${part}`;
            const sublabel = part !== null ? PART_LABEL[skill]?.[part] : undefined;
            return (
              <TouchableOpacity
                key={part ?? 'all'}
                style={[
                  s.partChip,
                  active && { backgroundColor: color + '12', borderColor: color },
                ]}
                onPress={() => setActivePart(part)}
                activeOpacity={0.8}
              >
                <Text style={[s.partChipLabel, active && { color }]}>{label}</Text>
                {sublabel && (
                  <Text style={[s.partChipSub, active && { color: color + 'CC' }]}>{sublabel}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Search + Sort */}
      <View style={s.searchRow}>
        <View style={s.searchBox}>
          <Ionicons
            name="search-outline"
            size={15}
            color={COLORS.textMuted}
            style={{ marginRight: 6 }}
          />
          <TextInput
            style={s.searchInput}
            placeholder="Search…"
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {search.length > 0 && Platform.OS === 'android' && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={15} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <SortPicker value={sort} onChange={setSort} />
      </View>

      {/* List */}
      <DataScreen
        loading={loading}
        error={null}
        empty={displayed.length === 0}
        onRetry={fetchHistory}
        skeleton={<LessonListSkeleton count={4} />}
        emptyState={
          <EmptyState
            illustration={EmptyStates.history}
            title={search ? 'No matches' : 'No history yet'}
            description={
              search
                ? `No results found for "${search}"`
                : mode === 'mock'
                  ? `No ${skill.toLowerCase()} mock tests completed.`
                  : activePart !== null
                    ? `No Part ${activePart} practice sessions.`
                    : `No ${skill.toLowerCase()} practice sessions.`
            }
            primaryAction={
              search
                ? { title: 'Clear search', onPress: () => setSearch('') }
                : {
                    title: mode === 'mock' ? 'Take a Test' : 'Start Practice',
                    onPress: () => router.push(ROUTES.ieltsIntensive),
                  }
            }
          />
        }
      >
        <FlatList
          ref={flatListRef}
          data={displayed}
          keyExtractor={(item, i) => String(item.id ?? item.sessionId ?? i)}
          contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchHistory();
              }}
              tintColor={COLORS.primary}
            />
          }
          renderItem={({ item }) => (
            <HistoryCard
              item={item}
              mode={mode}
              onPress={() => handleCardPress(item)}
              onDelete={() => handleDelete(item)}
              deleting={deletingId === (item.id ?? item.sessionId)}
            />
          )}
        />
      </DataScreen>

      <ConfirmDialog
        visible={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        variant="destructive"
        title="Delete Record"
        message={`Remove "${deleteItem?.examTitle ?? 'this test'}"? Cannot be undone.`}
        primaryAction={{
          title: 'Delete',
          onPress: async () => {
            if (!deleteItem) return;
            const id = deleteItem.id ?? deleteItem.sessionId;
            setDeletingId(id);
            try {
              await ieltsExamsApi.deleteSession(id);
              setHistory((prev) => prev.filter((h) => (h.id ?? h.sessionId) !== id));
            } catch {
              toast.error('Failed to delete. Try again.');
            } finally {
              setDeletingId(null);
              setDeleteItem(null);
            }
          },
        }}
        secondaryAction={{
          title: 'Cancel',
          onPress: () => setDeleteItem(null),
        }}
      />
      <SharedDrawer
        drawerOpen={drawerOpen}
        drawerAnim={drawerAnim}
        backdropAnim={backdropAnim}
        insetsTop={insets.top}
        onClose={closeDrawer}
        onOpen={openDrawer}
        onNavPress={handleNavPress}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 },

  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: { color: '#fff', fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold },
  headerCount: { color: '#BFDBFE', fontSize: FONT_SIZES.sm, fontFamily: FONTS.medium },

  modeTabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm + 2,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  modeTabActive: { borderBottomColor: COLORS.primary },
  modeTabText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.medium, color: COLORS.textMuted },
  modeTabTextActive: { color: COLORS.primary, fontFamily: FONTS.bold },

  skillBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 50,
  },
  skillBarInner: { flexDirection: 'row', paddingHorizontal: SPACING.md },
  skillTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  skillTabText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.medium, color: COLORS.textMuted },

  partBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 62,
  },
  partBarInner: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  partChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  partChipLabel: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold, color: COLORS.textSecondary },
  partChipSub: { fontSize: 10, color: COLORS.textMuted, fontFamily: FONTS.regular, marginTop: 1 },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 36,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontFamily: FONTS.regular,
    padding: 0,
  },
});
