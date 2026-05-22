import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { spacing, radius } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ChipProps {
  label: string;
  active?: boolean;
  onPress: () => void;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  onClose?: () => void;
  disabled?: boolean;
}

export default function Chip({
  label,
  active = false,
  onPress,
  leftIcon,
  onClose,
  disabled = false,
}: ChipProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withTiming(0.96, { duration: 80 });
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withTiming(1, { duration: 80 });
  };

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Resolve color variables based on state
  const activeBgColor = colors.primary;
  const activeTextColor = colors.textOnAccent || '#FFFFFF';
  const inactiveBgColor = colors.surface;
  const inactiveTextColor = colors.textSecondary;

  const iconColor = active ? activeTextColor : inactiveTextColor;

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.chip,
        active ? { backgroundColor: activeBgColor, borderColor: activeBgColor } : { backgroundColor: inactiveBgColor, borderColor: colors.border },
        disabled && styles.disabled,
        animatedStyle,
      ]}
    >
      {leftIcon && (
        <Ionicons
          name={leftIcon}
          size={16}
          color={iconColor}
          style={styles.leftIcon}
        />
      )}
      
      <Text
        variant="label"
        style={[
          styles.text,
          { color: active ? activeTextColor : inactiveTextColor },
          active && styles.activeText,
        ]}
      >
        {label}
      </Text>

      {onClose && (
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.closeWrapper}
        >
          <Ionicons
            name="close"
            size={16}
            color={iconColor}
          />
        </Pressable>
      )}
    </AnimatedPressable>
  );
}

function createStyles() {
  return StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[2],
      minHeight: 38,
      borderRadius: radius.full,
      borderWidth: 1,
      marginRight: spacing[2],
      marginVertical: spacing[1],
    },
    disabled: {
      opacity: 0.5,
    },
    text: {
      fontWeight: '600',
    },
    activeText: {
      fontWeight: '800',
    },
    leftIcon: {
      marginRight: 6,
    },
    closeWrapper: {
      marginLeft: 6,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
}
