import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, FONT_SIZES, SPACING } from '@/constants';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

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

// Matches web's getSkillIcon()
const SKILL_ICON: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  Listening: 'headset-outline',
  Reading: 'book-outline',
  Writing: 'create-outline',
  Speaking: 'mic-outline',
};

interface LessonRowProps {
  item: RoadmapItem;
  isNext: boolean;
  onPress: () => void;
}

/** Matches web's RoadmapContent item card design exactly */
export function LessonRow({ item, isNext, onPress }: LessonRowProps) {
  const skillIcon = SKILL_ICON[item.skill] ?? 'book-outline';
  const { colors } = useTheme();

  // Icon background — matches web: next → #FFF0C2, completed → green-50, default → gray-50
  const iconBg = isNext ? '#FFF0C2' : item.isCompleted ? '#DCFCE7' : '#F3F4F6';
  const iconColor = isNext ? '#E0A800' : item.isCompleted ? '#16A34A' : '#9CA3AF';

  // Card border/bg — matches web: next → #FFF9E6 + #FFC107/40, default → white
  const cardStyle = [
    styles.card,
    { backgroundColor: colors.card, borderColor: colors.border },
    isNext && styles.cardNext,
    item.isCompleted && styles.cardDone,
    item.isLocked && styles.cardLocked,
  ];

  return (
    <Animated.View entering={FadeInRight.duration(400)} style={styles.row}>
      {/* Timeline dot — matches web dot indicator */}
      <View style={styles.dotCol}>
        {item.isCompleted ? (
          <View style={styles.dotCompleted}>
            <Ionicons name="checkmark" size={10} color="#fff" />
          </View>
        ) : isNext ? (
          // Next item: larger amber dot matching web's #FFC107
          <View style={styles.dotNext} />
        ) : (
          <View style={[styles.dotDefault, item.isLocked && styles.dotLocked]}>
            {item.isLocked && <Ionicons name="lock-closed" size={9} color="#fff" />}
          </View>
        )}
      </View>

      {/* Card */}
      <TouchableOpacity
        style={cardStyle}
        onPress={item.isLocked ? undefined : onPress}
        activeOpacity={item.isLocked ? 1 : 0.8}
      >
        {/* Skill icon box — matches web p-2.5 rounded-xl */}
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
          <Ionicons
            name={item.isLocked ? 'lock-closed-outline' : skillIcon}
            size={20}
            color={item.isLocked ? '#9CA3AF' : iconColor}
          />
        </View>

        {/* Text section */}
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }, isNext && styles.titleNext]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.meta}>
            {item.skill} · {item.type === 'lesson' ? 'Theory' : 'Practice'}
          </Text>
        </View>

        {/* Action buttons — matches web Resume / Review buttons */}
        {isNext && (
          <TouchableOpacity style={styles.resumeBtn} onPress={onPress}>
            <Ionicons name="play" size={13} color="#212529" />
            <Text style={styles.resumeText}>Resume</Text>
          </TouchableOpacity>
        )}
        {item.isCompleted && !isNext && (
          <TouchableOpacity style={styles.reviewBtn} onPress={onPress}>
            <Text style={styles.reviewText}>Review</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },

  // Dot column — sits alongside timeline line
  dotCol: {
    width: 22,
    alignItems: 'center',
    paddingTop: 14,
    marginLeft: -11,
    marginRight: SPACING.md,
  },
  dotCompleted: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  dotNext: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFC107',
    borderWidth: 3,
    borderColor: '#fff',
  },
  dotDefault: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#D6D6D6',
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotLocked: {
    backgroundColor: '#E5E7EB',
  },

  // Card — matches web's rounded-2xl border card
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: 16,
    borderCurve: 'continuous',
    borderWidth: 1,
    padding: SPACING.md,
  },
  cardNext: {
    backgroundColor: '#FFF9E6',
    borderColor: 'rgba(255,193,7,0.4)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
  },
  cardDone: {
    backgroundColor: '#FAFAFA',
  },
  cardLocked: {
    opacity: 0.55,
  },

  // Icon box — matches web's p-2.5 rounded-xl icon container
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // Title — matches web: next → font-extrabold, default → font-bold
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.sm,
    marginBottom: 3,
    lineHeight: 18,
  },
  titleNext: {
    fontFamily: FONTS.bold,
  },

  // Meta — matches web: uppercase tracking-widest font-bold text-gray-400
  meta: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },

  // Resume button — matches web: #FFC107 bg, dark text, rounded-xl
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFC107',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 8,
    borderRadius: 12,
    borderCurve: 'continuous',
    flexShrink: 0,
  },
  resumeText: {
    fontFamily: FONTS.bold,
    color: '#212529',
    fontSize: FONT_SIZES.xs,
  },

  // Review button — matches web: white bg, border-2 border-gray-100
  reviewBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 2,
    borderColor: '#F3F4F6',
    flexShrink: 0,
  },
  reviewText: {
    fontFamily: FONTS.bold,
    color: '#6B7280',
    fontSize: FONT_SIZES.xs,
  },
});
