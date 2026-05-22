import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Modal,
  Pressable,
  DeviceEventEmitter,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { vocabLabApi } from '@/services/features.api';
import { Button } from '../atoms';
import { EmptyState } from '../molecules';
import { DeckCardSkeleton } from '../skeletons';
import ConfirmDialog from '../organisms/ConfirmDialog';
import { toast } from '@/components/ui';
import { EmptyStates } from '@/assets/empty-states';
import { useTheme } from '@/contexts/ThemeContext';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { PublishDeckModal } from './PublishDeckModal';
import { ImportDeckModal } from './ImportDeckModal';
type ActionMenuProps = {
  visible: boolean;
  deck: any;
  onClose: () => void;
  onRename: () => void;
  onDelete: () => void;
  onPublish: () => void;
};

function DeckActionMenu({
  visible,
  deck,
  onClose,
  onRename,
  onDelete,
  onPublish,
}: ActionMenuProps) {
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
          <TouchableOpacity style={m.item} onPress={onPublish}>
            <Ionicons name="earth-outline" size={20} color={COLORS.primary} />
            <Text style={m.itemText}>Publish to Marketplace</Text>
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
      toast.error('Error', 'Could not rename deck. Please try again.');
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
  const { colors } = useTheme();
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
  const [publishModalVisible, setPublishModalVisible] = useState(false);
  const [deleteDeck, setDeleteDeck] = useState<any>(null);

  // Import file modal
  const [lexonData, setLexonData] = useState<any>(null);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importing, setImporting] = useState(false);
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
      toast.error('Error', 'Failed to create deck.');
    } finally {
      setCreating(false);
    }
  };

  const handleImportFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (res.canceled || !res.assets || res.assets.length === 0) return;

      const fileUri = res.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const parsed = JSON.parse(fileContent);

      if (
        !parsed ||
        typeof parsed !== 'object' ||
        !parsed.deck ||
        !parsed.cards ||
        !Array.isArray(parsed.cards)
      ) {
        toast.error('Invalid Format', 'This file is not a valid Vocab Lab deck file.');
        return;
      }

      setLexonData(parsed);
      setImportModalVisible(true);
    } catch (err: any) {
      toast.error('Error', 'Failed to pick or parse the file: ' + err.message);
    }
  };

  const handleConfirmImport = async (finalDeckName: string) => {
    if (!lexonData) return;
    setImporting(true);
    try {
      const payload = {
        ...lexonData,
        deck: {
          ...lexonData.deck,
          name: finalDeckName,
        },
      };

      const res = await vocabLabApi.importDeck(payload);
      toast.success(
        'Import Success',
        `Successfully imported deck "${res.deckName}" with ${res.cardsImported} cards!`,
      );
      setImportModalVisible(false);
      setLexonData(null);
      fetchData();
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err.message || 'Failed to import deck';
      toast.error('Import Failed', errMsg);
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = (deck: any) => {
    setActionDeck(null);
    setDeleteDeck(deck);
  };

  const openActionMenu = (deck: any) => setActionDeck(deck);

  if (loading)
    return (
      <ScrollView contentContainerStyle={{ padding: SPACING.lg }}>
        <DeckCardSkeleton count={3} />
      </ScrollView>
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
        <View style={[s.statsRow, { backgroundColor: colors.card }]}>
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

      {/* Action buttons row */}
      <View style={s.actionHeaderRow}>
        <TouchableOpacity
          style={[s.importDeckBtn, { backgroundColor: colors.card }]}
          onPress={handleImportFile}
        >
          <Ionicons name="download-outline" size={16} color={COLORS.primary} />
          <Text style={s.importDeckBtnText}>Import Deck</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.newDeckBtn} onPress={() => setCreateModal(true)}>
          <Ionicons name="add" size={18} color={COLORS.primary} />
          <Text style={s.newDeckBtnText}>New Deck</Text>
        </TouchableOpacity>
      </View>

      {/* Deck list */}
      {decks.length === 0 ? (
        <EmptyState
          illustration={EmptyStates.deck}
          title="No decks yet"
          description="Create your first flashcard deck to start learning vocabulary."
          primaryAction={{ title: 'Create Deck', onPress: () => setCreateModal(true) }}
        />
      ) : (
        decks.map((deck) => {
          const totalDue = (deck.dueCount ?? 0) + (deck.learningCount ?? 0);
          return (
            <View key={deck.id} style={[s.deckCard, { backgroundColor: colors.card }]}>
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
          <Pressable style={[s.modal, { backgroundColor: colors.card }]} onPress={() => {}}>
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
        visible={!!actionDeck && !publishModalVisible && !renameModalVisible}
        deck={actionDeck}
        onClose={() => setActionDeck(null)}
        onRename={() => {
          setRenameModalVisible(true);
        }}
        onPublish={() => {
          setPublishModalVisible(true);
        }}
        onDelete={() => handleDelete(actionDeck)}
      />

      {/* Rename modal */}
      <RenameDeckModal
        visible={renameModalVisible}
        deck={actionDeck}
        onClose={() => {
          setRenameModalVisible(false);
          setActionDeck(null);
        }}
        onSaved={fetchData}
      />

      {/* Publish modal */}
      <PublishDeckModal
        visible={publishModalVisible}
        deck={actionDeck}
        onClose={() => {
          setPublishModalVisible(false);
          setActionDeck(null);
        }}
        onSuccess={fetchData}
      />

      {/* Import Modal */}
      <ImportDeckModal
        visible={importModalVisible}
        onClose={() => {
          setImportModalVisible(false);
          setLexonData(null);
        }}
        onConfirm={handleConfirmImport}
        lexonData={lexonData}
        isImporting={importing}
        existingDeckNames={decks.map((d) => d.name)}
      />
      <ConfirmDialog
        visible={!!deleteDeck}
        onClose={() => setDeleteDeck(null)}
        variant="destructive"
        title="Delete Deck"
        message={`Delete "${deleteDeck?.name}"? All cards will be removed.`}
        primaryAction={{
          title: 'Delete',
          onPress: async () => {
            if (!deleteDeck) return;
            await vocabLabApi.deleteDeck(deleteDeck.id);
            setDeleteDeck(null);
            fetchData();
          },
        }}
        secondaryAction={{
          title: 'Cancel',
          onPress: () => setDeleteDeck(null),
        }}
      />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  statsRow: {
    flexDirection: 'row',
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: FONT_SIZES.xxl, fontWeight: '800' },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  actionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  newDeckBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  newDeckBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: FONT_SIZES.sm },
  importDeckBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  importDeckBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: FONT_SIZES.sm },

  // Deck card
  deckCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  modal: { width: '85%', borderRadius: RADIUS.xl, padding: SPACING.xl },
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
