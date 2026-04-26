import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Deck } from '../types';
import { useRouter } from 'expo-router';

interface DeckCardProps {
  deck: Deck;
}

/**
 * Thẻ hiển thị thông tin bộ từ vựng (Chuẩn Design System Module 2)
 */
export const DeckCard = React.memo(({ deck }: DeckCardProps) => {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/study/${deck.id}`)}
      className="bg-white p-4 rounded-xl mb-4 border border-slate-100 shadow-sm"
    >
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-bold text-[#212529] flex-1">{deck.name}</Text>
        <View className="bg-[#FFC600] px-2 py-1 rounded-md">
          <Text className="text-xs font-bold">FSRS</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-4">
        <View>
          <Text className="text-xs text-slate-500">New</Text>
          <Text className="text-sm font-semibold text-blue-500">{deck.newCount}</Text>
        </View>
        <View>
          <Text className="text-xs text-slate-500">Learning</Text>
          <Text className="text-sm font-semibold text-orange-500">{deck.learningCount}</Text>
        </View>
        <View>
          <Text className="text-xs text-slate-500">Due</Text>
          <Text className="text-sm font-semibold text-green-500">{deck.dueCount}</Text>
        </View>
        <View className="ml-auto">
          <Text className="text-xs text-slate-500">Total</Text>
          <Text className="text-sm font-semibold">{deck.totalCards}</Text>
        </View>
      </View>
    </Pressable>
  );
});
