/**
 * Pronunciation Tab — IPA Phonetic Chart
 * Tap any symbol → navigates to /pronunciation/[symbol] for practice
 */
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { COLORS, SPACING, FONT_SIZES, FONTS } from '@/constants';
import { pronunciationApi } from '@/services/learning.api';
import { useAuth } from '@/contexts/AuthContext';
import type { PronunciationData, SoundProgress, PronunciationStats } from '@/types';
import ProgressSummary from '@/components/foundation/ProgressSummary';
import IpaChart from '@/components/foundation/IpaChart';

export default function PronunciationScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [sounds, setSounds] = useState<PronunciationData | null>(null);
  const [progress, setProgress] = useState<SoundProgress[]>([]);
  const [stats, setStats] = useState<PronunciationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (showSkeleton = true) => {
    if (showSkeleton) setLoading(true);
    setError(null);
    try {
      // 1. Fetch sounds (always needed)
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
      console.error('[PronunciationScreen] Error fetching data:', err);
      setError(err?.message || 'Failed to load IPA data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(false);
  }, [fetchData]);

  const go = (symbol: string) => router.push(`/pronunciation/${encodeURIComponent(symbol)}`);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🗣️ IPA Phonetic Chart</Text>
          <Text style={styles.headerSub}>Tap any symbol to practice with AI feedback</Text>
        </View>

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading Phonetic Chart...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <Text style={styles.retryText} onPress={() => fetchData()}>Tap here to retry</Text>
          </View>
        ) : sounds ? (
          <>
            {/* Show stats summary if user is logged in and stats are loaded */}
            {user && stats && <ProgressSummary stats={stats} />}

            <IpaChart sounds={sounds} progress={progress} onSymbolPress={go} />
          </>
        ) : null}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg, paddingBottom: 40 },
  header: { marginBottom: SPACING.xl },
  headerTitle: { fontSize: FONT_SIZES.xxl, fontFamily: FONTS.bold, color: COLORS.text },
  headerSub: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 4 },
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
});
