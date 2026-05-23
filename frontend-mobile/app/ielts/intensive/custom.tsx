import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  DeviceEventEmitter,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS, ROUTES } from '@/constants';
import { ieltsExamsApi } from '@/services/ielts.api';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { toast } from '@/components/ui';

// ─── Types ───────────────────────────────────────────────────────────────────
type IeltsSkill = 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING';

interface PracticeExamItem {
  id: string;
  title: string;
  description?: string;
  skill: IeltsSkill;
  partNumber: number;
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  questionCount: number;
  estimatedMinutes: number;
  tags?: string[];
  isNew?: boolean;
  completedCount?: number;
}

interface PracticeCatalogResponse {
  listening: PracticeExamItem[];
  reading: PracticeExamItem[];
  writing: PracticeExamItem[];
  speaking: PracticeExamItem[];
}

const SKILL_CONFIG: Record<IeltsSkill, { label: string; icon: string; color: string }> = {
  LISTENING: { label: 'Listening', icon: 'headphones-outline', color: '#3B82F6' },
  READING: { label: 'Reading', icon: 'book-outline', color: '#10B981' },
  WRITING: { label: 'Writing', icon: 'pencil-outline', color: '#EC4899' },
  SPEAKING: { label: 'Speaking', icon: 'mic-outline', color: '#F59E0B' },
};

// ─── Fallback Local Mock Items ────────────────────────────────────────────────
const LOCAL_FALLBACK_CATALOG: PracticeCatalogResponse = {
  listening: [
    { id: 'intensive-l1', title: 'IELTS Intensive Practice Test 1', skill: 'LISTENING', partNumber: 1, difficulty: 'BEGINNER', questionCount: 10, estimatedMinutes: 10, tags: ['Form Completion', 'Social context'], completedCount: 1 },
    { id: 'intensive-l2', title: 'IELTS Intensive Practice Test 1', skill: 'LISTENING', partNumber: 2, difficulty: 'INTERMEDIATE', questionCount: 10, estimatedMinutes: 12, tags: ['Multiple Choice', 'Matching'], completedCount: 0 },
    { id: 'intensive-l3', title: 'IELTS Intensive Practice Test 1', skill: 'LISTENING', partNumber: 3, difficulty: 'ADVANCED', questionCount: 10, estimatedMinutes: 15, tags: ['Class discussion', 'Academic'], completedCount: 2 },
    { id: 'intensive-l4', title: 'IELTS Intensive Practice Test 1', skill: 'LISTENING', partNumber: 4, difficulty: 'ADVANCED', questionCount: 10, estimatedMinutes: 15, tags: ['Lecture monologue', 'Academic'], completedCount: 0 },
  ],
  reading: [
    { id: 'intensive-r1', title: 'IELTS Intensive Practice Test 1', skill: 'READING', partNumber: 1, difficulty: 'BEGINNER', questionCount: 13, estimatedMinutes: 20, tags: ['True False Not Given', 'Matching Headings'], completedCount: 0 },
    { id: 'intensive-r2', title: 'IELTS Intensive Practice Test 1', skill: 'READING', partNumber: 2, difficulty: 'INTERMEDIATE', questionCount: 13, estimatedMinutes: 20, tags: ['Matching Paragraphs', 'Sentence Completion'], completedCount: 1 },
    { id: 'intensive-r3', title: 'IELTS Intensive Practice Test 1', skill: 'READING', partNumber: 3, difficulty: 'ADVANCED', questionCount: 14, estimatedMinutes: 20, tags: ['Summary Completion', 'Yes No Not Given'], completedCount: 0 },
  ],
  writing: [
    { id: 'intensive-w1', title: 'IELTS Intensive Practice Test 1', skill: 'WRITING', partNumber: 1, difficulty: 'BEGINNER', questionCount: 1, estimatedMinutes: 20, tags: ['Task 1', 'Line Graph', 'Descriptive'], completedCount: 2 },
    { id: 'intensive-w2', title: 'IELTS Intensive Practice Test 1', skill: 'WRITING', partNumber: 2, difficulty: 'ADVANCED', questionCount: 1, estimatedMinutes: 40, tags: ['Task 2', 'Opinion Essay', 'Agree Disagree'], completedCount: 0 },
  ],
  speaking: [
    { id: 'intensive-s1', title: 'IELTS Intensive Practice Test 1', skill: 'SPEAKING', partNumber: 1, difficulty: 'BEGINNER', questionCount: 4, estimatedMinutes: 5, tags: ['Part 1', 'General Qs'], completedCount: 1 },
    { id: 'intensive-s2', title: 'IELTS Intensive Practice Test 1', skill: 'SPEAKING', partNumber: 2, difficulty: 'INTERMEDIATE', questionCount: 1, estimatedMinutes: 3, tags: ['Part 2', 'Cue Card', 'Monologue'], completedCount: 0 },
    { id: 'intensive-s3', title: 'IELTS Intensive Practice Test 1', skill: 'SPEAKING', partNumber: 3, difficulty: 'ADVANCED', questionCount: 4, estimatedMinutes: 5, tags: ['Part 3', 'Discussion', 'Abstract Qs'], completedCount: 0 },
  ],
};

