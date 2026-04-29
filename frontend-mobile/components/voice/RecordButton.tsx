import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants';

interface RecordButtonProps {
  isRecording: boolean;
  isDisabled?: boolean;
  onPress: () => void;
  size?: number;
}

/**
 * Animated mic button with pulse ring while recording.
 * Triggers haptic on every state change.
 */
export const RecordButton: React.FC<RecordButtonProps> = ({
  isRecording,
  isDisabled = false,
  onPress,
  size = 72,
}) => {
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    if (isRecording) {
      pulseScale.value = withRepeat(
        withTiming(1.6, { duration: 900, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 450 }),
          withTiming(0, { duration: 450 })
        ),
        -1,
        false
      );
    } else {
      pulseScale.value = withTiming(1);
      pulseOpacity.value = withTiming(0);
    }
  }, [isRecording]);

  const handlePress = () => {
    if (isDisabled) return;
    // Bounce feedback
    buttonScale.value = withSequence(
      withTiming(0.88, { duration: 80 }),
      withTiming(1.05, { duration: 120 }),
      withTiming(1, { duration: 80 })
    );
    Haptics.impactAsync(
      isRecording
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Heavy
    );
    onPress();
  };

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const bgColor = isRecording ? COLORS.status.error : COLORS.primary;

  return (
    <View style={[styles.wrapper, { width: size * 2, height: size * 2 }]}>
      {/* Pulse ring */}
      <Animated.View
        style={[
          styles.pulse,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor },
          pulseStyle,
        ]}
      />

      {/* Main button */}
      <Animated.View style={buttonStyle}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handlePress}
          disabled={isDisabled}
          accessible
          accessibilityLabel={isRecording ? 'Stop recording' : 'Start recording'}
          accessibilityRole="button"
          style={[
            styles.button,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: isDisabled ? COLORS.border : bgColor,
            },
          ]}
        >
          <Ionicons
            name={isRecording ? 'stop' : 'mic'}
            size={size * 0.4}
            color={isRecording ? '#fff' : COLORS.onPrimary}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default RecordButton;
