import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES, ROUTES } from '@/constants';
import { ieltsAdvancedApi } from '@/services/ielts.api';
import { EmptyState } from '@/components/ui';
import { getQuestionTypeLabel } from '@/constants/ieltsQuestionTypes';

const TABS = [
  { key: 'listening', label: '🎧 Listening', color: COLORS.skill.listening },
  { key: 'reading', label: '📖 Reading', color: COLORS.skill.reading },
  { key: 'writing', label: '✍️ Writing', color: COLORS.skill.writing },
  { key: 'speaking', label: '🗣️ Speaking', color: COLORS.skill.speaking },
];

export default function AdvancedScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'listening' | 'reading' | 'writing' | 'speaking'>('listening');
  const [listeningParts, setListeningParts] = useState<any[]>([]);
  const [readingParts, setReadingParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [lisRes, readRes] = await Promise.allSettled([
        ieltsAdvancedApi.getListeningParts(),
        ieltsAdvancedApi.getReadingParts(),
      ]);
      if (lisRes.status === 'fulfilled') setListeningParts(lisRes.value);
      if (readRes.status === 'fulfilled') setReadingParts(readRes.value);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Reset filter when switching tabs
  const handleTabChange = (tab: 'listening' | 'reading' | 'writing' | 'speaking') => {
    if (tab === 'writing') {
      router.push('/ielts/advanced/writing');
      return;
    }
    if (tab === 'speaking') {
      router.push('/ielts/advanced/speaking');
      return;
    }
    setActiveTab(tab);
    setSelectedType(null);
  };

  const allParts = activeTab === 'listening' ? listeningParts : readingParts;
  const color = TABS.find((t) => t.key === activeTab)?.color || COLORS.primary;

  // Collect unique question types across all parts for this tab
  const availableTypes = useMemo(() => {
    const set = new Set<string>();
    allParts.forEach((p) => (p.questionTypes || []).forEach((qt: string) => set.add(qt)));
    return Array.from(set).sort();
  }, [allParts]);

  // Client-side filter
  const parts = useMemo(
    () =>
      selectedType
        ? allParts.filter((p) => (p.questionTypes || []).includes(selectedType))
        : allParts,
    [allParts, selectedType],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Advanced Practice</Text>
        <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => router.push(ROUTES.ieltsAdvancedStatistics)}
          >
            <Ionicons name="stats-chart-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => router.push(ROUTES.ieltsAdvancedHistory)}
          >
            <Ionicons name="time-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Skill tabs */}
      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && { borderBottomColor: t.color }]}
            onPress={() => handleTabChange(t.key as any)}
          >
            <Text
              style={[
                styles.tabLabel,
                activeTab === t.key && { color: t.color, fontWeight: '700' },
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Question type filter chips */}
      {!loading && availableTypes.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {/* "All" chip */}
          <TouchableOpacity
            style={[
              styles.filterChip,
              !selectedType && { backgroundColor: color, borderColor: color },
            ]}
            onPress={() => setSelectedType(null)}
          >
            <Text style={[styles.filterChipText, !selectedType && { color: '#fff' }]}>All</Text>
          </TouchableOpacity>

          {availableTypes.map((type) => {
            const active = selectedType === type;
            return (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterChip,
                  active && { backgroundColor: color, borderColor: color },
                ]}
                onPress={() => setSelectedType(active ? null : type)}
              >
                <Text style={[styles.filterChipText, active && { color: '#fff' }]}>
                  {getQuestionTypeLabel(type)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchData();
              }}
            />
          }
        >
          {/* History banner */}
          <TouchableOpacity
            style={styles.historyBanner}
            onPress={() => router.push(ROUTES.ieltsAdvancedHistory)}
            activeOpacity={0.85}
          >
            <Ionicons name="time-outline" size={16} color={color} />
            <Text style={[styles.historyBannerText, { color }]}>View Practice History</Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color={color}
              style={{ marginLeft: 'auto' }}
            />
          </TouchableOpacity>

          {/* Active filter badge */}
          {selectedType && (
            <View
              style={[
                styles.activeFilter,
                { borderColor: color + '40', backgroundColor: color + '0C' },
              ]}
            >
              <Ionicons name="funnel" size={12} color={color} />
              <Text style={[styles.activeFilterText, { color }]}>
                Filtered: {getQuestionTypeLabel(selectedType)}
              </Text>
              <TouchableOpacity onPress={() => setSelectedType(null)} hitSlop={8}>
                <Ionicons name="close-circle" size={16} color={color} />
              </TouchableOpacity>
            </View>
          )}

          {parts.length === 0 ? (
            <EmptyState
              icon="🔍"
              title={selectedType ? 'No matching parts' : 'No practice parts yet'}
              subtitle={
                selectedType
                  ? 'Try a different question type filter.'
                  : 'Check back soon for new content.'
              }
            />
          ) : (
            parts.map((part: any) => (
              <TouchableOpacity
                key={part.id}
                style={styles.partCard}
                onPress={() => router.push(ROUTES.ieltsAdvancedSkillPart(activeTab, part.id))}
                activeOpacity={0.85}
              >
                <View style={[styles.partBadge, { backgroundColor: color + '18' }]}>
                  <Text style={[styles.partBadgeText, { color }]}>Part {part.partNumber}</Text>
                </View>
                <View style={styles.partInfo}>
                  <Text style={styles.partTitle} numberOfLines={2}>
                    {part.title}
                  </Text>
                  <View style={styles.partTypes}>
                    {(part.questionTypes || []).map((qt: string) => (
                      <TouchableOpacity
                        key={qt}
                        style={[
                          styles.qtChip,
                          selectedType === qt && {
                            backgroundColor: color + '15',
                            borderColor: color + '50',
                          },
                        ]}
                        onPress={() => setSelectedType(selectedType === qt ? null : qt)}
                      >
                        <Text
                          style={[
                            styles.qtChipText,
                            selectedType === qt && { color, fontWeight: '700' },
                          ]}
                        >
                          {qt.replace(/_/g, ' ')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))
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
  headerBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },

  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderColor: COLORS.border },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabLabel: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },

  filterScroll: { flexGrow: 0, borderBottomWidth: 1, borderColor: COLORS.border },
  filterContent: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full ?? 999,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
  },
  filterChipText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textSecondary },

  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    marginBottom: SPACING.md,
  },
  activeFilterText: { flex: 1, fontSize: FONT_SIZES.xs, fontWeight: '700' },

  partCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: SPACING.md,
  },
  partBadge: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partBadgeText: { fontSize: FONT_SIZES.xs, fontWeight: '800', textAlign: 'center' },
  partInfo: { flex: 1 },
  partTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  partTypes: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  qtChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qtChipText: { fontSize: 10, color: COLORS.textSecondary, textTransform: 'capitalize' },

  historyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  historyBannerText: { flex: 1, fontSize: FONT_SIZES.sm, fontWeight: '700' },
});
