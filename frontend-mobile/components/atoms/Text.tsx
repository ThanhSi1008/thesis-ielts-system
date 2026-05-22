import React from 'react';
import { Text as RNText, StyleSheet, TextProps as RNTextProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { typography, FONTS } from '@/constants';

export type TextVariant = 'display' | 'headline' | 'title' | 'body' | 'label' | 'caption';
export type TextWeight = 'light' | 'regular' | 'medium' | 'bold';
export type TextColor =
  | 'text'
  | 'textSecondary'
  | 'textMuted'
  | 'primary'
  | 'error'
  | 'success'
  | 'white'
  | 'onPrimary';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  weight?: TextWeight;
  color?: TextColor;
  children: React.ReactNode;
}

export default function Text({
  variant = 'body',
  weight,
  color = 'text',
  style,
  children,
  ...props
}: TextProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  // Determine font family based on weight and fallback to variant preset default
  let fontFamily: string = FONTS.regular;
  const activeWeight =
    weight ||
    (variant === 'display' || variant === 'headline' || variant === 'title' ? 'bold' : 'regular');

  if (activeWeight === 'bold') {
    fontFamily = FONTS.bold;
  } else if (activeWeight === 'medium') {
    fontFamily = FONTS.medium;
  } else if (activeWeight === 'light') {
    fontFamily = FONTS.light;
  }

  // Resolve color from theme colors
  let textColor = colors.text;
  if (color === 'textSecondary') {
    textColor = colors.textSecondary;
  } else if (color === 'textMuted') {
    textColor = colors.textMuted;
  } else if (color === 'primary') {
    textColor = colors.primary;
  } else if (color === 'error') {
    textColor = colors.error;
  } else if (color === 'success') {
    textColor = colors.success;
  } else if (color === 'white') {
    textColor = '#FFFFFF';
  } else if (color === 'onPrimary') {
    textColor = colors.onPrimary || '#212529';
  }

  return (
    <RNText
      style={[styles.text, styles[variant], { fontFamily, color: textColor }, style]}
      {...props}
    >
      {children}
    </RNText>
  );
}

function createStyles() {
  return StyleSheet.create({
    text: {
      textAlign: 'left',
    },
    display: {
      fontSize: typography.display.fontSize,
      lineHeight: typography.display.lineHeight,
    },
    headline: {
      fontSize: typography.headline.fontSize,
      lineHeight: typography.headline.lineHeight,
    },
    title: {
      fontSize: typography.title.fontSize,
      lineHeight: typography.title.lineHeight,
    },
    body: {
      fontSize: typography.body.fontSize,
      lineHeight: typography.body.lineHeight,
    },
    label: {
      fontSize: typography.label.fontSize,
      lineHeight: typography.label.lineHeight,
    },
    caption: {
      fontSize: typography.caption.fontSize,
      lineHeight: typography.caption.lineHeight,
    },
  });
}
