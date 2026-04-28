import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '@/constants';
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

/** Matches web's per-step section in RoadmapContent */
export function RoadmapStepSection({
  step,
  currentStep,
  nextItemId,
  onItemPress,
}: RoadmapStepSectionProps) {
  const isActiveStep    = step.step === currentStep;
  const isCompletedStep = step.isCompleted;

  return (
    <View style={[styles.section, step.isLocked && styles.sectionLocked]}>
      {/* Day header — matches web's border-b-2 border-gray-100 mb-6 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text
            style={[
              styles.dayLabel,
              isActiveStep    && styles.dayLabelActive,
              isCompletedStep && styles.dayLabelDone,
            ]}
          >
            Day {step.step}
          </Text>
          {isCompletedStep && (
            <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
          )}
          {step.isLocked && (
            <Ionicons name="lock-closed" size={14} color="#9CA3AF" />
          )}
        </View>
      </View>
      <View style={styles.divider} />

      {/* Timeline — ml-5 border-l-[3px] border-[#EEEEEE] pl-7 */}
      <View style={styles.timeline}>
        <View style={styles.timelineLine} />
        <View style={{ flex: 1, paddingLeft: SPACING.lg }}>
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
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xxl,
  },
  sectionLocked: {
    opacity: 0.5,
  },

  // Header — matches web's flex items-center justify-between py-3 px-2 border-b-2 border-gray-100 mb-6
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  // Day label — matches web text-lg font-extrabold
  dayLabel: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: '#111827',
  },
  dayLabelActive: {
    color: '#FFC107',
  },
  dayLabelDone: {
    color: '#16A34A',
  },

  // Divider — matches web border-b-2 border-gray-100
  divider: {
    height: 2,
    backgroundColor: '#F3F4F6',
    marginBottom: SPACING.lg,
    marginHorizontal: SPACING.xs,
  },

  // Timeline — matches web ml-5 border-l-[3px] border-[#EEEEEE] pl-7
  timeline: {
    flexDirection: 'row',
    marginLeft: SPACING.md,
  },
  timelineLine: {
    width: 3,
    backgroundColor: '#EEEEEE',
    borderRadius: 2,
    marginRight: 0,
  },
});
