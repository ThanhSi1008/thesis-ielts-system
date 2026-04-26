import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false, 
        tabBarActiveTintColor: '#FFC600',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          height: 60,
          paddingBottom: 10,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontFamily: 'Farro-Bold',
          fontSize: 10,
          textTransform: 'uppercase',
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ 
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="vocab-lab/index"
        options={{ 
          title: 'Vocab',
          tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="exams/index"
        options={{ 
          title: 'Exams',
          tabBarIcon: ({ color, size }) => <Ionicons name="document-text" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="pronunciation/index"
        options={{ 
          title: 'Sounds',
          tabBarIcon: ({ color, size }) => <Ionicons name="mic" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="shadowing/index"
        options={{ 
          title: 'Shadow',
          tabBarIcon: ({ color, size }) => <Ionicons name="play-circle" size={size} color={color} />
        }}
      />
    </Tabs>
  );
}
