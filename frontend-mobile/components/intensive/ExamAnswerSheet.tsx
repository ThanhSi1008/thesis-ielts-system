import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { SPACING, RADIUS, FONT_SIZES } from '@/constants';

const DRAWER_HEIGHT = Math.min(Dimensions.get('window').height * 0.55, 420);

interface ExamAnswerSheetProps {
  open: boolean;
  onClose: () => void;
  totalQuestions: number;
  answers: Record<string, string>;
  onSelect: (n: number) => void;
}

export function ExamAnswerSheet({
  open,
  onClose,
  totalQuestions,
  answers,
  onSelect,
}: ExamAnswerSheetProps) {
  const { colors, isDark } = useTheme();
  const slideAnim = useRef(new Animated.Value(DRAWER_HEIGHT)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: open ? 0 : DRAWER_HEIGHT,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  }, [open, slideAnim]);

  const numbers = Array.from({ length: totalQuestions }, (_, i) => i + 1);
  const answeredCount = Object.keys(answers).length;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
      )}

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { backgroundColor: colors.card },
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Handle */}
        <View style={[styles.handle, { backgroundColor: isDark ? colors.border : '#D1D5DB' }]} />

        {/* Header */}
        <View style={styles.sheetHeader}>
          <Text style={[styles.sheetTitle, { color: colors.text }]}>Question Navigator</Text>
          <View style={styles.legend}>
            <View style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                {answeredCount} Answered
              </Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: isDark ? colors.border : '#E5E7EB' }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                {totalQuestions - answeredCount} Unanswered
              </Text>
            </View>
          </View>
        </View>

        {/* Grid */}
        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {numbers.map((n) => {
            const answered = !!answers[String(n)];
            return (
              <TouchableOpacity
                key={n}
                style={[
                  styles.cell,
                  {
                    backgroundColor: isDark ? colors.surface : '#F3F4F6',
                    borderColor: isDark ? colors.border : '#E5E7EB',
                  },
                  answered && [
                    styles.cellAnswered,
                    { backgroundColor: colors.primary + '18', borderColor: colors.primary },
                  ],
                ]}
                onPress={() => {
                  onClose();
                  setTimeout(() => onSelect(n), 150);
                }}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={`Question ${n}, ${answered ? 'Answered' : 'Unanswered'}`}
              >
                <Text
                  style={[
                    styles.cellText,
                    { color: colors.textSecondary },
                    answered && [styles.cellTextAnswered, { color: colors.primary }],
                  ]}
                >
                  {n}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 90,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: DRAWER_HEIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sheetTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  legend: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 8,
  },
  cell: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellAnswered: {
    borderWidth: 1.5,
  },
  cellText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  cellTextAnswered: {
    fontWeight: '700',
  },
});
