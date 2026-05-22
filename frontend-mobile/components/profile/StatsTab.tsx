import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '@/constants';
import { vocabLabApi, gamificationApi } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { GamificationProfile, AchievementItem } from '@/types';
import { Card, Text, ProgressBar } from '@/components';

export function ProfileStatsTab() {
  const { user } = useAuth();
  const { theme, resolvedTheme, colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const isDarkMode = resolvedTheme === 'dark';

  const [stats, setStats] = useState({ streak: 0, words: 0, accuracy: 0 });
  const [gamProfile, setGamProfile] = useState<GamificationProfile | null>(null);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsData, gamData, achData] = await Promise.all([
        vocabLabApi.getStats().catch(() => null),
        gamificationApi.getProfile().catch(() => null),
        gamificationApi.getAchievements().catch(() => null),
      ]);

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
        <Card variant="gradient" gradientColors={['#1E293B', '#0F172A']} style={styles.levelCard}>
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
          
          <ProgressBar value={progress} max={100} height={8} color="#38BDF8" trackColor="#334155" />
          
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
          <View style={styles.achievementsList}>
            {achievements.map((ach) => {
              const isEarned = !!ach.earnedAt;
              return (
                <Card
                  key={ach.id}
                  variant="outlined"
                  style={[styles.achCard, !isEarned && styles.achCardLocked]}
                >
                  <View style={[styles.achIconBox, !isEarned && { backgroundColor: colors.bgSubtle }]}>
                    <Text style={styles.achIcon}>{ach.icon || '🏆'}</Text>
                  </View>
                  <View style={styles.achContent}>
                    <Text variant="body" weight="bold" color="text" style={styles.achTitle}>
                      {ach.name}
                    </Text>
                    <Text variant="caption" color="textSecondary" style={styles.achDesc}>
                      {ach.description}
                    </Text>
                    {!isEarned && ach.progress !== undefined && (
                      <View style={{ marginTop: 8 }}>
                        <ProgressBar
                          value={ach.progress}
                          max={ach.conditionValue || 100}
                          height={4}
                          color="#10B981"
                        />
                      </View>
                    )}
                  </View>
                  <Text variant="caption" weight="bold" style={styles.achXp}>
                    +{ach.xpReward} XP
                  </Text>
                </Card>
              );
            })}
          </View>
        </>
      )}
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
      color: '#FFFFFF',
    },
    levelSubtitle: {
      color: '#94A3B8',
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
      color: '#94A3B8',
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
    achievementsList: {
      gap: 12,
    },
    achCard: {
      flexDirection: 'row',
      padding: 16,
      alignItems: 'center',
    },
    achCardLocked: {
      opacity: 0.6,
    },
    achIconBox: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    achIcon: {
      fontSize: 24,
    },
    achContent: {
      flex: 1,
    },
    achTitle: {
      fontSize: 15,
    },
    achDesc: {
      marginTop: 2,
    },
    achXp: {
      color: '#38BDF8',
      marginLeft: 8,
    },
  });
};
