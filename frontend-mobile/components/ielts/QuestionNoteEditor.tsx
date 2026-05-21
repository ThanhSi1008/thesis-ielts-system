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
import { COLORS, SPACING, RADIUS, FONT_SIZES, FONTS } from '@/constants';
import { notesApi, type QuestionNote } from '@/services/notes.api';

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

  // Collapsed state — show note toggle button
  if (!open) {
    return (
      <TouchableOpacity style={ne.trigger} onPress={() => setOpen(true)} activeOpacity={0.7}>
        <Ionicons name="create-outline" size={13} color="#B45309" />
        <Text style={ne.triggerText}>{savedNote ? 'View note' : 'Add note'}</Text>
        {savedNote && <View style={ne.noteDot} />}
      </TouchableOpacity>
    );
  }

  return (
    <View style={ne.container}>
      {/* Header */}
      <View style={ne.header}>
        <Ionicons name="create-outline" size={13} color="#B45309" />
        <Text style={ne.headerText}>Q{questionNumber} Note</Text>
        <TouchableOpacity onPress={() => setOpen(false)} style={ne.closeBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-up" size={14} color="#B45309" />
        </TouchableOpacity>
      </View>

      {/* TextInput */}
      <TextInput
        style={ne.input}
        value={text}
        onChangeText={setText}
        placeholder="Add your note here…"
        placeholderTextColor="#D97706"
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      {/* Error */}
      {error && <Text style={ne.error}>{error}</Text>}

      {/* Actions */}
      <View style={ne.actions}>
        {savedNote && (
          <TouchableOpacity
            style={ne.deleteBtn}
            onPress={handleDelete}
            disabled={deleting}
            activeOpacity={0.7}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <Ionicons name="trash-outline" size={14} color="#ef4444" />
            )}
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[ne.saveBtn, (!hasText || !isDirty) && ne.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving || !hasText || !isDirty}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={ne.saveBtnText}>{savedNote ? 'Update' : 'Save'}</Text>
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
    backgroundColor: '#FEF3C7',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  triggerText: { fontSize: 11, fontWeight: '700', color: '#B45309' },
  noteDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D97706',
  },

  // Expanded editor
  container: {
    marginTop: SPACING.xs,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
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
    color: '#B45309',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  closeBtn: { padding: 2 },
  input: {
    minHeight: 72,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    fontSize: FONT_SIZES.sm,
    color: '#78350F',
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
    borderColor: '#FDE68A',
  },
  deleteBtn: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  saveBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 6,
    backgroundColor: '#D97706',
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
  },
  saveBtnDisabled: { opacity: 0.45 },
  saveBtnText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold, color: '#fff' },
});
