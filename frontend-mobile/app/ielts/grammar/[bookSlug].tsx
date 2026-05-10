import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS } from '@/constants';
import { grammarApi } from '@/services/ielts.api';

const LEVEL_COLOR: Record<string, string> = {
  Elementary:   '#EF4444',
  Intermediate: '#3B82F6',
  Advanced:     '#7C3AED',
};

export default function IeltsGrammarBookScreen() {
  const router = useRouter();
  const { bookSlug } = useLocalSearchParams<{ bookSlug: string }>();

  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQ, setSearchQ] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await grammarApi.getBook(bookSlug!);
      setBook(data);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [bookSlug]);

  useEffect(() => { load(); }, [load]);

  const accentColor = LEVEL_COLOR[book?.level] ?? COLORS.primary;
  const units: any[] = book?.units ?? [];
  const filtered = searchQ
    ? units.filter((u) => u.title.toLowerCase().includes(searchQ.toLowerCase()))
    : units;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: accentColor }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle} numberOfLines={1}>
            {loading ? 'Loading…' : book?.name ?? 'Grammar'}
          </Text>
          {book?.level && <Text style={s.headerSub}>{book.level}</Text>}
        </View>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          contentContainerStyle={{ paddingBottom: 60 }}
        >
          {/* Stats row */}
          <View style={[s.statsBanner, { backgroundColor: accentColor + '12' }]}>
            <View style={s.statItem}>
              <Text style={[s.statValue, { color: accentColor }]}>{units.length}</Text>
              <Text style={s.statLabel}>Units</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={[s.statValue, { color: accentColor }]}>{book?.author ?? 'Murphy'}</Text>
              <Text style={s.statLabel}>Author</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={[s.statValue, { color: accentColor }]}>{book?.level}</Text>
              <Text style={s.statLabel}>Level</Text>
            </View>
          </View>

          {/* Unit list */}
          <View style={s.list}>
            <Text style={s.sectionTitle}>Units</Text>
            {filtered.map((unit: any, idx: number) => (
              <TouchableOpacity
                key={unit.id}
                style={s.unitRow}
                onPress={() => router.push(`/ielts/grammar/${bookSlug}/${unit.id}` as any)}
                activeOpacity={0.8}
              >
                <View style={[s.unitNum, { backgroundColor: accentColor + '18' }]}>
                  <Text style={[s.unitNumText, { color: accentColor }]}>{unit.order ?? idx + 1}</Text>
                </View>
                <Text style={s.unitTitle} numberOfLines={2}>{unit.title}</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}

            {filtered.length === 0 && (
              <View style={s.center}>
                <Text style={s.emptyText}>No units found.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold, color: '#fff' },
  headerSub: { fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  statsBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    paddingVertical: SPACING.lg, borderBottomWidth: 1, borderColor: COLORS.border,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold },
  statLabel: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: COLORS.border },
  list: { padding: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SPACING.md },
  unitRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: '#fff', borderRadius: RADIUS.xl, padding: SPACING.md, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  unitNum: { width: 36, height: 36, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  unitNumText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold },
  unitTitle: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  emptyText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
});
