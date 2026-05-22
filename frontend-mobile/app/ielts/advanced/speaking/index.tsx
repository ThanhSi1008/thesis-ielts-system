import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Platform,
  LayoutAnimation,
  UIManager,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, SPACING, RADIUS, FONT_SIZES, ROUTES } from '@/constants';
import { ieltsAdvancedApi } from '@/services/ielts.api';
import { SpeakingPartCard } from '@/components/ielts';
import { EmptyState, FeatureLock } from '@/components/ui/index';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { SpeakingDeviceTest } from '@/components';
import { useTheme } from '@/contexts/ThemeContext';
import Animated, { FadeInUp } from 'react-native-reanimated';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TABS = [
  { key: 'ALL', label: 'All Parts' },
  { key: 'PART1', label: 'Part 1', value: 1 },
  { key: 'PART2', label: 'Part 2', value: 2 },
  { key: 'PART3', label: 'Part 3', value: 3 },
];

export default function AdvancedSpeakingIndexScreen() {
  const router = useRouter();
  const { isPremium } = useSubscription();
  const { colors, isDark } = useTheme();
  const [parts, setParts] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PART1' | 'PART2' | 'PART3'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Device Test Overlay State
  const [isDeviceTested, setIsDeviceTested] = useState<boolean | null>(null);

  // Check device tested flag on mount
  useEffect(() => {
    const checkDeviceTest = async () => {
      try {
        const value = await AsyncStorage.getItem('speaking-device-tested-v1');
        setIsDeviceTested(value === 'true');
      } catch (e) {
        setIsDeviceTested(false);
      }
    };
    checkDeviceTest();
  }, []);

  const fetchSpeakingData = useCallback(async () => {
    try {
      const params: any = {};
      const tabConfig = TABS.find((t) => t.key === activeTab);
      if (tabConfig && 'value' in tabConfig) {
        params.partNumber = tabConfig.value;
      }

      const [partsRes, statsRes] = await Promise.allSettled([
        ieltsAdvancedApi.getSpeakingParts(params),
        ieltsAdvancedApi.getSpeakingStats(),
      ]);

      if (partsRes.status === 'fulfilled') {
        const val = partsRes.value;
        setParts(Array.isArray(val) ? val : (val?.data ?? []));
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value ?? []);
      }
    } catch (err) {
      if (__DEV__) console.error('[AdvancedSpeakingIndex] Error fetching speaking data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchSpeakingData();
  }, [fetchSpeakingData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSpeakingData();
  };

  const handleTabChange = (tab: 'ALL' | 'PART1' | 'PART2' | 'PART3') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(tab);
    setLoading(true);
  };

  // Client-side filtering by search query
  const filteredParts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return parts.filter((p) => {
      if (
        q &&
        !(p.title ?? '').toLowerCase().includes(q) &&
        !(p.topic ?? '').toLowerCase().includes(q) &&
        !(p.category ?? '').toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [parts, searchQuery]);

  // Derived stats calculations
  const statsSummary = useMemo(() => {
    if (!stats || stats.length === 0) {
      return { averageBand: null, totalAttempts: 0, weakestPart: null };
    }

    const gradedSessions = stats.filter((s) => s.writingScore !== null);
    if (gradedSessions.length === 0) {
      return { averageBand: null, totalAttempts: 0, weakestPart: null };
    }

    const totalAttempts = gradedSessions.length;
    const sumScore = gradedSessions.reduce((acc, s) => acc + s.writingScore, 0);
    const averageBand = (sumScore / totalAttempts).toFixed(1);

    // Group scores by Part number to find the weakest area
    const partScores: Record<number, { sum: number; count: number }> = {};
    gradedSessions.forEach((s) => {
      const partNum = s.title?.toLowerCase().includes('part 1')
        ? 1
        : s.title?.toLowerCase().includes('part 2')
          ? 2
          : s.title?.toLowerCase().includes('part 3')
            ? 3
            : null;

      if (partNum !== null) {
        if (!partScores[partNum]) partScores[partNum] = { sum: 0, count: 0 };
        partScores[partNum].sum += s.writingScore;
        partScores[partNum].count += 1;
      }
    });

    let weakestPart: number | null = null;
    let lowestAverage = 10; // IELTS max score is 9.0

    Object.entries(partScores).forEach(([partNumStr, data]) => {
      const avg = data.sum / data.count;
      if (avg < lowestAverage) {
        lowestAverage = avg;
        weakestPart = Number(partNumStr);
      }
    });

    return {
      averageBand,
      totalAttempts,
      weakestPart: weakestPart !== null ? `Part ${weakestPart}` : null,
    };
  }, [stats]);

  const handlePartPress = (partId: string) => {
    if (!isPremium) {
      router.push(ROUTES.pricing);
      return;
    }
    router.push(ROUTES.ieltsAdvancedSpeaking(partId));
  };

  const handleRetestDevices = async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsDeviceTested(false);
  };

  // Render Device Test Overlay if not completed yet
  if (isDeviceTested === false) {
    return (
      <View style={StyleSheet.absoluteFill}>
        <SpeakingDeviceTest
          onComplete={() => setIsDeviceTested(true)}
          onExit={() => {
            // Exit back to advanced list if first test, otherwise just close overlay
            if (parts.length === 0) {
              router.back();
            } else {
              setIsDeviceTested(true);
            }
          }}
        />
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      marginTop: SPACING.sm,
      fontFamily: FONTS.medium,
      fontSize: FONT_SIZES.sm,
      color: colors.textSecondary,
    },
    header: {
      backgroundColor: isDark ? colors.card : COLORS.skill.speaking,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.md,
      borderBottomWidth: isDark ? 1 : 0,
      borderBottomColor: colors.border,
    },
    backBtn: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      color: isDark ? colors.text : '#fff',
      fontSize: FONT_SIZES.lg,
      fontFamily: FONTS.bold,
    },
    rightHeaderContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerBtn: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabBar: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: SPACING.md,
      borderBottomWidth: 3,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: COLORS.skill.speaking,
    },
    tabLabel: {
      fontSize: FONT_SIZES.sm,
      fontFamily: FONTS.medium,
      color: colors.textSecondary,
    },
    activeTabLabel: {
      color: COLORS.skill.speaking,
      fontFamily: FONTS.bold,
    },
    statsBanner: {
      backgroundColor: isDark ? 'rgba(124, 58, 237, 0.1)' : '#FAF5FF',
      marginHorizontal: SPACING.lg,
      marginTop: SPACING.md,
      padding: SPACING.md,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(124, 58, 237, 0.3)' : '#E9D5FF',
    },
    statsBannerHeader: {
      marginBottom: SPACING.md,
    },
    statsBannerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    statsBannerTitle: {
      fontFamily: FONTS.bold,
      fontSize: 15,
      color: isDark ? '#C084FC' : '#581C87',
    },
    statsBannerSubtitle: {
      fontFamily: FONTS.regular,
      fontSize: 11,
      color: isDark ? '#A78BFA' : '#7B39B9',
      marginTop: 2,
    },
    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    statBox: {
      alignItems: 'center',
      flex: 1,
    },
    statVal: {
      fontFamily: FONTS.bold,
      fontSize: 18,
      color: isDark ? '#C084FC' : '#7C3AED',
    },
    statLbl: {
      fontFamily: FONTS.medium,
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    statDivider: {
      width: 1,
      height: 30,
      backgroundColor: isDark ? colors.border : '#E9D5FF',
    },
    searchRow: {
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: RADIUS.md,
      paddingHorizontal: SPACING.md,
      height: 40,
      gap: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      height: '100%',
      fontFamily: FONTS.regular,
      fontSize: FONT_SIZES.sm,
      color: colors.text,
      padding: 0,
    },
    listContent: {
      padding: SPACING.lg,
      paddingBottom: 100,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={isDark ? colors.text : '#fff'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Advanced Speaking</Text>
        <View style={styles.rightHeaderContainer}>
          <TouchableOpacity
            style={[styles.headerBtn, { marginRight: 8 }]}
            onPress={handleRetestDevices}
          >
            <Ionicons name="construct-outline" size={20} color={isDark ? colors.text : '#fff'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => router.push(ROUTES.ieltsAdvancedHistory)}
          >
            <Ionicons name="time-outline" size={22} color={isDark ? colors.text : '#fff'} />
          </TouchableOpacity>
        </View>
      </View>

      <FeatureLock requiredTier="PREMIUM" featureName="Advanced Speaking Evaluation">
        {/* Tabs */}
        <View style={styles.tabBar}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, activeTab === t.key && styles.activeTab]}
              onPress={() => handleTabChange(t.key as any)}
            >
              <Text style={[styles.tabLabel, activeTab === t.key && styles.activeTabLabel]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Summary Banner (Premium aesthetic details) */}
        {!loading && statsSummary.totalAttempts > 0 && activeTab === 'ALL' && (
          <Animated.View entering={FadeInUp.duration(400)} style={styles.statsBanner}>
            <View style={styles.statsBannerHeader}>
              <View style={styles.statsBannerTitleRow}>
                <Ionicons name="trophy" size={18} color={isDark ? '#C084FC' : '#7C3AED'} />
                <Text style={styles.statsBannerTitle}>Speaking Performance</Text>
              </View>
              <Text style={styles.statsBannerSubtitle}>Calculated from graded practices</Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{statsSummary.averageBand}</Text>
                <Text style={styles.statLbl}>Average Band</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{statsSummary.totalAttempts}</Text>
                <Text style={styles.statLbl}>Practiced Decks</Text>
              </View>
              {statsSummary.weakestPart && (
                <>
                  <View style={styles.statDivider} />
                  <View style={styles.statBox}>
                    <Text style={[styles.statVal, { color: '#EF4444' }]}>
                      {statsSummary.weakestPart}
                    </Text>
                    <Text style={styles.statLbl}>Focus Area</Text>
                  </View>
                </>
              )}
            </View>
          </Animated.View>
        )}

        {/* Search Bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={16} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search topics or categories..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        {/* Main Content */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.skill.speaking} />
            <Text style={styles.loadingText}>Loading speaking topics...</Text>
          </View>
        ) : filteredParts.length === 0 ? (
          <EmptyState
            icon="🗣️"
            title="No speaking parts found"
            subtitle="Try searching for another topic or check your network connection."
          />
        ) : (
          <FlatList
            data={filteredParts}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <SpeakingPartCard
                part={{
                  id: item.id,
                  partNumber: item.partNumber as 1 | 2 | 3,
                  partType: item.partType,
                  title: item.title,
                  topic: item.topic,
                  category: item.category ?? 'General',
                  source: item.source,
                  bestScore: item.bestScore ?? null,
                  lastAttempt: item.lastAttempt ?? null,
                }}
                index={index}
                onPress={() => handlePartPress(item.id)}
              />
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={COLORS.skill.speaking}
              />
            }
          />
        )}
      </FeatureLock>
    </SafeAreaView>
  );
}
