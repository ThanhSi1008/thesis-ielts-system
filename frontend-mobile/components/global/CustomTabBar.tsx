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
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useGrading } from '@/contexts/GradingContext';
import { FONTS, SPACING, RADIUS, ROUTES } from '@/constants';
import { useSubscription } from '@/contexts/SubscriptionContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Custom Spring Configuration for Premium Feel
const SPRING_CONFIG = {
  damping: 15,
  stiffness: 120,
  mass: 0.8,
};

interface QuickMenuOption {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  route: string;
  action?: () => void;
  color?: string;
}

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors, isDark } = useTheme();
  const { unreadCount, notifications } = useNotification();
  const { jobs } = useGrading();
  const { tier } = useSubscription();

  const [tabBarWidth, setTabBarWidth] = useState(SCREEN_WIDTH);
  const [quickMenuVisible, setQuickMenuVisible] = useState(false);
  const [quickMenuType, setQuickMenuType] = useState<'ielts' | 'profile' | null>(null);

  // Reanimated Tab Bar Visibility (for scroll hiding)
  const translateY = useSharedValue(0);
  const [visibleState, setVisibleState] = useState(true);

  // Reanimated Active Indicator Position
  const indicatorTranslateX = useSharedValue(0);

  // Compute pending grading jobs count for IELTS Badge
  const pendingGradingCount = jobs.filter(
    (j) => j.status === 'SUBMITTING' || j.status === 'GRADING'
  ).length;

  // Derive Community comments unread notifications
  const unreadCommunityCount = notifications.filter(
    (n) => !n.isRead && n.type.toLowerCase().includes('comment')
  ).length;

  // Filter out tabs with options.href === null
  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    return (options as any).href !== null;
  });

  const activeIndex = visibleRoutes.findIndex((r) => r.name === state.routes[state.index].name);
  const totalTabs = visibleRoutes.length;
  const tabWidth = tabBarWidth / (totalTabs || 1);

  // Handle Event for Hiding/Showing Tab Bar on Scroll
  useEffect(() => {
    const visibilityListener = DeviceEventEmitter.addListener(
      'SET_TAB_BAR_VISIBILITY',
      ({ visible }: { visible: boolean }) => {
        setVisibleState(visible);
        translateY.value = withTiming(visible ? 0 : 120, { duration: 250 });
      }
    );
    return () => visibilityListener.remove();
  }, []);

  // Animate active pill indicator when index or widths change
  useEffect(() => {
    if (activeIndex !== -1) {
      indicatorTranslateX.value = withSpring(activeIndex * tabWidth, SPRING_CONFIG);
    }
  }, [activeIndex, tabWidth]);

  // Tab Item Mappings for Icons
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

  // Quick Menu Action Options
  const ieltsMenuOptions: QuickMenuOption[] = [
    {
      label: 'Mock Exam',
      icon: 'flash',
      route: ROUTES.ieltsIntensive,
      color: '#F59E0B',
    },
    {
      label: 'Continue Lesson',
      icon: 'book',
      route: ROUTES.ieltsBasic,
      color: '#10B981',
    },
    {
      label: 'Vocab Quiz',
      icon: 'shapes',
      route: ROUTES.vocabLab,
      color: '#3B82F6',
    },
    {
      label: 'Speaking Test',
      icon: 'mic',
      route: ROUTES.ieltsAdvancedSpeakingIndex,
      color: '#8B5CF6',
    },
    {
      label: 'Statistics',
      icon: 'bar-chart',
      route: ROUTES.ieltsStatistics,
      color: '#EF4444',
    },
    {
      label: 'Band Calculator',
      icon: 'calculator',
      route: ROUTES.ieltsCalculator,
      color: '#6B7280',
    },
  ];

  const profileMenuOptions: QuickMenuOption[] = [
    {
      label: 'Subscription',
      icon: 'diamond',
      route: ROUTES.pricing,
      color: '#F59E0B',
    },
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
    navigation.navigate(option.route as any);
  };

  // Reanimated style for scroll-hiding container
  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  // Reanimated style for horizontal indicator pill sliding
  const indicatorAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: indicatorTranslateX.value }],
      width: tabWidth,
    };
  });

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            shadowColor: isDark ? '#000000' : '#475569',
            shadowOpacity: isDark ? 0.4 : 0.08,
          },
          containerAnimatedStyle,
        ]}
        onLayout={(e) => setTabBarWidth(e.nativeEvent.layout.width)}
      >
        {/* Animated Horizontal Active Pill Indicator (Top edge placement) */}
        <Animated.View style={[styles.indicatorContainer, indicatorAnimatedStyle]}>
          <View style={[styles.indicatorPill, { backgroundColor: colors.primary }]} />
        </Animated.View>

        {/* Tab Items Layout */}
        <View style={styles.tabBarItems}>
          {visibleRoutes.map((route, index) => {
            const isFocused = activeIndex === index;
            const badgeCount = getTabBadge(route.name);

            return (
              <TabButton
                key={route.key}
                title={getTabTitle(route.name)}
                iconName={getTabIcon(route.name, isFocused)}
                badgeCount={badgeCount}
                focused={isFocused}
                activeColor={colors.primary}
                inactiveColor={colors.textSecondary}
                activeTitleColor={colors.text}
                onPress={() => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });

                  if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(route.name, route.params);
                  }
                }}
                onDoublePress={() => {
                  DeviceEventEmitter.emit('SCROLL_TO_TOP', { target: route.name });
                }}
                onLongPress={() => {
                  if (route.name === 'ielts') {
                    openQuickMenu('ielts');
                  } else if (route.name === 'profile') {
                    openQuickMenu('profile');
                  }
                }}
              />
            );
          })}
        </View>
      </Animated.View>

      {/* Global Quick Action Sheet Modal (Block A8) */}
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

