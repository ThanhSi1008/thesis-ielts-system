import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { COLORS, FONTS, SPACING } from '@/constants';
import { apiClient } from '@/services/api-client';
import { RoadmapSummary } from './RoadmapSummary';
import { RoadmapStepSection } from './RoadmapStepSection';
import { RoadmapItem } from './LessonRow';
import { useTheme } from '@/contexts/ThemeContext';

interface RoadmapStep {
  step: number;
  items: RoadmapItem[];
  isLocked: boolean;
  isCompleted: boolean;
}

export function RoadmapContent() {
  const { colors } = useTheme();
  const router = useRouter();
  const [steps, setSteps] = useState<RoadmapStep[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRoadmap = async () => {
    try {
      const res = await apiClient.get<{
        steps: RoadmapStep[];
        currentStep: number;
        requiresOnboarding?: boolean;
      }>('/ielts/roadmap');
      if (res.requiresOnboarding) {
        router.push('/ielts/onboarding');
        return;
      }
      setSteps(res.steps || []);
      setCurrentStep(res.currentStep || 1);
    } catch (err) {
      console.error('Failed to fetch roadmap', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRoadmap();
  };

  const handleItemClick = (item: RoadmapItem) => {
    if (item.isLocked) return;
    const q = item.lessonId
      ? `?lessonId=${item.lessonId}&skill=${item.skill.toLowerCase()}`
      : `?skill=${item.skill.toLowerCase()}`;
    const baseUrl = item.type === 'lesson' ? '/ielts/basic/lesson/' : '/ielts/basic/exercise/';
    router.push(`${baseUrl}${item.id}${q}` as any);
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingBottom: 100 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    list: { marginTop: SPACING.lg },
  });

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const totalLessons = steps.reduce(
    (acc, s) => acc + (s.items || []).filter((i) => i.type === 'lesson').length,
    0,
  );
  const completedLessons = steps.reduce(
    (acc, s) => acc + (s.items || []).filter((i) => i.type === 'lesson' && i.isCompleted).length,
    0,
  );
  const totalExercises = steps.reduce(
    (acc, s) => acc + (s.items || []).filter((i) => i.type === 'exercise').length,
    0,
  );
  const completedExercises = steps.reduce(
    (acc, s) => acc + (s.items || []).filter((i) => i.type === 'exercise' && i.isCompleted).length,
    0,
  );

  let nextItem: RoadmapItem | undefined;
  for (const step of steps) {
    for (const item of step.items) {
      if (!item.isCompleted && !item.isLocked) {
        nextItem = item;
        break;
      }
    }
    if (nextItem) break;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Animated.View entering={FadeInDown.duration(600)}>
        <RoadmapSummary
          totalLessons={totalLessons}
          completedLessons={completedLessons}
          totalExercises={totalExercises}
          completedExercises={completedExercises}
        />
      </Animated.View>

      <View style={styles.list}>
        {steps.map((step, idx) => (
          <Animated.View key={step.step} entering={FadeInDown.delay(idx * 100).duration(500)}>
            <RoadmapStepSection
              step={step}
              currentStep={currentStep}
              nextItemId={nextItem?.id}
              onItemPress={handleItemClick}
            />
          </Animated.View>
        ))}
      </View>
    </ScrollView>
  );
}
