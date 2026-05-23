import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing, radius } from '@/constants';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import Skeleton from '../atoms/Skeleton';
import Spacer from '../atoms/Spacer';

export default function StatsSkeleton() {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      {/* Overall Band Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.scoreRow}>
          <Skeleton variant="circle" width={74} height={74} />
          <View style={styles.headerText}>
            <Skeleton variant="text" width={140} height={20} />
            <Spacer size={2} />
            <Skeleton variant="text" width={80} height={14} />
          </View>
        </View>
      </View>

      <Spacer size={4} />

      {/* Grid of 4 Stats parameters */}
      <View style={styles.grid}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <View key={idx} style={styles.gridItem}>
            <Skeleton variant="circle" width={24} height={24} />
            <Spacer size={2} />
            <Skeleton variant="text" width="60%" height={16} />
            <Spacer size={1} />
            <Skeleton variant="text" width="40%" height={12} />
          </View>
        ))}
      </View>

      <Spacer size={4} />

      {/* Large Chart Container */}
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Skeleton variant="text" width={150} height={18} />
          <Skeleton variant="rect" width={80} height={24} style={styles.metaBadge} />
        </View>
        <Spacer size={4} />
        {/* Animated tall block representing chart visual loading */}
        <Skeleton variant="rect" width="100%" height={180} style={styles.chartBody} />
      </View>
    </View>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      width: '100%',
    },
    headerCard: {
      backgroundColor: colors.card || '#FFFFFF',
      borderRadius: radius.xl,
      padding: spacing[4],
      borderWidth: 1,
      borderColor: colors.border || '#E2E8F0',
    },
    scoreRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[4],
    },
    headerText: {
      flex: 1,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing[3],
    },
    gridItem: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: colors.card || '#FFFFFF',
      borderRadius: radius.xl,
      padding: spacing[3],
      borderWidth: 1,
      borderColor: colors.border || '#E2E8F0',
    },
    chartContainer: {
      backgroundColor: colors.card || '#FFFFFF',
      borderRadius: radius.xl,
      padding: spacing[4],
      borderWidth: 1,
      borderColor: colors.border || '#E2E8F0',
    },
    chartHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    metaBadge: {
      borderRadius: radius.full,
    },
    chartBody: {
      borderRadius: radius.lg,
      opacity: 0.8,
    },
  });
}
