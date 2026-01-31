import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated, Dimensions } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import { vocabularyApi, VocabularyWord, UnitWithContent } from '../../../services/api';

const { width } = Dimensions.get('window');

export default function VocabularyLearningScreen() {
  const { bookId, unitId } = useLocalSearchParams<{ bookId: string; unitId: string }>();
  const [unit, setUnit] = useState<UnitWithContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (unitId) loadUnit();
  }, [unitId]);

  const loadUnit = async () => {
    try {
      setLoading(true);
      const data = await vocabularyApi.getUnit(unitId!);
      setUnit(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const flipCard = () => {
    if (isFlipped) {
      Animated.spring(flipAnim, {
        toValue: 0,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(flipAnim, {
        toValue: 1,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
    }
    setIsFlipped(!isFlipped);
  };

  const nextCard = () => {
    if (unit && currentIndex < unit.words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetCard();
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      resetCard();
    }
  };

  const resetCard = () => {
    flipAnim.setValue(0);
    setIsFlipped(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!unit || unit.words.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>Không có từ vựng</Text>
      </View>
    );
  }

  const currentWord = unit.words[currentIndex];
  
  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  return (
    <>
      <Stack.Screen options={{ title: unit.title }} />
      <View style={styles.container}>
        {/* Progress */}
        <View style={styles.progress}>
          <View style={[styles.progressBar, { width: `${((currentIndex + 1) / unit.words.length) * 100}%` }]} />
        </View>
        <Text style={styles.counter}>{currentIndex + 1} / {unit.words.length}</Text>

        {/* Flashcard */}
        <TouchableOpacity activeOpacity={0.9} onPress={flipCard} style={styles.cardContainer}>
          {/* Front - Word */}
          <Animated.View style={[styles.card, styles.cardFront, { transform: [{ rotateY: frontInterpolate }] }]}>
            <Text style={styles.wordText}>{currentWord.word}</Text>
            {currentWord.ipa && <Text style={styles.ipaText}>{currentWord.ipa}</Text>}
            {currentWord.partOfSpeech && (
              <View style={styles.posBadge}>
                <Text style={styles.posText}>{currentWord.partOfSpeech}</Text>
              </View>
            )}
            <Text style={styles.flipHint}>Nhấn để xem nghĩa</Text>
          </Animated.View>

          {/* Back - Meaning */}
          <Animated.View style={[styles.card, styles.cardBack, { transform: [{ rotateY: backInterpolate }] }]}>
            <Text style={styles.meaningText}>{currentWord.meaning}</Text>
            {currentWord.example && (
              <View style={styles.exampleBox}>
                <Text style={styles.exampleLabel}>Ví dụ:</Text>
                <Text style={styles.exampleText}>{currentWord.example}</Text>
              </View>
            )}
          </Animated.View>
        </TouchableOpacity>

        {/* Navigation */}
        <View style={styles.navigation}>
          <TouchableOpacity
            style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
            onPress={prevCard}
            disabled={currentIndex === 0}
          >
            <Text style={styles.navButtonText}>← Trước</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonPrimary, currentIndex === unit.words.length - 1 && styles.navButtonDisabled]}
            onPress={nextCard}
            disabled={currentIndex === unit.words.length - 1}
          >
            <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>Tiếp →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  progress: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, marginBottom: 8 },
  progressBar: { height: '100%', backgroundColor: '#3B82F6', borderRadius: 3 },
  counter: { textAlign: 'center', color: '#6B7280', marginBottom: 20 },
  cardContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    width: width - 40,
    height: 300,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backfaceVisibility: 'hidden',
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardFront: { backgroundColor: '#FFFFFF' },
  cardBack: { backgroundColor: '#3B82F6' },
  wordText: { fontSize: 36, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  ipaText: { fontSize: 20, color: '#6B7280', marginBottom: 12 },
  posBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  posText: { color: '#3B82F6', fontSize: 14 },
  flipHint: { position: 'absolute', bottom: 20, color: '#9CA3AF', fontSize: 13 },
  meaningText: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 16 },
  exampleBox: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 16, borderRadius: 12, marginTop: 8 },
  exampleLabel: { color: '#BFDBFE', fontSize: 13, marginBottom: 4 },
  exampleText: { color: '#FFFFFF', fontSize: 15, fontStyle: 'italic' },
  navigation: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  navButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  navButtonPrimary: { backgroundColor: '#3B82F6' },
  navButtonDisabled: { opacity: 0.5 },
  navButtonText: { fontSize: 16, fontWeight: '600', color: '#4B5563' },
  navButtonTextPrimary: { color: '#FFFFFF' },
});
