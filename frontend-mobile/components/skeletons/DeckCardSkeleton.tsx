import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing, radius } from '@/constants';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import Skeleton from '../atoms/Skeleton';
import Spacer from '../atoms/Spacer';

export interface DeckCardSkeletonProps {
  count?: number;
}

export default function DeckCardSkeleton({ count = 4 }: DeckCardSkeletonProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, idx) => (
        <View key={idx} style={styles.card}>
          <View style={styles.header}>
            <Skeleton variant="circle" width={32} height={32} />
            <View style={styles.textCol}>
              <Skeleton variant="text" width="60%" height={16} />
              <Spacer size={1} />
              <Skeleton variant="text" width="30%" height={12} />
            </View>
          </View>

          <Spacer size={3} />
          <View style={styles.divider} />
          <Spacer size={3} />

          {/* Cards counts / SRS badges */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Skeleton variant="text" width={20} height={14} style={{ alignSelf: 'center' }} />
              <Spacer size={1} />
              <Skeleton variant="text" width={40} height={10} style={{ alignSelf: 'center' }} />
            </View>
            <View style={styles.statBox}>
              <Skeleton variant="text" width={20} height={14} style={{ alignSelf: 'center' }} />
              <Spacer size={1} />
              <Skeleton variant="text" width={40} height={10} style={{ alignSelf: 'center' }} />
            </View>
            <View style={styles.statBox}>
              <Skeleton variant="text" width={20} height={14} style={{ alignSelf: 'center' }} />
              <Spacer size={1} />
              <Skeleton variant="text" width={40} height={10} style={{ alignSelf: 'center' }} />
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
      padding: spacing[3],
      borderWidth: 1,
      borderColor: colors.border || '#E2E8F0',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    textCol: {
      flex: 1,
      marginLeft: spacing[2],
    },
    divider: {
      height: 1,
      backgroundColor: colors.border || '#E2E8F0',
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    statBox: {
      flex: 1,
    },
  });
}
