import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { spacing } from '@/constants';
import Chip from '../atoms/Chip';
import { Ionicons } from '@expo/vector-icons';

interface TabPillProps<T extends string> {
  tabs: readonly { id: T; label: string; icon?: keyof typeof Ionicons.glyphMap }[];
  activeTab: T;
  onChange: (id: T) => void;
}

export default function TabPill<T extends string>({
  tabs,
  activeTab,
  onChange,
}: TabPillProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {tabs.map((tab) => (
        <Chip
          key={tab.id}
          label={tab.label}
          active={activeTab === tab.id}
          onPress={() => onChange(tab.id)}
          leftIcon={tab.icon}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
    flexDirection: 'row',
  },
});
