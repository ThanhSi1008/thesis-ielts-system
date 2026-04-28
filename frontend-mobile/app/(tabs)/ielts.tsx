import React, { useState, useRef } from 'react';
import {
  View, StyleSheet, TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, FONT_SIZES } from '@/constants';

// Sub-components
import { LibraryContent } from '@/components/ielts/LibraryContent';
import { RoadmapDrawer } from '@/components/ielts/RoadmapDrawer';

/* ─── Nav items (Synced with web sidebar) ─── */
const NAV_ITEMS = [
  { key: 'dashboard',      label: 'Dashboard',        icon: 'grid-outline' as const,        route: '/(tabs)' },
  { key: 'basic',          label: 'IELTS Basic',       icon: 'information-circle-outline' as const, route: '/(tabs)/ielts', isActive: true },
  { key: 'advanced',       label: 'IELTS Advanced',    icon: 'trending-up-outline' as const, route: '/ielts/advanced' },
  { key: 'intensive',      label: 'IELTS Intensive',   icon: 'flash-outline' as const,       route: '/ielts/intensive' },
  { key: 'roadmap',        label: 'Roadmap',           icon: 'map-outline' as const,         route: '/ielts/roadmap' },
  { key: 'history',        label: 'Test History',      icon: 'time-outline' as const,        route: '/ielts/history' },
  { key: 'statistics',     label: 'Statistics',        icon: 'bar-chart-outline' as const,   route: '/ielts/statistics' },
  { key: 'student-teacher',label: 'Student/Teacher',   icon: 'people-outline' as const,      route: '/student-teacher' },
];

export default function IeltsBasicTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const drawerAnim   = useRef(new Animated.Value(-280)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

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
    if (route !== '/(tabs)/ielts') {
      setTimeout(() => router.push(route as any), 200);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Tabs.Screen 
        options={{
          headerShown: true,
          title: 'IELTS Basic',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#fff' },
          headerTitleStyle: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.lg, color: COLORS.text },
          headerLeft: () => (
            <TouchableOpacity style={[styles.menuBtn, { marginLeft: SPACING.md }]} onPress={openDrawer}>
              <Ionicons name="menu" size={24} color={COLORS.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              style={{ marginRight: SPACING.md }} 
              onPress={() => router.push('/ielts/roadmap')}
            >
              <Ionicons name="map-outline" size={22} color={COLORS.text} />
            </TouchableOpacity>
          )
        }} 
      />

      {/* ── Library Content ── */}
      <LibraryContent />

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
  menuBtn: { width: 40, height: 40, justifyContent: 'center' },
});
