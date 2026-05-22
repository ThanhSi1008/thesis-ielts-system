import React from 'react';
import { View, StyleSheet, ViewStyle, ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { spacing } from '@/constants';
import Text from '../atoms/Text';
import Button from '../atoms/Button';

export interface EmptyStateProps {
  illustration?: keyof typeof Ionicons.glyphMap | any;
  title: string;
  description?: string;
  primaryAction?: {
    title: string;
    onPress: () => void;
  };
  secondaryAction?: {
    title: string;
    onPress: () => void;
  };
  style?: ViewStyle;
}

export default function EmptyState({
  illustration,
  title,
  description,
  primaryAction,
  secondaryAction,
  style,
}: EmptyStateProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const renderIllustration = () => {
    if (!illustration) {
      // Default fallback fallback icon
      return (
        <View style={styles.iconCircle}>
          <Ionicons name="folder-open-outline" size={48} color={colors.primary} />
        </View>
      );
    }

    if (typeof illustration === 'string') {
      return (
        <View style={styles.iconCircle}>
          <Ionicons name={illustration as any} size={48} color={colors.primary} />
        </View>
      );
    }

    // Otherwise treat as an image source object
    return <Image source={illustration} resizeMode="contain" style={styles.image} />;
  };

  return (
    <View style={[styles.container, style]}>
      {/* Illustration */}
      <View style={styles.illustrationWrapper}>{renderIllustration()}</View>

      {/* Text Info */}
      <Text variant="title" weight="bold" style={styles.title} color="text">
        {title}
      </Text>

      {description && (
        <Text variant="body" color="textSecondary" style={styles.description}>
          {description}
        </Text>
      )}

      {/* Action Buttons */}
      {(primaryAction || secondaryAction) && (
        <View style={styles.actionsContainer}>
          {primaryAction && (
            <Button
              title={primaryAction.title}
              onPress={primaryAction.onPress}
              variant="primary"
              fullWidth
            />
          )}

          {secondaryAction && (
            <View style={styles.secondaryActionWrapper}>
              <Button
                title={secondaryAction.title}
                onPress={secondaryAction.onPress}
                variant="ghost"
                fullWidth
              />
            </View>
          )}
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
    illustrationWrapper: {
      marginBottom: spacing[6],
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconCircle: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: colors.bgSubtle || '#F1F5F9',
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      width: 180,
      height: 180,
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
      maxWidth: 280,
      alignItems: 'center',
    },
    secondaryActionWrapper: {
      width: '100%',
      marginTop: spacing[2],
    },
  });
}
