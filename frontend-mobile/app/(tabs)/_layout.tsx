import { Tabs, Link } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, View, TouchableOpacity, DeviceEventEmitter } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useNotification } from '@/contexts/NotificationContext';
import { useTheme } from '@/contexts/ThemeContext';
import { CustomTabBar } from '@/components/global/CustomTabBar';

export default function TabLayout() {
  const { colors } = useTheme();
  const fabTranslateY = useSharedValue(0);

  // Sync Lexon AI FAB visibility with Tab Bar scroll hiding
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(
      'SET_TAB_BAR_VISIBILITY',
      ({ visible }: { visible: boolean }) => {
        fabTranslateY.value = withTiming(visible ? 0 : 80, { duration: 250 });
      }
    );
    return () => listener.remove();
  }, []);

  const fabAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: fabTranslateY.value }],
    };
  });

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={() => null}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
          }}
        />
        <Tabs.Screen
          name="ielts"
          options={{
            title: 'IELTS',
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: 'Community',
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
          }}
        />

        {/* Ẩn các màn hình khác khỏi bottom tab bar */}
        <Tabs.Screen name="vocablab" options={{ href: null }} />
        <Tabs.Screen name="shadowing" options={{ href: null }} />
        <Tabs.Screen name="vocabulary" options={{ href: null }} />
        <Tabs.Screen name="grammar" options={{ href: null }} />
      </Tabs>

      {/* Global Lexon AI FAB with Slide Animation matching Scroll Hiding */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: Platform.OS === 'ios' ? 100 : 80,
            right: 20,
            zIndex: 100,
          },
          fabAnimatedStyle,
        ]}
      >
        <Link href="/chat-ai" asChild>
          <TouchableOpacity
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.card,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 5,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            activeOpacity={0.8}
          >
            <Svg width="26" height="26" viewBox="0 0 28 28" fill="none">
              <Defs>
                <LinearGradient id="gemini-grad-fab" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0%" stopColor="#4285F4" />
                  <Stop offset="50%" stopColor="#9C6FEF" />
                  <Stop offset="100%" stopColor="#EA4335" />
                </LinearGradient>
              </Defs>
              <Path
                d="M14 2C14 2 14.8 8.4 17.6 11.2C20.4 14 26.8 14 26.8 14C26.8 14 20.4 14 17.6 16.8C14.8 19.6 14 26 14 26C14 26 13.2 19.6 10.4 16.8C7.6 14 1.2 14 1.2 14C1.2 14 7.6 14 10.4 11.2C13.2 8.4 14 2 14 2Z"
                fill="url(#gemini-grad-fab)"
              />
            </Svg>
          </TouchableOpacity>
        </Link>
      </Animated.View>
    </View>
  );
}
