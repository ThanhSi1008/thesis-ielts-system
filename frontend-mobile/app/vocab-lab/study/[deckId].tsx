import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  Animated, PanResponder, Alert, Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { vocabLabApi } from '@/services/features.api';

const { width: SCREEN_W } = Dimensions.get('window');

// FSRS rating labels
const RATINGS = [
  { label: 'Again', value: 1, color: COLORS.error, emoji: '🔁' },
  { label: 'Hard', value: 2, color: COLORS.warning, emoji: '😓' },
  { label: 'Good', value: 3, color: COLORS.primary, emoji: '👍' },
  { label: 'Easy', value: 4, color: COLORS.success, emoji: '🎉' },
];

export default function StudySessionScreen() {
  const router = useRouter();
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const [cards, setCards] = useState<any[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ again: number; hard: number; good: number; easy: number }>({ again: 0, hard: 0, good: 0, easy: 0 });
  const [done, setDone] = useState(false);

  // Card flip animation
  const flipAnim = useRef(new Animated.Value(0)).current;
  const frontInterpolate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backInterpolate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  useEffect(() => {
    vocabLabApi.getStudyCards(deckId)
      .then(data => { setCards(data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [deckId]);

  const handleFlip = () => {
    if (flipped) return;
    setFlipped(true);
    Animated.spring(flipAnim, { toValue: 1, useNativeDriver: true, friction: 8 }).start();
  };

  const handleRating = async (rating: number) => {
    if (submitting) return;
    const card = cards[idx];

    // Update session results
    const key = ['again', 'hard', 'good', 'easy'][rating - 1] as keyof typeof sessionResults;
    setSessionResults(prev => ({ ...prev, [key]: prev[key] + 1 }));

    setSubmitting(true);
    try {
      await vocabLabApi.submitReview({ cardId: card.id, rating });
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }

    // Advance
    if (idx + 1 >= cards.length) {
      setDone(true);
    } else {
      setIdx(i => i + 1);
      setFlipped(false);
      flipAnim.setValue(0);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  const card = cards[idx];
  const progress = cards.length > 0 ? (idx / cards.length) * 100 : 0;

  // Done screen
  if (done) {
    const total = cards.length;
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.doneContainer}>
          <Text style={styles.doneTrophy}>🏆</Text>
          <Text style={styles.doneTitle}>Session Complete!</Text>
          <Text style={styles.doneSub}>You reviewed {total} card{total !== 1 ? 's' : ''}.</Text>

          <View style={styles.doneStats}>
            {RATINGS.map(r => {
              const count = sessionResults[r.label.toLowerCase() as keyof typeof sessionResults];
              return (
                <View key={r.value} style={styles.doneStat}>
                  <Text style={styles.doneStatEmoji}>{r.emoji}</Text>
                  <Text style={[styles.doneStatCount, { color: r.color }]}>{count}</Text>
                  <Text style={styles.doneStatLabel}>{r.label}</Text>
                </View>
              );
            })}
          </View>

          <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace('/vocab-lab' as any)}>
            <Text style={styles.doneBtnText}>Back to Decks</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (cards.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <Text style={{ fontSize: 48, marginBottom: SPACING.lg }}>🎉</Text>
          <Text style={styles.doneTitle}>All caught up!</Text>
          <Text style={styles.doneSub}>No cards due for review.</Text>
          <TouchableOpacity style={[styles.doneBtn, { marginTop: SPACING.xl }]} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const fieldValues = card.fieldValues || {};
  const front = card.front || fieldValues['Front'] || Object.values(fieldValues)[0] || '—';
  const back = card.back || fieldValues['Back'] || Object.values(fieldValues)[1] || '—';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
          </View>
          <Text style={styles.progressText}>{idx + 1} / {cards.length}</Text>
        </View>
      </View>

      {/* Card */}
      <View style={styles.cardArea}>
        <TouchableOpacity style={styles.cardWrapper} onPress={handleFlip} activeOpacity={0.95}>
          {/* Front */}
          <Animated.View style={[styles.card, { transform: [{ rotateY: frontInterpolate }] }]}>
            <Text style={styles.cardSide}>FRONT</Text>
            <Text style={styles.cardText}>{front}</Text>
            {!flipped && <Text style={styles.tapHint}>Tap to reveal</Text>}
          </Animated.View>

          {/* Back */}
          <Animated.View style={[styles.card, styles.cardBack, { transform: [{ rotateY: backInterpolate }] }]}>
            <Text style={[styles.cardSide, { color: COLORS.primary }]}>BACK</Text>
            <Text style={styles.cardText}>{back}</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Rating buttons — only show after flip */}
      {flipped ? (
        <View style={styles.ratingArea}>
          <Text style={styles.ratingLabel}>How well did you remember?</Text>
          <View style={styles.ratingRow}>
            {RATINGS.map(r => (
              <TouchableOpacity
                key={r.value}
                style={[styles.ratingBtn, { borderColor: r.color, backgroundColor: r.color + '14' }]}
                onPress={() => handleRating(r.value)}
                disabled={submitting}
                activeOpacity={0.8}
              >
                <Text style={styles.ratingEmoji}>{r.emoji}</Text>
                <Text style={[styles.ratingBtnLabel, { color: r.color }]}>{r.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.flipHintArea}>
          <Text style={styles.flipHintText}>Tap the card to flip and see the answer</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderColor: COLORS.border, gap: SPACING.md,
  },
  progressContainer: { flex: 1, gap: SPACING.xs },
  progressBg: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  progressText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, textAlign: 'right' },
  cardArea: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  cardWrapper: { width: SCREEN_W - SPACING.xl * 2 },
  card: {
    width: '100%', minHeight: 240,
    backgroundColor: '#fff', borderRadius: RADIUS.xl * 2,
    padding: SPACING.xxl, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 6,
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    position: 'absolute', top: 0, left: 0, right: 0,
    backgroundColor: '#F0F9FF',
  },
  cardSide: { fontSize: FONT_SIZES.xs, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1.5, marginBottom: SPACING.lg, textTransform: 'uppercase' },
  cardText: { fontSize: FONT_SIZES.xxl, fontWeight: '700', color: COLORS.text, textAlign: 'center', lineHeight: 36 },
  tapHint: { position: 'absolute', bottom: SPACING.lg, fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  ratingArea: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
  ratingLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.md, fontWeight: '600' },
  ratingRow: { flexDirection: 'row', gap: SPACING.sm },
  ratingBtn: {
    flex: 1, alignItems: 'center', paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl, borderWidth: 2,
  },
  ratingEmoji: { fontSize: 20, marginBottom: 4 },
  ratingBtnLabel: { fontSize: FONT_SIZES.xs, fontWeight: '800' },
  flipHintArea: { paddingBottom: SPACING.xxxl, alignItems: 'center' },
  flipHintText: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted },
  // Done screen
  doneContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  doneTrophy: { fontSize: 64, marginBottom: SPACING.lg },
  doneTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
  doneSub: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, marginTop: SPACING.sm, textAlign: 'center' },
  doneStats: { flexDirection: 'row', gap: SPACING.lg, marginTop: SPACING.xxl, marginBottom: SPACING.xxl },
  doneStat: { alignItems: 'center' },
  doneStatEmoji: { fontSize: 28, marginBottom: SPACING.xs },
  doneStatCount: { fontSize: FONT_SIZES.xl, fontWeight: '800' },
  doneStatLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  doneBtn: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.md, borderRadius: RADIUS.xl },
  doneBtnText: { color: '#fff', fontWeight: '800', fontSize: FONT_SIZES.md },
});
