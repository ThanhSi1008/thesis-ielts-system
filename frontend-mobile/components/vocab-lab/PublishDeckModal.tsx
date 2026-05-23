import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { vocabLabApi } from '@/services/features.api';
import { Button, toast } from '@/components/ui';

interface PublishDeckModalProps {
  visible: boolean;
  onClose: () => void;
  deck: any;
  onSuccess: () => void;
}

export function PublishDeckModal({ visible, onClose, deck, onSuccess }: PublishDeckModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (visible && deck) {
      setName(deck.name || '');
      setDescription('');
      setTagsInput('');
    }
  }, [visible, deck]);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setIsPublishing(true);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      await vocabLabApi.publishDeck(deck.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });

      toast.success('Success', 'Deck has been successfully published to the community marketplace!');
      onSuccess();
      onClose();
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err.message || 'Failed to publish deck';
      toast.error('Error', errMsg);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={s.keyboardView}
        >
          <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={s.header}>
              <View style={s.titleContainer}>
                <Text style={s.emoji}>🌍</Text>
                <Text style={s.title}>Publish to Marketplace</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                <Ionicons name="close" size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Content Form */}
            <View style={s.form}>
              {/* Name */}
              <View style={s.formGroup}>
                <Text style={s.label}>Deck Name</Text>
                <TextInput
                  style={s.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter deck display name..."
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>

              {/* Description */}
              <View style={s.formGroup}>
                <Text style={s.label}>Description (Optional)</Text>
                <TextInput
                  style={[s.input, s.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="What is this deck about? Who is it for?"
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              {/* Tags */}
              <View style={s.formGroup}>
                <Text style={s.label}>Tags (Optional, comma separated)</Text>
                <TextInput
                  style={s.input}
                  value={tagsInput}
                  onChangeText={setTagsInput}
                  placeholder="e.g. IELTS, Writing, Vocabulary"
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="none"
                />
              </View>

              {/* Warning/Info message */}
              <View style={s.infoBox}>
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color={COLORS.textSecondary}
                />
                <Text style={s.infoText}>
                  By publishing, a snapshot of your deck will be shared with the community. Future
                  changes to your local deck will not automatically update the published version.
                </Text>
              </View>

              {/* Actions */}
              <View style={s.actions}>
                <Button title="Cancel" variant="ghost" onPress={onClose} disabled={isPublishing} />
                <Button
                  title="Publish Deck"
                  onPress={handleSubmit}
                  loading={isPublishing}
                  disabled={!name.trim() || isPublishing}
                />
              </View>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    width: '100%',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: RADIUS.xl * 1.5,
    borderTopRightRadius: RADIUS.xl * 1.5,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xl + 20 : SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    paddingBottom: SPACING.md,
    marginBottom: SPACING.lg,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flex: 1,
  },
  emoji: {
    fontSize: FONT_SIZES.lg,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.text,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  form: {
    gap: SPACING.md,
  },
  formGroup: {
    gap: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    backgroundColor: '#FAFBFD',
  },
  textArea: {
    height: 76,
    paddingTop: SPACING.sm,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    gap: SPACING.xs,
    marginTop: SPACING.xs,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 15,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
});
