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
import { COLORS, FONTS, SPACING, RADIUS, FONT_SIZES, ROUTES } from '@/constants';
import { ieltsAdvancedApi } from '@/services/ielts.api';
import { AdvancedWritingPromptCard } from '@/components/ielts';
import { EmptyState, FeatureLock, UsageIndicator } from '@/components/ui/index';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useTheme } from '@/contexts/ThemeContext';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TABS = [
  { key: 'ALL', label: 'All Tasks', color: COLORS.skill.writing },
  { key: 'TASK1', label: 'Task 1', color: COLORS.skill.writing },
  { key: 'TASK2', label: 'Task 2', color: COLORS.skill.writing },
];

export default function AdvancedWritingIndexScreen() {
  const router = useRouter();
  const { isPremium, usage } = useSubscription();
  const { colors, isDark } = useTheme();
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'TASK1' | 'TASK2'>('ALL');
  const [selectedSubType, setSelectedSubType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPrompts = useCallback(async () => {
    try {
      const params: any = {};
      if (activeTab !== 'ALL') {
        params.taskType = activeTab;
      }
      if (selectedSubType) {
        params.subType = selectedSubType;
      }

      const res = await ieltsAdvancedApi.getWritingPrompts(params);
      setPrompts(Array.isArray(res) ? res : (res?.data ?? []));
    } catch (err) {
      if (__DEV__) console.error('[AdvancedWritingIndex] Failed to fetch prompts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, selectedSubType]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPrompts();
  };

  const handleTabChange = (tab: 'ALL' | 'TASK1' | 'TASK2') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(tab);
    setSelectedSubType(null);
    setLoading(true);
  };

  // Get unique subTypes of current prompts for filtering
  const subTypes = useMemo(() => {
    const types = new Set<string>();
    prompts.forEach((p) => {
      if (p.subType) types.add(p.subType);
    });
    return Array.from(types).sort();
  }, [prompts]);

  // Client-side filtering by search query
  const filteredPrompts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return prompts.filter((p) => {
      if (
        q &&
        !(p.title ?? '').toLowerCase().includes(q) &&
        !(p.subType ?? '').toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [prompts, searchQuery]);

  const handlePromptPress = (promptId: string) => {
    if (!isPremium) {
      // PREMIUM locked gate - will be fully integrated with FeatureLock in Phase 3
      router.push(ROUTES.pricing);
      return;
    }
    router.push(ROUTES.ieltsAdvancedWriting(promptId));
  };

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
      backgroundColor: isDark ? colors.card : COLORS.skill.writing,
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
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: SPACING.md,
      borderBottomWidth: 3,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: COLORS.skill.writing,
    },
    tabLabel: {
      fontFamily: FONTS.medium,
      fontSize: FONT_SIZES.md,
      color: colors.textSecondary,
    },
    activeTabLabel: {
      fontFamily: FONTS.bold,
      color: COLORS.skill.writing,
    },
    searchRow: {
      backgroundColor: colors.card,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      backgroundColor: colors.background,
      borderRadius: RADIUS.md,
      paddingHorizontal: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
      height: 38,
    },
    searchInput: {
      flex: 1,
      fontFamily: FONTS.regular,
      fontSize: FONT_SIZES.sm,
      color: colors.text,
      padding: 0,
    },
    filterContainer: {
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    filterContent: {
      flexDirection: 'row',
      gap: SPACING.sm,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
    },
    filterChip: {
      paddingHorizontal: SPACING.md,
      paddingVertical: 6,
      borderRadius: RADIUS.full,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    activeFilterChip: {
      backgroundColor: COLORS.skill.writing + (isDark ? '25' : '12'),
      borderColor: COLORS.skill.writing,
    },
    filterChipText: {
      fontFamily: FONTS.medium,
      fontSize: FONT_SIZES.xs,
      color: colors.textSecondary,
    },
    activeFilterChipText: {
      fontFamily: FONTS.bold,
      color: COLORS.skill.writing,
    },
    listContent: {
      padding: SPACING.md,
      paddingBottom: 60,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={isDark ? colors.text : '#fff'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Advanced Writing</Text>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => router.push(ROUTES.ieltsAdvancedHistory)}
        >
          <Ionicons name="time-outline" size={22} color={isDark ? colors.text : '#fff'} />
        </TouchableOpacity>
      </View>

      <FeatureLock requiredTier="PREMIUM" featureName="Advanced Writing Evaluation">
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

        {/* Search and SubType filters */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={16} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search prompts..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        {/* Subtype chips */}
        {!loading && subTypes.length > 0 && (
          <View style={styles.filterContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterContent}
            >
              <TouchableOpacity
                style={[styles.filterChip, !selectedSubType && styles.activeFilterChip]}
                onPress={() => setSelectedSubType(null)}
              >
                <Text
                  style={[styles.filterChipText, !selectedSubType && styles.activeFilterChipText]}
                >
                  All Types
                </Text>
              </TouchableOpacity>
              {subTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.filterChip, selectedSubType === type && styles.activeFilterChip]}
                  onPress={() => setSelectedSubType(type)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedSubType === type && styles.activeFilterChipText,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Main Content */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.skill.writing} />
            <Text style={styles.loadingText}>Loading prompts...</Text>
          </View>
        ) : filteredPrompts.length === 0 ? (
          <EmptyState
            icon="✍️"
            title="No prompts found"
            subtitle="Try search with another query or reset the filters."
          />
        ) : (
          <FlatList
            data={filteredPrompts}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={
              usage?.AI_WRITING_GRADING && usage.AI_WRITING_GRADING.limit !== Infinity ? (
                <View
                  style={{
                    backgroundColor: colors.card,
                    padding: SPACING.md,
                    borderRadius: RADIUS.xl,
                    borderWidth: 1,
                    borderColor: colors.border,
                    marginBottom: SPACING.md,
                  }}
                >
                  <UsageIndicator
                    label="Monthly AI Writing Evaluations"
                    used={usage.AI_WRITING_GRADING.used}
                    limit={usage.AI_WRITING_GRADING.limit}
                  />
                </View>
              ) : null
            }
            renderItem={({ item, index }) => (
              <AdvancedWritingPromptCard
                prompt={{
                  id: item.id,
                  taskType: item.taskType,
                  subType: item.subType ?? 'Essay',
                  category: item.category ?? 'General',
                  title: item.title,
                  suggestedTime: item.suggestedTime ?? (item.taskType === 'TASK1' ? 20 : 40),
                  minimumWords: item.minimumWords ?? (item.taskType === 'TASK1' ? 150 : 250),
                  source: item.source,
                  imageUrl: item.imageUrl,
                  bestScore: item.bestScore ?? null,
                  lastAttempt: item.lastAttempt ?? null,
                }}
                index={index}
                onPress={() => handlePromptPress(item.id)}
              />
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={COLORS.skill.writing}
              />
            }
          />
        )}
      </FeatureLock>
    </SafeAreaView>
  );
}
