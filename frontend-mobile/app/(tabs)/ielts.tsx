import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Animated, Pressable, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { apiClient } from '@/services/api-client';

/* ─── Types (mirrors web RoadmapSidebar.tsx) ─── */
interface RoadmapItem {
  id: string;
  title: string;
  type: 'lesson' | 'exercise';
  skill: string;
  url: string;
  isCompleted: boolean;
  isLocked: boolean;
  lessonId?: string;
}
interface RoadmapStep {
  step: number;
  items: RoadmapItem[];
  isLocked: boolean;
  isCompleted: boolean;
}

/* ─── Nav items (mirrors web IeltsSidebar) ─── */
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

const SKILL_COLOR: Record<string, string> = {
  Listening: '#E11D48',
  Reading:   '#2563EB',
  Writing:   '#D97706',
  Speaking:  '#7C3AED',
};

const SKILL_ICON: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  Listening: 'headset-outline',
  Reading:   'book-outline',
  Writing:   'create-outline',
  Speaking:  'mic-outline',
};

/* ─── Lesson row ─── */
function LessonRow({ item, isNext, onPress }: { item: RoadmapItem; isNext: boolean; onPress: () => void }) {
  const skillColor = SKILL_COLOR[item.skill] ?? COLORS.primary;
  const skillIcon  = SKILL_ICON[item.skill]  ?? 'book-outline';

  return (
    <View style={styles.lessonRow}>
      {/* Timeline dot */}
      <View style={styles.dotCol}>
        {item.isCompleted ? (
          <View style={[styles.dot, { backgroundColor: '#16A34A' }]}>
            <Ionicons name="checkmark" size={11} color="#fff" />
          </View>
        ) : isNext ? (
          <View style={[styles.dot, { backgroundColor: '#D97706' }]}>
            <View style={styles.dotInner} />
          </View>
        ) : (
          <View style={[styles.dot, { backgroundColor: item.isLocked ? '#D1D5DB' : '#D1D5DB' }]}>
            {item.isLocked && <Ionicons name="lock-closed" size={9} color="#fff" />}
          </View>
        )}
      </View>

      {/* Card */}
      <TouchableOpacity
        style={[
          styles.lessonCard,
          isNext && styles.lessonCardNext,
          item.isCompleted && styles.lessonCardDone,
          item.isLocked && styles.lessonCardLocked,
        ]}
        onPress={item.isLocked ? undefined : onPress}
        activeOpacity={item.isLocked ? 1 : 0.8}
      >
        {/* Skill icon box */}
        <View style={[
          styles.skillIcon,
          { backgroundColor: isNext ? '#FFF0C2' : item.isCompleted ? '#DCFCE7' : '#F3F4F6' },
        ]}>
          <Ionicons
            name={item.isLocked ? 'lock-closed-outline' : skillIcon}
            size={18}
            color={item.isLocked ? '#9CA3AF' : isNext ? '#D97706' : item.isCompleted ? '#16A34A' : skillColor}
          />
        </View>

        {/* Text */}
        <View style={{ flex: 1 }}>
          <Text style={[styles.lessonTitle, item.isLocked && { color: COLORS.textMuted }]}>
            {item.title}
          </Text>
          <Text style={[styles.lessonMeta, { color: skillColor }]}>
            {item.skill} · {item.type === 'lesson' ? 'Theory' : 'Practice'}
          </Text>
        </View>

        {/* Action button */}
        {isNext && (
          <TouchableOpacity style={styles.resumeBtn} onPress={onPress}>
            <Ionicons name="play" size={12} color="#fff" />
            <Text style={styles.resumeText}>Resume</Text>
          </TouchableOpacity>
        )}
        {item.isCompleted && !isNext && (
          <TouchableOpacity style={styles.reviewBtn} onPress={onPress}>
            <Text style={styles.reviewText}>Review</Text>
          </TouchableOpacity>
        )}
        {item.isLocked && (
          <Ionicons name="bookmark-outline" size={16} color={COLORS.border} />
        )}
      </TouchableOpacity>
    </View>
  );
}

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
    } catch (e) {
      console.error('Roadmap fetch error:', e);
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
  const lessonsLeft   = totalLessons   - completedLessons;
  const exercisesLeft = totalExercises - completedExercises;

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
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>IELTS Basic Mastery Roadmap</Text>
            <View style={styles.summaryMeta}>
              <Text style={styles.metaText}>
                Lessons left{' '}
                <Text style={styles.metaBold}>{lessonsLeft}</Text>
                <Text style={styles.metaDim}> / {totalLessons}</Text>
              </Text>
              <Text style={styles.metaDot}>  ·  </Text>
              <Text style={styles.metaText}>
                Exercises left{' '}
                <Text style={styles.metaBold}>{exercisesLeft}</Text>
                <Text style={styles.metaDim}> / {totalExercises}</Text>
              </Text>
            </View>
            <Text style={styles.summaryDesc}>
              This section is designed to build your fundamental English skills for the IELTS exam.
              You will work through structured daily lessons and exercises covering Listening and
              Reading to establish a strong baseline before moving on to advanced strategies.
              Complete the tasks in sequential order to unlock the next steps.
            </Text>
          </View>

          {/* ── Days ── */}
          {steps.map((step) => {
            const isActiveStep    = step.step === currentStep;
            const isCompletedStep = step.isCompleted;

            return (
              <View key={step.step} style={[styles.daySection, step.isLocked && { opacity: 0.5 }]}>
                {/* Day header */}
                <View style={styles.dayHeader}>
                  <Text style={[
                    styles.dayLabel,
                    isActiveStep    && { color: '#D97706' },
                    isCompletedStep && { color: '#16A34A' },
                  ]}>
                    Day {step.step}
                  </Text>
                  {isCompletedStep && <Ionicons name="checkmark-circle" size={18} color="#16A34A" />}
                  {step.isLocked   && <Ionicons name="lock-closed"      size={14} color="#9CA3AF" />}
                </View>
                <View style={styles.dayDivider} />

                {/* Timeline */}
                <View style={styles.timeline}>
                  {/* Vertical line */}
                  <View style={styles.timelineLine} />

                  <View style={{ flex: 1 }}>
                    {step.items.map((item) => (
                      <LessonRow
                        key={item.id}
                        item={item}
                        isNext={nextItem?.id === item.id}
                        onPress={() => handleItemPress(item)}
                      />
                    ))}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* ── Drawer backdrop ── */}
      {drawerOpen && (
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
          <Pressable style={{ flex: 1 }} onPress={closeDrawer} />
        </Animated.View>
      )}

      {/* ── Drawer ── */}
      <Animated.View
        style={[styles.drawer, { paddingTop: insets.top, transform: [{ translateX: drawerAnim }] }]}
        pointerEvents={drawerOpen ? 'auto' : 'none'}
      >
        <View style={styles.drawerHeader}>
          <TouchableOpacity onPress={closeDrawer}>
            <Ionicons name="menu" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.drawerLogo}>Lexon</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, paddingVertical: SPACING.sm }}>
          {NAV_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.navItem, item.isActive && styles.navItemActive]}
              onPress={() => handleNavPress(item.route)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={item.isActive ? COLORS.primary : COLORS.textSecondary}
              />
              <Text style={[styles.navLabel, item.isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
              {item.isActive && (
                <Ionicons name="arrow-back" size={14} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
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

  /* Summary card */
  summaryCard: {
    margin: SPACING.lg,
    backgroundColor: '#FAF7F2',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E8E3D8',
  },
  summaryTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm },
  summaryMeta: { flexDirection: 'row', marginBottom: SPACING.md, flexWrap: 'wrap' },
  metaText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  metaBold: { fontWeight: '700', color: COLORS.text },
  metaDim:  { color: COLORS.textMuted },
  metaDot:  { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  summaryDesc: { fontSize: FONT_SIZES.sm, color: '#4B5563', lineHeight: 20 },

  /* Day section */
  daySection: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl },
  dayHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.sm },
  dayLabel: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text },
  dayDivider: { height: 2, backgroundColor: '#F3F4F6', marginBottom: SPACING.md },

  /* Timeline */
  timeline: { flexDirection: 'row' },
  timelineLine: {
    width: 3, backgroundColor: '#EEEEEE',
    marginLeft: 10, marginRight: 16, borderRadius: 2,
  },

  /* Lesson row */
  lessonRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.md },
  dotCol: { width: 20, alignItems: 'center', paddingTop: 12, marginLeft: -11, marginRight: SPACING.md },
  dot: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  dotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },

  lessonCard: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border,
    padding: SPACING.md,
  },
  lessonCardNext:   { borderColor: '#FFC107', backgroundColor: '#FFF9E6' },
  lessonCardDone:   { backgroundColor: '#FAFAFA' },
  lessonCardLocked: { opacity: 0.6 },

  skillIcon: {
    width: 36, height: 36, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  lessonTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  lessonMeta: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },

  resumeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#D97706', paddingHorizontal: SPACING.md, paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  resumeText: { color: '#fff', fontSize: FONT_SIZES.xs, fontWeight: '800' },
  reviewBtn: {
    paddingHorizontal: SPACING.sm, paddingVertical: 6,
    borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border,
  },
  reviewText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.xs, fontWeight: '700' },

  /* Backdrop */
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 50,
  },

  /* Drawer */
  drawer: {
    position: 'absolute', top: 0, left: 0, bottom: 0,
    width: 260, backgroundColor: '#fff', zIndex: 60,
    shadowColor: '#000', shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 20,
  },
  drawerHeader: {
    height: 56, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, borderBottomWidth: 1, borderColor: COLORS.border,
    gap: SPACING.md,
  },
  drawerLogo: { fontSize: FONT_SIZES.xl, fontWeight: '900', color: COLORS.primary, letterSpacing: -0.5 },
  navItem: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingHorizontal: SPACING.lg, paddingVertical: 12,
    marginHorizontal: SPACING.sm, borderRadius: RADIUS.lg, marginBottom: 2,
  },
  navItemActive: { backgroundColor: COLORS.primary + '15' },
  navLabel: { flex: 1, fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textSecondary },
  navLabelActive: { color: COLORS.primary, fontWeight: '700' },
});
