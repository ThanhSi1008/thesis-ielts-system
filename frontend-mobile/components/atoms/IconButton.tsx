import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { haptics } from '@/utils/haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { spacing, radius } from '@/constants';
import { Ionicons } from '@expo/vector-icons';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type IconButtonSize = 'sm' | 'md' | 'lg';
export type IconButtonShape = 'circle' | 'square';

export interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: (event: any) => void;
  onLongPress?: (event: any) => void;
  size?: IconButtonSize;
  shape?: IconButtonShape;
  variant?: 'solid' | 'outline' | 'ghost';
  disabled?: boolean;
  hasBadge?: boolean;
  badgeColor?: string;
  accessibilityLabel: string;
  style?: ViewStyle;
}

export default function IconButton({
  icon,
  onPress,
  onLongPress,
  size = 'md',
  shape = 'circle',
  variant = 'ghost',
  disabled = false,
  hasBadge = false,
  badgeColor,
  accessibilityLabel,
  style,
}: IconButtonProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withTiming(0.90, { duration: 100 });
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withTiming(1, { duration: 100 });
  };

  const handlePress = (event: any) => {
    if (disabled) return;
    haptics.light();
    onPress(event);
  };

  const handleLongPress = (event: any) => {
    if (disabled || !onLongPress) return;
    haptics.medium();
    onLongPress(event);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Icon sizing
  const iconSize = size === 'sm' ? 18 : size === 'md' ? 24 : 30;

  // hitSlop for small targets (must be >= 44px active area)
  const hitSlop = size === 'sm' ? { top: 12, bottom: 12, left: 12, right: 12 } : undefined;

  // Icon color determination
  let iconColor = colors.text;
  if (disabled) {
    iconColor = colors.textDisabled;
  } else if (variant === 'solid') {
    iconColor = colors.textOnAccent || '#FFFFFF';
  } else if (icon === 'close' || icon === 'close-outline' || icon === 'close-sharp') {
    // Treat standard dismisses with softer mute/accent
    iconColor = colors.textSecondary;
  }

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      onLongPress={onLongPress ? handleLongPress : undefined}
      delayLongPress={500}
      disabled={disabled}
      hitSlop={hitSlop}
      style={[
        styles.button,
        styles[size],
        styles[shape],
        styles[variant],
        disabled && styles.disabled,
        animatedStyle,
        style,
      ]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Ionicons name={icon} size={iconSize} color={iconColor} />

      {hasBadge && (
        <View
          style={[
            styles.badge,
            { backgroundColor: badgeColor || colors.error },
            styles[`badge_${size}`],
          ]}
        />
      )}
    </AnimatedPressable>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    button: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    disabled: {
      opacity: 0.5,
    },
    // Shapes
    circle: {
      borderRadius: radius.full,
    },
    square: {
      borderRadius: radius.md,
    },
    // Variants
    solid: {
      backgroundColor: colors.primary,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    // Sizes
    sm: {
      width: 32,
      height: 32,
    },
    md: {
      width: 44,
      height: 44,
    },
    lg: {
      width: 56,
      height: 56,
    },
    // Badge positioning depending on sizes
    badge: {
      position: 'absolute',
      borderRadius: radius.full,
      borderWidth: 1.5,
      borderColor: colors.bgElevated || '#FFFFFF',
    },
    badge_sm: {
      width: 8,
      height: 8,
      top: 2,
      right: 2,
    },
    badge_md: {
      width: 10,
      height: 10,
      top: 4,
      right: 4,
    },
    badge_lg: {
      width: 12,
      height: 12,
      top: 6,
      right: 6,
    },
  });
}
