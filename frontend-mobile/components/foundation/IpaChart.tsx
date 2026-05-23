import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { PronunciationData, SoundProgress } from '@/types';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS } from '@/constants';

interface IpaChartProps {
  sounds: PronunciationData;
  progress?: SoundProgress[];
  onSymbolPress: (symbol: string) => void;
}

interface SoundTileProps {
  symbol: string;
  word: string;
  type: 'monophthong' | 'diphthong' | 'consonant';
  voiced?: boolean;
  mastery: 'NEW' | 'PRACTICING' | 'MASTERED';
  practiceCount: number;
  onPress: () => void;
}

const SoundTile: React.FC<SoundTileProps> = ({
  symbol,
  word,
  type,
  voiced,
  mastery,
  practiceCount,
  onPress,
}) => {
  let bg = '';
  let textColor = '#1a1a2e';

  if (type === 'monophthong') {
    bg = '#FEF08A'; // yellow-200
  } else if (type === 'diphthong') {
    bg = '#FCA5A5'; // red-300
    textColor = '#7f1d1d';
  } else if (type === 'consonant') {
    bg = voiced ? '#fff' : '#F3F4F6';
  }

  return (
    <TouchableOpacity
      style={[styles.cell, { backgroundColor: bg }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[styles.cellSymbol, { color: textColor }]}>{symbol}</Text>
      <Text style={[styles.cellWord, { color: textColor }]}>{word}</Text>

      {/* Progress Indicators */}
      {mastery === 'MASTERED' && (
        <View style={[styles.badge, { backgroundColor: '#22C55E' }]}>
          <View style={styles.checkmark} />
        </View>
      )}
      {mastery === 'PRACTICING' && (
        <View style={[styles.badge, { backgroundColor: '#FB923C' }]}>
          <Text style={styles.badgeText}>{practiceCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function IpaChart({ sounds, progress, onSymbolPress }: IpaChartProps) {
  const getMastery = (symbol: string) => {
    if (!progress) return { status: 'NEW' as const, practiceCount: 0 };
    const p = progress.find((p) => p.symbol === symbol);
    return {
      status: p?.status ?? 'NEW',
      practiceCount: p?.practiceCount ?? 0,
    };
  };

  return (
    <View style={styles.container}>
      {/* Vowels */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vowels</Text>

        <Text style={styles.groupLabel}>Monophthongs</Text>
        <View style={styles.grid}>
          {sounds.monophthongs.map((item) => {
            const { status, practiceCount } = getMastery(item.symbol);
            return (
              <SoundTile
                key={item.symbol}
                symbol={item.symbol}
                word={item.word}
                type="monophthong"
                mastery={status}
                practiceCount={practiceCount}
                onPress={() => onSymbolPress(item.symbol)}
              />
            );
          })}
        </View>

        <Text style={[styles.groupLabel, { marginTop: SPACING.md }]}>Diphthongs</Text>
        <View style={styles.grid}>
          {sounds.diphthongs.map((item) => {
            const { status, practiceCount } = getMastery(item.symbol);
            return (
              <SoundTile
                key={item.symbol}
                symbol={item.symbol}
                word={item.word}
                type="diphthong"
                mastery={status}
                practiceCount={practiceCount}
                onPress={() => onSymbolPress(item.symbol)}
              />
            );
          })}
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
          {sounds.consonants.map((item) => {
            const { status, practiceCount } = getMastery(item.symbol);
            return (
              <SoundTile
                key={item.symbol}
                symbol={item.symbol}
                word={item.word}
                type="consonant"
                voiced={item.voiced}
                mastery={status}
                practiceCount={practiceCount}
                onPress={() => onSymbolPress(item.symbol)}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  section: {
    marginBottom: SPACING.xl,
  },
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
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1.5,
  },
  legendLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  cell: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cellSymbol: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
  },
  cellWord: {
    fontSize: 9,
    fontFamily: FONTS.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
    opacity: 0.75,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontFamily: FONTS.bold,
  },
  checkmark: {
    width: 6,
    height: 3,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#fff',
    transform: [{ rotate: '-45deg' }, { translateY: -1 }],
  },
});
