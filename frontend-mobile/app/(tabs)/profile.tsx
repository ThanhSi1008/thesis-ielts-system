import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
  Text,
} from '@/components';

type TabType = 'account' | 'stats' | 'settings';

export default function ProfileScreen() {
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: TabType }>();
  const { user } = useAuth();
  const { colors, resolvedTheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const isDarkMode = resolvedTheme === 'dark';

  const [activeTab, setActiveTab] = useState<TabType>('account');

  React.useEffect(() => {
    if (tab && ['account', 'stats', 'settings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [tab]);

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
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push(ROUTES.login)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Log In or Sign Up button"
            accessibilityHint="Double tap to navigate to the authentication screen"
          >
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
          accessible={true}
          accessibilityRole="tab"
          accessibilityLabel={`${tab.charAt(0).toUpperCase() + tab.slice(1)} tab`}
          accessibilityHint={`Double tap to switch to the ${tab} tab view`}
          accessibilityState={{ selected: activeTab === tab }}
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
        </ScrollView>
      </KeyboardAvoidingView>
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
