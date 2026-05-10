import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS } from '@/constants';
import { vocabularyApi } from '@/services/ielts.api';

// Color per book order
const BOOK_COLORS = ['#E11D48', '#2563EB', '#D97706', '#059669', '#7C3AED', '#DB2777'];
const BOOK_EMOJIS = ['📘', '📗', '📙', '📕', '📓', '📔'];

function getBandLabel(index: number) {
  const bands = ['Beginner', 'Elementary', 'Pre-Int', 'Intermediate', 'Upper-Int', 'Advanced'];
  return bands[index] ?? `Book ${index + 1}`;
}

export default function VocabularyScreen() {
  const router = useRouter();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Vocabulary</Text>
          <Text style={s.headerSub}>4000 Essential English Words</Text>
        </View>
        <View style={s.headerIcon}>
          <Text style={{ fontSize: 24 }}>📚</Text>
        </View>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          contentContainerStyle={s.scroll}
        >
          {/* Series intro */}
          <View style={s.introBanner}>
            <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
            <Text style={s.introText}>
              6 books · 600 words each · Reading, exercises & flashcards per unit
            </Text>
          </View>

          {/* Book grid */}
          <View style={s.grid}>
            {books.map((book, idx) => {
              const color = BOOK_COLORS[idx % BOOK_COLORS.length];
              const emoji = BOOK_EMOJIS[idx % BOOK_EMOJIS.length];
              const totalUnits = book._count?.units ?? 0;
              return (
                <TouchableOpacity
                  key={book.id}
                  style={s.bookCard}
                  onPress={() => router.push(`/vocabulary/${book.id}` as any)}
                  activeOpacity={0.85}
                >
                  {/* Cover */}
                  {book.imageUrl ? (
                    <Image source={{ uri: book.imageUrl }} style={s.cover} resizeMode="cover" />
                  ) : (
                    <View style={[s.coverPlaceholder, { backgroundColor: color }]}>
                      <Text style={s.coverEmoji}>{emoji}</Text>
                      <Text style={s.coverLabel}>Book {idx + 1}</Text>
                    </View>
                  )}
                  {/* Info */}
                  <View style={s.bookInfo}>
                    <Text style={s.bookLevel}>{getBandLabel(idx)}</Text>
                    <Text style={s.bookName} numberOfLines={2}>{book.name}</Text>
                    <View style={s.bookMeta}>
                      <View style={s.metaPill}>
                        <Ionicons name="book-outline" size={10} color={COLORS.textMuted} />
                        <Text style={s.metaText}>{totalUnits} units</Text>
                      </View>
                      <View style={s.metaPill}>
                        <Ionicons name="text-outline" size={10} color={COLORS.textMuted} />
                        <Text style={s.metaText}>{book.wordCount ?? 600} words</Text>
                      </View>
                    </View>
                  </View>
                  {/* Arrow */}
                  <View style={[s.arrowBadge, { backgroundColor: color + '18' }]}>
                    <Ionicons name="chevron-forward" size={14} color={color} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    backgroundColor: '#fff', borderBottomWidth: 1, borderColor: COLORS.border,
  },
  headerTitle: { fontSize: FONT_SIZES.xl, fontFamily: FONTS.bold, color: COLORS.text },
  headerSub: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  headerIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: SPACING.lg, paddingBottom: 60 },
  introBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.primary + '0D', borderRadius: RADIUS.xl,
    padding: SPACING.md, marginBottom: SPACING.lg,
    borderLeftWidth: 3, borderLeftColor: COLORS.primary,
  },
  introText: { flex: 1, fontSize: FONT_SIZES.xs, color: COLORS.text, lineHeight: 18 },
  grid: { gap: SPACING.md },
  bookCard: {
    backgroundColor: '#fff', borderRadius: RADIUS.xl, overflow: 'hidden',
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cover: { width: 72, height: 90 },
  coverPlaceholder: {
    width: 72, height: 90, alignItems: 'center', justifyContent: 'center',
  },
  coverEmoji: { fontSize: 24 },
  coverLabel: { fontSize: 10, color: '#fff', fontFamily: FONTS.bold, marginTop: 4 },
  bookInfo: { flex: 1, padding: SPACING.md, gap: 3 },
  bookLevel: { fontSize: 10, fontFamily: FONTS.bold, color: COLORS.textMuted, letterSpacing: 0.5, textTransform: 'uppercase' },
  bookName: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold, color: COLORS.text, lineHeight: 18 },
  bookMeta: { flexDirection: 'row', gap: SPACING.sm, marginTop: 4 },
  metaPill: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 10, color: COLORS.textMuted },
  arrowBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
});
