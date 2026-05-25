import { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, ROUTES } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from '@/components/ui/index';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Haptics from 'expo-haptics';
import { Button, FormField, Text, PasswordStrengthIndicator } from '@/components';

WebBrowser.maybeCompleteAuthSession();

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register: registerUser, loginWithGoogle, isLoading } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId:
      process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
      'your-google-client-id.apps.googleusercontent.com',
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) {
        handleGoogleSuccess(id_token);
      }
    } else if (response?.type === 'error') {
      toast.error('Google Login Failed', 'Authentication failed or was canceled.');
    }
  }, [response]);

  const handleGoogleSuccess = async (idToken: string) => {
    try {
      await loginWithGoogle(idToken);
    } catch (error: any) {
      toast.error('Google Login Failed', error.message || 'Something went wrong');
    }
  };

  const handleRegister = async () => {
    if (!email || !fullName || !password || !confirmPassword) {
      toast.error('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Error', 'Passwords do not match');
      return;
    }

    try {
      let firstName = 'User';
      let lastName = 'User';

      if (fullName.trim()) {
        const parts = fullName.trim().split(/\s+/);
        if (parts.length > 1) {
          lastName = parts.pop() || 'User';
          firstName = parts.join(' ');
        } else {
          firstName = parts[0];
          lastName = parts[0];
        }
      }

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await registerUser({ email, password, firstName, lastName });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.success('Success', 'Account created successfully! Redirecting...');
      setTimeout(() => {
        router.replace(ROUTES.login);
      }, 1500);
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast.error('Registration Failed', error.message || 'Something went wrong');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="display" color="primary" weight="bold" style={styles.title}>
            Create Account
          </Text>
          <Text variant="body" style={[styles.subtitle, { color: colors.textSecondary }]}>
            Join IELTS Master AI today
          </Text>
        </View>

        <View style={styles.form}>
          <FormField
            label="Full Name"
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={setFullName}
            leftIcon="person-outline"
            accessibilityLabel="Full Name input field"
            accessibilityHint="Double tap to enter your full name"
          />

          <FormField
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            leftIcon="mail-outline"
            autoCapitalize="none"
            keyboardType="email-address"
            accessibilityLabel="Email Address input field"
            accessibilityHint="Double tap to enter your email address"
          />

          <View style={styles.passwordContainer}>
            <FormField
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              leftIcon="lock-closed-outline"
              secureTextEntry
              accessibilityLabel="Password input field"
              accessibilityHint="Double tap to enter your desired password"
            />
            <PasswordStrengthIndicator password={password} />
          </View>

          <FormField
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            leftIcon="lock-closed-outline"
            secureTextEntry
            accessibilityLabel="Confirm Password input field"
            accessibilityHint="Double tap to re-enter your password to confirm it"
          />

          <Button
            title="Sign Up"
            onPress={handleRegister}
            loading={isLoading}
            fullWidth
            style={styles.registerButton}
            accessibilityLabel="Sign Up button"
            accessibilityHint="Double tap to create your new account"
          />

          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text variant="caption" style={[styles.dividerText, { color: colors.textSecondary }]}>
              OR
            </Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          </View>

          <Button
            title="Continue with Google"
            onPress={() => {
              if (request) promptAsync();
            }}
            variant="google"
            leftIcon="logo-google"
            disabled={!request || isLoading}
            fullWidth
            accessibilityLabel="Continue with Google button"
            accessibilityHint="Double tap to sign in or sign up with your Google account"
          />

          <View style={styles.footer}>
            <Text variant="body" style={{ color: colors.textSecondary }}>
              Already have an account?{' '}
            </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Log In link"
                accessibilityHint="Double tap to return to the login screen"
              >
                <Text variant="body" color="primary" weight="bold">
                  Log In
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
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
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  header: {
    marginBottom: SPACING.xxxl,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  passwordContainer: {
    marginBottom: SPACING.md,
  },
  registerButton: {
    marginTop: SPACING.md,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xxl,
  },
});
