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
      className="bg-white p-4 rounded-2xl mb-4 border border-gray-100 shadow-sm active:opacity-80"
    >
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-farro-bold text-dark flex-1">{deck.name}</Text>
        <View className="bg-primary px-2 py-1 rounded-lg shadow-sm">
          <Text className="text-[10px] font-farro-bold text-dark uppercase tracking-tighter">FSRS</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-6">
        <View>
          <Text className="text-[10px] font-farro-bold text-slate-400 uppercase">New</Text>
          <Text className="text-sm font-farro-bold text-info">{deck.newCount}</Text>
        </View>
        <View>
          <Text className="text-[10px] font-farro-bold text-slate-400 uppercase">Learning</Text>
          <Text className="text-sm font-farro-bold text-warning">{deck.learningCount}</Text>
        </View>
        <View>
          <Text className="text-[10px] font-farro-bold text-slate-400 uppercase">Due</Text>
          <Text className="text-sm font-farro-bold text-success">{deck.dueCount}</Text>
        </View>
        <View className="ml-auto">
          <Text className="text-[10px] font-farro-bold text-slate-400 uppercase text-right">Total</Text>
          <Text className="text-sm font-farro-bold text-dark text-right">{deck.totalCards}</Text>
        </View>
      </View>
    </Pressable>
  );
});
