import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing, radius } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import Skeleton from '../atoms/Skeleton';
import Spacer from '../atoms/Spacer';

export interface BookListSkeletonProps {
  count?: number;
}

export default function BookListSkeleton({ count = 3 }: BookListSkeletonProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, idx) => (
        <View key={idx} style={styles.card}>
          {/* Header block (gradient matching) */}
          <Skeleton variant="rect" width="100%" height={120} style={styles.hero} />

          {/* Body content */}
          <View style={styles.body}>
            <View style={styles.progressRow}>
              <Skeleton variant="text" width={80} height={14} />
              <Skeleton variant="text" width={40} height={14} />
            </View>
            <Spacer size={2} />
            <Skeleton variant="rect" width="100%" height={6} style={styles.progressBar} />

            <Spacer size={4} />
            <View style={styles.actionRow}>
              <Skeleton variant="text" width={100} height={16} />
              <Skeleton variant="rect" width={90} height={36} style={styles.btn} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      gap: spacing[4],
      width: '100%',
    },
    card: {
      backgroundColor: colors.card || '#FFFFFF',
      borderRadius: radius.xl,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border || '#E2E8F0',
    },
    hero: {
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
    },
    body: {
      padding: spacing[4],
    },
    progressRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    progressBar: {
      borderRadius: radius.full,
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    btn: {
      borderRadius: radius.lg,
    },
  });
}
