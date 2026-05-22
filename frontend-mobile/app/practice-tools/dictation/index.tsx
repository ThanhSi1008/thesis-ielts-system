import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { ROUTES } from '@/constants';

export default function DictationPlaceholderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
    },
    backBtn: {
      padding: 6,
      marginRight: 8,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
  });

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.push(ROUTES.practiceTools)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Back"
          accessibilityHint="Navigate back to the practice tools menu"
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <EmptyState
          icon="✍️"
          title="Dictation Module In Progress"
          subtitle="We are currently crafting a premium dictation playground integrated with our AI spelling analyzer. It will be launched in the next update!"
          action={{
            label: 'Back to Tools',
            onPress: () => router.push(ROUTES.practiceTools),
          }}
        />
      </View>
    </View>
  );
}
