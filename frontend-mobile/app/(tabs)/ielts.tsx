import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONTS, SPACING, FONT_SIZES, ROUTES } from '@/constants';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';

// Sub-components
import { LibraryContent } from '@/components/ielts/LibraryContent';
import { SharedDrawer } from '@/components/ui/SharedDrawer';

/* ─── Nav items (Synced with web sidebar) ─── */
const NAV_ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'grid-outline' as const,
    route: ROUTES.ieltsDashboard,
  },
  {
    key: 'foundation',
    label: 'Foundation',
    icon: 'book-outline' as const,
    route: '#',
    children: [
      { key: 'pronunciation', label: 'Pronunciation', route: ROUTES.ieltsPronunciation },
      { key: 'vocabulary', label: 'Vocabulary', route: ROUTES.vocabulary },
      { key: 'grammar', label: 'Grammar', route: ROUTES.ieltsGrammar },
    ],
  },
  {
    key: 'basic',
    label: 'IELTS Basic',
    icon: 'information-circle-outline' as const,
    route: ROUTES.ieltsBasic,
    isActive: true,
  },
  {
    key: 'advanced',
    label: 'IELTS Advanced',
    icon: 'trending-up-outline' as const,
    route: ROUTES.ieltsAdvanced,
  },
  {
    key: 'intensive',
    label: 'IELTS Intensive',
    icon: 'flash-outline' as const,
    route: ROUTES.ieltsIntensive,
  },
  { key: 'roadmap', label: 'Roadmap', icon: 'map-outline' as const, route: ROUTES.ieltsRoadmap },
  {
    key: 'calculator',
    label: 'Calculator',
    icon: 'calculator-outline' as const,
    route: ROUTES.ieltsCalculator,
  },
  { key: 'history', label: 'Test History', icon: 'time-outline' as const, route: ROUTES.ieltsHistory },
  {
    key: 'statistics',
    label: 'Statistics',
    icon: 'bar-chart-outline' as const,
    route: ROUTES.ieltsStatistics,
  },
  {
    key: 'student-teacher',
    label: 'Student/Teacher',
    icon: 'people-outline' as const,
    route: ROUTES.ieltsStudentTeacher,
  },
];

export default function IeltsBasicTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const drawerAnim = useRef(new Animated.Value(-280)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

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
    if (route !== ROUTES.ieltsBasic) {
      setTimeout(() => router.push(route as any), 200);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tabs.Screen options={{ headerShown: false }} />

      {/* ── Custom Header ── */}
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
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: 4 }}
          onPress={openDrawer}
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
          IELTS Basic
        </Text>
        <TouchableOpacity
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          onPress={() => router.push(ROUTES.ieltsRoadmap)}
        >
          <Ionicons name="map-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* ── Library Content ── */}
      <LibraryContent />

      {/* ── Drawer ── */}
      <SharedDrawer
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
