import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, FONT_SIZES, SPACING } from '@/constants';

export interface RoadmapItem {
  id: string;
  title: string;
  type: 'lesson' | 'exercise';
  skill: string;
  url: string;
  isCompleted: boolean;
  isLocked: boolean;
  lessonId?: string;
}

const SKILL_COLOR: Record<string, string> = {
  Listening: '#E11D48',
  Reading:   '#2563EB',
  Writing:   '#D97706',
  Speaking:  '#7C3AED',
};

const SKILL_ICON: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  Listening: 'headset-outline',
  Reading:   'book-outline',
  Writing:   'create-outline',
  Speaking:  'mic-outline',
};

interface LessonRowProps {
  item: RoadmapItem;
  isNext: boolean;
  onPress: () => void;
}

export function LessonRow({ item, isNext, onPress }: LessonRowProps) {
  const skillColor = SKILL_COLOR[item.skill] ?? COLORS.primary;
  const skillIcon  = SKILL_ICON[item.skill]  ?? 'book-outline';

  return (
    <View style={styles.lessonRow}>
      {/* Timeline dot */}
      <View style={styles.dotCol}>
        {item.isCompleted ? (
          <View style={[styles.dot, { backgroundColor: '#16A34A' }]}>
            <Ionicons name="checkmark" size={11} color="#fff" />
          </View>
        ) : isNext ? (
          <View style={[styles.dot, { backgroundColor: '#D97706' }]}>
            <View style={styles.dotInner} />
          </View>
        ) : (
          <View style={[styles.dot, { backgroundColor: item.isLocked ? '#D1D5DB' : '#D1D5DB' }]}>
            {item.isLocked && <Ionicons name="lock-closed" size={9} color="#fff" />}
          </View>
        )}
      </View>

      {/* Card */}
      <TouchableOpacity
        style={[
          styles.lessonCard,
          isNext && styles.lessonCardNext,
          item.isCompleted && styles.lessonCardDone,
          item.isLocked && styles.lessonCardLocked,
        ]}
        onPress={item.isLocked ? undefined : onPress}
        activeOpacity={item.isLocked ? 1 : 0.8}
      >
        {/* Skill icon box */}
        <View style={[
          styles.skillIcon,
          { backgroundColor: isNext ? '#FFF0C2' : item.isCompleted ? '#DCFCE7' : '#F3F4F6' },
        ]}>
          <Ionicons
            name={item.isLocked ? 'lock-closed-outline' : skillIcon}
            size={18}
            color={item.isLocked ? '#9CA3AF' : isNext ? '#D97706' : item.isCompleted ? '#16A34A' : skillColor}
          />
        </View>

        {/* Text */}
        <View style={{ flex: 1 }}>
          <Text style={[styles.lessonTitle, item.isLocked && { color: COLORS.textMuted }]}>
            {item.title}
          </Text>
          <Text style={[styles.lessonMeta, { color: skillColor }]}>
            {item.skill} · {item.type === 'lesson' ? 'Theory' : 'Practice'}
          </Text>
        </View>

        {/* Action button */}
        {isNext && (
          <TouchableOpacity style={styles.resumeBtn} onPress={onPress}>
            <Ionicons name="play" size={12} color="#fff" />
            <Text style={styles.resumeText}>Resume</Text>
          </TouchableOpacity>
        )}
        {item.isCompleted && !isNext && (
          <TouchableOpacity style={styles.reviewBtn} onPress={onPress}>
            <Text style={styles.reviewText}>Review</Text>
          </TouchableOpacity>
        )}
        {item.isLocked && (
          <Ionicons name="bookmark-outline" size={16} color={COLORS.border} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  lessonRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.md },
  dotCol: { width: 20, alignItems: 'center', paddingTop: 12, marginLeft: -11, marginRight: SPACING.md },
  dot: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  dotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  lessonCard: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border,
    padding: SPACING.md,
  },
  lessonCardNext:   { borderColor: '#FFC107', backgroundColor: '#FFF9E6' },
  lessonCardDone:   { backgroundColor: '#FAFAFA' },
  lessonCardLocked: { opacity: 0.6 },
  skillIcon: {
    width: 36, height: 36, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  lessonTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  lessonMeta: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  resumeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#D97706', paddingHorizontal: SPACING.md, paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  resumeText: { color: '#fff', fontSize: FONT_SIZES.xs, fontWeight: '800' },
  reviewBtn: {
    paddingHorizontal: SPACING.sm, paddingVertical: 6,
    borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border,
  },
  reviewText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.xs, fontWeight: '700' },
});
