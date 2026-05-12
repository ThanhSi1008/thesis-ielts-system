import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Switch, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { vocabLabApi } from '@/services/features.api';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [stats, setStats] = useState({ streak: 0, words: 0, accuracy: 0 });
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const data = (await vocabLabApi.getStats()) as any;
      setStats({
        streak: data.streak || 0,
        words: data.totalWords || data.words || data.totalCards || 0,
        accuracy: data.accuracy || 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive", 
          onPress: async () => {
             try {
                await logout();
             } catch (error) {
                console.error("Logout failed", error);
             }
          } 
        }
      ]
    );
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  const displayName = user?.firstName || user?.lastName 
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() 
    : user?.email || 'Guest User';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Profile Info */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user?.avatar || 'https://ui-avatars.com/api/?name=' + (user?.firstName || 'User') + '&background=random' }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{user?.email || 'Sign in to sync your progress'}</Text>
          
          {!user && (
             <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
               <Text style={styles.loginButtonText}>Log In / Sign Up</Text>
             </TouchableOpacity>
          )}
        </View>

        {/* Stats Overview */}
        {user && (
          <View style={styles.statsContainer}>
            {loadingStats ? (
              <ActivityIndicator color={COLORS.primary} size="small" />
            ) : (
              <>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.streak}</Text>
                  <Text style={styles.statLabel}>Days Streak</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.words}</Text>
                  <Text style={styles.statLabel}>Words</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.accuracy}%</Text>
                  <Text style={styles.statLabel}>Accuracy</Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* Subscription Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <TouchableOpacity style={styles.optionItem} onPress={() => router.push('/pricing')}>
            <View style={styles.optionLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#FEF9C3' }]}>
                <Ionicons name="star" size={20} color="#EAB308" />
              </View>
              <Text style={styles.optionText}>Upgrade Plan</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* Settings Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="moon" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.optionText}>Dark Mode</Text>
            </View>
            <Switch 
              value={isDarkMode} 
              onValueChange={setIsDarkMode}
              trackColor={{ false: '#767577', true: COLORS.primary }}
            />
          </View>

          <View style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="notifications" size={20} color={COLORS.success} />
              </View>
              <Text style={styles.optionText}>Notifications</Text>
            </View>
            <Switch 
              value={notificationsEnabled} 
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#767577', true: COLORS.success }}
            />
          </View>
          
          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="globe" size={20} color={COLORS.warning} />
              </View>
              <Text style={styles.optionText}>Language</Text>
            </View>
            <View style={styles.optionRight}>
              <Text style={styles.optionValue}>English</Text>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="help-circle" size={20} color="#9333EA" />
              </View>
              <Text style={styles.optionText}>Help Center</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFE4E6' }]}>
                <Ionicons name="information-circle" size={20} color="#E11D48" />
              </View>
              <Text style={styles.optionText}>About</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {user && (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        )}
        
        <Text style={styles.versionText}>Version 1.0.0</Text>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  email: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    marginTop: SPACING.sm,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: FONT_SIZES.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
    marginTop: SPACING.md,
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: COLORS.border,
  },
  section: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  optionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginRight: SPACING.xs,
  },
  logoutButton: {
    margin: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: '#FEE2E2',
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: 'bold',
    fontSize: FONT_SIZES.md,
  },
  versionText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.xs,
    marginBottom: SPACING.xl,
  },
});
