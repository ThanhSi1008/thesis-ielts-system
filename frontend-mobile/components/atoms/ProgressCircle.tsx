import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import Text from './Text';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface ProgressCircleProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  showText?: boolean;
}

export default function ProgressCircle({
  value,
  max = 100,
  size = 64,
  strokeWidth = 6,
  color,
  trackColor,
  showText = true,
}: ProgressCircleProps) {
  const { colors } = useTheme();

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const targetPercentage = Math.min(Math.max(0, value / max), 1);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(targetPercentage, { duration: 500 });
  }, [targetPercentage]);

  const animatedCircleProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - progress.value * circumference;
    return {
      strokeDashoffset,
    };
  });

  const activeColor = color || colors.primary;
  const activeTrackColor = trackColor || colors.border;
  const textPercentage = Math.round(targetPercentage * 100);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Track circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={activeTrackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={activeColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedCircleProps}
          strokeLinecap="round"
          // Rotate Svg 90deg counter-clockwise so progress starts at 12 o'clock
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {showText && (
        <View style={styles.textContainer}>
          <Text
            style={{
              fontSize: size * 0.22,
              fontWeight: 'bold',
              color: colors.text,
            }}
          >
            {textPercentage}%
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  textContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
