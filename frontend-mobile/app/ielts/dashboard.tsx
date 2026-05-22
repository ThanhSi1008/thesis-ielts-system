import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, FONT_SIZES, ROUTES, navigation } from '@/constants';
import { ieltsProfileApi, ieltsExamsApi, ieltsAdvancedApi } from '@/services';
import { SectionHeader } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { SharedDrawer } from '@/components/ui/SharedDrawer';

export default function DashboardScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [profile, setProfile] = useState<any>(null);
  const [streak, setStreak] = useState<any>(null);
  const [mockHistory, setMockHistory] = useState<any[]>([]);
  const [advListening, setAdvListening] = useState<any[]>([]);
  const [advReading, setAdvReading] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const [profileRes, streakRes, historyRes, advListRes, advReadRes] = await Promise.allSettled([
        ieltsProfileApi.get(),
        ieltsProfileApi.getStreak(),
        ieltsExamsApi.getHistory(),
        ieltsAdvancedApi.getListeningHistory(),
        ieltsAdvancedApi.getReadingHistory(),
      ]);
      if (profileRes.status === 'fulfilled') setProfile(profileRes.value);
      if (streakRes.status === 'fulfilled') setStreak(streakRes.value);
      if (historyRes.status === 'fulfilled') setMockHistory(historyRes.value as any[]);
      if (advListRes.status === 'fulfilled') setAdvListening(advListRes.value as any[]);
      if (advReadRes.status === 'fulfilled') setAdvReading(advReadRes.value as any[]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-280)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.spring(drawerAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
      Animated.timing(backdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  };
  const closeDrawer = () => {
    Animated.parallel([
      Animated.spring(drawerAnim, {
        toValue: -280,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }),
      Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setDrawerOpen(false));
  };
  const handleNavPress = (route: string) => {
    closeDrawer();
    if (route !== ROUTES.ieltsDashboard) {
      navigation.push(route);
    }
  };

  const totalPractice = advListening.length + advReading.length;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    header: {
      backgroundColor: COLORS.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
    },
    headerTitle: { color: '#fff', fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold },
    profileCard: {
      margin: SPACING.lg,
      backgroundColor: colors.card,
      borderRadius: RADIUS.xl,
      padding: SPACING.lg,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    profileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: SPACING.lg,
    },
    profileName: { fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold, color: colors.text },
    profileSub: {
      fontSize: FONT_SIZES.sm,
      fontFamily: FONTS.medium,
      color: colors.textSecondary,
      marginTop: 2,
    },
    streakPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: '#FEF3C7',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      borderRadius: RADIUS.full,
    },
    streakFire: { fontSize: 18 },
    streakVal: { fontSize: FONT_SIZES.md, fontFamily: FONTS.bold, color: '#D97706' },
    overviewRow: { flexDirection: 'row' },
    overviewItem: { flex: 1, alignItems: 'center' },
    overviewMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border },
    overviewValue: { fontSize: FONT_SIZES.xl, fontFamily: FONTS.bold, color: colors.text },
    overviewLabel: {
      fontSize: FONT_SIZES.xs,
      fontFamily: FONTS.medium,
      color: colors.textSecondary,
      marginTop: 2,
    },
    section: { paddingHorizontal: SPACING.lg, marginTop: SPACING.lg },
    advRow: { flexDirection: 'row', gap: SPACING.md },
    advCard: {
      flex: 1,
      alignItems: 'center',
      padding: SPACING.lg,
      backgroundColor: colors.card,
      borderRadius: RADIUS.xl,
      borderWidth: 2,
    },
    advIcon: { fontSize: 28, marginBottom: SPACING.sm },
    advCount: { fontSize: FONT_SIZES.xxl, fontFamily: FONTS.bold, color: colors.text },
    advLabel: {
      fontSize: FONT_SIZES.sm,
      fontFamily: FONTS.medium,
      color: colors.textSecondary,
      marginTop: 4,
    },
    buttonContainer: {
      paddingHorizontal: SPACING.lg,
      marginTop: SPACING.xl,
    },
    primaryButton: {
      backgroundColor: '#111827',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.sm,
      paddingVertical: 16,
      borderRadius: RADIUS.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    primaryButtonText: {
      color: '#fff',
      fontFamily: FONTS.bold,
      fontSize: FONT_SIZES.md,
    },
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── Synchronized Theme-Aware Header ── */}
      <View
        style={{
          backgroundColor: colors.background,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: SPACING.md,
          paddingBottom: SPACING.sm,
          paddingTop: insets.top + 8,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity
          style={{
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={openDrawer}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Open menu drawer"
          accessibilityHint="Double tap to open the navigation menu"
        >
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text
          style={{
            flex: 1,
            color: colors.text,
            fontSize: FONT_SIZES.lg,
            fontFamily: FONTS.bold,
            textAlign: 'center',
          }}
        >
          Dashboard
        </Text>
        
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchData();
            }}
          />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Profile summary */}
        {profile && (
          <View style={styles.profileCard}>
            <View style={styles.profileRow}>
              <View>
                <Text style={styles.profileName}>
                  {profile.user?.firstName || profile.user?.email || 'Student'}
                </Text>
                <Text style={styles.profileSub}>
                  Target Band {profile.targetBand?.toFixed(1) ?? '—'} ·{' '}
                  {profile.dailyCommitmentMins ?? 30}m/day
                </Text>
              </View>
              <View style={styles.streakPill}>
                <Text style={styles.streakFire}>🔥</Text>
                <Text style={styles.streakVal}>{streak?.currentStreak ?? 0}</Text>
              </View>
            </View>

            <View style={styles.overviewRow}>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewValue}>{mockHistory.length}</Text>
                <Text style={styles.overviewLabel}>Mock Tests</Text>
              </View>
              <View style={[styles.overviewItem, styles.overviewMid]}>
                <Text style={styles.overviewValue}>{totalPractice}</Text>
                <Text style={styles.overviewLabel}>Practice Sessions</Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewValue}>{streak?.longestStreak ?? 0}</Text>
                <Text style={styles.overviewLabel}>Best Streak</Text>
              </View>
            </View>
          </View>
        )}

        {/* Advanced practice summary */}
        <View style={styles.section}>
          <SectionHeader title="Advanced Practice" subtitle="Listening & Reading parts" />
          <View style={styles.advRow}>
            <View style={[styles.advCard, { borderColor: COLORS.skill.listening }]}>
              <Text style={styles.advIcon}>🎧</Text>
              <Text style={styles.advCount}>{advListening.length}</Text>
              <Text style={styles.advLabel}>Listening</Text>
            </View>
            <View style={[styles.advCard, { borderColor: COLORS.skill.reading }]}>
              <Text style={styles.advIcon}>📖</Text>
              <Text style={styles.advCount}>{advReading.length}</Text>
              <Text style={styles.advLabel}>Reading</Text>
            </View>
          </View>
        </View>

        {/* View Progress Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.push(ROUTES.ieltsStatistics)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="View progress button"
            accessibilityHint="Double tap to open your advanced analytics and target band statistics"
          >
            <Text style={styles.primaryButtonText}>VIEW PROGRESS</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
      <SharedDrawer
        drawerOpen={drawerOpen}
        drawerAnim={drawerAnim}
        backdropAnim={backdropAnim}
        insetsTop={insets.top}
        onClose={closeDrawer}
        onOpen={openDrawer}
        onNavPress={handleNavPress}
      />
    </View>
  );
}
