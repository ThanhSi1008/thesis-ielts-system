/**
 * LoadingSpinner - Reusable loading indicator component
 */

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

interface LoadingSpinnerProps {
  message?: string;
  color?: string;
  size?: 'small' | 'large';
}

export function LoadingSpinner({
  message = 'Đang tải...',
  color = COLORS.primary,
  size = 'large',
}: LoadingSpinnerProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});

export default LoadingSpinner;
