import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS, SHADOWS } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';

interface AudioPlayerProps {
  url: string;
}

export function AudioPlayer({ url }: AudioPlayerProps) {
  const player = useAudioPlayer(url);
  const status = useAudioPlayerStatus(player);
  const [trackWidth, setTrackWidth] = React.useState(0);
  const { colors } = useTheme();

  const handlePlay = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleSeek = (event: any) => {
    const { locationX } = event.nativeEvent;
    if (trackWidth > 0 && status.duration) {
      const seekPos = (locationX / trackWidth) * status.duration;
      player.seekTo(seekPos);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isLoading = !!(status.isBuffering || (!status.isLoaded && url));
  const currentTime = status.currentTime || 0;
  const duration = status.duration || player.duration || 0;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      padding: 8,
      paddingRight: 16,
      gap: 12,
      marginVertical: SPACING.md,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    },
    playBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    progressContainer: {
      flex: 1,
      height: 24, // Larger hit area for seeking
      justifyContent: 'center',
    },
    track: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      backgroundColor: colors.primary,
    },
    timeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    currentTime: {
      fontFamily: FONTS.bold,
      fontSize: 12,
      color: colors.text,
      fontVariant: ['tabular-nums'],
    },
    duration: {
      fontFamily: FONTS.bold,
      fontSize: 12,
      color: colors.textSecondary,
      fontVariant: ['tabular-nums'],
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.playBtn}
        onPress={handlePlay}
        activeOpacity={0.8}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.text} />
        ) : (
          <Ionicons
            name={player.playing ? 'pause' : 'play'}
            size={18}
            color={colors.text}
            style={!player.playing && { marginLeft: 2 }}
          />
        )}
      </TouchableOpacity>

      <Pressable
        style={styles.progressContainer}
        onPress={handleSeek}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      >
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress}%` }]} />
        </View>
      </Pressable>

      <View style={styles.timeContainer}>
        <Text style={styles.currentTime}>{formatTime(currentTime)}</Text>
        <Text style={styles.duration}> / {formatTime(duration)}</Text>
      </View>
    </View>
  );
}
