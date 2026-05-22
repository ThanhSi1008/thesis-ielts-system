import React, { useEffect } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { FONTS } from '@/constants';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  style?: any;
}

export default function AnimatedNumber({ value, duration = 600, style }: AnimatedNumberProps) {
  const { colors } = useTheme();
  const animatedValue = useSharedValue(value);

  useEffect(() => {
    animatedValue.value = withTiming(value, { duration });
  }, [value, duration]);

  const animatedProps = useAnimatedProps(() => {
    return {
      text: `${Math.round(animatedValue.value)}`,
    } as any;
  });

  return (
    <AnimatedTextInput
      underlineColorAndroid="transparent"
      editable={false}
      style={[
        styles.text,
        { color: colors.text },
        style,
      ]}
      animatedProps={animatedProps}
      defaultValue={`${value}`}
    />
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    padding: 0,
    margin: 0,
  },
});
