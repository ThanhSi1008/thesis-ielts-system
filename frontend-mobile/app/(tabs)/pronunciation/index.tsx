/**
 * Pronunciation Tab — IPA Phonetic Chart
 * Tap any symbol → navigates to /pronunciation/[symbol] for practice
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS } from '@/constants';

// ─── IPA Data (mirrors web) ──────────────────────────────────────────────────
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
    { symbol: 'ʒ', word: 'television', voiced: true },
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

// ─── Symbol Cell ─────────────────────────────────────────────────────────────
interface CellProps {
  symbol: string;
  word: string;
  bg: string;
  textColor?: string;
  onPress: () => void;
}
const SymbolCell = ({ symbol, word, bg, textColor = '#1a1a2e', onPress }: CellProps) => (
  <TouchableOpacity
    style={[styles.cell, { backgroundColor: bg }]}
    onPress={onPress}
    activeOpacity={0.75}
  >
    <Text style={[styles.cellSymbol, { color: textColor }]}>{symbol}</Text>
    <Text style={[styles.cellWord, { color: textColor }]}>{word}</Text>
  </TouchableOpacity>
);

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function PronunciationScreen() {
  const router = useRouter();
  const go = (symbol: string) => router.push(`/pronunciation/${encodeURIComponent(symbol)}`);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🗣️ IPA Phonetic Chart</Text>
          <Text style={styles.headerSub}>Tap any symbol to practice with AI feedback</Text>
        </View>

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

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg, paddingBottom: 40 },

  header: { marginBottom: SPACING.xl },
  headerTitle: { fontSize: FONT_SIZES.xxl, fontFamily: FONTS.bold, color: COLORS.text },
  headerSub: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 4 },

  section: { marginBottom: SPACING.xl },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  groupLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

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
});
