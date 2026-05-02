import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { ieltsAdvancedApi } from '@/services/ielts.api';
import { Chip, EmptyState, SectionHeader } from '@/components/ui';

const TABS = [
  { key: 'listening', label: '🎧 Listening', color: '#E11D48' },
  { key: 'reading',   label: '📖 Reading',   color: '#2563EB' },
];

export default function AdvancedScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'listening' | 'reading'>('listening');
  const [listeningParts, setListeningParts] = useState<any[]>([]);
  const [readingParts, setReadingParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => { fetchData(); }, []);

  const parts = activeTab === 'listening' ? listeningParts : readingParts;
  const color = TABS.find(t => t.key === activeTab)!.color;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Advanced Practice</Text>
        <TouchableOpacity
          style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
          onPress={() => router.push('/ielts/advanced/history' as any)}
        >
          <Ionicons name="time-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && { borderBottomColor: t.color }]}
            onPress={() => setActiveTab(t.key as any)}
          >
            <Text style={[styles.tabLabel, activeTab === t.key && { color: t.color, fontWeight: '700' }]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
        >
          {/* History banner */}
          <TouchableOpacity
            style={styles.historyBanner}
            onPress={() => router.push('/ielts/advanced/history' as any)}
            activeOpacity={0.85}
          >
            <Ionicons name="time-outline" size={16} color={color} />
            <Text style={[styles.historyBannerText, { color }]}>View Practice History</Text>
            <Ionicons name="chevron-forward" size={14} color={color} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          {parts.length === 0 ? (
            <EmptyState icon="🔍" title="No practice parts yet" subtitle="Check back soon for new content." />
          ) : (
            parts.map((part: any) => (
              <TouchableOpacity
                key={part.id}
                style={styles.partCard}
                onPress={() => router.push(`/ielts/advanced/${activeTab}/${part.id}` as any)}
                activeOpacity={0.85}
              >
                <View style={[styles.partBadge, { backgroundColor: color + '18' }]}>
                  <Text style={[styles.partBadgeText, { color }]}>Part {part.partNumber}</Text>
                </View>
                <View style={styles.partInfo}>
                  <Text style={styles.partTitle} numberOfLines={2}>{part.title}</Text>
                  <View style={styles.partTypes}>
                    {(part.questionTypes || []).map((qt: string) => (
                      <View key={qt} style={styles.qtChip}>
                        <Text style={styles.qtChipText}>{qt.replace(/_/g, ' ')}</Text>
                      </View>
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
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderColor: COLORS.border },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabLabel: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
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
  partTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  partTypes: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  qtChip: { backgroundColor: COLORS.surface, paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border },
  qtChipText: { fontSize: 10, color: COLORS.textSecondary, textTransform: 'capitalize' },
  historyBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: '#fff', borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg, paddingVertical: 12,
    marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  historyBannerText: { flex: 1, fontSize: FONT_SIZES.sm, fontWeight: '700' },
});
