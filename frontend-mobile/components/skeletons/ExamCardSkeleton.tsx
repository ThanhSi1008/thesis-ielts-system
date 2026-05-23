import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing, radius } from '@/constants';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import Skeleton from '../atoms/Skeleton';
import Spacer from '../atoms/Spacer';

export interface ExamCardSkeletonProps {
  count?: number;
}

export default function ExamCardSkeleton({ count = 3 }: ExamCardSkeletonProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, idx) => (
        <View key={idx} style={styles.card}>
          {/* Tag row */}
          <View style={styles.tagRow}>
            <Skeleton variant="rect" width={70} height={20} style={styles.tag} />
            <Skeleton variant="rect" width={90} height={20} style={styles.tag} />
          </View>

          <Spacer size={3} />
          {/* Exam Title */}
          <Skeleton variant="text" width="90%" height={20} />
          <Spacer size={2} />
          <Skeleton variant="text" width="60%" height={16} />

          <Spacer size={4} />
          <View style={styles.divider} />
          <Spacer size={3} />

          {/* Footer statistics and start buttons */}
          <View style={styles.footerRow}>
            <View style={styles.metaRow}>
              <Skeleton variant="circle" width={16} height={16} />
              <Skeleton variant="text" width={60} height={12} style={styles.metaText} />
            </View>
            <Skeleton variant="rect" width={100} height={36} style={styles.btn} />
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
      padding: spacing[4],
      borderWidth: 1,
      borderColor: colors.border || '#E2E8F0',
    },
    tagRow: {
      flexDirection: 'row',
      gap: spacing[2],
    },
    tag: {
      borderRadius: radius.full,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border || '#E2E8F0',
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
    },
    metaText: {
      marginLeft: spacing[1],
    },
    btn: {
      borderRadius: radius.lg,
    },
  });
}