export default function CustomPracticeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { isPremium, loading: subLoading } = useSubscription();
  const { colors, isDark } = useTheme();

  const [activeTab, setActiveTab] = useState<IeltsSkill>('LISTENING');
  const [catalog, setCatalog] = useState<PracticeCatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingSessionId, setStartingSessionId] = useState<string | null>(null);

  // Redirect to pricing if user is not premium
  useEffect(() => {
    if (!subLoading && !isPremium) {
      router.replace(ROUTES.pricing);
    }
  }, [isPremium, subLoading]);

  // Fetch catalog on mount
  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const res = await ieltsExamsApi.getPracticeCatalog();
      if (res && (res.listening?.length || res.reading?.length || res.writing?.length || res.speaking?.length)) {
        setCatalog(res);
      } else {
        setCatalog(LOCAL_FALLBACK_CATALOG);
      }
    } catch (e) {
      if (__DEV__) console.log('Failed to fetch practice catalog, falling back to local dataset', e);
      setCatalog(LOCAL_FALLBACK_CATALOG);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleStartPractice = async (item: PracticeExamItem) => {
    if (!user?.id) return;
    try {
      setStartingSessionId(item.id + '_' + item.partNumber);
      const session = await ieltsExamsApi.createSession(item.id, user.id, item.partNumber);
      // Navigate to dedicated practice screen
      router.push(`/ielts/intensive/practice/${session.id}`);
    } catch (err) {
      if (__DEV__) console.error('Failed to create practice session', err);
      toast.error('Could not create practice session. Please try again.');
    } finally {
      setStartingSessionId(null);
    }
  };

  const activeList = useMemo(() => {
    if (!catalog) return [];
    const key = activeTab.toLowerCase() as keyof PracticeCatalogResponse;
    return catalog[key] || [];
  }, [catalog, activeTab]);

  const activeColor = SKILL_CONFIG[activeTab].color;

  const styles = createStyles(colors, isDark, activeColor);

  if (subLoading || (loading && !catalog)) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={isDark ? colors.text : '#fff'} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Intensive Practice</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Fetching practice catalog...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={isDark ? colors.text : '#fff'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Intensive Practice</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {(Object.keys(SKILL_CONFIG) as IeltsSkill[]).map((tab) => {
          const config = SKILL_CONFIG[tab];
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabItem,
                isActive && { borderBottomColor: config.color, backgroundColor: config.color + '05' },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Ionicons
                name={config.icon as any}
                size={16}
                color={isActive ? config.color : colors.textMuted}
              />
              <Text style={[styles.tabLabel, isActive && { color: config.color, fontFamily: FONTS.bold }]}>
                {config.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Practice exam list */}
      <FlatList
        data={activeList}
        keyExtractor={(item, index) => `${item.id}_${item.partNumber}_${index}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isButtonLoading = startingSessionId === `${item.id}_${item.partNumber}`;

          let difficultyBg = '#DEF7EC';
          let difficultyText = '#03543F';
          if (item.difficulty === 'INTERMEDIATE') {
            difficultyBg = '#FEF3C7';
            difficultyText = '#92400E';
          } else if (item.difficulty === 'ADVANCED') {
            difficultyBg = '#FDE8E8';
            difficultyText = '#9B1C1C';
          }

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardMetaLeft}>
                  <Ionicons name={SKILL_CONFIG[item.skill].icon as any} size={14} color={activeColor} />
                  <Text style={styles.partLabel}>
                    Part {item.partNumber}
                  </Text>
                </View>
                <View style={[styles.diffBadge, { backgroundColor: difficultyBg }]}>
                  <Text style={[styles.diffBadgeText, { color: difficultyText }]}>
                    {item.difficulty || 'GENERAL'}
                  </Text>
                </View>
              </View>

              <Text style={styles.cardTitle}>{item.title}</Text>
              
              {item.description ? (
                <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
              ) : null}

              {/* Tags row */}
              {item.tags && item.tags.length > 0 && (
                <View style={styles.tagsRow}>
                  {item.tags.slice(0, 3).map((tag, idx) => (
                    <View key={idx} style={styles.tagChip}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Details & Action row */}
              <View style={styles.cardFooter}>
                <View style={styles.detailsGroup}>
                  <View style={styles.detailItem}>
                    <Ionicons name="help-circle-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.detailText}>{item.questionCount} Qs</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.detailText}>{item.estimatedMinutes} min</Text>
                  </View>
                  {item.completedCount && item.completedCount > 0 ? (
                    <View style={styles.completedBadge}>
                      <Ionicons name="checkmark-circle" size={13} color="#10B981" />
                      <Text style={styles.completedText}>Done {item.completedCount}x</Text>
                    </View>
                  ) : null}
                </View>

                <TouchableOpacity
                  style={[styles.practiceBtn, isButtonLoading && styles.btnDisabled]}
                  onPress={() => handleStartPractice(item)}
                  disabled={isButtonLoading}
                  activeOpacity={0.8}
                >
                  {isButtonLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.practiceBtnText}>Practice</Text>
                      <Ionicons name="arrow-forward" size={14} color="#fff" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="file-tray-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>No practice units available for this skill yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: any, isDark: boolean, activeColor: string) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: isDark ? colors.surface : colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      borderBottomWidth: isDark ? 1 : 0,
      borderBottomColor: colors.border,
    },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    headerTitle: {
      color: isDark ? colors.text : '#fff',
      fontSize: FONT_SIZES.lg,
      fontFamily: FONTS.bold,
    },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadingText: { fontSize: FONT_SIZES.sm, color: colors.textSecondary },
    
    // Tabs
    tabsContainer: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    tabItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 14,
      borderBottomWidth: 3,
      borderBottomColor: 'transparent',
    },
    tabLabel: {
      fontSize: 12,
      fontFamily: FONTS.medium,
      color: colors.textSecondary,
    },

    // List
    listContent: { padding: SPACING.md, paddingBottom: 40, gap: SPACING.md },
    card: {
      backgroundColor: colors.card,
      borderRadius: RADIUS.xl,
      borderWidth: 1,
      borderColor: colors.border,
      padding: SPACING.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.xs,
    },
    cardMetaLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    partLabel: {
      fontSize: 11,
      fontFamily: FONTS.bold,
      color: activeColor,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    diffBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: RADIUS.sm,
    },
    diffBadgeText: {
      fontSize: 9,
      fontFamily: FONTS.bold,
    },
    cardTitle: {
      fontSize: 16,
      fontFamily: FONTS.bold,
      color: colors.text,
      marginBottom: 6,
    },
    cardDesc: {
      fontSize: 12,
      fontFamily: FONTS.regular,
      color: colors.textSecondary,
      lineHeight: 18,
      marginBottom: SPACING.sm,
    },
    tagsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: SPACING.md,
    },
    tagChip: {
      backgroundColor: isDark ? colors.surface : '#F3F4F6',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: RADIUS.sm,
    },
    tagText: {
      fontSize: 10,
      color: colors.textSecondary,
      fontFamily: FONTS.medium,
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: colors.border + '50',
      paddingTop: SPACING.md,
    },
    detailsGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    detailText: {
      fontSize: 11,
      fontFamily: FONTS.medium,
      color: colors.textSecondary,
    },
    completedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: '#DEF7EC',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 99,
    },
    completedText: {
      fontSize: 9,
      fontFamily: FONTS.bold,
      color: '#03543F',
    },
    practiceBtn: {
      backgroundColor: activeColor,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: RADIUS.lg,
      shadowColor: activeColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 2,
    },
    btnDisabled: { opacity: 0.5 },
    practiceBtnText: {
      color: '#fff',
      fontSize: 12,
      fontFamily: FONTS.bold,
    },
    
    // Empty state
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      gap: 8,
    },
    emptyText: {
      fontSize: 13,
      fontFamily: FONTS.regular,
      color: colors.textMuted,
      textAlign: 'center',
    },
  });
