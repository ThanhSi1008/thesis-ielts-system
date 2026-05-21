/**
 * Pronunciation Stack Layout
 * index  → IPA chart
 * [symbol] → sound detail + practice screen
 */
import { Stack } from 'expo-router';
import { COLORS } from '@/constants';

export default function PronunciationLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.background } }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="[symbol]"
        options={{
          animation: 'slide_from_right',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
