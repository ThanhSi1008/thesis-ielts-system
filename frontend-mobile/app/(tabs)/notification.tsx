import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '@/constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NotificationTab() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={styles.container}>
      <Tabs.Screen 
        options={{
          headerShown: true,
          title: 'Notifications',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#fff' },
          headerTitleStyle: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.lg, color: COLORS.text },
        }} 
      />
      
      <View style={styles.content}>
        <Text style={styles.emptyText}>No notifications yet</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  }
});
