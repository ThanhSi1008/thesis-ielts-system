import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { subscriptionsApi } from '@/services/features.api';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { COLORS, FONTS, STORAGE_KEYS, ROUTES } from '@/constants';
import { SafeAreaView } from 'react-native-safe-area-context';

type PaymentStatus = 'verifying' | 'success' | 'failed';

const VNPAY_ERRORS: Record<string, string> = {
  '07': 'Transaction suspected of fraud. Money deducted — contact your bank.',
  '09': 'Your card/account is not registered for Internet Banking.',
  '10': 'Verification failed. You have exceeded the allowed attempts (3 times).',
  '11': 'Payment timeout. Please try again.',
  '12': 'Your card/account has been locked.',
  '13': 'Incorrect OTP. Please try again.',
  '24': 'Transaction canceled by user.',
  '51': 'Insufficient account balance.',
  '65': 'Transaction limit exceeded for today.',
  '75': 'Your bank is under maintenance.',
  '79': 'Too many incorrect password attempts. Please try again later.',
  '99': 'An unknown error occurred.',
};

function getVnpayErrorMessage(code: string): string {
  return VNPAY_ERRORS[code] ?? `Payment failed (error code: ${code}). Please try again.`;
}

export default function VnpayReturnScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { refresh } = useSubscription();
  const systemColorScheme = useColorScheme();

  const [status, setStatus] = useState<PaymentStatus>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(systemColorScheme === 'dark');
  const verifiedRef = useRef(false);

  // Read theme from storage as well
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.THEME).then((val) => {
      if (val) {
        setIsDarkMode(val === 'dark');
      }
    });
  }, []);

  const styles = dynamicStyles(isDarkMode);

  useEffect(() => {
    // Prevent double execution in dev/Strict Mode
    if (verifiedRef.current) return;
    verifiedRef.current = true;

    const verify = async () => {
      // Cast params to Record<string, string>
      const vnpParams: Record<string, string> = {};
      Object.keys(params).forEach((key) => {
        const val = params[key];
        if (typeof val === 'string') {
          vnpParams[key] = val;
        } else if (Array.isArray(val) && val.length > 0) {
          vnpParams[key] = val[0];
        }
      });

      const txnRef = vnpParams['vnp_TxnRef'];
      const responseCode = vnpParams['vnp_ResponseCode'];

      // Early check: if VNPay reported failure
      if (responseCode && responseCode !== '00') {
        setStatus('failed');
        setErrorMessage(getVnpayErrorMessage(responseCode));
        return;
      }

      if (!txnRef) {
        setStatus('failed');
        setErrorMessage('Missing transaction reference. Please contact support.');
        return;
      }

      try {
        await subscriptionsApi.verifyCheckout(txnRef, vnpParams);
        await refresh();
        setStatus('success');
      } catch (err: any) {
        setStatus('failed');
        setErrorMessage(
          err?.response?.data?.message || err?.message || 'Payment verification failed. Please try again.'
        );
      }
    };

    verify();
  }, [params, refresh]);

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <View style={styles.card}>
            <ActivityIndicator size="large" color={COLORS.primary} style={styles.spinner} />
            <Text style={styles.title}>Verifying Payment...</Text>
            <Text style={styles.description}>
              Please wait while we confirm your payment with VNPay.
            </Text>
            <Text style={styles.subtext}>Do not close this screen.</Text>
          </View>
        );
      case 'success':
        return (
          <View style={styles.card}>
            <Ionicons name="checkmark-circle" size={80} color="#22C55E" style={styles.icon} />
            <Text style={[styles.title, styles.titleSuccess]}>Payment Successful!</Text>
            <Text style={styles.description}>
              Your subscription has been successfully activated. Enjoy your premium features!
            </Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => router.replace(ROUTES.profile as any)}
            >
              <Text style={styles.primaryBtnText}>Go to Profile</Text>
            </TouchableOpacity>
          </View>
        );
      case 'failed':
      default:
        return (
          <View style={styles.card}>
            <Ionicons name="close-circle" size={80} color="#EF4444" style={styles.icon} />
            <Text style={[styles.title, styles.titleFailed]}>Payment Failed</Text>
            <Text style={styles.description}>
              {errorMessage || 'Something went wrong with your payment. Please try again.'}
            </Text>
            <View style={styles.btnGroup}>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => router.replace(ROUTES.pricing as any)}
              >
                <Text style={styles.primaryBtnText}>Try Again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => router.replace('/' as any)}
              >
                <Text style={styles.secondaryBtnText}>Back to Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
    }
  };

  const txnRefVal = Array.isArray(params['vnp_TxnRef']) ? params['vnp_TxnRef'][0] : params['vnp_TxnRef'];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <View style={styles.container}>
        {renderContent()}

        {status !== 'verifying' && txnRefVal && (
          <Text style={styles.footerText}>Transaction Ref: {txnRefVal}</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

function dynamicStyles(isDark: boolean) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
    },
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    card: {
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderRadius: 24,
      padding: 32,
      width: '100%',
      maxWidth: 400,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 16,
      elevation: 4,
    },
    spinner: {
      marginBottom: 24,
    },
    icon: {
      marginBottom: 20,
    },
    title: {
      fontFamily: FONTS.bold,
      fontSize: 24,
      color: isDark ? '#F8FAFC' : '#0F172A',
      textAlign: 'center',
      marginBottom: 12,
    },
    titleSuccess: {
      color: '#22C55E',
    },
    titleFailed: {
      color: '#EF4444',
    },
    description: {
      fontFamily: FONTS.regular,
      fontSize: 15,
      color: isDark ? '#94A3B8' : '#64748B',
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 28,
    },
    subtext: {
      fontFamily: FONTS.medium,
      fontSize: 13,
      color: isDark ? '#64748B' : '#94A3B8',
    },
    primaryBtn: {
      backgroundColor: COLORS.primary,
      borderRadius: 14,
      paddingVertical: 16,
      width: '100%',
      alignItems: 'center',
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 2,
    },
    primaryBtnText: {
      fontFamily: FONTS.bold,
      fontSize: 16,
      color: '#FFFFFF',
    },
    btnGroup: {
      width: '100%',
      gap: 12,
    },
    secondaryBtn: {
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      borderRadius: 14,
      paddingVertical: 16,
      width: '100%',
      alignItems: 'center',
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
    },
    secondaryBtnText: {
      fontFamily: FONTS.bold,
      fontSize: 16,
      color: isDark ? '#94A3B8' : '#475569',
    },
    footerText: {
      marginTop: 24,
      fontFamily: FONTS.regular,
      fontSize: 12,
      color: isDark ? '#475569' : '#94A3B8',
    },
  });
}
