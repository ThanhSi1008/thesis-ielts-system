import React, { useEffect, useState, useMemo } from 'react';
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
import { useTheme } from '@/contexts/ThemeContext';
import { Breadcrumb } from '@/components';

interface Exercise {
  id: string;
  title: string;
  lessonId: string;
  lessonTitle: string;
  type?: string;
  isCompleted?: boolean;
}

interface GroupedExercises {
  title: string;
  items: Exercise[];
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function SkillExercisesScreen() {
  const { skill } = useLocalSearchParams<{ skill: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const [groups, setGroups] = useState<GroupedExercises[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const skillName = skill ? skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase() : '';

  const breadcrumbItems = useMemo(() => [
    { label: 'IELTS', route: '/(tabs)/ielts' },
    { label: 'Basic', route: '/(tabs)/ielts' },
    { label: skillName, route: `/ielts/basic/library/${skill}/exercises` },
    { label: 'Exercises' }
  ], [skillName, skill]);

  const isListening = skill?.toLowerCase() === 'listening';
  const isReading = skill?.toLowerCase() === 'reading';
  const isWriting = skill?.toLowerCase() === 'writing';

  const fetchExercises = async () => {
    try {
      const lessons = await apiClient.get<any[]>(`/ielts/skills/${skillName}/lessons`);
      if (!lessons || lessons.length === 0) {
        setGroups([]);
        return;
      }
      const endpoint = isListening
        ? 'listening-exercises'
        : isWriting
          ? 'writing-exercises'
          : 'reading-exercises';
      const exPromises = lessons.map(async (l: any) => {
        try {
          const exData = await apiClient.get<any[]>(`/ielts/lessons/${l.id}/${endpoint}`);
          return (exData || []).map((ex: any) => ({
            ...ex,
            lessonTitle: l.title,
            lessonId: l.id,
          }));
        } catch (e) {
          return [];
        }
      });
      const exResults = await Promise.all(exPromises);
      const allExercises = exResults.flat();
      const grouped: GroupedExercises[] = [];
      const toTypeLabel = (title: string) =>
        (title || 'Other').replace(/^Chapter\s+\d+\s*[-–]\s*/i, '').trim() || 'Other';
      for (const ex of allExercises) {
        const groupTitle = toTypeLabel(ex.lessonTitle);
        const existing = grouped.find((g) => g.title === groupTitle);
        if (existing) {
          existing.items.push(ex);
        } else {
          grouped.push({ title: groupTitle, items: [ex] });
        }
      }
      setGroups(grouped);
    } catch (error) {
      console.error('Failed to fetch exercises', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [skillName]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchExercises();
  };

  const handlePress = (ex: Exercise) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const q = ex.lessonId ? `?lessonId=${ex.lessonId}&skill=${skill}` : `?skill=${skill}`;
    router.push((ROUTES.ieltsBasicExercise(ex.id) + q) as any);
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
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
      color: colors.text,
      marginBottom: SPACING.sm,
      letterSpacing: -0.8,
    },
    description: {
      fontFamily: FONTS.medium,
      fontSize: 16,
      color: colors.textSecondary,
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
      color: colors.textMuted,
      marginTop: SPACING.md,
    },
    group: { marginBottom: SPACING.xl },
    groupTitle: {
      fontFamily: FONTS.bold,
      fontSize: 13,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: SPACING.md,
      marginLeft: 4,
    },
    list: { gap: SPACING.md },
    exCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: SPACING.lg,
      backgroundColor: colors.card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      borderCurve: 'continuous',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
    },
    exIconBg: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: COLORS.primary + '10',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: SPACING.md,
      borderCurve: 'continuous',
    },
    exInfo: { flex: 1 },
    exTitle: {
      fontFamily: FONTS.bold,
      fontSize: 18,
      color: colors.text,
      letterSpacing: -0.3,
    },
    exSubtitle: {
      fontFamily: FONTS.medium,
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
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
          title: `${skillName} Exercises`,
          headerBackTitle: 'Library',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
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
          <View style={{ marginBottom: SPACING.md }}>
            <Breadcrumb items={breadcrumbItems} />
          </View>
          <Text style={styles.subtitle}>Practice Lab</Text>
          <Text style={styles.title}>{skillName} Training</Text>
          <Text style={styles.description}>
            Apply your knowledge with focused exercises for {skillName}.
          </Text>
        </Animated.View>

        {groups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="fitness-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyText}>No exercises found for this skill.</Text>
          </View>
        ) : (
          groups.map((group, gIdx) => (
            <Animated.View
              key={gIdx}
              entering={FadeInDown.delay(gIdx * 100).duration(500)}
              style={styles.group}
            >
              <Text style={styles.groupTitle}>{group.title}</Text>
              <View style={styles.list}>
                {group.items.map((ex) => (
                  <AnimatedTouchableOpacity
                    key={ex.id}
                    layout={Layout.springify()}
                    style={styles.exCard}
                    activeOpacity={0.7}
                    onPress={() => handlePress(ex)}
                  >
                    <View style={styles.exIconBg}>
                      <Ionicons name="flask-outline" size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.exInfo}>
                      <Text style={styles.exTitle}>{ex.title}</Text>
                      <Text style={styles.exSubtitle}>{skillName} Practice</Text>
                    </View>
                    {ex.isCompleted ? (
                      <View style={styles.completedBadge}>
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      </View>
                    ) : (
                      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                    )}
                  </AnimatedTouchableOpacity>
                ))}
              </View>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
