import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';

interface AudioPlayerProps {
  url: string;
}

export function AudioPlayer({ url }: AudioPlayerProps) {
  const player = useAudioPlayer(url);
  const status = useAudioPlayerStatus(player);

  const handlePlay = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const isLoading = !!(status.isBuffering || (!status.isLoaded && url));

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, player.playing && styles.buttonActive]}
        onPress={handlePlay}
        activeOpacity={0.7}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Text style={styles.icon}>{player.playing ? '⏸' : '▶️'}</Text>
        )}
        <Text style={[styles.label, player.playing && styles.labelActive]}>
          {isLoading ? 'Loading...' : player.playing ? 'Pause' : 'Play Audio'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buttonActive: {
    backgroundColor: COLORS.primary + '10',
    borderColor: COLORS.primary,
  },
  icon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  labelActive: {
    color: COLORS.primary,
  },
});
