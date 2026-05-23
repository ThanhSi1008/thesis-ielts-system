import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS, ROUTES, navigation } from '@/constants';
import { pronunciationApi } from '@/services/learning.api';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useTheme } from '@/contexts/ThemeContext';
import { UsageIndicator } from '@/components/ui/index';
import type { PronunciationData, SoundProgress, PronunciationStats } from '@/types';
import ProgressSummary from '@/components/foundation/ProgressSummary';
import IpaChart from '@/components/foundation/IpaChart';
import { SharedDrawer } from '@/components/ui/SharedDrawer';

export default function IeltsPronunciationScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { usage } = useSubscription();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

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
    if (route !== '/ielts/foundation/pronunciation') {
      navigation.push(route);
    }
  };
  const [sounds, setSounds] = useState<PronunciationData | null>(null);
  const [progress, setProgress] = useState<SoundProgress[]>([]);
  const [stats, setStats] = useState<PronunciationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (showSkeleton = true) => {
      if (showSkeleton) setLoading(true);
      setError(null);
      try {
        // 1. Fetch sounds
        const soundsData = await pronunciationApi.getAllSounds();
        setSounds(soundsData);

        // 2. Fetch progress & stats if logged in
        if (user) {
          const [progressData, statsData] = await Promise.all([
            pronunciationApi.getProgress(),
            pronunciationApi.getStats(),
          ]);
          setProgress(progressData);
          setStats(statsData);
        }
      } catch (err: any) {
        if (__DEV__) console.error('[IeltsPronunciationScreen] Error fetching data:', err);
        setError(err?.message || 'Failed to load IPA data');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(false);
  }, [fetchData]);

  const go = (symbol: string) => {
    router.push(ROUTES.foundationPronunciationSymbol(encodeURIComponent(symbol)) as any);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* ── Theme-Aware Header ── */}
      <View
        style={{
          backgroundColor: colors.background,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: SPACING.md,
          paddingBottom: SPACING.sm,
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

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{
            fontSize: 10,
            fontFamily: FONTS.bold,
            color: colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: 0.6,
          }}>IELTS · LEXON</Text>
          <Text style={{
            color: colors.text,
            fontSize: 18,
            fontFamily: FONTS.bold,
            marginTop: 1,
          }}>Pronunciation</Text>
        </View>

        <View style={{ width: 44 }} />
      </View>

      {/* Intro banner */}
      <View style={styles.introBanner}>
        <Ionicons name="bulb-outline" size={15} color={COLORS.primary} />
        <Text style={styles.introText}>
          Tap any symbol to practice with AI pronunciation scoring. Each symbol has example words
          and sentence drills.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading Phonetic Chart...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <Text style={styles.retryText} onPress={() => fetchData()}>
              Tap here to retry
            </Text>
          </View>
        ) : sounds ? (
          <>
            {/* Show stats summary if user is logged in and stats are loaded */}
            {user && stats && <ProgressSummary stats={stats} />}

            {/* Daily Pronunciation Usage Indicator */}
            {user &&
              usage?.PRONUNCIATION_ATTEMPT &&
              usage.PRONUNCIATION_ATTEMPT.limit !== Infinity && (
                <View
                  style={{
                    backgroundColor: '#fff',
                    padding: SPACING.md,
                    borderRadius: RADIUS.xl,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    marginBottom: SPACING.md,
                  }}
                >
                  <UsageIndicator
                    label="Daily AI Pronunciation Drills"
                    used={usage.PRONUNCIATION_ATTEMPT.used}
                    limit={usage.PRONUNCIATION_ATTEMPT.limit}
                  />
                </View>
              )}

            <IpaChart sounds={sounds} progress={progress} onSymbolPress={go} />

            {/* Stats footer (shown as additional info) */}
            <View style={styles.footer}>
              <View style={styles.footerStat}>
                <Text style={styles.footerNum}>44</Text>
                <Text style={styles.footerLabel}>Sounds</Text>
              </View>
              <View style={styles.footerDivider} />
              <View style={styles.footerStat}>
                <Text style={styles.footerNum}>132</Text>
                <Text style={styles.footerLabel}>Practice Words</Text>
              </View>
              <View style={styles.footerDivider} />
              <View style={styles.footerStat}>
                <Text style={styles.footerNum}>AI</Text>
                <Text style={styles.footerLabel}>Scoring</Text>
              </View>
            </View>
          </>
        ) : null}

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
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: FONT_SIZES.md, fontFamily: FONTS.bold },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: FONT_SIZES.xs, marginTop: 1 },

  introBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary + '0D',
    margin: SPACING.lg,
    marginBottom: 0,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '25',
  },
  introText: { flex: 1, fontSize: FONT_SIZES.xs, color: COLORS.text, lineHeight: 17 },

  scroll: { padding: SPACING.lg, paddingBottom: 40 },

  loadingContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
  },
  errorContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semibold,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  retryText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    textDecorationLine: 'underline',
  },

  footer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginTop: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  footerStat: { flex: 1, alignItems: 'center' },
  footerNum: { fontSize: FONT_SIZES.xxl, fontFamily: FONTS.bold, color: COLORS.text },
  footerLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  footerDivider: { width: 1, backgroundColor: COLORS.border, marginVertical: 4 },
});
