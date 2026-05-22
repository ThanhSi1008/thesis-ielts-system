import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing, radius } from '@/constants';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import Skeleton from '../atoms/Skeleton';
import Spacer from '../atoms/Spacer';

export interface LessonListSkeletonProps {
  count?: number;
}

export default function LessonListSkeleton({ count = 5 }: LessonListSkeletonProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, idx) => (
        <View key={idx} style={styles.row}>
          {/* Avatar / Circle icon indicator */}
          <Skeleton variant="circle" width={40} height={40} />

          {/* Text block */}
          <View style={styles.textContainer}>
            <Skeleton variant="text" width="70%" height={16} />
            <Spacer size={1} />
            <Skeleton variant="text" width="45%" height={12} />
          </View>

          {/* Trailing action / chevron */}
          <Skeleton variant="circle" width={24} height={24} style={styles.trailing} />
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
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing[3],
      backgroundColor: colors.card || '#FFFFFF',
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border || '#E2E8F0',
    },
    textContainer: {
      flex: 1,
      marginLeft: spacing[3],
    },
    trailing: {
      opacity: 0.6,
    },
  });
}
