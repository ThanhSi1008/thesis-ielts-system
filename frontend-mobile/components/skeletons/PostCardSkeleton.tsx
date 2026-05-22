import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing, radius } from '@/constants';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import Skeleton from '../atoms/Skeleton';
import Spacer from '../atoms/Spacer';

export interface PostCardSkeletonProps {
  count?: number;
}

export default function PostCardSkeleton({ count = 3 }: PostCardSkeletonProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, idx) => (
        <View key={idx} style={styles.card}>
          {/* Author Header */}
          <View style={styles.header}>
            <Skeleton variant="circle" width={38} height={38} />
            <View style={styles.authorInfo}>
              <Skeleton variant="text" width={110} height={14} />
              <Spacer size={1} />
              <Skeleton variant="text" width={60} height={10} />
            </View>
            <Skeleton variant="rect" width={80} height={22} style={styles.badge} />
          </View>

          <Spacer size={3} />
          {/* Post Content */}
          <Skeleton variant="text" width="100%" height={14} />
          <Spacer size={1} />
          <Skeleton variant="text" width="95%" height={14} />
          <Spacer size={1} />
          <Skeleton variant="text" width="60%" height={14} />

          <Spacer size={4} />
          <View style={styles.divider} />
          <Spacer size={3} />

          {/* Action Row */}
          <View style={styles.actionRow}>
            <View style={styles.actionItem}>
              <Skeleton variant="circle" width={18} height={18} />
              <Skeleton variant="text" width={25} height={12} />
            </View>
            <View style={styles.actionItem}>
              <Skeleton variant="circle" width={18} height={18} />
              <Skeleton variant="text" width={25} height={12} />
            </View>
            <View style={styles.actionItem}>
              <Skeleton variant="circle" width={18} height={18} />
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
      gap: spacing[3],
      width: '100%',
    },
    card: {
      backgroundColor: colors.card || '#FFFFFF',
      borderRadius: radius.xl,
      padding: spacing[4],
      borderWidth: 1,
      borderColor: colors.border || '#E2E8F0',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    authorInfo: {
      flex: 1,
      marginLeft: spacing[3],
    },
    badge: {
      borderRadius: radius.full,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border || '#E2E8F0',
    },
    actionRow: {
      flexDirection: 'row',
      gap: spacing[6],
      alignItems: 'center',
    },
    actionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[1],
    },
  });
}
