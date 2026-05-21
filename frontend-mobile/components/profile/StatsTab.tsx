import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants';
import { GamificationProfile, AchievementItem } from '@/types';

interface StatsTabProps {
  loadingStats: boolean;
  gamProfile: GamificationProfile | null;
  achievements: AchievementItem[];
  stats: { streak: number; words: number; accuracy: number };
  styles: any;
}

export function ProfileStatsTab({
  loadingStats,
  gamProfile,
  achievements,
  stats,
  styles,
}: StatsTabProps) {
  if (loadingStats) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />;
  }

  const progress =
    gamProfile && gamProfile.xpNeeded > 0
      ? Math.min(100, Math.max(0, (gamProfile.currentLevelXp / gamProfile.xpNeeded) * 100)) || 0
      : 0;

  return (
    <View style={styles.section}>
      {gamProfile && (
        <View style={[styles.card, { backgroundColor: '#1E293B' }]}>
          <View style={styles.levelHeader}>
            <View>
              <Text style={styles.levelTitle}>Level {gamProfile.level}</Text>
              <Text style={styles.levelSubtitle}>{gamProfile.totalXp} Total XP</Text>
            </View>
            <View style={styles.levelBadge}>
              <Ionicons name="trophy" size={20} color="#FBBF24" />
            </View>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          <View style={styles.progressTextRow}>
            <Text style={styles.progressText}>{gamProfile.currentLevelXp} XP</Text>
            <Text style={styles.progressText}>{gamProfile.xpNeeded} XP to next level</Text>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Ionicons name="flame" size={24} color="#EF4444" style={styles.statIcon} />
          <Text style={styles.statValue}>{stats.streak}</Text>
          <Text style={styles.statLabel}>Days Streak</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="library" size={24} color="#3B82F6" style={styles.statIcon} />
          <Text style={styles.statValue}>{stats.words}</Text>
          <Text style={styles.statLabel}>Words Learned</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="checkmark-circle" size={24} color="#10B981" style={styles.statIcon} />
          <Text style={styles.statValue}>{stats.accuracy}%</Text>
          <Text style={styles.statLabel}>Avg Accuracy</Text>
        </View>
      </View>

      {achievements.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsList}>
            {achievements.map((ach) => {
              const isEarned = !!ach.earnedAt;
              return (
                <View key={ach.id} style={[styles.achCard, !isEarned && styles.achCardLocked]}>
                  <View style={[styles.achIconBox, !isEarned && { backgroundColor: '#F1F5F9' }]}>
                    <Text style={styles.achIcon}>{ach.icon || '🏆'}</Text>
                  </View>
                  <View style={styles.achContent}>
                    <Text style={styles.achTitle}>{ach.name}</Text>
                    <Text style={styles.achDesc}>{ach.description}</Text>
                    {!isEarned && ach.progress !== undefined && (
                      <View style={styles.achProgressBg}>
                        <View
                          style={[
                            styles.achProgressFill,
                            {
                              width: `${ach.conditionValue ? Math.min(100, Math.max(0, (ach.progress / ach.conditionValue) * 100)) : 0}%`,
                            },
                          ]}
                        />
                      </View>
                    )}
                  </View>
                  <Text style={styles.achXp}>+{ach.xpReward} XP</Text>
                </View>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
}
