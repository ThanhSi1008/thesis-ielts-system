import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS, SHADOWS, ROUTES } from '@/constants';
import { apiClient } from '@/services/api-client';

interface Lesson {
  id: string;
  title: string;
  chapter: string;
  isCompleted?: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function SkillLessonsScreen() {
  const { skill } = useLocalSearchParams<{ skill: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const skillName = skill ? skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase() : '';

  const fetchLessons = async () => {
    try {
      const res = await apiClient.get<Lesson[]>(`/ielts/skills/${skillName}/lessons`);
      setLessons(res || []);
    } catch (error) {
      console.error('Failed to fetch lessons', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [skillName]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLessons();
  };

  const handlePress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push((ROUTES.ieltsBasicLesson(id) + `?skill=${skill}`) as any);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: `${skillName} Lessons`,
          headerBackTitle: 'Library',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#fff' },
          headerTitleStyle: { fontFamily: FONTS.bold, fontSize: 18 },
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentInsetAdjustmentBehavior="automatic"
      >
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <Text style={styles.subtitle}>Skill Mastery</Text>
          <Text style={styles.title}>{skillName} Library</Text>
          <Text style={styles.description}>
            Master the core concepts of {skillName} with our structured curriculum.
          </Text>
        </Animated.View>

        {lessons.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No lessons found for this skill.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {lessons.map((lesson, index) => (
              <AnimatedTouchableOpacity
                key={lesson.id}
                entering={FadeInDown.delay(index * 100).duration(500)}
                layout={Layout.springify()}
                style={styles.lessonCard}
                activeOpacity={0.7}
                onPress={() => handlePress(lesson.id)}
              >
                <View style={styles.lessonIndex}>
                  <Text style={styles.indexText}>{String(index + 1).padStart(2, '0')}</Text>
                </View>
                <View style={styles.lessonInfo}>
                  <Text style={styles.chapterText}>{lesson.chapter}</Text>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                </View>
                {lesson.isCompleted ? (
                  <View style={styles.completedBadge}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </View>
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                )}
              </AnimatedTouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: SPACING.xl },
  header: { marginBottom: SPACING.xxl },
  subtitle: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 34,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    letterSpacing: -0.8,
  },
  description: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    opacity: 0.5,
  },
  emptyText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  list: { gap: SPACING.md },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderCurve: 'continuous',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
  },
  lessonIndex: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderCurve: 'continuous',
  },
  indexText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  lessonInfo: { flex: 1 },
  chapterText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  lessonTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  completedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
