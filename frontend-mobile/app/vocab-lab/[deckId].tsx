import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES, ROUTES } from '@/constants';
import { vocabLabApi } from '@/services/features.api';
import { EmptyState, Button } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
    header: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
    },
    headerTitle: {
      flex: 1,
      color: '#fff',
      fontSize: FONT_SIZES.lg,
      fontWeight: '700',
      marginHorizontal: SPACING.md,
    },
    addCardBtn: {
      width: 36,
      height: 36,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: RADIUS.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: SPACING.lg,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border },
    statVal: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: colors.text },
    statLabel: { fontSize: FONT_SIZES.xs, color: colors.textSecondary, marginTop: 2 },
    cardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: RADIUS.xl,
      marginBottom: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: SPACING.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 4,
      elevation: 1,
    },
    cardContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
    cardTexts: { flex: 1 },
    cardFront: { fontSize: FONT_SIZES.md, fontWeight: '700', color: colors.text, marginBottom: 2 },
    cardBack: { fontSize: FONT_SIZES.sm, color: colors.textSecondary },
    stateBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
    stateLabel: { fontSize: 10, fontWeight: '700' },
    deleteBtn: { padding: SPACING.sm },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modal: {
      backgroundColor: colors.card,
      borderTopLeftRadius: RADIUS.xl * 2,
      borderTopRightRadius: RADIUS.xl * 2,
      padding: SPACING.xl,
    },
    modalTitle: {
      fontSize: FONT_SIZES.lg,
      fontWeight: '800',
      color: colors.text,
      marginBottom: SPACING.lg,
    },
    modalFieldLabel: {
      fontSize: FONT_SIZES.sm,
      fontWeight: '700',
      color: colors.textSecondary,
      marginBottom: SPACING.xs,
    },
    modalInput: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
      fontSize: FONT_SIZES.md,
      color: colors.text,
      marginBottom: SPACING.md,
      minHeight: 80,
      textAlignVertical: 'top',
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: SPACING.md,
      marginTop: SPACING.sm,
    },
  });

export default function DeckDetailScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const [deck, setDeck] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchData = async () => {
    try {
      const [deckRes, cardsRes] = await Promise.allSettled([
        vocabLabApi.getDeckDetail(deckId),
        vocabLabApi.browseCards({ deckId }),
      ]);
      if (deckRes.status === 'fulfilled') setDeck(deckRes.value);
      if (cardsRes.status === 'fulfilled') setCards(cardsRes.value);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [deckId]);

  const handleAddCard = async () => {
    if (!front.trim() || !back.trim()) return;
    setAdding(true);
    try {
      await vocabLabApi.createFlashcard({ deckId, front: front.trim(), back: back.trim() });
      setFront('');
      setBack('');
      setAddModal(false);
      fetchData();
    } catch {
      Alert.alert('Error', 'Failed to add card.');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteCard = (cardId: string) => {
    Alert.alert('Delete Card?', 'This card will be permanently removed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await vocabLabApi.deleteFlashcard(cardId);
            fetchData();
          } catch {
            Alert.alert('Error', 'Failed to delete card.');
          }
        },
      },
    ]);
  };

  const STATE_COLORS: Record<string, string> = {
    New: COLORS.info,
    Learning: COLORS.warning,
    Review: colors.primary,
    Relearning: COLORS.error,
    Mastered: COLORS.success,
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  const dueCount = deck?.dueCount ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {deck?.name ?? 'Deck'}
        </Text>
        <TouchableOpacity style={styles.addCardBtn} onPress={() => setAddModal(true)}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Deck stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statVal}>{cards.length}</Text>
          <Text style={styles.statLabel}>Cards</Text>
        </View>
        <View style={[styles.statItem, styles.statMid]}>
          <Text style={[styles.statVal, { color: dueCount > 0 ? COLORS.error : COLORS.success }]}>
            {dueCount}
          </Text>
          <Text style={styles.statLabel}>Due</Text>
        </View>
        <View style={styles.statItem}>
          <Button
            title={dueCount > 0 ? `Study (${dueCount})` : 'All done ✓'}
            onPress={() =>
              dueCount > 0
                ? router.push(ROUTES.vocabLabStudy(deckId))
                : Alert.alert('All caught up! 🎉', 'No cards due.')
            }
            size="sm"
            variant={dueCount > 0 ? 'primary' : 'outline'}
          />
        </View>
      </View>

      {/* Card list */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchData();
            }}
          />
        }
      >
        {cards.length === 0 ? (
          <EmptyState
            icon="🃏"
            title="No cards yet"
            subtitle="Add your first flashcard to start studying."
            action={{ label: 'Add Card', onPress: () => setAddModal(true) }}
          />
        ) : (
          cards.map((card, i) => {
            const fv = card.fieldValues || {};
            const frontText = card.front || fv['Front'] || Object.values(fv)[0] || '—';
            const backText = card.back || fv['Back'] || Object.values(fv)[1] || '—';
            const state = card.state || 'New';
            const stateColor = STATE_COLORS[state] ?? colors.primary;

            return (
              <View
                key={card.id}
                style={[
                  styles.cardRow,
                  card.cardType?.templates?.[0]?.cardStyle
                    ? {
                        backgroundColor:
                          card.cardType.templates[0].cardStyle.backgroundColor || colors.card,
                      }
                    : null,
                ]}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardTexts}>
                    <Text
                      style={[
                        styles.cardFront,
                        card.cardType?.templates?.[0]?.cardStyle?.color
                          ? { color: card.cardType.templates[0].cardStyle.color }
                          : null,
                      ]}
                      numberOfLines={2}
                    >
                      {frontText}
                    </Text>
                    <Text
                      style={[
                        styles.cardBack,
                        card.cardType?.templates?.[0]?.cardStyle?.color
                          ? { color: card.cardType.templates[0].cardStyle.color, opacity: 0.7 }
                          : null,
                      ]}
                      numberOfLines={2}
                    >
                      {backText}
                    </Text>
                  </View>
                  <View style={[styles.stateBadge, { backgroundColor: stateColor + '1A' }]}>
                    <Text style={[styles.stateLabel, { color: stateColor }]}>{state}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteCard(card.id)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={card.cardType?.templates?.[0]?.cardStyle?.color || colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add card modal */}
      <Modal visible={addModal} transparent animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setAddModal(false)}>
          <Pressable style={styles.modal} onPress={() => {}}>
            <Text style={styles.modalTitle}>Add Flashcard</Text>
            <Text style={styles.modalFieldLabel}>Front</Text>
            <TextInput
              style={styles.modalInput}
              value={front}
              onChangeText={setFront}
              placeholder="Front side of card…"
              placeholderTextColor={colors.textMuted}
              multiline
            />
            <Text style={styles.modalFieldLabel}>Back</Text>
            <TextInput
              style={styles.modalInput}
              value={back}
              onChangeText={setBack}
              placeholder="Back side of card…"
              placeholderTextColor={colors.textMuted}
              multiline
            />
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => {
                  setAddModal(false);
                  setFront('');
                  setBack('');
                }}
              />
              <Button
                title="Add"
                onPress={handleAddCard}
                loading={adding}
                disabled={!front.trim() || !back.trim()}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
