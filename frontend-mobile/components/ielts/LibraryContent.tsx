import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { Link } from 'expo-router';
import { COLORS, FONTS, RADIUS, FONT_SIZES, SPACING, SHADOWS } from '@/constants';
import { apiClient } from '@/services/api-client';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LibraryStats {
  id: string;
  skill: string;
  lessons: { total: number; completed: number };
  exercises: { total: number; completed: number };
}

const SKILL_THEMES: Record<string, any> = {
  Speaking: {
    bg: '#FAF7F2',
    text: '#F44336',
    circleBase: 'rgba(244, 67, 54, 0.1)',
    fillColor: '#F44336',
    icon: 'mic-outline',
  },
  Writing: {
    bg: '#FAF7F2',
    text: '#FF9800',
    circleBase: 'rgba(255, 152, 0, 0.1)',
    fillColor: '#FF9800',
    icon: 'create-outline',
  },
  Reading: {
    bg: '#FAF7F2',
    text: '#2196F3',
    circleBase: 'rgba(33, 150, 243, 0.1)',
    fillColor: '#2196F3',
    icon: 'book-outline',
  },
  Listening: {
    bg: '#FAF7F2',
    text: '#4CAF50',
    circleBase: 'rgba(76, 175, 80, 0.1)',
    fillColor: '#4CAF50',
    icon: 'headset-outline',
  },
};

const getDefaultTheme = (skillName: string) => SKILL_THEMES[skillName] || SKILL_THEMES['Reading'];

function CircularProgress({
  completed,
  total,
  color,
  baseColor,
  icon: IconName,
  textColor,
  onPress
}: {
  completed: number;
  total: number;
  color: string;
  baseColor: string;
  icon: any;
  textColor: string;
  onPress: () => void;
}) {
  const percentage = total === 0 ? 0 : Math.min(100, Math.max(0, (completed / total) * 100));
  const size = 60;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={styles.progressContainer}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.progressCircleWrapper}>
        <Svg width={size} height={size} style={styles.svg}>
          {/* Base Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="transparent"
            strokeWidth={strokeWidth}
            fill={baseColor}
          />
          {/* Progress Circle */}
          {percentage > 0 && (
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          )}
        </Svg>
        <View style={styles.iconOverlay}>
          <Ionicons name={IconName} size={20} color={textColor} />
        </View>
      </TouchableOpacity>
      <Text style={[styles.progressText, { color: textColor }]}>
        {completed}/{total}
      </Text>
    </View>
  );
}

export function LibraryContent() {
  const [stats, setStats] = useState<LibraryStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await apiClient.get<LibraryStats[]>('/ielts/library/stats');
        setStats(res || []);
      } catch (error) {
        console.error('Failed to fetch library stats', error);
        setStats([]);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading library...</Text>
      </View>
    );
  }

  const displayStats = ["Listening", "Reading", "Writing", "Speaking"].map((skillName) => {
    const existing = (stats || []).find(s => s.skill.toLowerCase() === skillName.toLowerCase());
    return existing || {
      id: skillName.toLowerCase(),
      skill: skillName,
      lessons: { total: 0, completed: 0 },
      exercises: { total: 0, completed: 0 },
    };
  });

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Library</Text>

      <View style={styles.grid}>
        {displayStats.map((stat) => {
          const theme = getDefaultTheme(stat.skill);
          return (
            <View key={stat.id} style={[styles.card, { backgroundColor: theme.bg }]}>
              <View style={styles.cardHeader}>
                <Ionicons name={theme.icon} size={24} color={theme.text} />
                <Text style={[styles.cardTitle, { color: theme.text }]}>{stat.skill}</Text>
              </View>

              <View style={styles.progressRow}>
                <CircularProgress
                  completed={stat.lessons.completed}
                  total={stat.lessons.total}
                  color={theme.fillColor}
                  baseColor={theme.circleBase}
                  textColor={theme.text}
                  icon="school-outline"
                  onPress={() => {}} // Navigate to lessons
                />

                <CircularProgress
                  completed={stat.exercises.completed}
                  total={stat.exercises.total}
                  color={theme.fillColor}
                  baseColor={theme.circleBase}
                  textColor={theme.text}
                  icon="fitness-outline"
                  onPress={() => {}} // Navigate to exercises
                />
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.bookmarksSection}>
        <View style={styles.bookmarksHeader}>
          <Ionicons name="bookmark-outline" size={24} color="#374151" />
          <Text style={styles.bookmarksTitle}>Bookmarks</Text>
        </View>
        <View style={styles.bookmarksBadgeContainer}>
          <View style={styles.bookmarksIconBg}>
            <Ionicons name="school-outline" size={24} color="#4F6C76" />
          </View>
          <Text style={styles.bookmarksCount}>1/1</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: SPACING.lg, paddingBottom: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: SPACING.md, fontFamily: FONTS.medium, color: COLORS.textSecondary },
  
  title: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: '#111827',
    marginBottom: SPACING.xl,
    letterSpacing: -0.5,
  },

  grid: {
    gap: SPACING.lg,
  },

  card: {
    borderRadius: 32,
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  cardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    letterSpacing: -0.3,
  },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  progressContainer: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  progressCircleWrapper: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  iconOverlay: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    opacity: 0.7,
  },

  bookmarksSection: {
    marginTop: SPACING.xl,
    backgroundColor: '#FAF7F2',
    borderRadius: 32,
    padding: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookmarksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  bookmarksTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: '#1F2937',
  },
  bookmarksBadgeContainer: {
    alignItems: 'center',
    gap: 4,
  },
  bookmarksIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E5ECEE',
    borderWidth: 2,
    borderColor: '#668B98',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookmarksCount: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#9CA3AF',
  },
});
