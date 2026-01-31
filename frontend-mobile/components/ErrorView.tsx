/**
 * ErrorView - Reusable error display component with retry option
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../constants';

interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
  retryText?: string;
}

export function ErrorView({
  message = 'Đã xảy ra lỗi',
  onRetry,
  retryText = 'Thử lại',
}: ErrorViewProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>😕</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>{retryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  message: {
    color: COLORS.error,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: FONT_SIZES.sm,
  },
});

export default ErrorView;
