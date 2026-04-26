import React, { useState } from 'react';
import { View, Text, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FlashcardViewer } from '../../../features/vocab-lab/components/FlashcardViewer';

// Mock data cho việc test UI (Sẽ thay thế bằng hook useStudySession ở VOCAB-04)
const MOCK_CARDS = [
  {
    id: '1',
    deckId: 'default',
    front: 'Ubiquitous',
    back: 'Present, appearing, or found everywhere.\n\nExample: Mobile phones are ubiquitous nowadays.',
    tags: ['Vocabulary', 'IELTS'],
    due: new Date().toISOString(),
    cardState: 'LEARNING' as const,
    nextReviewDate: new Date().toISOString(),
  },
  {
    id: '2',
    deckId: 'default',
    front: 'Meticulous',
    back: 'Showing great attention to detail; very careful and precise.\n\nExample: He was meticulous in his preparation for the exam.',
    tags: ['Adjective', 'Writing'],
    due: new Date().toISOString(),
    cardState: 'NEW' as const,
    nextReviewDate: new Date().toISOString(),
  }
];

export default function StudyScreen() {
  const { deckId } = useLocalSearchParams();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentCard = MOCK_CARDS[currentIndex];

  const handleNext = () => {
    if (currentIndex < MOCK_CARDS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-2 border-b border-slate-100">
        <Pressable onPress={() => router.back()} className="p-2">
          <Ionicons name="close" size={24} color="#212529" />
        </Pressable>
        <View className="flex-1 items-center">
          <Text className="font-bold text-lg">Study Session</Text>
          <Text className="text-xs text-slate-500">
            Card {currentIndex + 1} of {MOCK_CARDS.length}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress Bar */}
      <View className="h-1 bg-slate-100 w-full">
        <View 
          className="h-full bg-[#FFC600]" 
          style={{ width: `${((currentIndex + 1) / MOCK_CARDS.length) * 100}%` }} 
        />
      </View>

      {/* Flashcard */}
      <View className="flex-1 justify-center">
        <FlashcardViewer card={currentCard} />
      </View>

      {/* Action Buttons (Placeholder for RatingBar VOCAB-03) */}
      <View className="p-6 mb-8 flex-row justify-between">
        <Pressable 
          onPress={handleNext}
          className="bg-[#212529] w-full py-4 rounded-xl items-center"
        >
          <Text className="text-white font-bold text-lg">Next Card</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
