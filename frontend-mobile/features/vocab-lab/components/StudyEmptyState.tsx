import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

/**
 * Màn hình hiển thị khi hoàn thành bộ từ vựng (Module 2 - VOCAB-03)
 */
export const StudyEmptyState = React.memo(() => {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center p-8 bg-white">
      <View className="w-24 h-24 bg-[#FFC600]/10 rounded-full items-center justify-center mb-6">
        <Ionicons name="checkmark-circle" size={64} color="#FFC600" />
      </View>
      
      <Text className="text-2xl font-bold text-[#212529] mb-2 text-center">
        Congratulations!
      </Text>
      
      <Text className="text-slate-500 text-center mb-10 leading-relaxed">
        You've finished all the cards in this session. Keep up the good work and come back later!
      </Text>

      <Pressable
        onPress={() => router.back()}
        className="bg-[#212529] w-full py-4 rounded-2xl items-center shadow-lg"
      >
        <Text className="text-white font-bold text-lg">Return to Deck List</Text>
      </Pressable>
    </View>
  );
});
