import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
  DeviceEventEmitter,
  Modal,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { usePathname, useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useGrading } from '@/contexts/GradingContext';
import { FONTS, SPACING, RADIUS, ROUTES } from '@/constants';
import { useSubscription } from '@/contexts/SubscriptionContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SPRING_CONFIG = {
  damping: 18,
  stiffness: 140,
  mass: 0.8,
};

// Tab bar dimensions — floating pill, no safe-area padding needed
const TAB_HEIGHT = 62;
const TAB_BOTTOM = Platform.OS === 'ios' ? 26 : 10;
const TAB_SIDE_MARGIN = 16;

interface QuickMenuOption {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  route: string;
  action?: () => void;
  color?: string;
}

// 5 core tabs
const TABS = [
  { name: 'index', title: 'Home', icon: 'home', iconOutline: 'home-outline' },
  { name: 'explore', title: 'Explore', icon: 'compass', iconOutline: 'compass-outline' },
  { name: 'ielts', title: 'IELTS', icon: 'school', iconOutline: 'school-outline' },
  { name: 'community', title: 'Community', icon: 'people', iconOutline: 'people-outline' },
  { name: 'profile', title: 'Profile', icon: 'person', iconOutline: 'person-outline' },
] as const;

// Strict rules to determine if we should hide the navigation tab bar during exams, lessons, quizzes, or other high-focus modules
const isPracticeOrExamOrAuth = (path: string): boolean => {
  if (!path) return false;

  // 1. Auth routes
  if (
    path.includes('/login') ||
    path.includes('/register') ||
    path.includes('/forgot-password') ||
    path.includes('/(auth)')
  ) {
    return true;
  }
  
  // 2. Active Exam taking (e.g. /ielts/intensive/123, but not /ielts/intensive or /ielts/intensive/custom or result)
  const isIntensiveExam = /^\/ielts\/intensive\/[^/]+$/.test(path) && 
    !path.endsWith('/custom') && 
    !path.endsWith('/index');
  if (isIntensiveExam) return true;

  // 3. Active Advanced skill practice (e.g. /ielts/advanced/writing/123, /ielts/advanced/speaking/123)
  // But not the index (/ielts/advanced/speaking) or results
  const isAdvancedSkillPractice = /^\/ielts\/advanced\/(writing|speaking)\/[^/]+$/.test(path) &&
    !path.includes('/result');
  if (isAdvancedSkillPractice) return true;

  // 4. Dynamic skill part taking (e.g. /ielts/advanced/listening/part-1, but not /ielts/advanced/listening/part-1/result/...)
  const isAdvancedSkillPart = /^\/ielts\/advanced\/(listening|reading|writing|speaking)\/[^/]+$/.test(path) &&
    !path.includes('/result') &&
    !path.includes('/history');
  if (isAdvancedSkillPart) return true;

  // 5. Sibling skill part routing (e.g. /ielts/advanced/[skill]/[partId])
  const isAdvancedGenericPart = /^\/ielts\/advanced\/[^/]+\/[^/]+$/.test(path) &&
    !path.includes('/result') &&
    !path.includes('/history') &&
    !path.includes('/index');
  if (isAdvancedGenericPart) return true;

  // 6. Basic lessons and exercises (e.g. /ielts/basic/lesson/123, /ielts/basic/exercise/123)
  if (/^\/ielts\/basic\/(lesson|exercise)\/[^/]+$/.test(path)) {
    return true;
  }

  // 7. Active Shadowing/Dictation lesson (/practice-tools/shadowing/[lessonId]/[mode])
  if (/^\/practice-tools\/shadowing\/[^/]+\/[^/]+$/.test(path)) {
    return true;
  }

  // 8. Active Vocab Lab study (/vocab-lab/study/[deckId])
  if (path.includes('/vocab-lab/study/')) {
    return true;
  }

  // 9. Other focused system screens
  if (
    path === '/chat-ai' ||
    path === '/notification' ||
    path === '/pricing' ||
    path.includes('/payment') ||
    path.includes('/onboarding')
  ) {
    return true;
  }

  return false;
};

