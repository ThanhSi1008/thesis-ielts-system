import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Animated, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { apiClient } from '@/services/api-client';

// Sub-components
import { RoadmapItem } from '@/components/ielts/LessonRow';
import { RoadmapSummary } from '@/components/ielts/RoadmapSummary';
import { RoadmapDrawer } from '@/components/ielts/RoadmapDrawer';
import { RoadmapStepSection } from '@/components/ielts/RoadmapStepSection';

/* ─── Types ─── */
interface RoadmapStep {
  step: number;
  items: RoadmapItem[];
  isLocked: boolean;
  isCompleted: boolean;
}

/* ─── Nav items ─── */
const NAV_ITEMS = [
  { key: 'dashboard',      label: 'Dashboard',        icon: 'grid-outline' as const,        route: '/(tabs)/ielts' },
  { key: 'basic',          label: 'IELTS Basic',       icon: 'information-circle-outline' as const, route: '/(tabs)/ielts' },
  { key: 'advanced',       label: 'IELTS Advanced',    icon: 'trending-up-outline' as const, route: '/ielts/advanced' },
  { key: 'intensive',      label: 'IELTS Intensive',   icon: 'flash-outline' as const,       route: '/ielts/intensive' },
  { key: 'roadmap',        label: 'Roadmap',           icon: 'map-outline' as const,         route: '/(tabs)/ielts', isActive: true },
  { key: 'history',        label: 'Test History',      icon: 'time-outline' as const,        route: '/ielts/history' },
  { key: 'statistics',     label: 'Statistics',        icon: 'bar-chart-outline' as const,   route: '/ielts/statistics' },
  { key: 'student-teacher',label: 'Student/Teacher',   icon: 'people-outline' as const,      route: '/student-teacher' },
];

/* ─── Main screen ─── */
export default function IeltsRoadmapTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [steps, setSteps]               = useState<RoadmapStep[]>([]);
  const [currentStep, setCurrentStep]   = useState(1);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [drawerOpen, setDrawerOpen]     = useState(false);
  
  const drawerAnim   = useRef(new Animated.Value(-280)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const fetchRoadmap = async () => {
    try {
      const data = await apiClient.get<{
        steps: RoadmapStep[];
        currentStep: number;
        requiresOnboarding?: boolean;
      }>('/ielts/roadmap');

      if (data.requiresOnboarding) {
        router.replace('/ielts/onboarding' as any);
        return;
      }
      setSteps(data.steps ?? []);
      setCurrentStep(data.currentStep ?? 1);
    } catch (e: any) {
      if (e?.status !== 401) {
        console.error('Roadmap fetch error:', e);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchRoadmap(); }, []);

  /* Drawer helpers */
  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.spring(drawerAnim,   { toValue: 0,    useNativeDriver: true, tension: 80, friction: 12 }),
      Animated.timing(backdropAnim, { toValue: 1,    duration: 250,         useNativeDriver: true }),
    ]).start();
  };
  const closeDrawer = () => {
    Animated.parallel([
      Animated.spring(drawerAnim,   { toValue: -280, useNativeDriver: true, tension: 80, friction: 12 }),
      Animated.timing(backdropAnim, { toValue: 0,    duration: 200,         useNativeDriver: true }),
    ]).start(() => setDrawerOpen(false));
  };
  const handleNavPress = (route: string) => {
    closeDrawer();
    setTimeout(() => router.push(route as any), 200);
  };

  /* Find next unlocked incomplete item */
  let nextItem: RoadmapItem | null = null;
  for (const step of steps) {
    for (const item of step.items) {
      if (!item.isCompleted && !item.isLocked) { nextItem = item; break; }
    }
    if (nextItem) break;
  }

  /* Stats */
  const totalLessons     = steps.reduce((a, s) => a + s.items.filter(i => i.type === 'lesson').length, 0);
  const completedLessons = steps.reduce((a, s) => a + s.items.filter(i => i.type === 'lesson' && i.isCompleted).length, 0);
  const totalExercises     = steps.reduce((a, s) => a + s.items.filter(i => i.type === 'exercise').length, 0);
  const completedExercises = steps.reduce((a, s) => a + s.items.filter(i => i.type === 'exercise' && i.isCompleted).length, 0);

  const handleItemPress = (item: RoadmapItem) => {
    if (item.isLocked) return;
    if (item.type === 'lesson') {
      router.push(`/ielts/basic/lesson/${item.id}?skill=${item.skill.toLowerCase()}` as any);
    } else {
      const q = item.lessonId ? `?lessonId=${item.lessonId}&skill=${item.skill.toLowerCase()}` : `?skill=${item.skill.toLowerCase()}`;
      router.push(`/ielts/basic/exercise/${item.id}${q}` as any);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.menuBtn} onPress={openDrawer}>
          <Ionicons name="menu" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>IELTS</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your roadmap…</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchRoadmap(); }}
            />
          }
        >
          {/* ── Summary card ── */}
          <RoadmapSummary 
            totalLessons={totalLessons}
            completedLessons={completedLessons}
            totalExercises={totalExercises}
            completedExercises={completedExercises}
          />

          {/* ── Steps ── */}
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
      <RoadmapDrawer 
        drawerOpen={drawerOpen}
        drawerAnim={drawerAnim}
        backdropAnim={backdropAnim}
        insetsTop={insets.top}
        navItems={NAV_ITEMS}
        onClose={closeDrawer}
        onNavPress={handleNavPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  loadingText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm },

  /* Header */
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md,
    backgroundColor: '#fff', borderBottomWidth: 1, borderColor: COLORS.border,
  },
  menuBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
});

