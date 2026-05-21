import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, FONT_SIZES } from '@/constants';
import * as Haptics from 'expo-haptics';

// Sub-components
import { LibraryContent } from '@/components/ielts/LibraryContent';
import { SharedDrawer } from '@/components/ui/SharedDrawer';

/* ─── Nav items (Synced with web sidebar) ─── */
const NAV_ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'grid-outline' as const,
    route: '/ielts/dashboard',
  },
  {
    key: 'foundation',
    label: 'Foundation',
    icon: 'book-outline' as const,
    route: '#',
    children: [
      { key: 'pronunciation', label: 'Pronunciation', route: '/ielts/pronunciation' },
      { key: 'vocabulary', label: 'Vocabulary', route: '/(tabs)/vocabulary' },
      { key: 'grammar', label: 'Grammar', route: '/ielts/grammar' },
    ],
  },
  {
    key: 'basic',
    label: 'IELTS Basic',
    icon: 'information-circle-outline' as const,
    route: '/(tabs)/ielts',
    isActive: true,
  },
  {
    key: 'advanced',
    label: 'IELTS Advanced',
    icon: 'trending-up-outline' as const,
    route: '/ielts/advanced',
  },
  {
    key: 'intensive',
    label: 'IELTS Intensive',
    icon: 'flash-outline' as const,
    route: '/ielts/intensive',
  },
  { key: 'roadmap', label: 'Roadmap', icon: 'map-outline' as const, route: '/ielts/roadmap' },
  {
    key: 'calculator',
    label: 'Calculator',
    icon: 'calculator-outline' as const,
    route: '/ielts/calculator',
  },
  { key: 'history', label: 'Test History', icon: 'time-outline' as const, route: '/ielts/history' },
  {
    key: 'statistics',
    label: 'Statistics',
    icon: 'bar-chart-outline' as const,
    route: '/ielts/statistics',
  },
  {
    key: 'student-teacher',
    label: 'Student/Teacher',
    icon: 'people-outline' as const,
    route: '/ielts/student-teacher',
  },
];

export default function IeltsBasicTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
    if (route !== '/(tabs)/ielts') {
      setTimeout(() => router.push(route as any), 200);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Tabs.Screen options={{ headerShown: false }} />

      {/* ── Custom Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.menuBtn} onPress={openDrawer}>
          <Ionicons name="menu" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>IELTS Basic</Text>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => router.push('/ielts/roadmap')}
        >
          <Ionicons name="map-outline" size={22} color={COLORS.text} />
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

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  headerTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    textAlign: 'center',
  },
  headerIconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
