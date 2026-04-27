import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#FFC600' }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Home' }}
      />
      <Tabs.Screen
        name="vocablab"
        options={{ title: 'Vocab Lab' }}
      />
      <Tabs.Screen
        name="ielts"
        options={{ title: 'IELTS' }}
      />
      <Tabs.Screen
        name="pronunciation"
        options={{ title: 'Pronunciation' }}
      />
      <Tabs.Screen
        name="shadowing"
        options={{ title: 'Shadowing' }}
      />
    </Tabs>
  );
}
