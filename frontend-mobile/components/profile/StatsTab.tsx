import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '@/constants';
import { vocabLabApi, gamificationApi } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { GamificationProfile, AchievementItem } from '@/types';
import { Text, ProgressBar } from '../atoms';
import { Card } from '../molecules';
import { BottomSheet } from '../organisms';

export function ProfileStatsTab() {
  const { user } = useAuth();
  const { theme, resolvedTheme, colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const isDarkMode = resolvedTheme === 'dark';

  const [stats, setStats] = useState({ streak: 0, words: 0, accuracy: 0 });
  const [gamProfile, setGamProfile] = useState<GamificationProfile | null>(null);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [selectedAch, setSelectedAch] = useState<AchievementItem | null>(null);

  const fetchData = async () => {
    try {
      const [statsData, gamData, achData] = await Promise.all([
        vocabLabApi.getStats().catch((e) => {
          if (__DEV__) console.error('Failed to fetch vocab stats:', e);
          return null;
        }),
        gamificationApi.getProfile().catch((e) => {
          if (__DEV__) console.error('Failed to fetch gamification profile:', e);
          return null;
        }),
        gamificationApi.getAchievements().catch((e) => {
          if (__DEV__) console.error('Failed to fetch achievements list:', e);
          return null;
        }),
      ]);

      if (__DEV__) {
        const d = statsData as any;
        console.log('Stats Tab Fetched Data:', {
          streak: d?.streak,
          words: d?.totalWords || d?.words || d?.totalCards,
          totalAchievements: gamData?.totalAchievements,
          achievementsLength: achData?.length,
        });
      }

      if (statsData) {
        const d = statsData as any;
        setStats({
          streak: d.streak || 0,
          words: d.totalWords || d.words || d.totalCards || 0,
          accuracy: d.accuracy || 0,
        });
      }
      if (gamData) setGamProfile(gamData);
      if (achData) setAchievements(achData);
    } catch (error) {
      if (__DEV__) console.error('Failed to fetch stats data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="body" color="textSecondary" style={{ marginTop: 12 }}>
          Loading stats...
        </Text>
      </View>
    );
  }

  const progress =
    gamProfile && gamProfile.xpNeeded > 0
      ? Math.min(100, Math.max(0, (gamProfile.currentLevelXp / gamProfile.xpNeeded) * 100)) || 0
      : 0;

  return (
    <View style={styles.section}>
      {gamProfile && (
        <Card
          variant="gradient"
          gradientColors={isDarkMode ? ['#1E293B', '#0F172A'] : ['#FFFBEB', '#FEF3C7']}
          style={styles.levelCard}
        >
          <View style={styles.levelHeader}>
            <View>
              <Text variant="title" weight="bold" style={styles.levelTitle}>
                Level {gamProfile.level}
              </Text>
              <Text variant="caption" style={styles.levelSubtitle}>
                {gamProfile.totalXp} Total XP
              </Text>
            </View>
            <View style={styles.levelBadge}>
              <Ionicons name="trophy" size={20} color="#FBBF24" />
            </View>
          </View>
          
          <ProgressBar
            value={progress}
            max={100}
            height={8}
            color={isDarkMode ? '#38BDF8' : '#FFC600'}
            trackColor={isDarkMode ? '#334155' : colors.border}
          />
          
          <View style={styles.progressTextRow}>
            <Text variant="caption" style={styles.progressText}>
              {gamProfile.currentLevelXp} XP
            </Text>
            <Text variant="caption" style={styles.progressText}>
              {gamProfile.xpNeeded} XP to next level
            </Text>
          </View>
        </Card>
      )}

      <Text variant="title" weight="bold" color="text" style={styles.sectionTitle}>
        Overview
      </Text>
      <View style={styles.statsGrid}>
        <Card variant="outlined" style={styles.statBox}>
          <Ionicons name="flame" size={24} color="#EF4444" style={styles.statIcon} />
          <Text variant="headline" weight="bold" color="text" style={styles.statValue}>
            {stats.streak}
          </Text>
          <Text variant="caption" color="textSecondary" style={styles.statLabel}>
            Days Streak
          </Text>
        </Card>
        
        <Card variant="outlined" style={styles.statBox}>
          <Ionicons name="library" size={24} color="#3B82F6" style={styles.statIcon} />
          <Text variant="headline" weight="bold" color="text" style={styles.statValue}>
            {stats.words}
          </Text>
          <Text variant="caption" color="textSecondary" style={styles.statLabel}>
            Words Learned
          </Text>
        </Card>
        
        <Card variant="outlined" style={styles.statBox}>
          <Ionicons name="checkmark-circle" size={24} color="#10B981" style={styles.statIcon} />
          <Text variant="headline" weight="bold" color="text" style={styles.statValue}>
            {stats.accuracy}%
          </Text>
          <Text variant="caption" color="textSecondary" style={styles.statLabel}>
            Avg Accuracy
          </Text>
        </Card>
      </View>

      {achievements.length > 0 && (
        <>
          <Text variant="title" weight="bold" color="text" style={styles.sectionTitle}>
            Achievements
          </Text>
          <View style={styles.achievementsGrid}>
            {(showAll ? achievements : achievements.slice(0, 6)).map((ach) => {
              const isEarned = ach.earned;
              return (
                <TouchableOpacity
                  key={ach.id}
                  style={styles.achGridItem}
                  onPress={() => setSelectedAch(ach)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.achBadgeOuter,
                    isEarned ? styles.achBadgeEarned : styles.achBadgeLocked
                  ]}>
                    <Text style={styles.achGridIcon}>{ach.icon || '🏆'}</Text>
                    {!isEarned && (
                      <View style={styles.achLockOverlay}>
                        <Ionicons name="lock-closed" size={10} color="#FFFFFF" />
                      </View>
                    )}
                  </View>
                  <Text variant="body" weight="bold" color="text" numberOfLines={1} style={styles.achGridName}>
                    {ach.name}
                  </Text>
                  <Text variant="caption" style={[styles.achGridSub, { color: isEarned ? '#10B981' : colors.textSecondary }]}>
                    {isEarned ? `+${ach.xpReward} XP` : '0 XP'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {achievements.length > 6 && (
            <TouchableOpacity
              style={styles.expandBtn}
              onPress={() => setShowAll(!showAll)}
              activeOpacity={0.8}
            >
              <Text style={styles.expandBtnText}>
                {showAll ? 'Show Less' : `View All Achievements (${achievements.length})`}
              </Text>
              <Ionicons
                name={showAll ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={colors.primary}
              />
            </TouchableOpacity>
          )}
        </>
      )}

      {/* End of content footer */}
      <View style={styles.footerDivider}>
        <View style={styles.footerLine} />
        <Ionicons name="sparkles" size={16} color={colors.textMuted} style={styles.footerIcon} />
        <View style={styles.footerLine} />
      </View>
      <Text variant="caption" color="textMuted" style={styles.footerText}>
        All caught up! ✨ Keep learning to unlock more achievements!
      </Text>

      <BottomSheet
        visible={!!selectedAch}
        onClose={() => setSelectedAch(null)}
        snapPointHeight={selectedAch?.earned ? 0.38 : 0.45}
        title="Achievement Details"
      >
        {selectedAch && (
          <View style={styles.achSheetContent}>
            <View style={styles.achSheetHeader}>
              <View style={[
                styles.achSheetIconBox,
                selectedAch.earned ? styles.achBadgeEarned : styles.achBadgeLocked
              ]}>
                <Text style={styles.achSheetIcon}>{selectedAch.icon || '🏆'}</Text>
              </View>
              <View style={styles.achSheetHeaderInfo}>
                <Text variant="body" weight="bold" color="text" style={{ fontSize: 18 }}>
                  {selectedAch.name}
                </Text>
                <Text variant="caption" weight="bold" style={styles.achSheetXpReward}>
                  +{selectedAch.xpReward} XP Reward
                </Text>
              </View>
            </View>

            <Text variant="body" color="textSecondary" style={styles.achSheetDesc}>
              {selectedAch.description}
            </Text>

            <View style={styles.achSheetStatusBox}>
              {selectedAch.earned ? (
                <View style={styles.achSheetEarnedRow}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text variant="body" weight="bold" style={{ color: '#10B981', marginLeft: 6 }}>
                    Earned on {selectedAch.earnedAt ? new Date(selectedAch.earnedAt).toLocaleDateString() : 'N/A'}
                  </Text>
                </View>
              ) : (
                <View style={{ width: '100%' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text variant="caption" color="textSecondary">Progress</Text>
                    <Text variant="caption" weight="bold" color="text">
                      {selectedAch.progress || 0} / {selectedAch.conditionValue || 100}
                    </Text>
                  </View>
                  <ProgressBar
                    value={selectedAch.progress || 0}
                    max={selectedAch.conditionValue || 100}
                    height={8}
                    color="#10B981"
                  />
                  <View style={styles.achSheetLockedRow}>
                    <Ionicons name="lock-closed" size={16} color={colors.textSecondary} />
                    <Text variant="caption" color="textSecondary" style={{ marginLeft: 4 }}>
                      Locked — Keep practicing to unlock!
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
      </BottomSheet>
    </View>
  );
}

const createStyles = (colors: any) => {
  const isDark = colors.statusBar === 'light-content';
  return StyleSheet.create({
    section: {
      padding: 16,
    },
    loadingContainer: {
      paddingVertical: 64,
      alignItems: 'center',
      justifyContent: 'center',
    },
    levelCard: {
      padding: 20,
      borderRadius: 16,
      marginBottom: 16,
    },
    levelHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    levelTitle: {
      color: isDark ? '#FFFFFF' : colors.text,
    },
    levelSubtitle: {
      color: isDark ? '#94A3B8' : colors.textSecondary,
      marginTop: 2,
    },
    levelBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(251, 191, 36, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    progressTextRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    progressText: {
      color: isDark ? '#94A3B8' : colors.textSecondary,
    },
    sectionTitle: {
      marginTop: 8,
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    statsGrid: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    statBox: {
      flex: 1,
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statIcon: {
      marginBottom: 8,
    },
    statValue: {
      fontSize: 20,
    },
    statLabel: {
      marginTop: 4,
    },
    achievementsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      justifyContent: 'space-between',
      paddingHorizontal: 4,
    },
    achGridItem: {
      width: '30%',
      alignItems: 'center',
      marginBottom: 16,
    },
    achBadgeOuter: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.04,
      shadowRadius: 6,
      elevation: 2,
    },
    achBadgeEarned: {
      backgroundColor: isDark ? 'rgba(251, 191, 36, 0.15)' : 'rgba(251, 191, 36, 0.12)',
      borderColor: '#FBBF24',
      borderWidth: 2,
    },
    achBadgeLocked: {
      backgroundColor: colors.bgSubtle,
      borderColor: colors.border,
      opacity: 0.5,
    },
    achGridIcon: {
      fontSize: 32,
    },
    achLockOverlay: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: 'rgba(71, 85, 105, 0.95)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: '#FFFFFF',
    },
    achGridName: {
      fontFamily: FONTS.bold,
      fontSize: 13,
      color: colors.text,
      marginTop: 8,
      textAlign: 'center',
    },
    achGridSub: {
      fontSize: 11,
      marginTop: 2,
      textAlign: 'center',
    },
    achSheetContent: {
      paddingVertical: 12,
      gap: 16,
    },
    achSheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    achSheetIconBox: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    achSheetIcon: {
      fontSize: 28,
    },
    achSheetHeaderInfo: {
      flex: 1,
    },
    achSheetXpReward: {
      color: '#38BDF8',
      fontSize: 14,
      marginTop: 4,
    },
    achSheetDesc: {
      fontSize: 15,
      lineHeight: 22,
    },
    achSheetStatusBox: {
      backgroundColor: colors.bgSubtle,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    achSheetEarnedRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    achSheetLockedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
    },
    expandBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 12,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 12,
      marginTop: 8,
      backgroundColor: colors.card,
    },
    expandBtnText: {
      fontFamily: FONTS.bold,
      fontSize: 14,
      color: colors.primary,
    },
    footerDivider: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 32,
      marginBottom: 12,
      paddingHorizontal: 32,
    },
    footerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    footerIcon: {
      marginHorizontal: 12,
    },
    footerText: {
      textAlign: 'center',
      marginBottom: 32,
      fontSize: 12,
      fontFamily: FONTS.regular,
    },
  });
};
