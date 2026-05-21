import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, RADIUS, FONT_SIZES, FONTS } from '@/constants';
import { notesApi, type QuestionNote } from '@/services/notes.api';
import { useTheme } from '@/contexts/ThemeContext';

// ─── Props ───────────────────────────────────────────────────────────────────

interface QuestionNoteEditorProps {
  questionNumber: number;
  examId: string;
  userId: string;
  initialNote?: QuestionNote;
  onSaved?: (note: QuestionNote) => void;
  onDeleted?: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function QuestionNoteEditor({
  questionNumber,
  examId,
  userId,
  initialNote,
  onSaved,
  onDeleted,
}: QuestionNoteEditorProps) {
  const { isDark } = useTheme();
  const [open, setOpen] = useState(!!initialNote);
  const [text, setText] = useState(initialNote?.noteText ?? '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savedNote, setSavedNote] = useState<QuestionNote | undefined>(initialNote);
  const [error, setError] = useState<string | null>(null);

  const hasText = text.trim().length > 0;
  const isDirty = text.trim() !== (savedNote?.noteText ?? '').trim();

  const handleSave = async () => {
    if (!hasText) return;
    try {
      setSaving(true);
      setError(null);
      const saved = await notesApi.upsertNote(userId, examId, questionNumber, text.trim());
      setSavedNote(saved);
      onSaved?.(saved);
    } catch {
      setError('Failed to save note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!savedNote?.id) {
      setText('');
      setOpen(false);
      return;
    }
    try {
      setDeleting(true);
      setError(null);
      await notesApi.deleteNote(savedNote.id);
      setSavedNote(undefined);
      setText('');
      setOpen(false);
      onDeleted?.();
    } catch {
      setError('Failed to delete note.');
    } finally {
      setDeleting(false);
    }
  };

  // Color tokens
  const triggerBg = isDark ? 'rgba(217, 119, 6, 0.15)' : '#FEF3C7';
  const triggerBorder = isDark ? 'rgba(217, 119, 6, 0.3)' : '#FDE68A';
  const amberText = isDark ? '#FBBF24' : '#B45309';
  const amberDot = isDark ? '#F59E0B' : '#D97706';
  
  const containerBg = isDark ? '#1C1917' : '#FFFBEB';
  const containerBorder = isDark ? 'rgba(217, 119, 6, 0.25)' : '#FDE68A';
  
  const textInputColor = isDark ? '#F5F5F4' : '#78350F';
  const textPlaceholder = isDark ? '#78716C' : '#D97706';

  const deleteBg = isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEE2E2';
  const deleteBorder = isDark ? 'rgba(239, 68, 68, 0.25)' : '#FECACA';
  const deleteIcon = isDark ? '#F87171' : '#EF4444';

  const saveBg = '#D97706';
  const saveText = '#fff';

  // Collapsed state — show note toggle button
  if (!open) {
    return (
      <TouchableOpacity 
        style={[ne.trigger, { backgroundColor: triggerBg, borderColor: triggerBorder }]} 
        onPress={() => setOpen(true)} 
        activeOpacity={0.7}
      >
        <Ionicons name="create-outline" size={13} color={amberText} />
        <Text style={[ne.triggerText, { color: amberText }]}>{savedNote ? 'View note' : 'Add note'}</Text>
        {savedNote && <View style={[ne.noteDot, { backgroundColor: amberDot }]} />}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[ne.container, { backgroundColor: containerBg, borderColor: containerBorder }]}>
      {/* Header */}
      <View style={ne.header}>
        <Ionicons name="create-outline" size={13} color={amberText} />
        <Text style={[ne.headerText, { color: amberText }]}>Q{questionNumber} Note</Text>
        <TouchableOpacity onPress={() => setOpen(false)} style={ne.closeBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-up" size={14} color={amberText} />
        </TouchableOpacity>
      </View>

      {/* TextInput */}
      <TextInput
        style={[ne.input, { color: textInputColor }]}
        value={text}
        onChangeText={setText}
        placeholder="Add your note here…"
        placeholderTextColor={textPlaceholder}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      {/* Error */}
      {error && <Text style={ne.error}>{error}</Text>}

      {/* Actions */}
      <View style={[ne.actions, { borderColor: containerBorder }]}>
        {savedNote && (
          <TouchableOpacity
            style={[ne.deleteBtn, { backgroundColor: deleteBg, borderColor: deleteBorder }]}
            onPress={handleDelete}
            disabled={deleting}
            activeOpacity={0.7}
          >
            {deleting ? (
              <ActivityIndicator size="small" color={deleteIcon} />
            ) : (
              <Ionicons name="trash-outline" size={14} color={deleteIcon} />
            )}
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[ne.saveBtn, { backgroundColor: saveBg }, (!hasText || !isDirty) && ne.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving || !hasText || !isDirty}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator size="small" color={saveText} />
          ) : (
            <Text style={[ne.saveBtnText, { color: saveText }]}>{savedNote ? 'Update' : 'Save'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const ne = StyleSheet.create({
  // Collapsed trigger
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.xs,
    alignSelf: 'flex-start',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderWidth: 1,
  },
  triggerText: { fontSize: 11, fontWeight: '700' },
  noteDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Expanded editor
  container: {
    marginTop: SPACING.xs,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.sm,
    paddingBottom: 4,
  },
  headerText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  closeBtn: { padding: 2 },
  input: {
    minHeight: 72,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
    backgroundColor: 'transparent',
  },
  error: {
    fontSize: 11,
    color: '#ef4444',
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderTopWidth: 1,
  },
  deleteBtn: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  saveBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
  },
  saveBtnDisabled: { opacity: 0.45 },
  saveBtnText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold },
});
