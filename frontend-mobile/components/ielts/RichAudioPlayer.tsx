import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface Props {
  audioUrl: string;
  accentColor?: string;
  style?: ViewStyle;
}

export default function RichAudioPlayer({ audioUrl, accentColor = COLORS.primary, style }: Props) {
  const player = useAudioPlayer(audioUrl, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);

  const position = status.currentTime ?? 0;
  const duration = status.duration ?? 0;

  const togglePlayback = useCallback(() => {
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  }, [status.playing, player]);

  const skip = useCallback((delta: number) => {
    const next = Math.max(0, Math.min(duration, position + delta));
    player.seekTo(next);
  }, [position, duration, player]);

  const onSlidingComplete = useCallback((value: number) => {
    player.seekTo(value);
  }, [player]);

  return (
    <View style={[styles.container, { borderColor: accentColor + '30', backgroundColor: accentColor + '08' }, style]}>
      {/* Time + controls row */}
      <View style={styles.controlsRow}>
        {/* Skip back */}
        <TouchableOpacity onPress={() => skip(-5)} style={styles.iconBtn} hitSlop={8}>
          <Ionicons name="play-back" size={22} color={accentColor} />
          <Text style={[styles.skipLabel, { color: accentColor }]}>5</Text>
        </TouchableOpacity>

        {/* Play / Pause */}
        <TouchableOpacity onPress={togglePlayback} style={styles.playBtn} activeOpacity={0.8}>
          <View style={[styles.playCircle, { backgroundColor: accentColor }]}>
            <Ionicons
              name={status.playing ? 'pause' : 'play'}
              size={24}
              color="#fff"
              style={status.playing ? undefined : { marginLeft: 3 }}
            />
          </View>
        </TouchableOpacity>

        {/* Skip forward */}
        <TouchableOpacity onPress={() => skip(5)} style={styles.iconBtn} hitSlop={8}>
          <Ionicons name="play-forward" size={22} color={accentColor} />
          <Text style={[styles.skipLabel, { color: accentColor }]}>5</Text>
        </TouchableOpacity>

        {/* Time display */}
        <Text style={[styles.timeText, { color: accentColor }]}>
          {formatTime(position)} / {formatTime(duration)}
        </Text>
      </View>

      {/* Seekbar */}
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={duration > 0 ? duration : 1}
        value={position}
        onSlidingComplete={onSlidingComplete}
        minimumTrackTintColor={accentColor}
        maximumTrackTintColor={accentColor + '30'}
        thumbTintColor={accentColor}
      />

      {/* Status label */}
      {status.playing && (
        <Text style={[styles.statusLabel, { color: accentColor }]}>Playing…</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
    gap: 4,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  skipLabel: {
    fontSize: 9,
    fontWeight: '800',
    position: 'absolute',
    bottom: -4,
  },
  playBtn: {
    flex: 0,
  },
  playCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  timeText: {
    flex: 1,
    textAlign: 'right',
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  slider: {
    width: '100%',
    height: 32,
  },
  statusLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: -4,
  },
});
