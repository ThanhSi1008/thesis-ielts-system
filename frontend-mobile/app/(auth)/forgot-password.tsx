import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, ROUTES } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from '@/components/ui/index';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { Button, FormField, Text, PasswordStrengthIndicator } from '@/components';

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { colors } = useTheme();
  const router = useRouter();

  const handleSendCode = async () => {
    if (!email) {
      toast.error('Error', 'Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Simulate network request
    setTimeout(async () => {
      setIsLoading(false);
      setStep(2);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.success('Code Sent', 'We have sent a verification code to your email.');
    }, 1500);
  };

  const handleResetPassword = async () => {
    if (!otp || !password || !confirmPassword) {
      toast.error('Error', 'Please fill in all fields');
      return;
    }

    if (otp.length < 4) {
      toast.error('Invalid Code', 'Please enter the 4-digit verification code');
      return;
    }

    if (password.length < 8) {
      toast.error('Password Too Short', 'Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simulate password reset request
    setTimeout(async () => {
      setIsLoading(false);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.success('Password Reset Successful', 'You can now log in with your new password.');
      setTimeout(() => {
        router.replace(ROUTES.login);
      }, 1500);
    }, 1500);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 2) {
      setStep(1);
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={handleBack}
          style={[styles.backButton, { borderColor: colors.border }]}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Back button"
          accessibilityHint="Double tap to go back to the previous step or login screen"
        >
          <Ionicons name="arrow-back-outline" size={24} color={colors.text} />
        </TouchableOpacity>

        {step === 1 ? (
          <View style={styles.content}>
            <View style={styles.header}>
              <Text variant="display" color="primary" weight="bold" style={styles.title}>
                Forgot Password
              </Text>
              <Text variant="body" style={[styles.subtitle, { color: colors.textSecondary }]}>
                Enter your email address to receive a secure password reset verification code.
              </Text>
            </View>

            <View style={styles.form}>
              <FormField
                label="Email Address"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                leftIcon="mail-outline"
                autoCapitalize="none"
                keyboardType="email-address"
                accessibilityLabel="Email Address input field"
                accessibilityHint="Double tap to enter your email address"
              />

              <Button
                title="Send Verification Code"
                onPress={handleSendCode}
                loading={isLoading}
                fullWidth
                style={styles.actionButton}
                accessibilityLabel="Send Verification Code button"
                accessibilityHint="Double tap to request a password reset code"
              />
            </View>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.header}>
              <Text variant="display" color="primary" weight="bold" style={styles.title}>
                Reset Password
              </Text>
              <Text variant="body" style={[styles.subtitle, { color: colors.textSecondary }]}>
                Enter the code sent to your email and choose a strong new password.
              </Text>
            </View>

            <View style={styles.form}>
              <FormField
                label="Verification Code"
                placeholder="Enter 4-digit code"
                value={otp}
                onChangeText={setOtp}
                leftIcon="key-outline"
                keyboardType="number-pad"
                maxLength={4}
                accessibilityLabel="Verification Code input field"
                accessibilityHint="Double tap to enter the 4-digit reset code sent to your email"
              />

              <View style={styles.passwordContainer}>
                <FormField
                  label="New Password"
                  placeholder="Create a new password"
                  value={password}
                  onChangeText={setPassword}
                  leftIcon="lock-closed-outline"
                  secureTextEntry
                  accessibilityLabel="New Password input field"
                  accessibilityHint="Double tap to enter your new password"
                />
                <PasswordStrengthIndicator password={password} />
              </View>

              <FormField
                label="Confirm New Password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                leftIcon="lock-closed-outline"
                secureTextEntry
                accessibilityLabel="Confirm New Password input field"
                accessibilityHint="Double tap to re-enter your new password to confirm it"
              />

              <Button
                title="Reset Password"
                onPress={handleResetPassword}
                loading={isLoading}
                fullWidth
                style={styles.actionButton}
                accessibilityLabel="Reset Password button"
                accessibilityHint="Double tap to reset your password and complete recovery"
              />
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginTop: Platform.OS === 'ios' ? 20 : 10,
    marginBottom: SPACING.xxl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    marginBottom: SPACING.xxxl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  passwordContainer: {
    marginBottom: SPACING.md,
  },
  actionButton: {
    marginTop: SPACING.lg,
  },
});
