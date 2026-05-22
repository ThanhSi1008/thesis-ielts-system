import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { COLORS } from '@/constants';

export default function DictationRedirectScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    // Seamlessly redirect to the actual, premium Dictation lesson list
    router.replace('/practice-tools/shadowing?mode=dictation');
  }, [router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
