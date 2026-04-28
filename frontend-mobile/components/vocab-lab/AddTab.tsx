import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, TextInput, Alert, Modal, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { vocabLabApi } from '@/services/features.api';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function AddTab() {
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
      <View style={s.headerSelectors}>
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

const s = StyleSheet.create({
  headerSelectors: { flexDirection: 'row', padding: SPACING.md, gap: SPACING.sm, borderBottomWidth: 1, borderColor: COLORS.border, backgroundColor: '#fff' },
  selectorBtn: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border },
  selectorLabel: { fontSize: 11, color: COLORS.textSecondary, textTransform: 'uppercase', fontWeight: '700', marginBottom: 2 },
  selectorValue: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  toolbar: { flexDirection: 'row', backgroundColor: '#fff', padding: SPACING.xs, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md, maxHeight: 44 },
  toolbarBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: RADIUS.md },
  toolbarBtnActive: { backgroundColor: COLORS.primary + '15' },
  toolbarDivider: { width: 1, backgroundColor: COLORS.border, marginVertical: 4, marginHorizontal: 4 },
  sectionLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: SPACING.xs },
  fieldInput: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: SPACING.md, fontSize: FONT_SIZES.md, color: COLORS.text, backgroundColor: '#fff' },
  mediaPreview: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, padding: SPACING.sm, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.sm },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, backgroundColor: '#fff', padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, minHeight: 48 },
  tagChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.xl, gap: 4, borderWidth: 1, borderColor: COLORS.border },
  tagText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.text },
  tagInput: { flex: 1, minWidth: 100, fontSize: FONT_SIZES.sm, color: COLORS.text },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.text, borderRadius: RADIUS.xl, paddingVertical: SPACING.md, marginTop: SPACING.lg },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: FONT_SIZES.md },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.lg, borderBottomWidth: 1, borderColor: COLORS.border },
  modalHeaderTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  modalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.md, borderBottomWidth: 1, borderColor: COLORS.border },
  modalRowActive: { backgroundColor: COLORS.primary + '0A' },
  modalRowText: { fontSize: FONT_SIZES.md, color: COLORS.text },
  modalRowTextActive: { fontWeight: '700', color: COLORS.primary }
});
