import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { radius, spacing } from '@/constants';
import Text from './Text';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'tier';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  label?: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dotOnly?: boolean;
  value?: 'FREE' | 'PREMIUM' | 'PRO' | string;
  color?: string; // Legacy compatibility
  bg?: string; // Legacy compatibility
}

export default function Badge({
  label,
  variant = 'neutral',
  size = 'md',
  dotOnly = false,
  value = 'FREE',
  color,
  bg,
}: BadgeProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  // Background and Text colors based on variant or legacy props
  let textValColor = color || colors.textSecondary;
  let bgVal = bg || (color ? color + '18' : colors.bgSubtle);

  if (!color) {
    switch (variant) {
      case 'success':
        bgVal = colors.successBg || '#E8F5E9';
        textValColor = colors.success;
        break;
      case 'warning':
        bgVal = colors.warningBg || '#FFF3E0';
        textValColor = colors.warning;
        break;
      case 'error':
        bgVal = colors.errorBg || '#FFEBEE';
        textValColor = colors.error;
        break;
      case 'info':
        bgVal = colors.infoBg || '#E0F2FE';
        textValColor = colors.info;
        break;
      case 'tier':
        if (value === 'PRO') {
          bgVal = '#7C3AED15'; // Subtle purple
          textValColor = '#7C3AED';
        } else if (value === 'PREMIUM') {
          bgVal = colors.primary + '18'; // Subtle brand yellow
          textValColor = colors.primary === '#FFC600' ? '#D97706' : colors.primary; // Darker yellow/amber for contrast
        } else {
          bgVal = colors.secondary;
          textValColor = colors.textSecondary;
        }
        break;
      case 'neutral':
      default:
        bgVal = colors.bgSubtle;
        textValColor = colors.textSecondary;
        break;
    }
  }

  const badgeText = variant === 'tier' ? value : label;

  if (dotOnly) {
    const dotDimension = size === 'sm' ? 8 : 12;
    return (
      <View
        style={[
          styles.dot,
          {
            width: dotDimension,
            height: dotDimension,
            borderRadius: dotDimension / 2,
            backgroundColor: textValColor,
          },
        ]}
      />
    );
  }

  return (
    <View style={[styles.badge, styles[size], { backgroundColor: bgVal }]}>
      <Text
        variant="caption"
        style={[styles.text, styles[`text_${size}`], { color: textValColor }]}
      >
        {badgeText}
      </Text>
    </View>
  );
}

function createStyles() {
  return StyleSheet.create({
    badge: {
      alignSelf: 'flex-start',
      borderRadius: radius.full,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sm: {
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    md: {
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    text: {
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    text_sm: {
      fontSize: 10,
    },
    text_md: {
      fontSize: 11,
    },
    dot: {
      alignSelf: 'center',
    },
  });
}
