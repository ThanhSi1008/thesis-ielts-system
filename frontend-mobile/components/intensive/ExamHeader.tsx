import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Badge } from '@/components/ui';
import { SPACING, RADIUS, FONT_SIZES } from '@/constants';

interface ExamHeaderProps {
  title: string;
  examType: string;
  timerDisplay: string;
  isTimerWarning: boolean;
  onExitPress: () => void;
}

export function ExamHeader({
  title,
  examType,
  timerDisplay,
  isTimerWarning,
  onExitPress,
}: ExamHeaderProps) {
  const { colors } = useTheme();

  // Split title: "Cambridge IELTS 17 - Listening Test 1" -> display the second half
  const displayTitle = title?.split(' - ')[1] ?? title;

  return (
    <View style={[styles.examHeader, { backgroundColor: colors.primary }]}>
      <TouchableOpacity
        onPress={onExitPress}
        accessibilityLabel="Exit Exam"
        accessibilityRole="button"
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="close" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.examTitleContainer}>
        <Text style={styles.examTitle} numberOfLines={1}>
          {displayTitle}
        </Text>
        <Badge label={examType} color="#fff" bg="rgba(255,255,255,0.2)" />
      </View>

      <View
        style={[styles.timerBadge, isTimerWarning && styles.timerWarning]}
        accessibilityLabel={`Time remaining: ${timerDisplay}`}
        accessibilityLiveRegion="polite"
      >
        <Ionicons name="timer-outline" size={14} color="#fff" />
        <Text style={styles.timerText}>{timerDisplay}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  examHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
    height: 56,
  },
  examTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  examTitle: {
    color: '#fff',
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    maxWidth: '70%',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  timerWarning: {
    backgroundColor: '#ef4444',
  },
  timerText: {
    color: '#fff',
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
