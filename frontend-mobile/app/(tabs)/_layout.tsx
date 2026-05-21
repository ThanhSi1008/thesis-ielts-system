import { Tabs, Link } from 'expo-router';
import React from 'react';
import { Platform, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {COLORS, FONTS} from '@/constants';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';

export default function TabLayout() {
  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: '#64748b',
          tabBarStyle: {
            height: Platform.OS === 'ios' ? 88 : 64,
            paddingBottom: Platform.OS === 'ios' ? 28 : 8,
            paddingTop: 8,
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: '#e2e8f0',
            boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.05)',
          },
          tabBarLabelStyle: {
            fontFamily: FONTS.medium,
            fontSize: 10,
            marginTop: 2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color, size }) => <Ionicons name="compass" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="ielts"
          options={{
            title: 'IELTS',
            tabBarIcon: ({ color, size }) => <Ionicons name="school" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: 'Community',
            tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
          }}
        />

        {/* Ẩn các màn hình khác khỏi bottom tab bar */}
        <Tabs.Screen name="vocablab" options={{ href: null }} />
        <Tabs.Screen name="shadowing" options={{ href: null }} />
        <Tabs.Screen name="pronunciation" options={{ href: null }} />
        <Tabs.Screen name="vocabulary" options={{ href: null }} />
        <Tabs.Screen name="grammar" options={{ href: null }} />
      </Tabs>

      {/* Global Lexon AI FAB */}
      <Link href="/chat-ai" asChild>
        <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 105 : 85,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
});
