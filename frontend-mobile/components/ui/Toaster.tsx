import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Toast, { ToastConfig } from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, SPACING } from '@/constants';

// Helper singleton for easy toast dispatching
export const toast = {
  success: (title: string, message?: string, onPress?: () => void) => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
      onPress: onPress ? () => {
        onPress();
        Toast.hide();
      } : undefined,
    });
  },
  error: (title: string, message?: string, onPress?: () => void) => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 5000,
      autoHide: true,
      onPress: onPress ? () => {
        onPress();
        Toast.hide();
      } : undefined,
    });
  },
  info: (title: string, message?: string, onPress?: () => void) => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
      onPress: onPress ? () => {
        onPress();
        Toast.hide();
      } : undefined,
    });
  },
  loading: (title: string, message?: string, onPress?: () => void) => {
    Toast.show({
      type: 'loading',
      text1: title,
      text2: message,
      position: 'top',
      autoHide: false,
      onPress: onPress ? () => {
        onPress();
        Toast.hide();
      } : undefined,
    });
  },
  update: (id: string, options: { type?: 'success' | 'error' | 'info' | 'loading'; title: string; message?: string; onPress?: () => void }) => {
    Toast.show({
      type: options.type || 'success',
      text1: options.title,
      text2: options.message,
      position: 'top',
      visibilityTime: options.type === 'loading' ? undefined : 4000,
      autoHide: options.type !== 'loading',
      onPress: options.onPress ? () => {
        options.onPress!();
        Toast.hide();
      } : undefined,
    });
  },
  hide: () => {
    Toast.hide();
  },
};

// Premium Custom Toast UI Config
const toastConfig: ToastConfig = {
  success: ({ text1, text2 }) => (
    <View style={[styles.container, styles.successBorder]}>
      <View style={[styles.iconContainer, styles.successBg]}>
        <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.titleText}>{text1}</Text>
        {text2 ? <Text style={styles.bodyText}>{text2}</Text> : null}
      </View>
    </View>
  ),
  error: ({ text1, text2 }) => (
    <View style={[styles.container, styles.errorBorder]}>
      <View style={[styles.iconContainer, styles.errorBg]}>
        <Ionicons name="alert-circle" size={24} color={COLORS.error} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.titleText}>{text1}</Text>
        {text2 ? <Text style={styles.bodyText}>{text2}</Text> : null}
      </View>
    </View>
  ),
  info: ({ text1, text2 }) => (
    <View style={[styles.container, styles.infoBorder]}>
      <View style={[styles.iconContainer, styles.infoBg]}>
        <Ionicons name="information-circle" size={24} color={COLORS.info} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.titleText}>{text1}</Text>
        {text2 ? <Text style={styles.bodyText}>{text2}</Text> : null}
      </View>
    </View>
  ),
  loading: ({ text1, text2 }) => (
    <View style={[styles.container, styles.loadingBorder]}>
      <View style={styles.iconContainer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.titleText}>{text1}</Text>
        {text2 ? <Text style={styles.bodyText}>{text2}</Text> : null}
      </View>
    </View>
  ),
};

export function Toaster() {
  return <Toast config={toastConfig} />;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    backgroundColor: COLORS.gray[900], // Premium deep background
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
    marginTop: 10, // Safe distance from top/notch if position top
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 18,
  },
  bodyText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  successBg: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
  },
  successBorder: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  errorBg: {
    backgroundColor: 'rgba(244, 67, 54, 0.15)',
  },
  errorBorder: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  infoBg: {
    backgroundColor: 'rgba(33, 150, 243, 0.15)',
  },
  infoBorder: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
  },
  loadingBorder: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
});
