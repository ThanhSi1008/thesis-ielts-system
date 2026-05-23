import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { Button } from '@/components/ui';

export interface LexonData {
  version: number;
  exportedAt: string;
  deck: { name: string };
  cardType: {
    name: string;
    description?: string | null;
    fields: Array<{ name: string; order: number; fieldType: string }>;
    templates: Array<{ name: string; frontFieldNames: string[]; backFieldNames: string[] }>;
  } | null;
  cards: Array<{
    fieldValues: Record<string, string>;
    tags?: string[];
  }>;
}

interface ImportDeckModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (deckName: string) => Promise<void>;
  lexonData: LexonData | null;
  isImporting: boolean;
  existingDeckNames: string[];
}

export function ImportDeckModal({
  visible,
  onClose,
  onConfirm,
  lexonData,
  isImporting,
  existingDeckNames,
}: ImportDeckModalProps) {
  const [deckName, setDeckName] = useState('');

  useEffect(() => {
    if (lexonData) {
      setDeckName(lexonData.deck.name);
    }
  }, [lexonData]);

  if (!visible || !lexonData) return null;

  const nameConflict = existingDeckNames.includes(deckName.trim());
  const previewCards = lexonData.cards.slice(0, 3);
  const remainingCount = Math.max(0, lexonData.cards.length - 3);

  const exportDate = new Date(lexonData.exportedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleConfirm = () => {
    if (!deckName.trim()) return;
    onConfirm(deckName.trim());
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
                <Text style={s.emoji}>📥</Text>
                <Text style={s.title}>Import Deck</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                <Ionicons name="close" size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={s.scrollContent} style={s.scrollView}>
              {/* Deck Name Input */}
              <View style={s.formGroup}>
                <Text style={s.label}>Deck Name</Text>
                <TextInput
                  style={s.input}
                  value={deckName}
                  onChangeText={setDeckName}
                  placeholder="Enter deck name..."
                  placeholderTextColor={COLORS.textMuted}
                />
                {nameConflict && (
                  <View style={s.warningBox}>
                    <Ionicons name="warning-outline" size={14} color="#D97706" />
                    <Text style={s.warningText}>
                      A deck with this name already exists. It will be imported with a suffix.
                    </Text>
                  </View>
                )}
              </View>

              {/* Summary Stats */}
              <View style={s.summaryCard}>
                <View style={s.summaryItem}>
                  <Text style={s.summaryIcon}>📇</Text>
                  <Text style={s.summaryText}>
                    <Text style={s.highlight}>{lexonData.cards.length}</Text> cards
                  </Text>
                </View>
                {lexonData.cardType && (
                  <View style={s.summaryItem}>
                    <Text style={s.summaryIcon}>📋</Text>
                    <Text style={s.summaryText}>
                      Card Type: <Text style={s.highlight}>{lexonData.cardType.name}</Text>
                    </Text>
                  </View>
                )}
                {lexonData.cardType && (
                  <View style={s.metaTextContainer}>
                    <Text style={s.metaText}>
                      📝 Fields: {lexonData.cardType.fields.map((f) => f.name).join(', ')}
                    </Text>
                  </View>
                )}
                <View style={s.metaTextContainer}>
                  <Text style={s.metaText}>📅 Exported: {exportDate}</Text>
                </View>
              </View>

              {/* Preview Cards */}
              {previewCards.length > 0 && (
                <View style={s.previewContainer}>
                  <Text style={s.sectionTitle}>Cards Preview</Text>
                  <View style={s.previewList}>
                    {previewCards.map((card, i) => (
                      <View key={i} style={s.previewCard}>
                        {Object.entries(card.fieldValues)
                          .slice(0, 3)
                          .map(([key, value]) => (
                            <View key={key} style={s.previewRow}>
                              <Text style={s.previewKey} numberOfLines={1}>
                                {key}:
                              </Text>
                              <Text style={s.previewValue} numberOfLines={1}>
                                {stripHtml(value)}
                              </Text>
                            </View>
                          ))}
                      </View>
                    ))}
                  </View>
                  {remainingCount > 0 && (
                    <Text style={s.remainingText}>... and {remainingCount} more cards</Text>
                  )}
                </View>
              )}
            </ScrollView>

            {/* Actions */}
            <View style={s.actions}>
              <Button title="Cancel" variant="ghost" onPress={onClose} disabled={isImporting} />
              <Button
                title={isImporting ? 'Importing...' : `Import ${lexonData.cards.length} cards`}
                onPress={handleConfirm}
                loading={isImporting}
                disabled={!deckName.trim() || isImporting}
              />
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

function stripHtml(html: string): string {
  if (typeof html !== 'string') return String(html);
  return html
    .replace(/<[^>]*>/g, '')
    .trim()
    .substring(0, 80);
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
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    paddingBottom: SPACING.md,
    marginBottom: SPACING.md,
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
  scrollView: {
    maxHeight: 380,
  },
  scrollContent: {
    gap: SPACING.md,
    paddingBottom: SPACING.md,
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
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: 2,
  },
  warningText: {
    fontSize: 11,
    color: '#D97706',
    flex: 1,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#FAFBFD',
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  summaryIcon: {
    fontSize: FONT_SIZES.md,
  },
  summaryText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  highlight: {
    fontWeight: '800',
    color: COLORS.primary,
  },
  metaTextContainer: {
    borderTopWidth: 1,
    borderColor: COLORS.border,
    paddingTop: SPACING.xs,
    marginTop: SPACING.xs,
  },
  metaText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  previewContainer: {
    gap: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewList: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    backgroundColor: '#FAFBFD',
    overflow: 'hidden',
  },
  previewCard: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    gap: 2,
  },
  previewRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  previewKey: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '700',
    width: 60,
  },
  previewValue: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    flex: 1,
  },
  remainingText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    paddingTop: SPACING.md,
  },
});
