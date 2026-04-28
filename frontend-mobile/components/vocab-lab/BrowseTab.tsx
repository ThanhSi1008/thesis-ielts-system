import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, TextInput, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { vocabLabApi } from '@/services/features.api';
import { EmptyState } from '@/components/ui';

export function BrowseTab() {
  const [decks, setDecks] = useState<any[]>([]);
  const [deckId, setDeckId] = useState('');
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { vocabLabApi.getDecks().then(d => setDecks(d)).catch(() => {}); }, []);

  useEffect(() => {
    if (!deckId) { setCards([]); return; }
    setLoading(true);
    vocabLabApi.browseCards(deckId).then(setCards).catch(() => {}).finally(() => setLoading(false));
  }, [deckId]);

  const filtered = cards.filter(c => (c.front + ' ' + c.back).toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={{ flex: 1 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.deckPillBar}>
        {[{ id: '', name: 'All' }, ...decks].map(d => (
          <TouchableOpacity key={d.id} style={[s.deckPill, deckId === d.id && s.deckPillActive]} onPress={() => setDeckId(d.id)}>
            <Text style={[s.deckPillText, deckId === d.id && { color: COLORS.primary }]}>{d.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={s.searchBox}>
        <Ionicons name="search" size={16} color={COLORS.textMuted} />
        <TextInput style={s.searchInput} value={search} onChangeText={setSearch} placeholder="Search cards…" placeholderTextColor={COLORS.textMuted} />
      </View>
      {loading ? <View style={s.center}><ActivityIndicator color={COLORS.primary} /></View> :
        <ScrollView contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 100 }}>
          {filtered.length === 0
            ? <EmptyState icon="🃏" title="No cards" subtitle={deckId ? "No cards in this deck." : "Select a deck above."} />
            : filtered.map(c => (
              <View key={c.id} style={s.cardRow}>
                <View style={{ flex: 1, paddingRight: SPACING.sm }}>
                  <Text style={s.cardFront} numberOfLines={2}>{c.front}</Text>
                  {c.back ? <Text style={s.cardBack} numberOfLines={2}>{c.back}</Text> : null}
                </View>
                <View style={{ alignItems: 'flex-end', gap: SPACING.sm }}>
                  <View style={[s.statePill, { backgroundColor: c.state === 'review' ? '#DCFCE7' : c.state === 'learning' ? '#FEF9C3' : '#EFF6FF' }]}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: c.state === 'review' ? '#16A34A' : c.state === 'learning' ? '#CA8A04' : '#2563EB' }}>
                      {c.state ?? 'new'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert('Delete Card', 'Are you sure you want to delete this card?', [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete', style: 'destructive', onPress: async () => {
                            try {
                              await vocabLabApi.deleteFlashcard(c.id);
                              setCards(cards.filter(card => card.id !== c.id));
                            } catch {
                              Alert.alert('Error', 'Failed to delete card.');
                            }
                          }
                        }
                      ]);
                    }}
                    style={{ padding: 4 }}
                  >
                    <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          }
        </ScrollView>
      }
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  deckPillBar: { maxHeight: 52, borderBottomWidth: 1, borderColor: COLORS.border },
  deckPill: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.border, marginHorizontal: 4, marginVertical: SPACING.sm, backgroundColor: '#fff' },
  deckPillActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '12' },
  deckPillText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textSecondary },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, margin: SPACING.md, backgroundColor: '#fff', borderRadius: RADIUS.xl, paddingHorizontal: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, paddingVertical: SPACING.sm, fontSize: FONT_SIZES.md, color: COLORS.text },
  cardRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.md },
  cardFront: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  cardBack: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  statePill: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.sm },
});
