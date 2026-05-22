import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { spacing, radius, COLORS } from '@/constants';
import Text from '../atoms/Text';

const STORAGE_KEY = 'lastActiveLesson';

export interface LastLesson {
  name: string;
  route: string;
  timestamp: number;
}

export function saveLastActiveLesson(name: string, route: string) {
  const lesson: LastLesson = {
    name,
    route,
    timestamp: Date.now(),
  };
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lesson)).catch(() => {});
}

export default function ContinueLessonSnackbar() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const [lesson, setLesson] = useState<LastLesson | null>(null);

  const translateY = useSharedValue(150);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((data) => {
        if (data) {
          const parsed: LastLesson = JSON.parse(data);
          // Only show if the lesson was visited within the last 24 hours
          if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
            setLesson(parsed);
            translateY.value = withDelay(1000, withSpring(0, { damping: 15 }));
            
            // Automatically dismiss after 8 seconds
            const timer = setTimeout(() => {
              handleDismiss();
            }, 8000);
            return () => clearTimeout(timer);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleDismiss = () => {
    translateY.value = withTiming(150, { duration: 300 }, () => {
      setLesson(null);
    });
  };

  const handleContinue = () => {
    if (lesson) {
      router.push(lesson.route as any);
      handleDismiss();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!lesson) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.content}>
        <View style={styles.textWrapper}>
          <Text variant="caption" color="textSecondary" style={styles.subtext}>
            Continue where you left off
          </Text>
          <Text variant="body" weight="bold" style={styles.title} numberOfLines={1}>
            {lesson.name}
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable onPress={handleContinue} style={styles.btn}>
            <Text variant="body" weight="bold" color="primary">
              Go
            </Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </Pressable>

          <Pressable onPress={handleDismiss} style={styles.close}>
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: spacing[6] + 48, // safe from tabbar
      left: spacing[4],
      right: spacing[4],
      zIndex: 99,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 6,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.bgElevated || colors.card || '#FFFFFF',
      borderRadius: radius.lg || 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[4],
    },
    textWrapper: {
      flex: 1,
      marginRight: spacing[2],
    },
    subtext: {
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    title: {
      fontSize: 14,
      marginTop: 2,
      color: colors.text,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
    },
    btn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.primary + '15',
      borderRadius: radius.md,
      paddingVertical: spacing[2],
      paddingHorizontal: spacing[3],
      gap: 4,
    },
    close: {
      padding: spacing[1],
    },
  });
}
