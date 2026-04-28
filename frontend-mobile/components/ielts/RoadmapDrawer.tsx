import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';

interface NavItem {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  route: string;
  isActive?: boolean;
}

interface RoadmapDrawerProps {
  drawerOpen: boolean;
  drawerAnim: Animated.Value;
  backdropAnim: Animated.Value;
  insetsTop: number;
  navItems: NavItem[];
  onClose: () => void;
  onNavPress: (route: string) => void;
}

export function RoadmapDrawer({
  drawerOpen,
  drawerAnim,
  backdropAnim,
  insetsTop,
  navItems,
  onClose,
  onNavPress
}: RoadmapDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      {drawerOpen && (
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
          <Pressable style={{ flex: 1 }} onPress={onClose} />
        </Animated.View>
      )}

      {/* Drawer */}
      <Animated.View
        style={[styles.drawer, { paddingTop: insetsTop, transform: [{ translateX: drawerAnim }] }]}
        pointerEvents={drawerOpen ? 'auto' : 'none'}
      >
        <View style={styles.drawerHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="menu" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.drawerLogo}>Lexon</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, paddingVertical: SPACING.sm }}>
          {navItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.navItem, item.isActive && styles.navItemActive]}
              onPress={() => onNavPress(item.route)}
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
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 50,
  },
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
