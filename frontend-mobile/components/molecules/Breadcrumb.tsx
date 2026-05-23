import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { spacing } from '@/constants';
import Text from '../atoms/Text';

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const router = useRouter();

  if (!items || items.length === 0) return null;

  // Truncate logic if items.length > 4
  let displayItems: BreadcrumbItem[] = items;
  if (items.length > 4) {
    displayItems = [
      items[0],
      items[1],
      { label: '...' },
      items[items.length - 2],
      items[items.length - 1],
    ];
  }

  return (
    <View style={styles.container}>
      {displayItems.map((item, index) => {
        const isLast = index === displayItems.length - 1;
        const hasRoute = !!item.route;
        const isClickable = hasRoute && !isLast && item.label !== '...';

        return (
          <View key={index} style={styles.itemWrapper}>
            <Pressable
              disabled={!isClickable}
              onPress={() => item.route && router.push(item.route as any)}
              style={({ pressed }) => [
                styles.pressable,
                pressed && isClickable && styles.pressed,
              ]}
              accessible
              accessibilityRole={isClickable ? 'button' : 'text'}
              accessibilityLabel={`Navigate to ${item.label}`}
            >
              <Text
                variant="caption"
                weight={isLast ? 'bold' : 'medium'}
                style={[
                  styles.label,
                  isLast ? { color: colors.text } : { color: colors.textSecondary },
                  isClickable && styles.linkText,
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </Pressable>

            {!isLast && (
              <Ionicons
                name="chevron-forward"
                size={12}
                color={colors.textSecondary}
                style={styles.separator}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      paddingVertical: spacing[1],
    },
    itemWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    pressable: {
      paddingVertical: spacing[1],
    },
    pressed: {
      opacity: 0.6,
    },
    label: {
      fontSize: 12,
    },
    linkText: {
      textDecorationLine: 'none',
    },
    separator: {
      marginHorizontal: spacing[1],
    },
  });
}
