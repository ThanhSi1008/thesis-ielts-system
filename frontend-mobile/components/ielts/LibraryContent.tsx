import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Markdown from 'react-native-markdown-display';

import { COLORS, FONTS, RADIUS, FONT_SIZES, SPACING } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';
import { apiClient } from '@/services/api-client';

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

function getDefaultTheme(skill: string) {
  return (
    SKILL_THEMES[skill] || {
      bg: '#FAF7F2',
      text: COLORS.primary,
      circleBase: 'rgba(255, 193, 7, 0.1)',
      fillColor: COLORS.primary,
      icon: 'school-outline',
    }
  );
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

function CircularProgressLink({
  completed,
  total,
  color,
  baseColor,
  textColor,
  icon,
  onPress,
}: any) {
  const size = 60;
  const strokeWidth = 3;
  const radius = 24;
  const circumference = radius * 2 * Math.PI;
  const percentage = total > 0 ? Math.min(100, (completed / total) * 100) : 0;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <View style={staticStyles.progLinkWrapper}>
      <TouchableOpacity
        onPress={handlePress}
        style={staticStyles.progLinkCircle}
        activeOpacity={0.7}
      >
        <Svg width={size} height={size} style={staticStyles.svgRotate}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={baseColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {percentage > 0 && (
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          )}
        </Svg>
        <View style={[staticStyles.progLinkIconBox, { backgroundColor: color + '1A' }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
      </TouchableOpacity>
      <Text style={[staticStyles.progLinkText, { color: color }]}>
        {completed}/{total}
      </Text>
    </View>
  );
}

export function LibraryContent() {
  const router = useRouter();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [stats, setStats] = useState<LibraryStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await apiClient.get<LibraryStats[]>('/ielts/library/stats');
        setStats(res || []);
      } catch (error) {
        if (__DEV__) console.error('Failed to fetch library stats', error);
        setStats([]);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <View style={staticStyles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const displayStats = ['Listening', 'Reading', 'Writing', 'Speaking'].map((skillName) => {
    const existing = (stats || []).find((s) => s.skill.toLowerCase() === skillName.toLowerCase());
    return (
      existing || {
        id: skillName.toLowerCase(),
        skill: skillName,
        lessons: { total: 0, completed: 0 },
        exercises: { total: 0, completed: 0 },
      }
    );
  });

  return (
    <ScrollView
      style={[staticStyles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={staticStyles.scroll}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Animated.View entering={FadeInDown.duration(600)} style={staticStyles.header}>
        <Text style={[staticStyles.title, { color: colors.text }]}>Library</Text>
      </Animated.View>

      <View style={staticStyles.grid}>
        {displayStats.map((stat, index) => {
          const theme = getDefaultTheme(stat.skill);
          return (
            <Animated.View
              key={stat.id}
              entering={FadeInDown.delay(index * 100).duration(500)}
              style={[staticStyles.card, { backgroundColor: theme.bg }]}
            >
              <View style={staticStyles.cardHeader}>
                <Ionicons
                  name={theme.icon}
                  size={24}
                  color={theme.fillColor}
                  style={{ fontWeight: '800' }}
                />
                <Text style={[staticStyles.cardTitle, { color: theme.fillColor }]}>
                  {stat.skill}
                </Text>
              </View>

              <View style={staticStyles.progressRow}>
                <CircularProgressLink
                  completed={stat.lessons.completed}
                  total={stat.lessons.total}
                  color={theme.fillColor}
                  baseColor={theme.circleBase}
                  icon="school-outline"
                  onPress={() =>
                    router.push(`/ielts/basic/library/${stat.skill.toLowerCase()}/lessons` as any)
                  }
                />

                <CircularProgressLink
                  completed={stat.exercises.completed}
                  total={stat.exercises.total}
                  color={theme.fillColor}
                  baseColor={theme.circleBase}
                  icon="fitness-outline"
                  onPress={() =>
                    router.push(`/ielts/basic/library/${stat.skill.toLowerCase()}/exercises` as any)
                  }
                />
              </View>
            </Animated.View>
          );
        })}
      </View>

      <Animated.View entering={FadeInDown.delay(400)} style={staticStyles.bookmarksContainer}>
        <View style={[staticStyles.bookmarkCard, { backgroundColor: colors.surface }]}>
          <View style={staticStyles.bookmarkInfo}>
            <Ionicons name="bookmark" size={24} color={colors.text} />
            <Text style={[staticStyles.bookmarkTitle, { color: colors.text }]}>Bookmarks</Text>
          </View>
          <View style={staticStyles.bookmarkStats}>
            <View style={staticStyles.bookmarkIconCircle}>
              <Ionicons name="school-outline" size={24} color="#4F6C76" />
            </View>
            <Text style={[staticStyles.bookmarkCount, { color: colors.textSecondary }]}>1/1</Text>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

// All static styles (no theme-dependent colors)
const staticStyles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.lg, paddingBottom: 120 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: { marginBottom: SPACING.xl, paddingHorizontal: 4 },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 32,
    letterSpacing: -0.8,
  },

  grid: { gap: SPACING.lg },

  card: {
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
  },
  cardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    letterSpacing: -0.5,
  },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },

  progLinkWrapper: {
    alignItems: 'center',
    gap: 12,
  },
  progLinkCircle: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgRotate: {
    transform: [{ rotate: '-90deg' }],
  },
  progLinkIconBox: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progLinkText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    opacity: 0.7,
  },

  bookmarksContainer: { marginTop: SPACING.lg },
  bookmarkCard: {
    borderRadius: 32,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderCurve: 'continuous',
  },
  bookmarkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  bookmarkTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
  },
  bookmarkStats: {
    alignItems: 'center',
    gap: 8,
  },
  bookmarkIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E5ECEE',
    borderWidth: 2,
    borderColor: '#668B98',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookmarkCount: {
    fontFamily: FONTS.bold,
    fontSize: 13,
  },
});
