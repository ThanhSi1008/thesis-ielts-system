import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '@/constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

interface UsageIndicatorProps {
  label: string;
  used: number;
  limit: number;
  color?: string;
}

export function UsageIndicator({
  label,
  used,
  limit,
  color,
}: UsageIndicatorProps) {
  const { colors } = useTheme();
  const percentage = Math.min(100, Math.max(0, limit > 0 ? (used / limit) * 100 : 0));
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  // Select premium gradient colors based on status
  const gradientColors: [string, string] = color
    ? [color, color]
    : isAtLimit
    ? [COLORS.errorScale?.[500] || '#ef4444', COLORS.errorScale?.[700] || '#b91c1c']
    : isNearLimit
    ? [COLORS.warningScale?.[500] || '#f59e0b', COLORS.warningScale?.[700] || '#b45309']
    : [COLORS.primary, '#E0A300']; // Premium golden brand colors

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      marginVertical: SPACING.xs,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    labelText: {
      fontFamily: FONTS.semibold,
      fontSize: 13,
      color: colors.text,
    },
    countText: {
      fontFamily: FONTS.bold,
      fontSize: 13,
      color: colors.textSecondary,
    },
    limitReachedText: {
      color: COLORS.error,
    },
    track: {
      height: 8,
      width: '100%',
      backgroundColor: colors.border,
      borderRadius: RADIUS.full,
      overflow: 'hidden',
    },
    fillWrapper: {
      height: '100%',
      borderRadius: RADIUS.full,
      overflow: 'hidden',
    },
  });

  return (
    <View style={styles.container}>
      {/* Label and Count */}
      <View style={styles.header}>
        <Text style={styles.labelText}>{label}</Text>
        <Text style={[styles.countText, isAtLimit && styles.limitReachedText]}>
          {used} / {limit}
        </Text>
      </View>

      {/* Progress Track */}
      <View style={styles.track}>
        <View style={[styles.fillWrapper, { width: `${percentage}%` }]}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFillObject}
          />
        </View>
      </View>
    </View>
  );
}
