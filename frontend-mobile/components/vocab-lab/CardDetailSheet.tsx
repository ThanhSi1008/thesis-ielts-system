import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { vocabLabApi } from '@/services/features.api';

const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_MAX_H = SCREEN_H * 0.88;

// ─── Types ───────────────────────────────────────────────────────────────────
interface CardDetailSheetProps {
  card: any | null;
  visible: boolean;
  onClose: () => void;
  onSaved: (updatedCard: any) => void;
  onDeleted: (cardId: string) => void;
}

// ─── State badge ──────────────────────────────────────────────────────────────
const STATE_STYLE: Record<string, { bg: string; color: string }> = {
  NEW: { bg: '#EFF6FF', color: '#2563EB' },
  LEARNING: { bg: '#FEF9C3', color: '#CA8A04' },
  REVIEW: { bg: '#DCFCE7', color: '#16A34A' },
  RELEARNING: { bg: '#FFF1F2', color: '#BE123C' },
};

function StateBadge({ state }: { state?: string }) {
  const key = (state ?? 'NEW').toUpperCase();
  const st = STATE_STYLE[key] ?? STATE_STYLE.NEW;
  return (
    <View style={[b.pill, { backgroundColor: st.bg }]}>
      <Text style={[b.text, { color: st.color }]}>{key}</Text>
    </View>
  );
}
const b = StyleSheet.create({
  pill: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.sm },
  text: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
});

