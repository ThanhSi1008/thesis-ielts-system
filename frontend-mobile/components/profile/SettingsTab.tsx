import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeMode } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { notificationsApi } from '@/services';
import { apiClient } from '@/services/api-client';
import { toast } from '@/components/ui/index';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemedStyles } from '@/hooks/useThemedStyles';

import { Switch, Text } from '../atoms';
import { Card, ListItem } from '../molecules';
import ConfirmDialog from '../organisms/ConfirmDialog';

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: string }[] = [
  { mode: 'light', label: 'Light', icon: 'sunny-outline' },
  { mode: 'dark', label: 'Dark', icon: 'moon-outline' },
  { mode: 'system', label: 'System', icon: 'phone-portrait-outline' },
];

export function ProfileSettingsTab() {
  const { user, logout } = useAuth();
  const { theme, setTheme, colors, resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  const styles = useThemedStyles(createStyles);

  // Notification states & hooks
  const { permissionStatus, requestPushPermission, pushToken } = useNotification();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Password & Action states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
  const [showNotifDeniedConfirm, setShowNotifDeniedConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Sync notificationsEnabled with actual permissions and user settings
  useEffect(() => {
    const loadNotifSetting = async () => {
      const localVal = await AsyncStorage.getItem('notifications-local-enabled');
      const isGranted = permissionStatus === 'granted';
      if (localVal === 'false') {
        setNotificationsEnabled(false);
      } else {
        setNotificationsEnabled(isGranted);
      }
    };
    loadNotifSetting();
  }, [permissionStatus]);

  const handleToggleNotifications = async (value: boolean) => {
    if (value) {
      if (permissionStatus === 'denied') {
        setShowNotifDeniedConfirm(true);
      } else {
        const granted = await requestPushPermission();
        if (granted) {
          setNotificationsEnabled(true);
          await AsyncStorage.setItem('notifications-local-enabled', 'true');
          toast.success('Enabled', 'Notifications have been enabled');
        } else {
          setNotificationsEnabled(false);
          await AsyncStorage.setItem('notifications-local-enabled', 'false');
        }
      }
    } else {
      try {
        if (pushToken) {
          await notificationsApi.removePushToken(pushToken);
        }
        setNotificationsEnabled(false);
        await AsyncStorage.setItem('notifications-local-enabled', 'false');
        toast.success('Disabled', 'Notifications have been disabled');
      } catch (error) {
        if (__DEV__) console.error('Failed to disable notifications:', error);
        toast.error('Error', 'Failed to disable notifications');
      }
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Error', 'Please fill in all password fields');
      return;
    }
    setSaving(true);
    try {
      await apiClient.post('/auth/change-password', { currentPassword, newPassword });
      toast.success('Success', 'Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      toast.error('Error', error.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await apiClient.delete('/users/me');
      await logout();
    } catch (error: any) {
      toast.error('Error', error.message || 'Failed to delete account');
    }
  };

  if (!user) return null;

  return (
    <View style={styles.section}>
      {/* 1. APPEARANCE GROUP */}
      <Text variant="title" weight="bold" color="text" style={styles.sectionTitle}>
        Appearance
      </Text>
      <Card variant="outlined" style={styles.card}>
        <View style={{ marginBottom: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Ionicons name="contrast-outline" size={20} color={colors.textSecondary} />
            <Text variant="body" weight="bold" color="text">
              Theme Options
            </Text>
          </View>
          <View style={styles.themeSelector}>
            {THEME_OPTIONS.map(({ mode, label, icon }) => {
              const active = theme === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setTheme(mode)}
                  style={[
                    styles.themeBtn,
                    active && { backgroundColor: colors.primary },
                  ]}
                  activeOpacity={0.8}
                  accessible={true}
                  accessibilityRole="radio"
                  accessibilityLabel={`${label} theme`}
                  accessibilityState={{ checked: active }}
                  accessibilityHint={`Double tap to apply ${label} theme mode`}
                >
                  <Ionicons
                    name={icon as any}
                    size={15}
                    color={active ? '#212529' : colors.textSecondary}
                  />
                  <Text
                    variant="caption"
                    weight="bold"
                    style={{
                      color: active ? '#212529' : colors.textSecondary,
                    }}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Card>

      {/* 2. NOTIFICATIONS GROUP */}
      <Text variant="title" weight="bold" color="text" style={styles.sectionTitle}>
        Notifications
      </Text>
      <Card variant="outlined" style={styles.card}>
        <ListItem
          variant="with-control"
          title="Push Notifications"
          subtitle="Receive daily streak reminders and grading"
          leftIcon="notifications-outline"
          rightElement={
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              disabled={permissionStatus === 'denied'}
            />
          }
        />

        {permissionStatus === 'denied' && (
          <TouchableOpacity
            style={styles.notifDeniedPanel}
            onPress={() => Linking.openSettings()}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Notifications denied warning button"
            accessibilityHint="Double tap to open device settings and permit notification access"
          >
            <Ionicons name="warning-outline" size={20} color="#EF4444" />
            <Text variant="caption" weight="medium" style={styles.notifDeniedText}>
              Notifications are denied. Tap here to open Settings and enable them.
            </Text>
            <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#FCA5A5' : '#B91C1C'} />
          </TouchableOpacity>
        )}
      </Card>

      {/* 3. ACCOUNT GROUP */}
      <Text variant="title" weight="bold" color="text" style={styles.sectionTitle}>
        Account
      </Text>
      {user.googleId ? (
        <Card variant="outlined" style={[styles.card, { flexDirection: 'row', alignItems: 'center', gap: 16 }]}>
          <View style={styles.googleIconBox}>
            <Ionicons name="logo-google" size={24} color="#4285F4" />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="body" weight="bold" color="text">
              Signed in with Google
            </Text>
            <Text variant="caption" color="textSecondary" style={{ marginTop: 2 }}>
              Password management is handled by your Google account.
            </Text>
          </View>
        </Card>
      ) : (
        <Card variant="outlined" style={styles.card}>
          <Text variant="body" weight="bold" color="text" style={{ marginBottom: 16 }}>
            Change Password
          </Text>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Current Password"
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              secureTextEntry
              accessibilityLabel="Current password input field"
              accessibilityHint="Double tap to enter your current password"
            />
          </View>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New Password"
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              secureTextEntry
              accessibilityLabel="New password input field"
              accessibilityHint="Double tap to enter your new password"
            />
          </View>
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={handleChangePassword}
            disabled={saving}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Update Password button"
            accessibilityHint="Double tap to submit your new password"
            accessibilityState={{ disabled: saving }}
          >
            {saving ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Text variant="body" weight="bold" style={styles.outlineBtnText}>
                Update Password
              </Text>
            )}
          </TouchableOpacity>
        </Card>
      )}

      {/* Danger Zone within Account */}
      <Card variant="outlined" style={[styles.card, styles.dangerCard]}>
        <Text variant="body" weight="bold" style={styles.dangerTitle}>
          Danger Zone
        </Text>
        <TouchableOpacity
          style={styles.dangerBtn}
          onPress={() => setShowDeleteAccountConfirm(true)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Delete Account button"
          accessibilityHint="Double tap to open account deletion confirmation dialog"
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
          <Text variant="body" weight="bold" style={styles.dangerBtnText}>
            Delete Account
          </Text>
        </TouchableOpacity>
      </Card>

      {/* 4. SUPPORT GROUP */}
      <Text variant="title" weight="bold" color="text" style={styles.sectionTitle}>
        Support
      </Text>
      <Card variant="outlined" style={styles.card}>
        <ListItem
          variant="with-icon"
          title="Help Center & Feedback"
          subtitle="Get help or report a bug"
          leftIcon="help-circle-outline"
          showChevron
          onPress={() => Linking.openURL('https://ieltsmaster.ai/support').catch(() => {})}
        />
        <ListItem
          variant="with-icon"
          title="Privacy Policy"
          subtitle="Read our privacy practices"
          leftIcon="shield-checkmark-outline"
          showChevron
          onPress={() => Linking.openURL('https://ieltsmaster.ai/privacy').catch(() => {})}
        />
        <ListItem
          variant="with-icon"
          title="Terms of Service"
          subtitle="Read our user terms and policies"
          leftIcon="document-text-outline"
          showChevron
          onPress={() => Linking.openURL('https://ieltsmaster.ai/terms').catch(() => {})}
        />
      </Card>

      <View style={styles.logoutWrapper}>
        <TouchableOpacity
          style={styles.fullLogoutBtn}
          onPress={() => setShowLogoutConfirm(true)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Log Out button"
          accessibilityHint="Double tap to open log out confirmation dialog"
        >
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text variant="body" weight="bold" style={styles.fullLogoutBtnText}>
            Log Out
          </Text>
        </TouchableOpacity>
      </View>

      <Text variant="caption" color="textMuted" style={styles.versionText}>
        Version 1.0.0
      </Text>

      {/* Local Dialogs */}
      <ConfirmDialog
        visible={showDeleteAccountConfirm}
        onClose={() => setShowDeleteAccountConfirm(false)}
        variant="destructive"
        title="Delete Account"
        message="Are you sure you want to permanently delete your account? This action cannot be undone."
        primaryAction={{
          title: 'Delete',
          onPress: () => {
            setShowDeleteAccountConfirm(false);
            handleDeleteAccount();
          },
        }}
        secondaryAction={{
          title: 'Cancel',
          onPress: () => setShowDeleteAccountConfirm(false),
        }}
      />

      <ConfirmDialog
        visible={showNotifDeniedConfirm}
        onClose={() => setShowNotifDeniedConfirm(false)}
        variant="info"
        title="Notifications Denied"
        message="Please enable notifications in system settings to receive streak reminders and grading results."
        primaryAction={{
          title: 'Open Settings',
          onPress: () => {
            setShowNotifDeniedConfirm(false);
            Linking.openSettings();
          },
        }}
        secondaryAction={{
          title: 'Cancel',
          onPress: () => setShowNotifDeniedConfirm(false),
        }}
      />

      <ConfirmDialog
        visible={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        variant="destructive"
        title="Log Out"
        message="Are you sure you want to log out?"
        primaryAction={{
          title: 'Log Out',
          onPress: async () => {
            setShowLogoutConfirm(false);
            try {
              await logout();
            } catch (error) {
              if (__DEV__) console.error('Logout failed', error);
            }
          },
        }}
        secondaryAction={{
          title: 'Cancel',
          onPress: () => setShowLogoutConfirm(false),
        }}
      />
    </View>
  );
}

const createStyles = (colors: any) => {
  const isDark = colors.statusBar === 'light-content';
  return StyleSheet.create({
    section: {
      padding: 16,
    },
    sectionTitle: {
      marginTop: 8,
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    themeSelector: {
      flexDirection: 'row',
      backgroundColor: colors.bgSubtle,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 4,
      gap: 4,
    },
    themeBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      borderRadius: 10,
    },
    notifDeniedPanel: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#450A0A' : '#FEF2F2',
      borderWidth: 1,
      borderColor: isDark ? '#7F1D1D' : '#FCA5A5',
      borderRadius: 12,
      padding: 12,
      marginTop: 12,
      gap: 10,
    },
    notifDeniedText: {
      flex: 1,
      color: isDark ? '#FCA5A5' : '#B91C1C',
      lineHeight: 18,
    },
    googleIconBox: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputGroup: {
      marginBottom: 16,
    },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontFamily: FONTS.regular,
      fontSize: 15,
      color: colors.text,
    },
    outlineBtn: {
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 8,
    },
    outlineBtnText: {
      color: colors.primary,
    },
    dangerCard: {
      borderColor: isDark ? '#7f1d1d' : '#FECACA',
      borderWidth: 1,
    },
    dangerTitle: {
      color: '#EF4444',
      marginBottom: 16,
      textTransform: 'uppercase',
      letterSpacing: 1,
      fontSize: 14,
    },
    dangerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      gap: 8,
    },
    dangerBtnText: {
      color: '#EF4444',
    },
    versionText: {
      textAlign: 'center',
      marginTop: 8,
      marginBottom: 16,
    },
    logoutWrapper: {
      marginTop: 8,
      marginBottom: 24,
    },
    fullLogoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      paddingVertical: 16,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: colors.border,
      shadowColor: '#EF4444',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 2,
      gap: 8,
    },
    fullLogoutBtnText: {
      fontSize: 16,
      color: '#EF4444',
      fontFamily: FONTS.bold,
    },
  });
};
