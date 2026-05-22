import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { SPACING, RADIUS } from '@/constants';

interface ExamAudioPlayerProps {
  isPlaying: boolean;
  volume: number;
  onVolumeChange: (vol: number) => void;
}

export function ExamAudioPlayer({ isPlaying, volume, onVolumeChange }: ExamAudioPlayerProps) {
  const { colors, isDark } = useTheme();

  const handleDecreaseVolume = () => {
    onVolumeChange(Math.max(0, volume - 0.2));
  };

  const handleIncreaseVolume = () => {
    onVolumeChange(Math.min(1, volume + 0.2));
  };

  return (
    <View
      style={[
        styles.audioBannerContainer,
        {
          backgroundColor: isDark ? colors.surface : '#EEF2FF',
          borderColor: isDark ? colors.border : '#C7D2FE',
        },
      ]}
    >
      <View style={styles.audioBanner}>
        <View
          style={[styles.audioStatusDot, { backgroundColor: isDark ? colors.border : '#C7D2FE' }]}
        >
          <View
            style={[
              styles.audioStatusDotInner,
              { backgroundColor: isDark ? colors.textMuted : '#94A3B8' },
              isPlaying && styles.audioStatusDotActive,
            ]}
          />
        </View>
        <Text style={[styles.audioLabel, { color: colors.primary }]}>
          {isPlaying ? 'Audio playing…' : 'Preparing audio…'}
        </Text>

        <View style={styles.volumeControl}>
          <TouchableOpacity
            onPress={handleDecreaseVolume}
            style={styles.volBtn}
            accessibilityLabel="Decrease volume"
            accessibilityRole="button"
          >
            <Ionicons name="volume-low" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          <View
            style={[styles.volumeTrack, { backgroundColor: isDark ? colors.border : '#C7D2FE' }]}
          >
            <View
              style={[
                styles.volumeFill,
                { backgroundColor: colors.primary, width: `${volume * 100}%` as any },
              ]}
            />
          </View>
          <TouchableOpacity
            onPress={handleIncreaseVolume}
            style={styles.volBtn}
            accessibilityLabel="Increase volume"
            accessibilityRole="button"
          >
            <Ionicons name="volume-high" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  audioBannerContainer: {
    borderBottomWidth: 1,
    height: 50,
  },
  audioBanner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  audioStatusDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioStatusDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  audioStatusDotActive: {
    backgroundColor: '#EF4444',
  },
  audioLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  volumeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  volBtn: {
    padding: 4,
  },
  volumeTrack: {
    width: 60,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    borderRadius: 3,
  },
});
