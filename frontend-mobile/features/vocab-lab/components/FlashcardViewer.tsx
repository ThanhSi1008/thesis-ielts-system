import React, { useState } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withSpring,
//   interpolate,
// } from 'react-native-reanimated';
import { Flashcard } from '../types';

interface FlashcardViewerProps {
  card: Flashcard;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = 450;

export const FlashcardViewer = React.memo(({ card }: FlashcardViewerProps) => {
  // const isFlipped = useSharedValue(0);
  const [showBack, setShowBack] = useState(false);

  const flip = () => {
    // Tạm thời chỉ đổi state mà không có animation
    setShowBack(!showBack);
  };

  // Tạm thời vô hiệu hóa style animation
  const frontStyle = {}; 
  const backStyle = {};

  return (
    <View className="items-center justify-center py-10">
      <Pressable onPress={flip}>
        <View style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
          {/* Mặt trước */}
          {!showBack && (
            <View
              style={[frontStyle]}
              className="absolute w-full h-full bg-white rounded-3xl p-8 items-center justify-center border border-gray-100 shadow-xl"
            >
              <Text className="text-xs font-farro-bold text-slate-400 mb-4 uppercase tracking-widest">
                Front
              </Text>
              <Text className="text-3xl font-farro-bold text-center text-dark">
                {card.front}
              </Text>
              <View className="absolute bottom-8">
                <Text className="text-slate-300 text-xs font-farro-medium italic">Tap to see meaning</Text>
              </View>
            </View>
          )}

          {/* Mặt sau */}
          {showBack && (
            <View
              style={[backStyle]}
              className="absolute w-full h-full bg-light rounded-3xl p-8 items-center justify-center border border-primary/20 shadow-xl"
            >
              <Text className="text-xs font-farro-bold text-warning mb-4 uppercase tracking-widest">
                Back
              </Text>
              <Text className="text-xl leading-relaxed text-center text-dark font-farro-medium">
                {card.back}
              </Text>
              {card.tags.length > 0 && (
                <View className="flex-row flex-wrap justify-center mt-6 gap-2">
                  {card.tags.map((tag) => (
                    <View key={tag} className="bg-secondary px-3 py-1 rounded-full">
                      <Text className="text-[10px] font-farro-bold text-slate-600">#{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
});
