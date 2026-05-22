import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, ROUTES } from '@/constants';
import { grammarApi } from '@/services';
import type { FoundationGrammarBook } from '@/types';
import { DataScreen, BookListSkeleton, EmptyState } from '@/components';
import { EmptyStates } from '@/assets/empty-states';
import { useTabBarVisibility } from '@/hooks';

const LEVEL_THEMES: Record<string, { stage: string; colors: readonly [string, string] }> = {
  Elementary: { stage: 'Basic', colors: ['#10b981', '#0d9488'] },
  Intermediate: { stage: 'Medium', colors: ['#3b82f6', '#4f46e5'] },
  Advanced: { stage: 'High', colors: ['#fbbf24', '#f97316'] },
};

const FALLBACK_THEME = { stage: 'Expert', colors: ['#8b5cf6', '#6d28d9'] as const };

export default function GrammarScreen() {
  const router = useRouter();
  const [books, setBooks] = useState<FoundationGrammarBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleScroll } = useTabBarVisibility();

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await grammarApi.getBooks();
      setBooks(data);
    } catch (err) {
      setError('Unable to load grammar books. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Title */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>IELTS · Lexon</Text>
          <Text style={styles.title}>Grammar</Text>
        </View>
      </View>

      {/* Count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>
          {books.length > 0 ? `${books.length} reference books` : 'Grammar'}
        </Text>
      </View>

      <DataScreen
        loading={loading}
        error={error}
        empty={books.length === 0}
        onRetry={load}
        skeleton={<BookListSkeleton count={3} />}
        emptyState={
          <EmptyState
            illustration={EmptyStates.bookmarks}
            title="No Grammar Books"
            description="You don't have any grammar books assigned yet."
            primaryAction={{
              title: 'Try Again',
              onPress: load,
            }}
          />
        }
      >
        <ScrollView
          onScroll={handleScroll}
          scrollEventThrottle={16}
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
          contentContainerStyle={styles.listContent}
        >
          {books.map((book) => {
            const theme = LEVEL_THEMES[book.level] ?? FALLBACK_THEME;
            const totalUnits = book.unitCount ?? 0;

            return (
              <View key={book.id} style={styles.card}>
                {/* Cover Gradient */}
                <LinearGradient
                  colors={theme.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardHero}
                >
                  {/* Level Badge */}
                  <View style={styles.badge}>
                    <Ionicons name="ribbon" size={10} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.badgeText}>{book.level}</Text>
                  </View>

                  <View style={styles.heroRow}>
                    {/* Icon Tile */}
                    <View style={styles.iconTile}>
                      <Ionicons name="school" size={26} color="rgba(255,255,255,0.9)" />
                    </View>

                    {/* Info block */}
                    <View style={styles.heroTextCol}>
                      <Text style={styles.heroStage}>{book.author}</Text>
                      <Text style={styles.heroTitle} numberOfLines={2}>
                        {book.name}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>

                {/* Card body */}
                <View style={styles.cardBody}>
                  <View style={styles.actionRow}>
                    <View style={styles.unitInfo}>
                      <Ionicons name="layers" size={12} color={COLORS.gray[400]} />
                      <Text style={styles.unitText}>{totalUnits} units</Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnNew]}
                      onPress={() => router.push(ROUTES.foundationGrammarBook(book.slug))}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.actionBtnText, styles.actionBtnTextNew]}>
                        START LEARNING
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </DataScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    fontFamily: FONTS.medium,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: { color: COLORS.text, fontWeight: '700', fontSize: 13, letterSpacing: 0.5 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
  },
  eyebrow: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: COLORS.gray[400],
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.text,
    letterSpacing: -0.25,
    lineHeight: 24,
    marginTop: 2,
  },

  countRow: { paddingHorizontal: 16, paddingBottom: 8 },
  countText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: COLORS.gray[400],
  },

  listContent: { paddingHorizontal: 16, paddingBottom: 30, gap: 12 },

  card: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHero: { height: 116, justifyContent: 'center', paddingHorizontal: 18 },
  badge: {
    position: 'absolute',
    top: 10,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: { fontFamily: FONTS.bold, fontSize: 10, color: 'rgba(255,255,255,0.92)' },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconTile: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextCol: { flex: 1 },
  heroStage: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 4,
  },
  heroTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#fff',
    lineHeight: 19.5,
    letterSpacing: -0.1,
  },

  cardBody: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14 },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  unitInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  unitText: { fontFamily: FONTS.medium, fontSize: 11, color: COLORS.gray[400] },
  actionBtn: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20 },
  actionBtnNew: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  actionBtnText: { fontFamily: FONTS.bold, fontSize: 11, letterSpacing: 0.5 },
  actionBtnTextNew: { color: COLORS.text },
  emptyText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
