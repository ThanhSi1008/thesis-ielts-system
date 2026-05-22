import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, SPACING } from '@/constants';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { SubscriptionTier } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';

interface FeatureLockProps {
  requiredTier?: SubscriptionTier;
  featureName?: string;
  children: React.ReactNode;
}

const TIER_LEVELS: Record<SubscriptionTier, number> = {
  FREE: 0,
  PREMIUM: 1,
  PRO: 2,
};

export function FeatureLock({
  requiredTier = 'PREMIUM',
  featureName = 'This feature',
  children,
}: FeatureLockProps) {
  const { tier, trialUsed, loading } = useSubscription();

  if (loading) {
    return <View style={styles.loadingContainer}>{children}</View>;
  }

  const userTierLevel = TIER_LEVELS[tier] || 0;
  const requiredTierLevel = TIER_LEVELS[requiredTier] || 0;
  const isLocked = userTierLevel < requiredTierLevel;

  if (!isLocked) {
    return <>{children}</>;
  }

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  return (
    <View style={styles.container}>
      {/* Visual teaser: Render the child blurred/low-opacity underneath */}
      <View style={styles.blurredContent} pointerEvents="none">
        {children}
      </View>

      {/* Premium Glassmorphic Overlay */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
        <LinearGradient
          colors={['rgba(15, 23, 42, 0.7)', 'rgba(15, 23, 42, 0.92)', 'rgba(15, 23, 42, 0.98)']}
          style={styles.overlay}
        >
          <View style={styles.card}>
            {/* Crown Icon with Golden Gradient */}
            <LinearGradient
              colors={['#FFE082', '#FFC600', '#FFA000']}
              style={styles.iconWrapper}
            >
              <Ionicons name="lock-closed" size={24} color="#0F172A" />
            </LinearGradient>

            <Text style={styles.title}>Unlock Premium Feature</Text>
            
            <Text style={styles.description}>
              {featureName} is exclusive to <Text style={styles.highlightText}>{requiredTier}</Text> members. Upgrade now to get full unlimited access.
            </Text>

            {/* CTAs */}
            <TouchableOpacity style={styles.primaryButton} onPress={handleUpgrade} activeOpacity={0.8}>
              <LinearGradient
                colors={['#FFD54F', '#FFC600', '#FFB300']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.primaryButtonText}>Upgrade to Premium</Text>
                <Ionicons name="arrow-forward" size={16} color="#0F172A" style={styles.buttonIcon} />
              </LinearGradient>
            </TouchableOpacity>

            {!trialUsed && (
              <TouchableOpacity style={styles.secondaryButton} onPress={handleUpgrade} activeOpacity={0.8}>
                <Text style={styles.secondaryButtonText}>Start 7-Day Free Trial</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
  },
  blurredContent: {
    flex: 1,
    opacity: 0.15,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    shadowColor: '#FFC600',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.sm,
  },
  highlightText: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  primaryButton: {
    width: '100%',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  primaryButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#0F172A',
  },
  buttonIcon: {
    marginLeft: SPACING.sm,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: FONTS.semibold,
    fontSize: 14,
    color: COLORS.primary,
  },
});

