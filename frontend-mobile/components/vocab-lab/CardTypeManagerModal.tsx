import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Pressable,
  Dimensions,
  TextInput,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';
import { vocabLabApi } from '@/services/features.api';
import { CardType } from '@/types';

const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_H = SCREEN_H * 0.85;

interface CardTypeManagerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect?: (cardType: CardType) => void; // Optional: If we want to pick one
  onEditFields?: (cardType: CardType) => void; // To open CardTypeEditor
}

export function CardTypeManagerModal({
  visible,
  onClose,
  onSelect,
  onEditFields,
}: CardTypeManagerModalProps) {
  const slideAnim = useRef(new Animated.Value(SHEET_H)).current;
  const [types, setTypes] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(false);

  // Create state
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');

  // Edit state (Rename)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
      fetchTypes();
    } else {
      Animated.timing(slideAnim, {
        toValue: SHEET_H,
        duration: 250,
        useNativeDriver: true,
      }).start();
      // Reset state
      setIsCreating(false);
      setEditingId(null);
    }
  }, [visible]);

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const data = await vocabLabApi.getCardTypes();
      setTypes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const res = await vocabLabApi.createCardType({ name: newName.trim() });
      setTypes([...types, res]);
      setNewName('');
      setIsCreating(false);
    } catch (e) {
      Alert.alert('Error', 'Could not create card type');
    }
  };

  const handleRename = async (id: string) => {
    if (!editName.trim()) {
      setEditingId(null);
      return;
    }
    try {
      const res = await vocabLabApi.updateCardType(id, { name: editName.trim() });
      setTypes(types.map((t) => (t.id === id ? { ...t, name: res.name } : t)));
      setEditingId(null);
    } catch (e) {
      Alert.alert('Error', 'Could not rename card type');
    }
  };

  const handleDelete = (id: string, isBuiltIn: boolean) => {
    if (isBuiltIn) {
      Alert.alert('Cannot delete', 'Built-in card types cannot be deleted.');
      return;
    }
    Alert.alert('Delete Card Type?', 'Are you sure? This might affect existing flashcards.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await vocabLabApi.deleteCardType(id);
            setTypes(types.filter((t) => t.id !== id));
          } catch (e) {
            Alert.alert('Error', 'Could not delete card type');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: CardType }) => {
    const isEditing = editingId === item.id;

    if (isEditing) {
      return (
        <View style={s.itemRow}>
          <TextInput
            style={s.editInput}
            value={editName}
            onChangeText={setEditName}
            autoFocus
            onSubmitEditing={() => handleRename(item.id)}
            returnKeyType="done"
          />
          <View style={s.itemActions}>
            <TouchableOpacity onPress={() => handleRename(item.id)} style={s.actionBtn}>
              <Ionicons name="checkmark" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditingId(null)} style={s.actionBtn}>
              <Ionicons name="close" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={s.itemRow}>
        <TouchableOpacity
          style={s.itemContent}
          onPress={() => onSelect?.(item)}
          disabled={!onSelect}
        >
          <Text style={s.itemName}>{item.name}</Text>
          {item.isBuiltIn ? (
            <View style={s.badgeBuiltin}>
              <Text style={s.badgeText}>Built-in</Text>
            </View>
          ) : (
            <Text style={s.fieldCount}>{item.fields?.length || 0} fields</Text>
          )}
        </TouchableOpacity>

        <View style={s.itemActions}>
          {!item.isBuiltIn && onEditFields && (
            <TouchableOpacity onPress={() => onEditFields(item)} style={s.actionBtn}>
              <Ionicons name="options-outline" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
          {!item.isBuiltIn && (
            <TouchableOpacity
              onPress={() => {
                setEditingId(item.id);
                setEditName(item.name);
              }}
              style={s.actionBtn}
            >
              <Ionicons name="pencil" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
          {!item.isBuiltIn && (
            <TouchableOpacity
              onPress={() => handleDelete(item.id, item.isBuiltIn)}
              style={s.actionBtn}
            >
              <Ionicons name="trash-outline" size={18} color={COLORS.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose} />
      <Animated.View style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <View style={s.handle} />
          <View style={s.header}>
            <Text style={s.title}>Manage Card Types</Text>
            <TouchableOpacity style={s.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {loading && types.length === 0 ? (
            <ActivityIndicator style={{ marginTop: SPACING.xl }} color={COLORS.primary} />
          ) : (
            <FlatList
              data={types}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={{ padding: SPACING.md, paddingBottom: SPACING.xxl }}
              ListHeaderComponent={
                <View style={{ marginBottom: SPACING.md }}>
                  {isCreating ? (
                    <View style={s.createForm}>
                      <TextInput
                        style={s.createInput}
                        value={newName}
                        onChangeText={setNewName}
                        placeholder="Card type name..."
                        autoFocus
                        onSubmitEditing={handleCreate}
                        returnKeyType="done"
                      />
                      <TouchableOpacity style={s.createBtnConfirm} onPress={handleCreate}>
                        <Ionicons name="checkmark" size={20} color="#fff" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={s.createBtnCancel}
                        onPress={() => setIsCreating(false)}
                      >
                        <Ionicons name="close" size={20} color={COLORS.textMuted} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={s.createTrigger} onPress={() => setIsCreating(true)}>
                      <Ionicons name="add" size={20} color={COLORS.primary} />
                      <Text style={s.createTriggerText}>Create New Card Type</Text>
                    </TouchableOpacity>
                  )}
                </View>
              }
            />
          )}
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_H,
    backgroundColor: '#fff',
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  title: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  itemName: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text },
  badgeBuiltin: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  fieldCount: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  actionBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
  },
  editInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  createTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.primary + '10',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    borderStyle: 'dashed',
  },
  createTriggerText: { color: COLORS.primary, fontWeight: '700', fontSize: FONT_SIZES.sm },
  createForm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  createInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    backgroundColor: '#fff',
  },
  createBtnConfirm: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createBtnCancel: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
