import React from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { Flashcard } from '@/types';

interface FlashcardViewerProps {
  card: Flashcard;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = 450;

/**
 * Component hiển thị Flashcard với hiệu ứng lật 3D (Module 2 - VOCAB-02)
 * Sử dụng Reanimated để tối ưu hiệu năng.
 */
export const FlashcardViewer = React.memo(({ card }: FlashcardViewerProps) => {
  const isFlipped = useSharedValue(0);

  const flip = () => {
    isFlipped.value = withSpring(isFlipped.value === 0 ? 1 : 0, {
      damping: 15,
      stiffness: 90,
    });
  };

  const frontStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(isFlipped.value, [0, 1], [0, 180]);
    return {
      transform: [{ rotateY: `${rotateValue}deg` }],
      zIndex: isFlipped.value < 0.5 ? 1 : 0,
      opacity: isFlipped.value < 0.5 ? 1 : 0,
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(isFlipped.value, [0, 1], [180, 360]);
    return {
      transform: [{ rotateY: `${rotateValue}deg` }],
      zIndex: isFlipped.value >= 0.5 ? 1 : 0,
      opacity: isFlipped.value >= 0.5 ? 1 : 0,
    };
  });

  return (
    <View className="items-center justify-center py-10">
      <Pressable onPress={flip}>
        <View style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
          {/* Mặt trước */}
          <Animated.View
            style={[frontStyle]}
            className="absolute w-full h-full bg-white rounded-3xl p-8 items-center justify-center border border-slate-100 shadow-xl"
          >
            <Text className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">
              Front
            </Text>
            <Text className="text-3xl font-bold text-center text-[#212529]">
              {card.front}
            </Text>
            <View className="absolute bottom-8">
              <Text className="text-slate-300 text-xs italic">Tap to see meaning</Text>
            </View>
          </Animated.View>

          {/* Mặt sau */}
          <Animated.View
            style={[backStyle]}
            className="absolute w-full h-full bg-[#f8f9fa] rounded-3xl p-8 items-center justify-center border border-[#FFC600]/30 shadow-xl"
          >
            <Text className="text-xs font-bold text-[#FF9800] mb-4 uppercase tracking-widest">
              Back
            </Text>
            <Text className="text-xl leading-relaxed text-center text-[#212529]">
              {card.back}
            </Text>
            {card.tags && card.tags.length > 0 && (
              <View className="flex-row flex-wrap justify-center mt-6 gap-2">
                {card.tags.map((tag) => (
                  <View key={tag} className="bg-slate-200 px-3 py-1 rounded-full">
                    <Text className="text-[10px] font-bold text-slate-600">#{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>
        </View>
      </Pressable>
    </View>
  );
});
