import React from 'react';
import { View, Text, Switch, TextInput, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeMode } from '@/contexts/ThemeContext';

interface SettingsTabProps {
  user: any;
  isDarkMode: boolean;
  toggleDarkMode: (value: boolean) => Promise<void>;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (value: boolean) => void;
  permissionStatus: string | null;
  currentPassword: string;
  setCurrentPassword: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  saving: boolean;
  handleChangePassword: () => Promise<void>;
  handleDeleteAccount: () => void;
  styles: any;
}

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: string }[] = [
  { mode: 'light', label: 'Light', icon: 'sunny-outline' },
  { mode: 'dark', label: 'Dark', icon: 'moon-outline' },
  { mode: 'system', label: 'System', icon: 'phone-portrait-outline' },
];

export function ProfileSettingsTab({
  user,
  isDarkMode,
  toggleDarkMode,
  notificationsEnabled,
  setNotificationsEnabled,
  permissionStatus,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  saving,
  handleChangePassword,
  handleDeleteAccount,
  styles,
}: SettingsTabProps) {
  const { theme, setTheme, colors } = useTheme();

  return (
    <View style={styles.section}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>App Preferences</Text>

        {/* ── Theme Selector: 3-button Light / Dark / System (P17-19) ── */}
        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <Ionicons name="contrast-outline" size={22} color={colors.textSecondary} />
            <Text style={{ fontFamily: FONTS.medium, fontSize: 15, color: colors.text }}>
              Appearance
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: colors.surface,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 4,
              gap: 4,
            }}
          >
            {THEME_OPTIONS.map(({ mode, label, icon }) => {
              const active = theme === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setTheme(mode)}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                    paddingVertical: 9,
                    borderRadius: 10,
                    backgroundColor: active ? COLORS.primary : 'transparent',
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={icon as any}
                    size={15}
                    color={active ? '#212529' : colors.textSecondary}
                  />
                  <Text
                    style={{
                      fontFamily: active ? FONTS.bold : FONTS.medium,
                      fontSize: 13,
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

        {/* Notifications Toggle */}
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="notifications" size={22} color={colors.textSecondary} />
            <Text style={styles.settingText}>Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            disabled={permissionStatus === 'denied'}
            trackColor={{ false: '#CBD5E1', true: COLORS.primary }}
          />
        </View>

        {permissionStatus === 'denied' && (
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: isDarkMode ? '#450A0A' : '#FEF2F2',
              borderWidth: 1,
              borderColor: isDarkMode ? '#7F1D1D' : '#FCA5A5',
              borderRadius: 12,
              padding: 12,
              marginTop: 12,
              gap: 10,
            }}
            onPress={() => Linking.openSettings()}
          >
            <Ionicons name="warning-outline" size={20} color="#EF4444" />
            <Text
              style={{
                flex: 1,
                fontSize: 13,
                fontFamily: FONTS.medium,
                color: isDarkMode ? '#FCA5A5' : '#B91C1C',
                lineHeight: 18,
              }}
            >
              Notifications are denied. Tap here to open Settings and enable them.
            </Text>
            <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#FCA5A5' : '#B91C1C'} />
          </TouchableOpacity>
        )}
      </View>

      {user.googleId ? (
        <View style={[styles.card, { flexDirection: 'row', alignItems: 'center', gap: 16 }]}>
          <View style={styles.googleIconBox}>
            <Ionicons name="logo-google" size={24} color="#4285F4" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.googleTitle}>Signed in with Google</Text>
            <Text style={styles.googleDesc}>
              Password management is handled by your Google account.
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Change Password</Text>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Current Password"
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              secureTextEntry
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
            />
          </View>
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={handleChangePassword}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.primary} size="small" />
            ) : (
              <Text style={styles.outlineBtnText}>Update Password</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.card, styles.dangerCard]}>
        <Text style={styles.dangerTitle}>Danger Zone</Text>
        <TouchableOpacity style={styles.dangerBtn} onPress={handleDeleteAccount}>
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
          <Text style={styles.dangerBtnText}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.versionText}>Version 1.0.0</Text>
    </View>
  );
}
