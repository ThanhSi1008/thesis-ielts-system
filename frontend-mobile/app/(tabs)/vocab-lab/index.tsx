import React from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useDecks } from '../../../features/vocab-lab/hooks/useDecks';
import { DeckCard } from '../../../features/vocab-lab/components/DeckCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../../components/ui/AppHeader';

/**
 * Màn hình chính Vocab-Lab: Hiển thị danh sách các bộ từ vựng (Decks)
 */
export default function VocabLabScreen() {
  const { data: decks, isLoading, isError, refetch } = useDecks();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-light">
        <ActivityIndicator size="large" color="#FFC600" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-light" edges={['top']}>
      <AppHeader title="Vocab Lab" />
      
      <View className="px-4 py-6">
        <Text className="text-2xl font-farro-bold text-dark mb-1">Vocab Lab</Text>
        <Text className="text-slate-500 font-farro-medium mb-6">Master your IELTS vocabulary with FSRS</Text>

        {isError ? (
          <View className="bg-red-50 p-4 rounded-lg">
            <Text className="text-red-500 text-center">Failed to load decks. Please try again.</Text>
          </View>
        ) : (
          <FlatList
            data={decks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <DeckCard deck={item} />}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="items-center py-10">
                <Text className="text-slate-400">No decks found. Start by creating one!</Text>
              </View>
            }
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#FFC600" />
            }
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
