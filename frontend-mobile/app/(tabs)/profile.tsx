import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import {COLORS, SPACING, FONT_SIZES, RADIUS, STORAGE_KEYS, FONTS} from '@/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { vocabLabApi, gamificationApi, subscriptionsApi } from '@/services/features.api';
import { apiClient } from '@/services/api-client';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GamificationProfile, AchievementItem } from '@/types';

type TabType = 'account' | 'stats' | 'settings';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Load theme preference on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.THEME).then((val) => {
      if (val === 'dark') setIsDarkMode(true);
    });
  }, []);

  const toggleDarkMode = async (value: boolean) => {
    setIsDarkMode(value);
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, value ? 'dark' : 'light');
  };

  const styles = dynamicStyles(isDarkMode);

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
      Alert.alert('Error', 'First name is required');
      return;
    }
    setSaving(true);
    try {
      await apiClient.patch('/users/me', { firstName, lastName });
      await refreshUser(); // re-render with new name
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }
    setSaving(true);
    try {
      await apiClient.post('/auth/change-password', { currentPassword, newPassword });
      Alert.alert('Success', 'Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to change password');
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
              Alert.alert('Error', error.message || 'Failed to delete account');
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
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(auth)/login')}>
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

  const renderBadge = () => {
    const tier = subscription?.tier || 'FREE';
    if (tier === 'FREE') return null;

    return (
      <View style={[styles.badge, tier === 'PRO' ? styles.badgePro : styles.badgePremium]}>
        <Ionicons name="star" size={10} color="#FFF" />
        <Text style={styles.badgeText}>{tier}</Text>
      </View>
    );
  };

  const renderAccountTab = () => {
    const tier = subscription?.tier || 'FREE';

    return (
      <View style={styles.section}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  user.avatar ||
                  `https://ui-avatars.com/api/?name=${user.firstName || 'User'}&background=random`,
              }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.nameRow}>
            <Text style={styles.name}>{displayName}</Text>
            {renderBadge()}
          </View>
          <Text style={styles.email}>{user.email}</Text>

          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={16} color="#EF4444" />
            <Text style={styles.streakBadgeText}>{stats.streak} Day Streak</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter first name"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter last name"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={user.email}
              editable={false}
            />
          </View>
          <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateProfile} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.saveBtnText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Subscription</Text>
          <View style={styles.subscriptionBox}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Text style={styles.subTier}>{tier === 'FREE' ? 'Free Plan' : `${tier} Plan`}</Text>
                {tier !== 'FREE' && (
                  <View
                    style={{
                      backgroundColor: tier === 'PRO' ? '#3B82F6' : '#8B5CF6',
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontFamily: FONTS.bold, fontSize: 10, color: '#fff' }}>
                      ACTIVE
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.subDesc}>
                {tier === 'FREE'
                  ? 'Upgrade to unlock all premium features'
                  : subscription?.currentPeriodEnd
                    ? `Renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                    : 'Premium features unlocked'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.upgradeBtn, tier !== 'FREE' && { backgroundColor: '#EFF6FF' }]}
              onPress={() => router.push('/pricing')}
            >
              <Text style={[styles.upgradeBtnText, tier !== 'FREE' && { color: '#3B82F6' }]}>
                {tier === 'FREE' ? 'Upgrade' : 'Manage'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderStatsTab = () => {
    if (loadingStats) {
      return <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />;
    }

    const progress =
      gamProfile && gamProfile.xpNeeded > 0
        ? Math.min(100, Math.max(0, (gamProfile.currentLevelXp / gamProfile.xpNeeded) * 100)) || 0
        : 0;

    return (
      <View style={styles.section}>
        {gamProfile && (
          <View style={[styles.card, { backgroundColor: '#1E293B' }]}>
            <View style={styles.levelHeader}>
              <View>
                <Text style={styles.levelTitle}>Level {gamProfile.level}</Text>
                <Text style={styles.levelSubtitle}>{gamProfile.totalXp} Total XP</Text>
              </View>
              <View style={styles.levelBadge}>
                <Ionicons name="trophy" size={20} color="#FBBF24" />
              </View>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
            <View style={styles.progressTextRow}>
              <Text style={styles.progressText}>{gamProfile.currentLevelXp} XP</Text>
              <Text style={styles.progressText}>{gamProfile.xpNeeded} XP to next level</Text>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Ionicons name="flame" size={24} color="#EF4444" style={styles.statIcon} />
            <Text style={styles.statValue}>{stats.streak}</Text>
            <Text style={styles.statLabel}>Days Streak</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="library" size={24} color="#3B82F6" style={styles.statIcon} />
            <Text style={styles.statValue}>{stats.words}</Text>
            <Text style={styles.statLabel}>Words Learned</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" style={styles.statIcon} />
            <Text style={styles.statValue}>{stats.accuracy}%</Text>
            <Text style={styles.statLabel}>Avg Accuracy</Text>
          </View>
        </View>

        {achievements.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <View style={styles.achievementsList}>
              {achievements.map((ach) => {
                const isEarned = !!ach.earnedAt;
                return (
                  <View key={ach.id} style={[styles.achCard, !isEarned && styles.achCardLocked]}>
                    <View style={[styles.achIconBox, !isEarned && { backgroundColor: '#F1F5F9' }]}>
                      <Text style={styles.achIcon}>{ach.icon || '🏆'}</Text>
                    </View>
                    <View style={styles.achContent}>
                      <Text style={styles.achTitle}>{ach.name}</Text>
                      <Text style={styles.achDesc}>{ach.description}</Text>
                      {!isEarned && ach.progress !== undefined && (
                        <View style={styles.achProgressBg}>
                          <View
                            style={[
                              styles.achProgressFill,
                              {
                                width: `${ach.conditionValue ? Math.min(100, Math.max(0, (ach.progress / ach.conditionValue) * 100)) : 0}%`,
                              },
                            ]}
                          />
                        </View>
                      )}
                    </View>
                    <Text style={styles.achXp}>+{ach.xpReward} XP</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </View>
    );
  };

  const renderSettingsTab = () => (
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
              colors={[COLORS.primary]}
            />
          }
        >
          <View style={styles.header}>
            <Text style={styles.pageTitle}>Profile</Text>
          </View>
          {renderTabs()}

          {activeTab === 'account' && renderAccountTab()}
          {activeTab === 'stats' && renderStatsTab()}
          {activeTab === 'settings' && renderSettingsTab()}

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

function dynamicStyles(isDark: boolean) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDark ? '#0F172A' : '#FFF',
    },
    flex1: { flex: 1 },
    container: {
      flex: 1,
      backgroundColor: isDark ? '#020617' : '#F8F9FA',
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 12,
      backgroundColor: isDark ? '#0F172A' : '#FFF',
    },
    pageTitle: {
      fontFamily: FONTS.bold,
      fontSize: 28,
      color: isDark ? '#F8FAFC' : '#0F172A',
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: isDark ? '#0F172A' : '#FFF',
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1E293B' : '#F1F5F9',
    },
    tab: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: COLORS.primary,
    },
    tabText: {
      fontFamily: FONTS.medium,
      fontSize: 15,
      color: '#64748B',
    },
    activeTabText: {
      color: COLORS.primary,
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
      backgroundColor: COLORS.primary,
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
      color: isDark ? '#F8FAFC' : '#0F172A',
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
      color: isDark ? '#94A3B8' : '#64748B',
      marginTop: 2,
      marginBottom: 12,
    },
    streakBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#450a0a' : '#FEF2F2',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      gap: 4,
    },
    streakBadgeText: {
      fontFamily: FONTS.bold,
      fontSize: 13,
      color: isDark ? '#f87171' : '#EF4444',
    },
    card: {
      backgroundColor: isDark ? '#1E293B' : '#FFF',
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.03,
      shadowRadius: 6,
      elevation: 1,
    },
    cardTitle: {
      fontFamily: FONTS.bold,
      fontSize: 16,
      color: isDark ? '#F8FAFC' : '#0F172A',
      marginBottom: 16,
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontFamily: FONTS.medium,
      fontSize: 13,
      color: isDark ? '#94A3B8' : '#475569',
      marginBottom: 6,
    },
    input: {
      backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontFamily: FONTS.regular,
      fontSize: 15,
      color: isDark ? '#F8FAFC' : '#0F172A',
    },
    inputDisabled: {
      backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
      color: isDark ? '#64748B' : '#94A3B8',
    },
    saveBtn: {
      backgroundColor: COLORS.primary,
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
      backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
    },
    subTier: {
      fontFamily: FONTS.bold,
      fontSize: 15,
      color: isDark ? '#F8FAFC' : '#0F172A',
    },
    subDesc: {
      fontFamily: FONTS.regular,
      fontSize: 12,
      color: isDark ? '#94A3B8' : '#64748B',
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
      color: isDark ? '#F8FAFC' : '#0F172A',
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
      backgroundColor: isDark ? '#1E293B' : '#FFF',
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      alignItems: 'center',
    },
    statIcon: {
      marginBottom: 8,
    },
    statValue: {
      fontFamily: FONTS.bold,
      fontSize: 20,
      color: isDark ? '#F8FAFC' : '#0F172A',
    },
    statLabel: {
      fontFamily: FONTS.regular,
      fontSize: 12,
      color: isDark ? '#94A3B8' : '#64748B',
      marginTop: 4,
    },
    achievementsList: {
      gap: 12,
    },
    achCard: {
      flexDirection: 'row',
      backgroundColor: isDark ? '#1E293B' : '#FFF',
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      alignItems: 'center',
    },
    achCardLocked: {
      opacity: 0.6,
    },
    achIconBox: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: isDark ? '#422006' : '#FEF3C7',
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
      color: isDark ? '#F8FAFC' : '#0F172A',
    },
    achDesc: {
      fontFamily: FONTS.regular,
      fontSize: 13,
      color: isDark ? '#94A3B8' : '#64748B',
      marginTop: 2,
    },
    achProgressBg: {
      height: 4,
      backgroundColor: isDark ? '#334155' : '#E2E8F0',
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
      borderBottomColor: isDark ? '#334155' : '#F1F5F9',
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    settingText: {
      fontFamily: FONTS.medium,
      fontSize: 15,
      color: isDark ? '#F8FAFC' : '#1E293B',
    },
    outlineBtn: {
      borderWidth: 1,
      borderColor: COLORS.primary,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 8,
    },
    outlineBtnText: {
      fontFamily: FONTS.bold,
      fontSize: 15,
      color: COLORS.primary,
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
      color: isDark ? '#F8FAFC' : '#0F172A',
      marginTop: 16,
      marginBottom: 8,
    },
    guestDesc: {
      fontFamily: FONTS.regular,
      fontSize: 15,
      color: isDark ? '#94A3B8' : '#64748B',
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 22,
    },
    primaryBtn: {
      backgroundColor: COLORS.primary,
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
      color: isDark ? '#F8FAFC' : '#0F172A',
    },
    googleDesc: {
      fontFamily: FONTS.regular,
      fontSize: 13,
      color: isDark ? '#94A3B8' : '#64748B',
    },
  });
}
