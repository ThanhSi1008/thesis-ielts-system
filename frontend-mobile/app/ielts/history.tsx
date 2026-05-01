import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl, TextInput, Alert,
  Animated, Platform, FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { ieltsExamsApi } from '@/services/ielts.api';
import { Badge, ScoreBadge, EmptyState } from '@/components/ui';

// ─── Band helpers ─────────────────────────────────────────────────────────────
function getBand(score: number) {
  if (score >= 39) return 9.0; if (score >= 37) return 8.5; if (score >= 35) return 8.0;
  if (score >= 32) return 7.5; if (score >= 30) return 7.0; if (score >= 26) return 6.5;
  if (score >= 23) return 6.0; if (score >= 18) return 5.5; if (score >= 16) return 5.0;
  if (score >= 13) return 4.5; if (score >= 10) return 4.0; return 1.0;
}

const SKILL_COLOR: Record<string, string> = {
  LISTENING: '#E11D48', READING: '#2563EB', WRITING: '#D97706', SPEAKING: '#7C3AED',
};

const SKILL_FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'LISTENING', label: 'Listening' },
  { key: 'READING', label: 'Reading' },
  { key: 'WRITING', label: 'Writing' },
  { key: 'SPEAKING', label: 'Speaking' },
];

type SortKey = 'date_desc' | 'date_asc' | 'band_desc' | 'band_asc';
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'date_desc', label: '📅 Newest first' },
  { key: 'date_asc',  label: '📅 Oldest first' },
  { key: 'band_desc', label: '🏆 Highest band' },
  { key: 'band_asc',  label: '🏆 Lowest band' },
];

// ─── Animated history card ────────────────────────────────────────────────────
function HistoryCard({
  item,
  onPress,
  onDelete,
  deleting,
}: {
  item: any;
  onPress: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const onLongPress = useCallback(() => {
    // Pulse animation on long press
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onDelete();
  }, [onDelete, scaleAnim]);

  useEffect(() => {
    if (deleting) {
      Animated.timing(opacityAnim, { toValue: 0.4, duration: 200, useNativeDriver: true }).start();
    } else {
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    }
  }, [deleting, opacityAnim]);

  const band = getBand(item.rawScore ?? 0);
  const color = SKILL_COLOR[item.skill] ?? COLORS.primary;
  const date = new Date(item.dateTaken).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
  const title = item.examTitle?.split(' - ')[0] ?? item.examTitle ?? 'Mock Test';
  const subtitle = item.examTitle?.split(' - ')[1];
  const mm = item.timeTaken ? String(Math.floor(item.timeTaken / 60)).padStart(2, '0') : null;
  const ss = item.timeTaken ? String(item.timeTaken % 60).padStart(2, '0') : null;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }}>
      <TouchableOpacity
        style={cs.card}
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={450}
        activeOpacity={0.85}
      >
        <View style={[cs.stripe, { backgroundColor: color }]} />
        <View style={cs.body}>
          <View style={cs.top}>
            <View style={{ flex: 1, marginRight: SPACING.sm }}>
              <Text style={cs.title} numberOfLines={2}>{title}</Text>
              {subtitle && <Text style={cs.subtitle} numberOfLines={1}>{subtitle}</Text>}
              <Text style={cs.date}>{date}</Text>
            </View>
            <View style={cs.right}>
              {deleting
                ? <ActivityIndicator size="small" color={COLORS.error} />
                : <ScoreBadge band={band} />
              }
              {!deleting && (
                <Text style={cs.rawScore}>{item.rawScore ?? 0}/40</Text>
              )}
            </View>
          </View>
          <View style={cs.meta}>
            <Badge label={item.skill} color={color} />
            {mm && <Text style={cs.metaText}>⏱ {mm}:{ss}</Text>}
            {item.difficulty && <Text style={cs.metaText}>📊 {item.difficulty}</Text>}
            <Text style={cs.hint}>Hold to delete</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const cs = StyleSheet.create({
  card: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: RADIUS.xl,
    marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  stripe: { width: 5 },
  body: { flex: 1, padding: SPACING.md },
  top: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm },
  title: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold, color: COLORS.text },
  subtitle: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.medium, color: COLORS.textSecondary, marginTop: 1 },
  date: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.regular, color: COLORS.textMuted, marginTop: 4 },
  right: { alignItems: 'flex-end', gap: 4, minWidth: 48 },
  rawScore: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontFamily: FONTS.bold },
  meta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flexWrap: 'wrap' },
  metaText: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.medium, color: COLORS.textSecondary },
  hint: { fontSize: 10, color: COLORS.textMuted, fontStyle: 'italic', marginLeft: 'auto' },
});

