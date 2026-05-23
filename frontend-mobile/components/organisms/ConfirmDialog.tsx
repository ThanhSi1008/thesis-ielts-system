import React from 'react';
import { View, StyleSheet, Modal, Pressable, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { spacing, radius } from '@/constants';
import Text from '../atoms/Text';
import Button from '../atoms/Button';

export type ConfirmDialogVariant = 'destructive' | 'warning' | 'confirm' | 'info';

export interface ConfirmDialogProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: ConfirmDialogVariant;
  primaryAction: {
    title: string;
    onPress: () => void;
  };
  secondaryAction?: {
    title: string;
    onPress: () => void;
  };
  style?: ViewStyle;
}

export default function ConfirmDialog({
  visible,
  onClose,
  title,
  message,
  variant = 'confirm',
  primaryAction,
  secondaryAction,
  style,
}: ConfirmDialogProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return {
          icon: 'trash-bin-outline' as keyof typeof Ionicons.glyphMap,
          iconColor: colors.error,
          btnVariant: 'danger' as const,
        };
      case 'warning':
        return {
          icon: 'alert-circle-outline' as keyof typeof Ionicons.glyphMap,
          iconColor: colors.warning || '#D97706',
          btnVariant: 'primary' as const, // Or custom style
        };
      case 'info':
        return {
          icon: 'information-circle-outline' as keyof typeof Ionicons.glyphMap,
          iconColor: colors.info || '#2196F3',
          btnVariant: 'secondary' as const,
        };
      case 'confirm':
      default:
        return {
          icon: 'checkmark-circle-outline' as keyof typeof Ionicons.glyphMap,
          iconColor: colors.success || '#4CAF50',
          btnVariant: 'primary' as const,
        };
    }
  };

  const defaults = getVariantStyles();

  const handlePrimaryPress = () => {
    primaryAction.onPress();
    onClose();
  };

  const handleSecondaryPress = () => {
    if (secondaryAction) {
      secondaryAction.onPress();
    }
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Backdrop overlay */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* Dialog body box */}
        <View style={[styles.dialogContainer, style]}>
          {/* Top visual indicator icon */}
          <View style={[styles.iconWrapper, { backgroundColor: defaults.iconColor + '1A' }]}>
            <Ionicons name={defaults.icon} size={32} color={defaults.iconColor} />
          </View>

          {/* Heading */}
          <Text variant="title" weight="bold" style={styles.title} color="text">
            {title}
          </Text>

          {/* Body description text */}
          <Text variant="body" color="textSecondary" style={styles.message}>
            {message}
          </Text>

          {/* Action Row buttons stacked vertically for clarity on mobile */}
          <View style={styles.actionsContainer}>
            <Button
              title={primaryAction.title}
              onPress={handlePrimaryPress}
              variant={defaults.btnVariant}
              fullWidth
            />
            {secondaryAction && (
              <View style={styles.secondaryBtnWrapper}>
                <Button
                  title={secondaryAction.title}
                  onPress={handleSecondaryPress}
                  variant="ghost"
                  fullWidth
                />
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing[6],
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    dialogContainer: {
      width: '100%',
      maxWidth: 320,
      backgroundColor: colors.bgElevated || colors.card || '#FFFFFF',
      borderRadius: radius.xl,
      padding: spacing[5],
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 15,
      elevation: 10,
      zIndex: 10,
    },
    iconWrapper: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing[4],
    },
    title: {
      textAlign: 'center',
      marginBottom: spacing[2],
    },
    message: {
      textAlign: 'center',
      marginBottom: spacing[5],
      lineHeight: 20,
    },
    actionsContainer: {
      width: '100%',
    },
    secondaryBtnWrapper: {
      marginTop: spacing[2],
    },
  });
}
