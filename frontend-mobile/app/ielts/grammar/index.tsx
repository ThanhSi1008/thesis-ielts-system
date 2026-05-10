import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS } from '@/constants';
import { grammarApi } from '@/services/ielts.api';

// Level badge color mapping
const LEVEL_CONFIG: Record<string, { bg: string; text: string; badge: string }> = {
  Elementary:   { bg: '#EF4444', text: '#fff', badge: 'A1–A2' },
  Intermediate: { bg: '#3B82F6', text: '#fff', badge: 'B1–B2' },
  Advanced:     { bg: '#7C3AED', text: '#fff', badge: 'C1–C2' },
};

function BookCard({ book, onPress }: { book: any; onPress: () => void }) {
  const cfg = LEVEL_CONFIG[book.level] ?? { bg: COLORS.primary, text: '#fff', badge: book.level };
  const unitCount = book._count?.units ?? book.unitCount ?? 0;

  return (
    <TouchableOpacity style={bc.card} onPress={onPress} activeOpacity={0.85}>
      {/* Cambridge-style book cover */}
      <View style={[bc.cover, { backgroundColor: cfg.bg }]}>
        <Text style={bc.coverSub}>Cambridge</Text>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={bc.coverTitle}>
            {book.name?.split(' in Use')[0] ?? book.name}{'\n'}
            <Text style={bc.coverTitleIn}>in Use</Text>
          </Text>
        </View>
        <View>
          <Text style={bc.coverAuthor}>{book.author ?? 'Raymond Murphy'}</Text>
          <View style={bc.levelBadge}>
            <Text style={bc.levelBadgeText}>{cfg.badge}</Text>
          </View>
        </View>
      </View>

      {/* Card body */}
      <View style={bc.body}>
        <Text style={bc.levelLabel}>{book.level}</Text>
        <Text style={bc.bookName} numberOfLines={2}>{book.name}</Text>
        <View style={bc.metaRow}>
          <Ionicons name="layers-outline" size={12} color={COLORS.textMuted} />
          <Text style={bc.metaText}>{unitCount} units</Text>
        </View>
        <TouchableOpacity style={[bc.startBtn, { backgroundColor: cfg.bg }]} onPress={onPress}>
          <Text style={bc.startBtnText}>START LEARNING</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const bc = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: RADIUS.xl,
    overflow: 'hidden', marginBottom: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
  },
  cover: { padding: SPACING.lg, minHeight: 160, justifyContent: 'space-between' },
  coverSub: { fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textTransform: 'uppercase' },
  coverTitle: { fontSize: 26, fontFamily: FONTS.bold, color: '#fff', lineHeight: 32 },
  coverTitleIn: { fontSize: 32 },
  coverAuthor: { fontSize: 11, color: 'rgba(255,255,255,0.85)', textAlign: 'right', marginBottom: 4 },
  levelBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: RADIUS.sm, paddingHorizontal: 8, paddingVertical: 2 },
  levelBadgeText: { fontSize: 9, color: '#fff', fontFamily: FONTS.bold, textTransform: 'uppercase', letterSpacing: 1 },
  body: { padding: SPACING.lg, gap: 4 },
  levelLabel: { fontSize: 10, color: COLORS.textMuted, fontFamily: FONTS.bold, textTransform: 'uppercase', letterSpacing: 0.5 },
  bookName: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: SPACING.sm },
  metaText: { fontSize: 11, color: COLORS.textSecondary },
  startBtn: { borderRadius: RADIUS.lg, paddingVertical: 12, alignItems: 'center', marginTop: SPACING.sm },
  startBtnText: { color: '#fff', fontFamily: FONTS.bold, fontSize: FONT_SIZES.sm, letterSpacing: 0.5 },
});

export default function IeltsGrammarScreen() {
  const router = useRouter();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await grammarApi.getBooks();
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
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Grammar</Text>
          <Text style={s.headerSub}>Cambridge Grammar in Use</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          contentContainerStyle={s.scroll}
        >
          {/* Intro banner */}
          <View style={s.introBanner}>
            <Ionicons name="school-outline" size={16} color={COLORS.primary} />
            <Text style={s.introText}>
              3 books · Elementary → Advanced · Theory, examples & exercises
            </Text>
          </View>

          {/* Book cards */}
          {books.map((book) => (
            <BookCard
              key={book.id ?? book.slug}
              book={book}
              onPress={() => router.push(`/ielts/grammar/${book.slug}` as any)}
            />
          ))}

          {books.length === 0 && (
            <View style={s.center}>
              <Text style={{ fontSize: 40, marginBottom: SPACING.md }}>📚</Text>
              <Text style={s.emptyText}>No grammar books available yet.</Text>
            </View>
          )}
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
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    backgroundColor: '#fff', borderBottomWidth: 1, borderColor: COLORS.border,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold, color: COLORS.text },
  headerSub: { fontSize: 10, color: COLORS.textSecondary, marginTop: 1 },
  scroll: { padding: SPACING.lg, paddingBottom: 60 },
  introBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.primary + '0D', borderRadius: RADIUS.xl,
    padding: SPACING.md, marginBottom: SPACING.lg,
    borderLeftWidth: 3, borderLeftColor: COLORS.primary,
  },
  introText: { flex: 1, fontSize: FONT_SIZES.xs, color: COLORS.text, lineHeight: 18 },
  emptyText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, textAlign: 'center' },
});
