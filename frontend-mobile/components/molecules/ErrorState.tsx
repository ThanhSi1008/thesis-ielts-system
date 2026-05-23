import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { spacing } from '@/constants';
import Text from '../atoms/Text';
import Button from '../atoms/Button';

export type ErrorVariant = 'network' | 'server' | 'unknown' | 'empty-permission';

export interface ErrorStateProps {
  variant?: ErrorVariant;
  title?: string;
  description?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export default function ErrorState({
  variant = 'unknown',
  title,
  description,
  onRetry,
  style,
}: ErrorStateProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  // Get defaults based on variant
  const getVariantDefaults = () => {
    switch (variant) {
      case 'network':
        return {
          icon: 'wifi-outline' as keyof typeof Ionicons.glyphMap,
          title: 'Connection Interrupted',
          description:
            'No internet connection found. Please verify your data/Wi-Fi connection and try again.',
        };
      case 'server':
        return {
          icon: 'cloud-offline-outline' as keyof typeof Ionicons.glyphMap,
          title: 'Server Unreachable',
          description:
            'Our cloud servers are undergoing a temporary outage. We are resolving the issue rapidly.',
        };
      case 'empty-permission':
        return {
          icon: 'lock-closed-outline' as keyof typeof Ionicons.glyphMap,
          title: 'Access Restricted',
          description:
            'This feature requires permissions that have not been granted yet. Please update system settings.',
        };
      case 'unknown':
      default:
        return {
          icon: 'warning-outline' as keyof typeof Ionicons.glyphMap,
          title: 'Unexpected Failure',
          description: 'An unknown system issue occurred. Please report this error if it persists.',
        };
    }
  };

  const defaults = getVariantDefaults();
  const activeTitle = title || defaults.title;
  const activeDescription = description || defaults.description;

  return (
    <View style={[styles.container, style]}>
      {/* Icon Circle wrapper */}
      <View style={styles.iconCircle}>
        <Ionicons name={defaults.icon} size={48} color={colors.error} />
      </View>

      {/* Message info */}
      <Text variant="title" weight="bold" style={styles.title} color="text">
        {activeTitle}
      </Text>

      <Text variant="body" color="textSecondary" style={styles.description}>
        {activeDescription}
      </Text>

      {/* Standard retry action */}
      {onRetry && (
        <View style={styles.actionsContainer}>
          <Button
            title="Retry Connection"
            onPress={onRetry}
            variant="danger"
            fullWidth
            leftIcon="refresh-outline"
          />
        </View>
      )}
    </View>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing[6],
      minHeight: 300,
    },
    iconCircle: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: colors.errorScale?.[50] || '#FFEBEE',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing[6],
    },
    title: {
      textAlign: 'center',
      marginBottom: spacing[2],
    },
    description: {
      textAlign: 'center',
      marginBottom: spacing[6],
      maxWidth: '85%',
    },
    actionsContainer: {
      width: '100%',
      maxWidth: 240,
    },
  });
}
