import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  RefreshControl,
  Modal,
  Pressable,
  DeviceEventEmitter,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { vocabLabApi } from '@/services/features.api';
import { EmptyState, Button } from '@/components/ui';

// ─── Deck action menu ─────────────────────────────────────────────────────────
type ActionMenuProps = {
  visible: boolean;
  deck: any;
  onClose: () => void;
  onRename: () => void;
  onDelete: () => void;
};

function DeckActionMenu({ visible, deck, onClose, onRename, onDelete }: ActionMenuProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={m.overlay} onPress={onClose}>
        <Pressable style={m.sheet} onPress={() => {}}>
          <Text style={m.title} numberOfLines={1}>
            {deck?.name}
          </Text>
          <TouchableOpacity style={m.item} onPress={onRename}>
            <Ionicons name="pencil-outline" size={20} color={COLORS.text} />
            <Text style={m.itemText}>Rename</Text>
          </TouchableOpacity>
          <TouchableOpacity style={m.item} onPress={onDelete}>
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            <Text style={[m.itemText, { color: COLORS.error }]}>Delete Deck</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              m.item,
              { borderTopWidth: 1, borderColor: COLORS.border, marginTop: SPACING.xs },
            ]}
            onPress={onClose}
          >
            <Text
              style={[
                m.itemText,
                { color: COLORS.textSecondary, fontWeight: '600', textAlign: 'center', flex: 1 },
              ]}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: RADIUS.xl * 1.5,
    borderTopRightRadius: RADIUS.xl * 1.5,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl + 16,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
  },
  itemText: { fontSize: FONT_SIZES.md, color: COLORS.text, fontWeight: '600' },
});

// ─── Rename modal ─────────────────────────────────────────────────────────────
type RenameModalProps = {
  visible: boolean;
  deck: any;
  onClose: () => void;
  onSaved: () => void;
};

function RenameDeckModal({ visible, deck, onClose, onSaved }: RenameModalProps) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && deck) setName(deck.name);
  }, [visible, deck]);

  const handleSave = async () => {
    if (!name.trim() || name.trim() === deck?.name) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      await vocabLabApi.renameDeck(deck.id, name.trim());
      onSaved();
      onClose();
    } catch {
      Alert.alert('Error', 'Could not rename deck. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={r.overlay} onPress={onClose}>
        <Pressable style={r.modal} onPress={() => {}}>
          <Text style={r.title}>Rename Deck</Text>
          <TextInput
            style={r.input}
            value={name}
            onChangeText={setName}
            placeholder="Deck name…"
            placeholderTextColor={COLORS.textMuted}
            autoFocus
            onSubmitEditing={handleSave}
            returnKeyType="done"
          />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.md }}>
            <Button title="Cancel" variant="ghost" onPress={onClose} />
            <Button title="Save" onPress={handleSave} loading={saving} disabled={!name.trim()} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const r = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: { backgroundColor: '#fff', width: '85%', borderRadius: RADIUS.xl, padding: SPACING.xl },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
});

