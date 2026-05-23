import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Text from './Text';
import { SPACING, RADIUS } from '@/constants';

interface PasswordStrengthIndicatorProps {
  password?: string;
}

export default function PasswordStrengthIndicator({ password = '' }: PasswordStrengthIndicatorProps) {
  const { colors } = useTheme();

  const getStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: colors.textMuted };

    const len = pass.length;
    
    // Character groups
    const hasLower = /[a-z]/.test(pass);
    const hasUpper = /[A-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[^A-Za-z0-9]/.test(pass);

    const groupsCount = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

    // Weak: length < 8 OR only 1 character group
    if (len < 8 || groupsCount <= 1) {
      return { score: 1, label: 'Weak', color: '#EF4444' };
    }

    // Strong: length >= 8 AND all 4 character groups
    if (len >= 8 && hasLower && hasUpper && hasNumber && hasSpecial) {
      return { score: 3, label: 'Strong', color: '#10B981' };
    }

    // Medium: length >= 8 and at least 2 character groups (but not all 4)
    return { score: 2, label: 'Medium', color: '#F59E0B' };
  };

  const strength = getStrength(password);

  if (strength.score === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.barsContainer}>
        <View
          style={[
            styles.bar,
            {
              backgroundColor: strength.score >= 1 ? strength.color : colors.border,
            },
          ]}
        />
        <View
          style={[
            styles.bar,
            {
              backgroundColor: strength.score >= 2 ? strength.color : colors.border,
            },
          ]}
        />
        <View
          style={[
            styles.bar,
            {
              backgroundColor: strength.score >= 3 ? strength.color : colors.border,
            },
          ]}
        />
      </View>
      <View style={styles.labelContainer}>
        <Text variant="caption" style={[styles.labelText, { color: strength.color }]} weight="bold">
          Password strength: {strength.label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.xs,
    width: '100%',
  },
  barsContainer: {
    flexDirection: 'row',
    height: 4,
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  bar: {
    flex: 1,
    height: '100%',
    borderRadius: RADIUS.sm,
    marginHorizontal: 2,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  labelText: {
    fontSize: 12,
  },
});
