import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useTheme } from '@/contexts/ThemeContext';
import { SPACING, RADIUS, FONT_SIZES } from '@/constants';

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface ExamAudioPlayerProps {
  isPlaying: boolean;
  volume: number;
  onVolumeChange: (vol: number) => void;
  mode?: 'exam' | 'practice';
  duration?: number;
  currentTime?: number;
  currentPartIndex?: number;
  totalParts?: number;
  onTogglePlay?: () => void;
  onSeek?: (pos: number) => void;
  playbackSpeed?: number;
  onPlaybackSpeedChange?: (speed: number) => void;
  onSkip?: (delta: number) => void;
  isLoading?: boolean;
}

export function ExamAudioPlayer({
  isPlaying,
  volume,
  onVolumeChange,
  mode = 'exam',
  duration = 0,
  currentTime = 0,
  currentPartIndex = 0,
  totalParts = 4,
  onTogglePlay,
  onSeek,
  playbackSpeed = 1.0,
  onPlaybackSpeedChange,
  onSkip,
  isLoading = false,
}: ExamAudioPlayerProps) {
  const { colors, isDark } = useTheme();
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    if (isPlaying && mode === 'exam') {
      const interval = setInterval(() => {
        setPulse((p) => !p);
      }, 800);
      return () => clearInterval(interval);
    } else {
      setPulse(true);
    }
  }, [isPlaying, mode]);

  const handleDecreaseVolume = () => {
    onVolumeChange(Math.max(0, volume - 0.2));
  };

  const handleIncreaseVolume = () => {
    onVolumeChange(Math.min(1, volume + 0.2));
  };

  const cycleSpeed = () => {
    if (!onPlaybackSpeedChange) return;
    const speeds = [0.75, 1.0, 1.25, 1.5];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    onPlaybackSpeedChange(speeds[nextIdx]);
  };

  const progress = duration > 0 ? currentTime / duration : 0;
  const accentColor = mode === 'exam' ? '#EF4444' : colors.primary;

  return (
    <View
      style={[
        styles.audioContainer,
        {
          backgroundColor: isDark ? colors.surface : '#EEF2FF',
          borderColor: isDark ? colors.border : '#C7D2FE',
        },
        mode === 'practice' && styles.practiceHeight,
      ]}
    >
      <View style={styles.topRow}>
        {/* Status indicator */}
        <View style={styles.statusSection}>
          <View
            style={[
              styles.audioStatusDot,
              { backgroundColor: isDark ? colors.border : '#C7D2FE' },
            ]}
          >
            <View
              style={[
                styles.audioStatusDotInner,
                { backgroundColor: '#94A3B8' },
                isPlaying && { backgroundColor: accentColor },
                isPlaying && mode === 'exam' && !pulse && { opacity: 0.3 },
              ]}
            />
          </View>
          <Text style={[styles.audioLabel, { color: isDark ? colors.text : colors.primary }]}>
            {mode === 'exam'
              ? `Listening Exam — Part ${currentPartIndex + 1}/${totalParts} playing`
              : `Listening Practice — Part ${currentPartIndex + 1}`}
          </Text>
        </View>

        {/* Playback speed (practice only) */}
        {mode === 'practice' && onPlaybackSpeedChange && (
          <TouchableOpacity
            style={[
              styles.speedBadge,
              {
                backgroundColor: isDark ? colors.border : 'rgba(59, 130, 246, 0.1)',
                borderColor: colors.border,
              },
            ]}
            onPress={cycleSpeed}
          >
            <Text style={[styles.speedText, { color: colors.primary }]}>
              {playbackSpeed.toFixed(2)}x
            </Text>
          </TouchableOpacity>
        )}

        {/* Volume controls */}
        <View style={styles.volumeControl}>
          <TouchableOpacity
            onPress={handleDecreaseVolume}
            style={styles.volBtn}
            accessibilityLabel="Decrease volume"
          >
            <Ionicons name="volume-low" size={16} color={colors.textSecondary} />
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
          >
            <Ionicons name="volume-high" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Control row for practice mode */}
      {mode === 'practice' && (
        <View style={styles.practiceControls}>
          <TouchableOpacity
            onPress={() => onSkip && onSkip(-5)}
            style={styles.iconBtn}
            hitSlop={8}
            disabled={isLoading}
          >
            <Ionicons name="play-back" size={20} color={colors.primary} />
            <Text style={[styles.skipLabel, { color: colors.primary }]}>5</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onTogglePlay}
            style={styles.playBtn}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <View style={[styles.playCircle, { backgroundColor: colors.primary }]}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={20}
                  color="#fff"
                  style={!isPlaying && { marginLeft: 2 }}
                />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onSkip && onSkip(5)}
            style={styles.iconBtn}
            hitSlop={8}
            disabled={isLoading}
          >
            <Ionicons name="play-forward" size={20} color={colors.primary} />
            <Text style={[styles.skipLabel, { color: colors.primary }]}>5</Text>
          </TouchableOpacity>

          {/* Time stamp */}
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Text>
        </View>
      )}

      {/* Seekbar Progress slider */}
      <View style={styles.progressRow}>
        {mode === 'exam' && (
          <Text style={[styles.examTimeText, { color: colors.textSecondary }]}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Text>
        )}
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration > 0 ? duration : 1}
          value={currentTime}
          disabled={mode === 'exam' || isLoading}
          onSlidingComplete={onSeek}
          minimumTrackTintColor={accentColor}
          maximumTrackTintColor={accentColor + '30'}
          thumbTintColor={mode === 'exam' ? 'transparent' : accentColor}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  audioContainer: {
    borderBottomWidth: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    gap: 4,
  },
  practiceHeight: {
    paddingVertical: SPACING.md,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flex: 1,
  },
  audioStatusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioStatusDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  audioLabel: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  volumeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  volBtn: {
    padding: 2,
  },
  volumeTrack: {
    width: 50,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 24,
  },
  slider: {
    flex: 1,
    height: 24,
  },
  examTimeText: {
    fontSize: 11,
    fontWeight: '700',
    marginRight: SPACING.sm,
    fontVariant: ['tabular-nums'],
  },
  practiceControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    paddingVertical: 2,
  },
  iconBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 24,
    height: 24,
  },
  skipLabel: {
    fontSize: 8,
    fontWeight: '800',
    position: 'absolute',
    bottom: -6,
  },
  playBtn: {
    flex: 0,
  },
  playCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  timeText: {
    flex: 1,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  speedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginRight: SPACING.md,
  },
  speedText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
