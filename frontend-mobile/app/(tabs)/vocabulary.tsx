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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants';
import { vocabularyApi } from '@/services/ielts.api';

const THEME = {
  P: '#FFC600',
  FG1: '#212529',
  FG2: '#64748b',
  FG3: '#9ca3af',
  BDR: '#e5e7eb',
  SRF: '#f8f9fa',
  WH: '#ffffff',
  SAFE_TOP: 62,
};

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

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Title */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>IELTS · Lexon</Text>
          <Text style={styles.title}>Vocabulary</Text>
        </View>
        <TouchableOpacity style={styles.searchBtn}>
          <Ionicons name="search" size={17} color={THEME.FG1} />
        </TouchableOpacity>
      </View>

      {/* Count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>
          {books.length > 0 ? `${books.length} books available` : 'Loading...'}
        </Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={THEME.P} />
        </View>
      ) : (
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
          contentContainerStyle={styles.listContent}
        >
          {books.map((book, idx) => {
            const theme = BOOK_THEMES[idx % BOOK_THEMES.length];
            const pct = book.progress ?? 0;
            const started = pct > 0;
            const totalUnits = book._count?.units ?? 0;
            const wordCount = book.wordCount ?? 600;

            return (
              <View key={book.id} style={styles.card}>
                {/* Image / gradient hero */}
                <LinearGradient
                  colors={theme.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardHero}
                >
                  {/* Word count badge */}
                  <View style={styles.badge}>
                    <Ionicons name="text" size={10} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.badgeText}>{wordCount} words</Text>
                  </View>

                  <View style={styles.heroRow}>
                    {/* Icon tile */}
                    <View style={styles.iconTile}>
                      <Ionicons name="book" size={26} color="rgba(255,255,255,0.9)" />
                    </View>

                    {/* Stage + title */}
                    <View style={styles.heroTextCol}>
                      <Text style={styles.heroStage}>Stage · {theme.stage}</Text>
                      <Text style={styles.heroTitle} numberOfLines={2}>
                        {book.name}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>

                {/* Card body */}
                <View style={styles.cardBody}>
                  {started && (
                    <View style={styles.progressSection}>
                      <View style={styles.progressRow}>
                        <Text style={styles.progressLabel}>Progress</Text>
                        <Text style={styles.progressValue}>{pct}%</Text>
                      </View>
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${pct}%` }]} />
                      </View>
                    </View>
                  )}

                  <View style={styles.actionRow}>
                    <View style={styles.unitInfo}>
                      <Ionicons name="layers" size={12} color={THEME.FG3} />
                      <Text style={styles.unitText}>{totalUnits} units</Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        started ? styles.actionBtnStarted : styles.actionBtnNew,
                      ]}
                      onPress={() => router.push(`/vocabulary/${book.id}` as any)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.actionBtnText,
                          started ? styles.actionBtnTextStarted : styles.actionBtnTextNew,
                        ]}
                      >
                        {started ? 'CONTINUE' : 'START LEARNING'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.SRF },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
  },
  eyebrow: {
    fontFamily: 'Farro-Bold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: THEME.FG3,
  },
  title: {
    fontFamily: 'Farro-Bold',
    fontSize: 22,
    color: THEME.FG1,
    letterSpacing: -0.25,
    lineHeight: 24,
    marginTop: 2,
  },
  searchBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: THEME.WH,
    borderWidth: 1,
    borderColor: THEME.BDR,
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
    fontFamily: 'Farro-Bold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: THEME.FG3,
  },

  listContent: { paddingHorizontal: 16, paddingBottom: 30, gap: 12 },

  card: {
    backgroundColor: THEME.WH,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.BDR,
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
  badgeText: { fontFamily: 'Farro-Bold', fontSize: 10, color: 'rgba(255,255,255,0.92)' },
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
    fontFamily: 'Farro-Bold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 4,
  },
  heroTitle: {
    fontFamily: 'Farro-Bold',
    fontSize: 15,
    color: '#fff',
    lineHeight: 19.5,
    letterSpacing: -0.1,
  },

  cardBody: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14 },
  progressSection: { marginBottom: 10 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  progressLabel: { fontFamily: 'Farro-Bold', fontSize: 10, color: THEME.FG3 },
  progressValue: { fontFamily: 'Farro-Bold', fontSize: 10, color: THEME.FG2 },
  progressTrack: { height: 4, backgroundColor: '#f3f4f6', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: THEME.P, borderRadius: 2 },

  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  unitInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  unitText: { fontFamily: 'Farro-Medium', fontSize: 11, color: THEME.FG3 },
  actionBtn: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20 },
  actionBtnStarted: { backgroundColor: THEME.SRF, borderWidth: 1, borderColor: THEME.BDR },
  actionBtnNew: {
    backgroundColor: THEME.P,
    shadowColor: THEME.P,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  actionBtnText: { fontFamily: 'Farro-Bold', fontSize: 11, letterSpacing: 0.5 },
  actionBtnTextStarted: { color: THEME.FG2 },
  actionBtnTextNew: { color: THEME.FG1 },
});
