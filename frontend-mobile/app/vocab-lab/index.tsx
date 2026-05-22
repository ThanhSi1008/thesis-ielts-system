import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';

// Sub-components
import { DecksTab } from '@/components/vocab-lab/DecksTab';
import { AddTab } from '@/components/vocab-lab/AddTab';
import { BrowseTab } from '@/components/vocab-lab/BrowseTab';
import { StatsTab } from '@/components/vocab-lab/StatsTab';
import { MarketplaceTab } from '@/components/vocab-lab/MarketplaceTab';
import { SharedDrawer } from '@/components/ui/SharedDrawer';
import { GlobalAddCardFab } from '@/components/vocab-lab/GlobalAddCardFab';

type Tab = 'decks' | 'add' | 'browse' | 'stats' | 'marketplace';

const NAV_ITEMS = [
  { key: 'decks', label: 'My Decks', icon: 'library-outline' as const, route: 'decks' },
  { key: 'add', label: 'Add Card', icon: 'add-circle-outline' as const, route: 'add' },
  { key: 'browse', label: 'Browse Cards', icon: 'search-outline' as const, route: 'browse' },
  { key: 'stats', label: 'Statistics', icon: 'bar-chart-outline' as const, route: 'stats' },
  {
    key: 'marketplace',
    label: 'Community',
    icon: 'storefront-outline' as const,
    route: 'marketplace',
  },
];

export default function VocabLabScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('decks');
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
    setActiveTab(route as Tab);
    closeDrawer();
  };

  const s = StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.lg,
      paddingBottom: SPACING.md,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    menuBtn: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: colors.text },
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={s.menuBtn}
          onPress={openDrawer}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Menu"
          accessibilityHint="Open sidebar navigation menu"
        >
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle} allowFontScaling={true}>Vocab Lab</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'decks' && <DecksTab />}
        {activeTab === 'add' && <AddTab />}
        {activeTab === 'browse' && <BrowseTab />}
        {activeTab === 'stats' && <StatsTab />}
        {activeTab === 'marketplace' && <MarketplaceTab />}
      </View>

      {/* Shared Drawer */}
      <SharedDrawer
        drawerOpen={drawerOpen}
        drawerAnim={drawerAnim}
        backdropAnim={backdropAnim}
        insetsTop={insets.top}
        navItems={NAV_ITEMS.map((item) => ({ ...item, isActive: activeTab === item.key }))}
        onClose={closeDrawer}
        onOpen={openDrawer}
        onNavPress={handleNavPress}
      />

      {/* Global Add Card FAB — visible on Decks, Browse, Stats tabs */}
      {activeTab !== 'add' && <GlobalAddCardFab />}
    </View>
  );
}