// Map current pathname to one of our five core tabs
const getActiveTab = (path: string): string => {
  if (path === '/' || path === '/(tabs)' || path === '/index' || path === '') {
    return 'index';
  }
  if (path.startsWith('/explore') || path.startsWith('/(tabs)/explore') || path.startsWith('/practice-tools')) {
    return 'explore';
  }
  if (path.startsWith('/ielts') || path.startsWith('/(tabs)/ielts')) {
    return 'ielts';
  }
  if (path.startsWith('/community') || path.startsWith('/(tabs)/community')) {
    return 'community';
  }
  if (path.startsWith('/profile') || path.startsWith('/(tabs)/profile')) {
    return 'profile';
  }
  return 'index';
};

export function CustomTabBar({ state, descriptors, navigation }: { state?: any; descriptors?: any; navigation?: any } = {}) {
  const { colors, isDark } = useTheme();
  const { unreadCount, notifications } = useNotification();
  const { jobs } = useGrading();
  const { tier } = useSubscription();
  const pathname = usePathname();
  const router = useRouter();

  const [tabBarWidth, setTabBarWidth] = useState(SCREEN_WIDTH - TAB_SIDE_MARGIN * 2);
  const [quickMenuVisible, setQuickMenuVisible] = useState(false);
  const [quickMenuType, setQuickMenuType] = useState<'ielts' | 'profile' | null>(null);

  const translateY = useSharedValue(0);
  const indicatorTranslateX = useSharedValue(0);

  const pendingGradingCount = jobs.filter(
    (j) => j.status === 'SUBMITTING' || j.status === 'GRADING'
  ).length;

  const unreadCommunityCount = notifications.filter(
    (n) => !n.isRead && n.type.toLowerCase().includes('comment')
  ).length;

  const activeTabName = getActiveTab(pathname);
  const activeIndex = TABS.findIndex((t) => t.name === activeTabName);
  const totalTabs = TABS.length;
  const tabWidth = tabBarWidth / (totalTabs || 1);

  const shouldHideRoute = isPracticeOrExamOrAuth(pathname);
  const scrollVisible = useRef(true);

  // Sync scroll visibility and route visibility
  const updateVisibility = (visible: boolean) => {
    const isVisible = visible && !shouldHideRoute;
    translateY.value = withTiming(isVisible ? 0 : TAB_HEIGHT + TAB_BOTTOM + 50, {
      duration: 250,
    });
  };

  useEffect(() => {
    // Reset scroll visibility on route change
    scrollVisible.current = true;
    updateVisibility(true);
  }, [pathname, shouldHideRoute]);

  useEffect(() => {
    const visibilityListener = DeviceEventEmitter.addListener(
      'SET_TAB_BAR_VISIBILITY',
      ({ visible }: { visible: boolean }) => {
        scrollVisible.current = visible;
        updateVisibility(visible);
      }
    );
    return () => visibilityListener.remove();
  }, [shouldHideRoute]);

  useEffect(() => {
    if (activeIndex !== -1) {
      indicatorTranslateX.value = withSpring(activeIndex * tabWidth, SPRING_CONFIG);
    }
  }, [activeIndex, tabWidth]);

  const getTabIcon = (routeName: string, focused: boolean) => {
    switch (routeName) {
      case 'index':
        return focused ? 'home' : 'home-outline';
      case 'explore':
        return focused ? 'compass' : 'compass-outline';
      case 'ielts':
        return focused ? 'school' : 'school-outline';
      case 'community':
        return focused ? 'people' : 'people-outline';
      case 'profile':
        return focused ? 'person' : 'person-outline';
      default:
        return focused ? 'ellipse' : 'ellipse-outline';
    }
  };

  const getTabTitle = (routeName: string) => {
    switch (routeName) {
      case 'index':
        return 'Home';
      case 'explore':
        return 'Explore';
      case 'ielts':
        return 'IELTS';
      case 'community':
        return 'Community';
      case 'profile':
        return 'Profile';
      default:
        return routeName;
    }
  };

  const getTabBadge = (routeName: string) => {
    switch (routeName) {
      case 'ielts':
        return pendingGradingCount > 0 ? pendingGradingCount : 0;
      case 'community':
        return unreadCommunityCount > 0 ? unreadCommunityCount : 0;
      case 'profile':
        return unreadCount > 0 ? unreadCount : 0;
      default:
        return 0;
    }
  };

  const ieltsMenuOptions: QuickMenuOption[] = [
    { label: 'Mock Exam', icon: 'flash', route: ROUTES.ieltsIntensive, color: '#F59E0B' },
    { label: 'Continue Lesson', icon: 'book', route: ROUTES.ieltsBasic, color: '#10B981' },
    { label: 'Vocab Quiz', icon: 'shapes', route: ROUTES.vocabLab, color: '#3B82F6' },
    {
      label: 'Speaking Test',
      icon: 'mic',
      route: ROUTES.ieltsAdvancedSpeakingIndex,
      color: '#8B5CF6',
    },
    { label: 'Statistics', icon: 'bar-chart', route: ROUTES.ieltsStatistics, color: '#EF4444' },
    {
      label: 'Band Calculator',
      icon: 'calculator',
      route: ROUTES.ieltsCalculator,
      color: '#6B7280',
    },
  ];

  const profileMenuOptions: QuickMenuOption[] = [
    { label: 'Notifications', icon: 'notifications', route: ROUTES.notification, color: '#FFC600' },
    { label: 'Subscription', icon: 'diamond', route: ROUTES.pricing, color: '#F59E0B' },
    {
      label: 'Edit Profile',
      icon: 'create',
      route: ROUTES.profile + '?tab=account',
      color: '#3B82F6',
    },
    {
      label: 'App Settings',
      icon: 'settings',
      route: ROUTES.profile + '?tab=settings',
      color: '#10B981',
    },
  ];

  const openQuickMenu = (type: 'ielts' | 'profile') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setQuickMenuType(type);
    setQuickMenuVisible(true);
  };

  const closeQuickMenu = () => {
    setQuickMenuVisible(false);
    setQuickMenuType(null);
  };

  const handleQuickMenuSelect = (option: QuickMenuOption) => {
    closeQuickMenu();
    if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate(option.route as any);
    } else {
      router.navigate(option.route as any);
    }
  };

  const handleTabPress = (tabName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const targetRoute = tabName === 'index' ? '/(tabs)' : `/(tabs)/${tabName}`;
    
    if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate(tabName);
    } else {
      router.navigate(targetRoute as any);
    }
  };

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Sliding pill indicator behind active tab
  const pillAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorTranslateX.value }],
    width: tabWidth,
  }));

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            shadowColor: isDark ? '#000000' : '#334155',
            shadowOpacity: isDark ? 0.5 : 0.12,
          },
          containerAnimatedStyle,
        ]}
        onLayout={(e) => setTabBarWidth(e.nativeEvent.layout.width)}
      >
        {/* Sliding active-tab pill background */}
        <Animated.View
          style={[
            styles.activePill,
            { backgroundColor: colors.primary + '22' },
            pillAnimatedStyle,
          ]}
          pointerEvents="none"
        />

        {/* Tab items */}
        <View style={styles.tabBarItems}>
          {TABS.map((tab) => {
            const isFocused = activeTabName === tab.name;
            const badgeCount = getTabBadge(tab.name);

            return (
              <TabButton
                key={tab.name}
                title={getTabTitle(tab.name)}
                iconName={getTabIcon(tab.name, isFocused)}
                badgeCount={badgeCount}
                focused={isFocused}
                activeColor={colors.primary}
                inactiveColor={colors.textSecondary}
                activeTitleColor={colors.text}
                onPress={() => handleTabPress(tab.name)}
                onDoublePress={() => {
                  DeviceEventEmitter.emit('SCROLL_TO_TOP', { target: tab.name });
                }}
                onLongPress={() => {
                  if (tab.name === 'ielts') openQuickMenu('ielts');
                  else if (tab.name === 'profile') openQuickMenu('profile');
                }}
              />
            );
          })}
        </View>
      </Animated.View>

      {/* Quick-action sheet */}
      <Modal
        visible={quickMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={closeQuickMenu}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeQuickMenu}>
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: colors.bgElevated, borderColor: colors.border },
            ]}
          >
            <View style={styles.sheetHeader}>
              <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />
              <Text style={[styles.sheetTitle, { color: colors.text }]}>
                {quickMenuType === 'ielts' ? 'IELTS Quick Actions' : 'Account Quick Menu'}
              </Text>
              <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>
                {quickMenuType === 'ielts'
                  ? 'Jump directly into your practice exercises and test metrics'
                  : `Tier: ${tier} • Manage your account and settings`}
              </Text>
            </View>

            <View style={styles.sheetGrid}>
              {(quickMenuType === 'ielts' ? ieltsMenuOptions : profileMenuOptions).map(
                (option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.gridItem, { backgroundColor: colors.surface }]}
                    onPress={() => handleQuickMenuSelect(option)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.gridIconContainer,
                        { backgroundColor: (option.color || colors.primary) + '15' },
                      ]}
                    >
                      <Ionicons
                        name={option.icon}
                        size={24}
                        color={option.color || colors.primary}
                      />
                    </View>
                    <Text
                      style={[styles.gridLabel, { color: colors.text }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.surface }]}
              onPress={closeQuickMenu}
            >
              <Text style={[styles.closeButtonText, { color: colors.textSecondary }]}>
                Dismiss
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

