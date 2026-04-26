import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#FFC600' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="vocab-lab/index"
        options={{
          title: 'Vocab Lab',
        }}
      />
      <Tabs.Screen
        name="exams/index"
        options={{
          title: 'Exams',
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
