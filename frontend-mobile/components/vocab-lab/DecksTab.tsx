import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, TextInput, Alert, RefreshControl,
  Modal, Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { vocabLabApi } from '@/services/features.api';
import { EmptyState, Button } from '@/components/ui';

export function DecksTab() {
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
      const [dr, sr] = await Promise.allSettled([vocabLabApi.getDecks(), vocabLabApi.getStats()]);
      if (dr.status === 'fulfilled') setDecks(dr.value);
      if (sr.status === 'fulfilled') setStats(sr.value);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };
  
  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    if (!newDeckName.trim()) return;
    setCreating(true);
    try { 
      await vocabLabApi.createDeck(newDeckName.trim()); 
      setNewDeckName(''); 
      setCreateModal(false); 
      fetchData(); 
    }
    catch { Alert.alert('Error', 'Failed to create deck.'); }
    finally { setCreating(false); }
  };

  const handleDelete = (deck: any) => Alert.alert('Delete Deck', `Delete "${deck.name}"?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => { await vocabLabApi.deleteDeck(deck.id); fetchData(); } },
  ]);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <ScrollView contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 100 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}>
      {/* Stats row */}
      {stats && (
        <View style={s.statsRow}>
          {[
            ['Total', stats.totalCards ?? stats.totalCount ?? 0, COLORS.text],
            ['Due', stats.totalDue ?? stats.dueCount ?? 0, COLORS.error],
            ['Learned', stats.totalLearned ?? stats.reviewCount ?? 0, COLORS.success]
          ].map(([label, val, color]) => (
            <View key={label as string} style={s.statItem}>
              <Text style={[s.statVal, { color: color as string }]}>{val as number}</Text>
              <Text style={s.statLabel}>{label as string}</Text>
            </View>
          ))}
        </View>
      )}

      {/* New deck button */}
      <TouchableOpacity style={s.newDeckBtn} onPress={() => setCreateModal(true)}>
        <Ionicons name="add" size={18} color={COLORS.primary} />
        <Text style={s.newDeckBtnText}>New Deck</Text>
      </TouchableOpacity>

      {decks.length === 0
        ? <EmptyState 
            icon="📦" 
            title="No decks yet" 
            subtitle="Create your first flashcard deck." 
            action={{ label: 'Create Deck', onPress: () => setCreateModal(true) }} 
          />
        : decks.map(deck => {
          const due = deck.dueCount ?? 0;
          return (
            <TouchableOpacity key={deck.id} style={s.deckCard} onPress={() => router.push(`/vocab-lab/study/${deck.id}` as any)} activeOpacity={0.85}>
              <View style={{ flex: 1 }}>
                <Text style={s.deckName}>{deck.name}</Text>
                <Text style={s.deckMeta}>{deck.totalCount ?? deck.totalCards ?? 0} cards</Text>
              </View>
              
              <View style={{ flexDirection: 'row', gap: SPACING.md, marginRight: SPACING.sm }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#2563EB', fontWeight: '800', fontSize: FONT_SIZES.md }}>{deck.newCount ?? 0}</Text>
                  <Text style={{ fontSize: 9, color: COLORS.textSecondary, textTransform: 'uppercase', fontWeight: '700' }}>New</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#F97316', fontWeight: '800', fontSize: FONT_SIZES.md }}>{deck.learningCount ?? 0}</Text>
                  <Text style={{ fontSize: 9, color: COLORS.textSecondary, textTransform: 'uppercase', fontWeight: '700' }}>Learn</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#16A34A', fontWeight: '800', fontSize: FONT_SIZES.md }}>{due}</Text>
                  <Text style={{ fontSize: 9, color: COLORS.textSecondary, textTransform: 'uppercase', fontWeight: '700' }}>Due</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, borderLeftWidth: 1, borderColor: COLORS.border, paddingLeft: SPACING.sm }}>
                <TouchableOpacity onPress={() => handleDelete(deck)} style={{ padding: 4 }}><Ionicons name="trash-outline" size={18} color={COLORS.textMuted} /></TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })
      }

      <Modal visible={createModal} transparent animationType="fade">
        <Pressable style={s.overlay} onPress={() => setCreateModal(false)}>
          <Pressable style={s.modal} onPress={() => {}}>
            <Text style={s.modalTitle}>New Deck</Text>
            <TextInput style={s.modalInput} value={newDeckName} onChangeText={setNewDeckName} placeholder="Deck name…" placeholderTextColor={COLORS.textMuted} autoFocus onSubmitEditing={handleCreate} />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.md }}>
              <Button title="Cancel" variant="ghost" onPress={() => { setCreateModal(false); setNewDeckName(''); }} />
              <Button title="Create" onPress={handleCreate} loading={creating} disabled={!newDeckName.trim()} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  statsRow: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: RADIUS.xl, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.lg },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: FONT_SIZES.xxl, fontWeight: '800' },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  newDeckBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, alignSelf: 'flex-end', marginBottom: SPACING.md, paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.primary },
  newDeckBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: FONT_SIZES.sm },
  deckCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: RADIUS.xl, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.md },
  deckName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  deckMeta: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: '#fff', width: '85%', borderRadius: RADIUS.xl, padding: SPACING.xl },
  modalTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.lg },
  modalInput: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: SPACING.md, fontSize: FONT_SIZES.md, color: COLORS.text, marginBottom: SPACING.lg },
});