// ─── Main DecksTab ─────────────────────────────────────────────────────────────
export function DecksTab() {
  const router = useRouter();
  const [decks, setDecks] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Create deck modal
  const [createModal, setCreateModal] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [creating, setCreating] = useState(false);

  // Action menu + rename modal
  const [actionDeck, setActionDeck] = useState<any>(null);
  const [renameModalVisible, setRenameModalVisible] = useState(false);

  const fetchData = async () => {
    try {
      const [dr, sr] = await Promise.allSettled([vocabLabApi.getDecks(), vocabLabApi.getStats()]);
      if (dr.status === 'fulfilled') setDecks(dr.value);
      if (sr.status === 'fulfilled') setStats(sr.value);
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const sub = DeviceEventEmitter.addListener('VOCAB_LAB_CARD_ADDED', () => {
      fetchData();
    });
    return () => sub.remove();
  }, []);

  const handleCreate = async () => {
    if (!newDeckName.trim()) return;
    setCreating(true);
    try {
      await vocabLabApi.createDeck(newDeckName.trim());
      setNewDeckName('');
      setCreateModal(false);
      fetchData();
    } catch {
      Alert.alert('Error', 'Failed to create deck.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (deck: any) => {
    setActionDeck(null);
    Alert.alert('Delete Deck', `Delete "${deck.name}"? All cards will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await vocabLabApi.deleteDeck(deck.id);
          fetchData();
        },
      },
    ]);
  };

  const openActionMenu = (deck: any) => setActionDeck(deck);

  if (loading)
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );

  return (
    <ScrollView
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
      {/* Global stats */}
      {stats && (
        <View style={s.statsRow}>
          {[
            ['Total', stats.totalCards ?? stats.totalCount ?? 0, COLORS.text],
            ['Due', stats.totalDue ?? stats.dueCount ?? 0, COLORS.error],
            ['Learned', stats.totalLearned ?? stats.reviewCount ?? 0, COLORS.success],
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

      {/* Deck list */}
      {decks.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No decks yet"
          subtitle="Create your first flashcard deck."
          action={{ label: 'Create Deck', onPress: () => setCreateModal(true) }}
        />
      ) : (
        decks.map((deck) => {
          const totalDue = (deck.dueCount ?? 0) + (deck.learningCount ?? 0);
          return (
            <View key={deck.id} style={s.deckCard}>
              {/* Deck info — tap → detail */}
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => router.push(`/vocab-lab/${deck.id}` as any)}
                activeOpacity={0.75}
              >
                <Text style={s.deckName}>{deck.name}</Text>
                <Text style={s.deckMeta}>{deck.totalCount ?? deck.totalCards ?? 0} cards</Text>
              </TouchableOpacity>

              {/* Counts */}
              <View style={s.countsRow}>
                <View style={s.countItem}>
                  <Text style={[s.countVal, { color: '#2563EB' }]}>{deck.newCount ?? 0}</Text>
                  <Text style={s.countLabel}>New</Text>
                </View>
                <View style={s.countItem}>
                  <Text style={[s.countVal, { color: '#F97316' }]}>{deck.learningCount ?? 0}</Text>
                  <Text style={s.countLabel}>Learn</Text>
                </View>
                <View style={s.countItem}>
                  <Text style={[s.countVal, { color: '#16A34A' }]}>{deck.dueCount ?? 0}</Text>
                  <Text style={s.countLabel}>Due</Text>
                </View>
              </View>

              {/* Action buttons */}
              <View style={s.deckActions}>
                {/* Study button — only shown if there are cards to study */}
                {totalDue > 0 || (deck.newCount ?? 0) > 0 ? (
                  <TouchableOpacity
                    style={s.studyBtn}
                    onPress={() => router.push(`/vocab-lab/study/${deck.id}` as any)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="play" size={14} color="#fff" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[s.studyBtn, { backgroundColor: COLORS.border }]}
                    onPress={() => router.push(`/vocab-lab/study/${deck.id}` as any)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="play" size={14} color={COLORS.textMuted} />
                  </TouchableOpacity>
                )}

                {/* More (⋯) button → action menu */}
                <TouchableOpacity onPress={() => openActionMenu(deck)} style={s.moreBtn}>
                  <Ionicons name="ellipsis-vertical" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}

      {/* Create Deck Modal */}
      <Modal visible={createModal} transparent animationType="fade">
        <Pressable style={s.overlay} onPress={() => setCreateModal(false)}>
          <Pressable style={s.modal} onPress={() => {}}>
            <Text style={s.modalTitle}>New Deck</Text>
            <TextInput
              style={s.modalInput}
              value={newDeckName}
              onChangeText={setNewDeckName}
              placeholder="Deck name…"
              placeholderTextColor={COLORS.textMuted}
              autoFocus
              onSubmitEditing={handleCreate}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.md }}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => {
                  setCreateModal(false);
                  setNewDeckName('');
                }}
              />
              <Button
                title="Create"
                onPress={handleCreate}
                loading={creating}
                disabled={!newDeckName.trim()}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Deck action menu (rename / delete) */}
      <DeckActionMenu
        visible={!!actionDeck}
        deck={actionDeck}
        onClose={() => setActionDeck(null)}
        onRename={() => {
          setActionDeck(null);
          setRenameModalVisible(true);
        }}
        onDelete={() => handleDelete(actionDeck)}
      />

      {/* Rename modal */}
      <RenameDeckModal
        visible={renameModalVisible}
        deck={actionDeck}
        onClose={() => setRenameModalVisible(false)}
        onSaved={fetchData}
      />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: FONT_SIZES.xxl, fontWeight: '800' },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  newDeckBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    alignSelf: 'flex-end',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  newDeckBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: FONT_SIZES.sm },

  // Deck card
  deckCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  deckName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  deckMeta: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },

  // SRS counts
  countsRow: { flexDirection: 'row', gap: SPACING.sm },
  countItem: { alignItems: 'center', minWidth: 28 },
  countVal: { fontWeight: '800', fontSize: FONT_SIZES.md },
  countLabel: {
    fontSize: 9,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '700',
  },

  // Action buttons
  deckActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    borderLeftWidth: 1,
    borderColor: COLORS.border,
    paddingLeft: SPACING.sm,
  },
  studyBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
  },

  // Modals
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: { backgroundColor: '#fff', width: '85%', borderRadius: RADIUS.xl, padding: SPACING.xl },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
});
