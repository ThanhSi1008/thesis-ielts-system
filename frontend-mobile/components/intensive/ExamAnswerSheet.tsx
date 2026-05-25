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
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { SPACING, RADIUS, FONT_SIZES } from '@/constants';

const DRAWER_HEIGHT = Math.min(Dimensions.get('window').height * 0.55, 420);

interface ExamAnswerSheetProps {
  open: boolean;
  onClose: () => void;
  totalQuestions: number;
  answers: Record<string, string>;
  onSelect: (n: number) => void;
  answeredSet?: Set<number>;
  flaggedSet?: Set<number>;
  onToggleFlag?: (n: number) => void;
}

export function ExamAnswerSheet({
  open,
  onClose,
  totalQuestions,
  answers,
  onSelect,
  answeredSet,
  flaggedSet,
  onToggleFlag,
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
  const answeredCount = answeredSet ? answeredSet.size : Object.keys(answers).length;
  const flaggedCount = flaggedSet ? flaggedSet.size : 0;

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
                {answeredCount} Ans
              </Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                {flaggedCount} Flag
              </Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: isDark ? colors.border : '#E5E7EB' }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                {Math.max(0, totalQuestions - answeredCount)} Unans
              </Text>
            </View>
          </View>
        </View>

        {/* Grid */}
        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {numbers.map((n) => {
            const answered = answeredSet ? answeredSet.has(n) : !!answers[String(n)];
            const flagged = flaggedSet ? flaggedSet.has(n) : false;
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
                  flagged && [
                    styles.cellFlagged,
                    { backgroundColor: '#F59E0B18', borderColor: '#F59E0B' },
                  ],
                ]}
                onPress={() => {
                  onClose();
                  setTimeout(() => onSelect(n), 150);
                }}
                onLongPress={() => {
                  if (onToggleFlag) {
                    onToggleFlag(n);
                  }
                }}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={`Question ${n}, ${answered ? 'Answered' : 'Unanswered'}${flagged ? ', Flagged' : ''}`}
                accessibilityHint="Double tap to navigate to question, long press to toggle flag"
              >
                <Text
                  style={[
                    styles.cellText,
                    { color: colors.textSecondary },
                    answered && [styles.cellTextAnswered, { color: colors.primary }],
                    flagged && [styles.cellTextFlagged, { color: '#F59E0B' }],
                  ]}
                >
                  {n}
                </Text>
                
                {flagged && (
                  <View style={styles.flagIconContainer}>
                    <Ionicons name="flag" size={10} color="#F59E0B" />
                  </View>
                )}
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
  cellFlagged: {
    borderWidth: 1.5,
  },
  cellText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  cellTextAnswered: {
    fontWeight: '700',
  },
  cellTextFlagged: {
    fontWeight: '700',
  },
  flagIconContainer: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
});
