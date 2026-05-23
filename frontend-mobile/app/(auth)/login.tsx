import { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from '@/components/ui/index';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Button, FormField, Text } from '@/components';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login, loginWithGoogle, isLoading } = useAuth();
  const { colors } = useTheme();
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId:
      process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
      'your-google-client-id.apps.googleusercontent.com',
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    AsyncStorage.getItem('@remembered_email').then((savedEmail) => {
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    });
  }, []);

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
      // Redirect handled by AuthContext
    } catch (error: any) {
      toast.error('Google Login Failed', error.message || 'Something went wrong');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Error', 'Please fill in all fields');
      return;
    }

    try {
      await login({ email, password });
      if (rememberMe) {
        await AsyncStorage.setItem('@remembered_email', email);
      } else {
        await AsyncStorage.removeItem('@remembered_email');
      }
      // Redirect handled by AuthContext
    } catch (error: any) {
      let message = 'An error occurred during login';
      if (error.message === 'Invalid credentials') {
        message = 'Incorrect email or password';
      } else if (error.message) {
        message = error.message;
      }
      toast.error('Login Failed', message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text variant="display" color="primary" weight="bold" style={styles.title}>
          Welcome Back!
        </Text>
        <Text variant="body" style={[styles.subtitle, { color: colors.textSecondary }]}>
          Sign in to continue your learning journey
        </Text>
      </View>

      <View style={styles.form}>
        <FormField
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          leftIcon="mail-outline"
          autoCapitalize="none"
          keyboardType="email-address"
          onClear={() => setEmail('')}
          accessibilityLabel="Email Address input field"
          accessibilityHint="Double tap to enter your email address"
        />

        <FormField
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          leftIcon="lock-closed-outline"
          secureTextEntry
          accessibilityLabel="Password input field"
          accessibilityHint="Double tap to enter your password"
        />

        <View style={styles.rememberForgotRow}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setRememberMe(!rememberMe);
            }}
            style={styles.rememberMeContainer}
            accessible={true}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: rememberMe }}
            accessibilityLabel="Remember email checkbox"
            accessibilityHint="Double tap to toggle remembering your email address"
          >
            <Ionicons
              name={rememberMe ? 'checkbox' : 'square-outline'}
              size={20}
              color={rememberMe ? COLORS.primary : colors.textMuted}
            />
            <Text variant="body" style={{ color: colors.text }}>
              Remember me
            </Text>
          </TouchableOpacity>

          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Forgot Password link"
              accessibilityHint="Double tap to open the password recovery screen"
            >
              <Text variant="body" color="primary" weight="bold">
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </Link>
        </View>

        <Button 
          title="Log In" 
          onPress={handleLogin} 
          loading={isLoading} 
          fullWidth 
          accessibilityLabel="Log In button"
          accessibilityHint="Double tap to log into your account"
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
          variant="outline"
          leftIcon="logo-google"
          disabled={!request || isLoading}
          fullWidth
          accessibilityLabel="Continue with Google button"
          accessibilityHint="Double tap to sign in with your Google account"
        />

        <View style={styles.footer}>
          <Text variant="body" style={{ color: colors.textSecondary }}>
            Don't have an account?{' '}
          </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Sign Up"
              accessibilityHint="Double tap to open the registration screen"
            >
              <Text variant="body" color="primary" weight="bold">
                Sign Up
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  rememberForgotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    marginTop: -SPACING.sm,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
