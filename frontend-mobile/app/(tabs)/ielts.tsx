import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS, FONT_SIZES, ROUTES, navigation } from '@/constants';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { apiClient } from '@/services/api-client';

// Sub-components
import { RoadmapItem } from '@/components/ielts/LessonRow';
import { RoadmapSummary } from '@/components/ielts/RoadmapSummary';
import { RoadmapStepSection } from '@/components/ielts/RoadmapStepSection';
import { SharedDrawer } from '@/components/ui/SharedDrawer';

interface RoadmapStep {
  step: number;
  items: RoadmapItem[];
  isLocked: boolean;
  isCompleted: boolean;
}

export default function IeltsRoadmapTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [steps, setSteps] = useState<RoadmapStep[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const drawerAnim = useRef(new Animated.Value(-280)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const fetchRoadmap = async () => {
    try {
      const data = await apiClient.get<{
        steps: RoadmapStep[];
        currentStep: number;
        requiresOnboarding?: boolean;
      }>('/ielts/roadmap');

      if (data.requiresOnboarding) {
        navigation.replace(ROUTES.ieltsOnboarding);
        return;
      }
      setSteps(data.steps ?? []);
      setCurrentStep(data.currentStep ?? 1);
    } catch (e: any) {
      if (__DEV__) console.error('Roadmap fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.spring(drawerAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
      Animated.timing(backdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.spring(drawerAnim, {
        toValue: -280,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }),
      Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setDrawerOpen(false));
  };

  const handleNavPress = (route: string) => {
    closeDrawer();
    if (route !== ROUTES.ieltsRoadmap && route !== '/(tabs)/ielts') {
      navigation.push(route);
    }
  };

  let nextItem: RoadmapItem | null = null;
  for (const step of steps) {
    for (const item of step.items) {
      if (!item.isCompleted && !item.isLocked) {
        nextItem = item;
        break;
      }
    }
    if (nextItem) break;
  }

  const totalLessons = steps.reduce(
    (a, s) => a + s.items.filter((i) => i.type === 'lesson').length,
    0,
  );
  const completedLessons = steps.reduce(
    (a, s) => a + s.items.filter((i) => i.type === 'lesson' && i.isCompleted).length,
    0,
  );
  const totalExercises = steps.reduce(
    (a, s) => a + s.items.filter((i) => i.type === 'exercise').length,
    0,
  );
  const completedExercises = steps.reduce(
    (a, s) => a + s.items.filter((i) => i.type === 'exercise' && i.isCompleted).length,
    0,
  );

  const handleItemPress = (item: RoadmapItem) => {
    if (item.isLocked) return;
    if (item.type === 'lesson') {
      navigation.push(ROUTES.ieltsBasicLesson(item.id) + `?skill=${item.skill.toLowerCase()}`);
    } else {
      const q = item.lessonId
        ? `?lessonId=${item.lessonId}&skill=${item.skill.toLowerCase()}`
        : `?skill=${item.skill.toLowerCase()}`;
      navigation.push(ROUTES.ieltsBasicExercise(item.id) + q);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tabs.Screen options={{ headerShown: false }} />

      {/* ── Custom Theme-Aware Header ── */}
      <View
        style={{
          backgroundColor: colors.background,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: SPACING.md,
          paddingBottom: SPACING.sm,
          paddingTop: insets.top + 8,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity
          style={{
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={openDrawer}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Open menu drawer"
          accessibilityHint="Double tap to open the navigation menu"
        >
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            color: colors.text,
            fontSize: FONT_SIZES.lg,
            fontFamily: FONTS.bold,
            textAlign: 'center',
          }}
        >
          Your Roadmap
        </Text>
        <TouchableOpacity
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          onPress={() => navigation.push(ROUTES.ieltsBasic)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go to IELTS Basic library"
          accessibilityHint="Double tap to open the IELTS Basic library screen"
        >
          <Ionicons name="information-circle-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your roadmap…</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchRoadmap();
              }}
            />
          }
        >
          <RoadmapSummary
            totalLessons={totalLessons}
            completedLessons={completedLessons}
            totalExercises={totalExercises}
            completedExercises={completedExercises}
          />

          {steps.map((step) => (
            <RoadmapStepSection
              key={step.step}
              step={step}
              currentStep={currentStep}
              nextItemId={nextItem?.id}
              onItemPress={handleItemPress}
            />
          ))}
        </ScrollView>
      )}

      {/* ── Drawer ── */}
      <SharedDrawer
        drawerOpen={drawerOpen}
        drawerAnim={drawerAnim}
        backdropAnim={backdropAnim}
        insetsTop={insets.top}
        onClose={closeDrawer}
        onOpen={openDrawer}
        onNavPress={handleNavPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  loadingText: { fontFamily: FONTS.medium, color: COLORS.textSecondary, fontSize: FONT_SIZES.sm },
});
