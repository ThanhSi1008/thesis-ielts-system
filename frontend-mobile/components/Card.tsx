/**
 * Card - Reusable card component with consistent styling
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../constants';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'default' | 'elevated';
}

export function Card({ children, onPress, style, variant = 'default' }: CardProps) {
  const cardStyle = [
    styles.card,
    variant === 'elevated' && styles.elevated,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});

export default Card;
