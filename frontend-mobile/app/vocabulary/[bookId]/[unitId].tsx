import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Animated, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { vocabularyApi } from '@/services/ielts.api';

// ─── Theme ────────────────────────────────────────────────────────────────────
const THEME = {
  P: '#FFC600',
  FG1: '#212529',
  FG2: '#64748b',
  FG3: '#9ca3af',
  BDR: '#e5e7eb',
  SRF: '#f8f9fa',
  WH: '#ffffff',
  BLU: '#2196F3',
};

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'flashcard' | 'exercise' | 'reading';

interface Word {
  id: string;
  word: string;
  pronunciation?: string;
  partOfSpeech?: string;
  definition: string;
  exampleSentence?: string;
  imageUrl?: string;
}

interface Exercise {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

// ─── Flashcard component ──────────────────────────────────────────────────────
function FlashCard({ 
  word, onEvaluate 
}: { 
  word: Word; 
  onEvaluate: (rating: 'again' | 'hard' | 'good' | 'easy') => void;
}) {
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [flipped, setFlipped] = useState(false);

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  const flip = () => {
    if (flipped) return; // Prevent flipping back immediately to let user read
    Animated.spring(flipAnim, {
      toValue: 1,
      friction: 8, tension: 10, useNativeDriver: true,
    }).start();
    setFlipped(true);
  };

  // Reset when word changes
  useEffect(() => {
    flipAnim.setValue(0);
    setFlipped(false);
  }, [word.id]);

  return (
    <View style={fc.wrap}>
      <TouchableOpacity onPress={flip} activeOpacity={0.95} style={{ flex: 1 }}>
        {/* Front */}
        <Animated.View style={[fc.card, fc.cardFront, { transform: [{ rotateY: frontRotate }] }, flipped && { zIndex: 0 }]}>
          {/* Tags */}
          <View style={fc.cardHeader}>
            {word.partOfSpeech ? (
              <View style={fc.posBadge}>
                <Text style={fc.posText}>{word.partOfSpeech}</Text>
              </View>
            ) : <View />}
            <TouchableOpacity style={fc.audioBtn}>
              <Ionicons name="volume-high" size={22} color={THEME.FG2} />
            </TouchableOpacity>
          </View>

          {/* Word */}
          <View style={fc.cardBody}>
            <Text style={fc.wordText}>{word.word}</Text>
            {word.pronunciation ? (
              <Text style={fc.pronText}>{word.pronunciation}</Text>
            ) : null}
          </View>

          <Text style={fc.hintText}>Tap to see meaning</Text>
        </Animated.View>

        {/* Back */}
        <Animated.View style={[fc.card, fc.cardBack, { transform: [{ rotateY: backRotate }] }, !flipped && { zIndex: -1 }]}>
           <View style={fc.cardHeader}>
            {word.partOfSpeech ? (
              <View style={fc.posBadge}>
                <Text style={fc.posText}>{word.partOfSpeech}</Text>
              </View>
            ) : <View />}
            <TouchableOpacity style={fc.audioBtn}>
              <Ionicons name="volume-high" size={22} color={THEME.FG2} />
            </TouchableOpacity>
          </View>

          <View style={[fc.cardBody, { paddingVertical: 10 }]}>
            <Text style={fc.wordTextSmall}>{word.word}</Text>
            <Text style={fc.defText}>{word.definition}</Text>
            
            {word.exampleSentence && (
              <View style={fc.exampleBox}>
                <Text style={fc.exampleText}>"{word.exampleSentence}"</Text>
              </View>
            )}
          </View>
        </Animated.View>
      </TouchableOpacity>

      {/* Action buttons (only visible when flipped) */}
      {flipped && (
        <View style={fc.srsActions}>
          <TouchableOpacity style={[fc.srsBtn, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]} onPress={() => onEvaluate('again')}>
            <Text style={[fc.srsLabel, { color: '#EF4444' }]}>Again</Text>
            <Text style={[fc.srsTime, { color: '#F87171' }]}>&lt;1m</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[fc.srsBtn, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]} onPress={() => onEvaluate('hard')}>
            <Text style={[fc.srsLabel, { color: '#F97316' }]}>Hard</Text>
            <Text style={[fc.srsTime, { color: '#FDBA74' }]}>10m</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[fc.srsBtn, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]} onPress={() => onEvaluate('good')}>
            <Text style={[fc.srsLabel, { color: '#0EA5E9' }]}>Good</Text>
            <Text style={[fc.srsTime, { color: '#7DD3FC' }]}>1d</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[fc.srsBtn, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]} onPress={() => onEvaluate('easy')}>
            <Text style={[fc.srsLabel, { color: '#22C55E' }]}>Easy</Text>
            <Text style={[fc.srsTime, { color: '#86EFAC' }]}>4d</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
const fc = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  card: {
    flex: 1, backgroundColor: THEME.WH, borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: THEME.BDR,
    backfaceVisibility: 'hidden', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.06, shadowRadius: 32, elevation: 6,
  },
  cardFront: { zIndex: 1 },
  cardBack: { zIndex: 0 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  posBadge: { backgroundColor: 'rgba(33,150,243,0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  posText: { color: THEME.BLU, fontSize: 11, fontFamily: 'Farro-Bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  audioBtn: { padding: 4 },
  
  cardBody: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  wordText: { fontSize: 32, fontFamily: 'Farro-Bold', color: THEME.FG1, letterSpacing: -0.5, textAlign: 'center' },
  wordTextSmall: { fontSize: 24, fontFamily: 'Farro-Bold', color: THEME.FG1, marginBottom: 16, textAlign: 'center' },
  pronText: { fontSize: 15, color: THEME.FG3, marginTop: 6, fontFamily: 'monospace' },
  hintText: { textAlign: 'center', color: THEME.FG3, fontSize: 12, fontFamily: 'Farro-Regular', marginTop: 'auto' },
  
  defText: { fontSize: 16, color: THEME.FG1, textAlign: 'center', lineHeight: 26, fontFamily: 'Farro-Medium' },
  exampleBox: { marginTop: 24, padding: 16, backgroundColor: THEME.SRF, borderRadius: 16, width: '100%' },
  exampleText: { fontSize: 14, color: THEME.FG2, textAlign: 'center', lineHeight: 22, fontStyle: 'italic' },
  
  srsActions: { flexDirection: 'row', gap: 10, marginTop: 24 },
  srsBtn: { flex: 1, borderWidth: 1, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  srsLabel: { fontFamily: 'Farro-Bold', fontSize: 15 },
  srsTime: { fontFamily: 'Farro-Medium', fontSize: 11, marginTop: 2 },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function VocabularyUnitScreen() {
  const router = useRouter();
  const { bookId, unitId } = useLocalSearchParams<{ bookId: string; unitId: string }>();

  const [unit, setUnit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('flashcard');

  // Flashcard state
  const [cardIndex, setCardIndex] = useState(0);
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    try {
      const data = await vocabularyApi.getUnit(unitId!);
      setUnit(data);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [unitId]);

  useEffect(() => { load(); }, [load]);

  const words: Word[] = unit?.words ?? [];
  const exercises: Exercise[] = unit?.exercises ?? [];

  const handleEvaluate = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
    // Basic progression logic (all ratings advance the card for now)
    const word = words[cardIndex];
    const newKnown = new Set(knownIds);
    if (rating === 'good' || rating === 'easy') {
      newKnown.add(word.id);
      setKnownIds(newKnown);
    }
    
    try {
      await vocabularyApi.updateWordProgress(unitId!, newKnown.size);
    } catch { /* silent */ }
    
    if (cardIndex < words.length - 1) {
      setCardIndex(cardIndex + 1);
    } else {
      Alert.alert('🎉 Unit Complete!', `You finished learning this set.`, [
        { text: 'Try Exercises', onPress: () => setActiveTab('exercise') },
        { text: 'Done', onPress: () => router.back() },
      ]);
    }
  };

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'flashcard', label: 'Flashcards', icon: 'albums-outline' },
    { key: 'exercise', label: 'Exercises', icon: 'pencil-outline' },
    { key: 'reading', label: 'Reading', icon: 'book-outline' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={28} color={THEME.FG1} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Loading…</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.center}><ActivityIndicator size="large" color={THEME.P} /></View>
      </SafeAreaView>
    );
  }

  const reading = unit?.reading;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={28} color={THEME.FG1} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{unit?.title ?? 'Unit'}</Text>
          <Text style={styles.headerSub}>{cardIndex + 1} / {words.length || 1} words</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>
      
      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${words.length > 0 ? ((cardIndex + 1) / words.length) * 100 : 0}%` }]} />
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {tabs.map(tab => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, active && styles.tabItemActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons name={tab.icon} size={16} color={active ? THEME.P : THEME.FG3} />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* ── Flashcard tab */}
        {activeTab === 'flashcard' && (
          words.length === 0 ? (
            <View style={styles.center}>
              <Text style={{ fontSize: 32 }}>📭</Text>
              <Text style={styles.emptyText}>No flashcards available yet.</Text>
            </View>
          ) : (
            <FlashCard
              word={words[cardIndex]}
              onEvaluate={handleEvaluate}
            />
          )
        )}

        {/* ── Exercise tab (minimal styling to match) */}
        {activeTab === 'exercise' && (
          <View style={styles.center}>
            <Text style={{ fontSize: 32 }}>🚧</Text>
            <Text style={styles.emptyText}>Exercises coming soon in new design.</Text>
          </View>
        )}

        {/* ── Reading tab (minimal styling to match) */}
        {activeTab === 'reading' && (
          !reading ? (
            <View style={styles.center}>
              <Text style={{ fontSize: 32 }}>📖</Text>
              <Text style={styles.emptyText}>No reading passage for this unit.</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ padding: 20 }}>
              <Text style={styles.readingTitle}>{reading.title}</Text>
              {(reading.paragraphs ?? reading.text ?? []).map((para: string, i: number) => (
                <Text key={i} style={styles.readingPara}>{para}</Text>
              ))}
            </ScrollView>
          )
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.SRF },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyText: { fontSize: 14, color: THEME.FG3, textAlign: 'center', fontFamily: 'Farro-Regular' },
  
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: THEME.WH,
  },
  closeBtn: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontFamily: 'Farro-Bold', color: THEME.FG1 },
  headerSub: { fontSize: 12, color: THEME.FG3, marginTop: 2, fontFamily: 'Farro-Medium' },
  
  progressBar: { height: 3, backgroundColor: THEME.BDR },
  progressFill: { height: '100%', backgroundColor: '#22C55E' },
  
  tabBar: {
    flexDirection: 'row', backgroundColor: THEME.WH,
    borderBottomWidth: 1, borderColor: THEME.BDR,
  },
  tabItem: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabItemActive: { borderBottomColor: THEME.P },
  tabLabel: { fontSize: 12, color: THEME.FG3, fontFamily: 'Farro-Medium' },
  tabLabelActive: { color: THEME.FG1, fontFamily: 'Farro-Bold' },
  
  content: { flex: 1 },
  
  readingTitle: { fontSize: 20, fontFamily: 'Farro-Bold', color: THEME.FG1, marginBottom: 16 },
  readingPara: { fontSize: 14, color: THEME.FG1, lineHeight: 24, marginBottom: 16, fontFamily: 'Farro-Regular' },
});
