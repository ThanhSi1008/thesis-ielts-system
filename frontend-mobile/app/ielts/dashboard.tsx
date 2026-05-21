import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { ieltsProfileApi, ieltsExamsApi, ieltsAdvancedApi } from '@/services/ielts.api';
import { SectionHeader } from '@/components/ui';

export default function DashboardScreen() {
  const router = useRouter();
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

  const totalPractice = advListening.length + advReading.length;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <View style={{ width: 24 }} />
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
            <View style={[styles.advCard, { borderColor: '#E11D48' }]}>
              <Text style={styles.advIcon}>🎧</Text>
              <Text style={styles.advCount}>{advListening.length}</Text>
              <Text style={styles.advLabel}>Listening</Text>
            </View>
            <View style={[styles.advCard, { borderColor: '#2563EB' }]}>
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
            onPress={() => router.push('/ielts/statistics')}
          >
            <Text style={styles.primaryButtonText}>VIEW PROGRESS</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
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
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
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
  profileName: { fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold, color: COLORS.text },
  profileSub: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
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
  overviewMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: COLORS.border },
  overviewValue: { fontSize: FONT_SIZES.xl, fontFamily: FONTS.bold, color: COLORS.text },
  overviewLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  section: { paddingHorizontal: SPACING.lg, marginTop: SPACING.lg },
  advRow: { flexDirection: 'row', gap: SPACING.md },
  advCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    borderWidth: 2,
  },
  advIcon: { fontSize: 28, marginBottom: SPACING.sm },
  advCount: { fontSize: FONT_SIZES.xxl, fontFamily: FONTS.bold, color: COLORS.text },
  advLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
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
