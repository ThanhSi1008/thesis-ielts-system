import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { vocabLabApi } from '@/services/features.api';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { FlashcardViewer } from '@/components/vocab-lab/FlashcardViewer';
import { useTheme } from '@/contexts/ThemeContext';

// ─── Types ────────────────────────────────────────────────────────────────────
interface StudyCard {
  id: string;
  front: string;
  back: string;
  tags?: string[];
  cardState?: string;
  scheduledDays?: number;
  fieldValues?: Record<string, string>;
  cardType?: {
    fields: { id: string; name: string; order: number; fieldType: string }[];
    templates: {
      frontFields: string[];
      backFields: string[];
      cardStyle?: Record<string, string>;
      fieldStyles?: Record<string, any>;
    }[];
  } | null;
}

// ─── Rating config ─────────────────────────────────────────────────────────────
const RATINGS = [
  { label: 'Again', value: 1, color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  { label: 'Hard', value: 2, color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  { label: 'Good', value: 3, color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  { label: 'Easy', value: 4, color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
] as const;

// ─── Helper: derive display text from fieldValues or front/back ───────────────
function getDisplayText(card: StudyCard, side: 'front' | 'back'): string {
  const ct = card.cardType;
  if (ct?.templates?.[0] && card.fieldValues) {
    const fieldIds = side === 'front' ? ct.templates[0].frontFields : ct.templates[0].backFields;
    const parts = fieldIds
      .map((fid) => card.fieldValues?.[fid] ?? '')
      .filter((v) => v && !/^<(img|audio)/i.test(v)); // strip bare media tags
    if (parts.length > 0) return parts.join('\n');
  }
  return side === 'front' ? card.front || '' : card.back || '';
}

// ─── Flip Card ────────────────────────────────────────────────────────────────
const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W - SPACING.lg * 2;
const CARD_H = 320; // slightly taller to accommodate media

function FlipCard({
  card,
  showBack,
  onFlip,
}: {
  card: StudyCard;
  showBack: boolean;
  onFlip: () => void;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: showBack ? 1 : 0,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [showBack]);

  const frontRotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  const { colors } = useTheme();
  const styles = createStyles(colors);
  const tpl = card.cardType?.templates?.[0];
  const cardStyle = tpl?.cardStyle || {};

  const parseStyle = (st: any) => {
    if (!st) return {};
    const res = { ...st };
    if (res.fontSize && typeof res.fontSize === 'string') {
      res.fontSize = parseInt(res.fontSize.replace('px', ''), 10);
      if (isNaN(res.fontSize)) delete res.fontSize;
    }
    return res;
  };

  const containerStyle = parseStyle(cardStyle);

  return (
    <Pressable onPress={onFlip} style={{ width: CARD_W, minHeight: CARD_H }}>
      {/* Front face */}
      <Animated.View
        style={[
          styles.cardFace,
          containerStyle,
          { transform: [{ rotateY: frontRotate }], backfaceVisibility: 'hidden' },
        ]}
      >
        <Text
          style={[
            styles.cardSideLabel,
            containerStyle.color ? { color: containerStyle.color, opacity: 0.5 } : null,
          ]}
        >
          FRONT
        </Text>
        <FlashcardViewer card={card} side="front" width={CARD_W} cardStyle={cardStyle} />
        <Text
          style={[
            styles.tapHint,
            containerStyle.color ? { color: containerStyle.color, opacity: 0.4 } : null,
          ]}
        >
          Tap to reveal answer
        </Text>
      </Animated.View>

      {/* Back face */}
      <Animated.View
        style={[
          styles.cardFace,
          styles.cardFaceBack,
          containerStyle,
          { transform: [{ rotateY: backRotate }], backfaceVisibility: 'hidden' },
        ]}
      >
        <Text
          style={[
            styles.cardSideLabel,
            { color: containerStyle.color || COLORS.primary, opacity: 0.5 },
          ]}
        >
          BACK
        </Text>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            width: CARD_W - SPACING.xl * 2,
          }}
        >
          <FlashcardViewer card={card} side="back" width={CARD_W} cardStyle={cardStyle} />
        </ScrollView>
      </Animated.View>
    </Pressable>
  );
}

// ─── Interval label ───────────────────────────────────────────────────────────
function intervalLabel(rating: number, scheduledDays = 0): string {
  if (rating === 1) return '<10m';
  if (rating === 2)
    return scheduledDays > 0 ? `${Math.max(1, Math.round(scheduledDays * 1.2))}d` : '1d';
  if (rating === 3)
    return scheduledDays > 0 ? `${Math.max(2, Math.round(scheduledDays * 2.5))}d` : '3d';
  return scheduledDays > 0 ? `${Math.max(3, Math.round(scheduledDays * 3.5))}d` : '5d';
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

// ─── All Done screen ──────────────────────────────────────────────────────────
function AllDoneScreen({
  reviewed,
  deckId,
  timeSpentSeconds,
  ratingBreakdown,
  onStudyAgain,
  onGoBack,
}: {
  reviewed: number;
  deckId: string;
  timeSpentSeconds: number;
  ratingBreakdown: Record<number, number>;
  onStudyAgain: () => void;
  onGoBack: () => void;
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const ratingLabels: Record<number, { label: string; color: string; emoji: string }> = {
    1: { label: 'Again', color: '#DC2626', emoji: '🔴' },
    2: { label: 'Hard', color: '#F97316', emoji: '🟠' },
    3: { label: 'Good', color: '#16A34A', emoji: '🟢' },
    4: { label: 'Easy', color: '#2563EB', emoji: '🔵' },
  };

  const totalRatings = Object.values(ratingBreakdown).reduce((a, v) => a + v, 0);
  const hasBreakdown = totalRatings > 0;

  return (
    <Animated.View style={[styles.allDoneContainer, { opacity: fadeAnim }]}>
      <Animated.View style={[styles.allDoneCard, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.allDoneEmoji}>🎉</Text>
        <Text style={styles.allDoneTitle}>Session Complete!</Text>
        <Text style={styles.allDoneSubtitle}>
          You reviewed <Text style={{ fontWeight: '800', color: colors.primary }}>{reviewed}</Text>{' '}
          {reviewed === 1 ? 'card' : 'cards'}
          {timeSpentSeconds > 0 ? ` in ${formatDuration(timeSpentSeconds)}` : ''}.
        </Text>

        {/* Summary stats */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryVal}>{reviewed}</Text>
            <Text style={styles.summaryLabel}>Reviewed</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryVal}>{formatDuration(timeSpentSeconds)}</Text>
            <Text style={styles.summaryLabel}>Time</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryVal}>
              {reviewed > 0 ? formatDuration(Math.round(timeSpentSeconds / reviewed)) : '—'}
            </Text>
            <Text style={styles.summaryLabel}>Per card</Text>
          </View>
        </View>

        {/* Rating breakdown */}
        {hasBreakdown && (
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>Rating Breakdown</Text>
            {[1, 2, 3, 4].map((r) => {
              const cnt = ratingBreakdown[r] ?? 0;
              if (cnt === 0) return null;
              const meta = ratingLabels[r];
              const pct = totalRatings > 0 ? (cnt / totalRatings) * 100 : 0;
              return (
                <View key={r} style={styles.breakdownRow}>
                  <Text style={{ fontSize: 14 }}>{meta.emoji}</Text>
                  <Text style={[styles.breakdownLabel, { color: meta.color }]}>{meta.label}</Text>
                  <View style={styles.breakdownBarBg}>
                    <View
                      style={[
                        styles.breakdownBarFill,
                        { width: `${pct}%` as any, backgroundColor: meta.color + '50' },
                      ]}
                    />
                  </View>
                  <Text style={[styles.breakdownCount, { color: meta.color }]}>{cnt}</Text>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.allDoneActions}>
          <Pressable style={[styles.allDoneBtn, styles.allDoneBtnOutline]} onPress={onStudyAgain}>
            <Ionicons name="refresh" size={16} color={colors.primary} />
            <Text style={[styles.allDoneBtnText, { color: colors.primary }]}>Study Again</Text>
          </Pressable>
          <Pressable style={[styles.allDoneBtn, styles.allDoneBtnPrimary]} onPress={onGoBack}>
            <Ionicons name="checkmark" size={16} color={colors.onPrimary} />
            <Text style={[styles.allDoneBtnText, { color: colors.onPrimary }]}>Finish</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Main Study Screen ────────────────────────────────────────────────────────
export default function StudyScreen() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [cards, setCards] = useState<StudyCard[]>([]);
  const [index, setIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewed, setReviewed] = useState(0);
  const [done, setDone] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);
  const [ratingBreakdown, setRatingBreakdown] = useState<Record<number, number>>({});
  const [isEmpty, setIsEmpty] = useState(false);

  // Progress bar animation
  const progressAnim = useRef(new Animated.Value(0)).current;

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIndex(0);
    setShowBack(false);
    setDone(false);
    setReviewed(0);
    setRatingBreakdown({});
    setStartTime(Date.now());
    setIsEmpty(false);
    try {
      const data = await vocabLabApi.getStudyCards(deckId);
      setCards(data as StudyCard[]);
      if (data.length === 0) setIsEmpty(true);
    } catch {
      setError('Failed to load study cards. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // Animate progress bar when index changes
  useEffect(() => {
    if (cards.length === 0) return;
    Animated.timing(progressAnim, {
      toValue: (index + 1) / cards.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [index, cards.length]);

  const handleFlip = () => {
    Haptics.selectionAsync();
    setShowBack((prev) => !prev);
  };

  const handleRating = async (rating: number) => {
    const card = cards[index];
    if (!card || submitting) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSubmitting(true);
    try {
      await vocabLabApi.submitReview({ flashcardId: card.id, rating });
      const nextReviewed = reviewed + 1;
      setReviewed(nextReviewed);
      setRatingBreakdown((prev) => ({ ...prev, [rating]: (prev[rating] ?? 0) + 1 }));

      if (index + 1 >= cards.length) {
        // All cards done — record time
        setTimeSpentSeconds(Math.round((Date.now() - startTime) / 1000));
        setDone(true);
      } else {
        setIndex((prev) => prev + 1);
        setShowBack(false);
      }
    } catch {
      // Silent fail — advance anyway to avoid blocking the user
      setRatingBreakdown((prev) => ({ ...prev, [rating]: (prev[rating] ?? 0) + 1 }));
      if (index + 1 >= cards.length) {
        setTimeSpentSeconds(Math.round((Date.now() - startTime) / 1000));
        setDone(true);
      } else {
        setIndex((prev) => prev + 1);
        setShowBack(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const currentCard = cards[index];

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading cards…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={[styles.retryBtn, { backgroundColor: colors.primary }]} onPress={fetchCards}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ── Empty State ──────────────────────────────────────────────────────────────
  if (isEmpty) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Study Session</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={{ fontSize: 60, marginBottom: SPACING.md }}>🎉</Text>
          <Text style={styles.allDoneTitle}>All Caught Up!</Text>
          <Text
            style={[
              styles.allDoneSubtitle,
              { textAlign: 'center', marginTop: SPACING.md, paddingHorizontal: SPACING.xl },
            ]}
          >
            There are no more cards due for review right now. Great job!
          </Text>
          <View style={{ alignItems: 'center', width: '100%' }}>
            <Pressable
              style={[
                styles.allDoneBtn,
                styles.allDoneBtnPrimary,
                {
                  flex: 0,
                  width: 'auto',
                  minWidth: 160,
                  marginTop: SPACING.xl,
                  paddingHorizontal: SPACING.xl,
                  alignSelf: 'center',
                },
              ]}
              onPress={() => router.back()}
            >
              <Text style={[styles.allDoneBtnText, { color: colors.onPrimary }]}>Go Back</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── All Done ─────────────────────────────────────────────────────────────────
  if (done) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Study Session</Text>
          <View style={{ width: 40 }} />
        </View>
        <AllDoneScreen
          reviewed={reviewed}
          deckId={deckId}
          timeSpentSeconds={timeSpentSeconds}
          ratingBreakdown={ratingBreakdown}
          onStudyAgain={fetchCards}
          onGoBack={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  const progress = cards.length > 0 ? index / cards.length : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerClose}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Study Session</Text>
          <Text style={styles.headerSubtitle}>
            {index + 1} / {cards.length}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      {/* Card area */}
      <View style={styles.cardArea}>
        {currentCard && <FlipCard card={currentCard} showBack={showBack} onFlip={handleFlip} />}
      </View>

      {/* Action area */}
      <View style={styles.actionArea}>
        {!showBack ? (
          /* Show Answer button */
          <Pressable style={styles.showAnswerBtn} onPress={handleFlip}>
            <Ionicons name="eye-outline" size={18} color={colors.text} />
            <Text style={styles.showAnswerText}>Show Answer</Text>
          </Pressable>
        ) : (
          /* Rating buttons */
          <View style={styles.ratingsGrid}>
            {RATINGS.map((r) => (
              <Pressable
                key={r.value}
                style={[
                  styles.ratingBtn,
                  { backgroundColor: r.bg, borderColor: r.border },
                  submitting && styles.ratingBtnDisabled,
                ]}
                onPress={() => handleRating(r.value)}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={r.color} />
                ) : (
                  <>
                    <Text style={[styles.ratingLabel, { color: r.color }]}>{r.label}</Text>
                    <Text style={[styles.ratingInterval, { color: r.color }]}>
                      {intervalLabel(r.value, currentCard?.scheduledDays)}
                    </Text>
                  </>
                )}
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    headerClose: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: colors.text },
    headerSubtitle: { fontSize: FONT_SIZES.xs, color: colors.textSecondary, marginTop: 1 },

    // Progress
    progressTrack: { height: 4, backgroundColor: colors.border },
    progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },

    // Card
    cardArea: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.xl,
    },
    cardFace: {
      position: 'absolute',
      width: '100%',
      height: CARD_H,
      backgroundColor: colors.card,
      borderRadius: RADIUS.xl * 1.5,
      borderWidth: 1,
      borderColor: colors.border,
      padding: SPACING.xl,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    cardFaceBack: {
      backgroundColor: colors.surface,
      borderColor: colors.primary + '40',
    },
    cardSideLabel: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.textMuted,
      letterSpacing: 1.5,
      marginBottom: SPACING.md,
      textTransform: 'uppercase',
    },
    cardText: {
      fontSize: FONT_SIZES.xl,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      lineHeight: 30,
    },
    tapHint: {
      position: 'absolute',
      bottom: SPACING.lg,
      fontSize: FONT_SIZES.xs,
      color: colors.textMuted,
      fontStyle: 'italic',
    },
    tagsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: SPACING.xs,
      marginTop: SPACING.md,
    },
    tagChip: {
      backgroundColor: colors.border,
      paddingHorizontal: SPACING.sm,
      paddingVertical: 3,
      borderRadius: RADIUS.full,
    },
    tagText: { fontSize: 10, color: colors.textSecondary, fontWeight: '600' },

    // Action area
    actionArea: {
      paddingHorizontal: SPACING.lg,
      paddingBottom: SPACING.xl,
      paddingTop: SPACING.md,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderColor: colors.border,
    },

    // Show Answer
    showAnswerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.sm,
      backgroundColor: colors.background,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: RADIUS.xl,
      paddingVertical: SPACING.md,
    },
    showAnswerText: {
      fontSize: FONT_SIZES.md,
      fontWeight: '700',
      color: colors.text,
    },

    // Rating buttons
    ratingsGrid: {
      flexDirection: 'row',
      gap: SPACING.sm,
    },
    ratingBtn: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.lg,
      borderWidth: 1.5,
      minHeight: 60,
    },
    ratingBtnDisabled: { opacity: 0.5 },
    ratingLabel: {
      fontSize: FONT_SIZES.sm,
      fontWeight: '800',
      marginBottom: 2,
    },
    ratingInterval: {
      fontSize: 10,
      fontWeight: '600',
      opacity: 0.8,
    },

    // Loading / Error
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SPACING.md },
    loadingText: { fontSize: FONT_SIZES.md, color: colors.textSecondary },
    errorText: {
      fontSize: FONT_SIZES.md,
      color: COLORS.error,
      textAlign: 'center',
      paddingHorizontal: SPACING.xl,
    },
    retryBtn: {
      backgroundColor: colors.primary,
      borderRadius: RADIUS.lg,
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.md,
    },
    retryBtnText: { color: colors.onPrimary, fontWeight: '700', fontSize: FONT_SIZES.md },

    // All done
    allDoneContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.xl,
    },
    allDoneCard: {
      backgroundColor: colors.card,
      borderRadius: RADIUS.xl * 2,
      padding: SPACING.xl * 1.5,
      alignItems: 'center',
      width: '100%',
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 6,
    },
    allDoneEmoji: { fontSize: 56, marginBottom: SPACING.md },
    allDoneTitle: {
      fontSize: FONT_SIZES.xxl,
      fontWeight: '900',
      color: colors.text,
      marginBottom: SPACING.sm,
    },
    allDoneSubtitle: {
      fontSize: FONT_SIZES.md,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: SPACING.xl,
    },
    allDoneActions: { flexDirection: 'row', gap: SPACING.md, width: '100%' },
    allDoneBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.xs,
      paddingVertical: SPACING.md,
      borderRadius: RADIUS.xl,
    },
    allDoneBtnOutline: {
      borderWidth: 1.5,
      borderColor: colors.primary,
      backgroundColor: colors.card,
    },
    allDoneBtnPrimary: {
      backgroundColor: colors.primary,
    },
    allDoneBtnText: { fontWeight: '700', fontSize: FONT_SIZES.md },

    // Summary stats row
    summaryRow: {
      flexDirection: 'row',
      backgroundColor: colors.background,
      borderRadius: RADIUS.xl,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.sm,
      width: '100%',
      marginBottom: SPACING.lg,
    },
    summaryItem: { flex: 1, alignItems: 'center' },
    summaryVal: { fontSize: FONT_SIZES.lg, fontWeight: '900', color: colors.text },
    summaryLabel: { fontSize: FONT_SIZES.xs, color: colors.textSecondary, marginTop: 2 },
    summaryDivider: { width: 1, backgroundColor: colors.border, marginVertical: 4 },

    // Rating breakdown
    breakdownCard: {
      width: '100%',
      backgroundColor: colors.background,
      borderRadius: RADIUS.xl,
      borderWidth: 1,
      borderColor: colors.border,
      padding: SPACING.md,
      marginBottom: SPACING.lg,
    },
    breakdownTitle: {
      fontSize: FONT_SIZES.xs,
      fontWeight: '800',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: SPACING.sm,
    },
    breakdownRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      marginBottom: SPACING.xs,
    },
    breakdownLabel: { width: 48, fontSize: FONT_SIZES.xs, fontWeight: '700' },
    breakdownBarBg: {
      flex: 1,
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    breakdownBarFill: { height: '100%', borderRadius: 4 },
    breakdownCount: { width: 24, textAlign: 'right', fontSize: FONT_SIZES.sm, fontWeight: '800' },
  });
