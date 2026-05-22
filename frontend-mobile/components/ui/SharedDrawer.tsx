import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Pressable,
  StyleSheet,
  Image,
  useWindowDimensions,
  TextInput,
  PanResponder,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, FONT_SIZES, ROUTES } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { usePathname, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { openUpgradeModal } from './UpgradeModal';
import { ieltsProfileApi, vocabularyApi, grammarApi, ieltsExamsApi } from '@/services';

interface DrawerItem {
  key: string;
  label: string;
  iconOutline: React.ComponentProps<typeof Ionicons>['name'];
  iconFilled: React.ComponentProps<typeof Ionicons>['name'];
  route: string;
  premium?: boolean;
  isActive?: boolean;
}

interface DrawerGroup {
  title: string;
  items: DrawerItem[];
}

interface SharedDrawerProps {
  drawerOpen: boolean;
  drawerAnim: Animated.Value;
  backdropAnim: Animated.Value;
  insetsTop: number;
  navItems?: any[]; // Keep for compatibility, but we use hierarchical GROUPS
  title?: string;
  onClose: () => void;
  onOpen?: () => void; // Optional onOpen callback for gesture sync
  onNavPress: (route: string) => void;
}

const DRAWER_GROUPS: DrawerGroup[] = [
  {
    title: '📚 Foundation',
    items: [
      {
        key: 'pronunciation',
        label: 'Pronunciation',
        iconOutline: 'volume-medium-outline',
        iconFilled: 'volume-medium',
        route: '/ielts/foundation/pronunciation',
      },
      {
        key: 'vocabulary',
        label: 'Vocabulary',
        iconOutline: 'book-outline',
        iconFilled: 'book',
        route: '/ielts/foundation/vocabulary',
      },
      {
        key: 'grammar',
        label: 'Grammar',
        iconOutline: 'text-outline',
        iconFilled: 'text',
        route: '/ielts/foundation/grammar',
      },
    ],
  },
  {
    title: '🎓 Practice',
    items: [
      {
        key: 'basic',
        label: 'IELTS Basic',
        iconOutline: 'information-circle-outline',
        iconFilled: 'information-circle',
        route: '/(tabs)/ielts',
      },
      {
        key: 'advanced',
        label: 'IELTS Advanced',
        iconOutline: 'trending-up-outline',
        iconFilled: 'trending-up',
        route: '/ielts/advanced',
        premium: true,
      },
      {
        key: 'intensive',
        label: 'IELTS Intensive',
        iconOutline: 'flash-outline',
        iconFilled: 'flash',
        route: '/ielts/intensive',
        premium: true,
      },
    ],
  },
  {
    title: '📊 Insights',
    items: [
      {
        key: 'dashboard',
        label: 'Dashboard',
        iconOutline: 'grid-outline',
        iconFilled: 'grid',
        route: '/ielts/dashboard',
      },
      {
        key: 'history',
        label: 'Test History',
        iconOutline: 'time-outline',
        iconFilled: 'time',
        route: '/ielts/history',
      },
      {
        key: 'statistics',
        label: 'Statistics',
        iconOutline: 'bar-chart-outline',
        iconFilled: 'bar-chart',
        route: '/ielts/statistics',
        premium: true,
      },
      {
        key: 'calculator',
        label: 'Calculator',
        iconOutline: 'calculator-outline',
        iconFilled: 'calculator',
        route: '/ielts/calculator',
      },
    ],
  },
  {
    title: '🛠️ Tools',
    items: [
      {
        key: 'roadmap',
        label: 'Roadmap',
        iconOutline: 'map-outline',
        iconFilled: 'map',
        route: '/ielts/roadmap',
      },
      {
        key: 'student-teacher',
        label: 'Student/Teacher',
        iconOutline: 'people-outline',
        iconFilled: 'people',
        route: '/ielts/student-teacher',
      },
    ],
  },
];

// Helper to resolve route metadata for "Recently Visited" section
const ROUTE_METADATA: Record<string, { label: string; iconOutline: React.ComponentProps<typeof Ionicons>['name']; iconFilled: React.ComponentProps<typeof Ionicons>['name'] }> = {
  '/ielts/dashboard': { label: 'Dashboard', iconOutline: 'grid-outline', iconFilled: 'grid' },
  '/ielts/foundation/pronunciation': { label: 'Pronunciation', iconOutline: 'volume-medium-outline', iconFilled: 'volume-medium' },
  '/ielts/foundation/vocabulary': { label: 'Vocabulary', iconOutline: 'book-outline', iconFilled: 'book' },
  '/ielts/foundation/grammar': { label: 'Grammar', iconOutline: 'text-outline', iconFilled: 'text' },
  '/(tabs)/ielts': { label: 'IELTS Basic', iconOutline: 'information-circle-outline', iconFilled: 'information-circle' },
  '/ielts/basic': { label: 'IELTS Basic', iconOutline: 'information-circle-outline', iconFilled: 'information-circle' },
  '/ielts/advanced': { label: 'IELTS Advanced', iconOutline: 'trending-up-outline', iconFilled: 'trending-up' },
  '/ielts/intensive': { label: 'IELTS Intensive', iconOutline: 'flash-outline', iconFilled: 'flash' },
  '/ielts/roadmap': { label: 'Roadmap', iconOutline: 'map-outline', iconFilled: 'map' },
  '/ielts/calculator': { label: 'Calculator', iconOutline: 'calculator-outline', iconFilled: 'calculator' },
  '/ielts/history': { label: 'Test History', iconOutline: 'time-outline', iconFilled: 'time' },
  '/ielts/statistics': { label: 'Statistics', iconOutline: 'bar-chart-outline', iconFilled: 'bar-chart' },
  '/ielts/student-teacher': { label: 'Student/Teacher', iconOutline: 'people-outline', iconFilled: 'people' },
};

export function SharedDrawer({
  drawerOpen,
  drawerAnim,
  backdropAnim,
  insetsTop,
  navItems,
  title,
  onClose,
  onOpen,
  onNavPress,
}: SharedDrawerProps) {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { tier, isPremium } = useSubscription();
  const pathname = usePathname();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const DRAWER_WIDTH = Math.min(width * 0.85, 320);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [streakCount, setStreakCount] = useState<number | null>(null);
  const [targetBand, setTargetBand] = useState<number | null>(null);
  const [bestBand, setBestBand] = useState<number | null>(null);
  const [recentRoutes, setRecentRoutes] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    '📚 Foundation': true,
    '🎓 Practice': true,
    '📊 Insights': true,
    '🛠️ Tools': true,
  });

  // Progress metrics
  const [progressData, setProgressData] = useState({
    vocabulary: '',
    grammar: '',
    history: '',
    loading: true,
  });

  // Load progress metrics asynchronously
  const loadProgress = async () => {
    try {
      const [vocabBooks, grammarBooks, examsHistory] = await Promise.allSettled([
        vocabularyApi.getBooks(),
        grammarApi.getBooks(),
        ieltsExamsApi.getHistory(),
      ]);

      let vocabText = '';
      let grammarText = '';
      let historyText = '';

      if (vocabBooks.status === 'fulfilled') {
        const books = vocabBooks.value;
        let totalUnits = 0;
        books.forEach((b: any) => {
          totalUnits += b.unitCount || b.units?.length || 0;
        });
        if (totalUnits === 0) totalUnits = 120;
        vocabText = `${totalUnits} units`;
      }

      if (grammarBooks.status === 'fulfilled') {
        const books = grammarBooks.value;
        let totalUnits = 0;
        books.forEach((b: any) => {
          totalUnits += b.unitCount || b.units?.length || 0;
        });
        if (totalUnits === 0) totalUnits = 40;
        grammarText = `${totalUnits} lessons`;
      }

      if (examsHistory.status === 'fulfilled') {
        const history = examsHistory.value;
        historyText = `${history.length} tests`;
      }

      setProgressData({
        vocabulary: vocabText,
        grammar: grammarText,
        history: historyText,
        loading: false,
      });
    } catch (error) {
      if (__DEV__) console.error('Failed to load drawer progress:', error);
      setProgressData((p) => ({ ...p, loading: false }));
    }
  };

  // Load recently visited routes from AsyncStorage
  const loadRecentRoutes = async () => {
    try {
      const stored = await AsyncStorage.getItem('@recent_drawer_visits');
      if (stored) {
        setRecentRoutes(JSON.parse(stored));
      }
    } catch (error) {
      if (__DEV__) console.error('Failed to load recent routes:', error);
    }
  };

  // Save recently visited routes to AsyncStorage
  const saveRecentRoute = async (path: string) => {
    // Check if path matches any valid drawer item
    const matchingKey = Object.keys(ROUTE_METADATA).find((k) => path === k || path.startsWith(k));
    if (!matchingKey) return;

    try {
      const stored = await AsyncStorage.getItem('@recent_drawer_visits');
      let list: string[] = stored ? JSON.parse(stored) : [];
      list = list.filter((p) => p !== matchingKey);
      list.unshift(matchingKey);
      list = list.slice(0, 3); // Limit to top 3
      await AsyncStorage.setItem('@recent_drawer_visits', JSON.stringify(list));
      setRecentRoutes(list);
    } catch (error) {
      if (__DEV__) console.error('Failed to save recent route:', error);
    }
  };

  // Trigger loading data on Drawer Open
  useEffect(() => {
    if (drawerOpen) {
      // Fetch streak count
      ieltsProfileApi
        .getStreak()
        .then((res) => {
          setStreakCount(res.currentStreak);
        })
        .catch(() => {});

      // Fetch target & estimated band scores
      ieltsProfileApi
        .get()
        .then((res) => {
          setTargetBand(res.targetBand || null);
          setBestBand(res.estimatedBand || res.targetBand || null);
        })
        .catch(() => {});

      loadProgress();
      loadRecentRoutes();

      if (pathname) {
        saveRecentRoute(pathname);
      }
    }
  }, [drawerOpen]);

  // PanResponder for drag to open / drag to close (Block B7)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false, // Let nested touchables react first
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Closed state: start touch in left 25px edge zone and drag to the right
        if (!drawerOpen) {
          return evt.nativeEvent.pageX < 25 && gestureState.dx > 10 && Math.abs(gestureState.dy) < 15;
        }
        // Open state: horizontal drag on the screen
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 15;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!drawerOpen) {
          const tx = Math.max(-DRAWER_WIDTH, Math.min(0, -DRAWER_WIDTH + gestureState.dx));
          const animVal = (tx / DRAWER_WIDTH) * 280;
          drawerAnim.setValue(animVal);
          backdropAnim.setValue(1 + tx / DRAWER_WIDTH);
        } else {
          const tx = Math.max(-DRAWER_WIDTH, Math.min(0, gestureState.dx));
          const animVal = (tx / DRAWER_WIDTH) * 280;
          drawerAnim.setValue(animVal);
          backdropAnim.setValue(1 + tx / DRAWER_WIDTH);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (!drawerOpen) {
          if (gestureState.dx > DRAWER_WIDTH * 0.4) {
            onOpen?.();
            Animated.parallel([
              Animated.spring(drawerAnim, { toValue: 0, useNativeDriver: true, tension: 70, friction: 11 }),
              Animated.timing(backdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
            ]).start();
          } else {
            Animated.parallel([
              Animated.spring(drawerAnim, { toValue: -280, useNativeDriver: true, tension: 70, friction: 11 }),
              Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            ]).start(() => onClose());
          }
        } else {
          if (gestureState.dx < -DRAWER_WIDTH * 0.4) {
            onClose();
            Animated.parallel([
              Animated.spring(drawerAnim, { toValue: -280, useNativeDriver: true, tension: 70, friction: 11 }),
              Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            ]).start();
          } else {
            onOpen?.();
            Animated.parallel([
              Animated.spring(drawerAnim, { toValue: 0, useNativeDriver: true, tension: 70, friction: 11 }),
              Animated.timing(backdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
            ]).start();
          }
        }
      },
    })
  ).current;

  // Determine if this is the IELTS module drawer or a custom one (e.g. Vocab Lab)
  const isIeltsDrawer = !navItems || navItems.some(item => 
    item.route && (item.route.startsWith('/ielts') || item.route.startsWith('/(tabs)/ielts') || item.route.startsWith('/(auth)') || item.route === '/(tabs)/ielts')
  );

  const getGroups = (): DrawerGroup[] => {
    if (isIeltsDrawer) {
      return DRAWER_GROUPS;
    }
    // Convert flat custom navItems (e.g. Vocab Lab) to group
    return [
      {
        title: title || 'Menu',
        items: (navItems || []).map((item) => {
          const icon = item.icon || 'list-outline';
          return {
            key: item.key || item.label,
            label: item.label,
            iconOutline: icon.endsWith('-outline') ? icon : `${icon}-outline`,
            iconFilled: icon.replace('-outline', ''),
            route: item.route,
            isActive: item.isActive,
            premium: item.premium,
          };
        }),
      },
    ];
  };

  // Real-time quick search filtering (Block B9)
  const filteredGroups = getGroups().map((group) => {
    const items = group.items.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...group, items };
  }).filter((group) => group.items.length > 0);

  // Map parent drawer anim to responsive width transform (Block B8)
  const translateX = drawerAnim.interpolate({
    inputRange: [-280, 0],
    outputRange: [-DRAWER_WIDTH, 0],
  });

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupTitle]: !prev[groupTitle] }));
  };

  const getAvatarInitials = () => {
    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    if (firstName) {
      return `${firstName[0]}${lastName ? lastName[0] : ''}`.toUpperCase();
    }
    return user?.email ? user.email[0].toUpperCase() : 'U';
  };

  const getAvatarBg = () => {
    const name = user?.firstName || user?.email || 'Student';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 65%, 72%)`;
  };

  const isRouteActive = (route: string) => {
    if (!pathname) return false;
    return pathname === route || pathname.startsWith(route);
  };

  const isItemActive = (item: DrawerItem) => {
    if (item.isActive !== undefined) return item.isActive;
    return isRouteActive(item.route);
  };

  const handleItemPress = (item: DrawerItem) => {
    if (item.premium && !isPremium) {
      // FREE users attempting to tap Premium resources (Block B5)
      openUpgradeModal();
    } else {
      onNavPress(item.route);
    }
  };

  const styles = StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      zIndex: 50,
    },
    drawer: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      width: DRAWER_WIDTH,
      backgroundColor: colors.background,
      zIndex: 60,
      borderRightWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000000',
      shadowOffset: { width: 4, height: 0 },
      shadowOpacity: isDark ? 0.35 : 0.08,
      shadowRadius: 20,
      elevation: 20,
    },
    headerContext: {
      paddingHorizontal: SPACING.md,
      paddingTop: SPACING.lg + 10,
      paddingBottom: SPACING.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
    },
    userMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    avatarCircle: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      fontFamily: FONTS.bold,
      fontSize: 18,
      color: '#FFFFFF',
    },
    avatarImage: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },
    userInfoCol: {
      flex: 1,
    },
    userName: {
      fontSize: FONT_SIZES.md,
      fontFamily: FONTS.bold,
      color: colors.text,
    },
    tierContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
    },
    tierText: {
      fontSize: 10,
      fontFamily: FONTS.semibold,
      paddingHorizontal: 6,
      paddingVertical: 1,
      borderRadius: 4,
      overflow: 'hidden',
    },
    streakText: {
      fontSize: 11,
      fontFamily: FONTS.medium,
      color: colors.textSecondary,
      marginLeft: 8,
    },
    bandTargetsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      gap: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      paddingTop: 6,
    },
    bandMeta: {
      fontSize: 11,
      fontFamily: FONTS.medium,
      color: colors.textSecondary,
    },
    bandValue: {
      fontFamily: FONTS.bold,
      color: colors.text,
    },
    searchContainer: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      backgroundColor: colors.background,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    searchBarInputWrapper: {
      height: 38,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg,
      paddingHorizontal: SPACING.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      height: '100%',
      fontFamily: FONTS.medium,
      fontSize: 13,
      color: colors.text,
      padding: 0,
      marginLeft: 6,
    },
    scrollView: {
      flex: 1,
    },
    groupWrapper: {
      marginBottom: SPACING.sm,
    },
    groupHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.md,
      paddingVertical: 10,
      marginTop: SPACING.sm,
    },
    groupTitle: {
      fontSize: 11,
      fontFamily: FONTS.bold,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    navItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.md,
      paddingVertical: 12,
      marginHorizontal: SPACING.sm,
      borderRadius: RADIUS.lg,
      marginBottom: 3,
      borderLeftWidth: 4,
      borderLeftColor: 'transparent',
    },
    navItemActive: {
      borderLeftColor: colors.primary,
      backgroundColor: colors.primary + '15',
    },
    navLabel: {
      flex: 1,
      fontFamily: FONTS.medium,
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 12,
    },
    navLabelActive: {
      fontFamily: FONTS.bold,
      color: colors.text,
    },
    progressText: {
      fontSize: 11,
      fontFamily: FONTS.semibold,
      color: colors.textMuted,
      marginRight: 6,
    },
    footer: {
      borderTopWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.md,
      backgroundColor: colors.card,
    },
    practiceCTA: {
      height: 40,
      borderRadius: RADIUS.md,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      gap: 6,
      marginBottom: 12,
    },
    practiceCTAText: {
      fontSize: 13,
      fontFamily: FONTS.bold,
      color: '#FFFFFF',
    },
    footerToolsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    footerIconGroup: {
      flexDirection: 'row',
      gap: 16,
    },
    footerIcon: {
      padding: 4,
    },
    versionText: {
      fontSize: 11,
      fontFamily: FONTS.medium,
      color: colors.textMuted,
    },
  });

  return (
    <>
      {/* Edge Swipe Touch Strip to trigger opening (Block B7) */}
      {!drawerOpen && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: Platform.OS === 'ios' ? 25 : 35,
            zIndex: 99,
            backgroundColor: 'transparent',
          }}
          {...panResponder.panHandlers}
        />
      )}

      {/* Backdrop overlay */}
      {drawerOpen && (
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
          <Pressable style={{ flex: 1 }} onPress={onClose} />
        </Animated.View>
      )}

      {/* Drawer Sidebar Container */}
      <Animated.View
        style={[
          styles.drawer,
          { paddingTop: insetsTop, transform: [{ translateX }] },
        ]}
        pointerEvents={drawerOpen ? 'auto' : 'none'}
        {...(drawerOpen ? panResponder.panHandlers : {})}
      >
        {/* User Context Header (Block B1) */}
        <View style={styles.headerContext}>
          <View style={styles.userMetaRow}>
            {/* Avatar image/initials */}
            <View style={[styles.avatarCircle, { backgroundColor: getAvatarBg() }]}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{getAvatarInitials()}</Text>
              )}
            </View>

            <View style={styles.userInfoCol}>
              <Text style={styles.userName} numberOfLines={1}>
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email || 'Student'}
              </Text>
              
              <View style={styles.tierContainer}>
                {/* Subscription Tier Badge */}
                <Text
                  style={[
                    styles.tierText,
                    {
                      backgroundColor: isPremium ? '#FEF3C7' : '#F1F5F9',
                      color: isPremium ? '#D97706' : '#64748B',
                    },
                  ]}
                >
                  {tier}
                </Text>
                
                {/* Daily streak count */}
                <Text style={styles.streakText}>
                  🔥 {streakCount ?? 0} {streakCount === 1 ? 'day' : 'days'}
                </Text>
              </View>
            </View>
          </View>

          {/* Performance goals */}
          <View style={styles.bandTargetsRow}>
            <Text style={styles.bandMeta}>
              Target: <Text style={styles.bandValue}>{targetBand ? targetBand.toFixed(1) : '—'}</Text>
            </Text>
            <Text style={styles.bandMeta}>
              Est. Band: <Text style={styles.bandValue}>{bestBand ? bestBand.toFixed(1) : '—'}</Text>
            </Text>
          </View>
        </View>

        {/* Quick jump filter search bar (Block B9) */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBarInputWrapper}>
            <Ionicons name="search" size={16} color={colors.textSecondary} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search sections..."
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Menu Scroller */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Recently Visited Section (Block B6) */}
          {isIeltsDrawer && recentRoutes.length > 0 && searchQuery === '' && (
            <View style={styles.groupWrapper}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupTitle}>🕒 Recently Visited</Text>
              </View>
              {recentRoutes.map((route) => {
                const meta = ROUTE_METADATA[route];
                if (!meta) return null;
                const active = isRouteActive(route);

                return (
                  <TouchableOpacity
                    key={`recent-${route}`}
                    style={[styles.navItem, active && styles.navItemActive]}
                    onPress={() => onNavPress(route)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={active ? meta.iconFilled : meta.iconOutline}
                      size={20}
                      color={active ? colors.primary : colors.textSecondary}
                    />
                    <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                      {meta.label}
                    </Text>
                    <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Grouped menu navigation list (Block B2) */}
          {filteredGroups.map((group) => {
            const isExpanded = expandedGroups[group.title] ?? true;

            return (
              <View key={group.title} style={styles.groupWrapper}>
                {/* Header Collapsible trigger */}
                <TouchableOpacity
                  style={styles.groupHeader}
                  onPress={() => toggleGroup(group.title)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.groupTitle}>{group.title}</Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                    size={12}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>

                {/* Items Render */}
                {isExpanded &&
                  group.items.map((item) => {
                    const active = isItemActive(item);
                    const locked = item.premium && !isPremium;

                    // Progress indicators mapping (Block B4)
                    let progressText = '';
                    if (!progressData.loading) {
                      if (item.key === 'vocabulary') progressText = progressData.vocabulary;
                      if (item.key === 'grammar') progressText = progressData.grammar;
                      if (item.key === 'history') progressText = progressData.history;
                    }

                    return (
                      <TouchableOpacity
                        key={item.key}
                        style={[styles.navItem, active && styles.navItemActive]}
                        onPress={() => handleItemPress(item)}
                        activeOpacity={0.7}
                      >
                        {/* Interactive morphing outline -> filled icons */}
                        <Ionicons
                          name={active ? item.iconFilled : item.iconOutline}
                          size={20}
                          color={active ? colors.primary : colors.textSecondary}
                        />
                        <Text style={[styles.navLabel, active && styles.navLabelActive]} numberOfLines={1}>
                          {item.label}
                        </Text>
                        
                        {/* Inline progress display */}
                        {progressText !== '' && searchQuery === '' && (
                          <Text style={styles.progressText}>{progressText}</Text>
                        )}

                        {/* Gold padlock indicator for Free users (Block B5) */}
                        {locked ? (
                          <Ionicons name="lock-closed" size={14} color="#F59E0B" />
                        ) : (
                          active && <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
              </View>
            );
          })}
        </ScrollView>

        {/* Footer Actions Section (Block B10) */}
        <View style={styles.footer}>
          {/* Practice Now Hero Call-To-Action */}
          {isIeltsDrawer && (
            <TouchableOpacity
              style={styles.practiceCTA}
              onPress={() => {
                if (!isPremium) {
                  openUpgradeModal();
                } else {
                  onNavPress('/ielts/advanced');
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.practiceCTAText}>🎯 Practice now</Text>
              <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          <View style={styles.footerToolsRow}>
            {/* Version identifier */}
            <Text style={styles.versionText}>v1.0.0</Text>

            {/* Quick settings shortcut icons */}
            <View style={styles.footerIconGroup}>
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  router.push('/(tabs)/profile?tab=settings');
                }}
                style={styles.footerIcon}
              >
                <Ionicons name="settings-outline" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  router.push('/chat-ai');
                }}
                style={styles.footerIcon}
              >
                <Ionicons name="help-circle-outline" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    </>
  );
}
