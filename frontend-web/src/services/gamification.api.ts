import api from '@/lib/api';
import type { AchievementItem, GamificationProfile, LeaderboardEntry, XpLogEntry } from '@/types';

export const gamificationApi = {
  getProfile: async () => {
    const { data } = await api.get<GamificationProfile>('/gamification/profile');
    return data;
  },

  getAchievements: async () => {
    const { data } = await api.get<AchievementItem[]>('/gamification/achievements');
    return data;
  },

  getLeaderboard: async (type: string = 'xp_weekly', limit: number = 20) => {
    const { data } = await api.get<LeaderboardEntry[]>('/gamification/leaderboard', {
      params: { type, limit },
    });
    return data;
  },

  getXpHistory: async () => {
    const { data } = await api.get<XpLogEntry[]>('/gamification/xp-history');
    return data;
  },
};
