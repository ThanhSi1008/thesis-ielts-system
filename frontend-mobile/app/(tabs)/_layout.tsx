import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants';

export default function TabLayout() {
  return (
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
          fontFamily: 'Farro-Medium',
          fontSize: 10,
          marginTop: 2,
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="vocablab"
        options={{ title: 'Vocab', tabBarIcon: ({ color, size }) => <Ionicons name="library" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="ielts"
        options={{ title: 'IELTS', tabBarIcon: ({ color, size }) => <Ionicons name="school" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="pronunciation"
        options={{ title: 'Speaking', tabBarIcon: ({ color, size }) => <Ionicons name="mic" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="shadowing"
        options={{ title: 'Shadowing', tabBarIcon: ({ color, size }) => <Ionicons name="headset" size={size} color={color} /> }}
      />
    </Tabs>
  );
}