// ==========================================
// INDIVIDUAL BOUNCY TAB BUTTON COMPONENT
// ==========================================

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

  // Animated scale spring when tab active state changes or pressed
  const animatedScaleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePress = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    if (now - lastPress.current < DOUBLE_PRESS_DELAY) {
      // Double tap triggered
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onDoublePress();
    } else {
      // Single tap bounce animation
      scale.value = withSequence(
        withSpring(1.18, { damping: 6, stiffness: 180 }),
        withSpring(1, { damping: 8, stiffness: 120 })
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
      onLongPress={() => {
        onLongPress();
      }}
      delayLongPress={450}
    >
      <Animated.View style={[styles.tabContent, animatedScaleStyle]}>
        {/* Dynamic Badge Component */}
        {badgeCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {badgeCount > 99 ? '99+' : badgeCount}
            </Text>
          </View>
        )}

        <Ionicons
          name={iconName}
          size={24}
          color={focused ? activeColor : inactiveColor}
        />
        
        <Text
          style={[
            styles.tabTitle,
            {
              color: focused ? activeTitleColor : inactiveColor,
              fontFamily: focused ? FONTS.bold : FONTS.medium,
            },
          ]}
        >
          {title}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 88 : 64,
    borderTopWidth: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    zIndex: 99,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 16,
    elevation: 24,
  },
  indicatorContainer: {
    position: 'absolute',
    top: 0,
    height: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorPill: {
    width: 28,
    height: 3.5,
    borderRadius: 1.75,
  },
  tabBarItems: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'ios' ? 24 : 0,
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
  },
  tabTitle: {
    fontSize: 10,
    marginTop: 3,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#EF4444', // Red-500 semantic accent for critical notifications
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 100,
    borderWidth: 1.5,
    borderColor: '#FFFFFF', // Clean contrast barrier border
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    lineHeight: 11,
  },

  // Modal Action Sheet Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)', // Sleek dark slate tint backdrop overlay
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
