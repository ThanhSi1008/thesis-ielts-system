import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  DeviceEventEmitter,
  ScrollView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, SPACING } from '@/constants';
import { LinearGradient } from 'expo-linear-gradient';

export function openUpgradeModal() {
  DeviceEventEmitter.emit('open-upgrade-modal');
}

export function UpgradeModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const listener = DeviceEventEmitter.addListener('open-upgrade-modal', () => {
      setVisible(true);
    });
    return () => {
      listener.remove();
    };
  }, []);

  const handleUpgrade = () => {
    setVisible(false);
    router.push('/pricing');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.overlay}>
        {/* Click outside to close */}
        <TouchableOpacity
          style={styles.dismissArea}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        />

        {/* Premium Bottom Sheet Container */}
        <View style={styles.sheet}>
          {/* Header Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setVisible(false)}
            hitSlop={12}
          >
            <Ionicons name="close" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            {/* Visual Gold Crown */}
            <LinearGradient
              colors={['#FFE082', '#FFC600', '#FFA000']}
              style={styles.crownWrapper}
            >
              <Ionicons name="ribbon" size={28} color="#0F172A" />
            </LinearGradient>

            <Text style={styles.title}>Unlock IELTS Master Premium</Text>
            <Text style={styles.subtitle}>
              Take your exam preparation to the next level with our complete suite of AI-driven premium capabilities.
            </Text>

            {/* Benefits List */}
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <View style={styles.checkIcon}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                </View>
                <View style={styles.benefitTextCol}>
                  <Text style={styles.benefitTitle}>Unlimited AI Essay & Speaking Grading</Text>
                  <Text style={styles.benefitDesc}>Get detailed IELTS band score breakdown, grammar fixes, and vocab alternatives instantly.</Text>
                </View>
              </View>

              <View style={styles.benefitItem}>
                <View style={styles.checkIcon}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                </View>
                <View style={styles.benefitTextCol}>
                  <Text style={styles.benefitTitle}>Complete Vocab & Grammar Vaults</Text>
                  <Text style={styles.benefitDesc}>Unlock community marketplaces, premium flashcards, and advanced exercises.</Text>
                </View>
              </View>

              <View style={styles.benefitItem}>
                <View style={styles.checkIcon}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                </View>
                <View style={styles.benefitTextCol}>
                  <Text style={styles.benefitTitle}>Advanced Shadowing Video Practices</Text>
                  <Text style={styles.benefitDesc}>Record, repeat, and let the AI grade your pronunciation and fluency in real-time.</Text>
                </View>
              </View>
            </View>

            {/* Premium CTA Button */}
            <TouchableOpacity style={styles.primaryButton} onPress={handleUpgrade} activeOpacity={0.8}>
              <LinearGradient
                colors={['#FFD54F', '#FFC600', '#FFB300']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.primaryButtonText}>View Subscription Pricing</Text>
                <Ionicons name="chevron-forward" size={16} color="#0F172A" style={styles.btnArrow} />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={() => setVisible(false)}>
              <Text style={styles.secondaryButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#1E293B', // Premium dark slate surface
    borderTopLeftRadius: RADIUS.xl * 2,
    borderTopRightRadius: RADIUS.xl * 2,
    paddingTop: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    maxHeight: '85%',
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: RADIUS.full,
    alignSelf: 'center',
    marginBottom: SPACING.sm,
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.lg,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xxl + 10 : SPACING.xl,
  },
  crownWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    shadowColor: '#FFC600',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.sm,
  },
  benefitsList: {
    width: '100%',
    gap: SPACING.lg,
    marginBottom: SPACING.xxl,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  checkIcon: {
    marginTop: 2,
  },
  benefitTextCol: {
    flex: 1,
  },
  benefitTitle: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  benefitDesc: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 16,
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
  },
  primaryButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#0F172A',
  },
  btnArrow: {
    marginLeft: SPACING.xs,
  },
  secondaryButton: {
    paddingVertical: SPACING.sm,
  },
  secondaryButtonText: {
    fontFamily: FONTS.semibold,
    fontSize: 13,
    color: COLORS.textMuted,
  },
});

