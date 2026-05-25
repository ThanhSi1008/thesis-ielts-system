/**
 * GlobalAddCardFab — A floating action button that opens a compact
 * "quick add card" bottom sheet from anywhere inside vocab-lab.
 *
 * Usage:
 *   <GlobalAddCardFab />
 *
 * Place it in vocab-lab/index.tsx (or any persistent wrapper).
 * The sheet overlays the current screen without navigation.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  DeviceEventEmitter,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { vocabLabApi } from '@/services/features.api';
import { toast } from '@/components/ui';
import Markdown from 'react-native-markdown-display';

const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_H = SCREEN_H * 0.72;

// ─── Success toast (inline) ────────────────────────────────────────────────────
function MiniToast({ visible }: { visible: boolean }) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.delay(1500),
        Animated.timing(opacity, { toValue: 0, duration: 280, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);
  return (
    <Animated.View style={[t.pill, { opacity }]} pointerEvents="none">
      <Ionicons name="checkmark-circle" size={16} color="#fff" />
      <Text style={t.text}>Card added!</Text>
    </Animated.View>
  );
}
const t = StyleSheet.create({
  pill: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1A1A2E',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    zIndex: 100,
  },
  text: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZES.sm },
});

// ─── Markdown Live Preview Styles ──────────────────────────────────────────────
const formMarkdownStyles = {
  body: {
    fontSize: 14,
    color: '#0f172a',
  },
  paragraph: {
    fontSize: 14,
    color: '#0f172a',
    marginVertical: 2,
  },
  strong: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  em: {
    fontStyle: 'italic',
    color: '#0f172a',
  },
  code_inline: {
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    paddingHorizontal: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
};

// ─── GlobalAddCardFab ──────────────────────────────────────────────────────────
export function GlobalAddCardFab({ hideFab = false }: { hideFab?: boolean } = {}) {
  // Sheet visibility
  const [open, setOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(SHEET_H)).current;
  const fabScale = useRef(new Animated.Value(1)).current;

  // Data
  const [decks, setDecks] = useState<any[]>([]);
  const [cardTypes, setCardTypes] = useState<any[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState('');
  const [cardTypeId, setCardTypeId] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [vocabMeta, setVocabMeta] = useState<{ bookName: string; wordData: any } | undefined>(undefined);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Picker Modals
  const [deckPickerOpen, setDeckPickerOpen] = useState(false);
  const [cardTypePickerOpen, setCardTypePickerOpen] = useState(false);

  // Open / close animations
  const openSheet = useCallback(
    (prefill?: {
      front?: string;
      back?: string;
      tags?: string[];
      audioUrl?: string;
      foundationVocabMeta?: { bookName: string; wordData: any };
      AICardType?: any;
      AIFieldValues?: Record<string, string>;
    }) => {
      const prefillData = prefill;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setOpen(true);
      setIsPrefilled(!!prefill);
      setVocabMeta(prefill?.foundationVocabMeta);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.spring(fabScale, {
          toValue: 0.92,
          tension: 200,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();

      const loadAndPrefill = async () => {
        let currentDecks = decks;
        let currentCardTypes = cardTypes;

        if (!dataLoaded) {
          try {
            const [d, ct] = await Promise.all([vocabLabApi.getDecks(), vocabLabApi.getCardTypes()]);
            currentDecks = d;
            currentCardTypes = ct;
            setDecks(d);
            setCardTypes(ct);
            if (d.length > 0) setSelectedDeckId(d[0].id);
            setDataLoaded(true);
          } catch (e) {
            if (__DEV__) console.error('Failed to load decks/cardTypes in Fab', e);
          }
        }

        if (currentCardTypes.length > 0) {
          // Select preferred card type or fallback to first
          let dt = currentCardTypes.find((t) => t.isBuiltIn) || currentCardTypes[0];
          if (prefillData?.AICardType) {
            const found = currentCardTypes.find(
              (t) => t.id === prefillData.AICardType.id || t.name === prefillData.AICardType.name
            );
            if (found) dt = found;
          }
          setCardTypeId(dt.id);

          const sortedFields = [...dt.fields].sort((a: any, b: any) => a.order - b.order);
          const iv: Record<string, string> = {};
          dt.fields.forEach((f: any) => (iv[f.id] = ''));

          if (prefillData) {
            const aiFieldValues = prefillData.AIFieldValues;
            if (aiFieldValues) {
              // Web prefill style: match by field name (case-insensitive)
              dt.fields.forEach((f: any) => {
                const matchingKey = Object.keys(aiFieldValues).find(
                  (key) => key.toLowerCase() === f.name.toLowerCase()
                );
                if (matchingKey) {
                  iv[f.id] = aiFieldValues[matchingKey] || '';
                }
              });
            } else {
              // Legacy flat style
              if (sortedFields[0]) {
                iv[sortedFields[0].id] = prefillData.front || '';
              }
              if (sortedFields[1]) {
                let backVal = prefillData.back || '';
                if (prefillData.audioUrl) {
                  backVal = `${backVal}\n<audio src="${prefillData.audioUrl}"></audio>`;
                }
                iv[sortedFields[1].id] = backVal;
              }
            }
            if (prefillData.tags) {
              setTagsList(prefillData.tags);
            }
          } else {
            setTagsList([]);
          }
          setFieldValues(iv);
        }
      };

      loadAndPrefill();
    },
    [dataLoaded, decks, cardTypes],
  );

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      'OPEN_QUICK_ADD_CARD',
      (payload: {
        front: string;
        back: string;
        tags?: string[];
        audioUrl?: string;
        foundationVocabMeta?: { bookName: string; wordData: any };
      }) => {
        openSheet(payload);
      },
    );
    return () => sub.remove();
  }, [openSheet]);

  const handleCardTypeChange = (id: string) => {
    setCardTypeId(id);
    const ct = cardTypes.find((t) => t.id === id);
    if (ct) {
      const iv: any = {};
      ct.fields.forEach((f: any) => (iv[f.id] = ''));
      setFieldValues(iv);
    }
  };

  const handleAddTag = () => {
    const newTag = tagInput.trim().replace(/,$/, '');
    if (newTag && !tagsList.includes(newTag)) setTagsList([...tagsList, newTag]);
    setTagInput('');
  };

  const closeSheet = useCallback(() => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: SHEET_H,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }),
      Animated.spring(fabScale, { toValue: 1, tension: 200, friction: 10, useNativeDriver: true }),
    ]).start();

    // Guarantees the modal is unmounted and touch interactions are restored on the underlying screen
    setTimeout(() => {
      setOpen(false);
    }, 280);
  }, [slideAnim, fabScale]);

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (!selectedDeckId || !cardTypeId) return;
    const ct = cardTypes.find((t) => t.id === cardTypeId);
    if (!ct) return;

    const firstField = ct.fields.sort((a: any, b: any) => a.order - b.order)[0];
    if (firstField && !fieldValues[firstField.id]?.trim()) return;

    setSubmitting(true);
    try {
      if (vocabMeta) {
        await vocabLabApi.createFlashcardFromVocabulary({
          bookName: vocabMeta.bookName,
          word: vocabMeta.wordData,
        });
      } else {
        await vocabLabApi.createFlashcard({
          deckId: selectedDeckId,
          front: '',
          back: '',
          cardTypeId,
          fieldValues,
          tags: tagsList.length > 0 ? tagsList : undefined,
        });
      }

      DeviceEventEmitter.emit('VOCAB_LAB_CARD_ADDED');

      const resetFields: Record<string, string> = {};
      ct.fields.forEach((f: any) => (resetFields[f.id] = ''));
      setFieldValues(resetFields);
      setTagsList([]);
      setVocabMeta(undefined);
      
      closeSheet();
      
      setTimeout(() => {
        toast.success('Success', 'Card added to Vocab Lab!');
      }, 350);
    } catch {
      toast.error('Error', 'Failed to add card. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeDeck = decks.find((d) => d.id === selectedDeckId);
  const activeType = cardTypes.find((t) => t.id === cardTypeId);

  return (
    <>
      {/* ── FAB button ────────────────────────────────────────────── */}
      {!hideFab && (
        <Animated.View style={[fab.wrap, { transform: [{ scale: fabScale }] }]}>
          <TouchableOpacity
            style={fab.btn}
            onPress={() => openSheet()}
            activeOpacity={0.85}
            id="global-add-card-fab"
          >
            <Ionicons name="add" size={26} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* ── Bottom sheet ──────────────────────────────────────────── */}
      <Modal visible={open} transparent animationType="none" onRequestClose={closeSheet}>
        <Pressable style={fab.backdrop} onPress={closeSheet} />

        <Animated.View style={[fab.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            {/* Handle */}
            <View style={fab.handle} />

            {/* Header */}
            <View style={fab.header}>
              <View>
                <Text style={fab.sheetTitle}>Quick Add Card</Text>
                <Text style={fab.sheetSubtitle}>Basic front/back card</Text>
              </View>
              <TouchableOpacity style={fab.closeBtn} onPress={closeSheet}>
                <Ionicons name="close" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
            >
              {/* Deck selector */}
              <Text style={fab.label}>DECK</Text>
              <TouchableOpacity
                style={fab.selectorBtn}
                onPress={() => setDeckPickerOpen(true)}
                activeOpacity={0.8}
              >
                <Text style={fab.selectorValue}>{activeDeck?.name || 'Select Deck'}</Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
              </TouchableOpacity>

              {/* Type selector */}
              <Text style={[fab.label, { marginTop: SPACING.xs }]}>CARD TYPE</Text>
              <TouchableOpacity
                style={[fab.selectorBtn, isPrefilled && fab.selectorBtnDisabled]}
                onPress={() => {
                  if (!isPrefilled) {
                    setCardTypePickerOpen(true);
                  }
                }}
                activeOpacity={isPrefilled ? 1 : 0.8}
              >
                <Text style={[fab.selectorValue, isPrefilled && fab.selectorValueDisabled]}>
                  {activeType?.name || 'Select Type'}
                </Text>
                {isPrefilled ? (
                  <Ionicons name="lock-closed" size={14} color={COLORS.textMuted} />
                ) : (
                  <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
                )}
              </TouchableOpacity>

              {/* Dynamic fields */}
              {activeType?.fields
                .sort((a: any, b: any) => a.order - b.order)
                .map((field: any, idx: number) => {
                  const val = fieldValues[field.id] || '';
                  const hasMedia = /<(img|audio)\s/i.test(val);
                  const textOnly = hasMedia
                    ? val.replace(/<(img|audio)[^>]*>(<\/audio>)?/gi, '')
                    : val;

                  return (
                    <View key={field.id} style={{ marginTop: SPACING.md }}>
                      <Text style={fab.label}>
                        {field.name.toUpperCase()} {idx === 0 ? '*' : ''}
                      </Text>
                      <TextInput
                        style={fab.input}
                        value={textOnly}
                        onChangeText={(text) => {
                          const mediaHtml =
                            val.match(/<(img|audio)[^>]*>(<\/audio>)?/gi)?.join('\n') || '';
                          setFieldValues((prev) => ({
                            ...prev,
                            [field.id]: mediaHtml ? `${text}\n${mediaHtml}` : text,
                          }));
                        }}
                        placeholder={
                          hasMedia ? 'Add text...' : `Enter ${field.name.toLowerCase()}…`
                        }
                        placeholderTextColor={COLORS.textMuted}
                        multiline
                        textAlignVertical="top"
                        autoFocus={idx === 0}
                      />
                      {textOnly.trim().length > 0 && (
                        <View style={fab.previewContainer}>
                          <Text style={fab.previewLabel}>Markdown Live Preview:</Text>
                          <View style={fab.previewContent}>
                            <Markdown style={formMarkdownStyles as any}>{textOnly}</Markdown>
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}

              {/* Tags */}
              <View style={{ marginTop: SPACING.md }}>
                <Text style={fab.label}>TAGS</Text>
                <View style={sAdd.tagsContainer}>
                  {tagsList.map((tag) => (
                    <View key={tag} style={sAdd.tagChip}>
                      <Text style={sAdd.tagText}>{tag}</Text>
                      <TouchableOpacity
                        onPress={() => setTagsList(tagsList.filter((t) => t !== tag))}
                      >
                        <Ionicons name="close" size={14} color={COLORS.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TextInput
                    style={sAdd.tagInput}
                    value={tagInput}
                    onChangeText={setTagInput}
                    onSubmitEditing={handleAddTag}
                    blurOnSubmit={false}
                    placeholder={tagsList.length === 0 ? 'Add tags...' : ''}
                    placeholderTextColor={COLORS.textMuted}
                    returnKeyType="done"
                  />
                </View>
              </View>

              {/* Submit */}
              <TouchableOpacity
                style={[fab.submitBtn, submitting && fab.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="add-circle-outline" size={18} color="#fff" />
                    <Text style={fab.submitBtnText}>Add to {activeDeck?.name ?? 'deck'}</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>

            {/* Success toast */}
            <MiniToast visible={showToast} />

            {/* Custom Deck Picker Overlay */}
            {deckPickerOpen && (
              <View style={fab.customPickerContainer}>
                <Pressable style={fab.customPickerBackdrop} onPress={() => setDeckPickerOpen(false)} />
                <View style={fab.customPickerContent}>
                  <View style={fab.pickerHeader}>
                    <Text style={fab.pickerTitle}>Choose Deck</Text>
                    <TouchableOpacity onPress={() => setDeckPickerOpen(false)}>
                      <Ionicons name="close" size={20} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={fab.pickerList} contentContainerStyle={{ paddingBottom: 20 }}>
                    {decks.map((d) => (
                      <TouchableOpacity
                        key={d.id}
                        style={[fab.pickerRow, selectedDeckId === d.id && fab.pickerRowActive]}
                        onPress={() => {
                          setSelectedDeckId(d.id);
                          setDeckPickerOpen(false);
                        }}
                      >
                        <Text style={[fab.pickerRowText, selectedDeckId === d.id && fab.pickerRowTextActive]}>
                          {d.name}
                        </Text>
                        {selectedDeckId === d.id && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}

            {/* Custom Card Type Picker Overlay */}
            {cardTypePickerOpen && (
              <View style={fab.customPickerContainer}>
                <Pressable style={fab.customPickerBackdrop} onPress={() => setCardTypePickerOpen(false)} />
                <View style={fab.customPickerContent}>
                  <View style={fab.pickerHeader}>
                    <Text style={fab.pickerTitle}>Choose Card Type</Text>
                    <TouchableOpacity onPress={() => setCardTypePickerOpen(false)}>
                      <Ionicons name="close" size={20} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={fab.pickerList} contentContainerStyle={{ paddingBottom: 20 }}>
                    {cardTypes.map((ct) => (
                      <TouchableOpacity
                        key={ct.id}
                        style={[fab.pickerRow, cardTypeId === ct.id && fab.pickerRowActive]}
                        onPress={() => {
                          handleCardTypeChange(ct.id);
                          setCardTypePickerOpen(false);
                        }}
                      >
                        <Text style={[fab.pickerRowText, cardTypeId === ct.id && fab.pickerRowTextActive]}>
                          {ct.name}
                        </Text>
                        {cardTypeId === ct.id && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}
          </KeyboardAvoidingView>
        </Animated.View>
      </Modal>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const fab = StyleSheet.create({
  // FAB button
  wrap: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.lg,
    zIndex: 50,
  },
  btn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },

  // Sheet
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_H,
    backgroundColor: '#fff',
    borderTopLeftRadius: RADIUS.xl * 1.5,
    borderTopRightRadius: RADIUS.xl * 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 16,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  sheetTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text },
  sheetSubtitle: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Deck pills
  deckPillBar: { maxHeight: 40 },
  deckPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
  },
  deckPillActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '12' },
  deckPillText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textSecondary },
  deckPillTextActive: { color: COLORS.primary },

  // Form
  label: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    backgroundColor: '#fff',
    minHeight: 80,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md + 2,
    marginTop: SPACING.xl,
  },
  submitBtnDisabled: { opacity: 0.45 },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: FONT_SIZES.md },

  // Selector
  selectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    backgroundColor: '#fff',
    marginBottom: SPACING.sm,
  },
  selectorValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  selectorBtnDisabled: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
  },
  selectorValueDisabled: {
    color: COLORS.textMuted,
  },

  // Picker Modals
  pickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: RADIUS.xl * 1.5,
    borderTopRightRadius: RADIUS.xl * 1.5,
    maxHeight: '60%',
    paddingTop: SPACING.md,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  pickerTitle: {
    fontSize: FONT_SIZES.md + 2,
    fontWeight: '700',
    color: COLORS.text,
  },
  pickerList: {
    paddingHorizontal: SPACING.lg,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  pickerRowActive: {
    backgroundColor: COLORS.primary + '08',
  },
  pickerRowText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  pickerRowTextActive: {
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Markdown Live Preview
  previewContainer: {
    marginTop: SPACING.xs,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  previewContent: {
    padding: 2,
  },

  // Custom absolute pickers
  customPickerContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
    justifyContent: 'flex-end',
  },
  customPickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  customPickerContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '75%',
    paddingTop: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 20,
  },
});

const sAdd = StyleSheet.create({
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    backgroundColor: '#fff',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 48,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.xl,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.text },
  tagInput: { flex: 1, minWidth: 100, fontSize: FONT_SIZES.sm, color: COLORS.text },
});
