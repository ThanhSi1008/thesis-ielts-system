import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS } from '@/constants';
import { grammarApi } from '@/services';
import type { GrammarBookWithUnits } from '@/types';

const LEVEL_COLOR: Record<string, string> = {
  Elementary: '#10b981',
  Intermediate: '#3b82f6',
  Advanced: '#fbbf24',
};

export default function GrammarBookScreen() {
  const router = useRouter();
  const { bookSlug } = useLocalSearchParams<{ bookSlug: string }>();

  const [book, setBook] = useState<GrammarBookWithUnits | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!bookSlug) return;
    try {
      setError(null);
      const data = await grammarApi.getBook(bookSlug);
      setBook(data);
    } catch (err) {
      setError('Unable to load book details. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [bookSlug]);

  useEffect(() => {
    load();
  }, [load]);

  const accentColor = LEVEL_COLOR[book?.level ?? ''] ?? COLORS.primary;
  const units = book?.units ?? [];

  if (loading) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <View style={s.headerContainer}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerEyebrow}>Grammar</Text>
            <Text style={s.headerTitle} numberOfLines={1}>
              Loading...
            </Text>
          </View>
        </View>
        <View style={s.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !book) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <View style={s.headerContainer}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerEyebrow}>Grammar</Text>
            <Text style={s.headerTitle} numberOfLines={1}>
              Error
            </Text>
          </View>
        </View>
        <View style={s.center}>
          <Text style={s.errorText}>{error || 'Book not found'}</Text>
          <TouchableOpacity style={s.retryButton} onPress={() => { setLoading(true); load(); }}>
            <Text style={s.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={s.container}>
      {/* Dynamic Colored Header wrapper */}
      <SafeAreaView style={[s.headerWrapper, { backgroundColor: accentColor }]} edges={['top']}>
        <View style={s.header}>
          <TouchableOpacity style={s.backBtnWhite} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={s.headerTitleCol}>
            <Text style={s.headerEyebrowWhite}>Grammar Series</Text>
            <Text style={s.headerTitleWhite} numberOfLines={1}>
              {book.name}
            </Text>
          </View>
          <View style={s.headerBadge}>
            <Text style={s.headerBadgeVal}>{units.length}</Text>
            <Text style={s.headerBadgeLbl}>UNITS</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
        contentContainerStyle={s.content}
      >
        {/* Stats banner */}
        <View style={[s.statsBanner, { backgroundColor: accentColor + '10' }]}>
          <View style={s.statItem}>
            <Text style={[s.statValue, { color: accentColor }]}>{units.length}</Text>
            <Text style={s.statLabel}>Lessons</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={[s.statValue, { color: accentColor }]}>{book.author ?? 'Raymond Murphy'}</Text>
            <Text style={s.statLabel}>Author</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={[s.statValue, { color: accentColor }]}>{book.level ?? 'General'}</Text>
            <Text style={s.statLabel}>Level</Text>
          </View>
        </View>

        {/* Unit list */}
        <View style={s.listSection}>
          <Text style={s.sectionTitle}>Course Syllabus</Text>
          {units.map((unit, idx) => (
            <TouchableOpacity
              key={unit.id}
              style={s.unitCard}
              onPress={() => router.push(`/grammar/${bookSlug}/${unit.id}`)}
              activeOpacity={0.8}
            >
              {/* Unit number badge */}
              <View style={[s.unitNumBadge, { backgroundColor: accentColor + '18' }]}>
                <Text style={[s.unitNumText, { color: accentColor }]}>
                  {unit.order ?? idx + 1}
                </Text>
              </View>

              {/* Unit title */}
              <Text style={s.unitTitle} numberOfLines={2}>
                {unit.title}
              </Text>

              <Ionicons name="chevron-forward" size={16} color={COLORS.gray[400]} />
            </TouchableOpacity>
          ))}

          {units.length === 0 && (
            <View style={s.center}>
              <Text style={s.emptyText}>No lessons available in this book yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  errorText: { color: COLORS.error, fontSize: 14, fontFamily: FONTS.medium, marginBottom: 16, textAlign: 'center' },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: { color: COLORS.text, fontWeight: '700', fontSize: 13 },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: '#fff',
  },
  headerEyebrow: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: COLORS.gray[400],
  },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.text, letterSpacing: -0.1 },

  headerWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 8,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnWhite: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleCol: { flex: 1 },
  headerCenter: { flex: 1, marginLeft: 12 },
  headerEyebrowWhite: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: 'rgba(255,255,255,0.7)',
  },
  headerTitleWhite: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#fff',
    letterSpacing: -0.1,
  },
  headerBadge: { alignItems: 'center' },
  headerBadgeVal: { fontFamily: FONTS.bold, fontSize: 14, color: '#fff' },
  headerBadgeLbl: {
    fontFamily: FONTS.regular,
    fontSize: 8,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.5,
    marginTop: 1,
  },

  content: { paddingBottom: 60 },

  statsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold },
  statLabel: { fontSize: 10, color: COLORS.textMuted, marginTop: 2, fontFamily: FONTS.medium },
  statDivider: { width: 1, height: 28, backgroundColor: COLORS.border },

  listSection: { padding: 16 },
  sectionTitle: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  unitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  unitNumBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  unitNumText: { fontSize: 13, fontFamily: FONTS.bold },
  unitTitle: { flex: 1, fontSize: 13, color: COLORS.text, fontFamily: FONTS.semibold, lineHeight: 18 },
  emptyText: { fontSize: 13, color: COLORS.textSecondary, fontFamily: FONTS.medium, textAlign: 'center', marginTop: 20 },
});
