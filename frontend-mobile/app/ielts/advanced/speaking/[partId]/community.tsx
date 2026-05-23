import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { ieltsAdvancedApi } from '@/services';
import { CommunitySpeakingAnswer } from '@/types';
import { CommunityAnswerCard } from '@/components/ielts';
import { EmptyState, ErrorState } from '@/components/molecules';
import { Skeleton, Text } from '@/components/atoms';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';

const LIMIT = 10;

export default function SpeakingCommunityScreen() {
  const router = useRouter();
  const { partId } = useLocalSearchParams<{ partId: string }>();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const [part, setPart] = useState<any>(null);
  const [answers, setAnswers] = useState<CommunitySpeakingAnswer[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<'band' | 'date'>('band');
  
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const fetchPart = async () => {
    if (!partId) return;
    try {
      const res = await ieltsAdvancedApi.getSpeakingPart(partId);
      setPart(res);
    } catch (e) {
      console.error('Failed to load speaking part:', e);
    }
  };

  const fetchAnswers = useCallback(async (pageNum: number, isRefresh = false) => {
    if (!partId) return;
    if (pageNum === 1 && !isRefresh) setLoading(true);
    setError(false);

    try {
      const res = await ieltsAdvancedApi.getCommunitySpeakingAnswers(partId, {
        page: pageNum,
        limit: LIMIT,
        sortBy,
      });

      const responseData = Array.isArray(res) ? res : (res?.data ?? []);
      const responseTotal = res?.total ?? responseData.length;

      setAnswers((prev) => {
        if (pageNum === 1) return responseData;
        return [...prev, ...responseData];
      });
      setTotal(responseTotal);
    } catch (e) {
      console.error('Failed to load community speaking answers:', e);
      setError(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [partId, sortBy]);

  // Initial fetches
  useEffect(() => {
    fetchPart();
    fetchAnswers(1);
  }, [fetchAnswers]);

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchAnswers(1, true);
  };

  const handleLoadMore = () => {
    if (loadingMore || answers.length >= total) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAnswers(nextPage);
  };

  const toggleSort = () => {
    const nextSort = sortBy === 'band' ? 'date' : 'band';
    setSortBy(nextSort);
    setPage(1);
    setLoading(true);
    ieltsAdvancedApi.getCommunitySpeakingAnswers(partId, {
      page: 1,
      limit: LIMIT,
      sortBy: nextSort,
    }).then((res) => {
      const responseData = Array.isArray(res) ? res : (res?.data ?? []);
      setAnswers(responseData);
      setTotal(res?.total ?? responseData.length);
    }).catch(() => {
      setError(true);
    }).finally(() => {
      setLoading(false);
    });
  };

  const navigateToDetail = (sessionId: string) => {
    router.push(`/ielts/advanced/speaking/${partId}/community/${sessionId}`);
  };

  if (loading && page === 1) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Community Answers</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Skeleton height={110} variant="card" count={5} gap={16} />
        </View>
      </SafeAreaView>
    );
  }

  if (error && answers.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Community Answers</Text>
          <View style={{ width: 44 }} />
        </View>
        <ErrorState variant="network" onRetry={() => fetchAnswers(1)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle} numberOfLines={1}>Community Answers</Text>
          {part && <Text style={styles.headerSubtitle} numberOfLines={1}>{part.topic ?? part.title}</Text>}
        </View>
        <TouchableOpacity style={styles.sortBtn} onPress={toggleSort} activeOpacity={0.8}>
          <Ionicons name={sortBy === 'band' ? 'trending-up' : 'calendar'} size={20} color={colors.primary} />
          <Text style={styles.sortText}>{sortBy === 'band' ? 'Band' : 'Date'}</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={answers}
        keyExtractor={(item) => item.sessionId}
        renderItem={({ item }) => (
          <CommunityAnswerCard
            type="speaking"
            answer={item}
            onPress={() => navigateToDetail(item.sessionId)}
          />
        )}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <EmptyState
            title="Be the First!"
            description="No community speaking practices have been submitted for this topic yet. Share yours and help peers!"
            illustration="mic-outline"
          />
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.md,
      paddingBottom: SPACING.sm,
      paddingTop: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
    },
    backBtn: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitleCol: {
      flex: 1,
      marginLeft: SPACING.xs,
      marginRight: SPACING.sm,
    },
    headerTitle: {
      fontSize: FONT_SIZES.md,
      fontFamily: FONTS.bold,
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 11,
      fontFamily: FONTS.regular,
      color: colors.textSecondary,
      marginTop: 2,
    },
    sortBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: SPACING.md,
      paddingVertical: 6,
      borderRadius: RADIUS.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    sortText: {
      fontSize: 11,
      fontFamily: FONTS.bold,
      color: colors.textSecondary,
    },
    loadingContainer: {
      flex: 1,
      padding: SPACING.md,
    },
    listContent: {
      padding: SPACING.md,
      paddingBottom: 60,
    },
    footerLoader: {
      paddingVertical: SPACING.md,
      alignItems: 'center',
    },
  });
}
