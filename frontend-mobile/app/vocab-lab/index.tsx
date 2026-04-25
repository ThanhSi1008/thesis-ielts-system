import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, TextInput, Alert, RefreshControl,
  Modal, Pressable, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { vocabLabApi } from '@/services/features.api';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EmptyState, Button } from '@/components/ui';

type Tab = 'decks' | 'add' | 'browse' | 'stats';

const NAV_ITEMS = [
  { key: 'decks',  label: 'My Decks',   icon: 'library-outline' as const },
  { key: 'add',    label: 'Add Card',    icon: 'add-circle-outline' as const },
  { key: 'browse', label: 'Browse Cards',icon: 'search-outline' as const },
  { key: 'stats',  label: 'Statistics',  icon: 'bar-chart-outline' as const },
];

/* ─── Decks Tab ─── */
function DecksTab({ onRefreshNeeded }: { onRefreshNeeded?: () => void }) {
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
    try { await vocabLabApi.createDeck(newDeckName.trim()); setNewDeckName(''); setCreateModal(false); fetchData(); }
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
          {[['Total', stats.totalCards ?? stats.totalCount ?? 0, COLORS.text],
            ['Due', stats.totalDue ?? stats.dueCount ?? 0, COLORS.error],
            ['Learned', stats.totalLearned ?? stats.reviewCount ?? 0, COLORS.success]].map(([label, val, color]) => (
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
        ? <EmptyState icon="📦" title="No decks yet" subtitle="Create your first flashcard deck." action={{ label: 'Create Deck', onPress: () => setCreateModal(true) }} />
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

/* ─── Add Card Tab ─── */
function AddTab() {
  const [decks, setDecks] = useState<any[]>([]);
  const [cardTypes, setCardTypes] = useState<any[]>([]);
  const [deckId, setDeckId] = useState('');
  const [cardTypeId, setCardTypeId] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [fieldStyles, setFieldStyles] = useState<Record<string, any>>({});
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Modals
  const [deckChooserOpen, setDeckChooserOpen] = useState(false);
  const [typeChooserOpen, setTypeChooserOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      vocabLabApi.getDecks(),
      vocabLabApi.getCardTypes(),
      AsyncStorage.getItem('vocablab-last-tags'),
      AsyncStorage.getItem('vocablab-last-deck-id'),
      AsyncStorage.getItem('vocablab-last-cardtype-id')
    ])
      .then(([d, ct, savedTags, savedDeckId, savedTypeId]) => {
        setDecks(d);
        setCardTypes(ct);
        
        if (savedTags) {
          try { setTagsList(JSON.parse(savedTags)); } catch {}
        }
        
        let initialDeckId = '';
        if (d.length > 0) {
          initialDeckId = (savedDeckId && d.some((x:any) => x.id === savedDeckId)) ? savedDeckId : d[0].id;
          setDeckId(initialDeckId);
        }

        if (ct.length > 0) {
          const defaultType = (savedTypeId && ct.find((t:any) => t.id === savedTypeId)) 
            || ct.find((t: any) => t.isBuiltIn) 
            || ct[0];
          setCardTypeId(defaultType.id);
          const initialFields: Record<string, string> = {};
          defaultType.fields.forEach((f: any) => initialFields[f.id] = '');
          setFieldValues(initialFields);
        }
      }).catch(() => {});
  }, []);

  useEffect(() => {
    if (deckId) AsyncStorage.setItem('vocablab-last-deck-id', deckId);
  }, [deckId]);

  useEffect(() => {
    if (cardTypeId) AsyncStorage.setItem('vocablab-last-cardtype-id', cardTypeId);
  }, [cardTypeId]);

  useEffect(() => {
    AsyncStorage.setItem('vocablab-last-tags', JSON.stringify(tagsList));
  }, [tagsList]);

  const handleCardTypeChange = (id: string) => {
    setCardTypeId(id);
    setTypeChooserOpen(false);
    const ct = cardTypes.find(t => t.id === id);
    if (ct) {
      const newFields: Record<string, string> = {};
      ct.fields.forEach((f: any) => newFields[f.id] = '');
      setFieldValues(newFields);
      setFieldStyles({});
    }
  };

  const handleAddTag = () => {
    const newTag = tagInput.trim().replace(/,$/, '');
    if (newTag && !tagsList.includes(newTag)) {
      setTagsList([...tagsList, newTag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTagsList(tagsList.filter(t => t !== tagToRemove));
  };

  const uploadMedia = async (type: 'image' | 'audio') => {
    if (!activeFieldId) {
      Alert.alert('Error', 'Tap inside a text field first to insert media.');
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: type === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsUploading(true);
        const asset = result.assets[0];
        // Upload
        const res = await vocabLabApi.uploadMedia(asset.uri, asset.mimeType || 'image/jpeg', asset.fileName || 'upload.jpg');
        
        const html = type === 'image'
          ? `<img src="${res.url}" alt="image" />`
          : `<audio controls src="${res.url}"></audio>`;

        setFieldValues(prev => {
          const current = prev[activeFieldId] || '';
          const newVal = current + (current.endsWith('\n') || current === '' ? '' : '\n') + html + '\n';
          return { ...prev, [activeFieldId]: newVal };
        });
      }
    } catch (e) {
      Alert.alert('Upload Failed', 'There was an error uploading the media.');
    } finally {
      setIsUploading(false);
    }
  };

  const toggleStyle = (key: string, val: string) => {
    if (!activeFieldId) { Alert.alert('Error', 'Tap inside a field first to style it.'); return; }
    setFieldStyles(prev => {
      const current = prev[activeFieldId] || {};
      return {
        ...prev,
        [activeFieldId]: { ...current, [key]: current[key] === val ? undefined : val }
      };
    });
  };

  const isActiveStyle = (key: string, val: string) => activeFieldId ? fieldStyles[activeFieldId]?.[key] === val : false;

  const handleSubmit = async () => {
    if (!deckId) { Alert.alert('Error', 'Please select a deck.'); return; }
    if (!cardTypeId) { Alert.alert('Error', 'Please select a card type.'); return; }
    
    const ct = cardTypes.find(t => t.id === cardTypeId);
    if (!ct) return;

    const firstField = ct.fields.sort((a: any, b: any) => a.order - b.order)[0];
    if (firstField && !fieldValues[firstField.id]?.trim()) {
      Alert.alert('Error', `${firstField.name} is required.`); return;
    }

    setSubmitting(true);
    try {
      await vocabLabApi.createFlashcard({
        deckId, front: '', back: '', cardTypeId, fieldValues,
        fieldStyles: Object.keys(fieldStyles).some(k => Object.keys(fieldStyles[k]).length > 0) ? fieldStyles : undefined,
        tags: tagsList.length > 0 ? tagsList : undefined
      });
      // reset
      const resetFields: Record<string, string> = {};
      ct.fields.forEach((f: any) => resetFields[f.id] = '');
      setFieldValues(resetFields);
      setFieldStyles({});
      setTagsList([]);
      Alert.alert('✅ Card Added!', 'Your card has been saved.');
    } catch { Alert.alert('Error', 'Failed to add card.'); }
    finally { setSubmitting(false); }
  };

  const activeType = cardTypes.find(t => t.id === cardTypeId);
  const activeDeck = decks.find(d => d.id === deckId);

  return (
    <View style={{ flex: 1 }}>
      {/* Header Selectors */}
      <View style={{ flexDirection: 'row', padding: SPACING.md, gap: SPACING.sm, borderBottomWidth: 1, borderColor: COLORS.border, backgroundColor: '#fff' }}>
        <TouchableOpacity style={s.selectorBtn} onPress={() => setDeckChooserOpen(true)}>
          <Text style={s.selectorLabel}>Add to</Text>
          <Text style={s.selectorValue} numberOfLines={1}>{activeDeck?.name || 'Select Deck'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.selectorBtn} onPress={() => setTypeChooserOpen(true)}>
          <Text style={s.selectorLabel}>Type</Text>
          <Text style={s.selectorValue} numberOfLines={1}>{activeType?.name || 'Select Type'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
        {/* Formatting Toolbar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.toolbar}>
          <TouchableOpacity style={[s.toolbarBtn, isActiveStyle('fontWeight', 'bold') && s.toolbarBtnActive]} onPress={() => toggleStyle('fontWeight', 'bold')}><Ionicons name="text" size={18} color={isActiveStyle('fontWeight', 'bold') ? COLORS.primary : COLORS.textMuted} /></TouchableOpacity>
          <TouchableOpacity style={[s.toolbarBtn, isActiveStyle('fontStyle', 'italic') && s.toolbarBtnActive]} onPress={() => toggleStyle('fontStyle', 'italic')}><Ionicons name="text-outline" size={18} color={isActiveStyle('fontStyle', 'italic') ? COLORS.primary : COLORS.textMuted} /></TouchableOpacity>
          <View style={s.toolbarDivider} />
          <TouchableOpacity style={[s.toolbarBtn, isActiveStyle('textAlign', 'left') && s.toolbarBtnActive]} onPress={() => toggleStyle('textAlign', 'left')}><Ionicons name="menu" size={18} color={isActiveStyle('textAlign', 'left') ? COLORS.primary : COLORS.textMuted} /></TouchableOpacity>
          <TouchableOpacity style={[s.toolbarBtn, isActiveStyle('textAlign', 'center') && s.toolbarBtnActive]} onPress={() => toggleStyle('textAlign', 'center')}><Ionicons name="menu-outline" size={18} color={isActiveStyle('textAlign', 'center') ? COLORS.primary : COLORS.textMuted} /></TouchableOpacity>
          <View style={s.toolbarDivider} />
          <TouchableOpacity style={s.toolbarBtn} onPress={() => uploadMedia('image')} disabled={isUploading}><Ionicons name="image-outline" size={18} color={isUploading ? COLORS.border : COLORS.textMuted} /></TouchableOpacity>
          <TouchableOpacity style={s.toolbarBtn} onPress={() => uploadMedia('audio')} disabled={isUploading}><Ionicons name="mic-outline" size={18} color={isUploading ? COLORS.border : COLORS.textMuted} /></TouchableOpacity>
        </ScrollView>

        {activeType?.fields.sort((a: any, b: any) => a.order - b.order).map((field: any, idx: number) => {
          const val = fieldValues[field.id] || '';
          const hasMedia = /<(img|audio)\s/i.test(val);
          let textOnly = val;
          if (hasMedia) {
             textOnly = val.replace(/<(img|audio)[^>]*>(<\/audio>)?/gi, '');
          }

          return (
            <View key={field.id} style={{ marginBottom: SPACING.lg }}>
              <Text style={s.sectionLabel}>{field.name} {idx === 0 ? '*' : ''}</Text>
              <TextInput
                style={[
                  s.fieldInput, 
                  { minHeight: 80, textAlignVertical: 'top' },
                  fieldStyles[field.id]?.fontWeight === 'bold' && { fontWeight: 'bold' },
                  fieldStyles[field.id]?.fontStyle === 'italic' && { fontStyle: 'italic' },
                  fieldStyles[field.id]?.textAlign === 'center' && { textAlign: 'center' },
                ]}
                value={textOnly}
                onChangeText={text => {
                  const mediaHtml = val.match(/<(img|audio)[^>]*>(<\/audio>)?/gi)?.join('\n') || '';
                  setFieldValues(prev => ({ ...prev, [field.id]: mediaHtml ? `${text}\n${mediaHtml}` : text }));
                }}
                onFocus={() => setActiveFieldId(field.id)}
                placeholder={hasMedia ? 'Add text...' : `Enter ${field.name.toLowerCase()}…`}
                placeholderTextColor={COLORS.textMuted}
                multiline
              />
              {/* Media Previews */}
              {hasMedia && (
                <View style={{ marginTop: SPACING.sm, gap: SPACING.sm }}>
                  {[...val.matchAll(/<(img|audio)[^>]*>(<\/audio>)?/gi)].map((m, mIdx) => {
                    const tag = m[0];
                    const isAudio = /^<audio/i.test(tag);
                    return (
                      <View key={mIdx} style={s.mediaPreview}>
                        {isAudio ? <Ionicons name="musical-notes" size={24} color={COLORS.primary} /> : <Ionicons name="image" size={24} color={COLORS.primary} />}
                        <Text style={{ flex: 1, fontSize: 12, color: COLORS.textSecondary }}>{isAudio ? 'Audio Attachment' : 'Image Attachment'}</Text>
                        <TouchableOpacity onPress={() => {
                          const remaining = [...val.matchAll(/<(img|audio)[^>]*>(<\/audio>)?/gi)].filter((_, i) => i !== mIdx).map(x => x[0]);
                          setFieldValues(prev => ({ ...prev, [field.id]: [textOnly, ...remaining].filter(Boolean).join('\n') }));
                        }}>
                          <Ionicons name="close-circle" size={20} color={COLORS.error} />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

        <View style={{ marginBottom: SPACING.xl }}>
          <Text style={s.sectionLabel}>TAGS</Text>
          <View style={s.tagsContainer}>
            {tagsList.map(tag => (
              <View key={tag} style={s.tagChip}>
                <Text style={s.tagText}>{tag}</Text>
                <TouchableOpacity onPress={() => handleRemoveTag(tag)}><Ionicons name="close" size={14} color={COLORS.textSecondary} /></TouchableOpacity>
              </View>
            ))}
            <TextInput
              style={s.tagInput}
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={handleAddTag}
              blurOnSubmit={false}
              placeholder={tagsList.length === 0 ? "Add tags..." : ""}
              placeholderTextColor={COLORS.textMuted}
              returnKeyType="done"
            />
          </View>
        </View>

        <TouchableOpacity style={[s.submitBtn, submitting && { opacity: 0.6 }]} onPress={handleSubmit} disabled={submitting}>
          {submitting ? <ActivityIndicator size="small" color="#fff" /> : <><Ionicons name="add-circle-outline" size={18} color="#fff" /><Text style={s.submitBtnText}>Add Card</Text></>}
        </TouchableOpacity>
      </ScrollView>

      {/* Deck Chooser Modal */}
      <Modal visible={deckChooserOpen} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
          <View style={s.modalHeader}>
            <Text style={s.modalHeaderTitle}>Choose Deck</Text>
            <TouchableOpacity onPress={() => setDeckChooserOpen(false)}><Ionicons name="close" size={24} color={COLORS.text} /></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: SPACING.lg }}>
            {decks.map(d => (
              <TouchableOpacity key={d.id} style={[s.modalRow, deckId === d.id && s.modalRowActive]} onPress={() => { setDeckId(d.id); setDeckChooserOpen(false); }}>
                <Text style={[s.modalRowText, deckId === d.id && s.modalRowTextActive]}>{d.name}</Text>
                {deckId === d.id && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Type Chooser Modal */}
      <Modal visible={typeChooserOpen} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
          <View style={s.modalHeader}>
            <Text style={s.modalHeaderTitle}>Choose Card Type</Text>
            <TouchableOpacity onPress={() => setTypeChooserOpen(false)}><Ionicons name="close" size={24} color={COLORS.text} /></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: SPACING.lg }}>
            {cardTypes.map(ct => (
              <TouchableOpacity key={ct.id} style={[s.modalRow, cardTypeId === ct.id && s.modalRowActive]} onPress={() => handleCardTypeChange(ct.id)}>
                <Text style={[s.modalRowText, cardTypeId === ct.id && s.modalRowTextActive]}>{ct.name}</Text>
                {cardTypeId === ct.id && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

/* ─── Browse Tab ─── */
function BrowseTab() {
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 52, borderBottomWidth: 1, borderColor: COLORS.border }}>
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

/* ─── Stats Tab ─── */
function StatsTab() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { vocabLabApi.getStats().then(setStats).catch(() => {}).finally(() => setLoading(false)); }, []);

  if (loading) return <View style={s.center}><ActivityIndicator color={COLORS.primary} /></View>;
  if (!stats) return <View style={s.center}><Text style={{ color: COLORS.textSecondary }}>No data yet.</Text></View>;

  const total = Math.max(stats.totalCount ?? stats.totalCards ?? 0, 1);
  const rows = [
    { label: 'New',       count: stats.newCount ?? 0,      color: '#3B82F6' },
    { label: 'Learning',  count: stats.learningCount ?? 0,  color: '#EF4444' },
    { label: 'Reviewing', count: stats.reviewCount ?? 0,    color: '#10B981' },
  ];

  return (
    <ScrollView contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 100 }}>
      <Text style={s.statsTitle}>Card Distribution</Text>
      {rows.map(r => (
        <View key={r.label} style={s.statBar}>
          <Text style={[s.statBarLabel, { color: r.color }]}>{r.label}</Text>
          <View style={s.barBg}>
            <View style={[s.barFill, { width: `${(r.count / total) * 100}%` as any, backgroundColor: r.color }]} />
          </View>
          <Text style={s.statBarCount}>{r.count}</Text>
        </View>
      ))}
      <View style={s.totalRow}>
        <Text style={s.totalLabel}>Total</Text>
        <Text style={s.totalVal}>{stats.totalCount ?? stats.totalCards ?? 0}</Text>
      </View>
    </ScrollView>
  );
}

/* ─── Main screen with drawer ─── */
export default function VocabLabScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>('decks');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnim   = useRef(new Animated.Value(-280)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.spring(drawerAnim,   { toValue: 0,    useNativeDriver: true, tension: 80, friction: 12 }),
      Animated.timing(backdropAnim, { toValue: 1,    duration: 250, useNativeDriver: true }),
    ]).start();
  };
  const closeDrawer = () => {
    Animated.parallel([
      Animated.spring(drawerAnim,   { toValue: -280, useNativeDriver: true, tension: 80, friction: 12 }),
      Animated.timing(backdropAnim, { toValue: 0,    duration: 200, useNativeDriver: true }),
    ]).start(() => setDrawerOpen(false));
  };
  const handleNavPress = (key: Tab) => { setActiveTab(key); closeDrawer(); };

  const TAB_LABELS: Record<Tab, string> = { decks: 'My Decks', add: 'Add Card', browse: 'Browse', stats: 'Statistics' };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={s.menuBtn} onPress={openDrawer}>
          <Ionicons name="menu" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Vocab Lab</Text>
        <View style={{ width: 40 }} />
      </View>



      {/* Content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'decks'  && <DecksTab />}
        {activeTab === 'add'    && <AddTab />}
        {activeTab === 'browse' && <BrowseTab />}
        {activeTab === 'stats'  && <StatsTab />}
      </View>

      {/* Backdrop */}
      {drawerOpen && (
        <Animated.View style={[s.backdrop, { opacity: backdropAnim }]}>
          <Pressable style={{ flex: 1 }} onPress={closeDrawer} />
        </Animated.View>
      )}

      {/* Drawer */}
      <Animated.View style={[s.drawer, { paddingTop: insets.top, transform: [{ translateX: drawerAnim }] }]} pointerEvents={drawerOpen ? 'auto' : 'none'}>
        <View style={s.drawerHeader}>
          <TouchableOpacity onPress={closeDrawer}><Ionicons name="menu" size={24} color={COLORS.text} /></TouchableOpacity>
          <Text style={s.drawerLogo}>Lexon</Text>
        </View>
        <ScrollView>
          <Text style={s.drawerSection}>VOCAB LAB</Text>
          {NAV_ITEMS.map(item => (
            <TouchableOpacity key={item.key} style={[s.navItem, activeTab === item.key && s.navItemActive]} onPress={() => handleNavPress(item.key as Tab)}>
              <Ionicons name={item.icon} size={20} color={activeTab === item.key ? COLORS.primary : COLORS.textSecondary} />
              <Text style={[s.navLabel, activeTab === item.key && { color: COLORS.primary, fontWeight: '700' }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md,
    backgroundColor: '#fff', borderBottomWidth: 1, borderColor: COLORS.border,
  },
  menuBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  pillBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: COLORS.border, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs },
  pill: { flex: 1, paddingVertical: SPACING.sm, alignItems: 'center', borderRadius: RADIUS.lg },
  pillActive: { backgroundColor: COLORS.primary + '18' },
  pillText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textSecondary },
  pillTextActive: { color: COLORS.primary, fontWeight: '800' },

  statsRow: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: RADIUS.xl, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.lg },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: FONT_SIZES.xxl, fontWeight: '800' },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  newDeckBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, alignSelf: 'flex-end', marginBottom: SPACING.md, paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.primary },
  newDeckBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: FONT_SIZES.sm },
  deckCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: RADIUS.xl, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.md },
  deckName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  deckMeta: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  studyBtn: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2, borderRadius: RADIUS.md },
  studyBtnText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZES.sm },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: '#fff', width: '85%', borderRadius: RADIUS.xl, padding: SPACING.xl },
  modalTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.lg },
  modalInput: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: SPACING.md, fontSize: FONT_SIZES.md, color: COLORS.text, marginBottom: SPACING.lg },

  sectionLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: SPACING.xs },
  fieldInput: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: SPACING.md, fontSize: FONT_SIZES.md, color: COLORS.text, backgroundColor: '#fff' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.text, borderRadius: RADIUS.xl, paddingVertical: SPACING.md, marginTop: SPACING.lg },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: FONT_SIZES.md },
  deckPill: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.border, marginHorizontal: 4, marginVertical: SPACING.sm, backgroundColor: '#fff' },
  deckPillActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '12' },
  deckPillText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textSecondary },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, margin: SPACING.md, backgroundColor: '#fff', borderRadius: RADIUS.xl, paddingHorizontal: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, paddingVertical: SPACING.sm, fontSize: FONT_SIZES.md, color: COLORS.text },
  cardRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.md },
  cardFront: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  cardBack: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  statePill: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.sm },

  statsTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.xl },
  statBar: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.md },
  statBarLabel: { width: 72, fontSize: FONT_SIZES.sm, fontWeight: '700' },
  barBg: { flex: 1, height: 10, backgroundColor: COLORS.border, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  statBarCount: { width: 36, textAlign: 'right', fontWeight: '700', color: COLORS.text },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: SPACING.lg, borderTopWidth: 1, borderColor: COLORS.border, marginTop: SPACING.sm },
  totalLabel: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text },
  totalVal: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text },

  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 50 },
  drawer: { position: 'absolute', top: 0, left: 0, bottom: 0, width: 260, backgroundColor: '#fff', zIndex: 60, elevation: 20, shadowColor: '#000', shadowOffset: { width: 4, height: 0 }, shadowOpacity: 0.15, shadowRadius: 20 },
  drawerHeader: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, borderBottomWidth: 1, borderColor: COLORS.border, gap: SPACING.md },
  drawerLogo: { fontSize: FONT_SIZES.xl, fontWeight: '900', color: COLORS.primary },
  drawerSection: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.sm },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingVertical: 12, marginHorizontal: SPACING.sm, borderRadius: RADIUS.lg, marginBottom: 2 },
  navItemActive: { backgroundColor: COLORS.primary + '15' },
  navLabel: { flex: 1, fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textSecondary },

  // Add Card specific
  selectorBtn: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border },
  selectorLabel: { fontSize: 11, color: COLORS.textSecondary, textTransform: 'uppercase', fontWeight: '700', marginBottom: 2 },
  selectorValue: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  toolbar: { flexDirection: 'row', backgroundColor: '#fff', padding: SPACING.xs, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md, maxHeight: 44 },
  toolbarBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: RADIUS.md },
  toolbarBtnActive: { backgroundColor: COLORS.primary + '15' },
  toolbarDivider: { width: 1, backgroundColor: COLORS.border, marginVertical: 4, marginHorizontal: 4 },
  mediaPreview: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, padding: SPACING.sm, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.sm },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, backgroundColor: '#fff', padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, minHeight: 48 },
  tagChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.xl, gap: 4, borderWidth: 1, borderColor: COLORS.border },
  tagText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.text },
  tagInput: { flex: 1, minWidth: 100, fontSize: FONT_SIZES.sm, color: COLORS.text },
  
  // Modals
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.lg, borderBottomWidth: 1, borderColor: COLORS.border },
  modalHeaderTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  modalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.md, borderBottomWidth: 1, borderColor: COLORS.border },
  modalRowActive: { backgroundColor: COLORS.primary + '0A' },
  modalRowText: { fontSize: FONT_SIZES.md, color: COLORS.text },
  modalRowTextActive: { fontWeight: '700', color: COLORS.primary }
});
