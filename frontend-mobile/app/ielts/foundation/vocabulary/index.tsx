import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Animated, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, ROUTES, navigation } from '@/constants';
import { vocabularyApi } from '@/services/ielts.api';
import { DataScreen, BookListSkeleton, EmptyState, Card, ProgressBar, Chip, Text } from '@/components';
import { EmptyStates } from '@/assets/empty-states';
import { useTabBarVisibility } from '@/hooks';
import { useTheme } from '@/contexts/ThemeContext';
import { SharedDrawer } from '@/components/ui/SharedDrawer';

const BOOK_THEMES: { stage: string; colors: readonly [string, string] }[] = [
  { stage: 'Foundation', colors: ['#10b981', '#0d9488'] },
  { stage: 'Basic', colors: ['#3b82f6', '#4f46e5'] },
  { stage: 'Advanced', colors: ['#fbbf24', '#f97316'] },
  { stage: 'Intensive', colors: ['#ef4444', '#e11d48'] },
  { stage: 'Master', colors: ['#8b5cf6', '#6d28d9'] },
  { stage: 'Expert', colors: ['#ec4899', '#be185d'] },
];

export default function VocabularyScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
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
    if (route !== '/ielts/foundation/vocabulary') {
      navigation.push(route);
    }
  };

  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { handleScroll } = useTabBarVisibility();

  const load = useCallback(async () => {
    try {
      const data = await vocabularyApi.getBooks();
      setBooks(data);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Pre-assign stable stages & themes to books to prevent theme shifting
  const booksWithThemes = useMemo(() => {
    return books.map((book, idx) => {
      const theme = BOOK_THEMES[idx % BOOK_THEMES.length];
      return {
        ...book,
        theme,
        stage: theme.stage,
      };
    });
  }, [books]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={openDrawer}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Open menu drawer"
          accessibilityHint="Double tap to open the navigation menu"
        >
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text variant="caption" weight="bold" style={styles.eyebrow} allowFontScaling={true}>
            IELTS · Lexon
          </Text>
          <Text variant="title" weight="bold" style={[styles.title, { color: colors.text }]} allowFontScaling={true} accessibilityRole="header">
            Vocabulary
          </Text>
        </View>

        <View style={styles.rightActionContainer}>
          <TouchableOpacity
            style={[styles.searchBtn, { backgroundColor: colors.bgElevated, borderColor: colors.border }]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Search vocabulary"
            accessibilityHint="Double tap to search vocabulary books"
          >
            <Ionicons name="search" size={17} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Count */}
      <View style={styles.countRow}>
        <Text variant="caption" weight="bold" style={styles.countText} allowFontScaling={true}>
          {booksWithThemes.length > 0 ? `${booksWithThemes.length} books available` : 'Vocabulary'}
        </Text>
      </View>

      <DataScreen
        loading={loading}
        error={null}
        empty={booksWithThemes.length === 0}
        onRetry={load}
        skeleton={<BookListSkeleton count={3} />}
        emptyState={
          <EmptyState
            illustration={EmptyStates.bookmarks}
            title="No Vocabulary Books"
            description="You don't have any vocabulary books assigned yet."
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
          {booksWithThemes.map((book) => {
            const pct = book.progress ?? 0;
            const started = pct > 0;
            const totalUnits = book._count?.units ?? 0;
            const wordCount = book.wordCount ?? 600;

            return (
              <Card
                key={book.id}
                variant="elevated"
                onPress={() => router.push(ROUTES.foundationVocabularyBook(book.id))}
                style={[
                  styles.card,
                  {
                    padding: 0,
                    overflow: 'hidden',
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderWidth: 1,
                  },
                ]}
                accessibilityLabel={`Vocabulary book: ${book.name}. Stage: ${book.stage}. Total words: ${wordCount}. Total units: ${totalUnits}. Progress: ${pct} percent. ${started ? 'Double tap to continue learning.' : 'Double tap to start learning.'}`}
                accessibilityHint={started ? 'Continue vocabulary practice' : 'Start vocabulary practice'}
              >
                {/* Cover Image */}
                {book.imageUrl ? (
                  <Image
                    source={{ uri: book.imageUrl }}
                    style={{ width: '100%', height: 160 }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={{
                      width: '100%',
                      height: 160,
                      backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name="book" size={48} color={isDark ? '#475569' : '#cbd5e1'} />
                  </View>
                )}

                {/* Card Body */}
                <View style={{ padding: 16 }}>
                  {/* Stage Label */}
                  <Text
                    style={{
                      fontSize: 10,
                      fontFamily: FONTS.bold,
                      color: COLORS.gray[400],
                      textTransform: 'uppercase',
                      letterSpacing: 0.8,
                      marginBottom: 4,
                    }}
                    allowFontScaling={true}
                  >
                    Stage · {book.stage}
                  </Text>

                  {/* Book Title */}
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: FONTS.bold,
                      color: colors.text,
                      marginBottom: 8,
                    }}
                    numberOfLines={2}
                    allowFontScaling={true}
                  >
                    {book.name}
                  </Text>

                  {/* Word count row */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      marginBottom: 12,
                    }}
                  >
                    <Image
                      source={{
                        uri: 'https://res.cloudinary.com/dalaaegob/image/upload/v1769774878/dictionary-icon_qxfgms.png',
                      }}
                      style={{ width: 18, height: 18, opacity: 0.6 }}
                      resizeMode="contain"
                    />
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontFamily: FONTS.medium,
                        fontSize: 12,
                      }}
                      allowFontScaling={true}
                    >
                      {wordCount} words
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>•</Text>
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontFamily: FONTS.medium,
                        fontSize: 12,
                      }}
                      allowFontScaling={true}
                    >
                      {totalUnits} units
                    </Text>
                  </View>

                  {/* Progress (if started) */}
                  {started && (
                    <View style={{ marginBottom: 16 }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginBottom: 4,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontFamily: FONTS.medium,
                            color: colors.textSecondary,
                          }}
                          allowFontScaling={true}
                        >
                          Progress
                        </Text>
                        <Text
                          style={{ fontSize: 11, fontFamily: FONTS.bold, color: colors.text }}
                          allowFontScaling={true}
                        >
                          {pct}%
                        </Text>
                      </View>
                      <ProgressBar
                        value={pct}
                        height={4}
                        color="#FFC600"
                        trackColor={isDark ? '#334155' : '#E2E8F0'}
                      />
                    </View>
                  )}

                  {/* START LEARNING button */}
                  <View
                    style={{
                      backgroundColor: '#FFC600',
                      paddingVertical: 12,
                      borderRadius: 10,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: '#000000',
                        fontFamily: FONTS.bold,
                        fontSize: 12,
                        letterSpacing: 0.5,
                      }}
                      allowFontScaling={true}
                    >
                      {started ? 'CONTINUE LEARNING' : 'START LEARNING'}
                    </Text>
                  </View>
                </View>
              </Card>
            );
          })}
        </ScrollView>
      </DataScreen>
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  menuBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightActionContainer: {
    width: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: COLORS.gray[400],
    textAlign: 'center',
  },
  title: {
    fontSize: 22,
    letterSpacing: -0.25,
    lineHeight: 24,
    marginTop: 2,
    textAlign: 'center',
  },
  searchBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
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
