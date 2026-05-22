import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FONTS, ROUTES, RADIUS, ThemeTokens } from '@/constants';
import { useThemedStyles } from '@/hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemeMode } from '@/contexts/ThemeContext';
import { toast } from '@/components/ui/index';
import { useNotification } from '@/contexts/NotificationContext';
import { vocabLabApi, gamificationApi, subscriptionsApi, notificationsApi } from '@/services';
import { apiClient } from '@/services/api-client';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GamificationProfile, AchievementItem } from '@/types';
import { ProfileAccountTab, ProfileStatsTab, ProfileSettingsTab } from '@/components';

type TabType = 'account' | 'stats' | 'settings';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('account');
  const { theme, resolvedTheme, setTheme, colors } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  // Notification states & hooks
  const { permissionStatus, requestPushPermission, pushToken } = useNotification();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

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
        Alert.alert(
          'Notifications Denied',
          'Please enable notifications in system settings to receive streak reminders and grading results.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ],
        );
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
        console.error('Failed to disable notifications:', error);
        toast.error('Error', 'Failed to disable notifications');
      }
    }
  };

  // setTheme is handled by ThemeContext (AsyncStorage persist built-in)
  const toggleDarkMode = async (value: boolean) => {
    setTheme(value ? 'dark' : 'light');
  };

  const styles = useThemedStyles(createStyles);

  // Data states
  const [stats, setStats] = useState({ streak: 0, words: 0, accuracy: 0 });
  const [gamProfile, setGamProfile] = useState<GamificationProfile | null>(null);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [statsData, gamData, achData, subData] = await Promise.all([
        vocabLabApi.getStats().catch(() => null),
        gamificationApi.getProfile().catch(() => null),
        gamificationApi.getAchievements().catch(() => null),
        subscriptionsApi.getMySubscription().catch(() => null),
      ]);

      if (statsData) {
        const d = statsData as any;
        setStats({
          streak: d.streak || 0,
          words: d.totalWords || d.words || d.totalCards || 0,
          accuracy: d.accuracy || 0,
        });
      }
      if (gamData) setGamProfile(gamData);
      if (achData) setAchievements(achData);
      if (subData) setSubscription(subData);
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
    }
  };

  const initialLoad = async () => {
    setLoadingStats(true);
    await fetchData();
    setLoadingStats(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      initialLoad();
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!firstName.trim()) {
      toast.error('First Name Required', 'First name is required');
      return;
    }
    setSaving(true);
    try {
      await apiClient.patch('/users/me', { firstName, lastName });
      await refreshUser(); // re-render with new name
      toast.success('Success', 'Profile updated successfully');
    } catch (error: any) {
      toast.error('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
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

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete('/users/me');
              await logout();
            } catch (error: any) {
              toast.error('Error', error.message || 'Failed to delete account');
            }
          },
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            console.error('Logout failed', error);
          }
        },
      },
    ]);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.guestContainer}>
          <Ionicons name="person-circle-outline" size={80} color="#CBD5E1" />
          <Text style={styles.guestTitle}>Your Profile</Text>
          <Text style={styles.guestDesc}>
            Sign in to save your progress, sync across devices, and earn achievements.
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push(ROUTES.login)}>
            <Text style={styles.primaryBtnText}>Log In / Sign Up</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {(['account', 'stats', 'settings'] as TabType[]).map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
          onPress={() => setActiveTab(tab)}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
        >
          <View style={styles.header}>
            <Text style={styles.pageTitle}>Profile</Text>
          </View>
          {renderTabs()}

          {activeTab === 'account' && (
            <ProfileAccountTab
              user={user}
              displayName={displayName}
              subscription={subscription}
              stats={stats}
              firstName={firstName}
              setFirstName={setFirstName}
              lastName={lastName}
              setLastName={setLastName}
              saving={saving}
              handleUpdateProfile={handleUpdateProfile}
              styles={styles}
              refreshSubscription={fetchData}
            />
          )}

          {activeTab === 'stats' && (
            <ProfileStatsTab
              loadingStats={loadingStats}
              gamProfile={gamProfile}
              achievements={achievements}
              stats={stats}
              styles={styles}
            />
          )}

          {activeTab === 'settings' && (
            <ProfileSettingsTab
              user={user}
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
              notificationsEnabled={notificationsEnabled}
              setNotificationsEnabled={handleToggleNotifications}
              permissionStatus={permissionStatus}
              currentPassword={currentPassword}
              setCurrentPassword={setCurrentPassword}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              saving={saving}
              handleChangePassword={handleChangePassword}
              handleDeleteAccount={handleDeleteAccount}
              styles={styles}
            />
          )}

          <View style={styles.logoutWrapper}>
            <TouchableOpacity style={styles.fullLogoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#EF4444" />
              <Text style={styles.fullLogoutBtnText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeTokens) => {
  const isDark = colors.statusBar === 'light-content';
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    flex1: { flex: 1 },
    container: {
      flex: 1,
      backgroundColor: colors.bgSubtle,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 12,
      backgroundColor: colors.background,
    },
    pageTitle: {
      fontFamily: FONTS.bold,
      fontSize: 28,
      color: colors.text,
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
      fontFamily: FONTS.medium,
      fontSize: 15,
      color: colors.textSecondary,
    },
    activeTabText: {
      color: colors.primary,
      fontFamily: FONTS.bold,
    },
    section: {
      padding: 16,
    },
    avatarSection: {
      alignItems: 'center',
      marginBottom: 24,
    },
    avatarContainer: {
      position: 'relative',
      marginBottom: 12,
    },
    avatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
    },
    editAvatarButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: colors.primary,
      padding: 6,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: '#fff',
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    name: {
      fontFamily: FONTS.bold,
      fontSize: 22,
      color: colors.text,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    badgePro: {
      backgroundColor: '#3B82F6',
    },
    badgePremium: {
      backgroundColor: '#8B5CF6',
    },
    badgeText: {
      fontFamily: FONTS.bold,
      fontSize: 10,
      color: '#FFF',
    },
    email: {
      fontFamily: FONTS.regular,
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
      marginBottom: 12,
    },
    streakBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.errorBg,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      gap: 4,
    },
    streakBadgeText: {
      fontFamily: FONTS.bold,
      fontSize: 13,
      color: colors.error,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.03,
      shadowRadius: 6,
      elevation: 1,
    },
    cardTitle: {
      fontFamily: FONTS.bold,
      fontSize: 16,
      color: colors.text,
      marginBottom: 16,
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontFamily: FONTS.medium,
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 6,
    },
    input: {
      backgroundColor: colors.bgSubtle,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontFamily: FONTS.regular,
      fontSize: 15,
      color: colors.text,
    },
    inputDisabled: {
      backgroundColor: isDark ? colors.surface : colors.bgSubtle,
      color: colors.textDisabled,
    },
    saveBtn: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 8,
    },
    saveBtnText: {
      fontFamily: FONTS.bold,
      fontSize: 15,
      color: '#FFF',
    },
    subscriptionBox: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.bgSubtle,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    subTier: {
      fontFamily: FONTS.bold,
      fontSize: 15,
      color: colors.text,
    },
    subDesc: {
      fontFamily: FONTS.regular,
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    upgradeBtn: {
      backgroundColor: '#FEF3C7',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
    },
    upgradeBtnText: {
      fontFamily: FONTS.bold,
      fontSize: 13,
      color: '#D97706',
    },

    // Gamification & Stats
    levelHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    levelTitle: {
      fontFamily: FONTS.bold,
      fontSize: 20,
      color: '#FFF',
    },
    levelSubtitle: {
      fontFamily: FONTS.medium,
      fontSize: 13,
      color: '#94A3B8',
      marginTop: 2,
    },
    levelBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(251, 191, 36, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    progressBarBg: {
      height: 8,
      backgroundColor: '#334155',
      borderRadius: 4,
      marginBottom: 8,
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: '#38BDF8',
      borderRadius: 4,
    },
    progressTextRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    progressText: {
      fontFamily: FONTS.regular,
      fontSize: 12,
      color: '#94A3B8',
    },
    sectionTitle: {
      fontFamily: FONTS.bold,
      fontSize: 18,
      color: colors.text,
      marginTop: 8,
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 24,
    },
    statBox: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    statIcon: {
      marginBottom: 8,
    },
    statValue: {
      fontFamily: FONTS.bold,
      fontSize: 20,
      color: colors.text,
    },
    statLabel: {
      fontFamily: FONTS.regular,
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    achievementsList: {
      gap: 12,
    },
    achCard: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    achCardLocked: {
      opacity: 0.6,
    },
    achIconBox: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: colors.warningBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    achIcon: {
      fontSize: 24,
    },
    achContent: {
      flex: 1,
    },
    achTitle: {
      fontFamily: FONTS.bold,
      fontSize: 15,
      color: colors.text,
    },
    achDesc: {
      fontFamily: FONTS.regular,
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    achProgressBg: {
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      marginTop: 8,
      width: '80%',
    },
    achProgressFill: {
      height: '100%',
      backgroundColor: '#10B981',
      borderRadius: 2,
    },
    achXp: {
      fontFamily: FONTS.bold,
      fontSize: 13,
      color: '#38BDF8',
      marginLeft: 8,
    },

    // Settings
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    settingText: {
      fontFamily: FONTS.medium,
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
      fontFamily: FONTS.bold,
      fontSize: 15,
      color: colors.primary,
    },
    dangerCard: {
      borderColor: isDark ? '#7f1d1d' : '#FECACA',
      borderWidth: 1,
    },
    dangerTitle: {
      fontFamily: FONTS.bold,
      fontSize: 14,
      color: '#EF4444',
      marginBottom: 16,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    dangerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      gap: 8,
    },
    dangerBtnText: {
      fontFamily: FONTS.medium,
      fontSize: 15,
      color: '#EF4444',
    },
    dangerDivider: {
      height: 1,
      backgroundColor: '#FEE2E2',
      marginVertical: 4,
    },
    versionText: {
      textAlign: 'center',
      fontFamily: FONTS.medium,
      color: '#94A3B8',
      fontSize: 12,
      marginTop: 8,
      marginBottom: 16,
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
      backgroundColor: '#FFF',
      paddingVertical: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#FEE2E2',
      shadowColor: '#EF4444',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 2,
      gap: 8,
    },
    fullLogoutBtnText: {
      fontFamily: FONTS.bold,
      fontSize: 16,
      color: '#EF4444',
    },

    // Guest
    guestContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      backgroundColor: isDark ? '#020617' : '#F8F9FA',
    },
    guestTitle: {
      fontFamily: FONTS.bold,
      fontSize: 24,
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    guestDesc: {
      fontFamily: FONTS.regular,
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 22,
    },
    primaryBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: RADIUS.full,
      width: '100%',
      alignItems: 'center',
    },
    primaryBtnText: {
      fontFamily: FONTS.bold,
      fontSize: 16,
      color: '#FFF',
    },
    googleIconBox: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
      alignItems: 'center',
      justifyContent: 'center',
    },
    googleTitle: {
      fontFamily: FONTS.bold,
      fontSize: 15,
      color: colors.text,
    },
    googleDesc: {
      fontFamily: FONTS.regular,
      fontSize: 13,
      color: colors.textSecondary,
    },
  });
};
