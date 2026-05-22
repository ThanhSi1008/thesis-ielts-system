import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { spacing, radius, FONTS } from '@/constants';
import Text from '../atoms/Text';
import IconButton from '../atoms/IconButton';

export type HeaderVariant = 'default' | 'large' | 'transparent' | 'centered';

export interface HeaderProps {
  variant?: HeaderVariant;
  title: string;
  subtitle?: string;
  leftAction?: {
    icon?: keyof typeof Ionicons.glyphMap;
    label?: string;
    onPress: () => void;
  };
  rightActions?: {
    icon: keyof typeof Ionicons.glyphMap;
    accessibilityLabel: string;
    onPress: () => void;
  }[];
  style?: ViewStyle;
}

export default function Header({
  variant = 'default',
  title,
  subtitle,
  leftAction,
  rightActions,
  style,
}: HeaderProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(createStyles);

  const isCentered = variant === 'centered';
  const isLarge = variant === 'large';
  const isTransparent = variant === 'transparent';

  const containerStyle = [
    styles.container,
    { paddingTop: insets.top },
    isTransparent ? styles.transparent : styles.solidBackground,
    style,
  ];

  return (
    <View style={containerStyle}>
      {/* Upper action row */}
      <View style={styles.actionRow}>
        {/* Left Action slot */}
        <View style={styles.leftSlot}>
          {leftAction &&
            (leftAction.icon ? (
              <IconButton
                icon={leftAction.icon}
                onPress={leftAction.onPress}
                size="md"
                accessibilityLabel={leftAction.label || 'Go back'}
              />
            ) : leftAction.label ? (
              <Pressable
                onPress={leftAction.onPress}
                style={styles.textButton}
                accessible
                accessibilityRole="button"
              >
                <Text variant="body" color="primary" weight="medium">
                  {leftAction.label}
                </Text>
              </Pressable>
            ) : null)}
        </View>

        {/* Center Title slot (For default and centered variant, not large) */}
        {!isLarge && (
          <View style={[styles.titleContainer, isCentered && styles.centeredTitle]}>
            <Text variant="body" weight="bold" style={styles.compactTitle} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text variant="caption" color="textSecondary" numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
        )}

        {/* Right Actions slot */}
        <View style={styles.rightSlot}>
          {rightActions &&
            rightActions.map((action, index) => (
              <IconButton
                key={index}
                icon={action.icon}
                onPress={action.onPress}
                size="md"
                style={index > 0 ? styles.rightActionSpacing : undefined}
                accessibilityLabel={action.accessibilityLabel}
              />
            ))}
        </View>
      </View>

      {/* Lower Row slot for Large variant headings */}
      {isLarge && (
        <View style={styles.largeTitleContainer}>
          <Text variant="headline" weight="bold" color="text">
            {title}
          </Text>
          {subtitle && (
            <Text variant="body" color="textSecondary" style={styles.largeSubtitle}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      width: '100%',
      paddingHorizontal: spacing[4],
      paddingBottom: spacing[3],
    },
    solidBackground: {
      backgroundColor: colors.bgElevated || colors.card || '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: colors.border || '#E2E8F0',
    },
    transparent: {
      backgroundColor: 'transparent',
    },
    actionRow: {
      height: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    leftSlot: {
      minWidth: 48,
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
    textButton: {
      paddingVertical: spacing[1],
      paddingHorizontal: spacing[2],
    },
    titleContainer: {
      flex: 1,
      paddingHorizontal: spacing[2],
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    centeredTitle: {
      alignItems: 'center',
    },
    compactTitle: {
      fontSize: 17,
      color: colors.text,
    },
    rightSlot: {
      minWidth: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    rightActionSpacing: {
      marginLeft: spacing[2],
    },
    largeTitleContainer: {
      marginTop: spacing[4],
      paddingHorizontal: spacing[1],
    },
    largeSubtitle: {
      marginTop: spacing[1],
    },
  });
}
