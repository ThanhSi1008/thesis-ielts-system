import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, TextInput, Alert, RefreshControl, Modal, Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { vocabLabApi } from '@/services/features.api';
import { EmptyState, SectionHeader, Button } from '@/components/ui';

export default function VocabLabScreen() {
  const router = useRouter();
  const [decks, setDecks] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    try {
      const [decksRes, statsRes] = await Promise.allSettled([
        vocabLabApi.getDecks(),
        vocabLabApi.getStats(),
      ]);
      if (decksRes.status === 'fulfilled') setDecks(decksRes.value);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateDeck = async () => {
    if (!newDeckName.trim()) return;
    setCreating(true);
    try {
      await vocabLabApi.createDeck(newDeckName.trim());
      setNewDeckName('');
      setCreateModal(false);
      fetchData();
    } catch { Alert.alert('Error', 'Failed to create deck.'); }
    finally { setCreating(false); }
  };

  const handleDeleteDeck = (deck: any) => {
    Alert.alert('Delete Deck', `Delete "${deck.name}"? All cards will be lost.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await vocabLabApi.deleteDeck(deck.id);
            fetchData();
          } catch { Alert.alert('Error', 'Failed to delete deck.'); }
        }
      }
    ]);
  };

  const getDueColor = (dueCount: number) => {
    if (dueCount === 0) return COLORS.success;
    if (dueCount < 10) return COLORS.warning;
    return COLORS.error;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vocab Lab</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setCreateModal(true)}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats row */}
      {stats && (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{stats.totalCards ?? 0}</Text>
            <Text style={styles.statLabel}>Total Cards</Text>
          </View>
          <View style={[styles.statItem, styles.statMid]}>
            <Text style={[styles.statVal, { color: COLORS.error }]}>{stats.totalDue ?? 0}</Text>
            <Text style={styles.statLabel}>Due Today</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: COLORS.success }]}>{stats.totalLearned ?? 0}</Text>
            <Text style={styles.statLabel}>Learned</Text>
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
        >
          <SectionHeader
            title="My Decks"
            subtitle={`${decks.length} deck${decks.length !== 1 ? 's' : ''}`}
            right={
              <TouchableOpacity onPress={() => setCreateModal(true)} style={styles.newDeckBtn}>
                <Ionicons name="add" size={16} color={COLORS.primary} />
                <Text style={styles.newDeckBtnText}>New Deck</Text>
              </TouchableOpacity>
            }
          />

          {decks.length === 0 ? (
            <EmptyState
              icon="📦"
              title="No decks yet"
              subtitle="Create your first flashcard deck to get started."
              action={{ label: 'Create Deck', onPress: () => setCreateModal(true) }}
            />
          ) : (
            decks.map(deck => {
              const dueCount = deck.dueCount ?? 0;
              const totalCount = deck.totalCount ?? 0;
              const dueColor = getDueColor(dueCount);

              return (
                <TouchableOpacity
                  key={deck.id}
                  style={styles.deckCard}
                  onPress={() => router.push(`/vocab-lab/${deck.id}` as any)}
                  activeOpacity={0.85}
                >
                  {/* Deck icon */}
                  <View style={styles.deckIcon}>
                    <Text style={styles.deckIconEmoji}>📚</Text>
                  </View>

                  {/* Info */}
                  <View style={styles.deckInfo}>
                    <Text style={styles.deckName}>{deck.name}</Text>
                    <Text style={styles.deckMeta}>{totalCount} card{totalCount !== 1 ? 's' : ''}</Text>
                  </View>

                  {/* Due badge */}
                  <View style={styles.deckRight}>
                    {dueCount > 0 && (
                      <View style={[styles.dueBadge, { backgroundColor: dueColor + '18' }]}>
                        <Text style={[styles.dueCount, { color: dueColor }]}>{dueCount}</Text>
                        <Text style={[styles.dueLabel, { color: dueColor }]}>due</Text>
                      </View>
                    )}

                    {/* Study button */}
                    <TouchableOpacity
                      style={[styles.studyBtn, dueCount === 0 && styles.studyBtnDisabled]}
                      onPress={e => {
                        e.stopPropagation();
                        if (dueCount > 0) router.push(`/vocab-lab/study/${deck.id}` as any);
                        else Alert.alert('All caught up! 🎉', 'No cards due for review.');
                      }}
                    >
                      <Text style={[styles.studyBtnText, dueCount === 0 && styles.studyBtnTextDisabled]}>
                        {dueCount > 0 ? 'Study' : 'Done ✓'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleDeleteDeck(deck)} style={styles.deleteBtn}>
                      <Ionicons name="trash-outline" size={18} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Create deck modal */}
      <Modal visible={createModal} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setCreateModal(false)}>
          <Pressable style={styles.modal} onPress={() => {}}>
            <Text style={styles.modalTitle}>New Deck</Text>
            <TextInput
              style={styles.modalInput}
              value={newDeckName}
              onChangeText={setNewDeckName}
              placeholder="Deck name…"
              placeholderTextColor={COLORS.textMuted}
              autoFocus
              onSubmitEditing={handleCreateDeck}
            />
            <View style={styles.modalActions}>
              <Button title="Cancel" variant="ghost" onPress={() => { setCreateModal(false); setNewDeckName(''); }} />
              <Button title="Create" onPress={handleCreateDeck} loading={creating} disabled={!newDeckName.trim()} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  headerTitle: { flex: 1, color: '#fff', fontSize: FONT_SIZES.lg, fontWeight: '700', marginHorizontal: SPACING.md },
  addBtn: { width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  statsRow: {
    flexDirection: 'row', backgroundColor: '#fff',
    margin: SPACING.lg, borderRadius: RADIUS.xl, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: COLORS.border },
  statVal: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  newDeckBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  newDeckBtnText: { color: COLORS.primary, fontWeight: '600', fontSize: FONT_SIZES.sm },
  deckCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: RADIUS.xl, padding: SPACING.md,
    marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
    gap: SPACING.md,
  },
  deckIcon: { width: 48, height: 48, backgroundColor: COLORS.primary + '15', borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
  deckIconEmoji: { fontSize: 24 },
  deckInfo: { flex: 1 },
  deckName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  deckMeta: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  deckRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  dueBadge: { alignItems: 'center', paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.md },
  dueCount: { fontSize: FONT_SIZES.md, fontWeight: '800', lineHeight: 20 },
  dueLabel: { fontSize: 10, fontWeight: '600' },
  studyBtn: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2, borderRadius: RADIUS.md },
  studyBtnDisabled: { backgroundColor: COLORS.border },
  studyBtnText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZES.sm },
  studyBtnTextDisabled: { color: COLORS.textSecondary },
  deleteBtn: { padding: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: '#fff', width: '85%', borderRadius: RADIUS.xl, padding: SPACING.xl },
  modalTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.lg },
  modalInput: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: SPACING.md, fontSize: FONT_SIZES.md, color: COLORS.text, marginBottom: SPACING.lg },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.md },
});