// ─── CardDetailSheet ─────────────────────────────────────────────────────────
export function CardDetailSheet({
  card,
  visible,
  onClose,
  onSaved,
  onDeleted,
}: CardDetailSheetProps) {
  // Slide animation
  const slideAnim = useRef(new Animated.Value(SHEET_MAX_H)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : SHEET_MAX_H,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [visible]);

  // ── Edit state ─────────────────────────────────────────────────────────────
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable copies
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');
  const [editFieldValues, setEditFieldValues] = useState<Record<string, string>>({});
  const [editTags, setEditTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Sync form when card changes or edit mode is opened
  const startEdit = useCallback(() => {
    if (!card) return;
    setEditFront(card.front ?? '');
    setEditBack(card.back ?? '');
    setEditFieldValues({ ...(card.fieldValues ?? {}) });
    setEditTags([...(card.tags ?? [])]);
    setTagInput('');
    setEditing(true);
  }, [card]);

  const cancelEdit = () => {
    setEditing(false);
    setTagInput('');
  };

  const handleSave = async () => {
    if (!card) return;
    setSaving(true);
    try {
      const hasCustomFields =
        card.cardType?.fields?.length > 0 && Object.keys(editFieldValues).length > 0;
      const payload = hasCustomFields
        ? { fieldValues: editFieldValues, tags: editTags }
        : { front: editFront, back: editBack, tags: editTags };

      const updated = await vocabLabApi.updateFlashcard(card.id, payload);
      onSaved({ ...card, ...updated, fieldValues: editFieldValues, tags: editTags });
      setEditing(false);
    } catch {
      Alert.alert('Error', 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Card', 'This will permanently delete this card.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await vocabLabApi.deleteFlashcard(card.id);
            onDeleted(card.id);
            onClose();
          } catch {
            Alert.alert('Error', 'Failed to delete card.');
          }
        },
      },
    ]);
  };

  const handleAddTag = () => {
    const t = tagInput.trim().replace(/,$/, '');
    if (t && !editTags.includes(t)) setEditTags((prev) => [...prev, t]);
    setTagInput('');
  };

  if (!card) return null;

  // ── Card type fields ────────────────────────────────────────────────────────
  const ctFields: any[] = card.cardType?.fields ?? [];
  const hasCustomType = ctFields.length > 0;

  // Display text for read mode
  const displayFront = card.front || Object.values(card.fieldValues ?? {})[0] || '';
  const displayBack = card.back || Object.values(card.fieldValues ?? {})[1] || '';

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable
        style={s.backdrop}
        onPress={() => {
          cancelEdit();
          onClose();
        }}
      />

      {/* Sheet */}
      <Animated.View style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          {/* Handle bar */}
          <View style={s.handle} />

          {/* Header */}
          <View style={s.header}>
            <View style={{ flex: 1, gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                <StateBadge state={card.cardState ?? card.state} />
                {card.cardType && <Text style={s.typeBadge}>{card.cardType.name}</Text>}
              </View>
              {card.deck?.name && <Text style={s.deckLabel}>📦 {card.deck.name}</Text>}
            </View>

            <View style={s.headerActions}>
              {!editing && (
                <>
                  <TouchableOpacity style={s.iconBtn} onPress={startEdit}>
                    <Ionicons name="pencil" size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={s.iconBtn} onPress={handleDelete}>
                    <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity
                style={s.iconBtn}
                onPress={() => {
                  cancelEdit();
                  onClose();
                }}
              >
                <Ionicons name="close" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Read mode ──────────────────────────────────────────────── */}
            {!editing && (
              <>
                <View
                  style={[
                    { borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.lg },
                    card.cardType?.templates?.[0]?.cardStyle || {},
                  ]}
                >
                  {hasCustomType ? (
                    ctFields
                      .sort((a: any, b: any) => a.order - b.order)
                      .map((field: any) => {
                        const val = card.fieldValues?.[field.id] ?? '';
                        if (!val) return null;
                        const isMediaHtml = /<(img|audio)/i.test(val);
                        const cleanVal = isMediaHtml
                          ? val.replace(/<(img|audio)[^>]*>(<\/audio>)?/gi, '[media]')
                          : val;
                        return (
                          <View key={field.id} style={s.readField}>
                            <Text
                              style={[
                                s.fieldLabel,
                                card.cardType?.templates?.[0]?.cardStyle?.color
                                  ? {
                                      color: card.cardType.templates[0].cardStyle.color,
                                      opacity: 0.6,
                                    }
                                  : null,
                              ]}
                            >
                              {field.name}
                            </Text>
                            <Text
                              style={[
                                s.fieldValue,
                                card.cardType?.templates?.[0]?.cardStyle?.color
                                  ? { color: card.cardType.templates[0].cardStyle.color }
                                  : null,
                              ]}
                            >
                              {cleanVal || '—'}
                            </Text>
                          </View>
                        );
                      })
                  ) : (
                    <>
                      <View style={s.readField}>
                        <Text
                          style={[
                            s.fieldLabel,
                            card.cardType?.templates?.[0]?.cardStyle?.color
                              ? { color: card.cardType.templates[0].cardStyle.color, opacity: 0.6 }
                              : null,
                          ]}
                        >
                          Front
                        </Text>
                        <Text
                          style={[
                            s.fieldValue,
                            card.cardType?.templates?.[0]?.cardStyle?.color
                              ? { color: card.cardType.templates[0].cardStyle.color }
                              : null,
                          ]}
                        >
                          {String(displayFront) || '—'}
                        </Text>
                      </View>
                      <View style={s.readField}>
                        <Text
                          style={[
                            s.fieldLabel,
                            card.cardType?.templates?.[0]?.cardStyle?.color
                              ? { color: card.cardType.templates[0].cardStyle.color, opacity: 0.6 }
                              : null,
                          ]}
                        >
                          Back
                        </Text>
                        <Text
                          style={[
                            s.fieldValue,
                            card.cardType?.templates?.[0]?.cardStyle?.color
                              ? { color: card.cardType.templates[0].cardStyle.color }
                              : null,
                          ]}
                        >
                          {String(displayBack) || '—'}
                        </Text>
                      </View>
                    </>
                  )}

                  {/* Tags (read) */}
                  {card.tags?.length > 0 && (
                    <View style={s.readField}>
                      <Text
                        style={[
                          s.fieldLabel,
                          card.cardType?.templates?.[0]?.cardStyle?.color
                            ? { color: card.cardType.templates[0].cardStyle.color, opacity: 0.6 }
                            : null,
                        ]}
                      >
                        Tags
                      </Text>
                      <View style={s.tagsRow}>
                        {card.tags.map((t: string) => (
                          <View
                            key={t}
                            style={[
                              s.tagChip,
                              card.cardType?.templates?.[0]?.cardStyle?.color
                                ? { borderColor: card.cardType.templates[0].cardStyle.color + '40' }
                                : null,
                            ]}
                          >
                            <Text
                              style={[
                                s.tagText,
                                card.cardType?.templates?.[0]?.cardStyle?.color
                                  ? { color: card.cardType.templates[0].cardStyle.color }
                                  : null,
                              ]}
                            >
                              #{t}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>

                {/* SRS meta */}
                <View style={s.metaRow}>
                  {[
                    ['Reviews', card.reps ?? 0],
                    ['Lapses', card.lapses ?? 0],
                    ['Interval', card.scheduledDays ? `${card.scheduledDays}d` : '—'],
                  ].map(([label, val]) => (
                    <View key={label as string} style={s.metaItem}>
                      <Text style={s.metaVal}>{val}</Text>
                      <Text style={s.metaLabel}>{label as string}</Text>
                    </View>
                  ))}
                </View>

                {/* Edit button */}
                <TouchableOpacity style={s.editBtn} onPress={startEdit}>
                  <Ionicons name="pencil-outline" size={16} color={COLORS.primary} />
                  <Text style={s.editBtnText}>Edit Card</Text>
                </TouchableOpacity>
              </>
            )}

            {/* ── Edit mode ──────────────────────────────────────────────── */}
            {editing && (
              <>
                {hasCustomType ? (
                  ctFields
                    .sort((a: any, b: any) => a.order - b.order)
                    .map((field: any, idx: number) => (
                      <View key={field.id} style={{ marginBottom: SPACING.lg }}>
                        <Text style={s.editLabel}>
                          {field.name}
                          {idx === 0 ? ' *' : ''}
                        </Text>
                        <TextInput
                          style={s.editInput}
                          value={editFieldValues[field.id] ?? ''}
                          onChangeText={(text) =>
                            setEditFieldValues((prev) => ({ ...prev, [field.id]: text }))
                          }
                          placeholder={`Enter ${field.name.toLowerCase()}…`}
                          placeholderTextColor={COLORS.textMuted}
                          multiline
                          textAlignVertical="top"
                        />
                      </View>
                    ))
                ) : (
                  <>
                    <View style={{ marginBottom: SPACING.lg }}>
                      <Text style={s.editLabel}>Front *</Text>
                      <TextInput
                        style={s.editInput}
                        value={editFront}
                        onChangeText={setEditFront}
                        placeholder="Front side…"
                        placeholderTextColor={COLORS.textMuted}
                        multiline
                        textAlignVertical="top"
                      />
                    </View>
                    <View style={{ marginBottom: SPACING.lg }}>
                      <Text style={s.editLabel}>Back</Text>
                      <TextInput
                        style={s.editInput}
                        value={editBack}
                        onChangeText={setEditBack}
                        placeholder="Back side…"
                        placeholderTextColor={COLORS.textMuted}
                        multiline
                        textAlignVertical="top"
                      />
                    </View>
                  </>
                )}

                {/* Tags (edit) */}
                <View style={{ marginBottom: SPACING.lg }}>
                  <Text style={s.editLabel}>Tags</Text>
                  <View style={s.tagsInput}>
                    {editTags.map((t) => (
                      <TouchableOpacity
                        key={t}
                        style={s.tagChipEdit}
                        onPress={() => setEditTags((prev) => prev.filter((x) => x !== t))}
                      >
                        <Text style={s.tagText}>#{t}</Text>
                        <Ionicons name="close" size={12} color={COLORS.textSecondary} />
                      </TouchableOpacity>
                    ))}
                    <TextInput
                      style={s.tagTextInput}
                      value={tagInput}
                      onChangeText={setTagInput}
                      onSubmitEditing={handleAddTag}
                      blurOnSubmit={false}
                      placeholder={editTags.length === 0 ? 'Add tags…' : ''}
                      placeholderTextColor={COLORS.textMuted}
                      returnKeyType="done"
                    />
                  </View>
                </View>

                {/* Save / Cancel */}
                <View style={s.editActions}>
                  <TouchableOpacity style={s.cancelBtn} onPress={cancelEdit} disabled={saving}>
                    <Text style={s.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.saveBtn, saving && { opacity: 0.6 }]}
                    onPress={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="checkmark" size={16} color="#fff" />
                        <Text style={s.saveBtnText}>Save</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SHEET_MAX_H,
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
    marginBottom: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  typeBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  deckLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  headerActions: { flexDirection: 'row', gap: SPACING.xs },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },

  // Read fields
  readField: { marginBottom: SPACING.lg },
  fieldLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.xs,
  },
  fieldValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 22,
  },

  // Tags
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  tagChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagText: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary },

  // SRS meta
  metaRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  metaItem: { flex: 1, alignItems: 'center' },
  metaVal: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text },
  metaLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },

  // Edit button (read mode)
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md,
  },
  editBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: FONT_SIZES.md },

  // Edit form
  editLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.xs,
  },
  editInput: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    backgroundColor: '#fff',
    minHeight: 80,
  },

  // Tag edit
  tagsInput: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    minHeight: 48,
    backgroundColor: '#fff',
  },
  tagChipEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagTextInput: { flex: 1, minWidth: 80, fontSize: FONT_SIZES.sm, color: COLORS.text },

  // Save / Cancel
  editActions: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.xs },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md,
  },
  cancelBtnText: { color: COLORS.textSecondary, fontWeight: '700', fontSize: FONT_SIZES.md },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md,
  },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: FONT_SIZES.md },
});
