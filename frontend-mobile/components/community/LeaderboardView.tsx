import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '@/constants';
import { gamificationApi } from '@/services';
import type { LeaderboardEntry } from '@/types';
import { Avatar } from './Avatar';

export function LeaderboardView({
  currentUserId,
  refreshTrigger,
}: {
  currentUserId?: string;
  refreshTrigger?: boolean;
}) {
  const [type, setType] = useState<'xp_weekly' | 'streak'>('xp_weekly');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    gamificationApi
      .getLeaderboard(type, 10)
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [type, refreshTrigger]);

  const RANK_COLOR: Record<number, string> = { 1: '#FFC600', 2: '#94a3b8', 3: '#cd7f32' };

  return (
    <View style={styles.card}>
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: '#f3f4f6',
          borderRadius: 10,
          padding: 4,
          marginBottom: 14,
        }}
      >
        {(['xp_weekly', 'streak'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setType(t)}
            style={[
              { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
              type === t && { backgroundColor: '#fff' },
            ]}
          >
            <Text
              style={{
                fontFamily: FONTS.bold,
                fontSize: 13,
                color: type === t ? '#212529' : '#64748b',
              }}
            >
              {t === 'xp_weekly' ? 'XP This Week' : 'Streak'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} />
      ) : entries.length === 0 ? (
        <Text
          style={{ textAlign: 'center', color: '#9ca3af', fontFamily: FONTS.medium, padding: 20 }}
        >
          No data yet
        </Text>
      ) : (
        entries.map((entry, idx) => {
          const isMe = entry.userId === currentUserId;
          const col = RANK_COLOR[idx + 1];
          return (
            <View
              key={entry.userId}
              style={[
                styles.rankRow,
                isMe && {
                  backgroundColor: 'rgba(255,198,0,.08)',
                  borderColor: 'rgba(255,198,0,.4)',
                },
              ]}
            >
              <Text style={[styles.rankNum, col && { color: col }]}>
                {idx < 3 ? ['🥇', '🥈', '🥉'][idx] : `#${entry.rank}`}
              </Text>
              <Avatar name={entry.name} avatar={entry.avatar} size={34} />
              <Text style={[styles.rankName, isMe && { color: COLORS.primary }]}>
                {entry.name}
                {isMe ? ' (You)' : ''}
              </Text>
              <View style={{ flex: 1 }} />
              <Text style={styles.rankScore}>
                {entry.value} {type === 'streak' ? '🔥' : 'XP'}
              </Text>
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 6,
  },
  rankNum: {
    width: 28,
    textAlign: 'center',
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#9ca3af',
  },
  rankName: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#212529',
  },
  rankScore: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#212529',
  },
});