// ─── Individual Tab Button ────────────────────────────────────────────────────

interface TabButtonProps {
  title: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  badgeCount: number;
  focused: boolean;
  activeColor: string;
  inactiveColor: string;
  activeTitleColor: string;
  onPress: () => void;
  onDoublePress: () => void;
  onLongPress: () => void;
}

function TabButton({
  title,
  iconName,
  badgeCount,
  focused,
  activeColor,
  inactiveColor,
  activeTitleColor,
  onPress,
  onDoublePress,
  onLongPress,
}: TabButtonProps) {
  const lastPress = useRef<number>(0);
  const scale = useSharedValue(1);

  const animatedScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    const now = Date.now();
    if (now - lastPress.current < 300) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onDoublePress();
    } else {
      scale.value = withSequence(
        withSpring(1.15, { damping: 6, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 160 })
      );
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
    lastPress.current = now;
  };

  return (
    <Pressable
      style={styles.tabButton}
      onPress={handlePress}
      onLongPress={onLongPress}
      delayLongPress={450}
    >
      <Animated.View style={[styles.tabContent, animatedScaleStyle]}>
        {badgeCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeCount > 99 ? '99+' : badgeCount}</Text>
          </View>
        )}

        <Ionicons
          name={iconName}
          size={focused ? 24 : 22}
          color={focused ? activeColor : inactiveColor}
        />

        <Text
          style={[
            styles.tabTitle,
            {
              color: focused ? activeTitleColor : inactiveColor,
              fontFamily: focused ? FONTS.bold : FONTS.medium,
              opacity: focused ? 1 : 0.75,
            },
          ]}
        >
          {title}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Floating pill container
  container: {
    position: 'absolute',
    bottom: TAB_BOTTOM,
    left: TAB_SIDE_MARGIN,
    right: TAB_SIDE_MARGIN,
    height: TAB_HEIGHT,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    zIndex: 99,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 20,
    elevation: 24,
  },

  // Sliding background pill for the active tab
  activePill: {
    position: 'absolute',
    top: 8,
    bottom: 8,
    borderRadius: 14,
    zIndex: 0,
  },

  tabBarItems: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },

  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 4,
    gap: 2,
  },

  tabTitle: {
    fontSize: 10,
    marginTop: 1,
    letterSpacing: 0.1,
  },

  badge: {
    position: 'absolute',
    top: 0,
    right: -10,
    backgroundColor: '#EF4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 10,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },

  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    lineHeight: 11,
  },

  // Quick-action sheet
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SPACING.lg || 24,
    paddingTop: SPACING.md || 16,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    borderTopWidth: 1,
    elevation: 24,
  },
  dragHandle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: SPACING.md || 16,
  },
  sheetHeader: {
    marginBottom: SPACING.lg || 20,
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    textAlign: 'center',
  },
  sheetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: SPACING.lg || 20,
  },
  gridItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: RADIUS.lg || 12,
    gap: 12,
  },
  gridIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridLabel: {
    fontSize: 13,
    fontFamily: FONTS.semibold || FONTS.medium,
    flex: 1,
  },
  closeButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: RADIUS.lg || 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 15,
    fontFamily: FONTS.semibold || FONTS.bold,
  },
});