// ─── Sort Dropdown ────────────────────────────────────────────────────────────
function SortPicker({
  value, onChange,
}: {
  value: SortKey;
  onChange: (k: SortKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = SORT_OPTIONS.find(o => o.key === value)!;

  return (
    <View style={sp.wrapper}>
      <TouchableOpacity style={sp.trigger} onPress={() => setOpen(v => !v)} activeOpacity={0.8}>
        <Text style={sp.triggerText}>{current.label}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={14} color={COLORS.textSecondary} />
      </TouchableOpacity>
      {open && (
        <View style={sp.dropdown}>
          {SORT_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[sp.option, value === opt.key && sp.optionActive]}
              onPress={() => { onChange(opt.key); setOpen(false); }}
            >
              <Text style={[sp.optionText, value === opt.key && sp.optionTextActive]}>
                {opt.label}
              </Text>
              {value === opt.key && <Ionicons name="checkmark" size={14} color={COLORS.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const sp = StyleSheet.create({
  wrapper: { position: 'relative', zIndex: 100 },
  trigger: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: '#fff',
  },
  triggerText: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.medium, color: COLORS.textSecondary },
  dropdown: {
    position: 'absolute', top: '100%', right: 0, width: 180, marginTop: 4,
    backgroundColor: '#fff', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8,
    overflow: 'hidden',
  },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: 10 },
  optionActive: { backgroundColor: COLORS.primary + '0E' },
  optionText: { fontSize: FONT_SIZES.sm, color: COLORS.text },
  optionTextActive: { color: COLORS.primary, fontFamily: FONTS.bold },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function HistoryScreen() {
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('date_desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      const data = await ieltsExamsApi.getHistory();
      setHistory(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleDelete = useCallback((item: any) => {
    Alert.alert(
      'Delete Test Record',
      `Remove "${item.examTitle ?? 'this test'}" from history? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(item.sessionId ?? item.id);
            try {
              await ieltsExamsApi.deleteSession(item.sessionId ?? item.id);
              setHistory(prev => prev.filter(h => (h.sessionId ?? h.id) !== (item.sessionId ?? item.id)));
            } catch {
              Alert.alert('Error', 'Failed to delete. Please try again.');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  }, []);

  const displayed = useMemo(() => {
    let list = history;

    // Skill filter
    if (filter !== 'ALL') {
      list = list.filter(h => h.skill === filter);
    }

    // Search filter (title or date string)
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(h =>
        (h.examTitle ?? '').toLowerCase().includes(q) ||
        (h.skill ?? '').toLowerCase().includes(q),
      );
    }

    // Sort
    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'date_desc': return new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime();
        case 'date_asc':  return new Date(a.dateTaken).getTime() - new Date(b.dateTaken).getTime();
        case 'band_desc': return (b.rawScore ?? 0) - (a.rawScore ?? 0);
        case 'band_asc':  return (a.rawScore ?? 0) - (b.rawScore ?? 0);
        default: return 0;
      }
    });

    return list;
  }, [history, filter, search, sort]);

  const handleCardPress = useCallback((item: any) => {
    const id = item.sessionId ?? item.id;
    if (id) {
      router.push(`/ielts/intensive/result/${id}` as any);
    }
  }, [router]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test History</Text>
        <View style={styles.headerRight}>
          <Text style={styles.headerCount}>
            {displayed.length}{filter !== 'ALL' || search ? `/${history.length}` : ''} tests
          </Text>
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={COLORS.textMuted} style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title or skill…"
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {search.length > 0 && Platform.OS === 'android' && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <SortPicker value={sort} onChange={setSort} />
      </View>

      {/* Skill filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, gap: SPACING.sm }}
      >
        {SKILL_FILTERS.map(f => {
          const active = filter === f.key;
          const color = SKILL_COLOR[f.key] ?? COLORS.primary;
          return (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.chip,
                active && { backgroundColor: (f.key === 'ALL' ? COLORS.primary : color), borderColor: 'transparent' },
              ]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, active && { color: '#fff' }]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={(item, i) => String(item.sessionId ?? item.id ?? i)}
          contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 120 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchHistory(); }}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="📋"
              title={search ? 'No matches found' : 'No tests found'}
              subtitle={
                search
                  ? `No results for "${search}"`
                  : filter === 'ALL'
                  ? 'Complete a mock test to see history.'
                  : `No ${filter.toLowerCase()} tests yet.`
              }
              action={
                search
                  ? { label: 'Clear search', onPress: () => setSearch('') }
                  : { label: 'Take a Test', onPress: () => router.push('/ielts/intensive' as any) }
              }
            />
          }
          renderItem={({ item }) => (
            <HistoryCard
              item={item}
              onPress={() => handleCardPress(item)}
              onDelete={() => handleDelete(item)}
              deleting={deletingId === (item.sessionId ?? item.id)}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Header
  header: {
    backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  headerTitle: { color: '#fff', fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold },
  headerRight: {},
  headerCount: { color: '#BFDBFE', fontSize: FONT_SIZES.sm, fontFamily: FONTS.medium },

  // Search
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    backgroundColor: '#fff', borderBottomWidth: 1, borderColor: COLORS.border,
  },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md, borderWidth: 1, borderColor: COLORS.border, height: 38,
  },
  searchInput: {
    flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text,
    fontFamily: FONTS.regular, padding: 0,
  },

  // Filter chips
  filterBar: { maxHeight: 52, borderBottomWidth: 1, borderColor: COLORS.border, backgroundColor: '#fff' },
  chip: {
    paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.full,
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: '#fff',
  },
  chipText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.medium, color: COLORS.textSecondary },
});
