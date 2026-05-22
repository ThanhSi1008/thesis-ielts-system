import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle, StyleProp } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { haptics } from '@/utils/haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { spacing, radius } from '@/constants';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface CardProps {
  children?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: 'elevated' | 'outlined' | 'tonal' | 'gradient';
  gradientColors?: string[];
  header?: React.ReactNode;
  body?: React.ReactNode;
  footer?: React.ReactNode;
  leftAccessory?: React.ReactNode;
  rightAccessory?: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function Card({
  children,
  onPress,
  style,
  variant = 'elevated',
  gradientColors,
  header,
  body,
  footer,
  leftAccessory,
  rightAccessory,
  accessibilityLabel,
  accessibilityHint,
}: CardProps) {
  const { colors, isDark } = useTheme();
  const styles = useThemedStyles((themeColors) => createStyles(themeColors, isDark));
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (!onPress) return;
    scale.value = withTiming(0.98, { duration: 100 });
  };

  const handlePressOut = () => {
    if (!onPress) return;
    scale.value = withTiming(1, { duration: 100 });
  };

  const handlePress = () => {
    if (!onPress) return;
    haptics.light();
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const cardContent = (
    <View style={styles.innerContainer}>
      {header && <View style={styles.header}>{header}</View>}

      <View style={styles.contentRow}>
        {leftAccessory && <View style={styles.leftAccessory}>{leftAccessory}</View>}

        <View style={styles.bodyContainer}>{body || children}</View>

        {rightAccessory && <View style={styles.rightAccessory}>{rightAccessory}</View>}
      </View>

      {footer && <View style={styles.footer}>{footer}</View>}
    </View>
  );

  const containerStyles = [
    styles.card,
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && styles.outlined,
    variant === 'tonal' && styles.tonal,
    style,
  ];

  if (onPress) {
    if (variant === 'gradient') {
      const defaultGradient = isDark ? ['#E0A500', '#FFC600'] : ['#FFC600', '#FFE680'];
      return (
        <AnimatedPressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          style={[containerStyles, animatedStyle, { padding: 0, overflow: 'hidden' }]}
          accessible
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
        >
          <LinearGradient
            colors={(gradientColors || defaultGradient) as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientFill}
          >
            {cardContent}
          </LinearGradient>
        </AnimatedPressable>
      );
    }

    return (
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[containerStyles, animatedStyle]}
        accessible
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      >
        {cardContent}
      </AnimatedPressable>
    );
  }

  if (variant === 'gradient') {
    const defaultGradient = isDark ? ['#E0A500', '#FFC600'] : ['#FFC600', '#FFE680'];
    return (
      <View style={[containerStyles, { padding: 0, overflow: 'hidden' }]}>
        <LinearGradient
          colors={(gradientColors || defaultGradient) as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientFill}
        >
          {cardContent}
        </LinearGradient>
      </View>
    );
  }

  return <View style={containerStyles}>{cardContent}</View>;
}

function createStyles(colors: any, isDark: boolean) {
  return StyleSheet.create({
    card: {
      borderRadius: radius.xl,
      padding: spacing[4],
      marginBottom: spacing[4],
      backgroundColor: colors.bgElevated || colors.card || '#FFFFFF',
    },
    elevated: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.35 : 0.08,
      shadowRadius: 10,
      elevation: 4,
    },
    outlined: {
      borderWidth: 1.5,
      borderColor: colors.border || '#E2E8F0',
      backgroundColor: 'transparent',
    },
    tonal: {
      backgroundColor: colors.bgSubtle || '#F1F5F9',
    },
    gradientFill: {
      padding: spacing[4],
      borderRadius: radius.xl,
      width: '100%',
      height: '100%',
    },
    innerContainer: {
      width: '100%',
    },
    header: {
      marginBottom: spacing[3],
      borderBottomWidth: 0,
    },
    contentRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    leftAccessory: {
      marginRight: spacing[3],
      justifyContent: 'center',
      alignItems: 'center',
    },
    bodyContainer: {
      flex: 1,
    },
    rightAccessory: {
      marginLeft: spacing[3],
      justifyContent: 'center',
      alignItems: 'center',
    },
    footer: {
      marginTop: spacing[3],
      borderTopWidth: 0,
    },
  });
}
