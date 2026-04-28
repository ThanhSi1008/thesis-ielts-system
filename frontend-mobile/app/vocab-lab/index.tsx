import React, { useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Pressable, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';

// Sub-components
import { DecksTab } from '@/components/vocab-lab/DecksTab';
import { AddTab } from '@/components/vocab-lab/AddTab';
import { BrowseTab } from '@/components/vocab-lab/BrowseTab';
import { StatsTab } from '@/components/vocab-lab/StatsTab';

type Tab = 'decks' | 'add' | 'browse' | 'stats';

const NAV_ITEMS = [
  { key: 'decks',  label: 'My Decks',   icon: 'library-outline' as const },
  { key: 'add',    label: 'Add Card',    icon: 'add-circle-outline' as const },
  { key: 'browse', label: 'Browse Cards',icon: 'search-outline' as const },
  { key: 'stats',  label: 'Statistics',  icon: 'bar-chart-outline' as const },
];

export default function VocabLabScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>('decks');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnim   = useRef(new Animated.Value(-280)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.spring(drawerAnim,   { toValue: 0,    useNativeDriver: true, tension: 80, friction: 12 }),
      Animated.timing(backdropAnim, { toValue: 1,    duration: 250, useNativeDriver: true }),
    ]).start();
  };
  const closeDrawer = () => {
    Animated.parallel([
      Animated.spring(drawerAnim,   { toValue: -280, useNativeDriver: true, tension: 80, friction: 12 }),
      Animated.timing(backdropAnim, { toValue: 0,    duration: 200, useNativeDriver: true }),
    ]).start(() => setDrawerOpen(false));
  };
  const handleNavPress = (key: Tab) => { setActiveTab(key); closeDrawer(); };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={s.menuBtn} onPress={openDrawer}>
          <Ionicons name="menu" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Vocab Lab</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'decks'  && <DecksTab />}
        {activeTab === 'add'    && <AddTab />}
        {activeTab === 'browse' && <BrowseTab />}
        {activeTab === 'stats'  && <StatsTab />}
      </View>

      {/* Backdrop */}
      {drawerOpen && (
        <Animated.View style={[s.backdrop, { opacity: backdropAnim }]}>
          <Pressable style={{ flex: 1 }} onPress={closeDrawer} />
        </Animated.View>
      )}

      {/* Drawer */}
      <Animated.View style={[s.drawer, { paddingTop: insets.top, transform: [{ translateX: drawerAnim }] }]} pointerEvents={drawerOpen ? 'auto' : 'none'}>
        <View style={s.drawerHeader}>
          <TouchableOpacity onPress={closeDrawer}><Ionicons name="menu" size={24} color={COLORS.text} /></TouchableOpacity>
          <Text style={s.drawerLogo}>Lexon</Text>
        </View>
        <ScrollView>
          <Text style={s.drawerSection}>VOCAB LAB</Text>
          {NAV_ITEMS.map(item => (
            <TouchableOpacity key={item.key} style={[s.navItem, activeTab === item.key && s.navItemActive]} onPress={() => handleNavPress(item.key as Tab)}>
              <Ionicons name={item.icon} size={20} color={activeTab === item.key ? COLORS.primary : COLORS.textSecondary} />
              <Text style={[s.navLabel, activeTab === item.key && { color: COLORS.primary, fontWeight: '700' }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md,
    backgroundColor: '#fff', borderBottomWidth: 1, borderColor: COLORS.border,
  },
  menuBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 50 },
  drawer: { position: 'absolute', top: 0, left: 0, bottom: 0, width: 260, backgroundColor: '#fff', zIndex: 60, elevation: 20, shadowColor: '#000', shadowOffset: { width: 4, height: 0 }, shadowOpacity: 0.15, shadowRadius: 20 },
  drawerHeader: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, borderBottomWidth: 1, borderColor: COLORS.border, gap: SPACING.md },
  drawerLogo: { fontSize: FONT_SIZES.xl, fontWeight: '900', color: COLORS.primary },
  drawerSection: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.sm },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingVertical: 12, marginHorizontal: SPACING.sm, borderRadius: RADIUS.lg, marginBottom: 2 },
  navItemActive: { backgroundColor: COLORS.primary + '15' },
  navLabel: { flex: 1, fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textSecondary },
});

