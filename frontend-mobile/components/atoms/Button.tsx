import React from 'react';
import { Pressable, ActivityIndicator, StyleSheet, View, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { spacing, radius, typography, FONTS } from '@/constants';
import { Ionicons } from '@expo/vector-icons';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title: string;
  onPress: (event: any) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const scale = useSharedValue(1);

  const isDisabled = disabled || loading;

  const handlePressIn = () => {
    if (isDisabled) return;
    scale.value = withTiming(0.98, { duration: 100 });
  };

  const handlePressOut = () => {
    if (isDisabled) return;
    scale.value = withTiming(1, { duration: 100 });
  };

  const handlePress = (event: any) => {
    if (isDisabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(event);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Define icon size and color based on size and variant
  const iconSize = size === 'sm' ? 16 : size === 'md' ? 20 : 24;
  let iconColor = '#FFFFFF';
  if (variant === 'outline' || variant === 'ghost') {
    iconColor = colors.primary;
  } else if (variant === 'secondary') {
    iconColor = colors.text;
  }

  const spinnerColor =
    variant === 'outline' || variant === 'ghost'
      ? colors.primary
      : variant === 'secondary'
        ? colors.text
        : '#FFFFFF';

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={isDisabled}
      style={[
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        animatedStyle,
      ]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <View style={styles.content}>
          {leftIcon && (
            <Ionicons name={leftIcon} size={iconSize} color={iconColor} style={styles.leftIcon} />
          )}
          <Text
            style={[
              styles.text,
              styles[`text_${variant}`],
              styles[`text_${size}`],
              isDisabled && styles.textDisabled,
            ]}
          >
            {title}
          </Text>
          {rightIcon && (
            <Ionicons name={rightIcon} size={iconSize} color={iconColor} style={styles.rightIcon} />
          )}
        </View>
      )}
    </AnimatedPressable>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.lg,
      borderWidth: 0,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    leftIcon: {
      marginRight: spacing[2],
    },
    rightIcon: {
      marginLeft: spacing[2],
    },
    fullWidth: {
      width: '100%',
    },
    disabled: {
      opacity: 0.5,
    },
    // Variants
    primary: {
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 3,
    },
    secondary: {
      backgroundColor: colors.secondary,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.borderFocus,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    danger: {
      backgroundColor: colors.error,
      shadowColor: colors.error,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 3,
    },
    // Sizes
    sm: {
      paddingVertical: spacing[2],
      paddingHorizontal: spacing[4],
      borderRadius: radius.md,
    },
    md: {
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[6],
      minHeight: 48,
    },
    lg: {
      paddingVertical: spacing[4],
      paddingHorizontal: spacing[8],
      minHeight: 56,
    },
    // Text style overrides
    text: {
      fontFamily: FONTS.bold,
      textAlign: 'center',
    },
    text_primary: {
      color: colors.textOnAccent || '#FFFFFF',
    },
    text_secondary: {
      color: colors.text,
    },
    text_outline: {
      color: colors.primary,
    },
    text_ghost: {
      color: colors.primary,
    },
    text_danger: {
      color: '#FFFFFF',
    },
    text_sm: {
      fontSize: 14,
      lineHeight: 18,
    },
    text_md: {
      fontSize: 16,
      lineHeight: 22,
    },
    text_lg: {
      fontSize: 18,
      lineHeight: 24,
    },
    textDisabled: {
      opacity: 0.8,
    },
  });
}
