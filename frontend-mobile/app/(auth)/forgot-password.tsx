import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { Button, Text, Card } from '@/components';

export default function ForgotPasswordScreen() {
  const { colors, resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  const router = useRouter();

  const handleEmailSupport = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const email = 'support@ieltsmaster.ai';
    const subject = 'Password Reset Assistance';
    const body = 'Hello Support Team,\n\nI need assistance resetting my password for my IELTS Master account. My registered email address is: \n\nThank you.';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.openURL(url).catch(() => {
      // Fallback if mail client is not installed
      Linking.openURL('https://ieltsmaster.ai/support');
    });
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={handleBack}
          style={[styles.backButton, { borderColor: colors.border }]}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Back button"
          accessibilityHint="Double tap to go back to the login screen"
        >
          <Ionicons name="arrow-back-outline" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.content}>
          <Card variant="outlined" style={styles.noticeCard}>
            <View style={styles.iconContainer}>
              <Ionicons name="construct-outline" size={40} color="#FFC600" />
            </View>
            <Text variant="display" weight="bold" style={[styles.title, { color: colors.text }]}>
              Self-Service Reset
            </Text>
            <Text variant="body" style={[styles.subtitle, { color: colors.textSecondary }]}>
              Our automated password reset service is currently undergoing backend maintenance.
            </Text>
            <Text variant="body" style={[styles.desc, { color: colors.text }]}>
              If you forgot your password, our customer support team can securely reset it for you manually. Tap below to send a support email.
            </Text>
          </Card>

          <Button
            title="Email Support Team"
            onPress={handleEmailSupport}
            fullWidth
            style={styles.actionButton}
            leftIcon="mail-outline"
            accessibilityLabel="Email Support button"
            accessibilityHint="Double tap to open your email app and contact support"
          />

          <TouchableOpacity onPress={handleBack} style={styles.cancelLink}>
            <Text variant="body" color="textSecondary" weight="bold">
              Back to Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: SPACING.xxl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  noticeCard: {
    alignItems: 'center',
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 198, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  desc: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
    textAlign: 'center',
  },
  actionButton: {
    marginTop: SPACING.md,
  },
  cancelLink: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    paddingVertical: SPACING.sm,
  },
});
