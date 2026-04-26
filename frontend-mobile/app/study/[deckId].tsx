import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FlashcardViewer } from '../../features/vocab-lab/components/FlashcardViewer';
import { FSRSRatingBar } from '../../features/vocab-lab/components/FSRSRatingBar';
import { StudyEmptyState } from '../../features/vocab-lab/components/StudyEmptyState';
import { AppHeader } from '../../components/ui/AppHeader';

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
  const [isFinished, setIsFinished] = useState(false);

  if (isFinished) {
    return <StudyEmptyState />;
  }

  const currentCard = MOCK_CARDS[currentIndex];

  const handleRate = (rating: number) => {
    // Sẽ gọi API chấm điểm ở VOCAB-04
    console.log(`Card ${currentCard.id} rated: ${rating}`);
    
    if (currentIndex < MOCK_CARDS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsFinished(true);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <AppHeader 
        title="Study Session" 
        subtitle={`Card ${currentIndex + 1} of ${MOCK_CARDS.length}`}
        showBack 
        onBack={() => router.back()}
      />

      {/* Progress Bar */}
      <View className="h-1 bg-slate-100 w-full">
        <View 
          className="h-full bg-primary" 
          style={{ width: `${((currentIndex + 1) / MOCK_CARDS.length) * 100}%` }} 
        />
      </View>

      {/* Flashcard */}
      <View className="flex-1 justify-center">
        <FlashcardViewer 
          card={currentCard} 
          key={currentCard.id} 
        />
      </View>

      {/* Action Buttons */}
      <View className="pb-8">
        <FSRSRatingBar onRate={handleRate} />
      </View>
    </SafeAreaView>
  );
}
