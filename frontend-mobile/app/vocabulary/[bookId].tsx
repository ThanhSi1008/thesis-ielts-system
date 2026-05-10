import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS } from '@/constants';
import { vocabularyApi } from '@/services/ielts.api';

const BOOK_COLORS = ['#E11D48', '#2563EB', '#D97706', '#059669', '#7C3AED', '#DB2777'];

// ─── Progress ring (simple arc via border radius hack) ────────────────────────
function ProgressRing({ pct, size = 40, color }: { pct: number; size?: number; color: string }) {
  const filled = Math.round(pct * 100);
  return (
    <View style={[pr.wrap, { width: size, height: size, borderRadius: size / 2, borderColor: color + '20' }]}>
      <View style={[pr.fill, {
        width: size - 6, height: size - 6, borderRadius: (size - 6) / 2,
        borderColor: color,
        borderWidth: filled > 0 ? 2.5 : 0,
        backgroundColor: filled >= 100 ? color + '20' : 'transparent',
      }]} />
      {filled >= 100 && <Ionicons name="checkmark" size={size * 0.4} color={color} style={pr.check} />}
      {filled < 100 && (
        <Text style={[pr.text, { fontSize: size * 0.25, color }]}>{filled}%</Text>
      )}
    </View>
  );
}
const pr = StyleSheet.create({
  wrap: { borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  fill: { position: 'absolute' },
  check: { position: 'absolute' },
  text: { fontFamily: FONTS.bold, position: 'absolute' },
});

export default function VocabularyBookScreen() {
  const router = useRouter();
  const { bookId } = useLocalSearchParams<{ bookId: string }>();

  const [book, setBook] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [bookData, progressData] = await Promise.allSettled([
        vocabularyApi.getBook(bookId!),
        vocabularyApi.getProgress(bookId!),
      ]);
      if (bookData.status === 'fulfilled') setBook(bookData.value);
      if (progressData.status === 'fulfilled') setProgress(progressData.value);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [bookId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Loading…</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      </SafeAreaView>
    );
  }

  // Build a map of unitId → progress
  const progressMap: Record<string, any> = {};
  (progress?.units ?? []).forEach((u: any) => { progressMap[u.id] = u; });

  // Compute overall completion
  const units = book?.units ?? [];
  const completedCount = units.filter((u: any) => progressMap[u.id]?.isCompleted).length;
  const overallPct = units.length > 0 ? completedCount / units.length : 0;

  // Book index for color (use book order - 1 or default 0)
  const bookOrder = (book?.order ?? 1) - 1;
  const accentColor = BOOK_COLORS[bookOrder % BOOK_COLORS.length];

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: accentColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{book?.name ?? 'Vocabulary'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* Book hero */}
        <View style={[s.hero, { backgroundColor: accentColor }]}>
          {book?.imageUrl ? (
            <Image source={{ uri: book.imageUrl }} style={s.coverImg} resizeMode="cover" />
          ) : (
            <View style={[s.coverPlaceholder, { borderColor: 'rgba(255,255,255,0.4)' }]}>
              <Text style={{ fontSize: 36 }}>📚</Text>
            </View>
          )}
          <View style={s.heroInfo}>
            <Text style={s.heroStats}>{units.length} units · {book?.wordCount ?? 600} words</Text>
            <View style={s.progressBar}>
              <View style={[s.progressFill, { width: `${overallPct * 100}%`, backgroundColor: '#fff' }]} />
            </View>
            <Text style={s.progressLabel}>{completedCount}/{units.length} units completed</Text>
          </View>
        </View>

        {/* Unit list */}
        <View style={s.listWrap}>
          <Text style={s.sectionTitle}>Units</Text>
          {units.map((unit: any, idx: number) => {
            const up = progressMap[unit.id];
            const wordsLearned = up?.wordsLearned ?? 0;
            const totalWords = up?.totalWords ?? 20;
            const wordPct = totalWords > 0 ? wordsLearned / totalWords : 0;
            const isCompleted = up?.isCompleted ?? false;
            const exerciseScore = up?.exerciseScore;
            const questionScore = up?.questionScore;

            return (
              <TouchableOpacity
                key={unit.id}
                style={s.unitRow}
                onPress={() => router.push(`/vocabulary/${bookId}/${unit.id}` as any)}
                activeOpacity={0.8}
              >
                {/* Unit number */}
                <View style={[s.unitNumBadge, { backgroundColor: accentColor + '18' }]}>
                  <Text style={[s.unitNum, { color: accentColor }]}>{idx + 1}</Text>
                </View>

                {/* Info */}
                <View style={s.unitInfo}>
                  <Text style={s.unitTitle} numberOfLines={1}>{unit.title}</Text>
                  {/* Word progress bar */}
                  <View style={s.wordProgressTrack}>
                    <View style={[s.wordProgressFill, { width: `${wordPct * 100}%`, backgroundColor: accentColor }]} />
                  </View>
                  <View style={s.scoreRow}>
                    <Text style={s.scoreText}>{wordsLearned}/{totalWords} words</Text>
                    {exerciseScore != null && (
                      <View style={s.scorePill}>
                        <Text style={s.scorePillText}>Ex: {exerciseScore}%</Text>
                      </View>
                    )}
                    {questionScore != null && (
                      <View style={s.scorePill}>
                        <Text style={s.scorePillText}>Q: {questionScore}%</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Status */}
                <ProgressRing pct={wordPct} color={accentColor} size={36} />
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, color: '#fff', fontSize: FONT_SIZES.md, fontFamily: FONTS.bold, textAlign: 'center' },
  hero: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.lg,
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl,
  },
  coverImg: { width: 60, height: 84, borderRadius: RADIUS.md, borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  coverPlaceholder: {
    width: 60, height: 84, borderRadius: RADIUS.md, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.15)',
  },
  heroInfo: { flex: 1 },
  heroStats: { color: 'rgba(255,255,255,0.8)', fontSize: FONT_SIZES.xs, marginBottom: SPACING.sm },
  progressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: '100%', borderRadius: 3 },
  progressLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 10, fontFamily: FONTS.bold },
  listWrap: { padding: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SPACING.md },
  unitRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: '#fff', borderRadius: RADIUS.xl, padding: SPACING.md, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  unitNumBadge: { width: 36, height: 36, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  unitNum: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold },
  unitInfo: { flex: 1 },
  unitTitle: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: 4 },
  wordProgressTrack: { height: 4, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden', marginBottom: 3 },
  wordProgressFill: { height: '100%', borderRadius: 2 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  scoreText: { fontSize: 10, color: COLORS.textSecondary },
  scorePill: { backgroundColor: COLORS.background, borderRadius: RADIUS.full, paddingHorizontal: 6, paddingVertical: 1 },
  scorePillText: { fontSize: 9, color: COLORS.textMuted, fontFamily: FONTS.bold },
});
