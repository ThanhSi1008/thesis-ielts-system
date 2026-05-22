import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { radius, spacing, FONTS } from '@/constants';
import Text from './Text';

export interface ScoreBadgeProps {
  band: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'solid';
}

export default function ScoreBadge({ band, size = 'md', variant = 'outline' }: ScoreBadgeProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const formattedScore = typeof band === 'number' ? band.toFixed(1) : '0.0';

  // Apply WCAG-compliant status colors based on band score values
  // ≥7.0 success, 5.5-6.5 primary, <5.5 warning
  let activeColor = colors.warning;
  let bgColor = colors.warningBg || '#FFF3E0';

  if (band >= 7.0) {
    activeColor = colors.success;
    bgColor = colors.successBg || '#E8F5E9';
  } else if (band >= 5.5) {
    activeColor = colors.primary;
    // For primary (yellow), make background extremely subtle for outline or use onPrimary text for solid
    bgColor = colors.primary + '18';
  } else {
    activeColor = colors.error;
    bgColor = colors.errorBg || '#FFEBEE';
  }

  // Adjust display typography depending on sizes
  const fontSize = size === 'sm' ? 12 : size === 'md' ? 16 : 22;
  const paddingH = size === 'sm' ? 6 : size === 'md' ? 10 : 14;
  const paddingV = size === 'sm' ? 2 : size === 'md' ? 4 : 6;

  const outlineStyle = {
    borderColor: activeColor,
    borderWidth: size === 'lg' ? 2.5 : 2,
    backgroundColor: 'transparent',
  };

  const solidStyle = {
    borderColor: 'transparent',
    borderWidth: 0,
    backgroundColor: activeColor,
  };

  const activeTextStyle = {
    fontSize,
    color:
      variant === 'solid'
        ? band >= 5.5 && band < 7.0
          ? colors.textOnAccent || '#1E293B'
          : '#FFFFFF'
        : activeColor,
  };

  return (
    <View
      style={[
        styles.badge,
        {
          paddingHorizontal: paddingH,
          paddingVertical: paddingV,
        },
        variant === 'solid' ? solidStyle : outlineStyle,
      ]}
    >
      <Text style={[styles.text, activeTextStyle]}>{formattedScore}</Text>
    </View>
  );
}

function createStyles() {
  return StyleSheet.create({
    badge: {
      alignSelf: 'flex-start',
      borderRadius: radius.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontFamily: FONTS.bold,
      textAlign: 'center',
    },
  });
}
