import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '@/constants';
import { LessonRow, RoadmapItem } from './LessonRow';

interface RoadmapStep {
  step: number;
  items: RoadmapItem[];
  isLocked: boolean;
  isCompleted: boolean;
}

interface RoadmapStepSectionProps {
  step: RoadmapStep;
  currentStep: number;
  nextItemId: string | undefined;
  onItemPress: (item: RoadmapItem) => void;
}

export function RoadmapStepSection({
  step,
  currentStep,
  nextItemId,
  onItemPress
}: RoadmapStepSectionProps) {
  const isActiveStep = step.step === currentStep;
  const isCompletedStep = step.isCompleted;

  return (
    <View style={[styles.daySection, step.isLocked && { opacity: 0.5 }]}>
      {/* Day header */}
      <View style={styles.dayHeader}>
        <Text style={[
          styles.dayLabel,
          isActiveStep && { color: '#D97706' },
          isCompletedStep && { color: '#16A34A' },
        ]}>
          Day {step.step}
        </Text>
        {isCompletedStep && <Ionicons name="checkmark-circle" size={18} color="#16A34A" />}
        {step.isLocked && <Ionicons name="lock-closed" size={14} color="#9CA3AF" />}
      </View>
      <View style={styles.dayDivider} />

      {/* Timeline */}
      <View style={styles.timeline}>
        {/* Vertical line */}
        <View style={styles.timelineLine} />

        <View style={{ flex: 1 }}>
          {step.items.map((item) => (
            <LessonRow
              key={item.id}
              item={item}
              isNext={nextItemId === item.id}
              onPress={() => onItemPress(item)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  daySection: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl },
  dayHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.sm },
  dayLabel: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text },
  dayDivider: { height: 2, backgroundColor: '#F3F4F6', marginBottom: SPACING.md },
  timeline: { flexDirection: 'row' },
  timelineLine: {
    width: 3, backgroundColor: '#EEEEEE',
    marginLeft: 10, marginRight: 16, borderRadius: 2,
  },
});
