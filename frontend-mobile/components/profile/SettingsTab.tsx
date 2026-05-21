import React from 'react';
import { View, Text, Switch, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants';

interface SettingsTabProps {
  user: any;
  isDarkMode: boolean;
  toggleDarkMode: (value: boolean) => Promise<void>;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (value: boolean) => void;
  currentPassword: string;
  setCurrentPassword: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  saving: boolean;
  handleChangePassword: () => Promise<void>;
  handleDeleteAccount: () => void;
  styles: any;
}

export function ProfileSettingsTab({
  user,
  isDarkMode,
  toggleDarkMode,
  notificationsEnabled,
  setNotificationsEnabled,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  saving,
  handleChangePassword,
  handleDeleteAccount,
  styles,
}: SettingsTabProps) {
  return (
    <View style={styles.section}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>App Preferences</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="moon" size={22} color="#64748B" />
            <Text style={styles.settingText}>Dark Mode</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: '#CBD5E1', true: COLORS.primary }}
          />
        </View>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="notifications" size={22} color="#64748B" />
            <Text style={styles.settingText}>Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#CBD5E1', true: COLORS.primary }}
          />
        </View>
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
