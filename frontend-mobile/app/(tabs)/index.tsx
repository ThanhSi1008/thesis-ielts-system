import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  useWindowDimensions,
  Animated,
  DeviceEventEmitter,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { FONT_SIZES, RADIUS, SPACING, FONTS, ThemeTokens } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles, useTabBarVisibility } from '@/hooks';
import { ieltsProfileApi } from '@/services';

export default function HomeTab() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const isDark = colors.statusBar === 'light-content';
  const { handleScroll } = useTabBarVisibility();
  const scrollViewRef = useRef<ScrollView>(null);

  // Core Data States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [smartRecommendations, setSmartRecommendations] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    try {
      const [activityRes, recsRes] = await Promise.all([
        ieltsProfileApi.getRecentActivity(),
        ieltsProfileApi.getRecommended(),
      ]);
      setData(activityRes);
      setSmartRecommendations(recsRes || []);
    } catch (e) {
      console.error('Failed to fetch dashboard data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Scroll to top on double tap active tab
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(
      'SCROLL_TO_TOP',
      ({ target }: { target: string }) => {
        if (target === 'index') {
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }
      }
    );
    return () => listener.remove();
  }, []);

  // Animations
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ]),
    ).start();
  }, [floatAnim]);

  const translateY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });

  // Navigation action handler for horizontal items
  const handleActivityPress = (act: any) => {
    const meta = act.metadata || {};
    switch (act.type) {
      case 'INTENSIVE':
        if (meta.examId) {
          router.push(`/ielts/intensive/${meta.examId}`);
        } else {
          router.push('/ielts/dashboard');
        }
        break;
      case 'VOCABULARY':
        router.push('/ielts/foundation/vocabulary');
        break;
      case 'GRAMMAR':
        router.push('/ielts/foundation/grammar');
        break;
      case 'SHADOWING':
        if (meta.lessonId) {
          router.push(`/practice-tools/shadowing/${meta.lessonId}/shadowing`);
        } else {
          router.push('/(tabs)/explore');
        }
        break;
      case 'DICTATION':
        if (meta.lessonId) {
          router.push(`/practice-tools/shadowing/${meta.lessonId}/dictation`);
        } else {
          router.push('/(tabs)/explore');
        }
        break;
      default:
        router.push('/(tabs)/explore');
        break;
    }
  };

  // Helper colors and icons
  const getActivityIcon = (type: string): any => {
    switch (type) {
      case 'INTENSIVE': return 'document-text';
      case 'LISTENING': return 'headset';
      case 'READING': return 'book';
      case 'WRITING': return 'create';
      case 'SPEAKING': return 'mic';
      case 'VOCABULARY': return 'school';
      case 'GRAMMAR': return 'bookmarks';
      case 'SHADOWING': return 'videocam';
      case 'DICTATION': return 'ear';
      default: return 'sparkles';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'INTENSIVE': return '#3b82f6';
      case 'LISTENING': return '#06b6d4';
      case 'READING': return '#10b981';
      case 'WRITING': return '#f97316';
      case 'SPEAKING': return '#ec4899';
      case 'VOCABULARY': return '#8b5cf6';
      case 'GRAMMAR': return '#6366f1';
      case 'SHADOWING': return '#f59e0b';
      case 'DICTATION': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const streak = data?.streak || {
    currentStreak: 0,
    longestStreak: 0,
    dailyCommitmentMins: 30,
    todayMins: 0,
    progressPercent: 0,
  };
  const recentActivities = data?.recentActivities || [];
  const recommendations = smartRecommendations.length > 0 ? smartRecommendations : (data?.recommendations || []);

  return (
    <View style={styles.container}>
      {/* Premium background gradient based on active color themes */}
      <LinearGradient
        colors={isDark ? ['#0b1329', '#161b33'] : [colors.bgSubtle, colors.background]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header / Brand Title area */}
        <View style={styles.headerArea}>
          <View>
            <Text style={styles.greeting} allowFontScaling={true}>
              Hello Learner 👋
            </Text>
            <Text style={styles.brandTitle} allowFontScaling={true}>
              Ready for IELTS?
            </Text>
          </View>
          <View style={styles.headerActions}>
            <Link href="/notification" asChild>
              <Pressable
                style={styles.notifButton}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Notifications"
                accessibilityHint="Double tap to open notifications"
              >
                <Ionicons name="notifications-outline" size={24} color={colors.text} />
              </Pressable>
            </Link>
          </View>
        </View>

        {/* Daily Goal Card */}
        <View
          style={styles.goalCard}
          accessible={true}
          accessibilityLabel={`Daily Goal: ${streak.progressPercent}% completed. ${streak.todayMins} minutes out of ${streak.dailyCommitmentMins} target. Streak is ${streak.currentStreak} days.`}
        >
          <LinearGradient
            colors={isDark ? ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)'] : ['#ffffff', '#f1f5f9']}
            style={styles.goalCardGradient}
          >
            <View style={styles.goalHeader}>
              <View>
                <Text style={styles.goalTitle} allowFontScaling={true}>
                  DAILY COMMITMENT
                </Text>
                <Text style={styles.goalTime} allowFontScaling={true}>
                  {streak.todayMins} <Text style={styles.goalTimeSub}>/ {streak.dailyCommitmentMins} mins</Text>
                </Text>
              </View>
              <View style={styles.streakBadge}>
                <Text style={styles.streakText} allowFontScaling={true}>
                  🔥 {streak.currentStreak} Days Streak
                </Text>
              </View>
            </View>

            <View style={styles.progressBarWrapper}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${streak.progressPercent}%` }]} />
              </View>
              <View style={styles.progressFooter}>
                <Text style={styles.progressPercentText} allowFontScaling={true}>
                  {streak.progressPercent}% Completed
                </Text>
                <Animated.View style={{ transform: [{ translateY }] }}>
                  <Ionicons name="sparkles" size={14} color={colors.primary} />
                </Animated.View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle} allowFontScaling={true}>
            Quick Actions
          </Text>
          <View style={styles.quickActionsRow}>
            <Link href="/ielts/dashboard" asChild>
              <Pressable
                style={styles.actionBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Mock Exam"
                accessibilityHint="Takes you to the IELTS Mock Exam dashboard"
              >
                <View style={[styles.actionIconContainer, { backgroundColor: '#eff6ff' }]}>
                  <Ionicons name="document-text" size={24} color="#3b82f6" />
                </View>
                <Text style={styles.actionLabel} allowFontScaling={true}>
                  Mock Exam
                </Text>
              </Pressable>
            </Link>

            <Link href="/vocab-lab" asChild>
              <Pressable
                style={styles.actionBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Vocab Quiz"
                accessibilityHint="Takes you to the Vocab Lab dashboard"
              >
                <View style={[styles.actionIconContainer, { backgroundColor: '#ecfdf5' }]}>
                  <Ionicons name="school" size={24} color="#10b981" />
                </View>
                <Text style={styles.actionLabel} allowFontScaling={true}>
                  Vocab Quiz
                </Text>
              </Pressable>
            </Link>

            <Link href="/(tabs)/explore" asChild>
              <Pressable
                style={styles.actionBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Speaking Practice"
                accessibilityHint="Takes you to speaking activities and modules"
              >
                <View style={[styles.actionIconContainer, { backgroundColor: '#fff7ed' }]}>
                  <Ionicons name="mic" size={24} color="#f97316" />
                </View>
                <Text style={styles.actionLabel} allowFontScaling={true}>
                  Speaking
                </Text>
              </Pressable>
            </Link>

            <Link href="/ielts/foundation/grammar" asChild>
              <Pressable
                style={styles.actionBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Grammar Lessons"
                accessibilityHint="Review foundational grammar items"
              >
                <View style={[styles.actionIconContainer, { backgroundColor: '#faf5ff' }]}>
                  <Ionicons name="book" size={24} color="#a855f7" />
                </View>
                <Text style={styles.actionLabel} allowFontScaling={true}>
                  Grammar
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>

        {/* Continue Learning Carousel */}
        <View style={styles.carouselContainer}>
          <Text style={styles.sectionTitle} allowFontScaling={true}>
            Continue Learning
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselScroll}
          >
            {recentActivities.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="play-circle" size={40} color={colors.textSecondary} />
                <Text style={styles.emptyText} allowFontScaling={true}>
                  No recent activity found. Begin learning using Quick Actions!
                </Text>
              </View>
            ) : (
              recentActivities.map((act: any) => (
                <Pressable
                  key={act.id}
                  style={styles.carouselCard}
                  onPress={() => handleActivityPress(act)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Continue ${act.title}. ${act.progressPercent}% complete.`}
                  accessibilityHint="Double tap to resume this lesson"
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.cardIconBadge, { backgroundColor: getActivityColor(act.type) + '20' }]}>
                      <Ionicons name={getActivityIcon(act.type)} size={18} color={getActivityColor(act.type)} />
                    </View>
                    <Text style={[styles.cardTag, { color: getActivityColor(act.type) }]} allowFontScaling={true}>
                      {act.type}
                    </Text>
                  </View>
                  <Text style={styles.cardTitle} numberOfLines={2} allowFontScaling={true}>
                    {act.title}
                  </Text>
                  <Text style={styles.cardSubtitle} numberOfLines={1} allowFontScaling={true}>
                    {act.subtitle}
                  </Text>

                  <View style={styles.cardProgressArea}>
                    <View style={styles.cardProgressBg}>
                      <View
                        style={[
                          styles.cardProgressFill,
                          {
                            width: `${act.progressPercent}%`,
                            backgroundColor: getActivityColor(act.type),
                          },
                        ]}
                      />
                    </View>
                    <View style={styles.progressRow}>
                      <Text style={styles.progressPercent} allowFontScaling={true}>
                        {act.progressPercent}%
                      </Text>
                      {!!act.score && (
                        <Text style={styles.scoreText} allowFontScaling={true}>
                          Score: {act.score}
                        </Text>
                      )}
                    </View>
                  </View>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>

        {/* Recommended Section */}
        <View style={styles.recommendedContainer}>
          <Text style={styles.sectionTitle} allowFontScaling={true}>
            Smart Recommendations
          </Text>
          {recommendations.map((rec: any) => (
            <Pressable
              key={rec.id}
              style={styles.recCard}
              onPress={() => router.push(rec.actionRoute)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Recommended: ${rec.title}. ${rec.description}`}
              accessibilityHint="Double tap to start this recommended course module"
            >
              <View style={[styles.recIconBadge, { backgroundColor: getActivityColor(rec.type) + '15' }]}>
                <Ionicons name={getActivityIcon(rec.type)} size={22} color={getActivityColor(rec.type)} />
              </View>
              <View style={styles.recTextContent}>
                <Text style={styles.recTitle} allowFontScaling={true}>
                  {rec.title}
                </Text>
                <Text style={styles.recDesc} allowFontScaling={true}>
                  {rec.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} style={styles.recArrow} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeTokens) => {
  const isDark = colors.statusBar === 'light-content';
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    center: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      flexGrow: 1,
      paddingTop: 60,
      paddingBottom: 40,
    },
    headerArea: {
      paddingHorizontal: SPACING.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: SPACING.lg,
    },
    greeting: {
      fontFamily: FONTS.medium,
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    brandTitle: {
      fontFamily: FONTS.bold,
      fontSize: 24,
      color: colors.text,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    notifButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    goalCard: {
      marginHorizontal: SPACING.lg,
      borderRadius: RADIUS.xl,
      overflow: 'hidden',
      marginBottom: SPACING.xl,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: 10,
    },
    goalCardGradient: {
      padding: SPACING.lg,
    },
    goalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.lg,
    },
    goalTitle: {
      fontFamily: FONTS.bold,
      fontSize: 12,
      color: colors.textSecondary,
      letterSpacing: 1,
      marginBottom: 4,
    },
    goalTime: {
      fontFamily: FONTS.bold,
      fontSize: 24,
      color: colors.text,
    },
    goalTimeSub: {
      fontFamily: FONTS.medium,
      fontSize: 16,
      color: colors.textSecondary,
    },
    streakBadge: {
      backgroundColor: isDark ? 'rgba(249, 115, 22, 0.15)' : 'rgba(249, 115, 22, 0.1)',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: RADIUS.full,
    },
    streakText: {
      fontFamily: FONTS.bold,
      fontSize: 13,
      color: '#f97316',
    },
    progressBarWrapper: {
      width: '100%',
    },
    progressBarBg: {
      height: 8,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
      borderRadius: RADIUS.full,
      overflow: 'hidden',
      marginBottom: 8,
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: RADIUS.full,
    },
    progressFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    progressPercentText: {
      fontFamily: FONTS.medium,
      fontSize: 12,
      color: colors.textSecondary,
    },
    quickActionsContainer: {
      marginBottom: SPACING.xl,
    },
    sectionTitle: {
      fontFamily: FONTS.bold,
      fontSize: 18,
      color: colors.text,
      paddingHorizontal: SPACING.lg,
      marginBottom: SPACING.md,
    },
    quickActionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.lg,
    },
    actionBtn: {
      alignItems: 'center',
      flex: 1,
    },
    actionIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    actionLabel: {
      fontFamily: FONTS.medium,
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    carouselContainer: {
      marginBottom: SPACING.xl,
    },
    carouselScroll: {
      paddingHorizontal: SPACING.lg,
      gap: 12,
    },
    carouselCard: {
      width: 240,
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
      padding: SPACING.md,
      justifyContent: 'space-between',
      height: 150,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.15 : 0.03,
      shadowRadius: 6,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.xs,
    },
    cardIconBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardTag: {
      fontFamily: FONTS.bold,
      fontSize: 10,
      letterSpacing: 0.5,
    },
    cardTitle: {
      fontFamily: FONTS.bold,
      fontSize: 14,
      color: colors.text,
      marginBottom: 2,
    },
    cardSubtitle: {
      fontFamily: FONTS.medium,
      fontSize: 11,
      color: colors.textSecondary,
      marginBottom: SPACING.sm,
    },
    cardProgressArea: {
      marginTop: 'auto',
    },
    cardProgressBg: {
      height: 4,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
      borderRadius: RADIUS.full,
      overflow: 'hidden',
      marginBottom: 6,
    },
    cardProgressFill: {
      height: '100%',
      borderRadius: RADIUS.full,
    },
    progressRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    progressPercent: {
      fontFamily: FONTS.bold,
      fontSize: 10,
      color: colors.textSecondary,
    },
    scoreText: {
      fontFamily: FONTS.bold,
      fontSize: 10,
      color: colors.textSecondary,
    },
    emptyCard: {
      width: 240,
      height: 150,
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
      padding: SPACING.md,
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.sm,
    },
    emptyText: {
      fontFamily: FONTS.medium,
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
    },
    recommendedContainer: {
      paddingHorizontal: SPACING.lg,
      marginBottom: SPACING.lg,
    },
    recCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
      padding: SPACING.md,
      marginBottom: 10,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.15 : 0.03,
      shadowRadius: 6,
    },
    recIconBadge: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: SPACING.md,
    },
    recTextContent: {
      flex: 1,
      marginRight: SPACING.sm,
    },
    recTitle: {
      fontFamily: FONTS.bold,
      fontSize: 14,
      color: colors.text,
      marginBottom: 2,
    },
    recDesc: {
      fontFamily: FONTS.medium,
      fontSize: 12,
      color: colors.textSecondary,
    },
    recArrow: {
      marginLeft: 'auto',
    },
  });
};
