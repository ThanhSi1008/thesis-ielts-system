import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, ROUTES } from '@/constants';
import { grammarApi } from '@/services';
import type { FoundationGrammarBook } from '@/types';
import { DataScreen, BookListSkeleton, EmptyState, Card, ProgressBar, Chip, Text } from '@/components';
import { EmptyStates } from '@/assets/empty-states';
import { useTabBarVisibility } from '@/hooks';
import { useTheme } from '@/contexts/ThemeContext';

const LEVEL_THEMES: Record<string, { stage: string; colors: readonly [string, string] }> = {
  Elementary: { stage: 'Basic', colors: ['#10b981', '#0d9488'] },
  Intermediate: { stage: 'Medium', colors: ['#3b82f6', '#4f46e5'] },
  Advanced: { stage: 'High', colors: ['#fbbf24', '#f97316'] },
};

const FALLBACK_THEME = { stage: 'Expert', colors: ['#8b5cf6', '#6d28d9'] as const };

export default function GrammarScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [books, setBooks] = useState<FoundationGrammarBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
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

  // Filter books based on selected level chip
  const filteredBooks = useMemo(() => {
    if (selectedLevel === 'All') return books;
    return books.filter((book) => book.level === selectedLevel);
  }, [books, selectedLevel]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]} edges={['top']}>
      {/* Title */}
      <View style={styles.header}>
        <View>
          <Text variant="caption" weight="bold" style={styles.eyebrow}>
            IELTS · Lexon
          </Text>
          <Text variant="title" weight="bold" style={[styles.title, { color: colors.text }]}>
            Grammar
          </Text>
        </View>
      </View>

      {/* Count */}
      <View style={styles.countRow}>
        <Text variant="caption" weight="bold" style={styles.countText}>
          {filteredBooks.length > 0 ? `${filteredBooks.length} reference books` : 'Grammar'}
        </Text>
      </View>

      {/* Category Filter Chips */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {['All', 'Elementary', 'Intermediate', 'Advanced'].map((level) => (
            <Chip
              key={level}
              label={level}
              active={selectedLevel === level}
              onPress={() => setSelectedLevel(level)}
            />
          ))}
        </ScrollView>
      </View>

      <DataScreen
        loading={loading}
        error={error}
        empty={filteredBooks.length === 0}
        onRetry={load}
        skeleton={<BookListSkeleton count={3} />}
        emptyState={
          <EmptyState
            illustration={EmptyStates.bookmarks}
            title={selectedLevel === 'All' ? "No Grammar Books" : `No ${selectedLevel} Books`}
            description={selectedLevel === 'All'
              ? "You don't have any grammar books assigned yet."
              : `You don't have any ${selectedLevel.toLowerCase()} grammar books assigned.`}
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
              tintColor={colors.primary}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
            />
          }
          contentContainerStyle={styles.listContent}
        >
          {filteredBooks.map((book) => {
            const theme = LEVEL_THEMES[book.level] ?? FALLBACK_THEME;
            const totalUnits = book.unitCount ?? 0;
            const pct = (book as any).progress ?? 0;
            const started = pct > 0;

            return (
              <Card
                key={book.id}
                variant="gradient"
                gradientColors={theme.colors as unknown as string[]}
                onPress={() => router.push(ROUTES.foundationGrammarBook(book.slug))}
                style={styles.card}
              >
                {/* Level Badge */}
                <View style={styles.badge}>
                  <Ionicons name="ribbon" size={10} color="rgba(255,255,255,0.85)" />
                  <Text variant="caption" weight="bold" style={styles.badgeText}>
                    {book.level}
                  </Text>
                </View>

                {/* Hero section */}
                <View style={styles.heroRow}>
                  {/* Icon Tile */}
                  <View style={styles.iconTile}>
                    <Ionicons name="school" size={24} color="#ffffff" />
                  </View>

                  {/* Info block */}
                  <View style={styles.heroTextCol}>
                    <Text variant="caption" weight="bold" style={styles.heroStage}>
                      {book.author}
                    </Text>
                    <Text variant="title" weight="bold" style={styles.heroTitle} numberOfLines={2}>
                      {book.name}
                    </Text>
                  </View>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Progress (if started) */}
                {started && (
                  <View style={styles.progressSection}>
                    <View style={styles.progressRow}>
                      <Text variant="label" weight="bold" style={styles.progressLabel}>
                        Progress
                      </Text>
                      <Text variant="label" weight="bold" style={styles.progressValue}>
                        {pct}%
                      </Text>
                    </View>
                    <ProgressBar
                      value={pct}
                      height={6}
                      color="#ffffff"
                      trackColor="rgba(255,255,255,0.25)"
                    />
                  </View>
                )}

                {/* Footer action row */}
                <View style={styles.actionRow}>
                  <View style={styles.unitInfo}>
                    <Ionicons name="layers" size={14} color="rgba(255,255,255,0.85)" />
                    <Text variant="body" weight="medium" style={styles.unitText}>
                      {totalUnits} units
                    </Text>
                  </View>

                  <View style={styles.actionBtn}>
                    <Text
                      variant="label"
                      weight="bold"
                      style={[styles.actionBtnText, { color: theme.colors[1] }]}
                    >
                      {started ? 'CONTINUE' : 'START'}
                    </Text>
                    <Ionicons name="chevron-forward" size={12} color={theme.colors[1]} />
                  </View>
                </View>
              </Card>
            );
          })}
        </ScrollView>
      </DataScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
  },
  eyebrow: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: COLORS.gray[400],
  },
  title: {
    fontSize: 22,
    letterSpacing: -0.25,
    lineHeight: 24,
    marginTop: 2,
  },

  countRow: { paddingHorizontal: 16, paddingBottom: 8 },
  countText: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: COLORS.gray[400],
  },

  filterWrapper: {
    marginBottom: 8,
  },
  chipsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 4,
    gap: 8,
  },

  listContent: { paddingHorizontal: 16, paddingBottom: 30, gap: 12 },

  card: {
    marginBottom: 0,
  },
  badge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: { fontSize: 10, color: 'rgba(255,255,255,0.92)' },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 4 },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextCol: { flex: 1, paddingRight: 80 },
  heroStage: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  heroTitle: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 20,
    letterSpacing: -0.1,
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginVertical: 14,
  },

  progressSection: { marginBottom: 12 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 10, color: 'rgba(255,255,255,0.8)' },
  progressValue: { fontSize: 10, color: '#ffffff' },

  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  unitInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  unitText: { fontSize: 12, color: 'rgba(255,255,255,0.9)' },
  actionBtn: {
    backgroundColor: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtnText: { fontSize: 10, letterSpacing: 0.5 },
});
