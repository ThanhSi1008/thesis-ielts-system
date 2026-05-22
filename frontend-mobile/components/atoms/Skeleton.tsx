import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { radius, spacing } from '@/constants';

export type SkeletonVariant = 'text' | 'circle' | 'rect' | 'card';

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  variant?: SkeletonVariant;
  count?: number;
  gap?: number;
  direction?: 'row' | 'column';
  style?: ViewStyle;
}

export default function Skeleton({
  width,
  height,
  variant = 'rect',
  count = 1,
  gap = 8,
  direction = 'column',
  style,
}: SkeletonProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.8, {
        duration: 1000,
        easing: Easing.bezier(0.4, 0, 0.6, 1),
      }),
      -1,
      true, // Reverse direction on repeat (shimmer pulse effect)
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Resolve shape boundaries
  const isCircle = variant === 'circle';
  const isText = variant === 'text';
  const isCard = variant === 'card';

  // Base dimensions based on variants
  const defaultHeight = isCircle ? 44 : isText ? 14 : isCard ? 120 : 48;
  const defaultWidth = isCircle ? 44 : '100%';

  const activeHeight = height !== undefined ? height : defaultHeight;
  const activeWidth = width !== undefined ? width : defaultWidth;

  const skeletonRadius = isCircle
    ? radius.full
    : isText
      ? radius.sm
      : isCard
        ? radius.xl
        : radius.md;

  const renderSingleSkeleton = (index: number) => {
    return (
      <Animated.View
        key={index}
        style={[
          styles.skeleton,
          {
            backgroundColor: colors.border, // Use theme border color for skeleton block
            width: activeWidth as any,
            height: activeHeight as any,
            borderRadius: skeletonRadius,
          },
          isCard && styles.cardOutline,
          animatedStyle,
          style,
        ]}
      />
    );
  };

  if (count > 1) {
    return (
      <View
        style={{
          flexDirection: direction,
          gap,
          width: '100%',
        }}
      >
        {Array.from({ length: count }).map((_, i) => renderSingleSkeleton(i))}
      </View>
    );
  }

  return renderSingleSkeleton(0);
}

function createStyles(colors: any) {
  return StyleSheet.create({
    skeleton: {
      overflow: 'hidden',
    },
    cardOutline: {
      borderWidth: 1,
      borderColor: colors.border,
    },
  });
}
