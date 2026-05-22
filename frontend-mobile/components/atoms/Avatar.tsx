import React from 'react';
import { View, StyleSheet, ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { radius, spacing } from '@/constants';
import Text from './Text';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  source?: string | ImageSourcePropType | null;
  avatar?: string | null; // Compatibility alias
  name?: string;
  size?: AvatarSize | number; // Support number for size compatibility
  hasBadge?: boolean;
  badgeColor?: string;
  color?: string; // Legacy color prop
}

const SIZE_MAP = {
  xs: 24,
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

// Generates a consistent, gorgeous pastel background color based on name string
function getPastelColor(name: string): string {
  if (!name) return '#CBD5E1'; // Neutral gray fallback
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash % 360);
  const s = 60; // Vibrant but soft
  const l = 70; // High lightness for pastel appearance
  return `hsl(${h}, ${s}%, ${l}%)`;
}

// Extract initials from name, max 2 characters
function getInitials(name: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  const first = parts[0]?.charAt(0) || '';
  const last = parts[parts.length - 1]?.charAt(0) || '';
  return (first + last).toUpperCase();
}

export default function Avatar({
  source,
  avatar,
  name = '',
  size = 'md',
  hasBadge = false,
  badgeColor,
  color,
}: AvatarProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const isNumberSize = typeof size === 'number';
  const dimension = isNumberSize ? (size as number) : SIZE_MAP[size as AvatarSize || 'md'];
  const initials = getInitials(name);
  const fallbackBg = color || getPastelColor(name);

  // Font size relative to avatar size
  const fontSize = isNumberSize
    ? (size as number) * 0.38
    : size === 'xs' ? 10 : size === 'sm' ? 12 : size === 'md' ? 18 : size === 'lg' ? 24 : 36;
  const initialsColor = '#1E293B'; // High-contrast dark text on light pastel colors

  const activeSource = source || avatar;
  const hasImage = !!activeSource;

  return (
    <View style={[styles.container, { width: dimension, height: dimension }]}>
      {hasImage ? (
        <Image
          source={activeSource as any}
          style={[styles.image, { width: dimension, height: dimension, borderRadius: dimension / 2 }]}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View
          style={[
            styles.fallbackContainer,
            {
              width: dimension,
              height: dimension,
              borderRadius: dimension / 2,
              backgroundColor: fallbackBg,
            },
          ]}
        >
          <Text
            style={{
              fontSize,
              color: initialsColor,
              fontWeight: 'bold',
            }}
          >
            {initials || '?'}
          </Text>
        </View>
      )}

      {hasBadge && (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: badgeColor || colors.success,
              width: dimension * 0.25,
              height: dimension * 0.25,
              borderRadius: (dimension * 0.25) / 2,
              borderWidth: dimension > 32 ? 2 : 1.5,
              borderColor: colors.bgElevated || '#FFFFFF',
            },
          ]}
        />
      )}
    </View>
  );
}

function createStyles() {
  return StyleSheet.create({
    container: {
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      overflow: 'hidden',
    },
    fallbackContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    badge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
    },
  });
}
