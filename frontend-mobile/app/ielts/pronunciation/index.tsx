/**
 * IELTS Pronunciation — IPA Phonetic Chart (IELTS sidebar context)
 * Same chart as (tabs)/pronunciation but with IELTS header + back navigation.
 * Tapping a symbol navigates to /ielts/pronunciation/[symbol]
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS } from '@/constants';

// ─── IPA Data ────────────────────────────────────────────────────────────────
const IPA_DATA = {
  monophthongs: [
    { symbol: 'iː', word: 'sleep' },
    { symbol: 'ɪ', word: 'slip' },
    { symbol: 'ʊ', word: 'good' },
    { symbol: 'uː', word: 'food' },
    { symbol: 'e', word: 'bed' },
    { symbol: 'ə', word: 'teacher' },
    { symbol: 'ɜː', word: 'bird' },
    { symbol: 'ɔː', word: 'door' },
    { symbol: 'æ', word: 'cat' },
    { symbol: 'ʌ', word: 'up' },
    { symbol: 'ɑː', word: 'far' },
    { symbol: 'ɒ', word: 'on' },
  ],
  diphthongs: [
    { symbol: 'ɪə', word: 'here' },
    { symbol: 'eɪ', word: 'wait' },
    { symbol: 'ʊə', word: 'tourist' },
    { symbol: 'ɔɪ', word: 'boy' },
    { symbol: 'əʊ', word: 'show' },
    { symbol: 'eə', word: 'hair' },
    { symbol: 'aɪ', word: 'my' },
    { symbol: 'aʊ', word: 'cow' },
  ],
  consonants: [
    { symbol: 'p', word: 'pea', voiced: false },
    { symbol: 'b', word: 'boat', voiced: true },
    { symbol: 't', word: 'tea', voiced: false },
    { symbol: 'd', word: 'dog', voiced: true },
    { symbol: 'ʧ', word: 'cheese', voiced: false },
    { symbol: 'ʤ', word: 'june', voiced: true },
    { symbol: 'k', word: 'car', voiced: false },
    { symbol: 'g', word: 'go', voiced: true },
    { symbol: 'f', word: 'fly', voiced: false },
    { symbol: 'v', word: 'video', voiced: true },
    { symbol: 'θ', word: 'think', voiced: false },
    { symbol: 'ð', word: 'this', voiced: true },
    { symbol: 's', word: 'see', voiced: false },
    { symbol: 'z', word: 'zoo', voiced: true },
    { symbol: 'ʃ', word: 'shall', voiced: false },
    { symbol: 'ʒ', word: 'tv', voiced: true },
    { symbol: 'm', word: 'man', voiced: true },
    { symbol: 'n', word: 'now', voiced: true },
    { symbol: 'ŋ', word: 'sing', voiced: true },
    { symbol: 'h', word: 'hat', voiced: false },
    { symbol: 'l', word: 'love', voiced: true },
    { symbol: 'r', word: 'red', voiced: true },
    { symbol: 'w', word: 'wet', voiced: true },
    { symbol: 'j', word: 'yes', voiced: true },
  ],
} as const;

// ─── Symbol Cell ──────────────────────────────────────────────────────────────
function SymbolCell({
  symbol,
  word,
  bg,
  textColor = '#1a1a2e',
  onPress,
}: {
  symbol: string;
  word: string;
  bg: string;
  textColor?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.cell, { backgroundColor: bg }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[styles.cellSymbol, { color: textColor }]}>{symbol}</Text>
      <Text style={[styles.cellWord, { color: textColor }]}>{word}</Text>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function IeltsPronunciationScreen() {
  const router = useRouter();
  const go = (symbol: string) =>
    router.push(`/ielts/pronunciation/${encodeURIComponent(symbol)}` as any);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header — IELTS styled */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>🗣️ Pronunciation</Text>
          <Text style={styles.headerSub}>IPA Phonetic Chart · AI Feedback</Text>
        </View>
        {/* Tip icon */}
        <View style={styles.backBtn}>
          <Ionicons name="mic-outline" size={20} color="rgba(255,255,255,0.7)" />
        </View>
      </View>

      {/* Intro banner */}
      <View style={styles.introBanner}>
        <Ionicons name="bulb-outline" size={15} color={COLORS.primary} />
        <Text style={styles.introText}>
          Tap any symbol to practice with AI pronunciation scoring. Each symbol has example words
          and sentence drills.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Vowels */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vowels</Text>

          <Text style={styles.groupLabel}>Monophthongs</Text>
          <View style={styles.grid}>
            {IPA_DATA.monophthongs.map((item) => (
              <SymbolCell
                key={item.symbol}
                symbol={item.symbol}
                word={item.word}
                bg="#FEF08A"
                onPress={() => go(item.symbol)}
              />
            ))}
          </View>

          <Text style={[styles.groupLabel, { marginTop: SPACING.md }]}>Diphthongs</Text>
          <View style={styles.grid}>
            {IPA_DATA.diphthongs.map((item) => (
              <SymbolCell
                key={item.symbol}
                symbol={item.symbol}
                word={item.word}
                bg="#FCA5A5"
                textColor="#7f1d1d"
                onPress={() => go(item.symbol)}
              />
            ))}
          </View>
        </View>

        {/* Consonants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consonants</Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#fff', borderColor: '#D1D5DB' }]} />
            <Text style={styles.legendLabel}>Voiced</Text>
            <View
              style={[styles.legendDot, { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' }]}
            />
            <Text style={styles.legendLabel}>Unvoiced</Text>
          </View>
          <View style={styles.grid}>
            {IPA_DATA.consonants.map((item) => (
              <SymbolCell
                key={item.symbol}
                symbol={item.symbol}
                word={item.word}
                bg={item.voiced ? '#fff' : '#F3F4F6'}
                onPress={() => go(item.symbol)}
              />
            ))}
          </View>
        </View>

        {/* Stats footer */}
        <View style={styles.footer}>
          <View style={styles.footerStat}>
            <Text style={styles.footerNum}>44</Text>
            <Text style={styles.footerLabel}>Sounds</Text>
          </View>
          <View style={styles.footerDivider} />
          <View style={styles.footerStat}>
            <Text style={styles.footerNum}>132</Text>
            <Text style={styles.footerLabel}>Practice Words</Text>
          </View>
          <View style={styles.footerDivider} />
          <View style={styles.footerStat}>
            <Text style={styles.footerNum}>AI</Text>
            <Text style={styles.footerLabel}>Scoring</Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: FONT_SIZES.md, fontFamily: FONTS.bold },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: FONT_SIZES.xs, marginTop: 1 },

  introBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary + '0D',
    margin: SPACING.lg,
    marginBottom: 0,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '25',
  },
  introText: { flex: 1, fontSize: FONT_SIZES.xs, color: COLORS.text, lineHeight: 17 },

  scroll: { padding: SPACING.lg, paddingBottom: 40 },

  section: { marginBottom: SPACING.xl },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 2,
    borderColor: COLORS.primary,
  },
  groupLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.bold,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  legendDot: { width: 14, height: 14, borderRadius: 3, borderWidth: 1.5 },
  legendLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginRight: SPACING.sm },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  cell: {
    width: '21%',
    aspectRatio: 1,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cellSymbol: { fontSize: FONT_SIZES.xl, fontFamily: FONTS.bold },
  cellWord: {
    fontSize: 9,
    fontFamily: FONTS.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
    opacity: 0.75,
  },

  footer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginTop: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  footerStat: { flex: 1, alignItems: 'center' },
  footerNum: { fontSize: FONT_SIZES.xxl, fontFamily: FONTS.bold, color: COLORS.text },
  footerLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  footerDivider: { width: 1, backgroundColor: COLORS.border, marginVertical: 4 },
});
