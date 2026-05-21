import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { COLORS } from '@/constants';

interface WaveformProps {
  isRecording: boolean;
  metering: number; // Decibel value from -160 to 0
  barCount?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Animated Waveform component that reacts to microphone metering
 */
export const Waveform: React.FC<WaveformProps> = ({ isRecording, metering, barCount = 30 }) => {
  // Normalize metering to 0-1 range
  // -160 is silence, 0 is max
  // Practical range is usually -60 to 0
  const normalizedValue = useMemo(() => {
    const min = -60;
    const max = 0;
    const val = Math.max(min, Math.min(max, metering));
    return (val - min) / (max - min);
  }, [metering]);

  return (
    <View style={styles.container}>
      <View style={styles.barContainer}>
        {Array.from({ length: barCount }).map((_, i) => (
          <WaveBar
            key={i}
            index={i}
            normalizedValue={normalizedValue}
            isRecording={isRecording}
            totalBars={barCount}
          />
        ))}
      </View>
    </View>
  );
};

interface WaveBarProps {
  index: number;
  normalizedValue: number;
  isRecording: boolean;
  totalBars: number;
}

const WaveBar: React.FC<WaveBarProps> = ({ index, normalizedValue, isRecording, totalBars }) => {
  const height = useSharedValue(4);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    if (isRecording) {
      // Add some randomness/offset based on index for a more natural look
      const offset = Math.sin(index * 0.5) * 0.2;
      const targetHeight = Math.max(4, normalizedValue * 40 * (1 + offset));

      height.value = withSpring(targetHeight, {
        damping: 15,
        stiffness: 100,
      });
      opacity.value = withTiming(0.8 + normalizedValue * 0.2);
    } else {
      height.value = withTiming(4);
      opacity.value = withTiming(0.3);
    }
  }, [isRecording, normalizedValue, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: opacity.value,
    backgroundColor: isRecording ? COLORS.primary : COLORS.border,
  }));

  return <Animated.View style={[styles.bar, animatedStyle]} />;
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  bar: {
    width: 3,
    borderRadius: 2,
  },
});

export default Waveform;
