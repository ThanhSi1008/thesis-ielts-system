import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ROUTES } from '@/constants';
import { useThemedStyles } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ProfileAccountTab,
  ProfileStatsTab,
  ProfileSettingsTab,
  ConfirmDialog,
  Text,
} from '@/components';

type TabType = 'account' | 'stats' | 'settings';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { colors, resolvedTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const isDarkMode = resolvedTheme === 'dark';

  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.guestContainer}>
          <Ionicons name="person-circle-outline" size={80} color="#CBD5E1" />
          <Text variant="display" weight="bold" color="text" style={styles.guestTitle}>
            Your Profile
          </Text>
          <Text variant="body" color="textSecondary" style={styles.guestDesc}>
            Sign in to save your progress, sync across devices, and earn achievements.
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push(ROUTES.login)}>
            <Text variant="body" weight="bold" style={styles.primaryBtnText}>
              Log In / Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {(['account', 'stats', 'settings'] as TabType[]).map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
          onPress={() => setActiveTab(tab)}
        >
          <Text
            variant="body"
            weight={activeTab === tab ? 'bold' : 'medium'}
            style={[styles.tabText, activeTab === tab && styles.activeTabText]}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View style={styles.header}>
            <Text variant="display" weight="bold" color="text">
              Profile
            </Text>
          </View>
          {renderTabs()}

          {activeTab === 'account' && <ProfileAccountTab />}

          {activeTab === 'stats' && <ProfileStatsTab />}

          {activeTab === 'settings' && <ProfileSettingsTab />}

          <View style={styles.logoutWrapper}>
            <TouchableOpacity style={styles.fullLogoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#EF4444" />
              <Text variant="body" weight="bold" style={styles.fullLogoutBtnText}>
                Log Out
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => {
  const isDark = colors.statusBar === 'light-content';
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    flex1: { flex: 1 },
    container: {
      flex: 1,
      backgroundColor: colors.bgSubtle || colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 12,
      backgroundColor: colors.background,
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: colors.background,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tab: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: colors.primary,
    },
    tabText: {
      fontSize: 15,
      color: colors.textSecondary,
    },
    activeTabText: {
      color: colors.primary,
    },
    logoutWrapper: {
      paddingHorizontal: 16,
      marginTop: 16,
      marginBottom: 32,
    },
    fullLogoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      paddingVertical: 16,
      borderRadius: 16,
      borderWidth: 1,
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
    },
    guestContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      backgroundColor: isDark ? '#020617' : '#F8F9FA',
    },
    guestTitle: {
      marginTop: 16,
      marginBottom: 8,
    },
    guestDesc: {
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 22,
    },
    primaryBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 100,
      width: '100%',
      alignItems: 'center',
    },
    primaryBtnText: {
      color: colors.onPrimary || '#FFF',
    },
  });
};
