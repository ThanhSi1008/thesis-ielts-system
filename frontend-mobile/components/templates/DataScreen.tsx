import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { spacing } from '@/constants';
import Skeleton from '../atoms/Skeleton';
import Spacer from '../atoms/Spacer';
import EmptyState from '../molecules/EmptyState';
import ErrorState, { ErrorVariant } from '../molecules/ErrorState';

export interface DataScreenProps {
  loading: boolean;
  error: Error | string | null;
  empty: boolean;
  onRetry?: () => void;
  skeleton?: React.ReactNode;
  emptyState?: React.ReactNode;
  errorState?: React.ReactNode;
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function DataScreen({
  loading,
  error,
  empty,
  onRetry,
  skeleton,
  emptyState,
  errorState,
  children,
  style,
}: DataScreenProps) {
  if (loading) {
    if (skeleton) {
      return <View style={[styles.container, style]}>{skeleton}</View>;
    }

    // Default skeleton loader screen
    return (
      <View style={[styles.container, styles.paddedContainer, style]}>
        <View style={styles.skeletonHeader}>
          <Skeleton variant="circle" width={54} height={54} />
          <View style={styles.skeletonHeaderText}>
            <Skeleton variant="text" width="60%" height={20} />
            <Spacer size={2} />
            <Skeleton variant="text" width="40%" height={12} />
          </View>
        </View>
        <Spacer size={6} />
        <Skeleton variant="rect" width="100%" height={100} />
        <Spacer size={4} />
        <Skeleton variant="text" count={3} gap={8} height={14} />
        <Spacer size={6} />
        <Skeleton variant="rect" width="100%" height={120} />
      </View>
    );
  }

  if (error) {
    if (errorState) {
      return <View style={[styles.container, style]}>{errorState}</View>;
    }

    // Determine error variant
    const errString = typeof error === 'string' ? error.toLowerCase() : error.message.toLowerCase();
    let variant: ErrorVariant = 'unknown';

    if (
      errString.includes('network') ||
      errString.includes('internet') ||
      errString.includes('offline') ||
      errString.includes('fetch')
    ) {
      variant = 'network';
    } else if (
      errString.includes('server') ||
      errString.includes('500') ||
      errString.includes('502') ||
      errString.includes('503')
    ) {
      variant = 'server';
    } else if (
      errString.includes('permission') ||
      errString.includes('denied') ||
      errString.includes('403') ||
      errString.includes('authorized')
    ) {
      variant = 'empty-permission';
    }

    return (
      <View style={[styles.container, style]}>
        <ErrorState
          variant={variant}
          description={typeof error === 'string' ? error : error.message}
          onRetry={onRetry}
        />
      </View>
    );
  }

  if (empty) {
    if (emptyState) {
      return <View style={[styles.container, style]}>{emptyState}</View>;
    }

    return (
      <View style={[styles.container, style]}>
        <EmptyState
          title="No data available"
          description="We couldn't find any items to display here."
        />
      </View>
    );
  }

  return <View style={[styles.container, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  paddedContainer: {
    padding: spacing[4],
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonHeaderText: {
    flex: 1,
    marginLeft: spacing[3],
  },
});
