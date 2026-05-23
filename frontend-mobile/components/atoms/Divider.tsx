import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { spacing } from '@/constants';

export interface DividerProps {
  vertical?: boolean;
  size?: number; // Optional margin space surrounding divider
}

export default function Divider({ vertical = false, size = 2 }: DividerProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const marginValue = spacing[size as keyof typeof spacing] || 8;

  return (
    <View
      style={[
        vertical ? styles.vertical : styles.horizontal,
        {
          backgroundColor: colors.border,
          marginVertical: vertical ? 0 : marginValue,
          marginHorizontal: vertical ? marginValue : 0,
        },
      ]}
    />
  );
}

function createStyles() {
  return StyleSheet.create({
    horizontal: {
      height: 1,
      width: '100%',
    },
    vertical: {
      width: 1,
      height: '100%',
    },
  });
}
