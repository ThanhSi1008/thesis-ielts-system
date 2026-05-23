import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { spacing, radius } from '@/constants';
import Text from '../atoms/Text';
import Avatar from '../atoms/Avatar';

export interface ListItemProps {
  variant?: 'default' | 'with-avatar' | 'with-icon' | 'with-control';
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  leftIconColor?: string;
  avatarSource?: string;
  avatarName?: string;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function ListItem({
  variant = 'default',
  title,
  subtitle,
  leftIcon,
  leftIconColor,
  avatarSource,
  avatarName,
  rightElement,
  showChevron,
  selected = false,
  onPress,
  disabled = false,
  style,
}: ListItemProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const handlePress = () => {
    if (disabled || !onPress) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const isChevronVisible = showChevron !== undefined ? showChevron : !!onPress && !rightElement;

  const itemContent = (
    <View
      style={[
        styles.container,
        selected && styles.selectedContainer,
        disabled && styles.disabledContainer,
      ]}
    >
      {/* Left section: Icon or Avatar */}
      {variant === 'with-avatar' && (avatarSource || avatarName) && (
        <View style={styles.leftVisual}>
          <Avatar size="sm" source={avatarSource} name={avatarName} />
        </View>
      )}

      {variant === 'with-icon' && leftIcon && (
        <View style={styles.leftVisual}>
          <View style={styles.iconWrapper}>
            <Ionicons name={leftIcon} size={20} color={leftIconColor || colors.primary} />
          </View>
        </View>
      )}

      {/* Middle section: Titles */}
      <View style={styles.middleContent}>
        {typeof title === 'string' ? (
          <Text
            variant="body"
            weight="medium"
            color={selected ? 'primary' : 'text'}
            numberOfLines={1}
          >
            {title}
          </Text>
        ) : (
          title
        )}

        {subtitle && (
          <View style={styles.subtitleWrapper}>
            {typeof subtitle === 'string' ? (
              <Text variant="caption" color="textSecondary" numberOfLines={1}>
                {subtitle}
              </Text>
            ) : (
              subtitle
            )}
          </View>
        )}
      </View>

      {/* Right section: Control / Element / Chevron */}
      <View style={styles.rightVisual}>
        {rightElement}
        {isChevronVisible && (
          <Ionicons
            name="chevron-forward-outline"
            size={18}
            color={colors.textMuted}
            style={rightElement ? styles.chevronSpace : undefined}
          />
        )}
      </View>
    </View>
  );

  if (onPress && !disabled) {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [styles.pressable, pressed && styles.pressed, style]}
        accessible
        accessibilityRole="button"
        accessibilityState={{ disabled, selected }}
      >
        {itemContent}
      </Pressable>
    );
  }

  return <View style={[styles.pressable, style]}>{itemContent}</View>;
}

function createStyles(colors: any) {
  return StyleSheet.create({
    pressable: {
      width: '100%',
    },
    pressed: {
      opacity: 0.7,
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[4],
      backgroundColor: colors.bgElevated || colors.card || '#FFFFFF',
      borderRadius: radius.lg,
      marginBottom: spacing[2],
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    selectedContainer: {
      borderColor: colors.primary,
      backgroundColor: colors.bgSubtle || '#F8F9FA',
    },
    disabledContainer: {
      opacity: 0.5,
    },
    leftVisual: {
      marginRight: spacing[3],
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconWrapper: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      backgroundColor: colors.bgSubtle || '#F1F5F9',
      justifyContent: 'center',
      alignItems: 'center',
    },
    middleContent: {
      flex: 1,
      justifyContent: 'center',
    },
    subtitleWrapper: {
      marginTop: spacing[1],
    },
    rightVisual: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginLeft: spacing[2],
    },
    chevronSpace: {
      marginLeft: spacing[2],
    },
  });
}
