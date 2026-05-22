import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { radius } from '@/constants';

export interface ProgressBarProps {
  value: number;
  max?: number;
  height?: number;
  color?: string;
  trackColor?: string;
}

export default function ProgressBar({
  value,
  max = 100,
  height = 8,
  color,
  trackColor,
}: ProgressBarProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const percentage = Math.min(Math.max(0, value / max), 1);
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withTiming(percentage, { duration: 400 });
  }, [percentage]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value * 100}%`,
  }));

  const activeColor = color || colors.primary;
  const activeTrackColor = trackColor || colors.border;

  return (
    <View
      style={[
        styles.track,
        {
          height,
          borderRadius: height / 2,
          backgroundColor: activeTrackColor,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            borderRadius: height / 2,
            backgroundColor: activeColor,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

function createStyles() {
  return StyleSheet.create({
    track: {
      width: '100%',
      overflow: 'hidden',
    },
    fill: {
      position: 'absolute',
      left: 0,
      top: 0,
    },
  });
}
