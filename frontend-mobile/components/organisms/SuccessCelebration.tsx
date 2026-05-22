import React, { useEffect } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { spacing, radius, COLORS } from '@/constants';
import Text from '../atoms/Text';

interface SuccessCelebrationProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

const CONFETTI_COLORS = ['#FFC600', '#FF5733', '#33FF57', '#3357FF', '#F333FF'];
const CONFETTI_COUNT = 30;

export default function SuccessCelebration({
  visible,
  onClose,
  title = 'Congratulations!',
  message = 'Your exam has been submitted successfully!',
}: SuccessCelebrationProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 10, stiffness: 80 });
      opacity.value = withTiming(1, { duration: 300 });

      // Automatically close modal after 2.2s
      const timer = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 300 }, () => {
          scale.value = 0;
        });
        setTimeout(onClose, 300);
      }, 2200);

      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  const animatedCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Create scattered falling confetti
  const confettiArray = Array.from({ length: CONFETTI_COUNT }).map((_, index) => {
    const startX = Math.random() * 400 - 100;
    const endX = startX + (Math.random() * 100 - 50);
    const startY = -50 - Math.random() * 200;
    const endY = 800 + Math.random() * 200;
    const rotation = Math.random() * 360;

    const posY = useSharedValue(startY);
    const posX = useSharedValue(startX);
    const rot = useSharedValue(rotation);

    useEffect(() => {
      if (visible) {
        posY.value = startY;
        posX.value = startX;
        rot.value = rotation;

        posY.value = withTiming(endY, {
          duration: 2000 + Math.random() * 1000,
          easing: Easing.out(Easing.quad),
        });
        posX.value = withTiming(endX, {
          duration: 2000 + Math.random() * 1000,
          easing: Easing.out(Easing.quad),
        });
        rot.value = withTiming(rotation + 720, {
          duration: 2000 + Math.random() * 1000,
          easing: Easing.out(Easing.quad),
        });
      }
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateY: posY.value },
        { translateX: posX.value },
        { rotate: `${rot.value}deg` },
      ],
    }));

    const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
    const size = Math.random() * 10 + 6;

    return (
      <Animated.View
        key={index}
        style={[
          styles.confetti,
          {
            backgroundColor: color,
            width: size,
            height: size,
            borderRadius: index % 2 === 0 ? size / 2 : 2,
          },
          animatedStyle,
        ]}
      />
    );
  });

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, animatedContainerStyle]}>
        <View style={styles.backdrop} />

        {visible && confettiArray}

        <View style={styles.contentContainer}>
          <Animated.View style={[styles.circle, animatedCircleStyle]}>
            <Ionicons name="checkmark" size={60} color="#FFFFFF" />
          </Animated.View>

          <Text variant="headline" weight="bold" style={styles.title}>
            {title}
          </Text>
          <Text variant="body" color="textSecondary" style={styles.message}>
            {message}
          </Text>
        </View>
      </Animated.View>
    </Modal>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    contentContainer: {
      backgroundColor: colors.bgElevated || colors.card || '#FFFFFF',
      borderRadius: radius.xl || 24,
      padding: spacing[6],
      width: '85%',
      maxWidth: 340,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 15 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 15,
      zIndex: 100,
    },
    circle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: COLORS.success,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing[4],
      shadowColor: COLORS.success,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    },
    title: {
      textAlign: 'center',
      marginBottom: spacing[2],
      color: colors.text,
    },
    message: {
      textAlign: 'center',
      color: colors.textSecondary,
      lineHeight: 20,
    },
    confetti: {
      position: 'absolute',
      zIndex: 50,
    },
  });
}
