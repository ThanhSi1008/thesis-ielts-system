import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { SPACING, RADIUS, FONT_SIZES, FONTS, COLORS } from '@/constants';
import BottomSheet from '../organisms/BottomSheet';
import Text from '../atoms/Text';
import Button from '../atoms/Button';
import ConfirmDialog from '../organisms/ConfirmDialog';

interface FolderManageSheetProps {
  visible: boolean;
  onClose: () => void;
  folderName: string;
  onRename: (name: string, newName: string) => Promise<void> | void;
  onDelete: (name: string) => Promise<void> | void;
}

export default function FolderManageSheet({
  visible,
  onClose,
  folderName,
  onRename,
  onDelete,
}: FolderManageSheetProps) {
  const { colors } = useTheme();
  
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(folderName);
  const [loading, setLoading] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsEditing(false);
      setNewName(folderName);
      setLoading(false);
      setDeleteConfirmVisible(false);
    }
  }, [visible, folderName]);

  const handleRenameSubmit = async () => {
    if (!newName.trim() || newName.trim() === folderName) {
      setIsEditing(false);
      return;
    }
    setLoading(true);
    try {
      await onRename(folderName, newName.trim());
      setIsEditing(false);
      onClose();
    } catch (e) {
      // Error is toasted inside the handler
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    setLoading(true);
    try {
      await onDelete(folderName);
      setDeleteConfirmVisible(false);
      onClose();
    } catch (e) {
      // Error is toasted inside the handler
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BottomSheet
        visible={visible && !deleteConfirmVisible}
        onClose={onClose}
        title={isEditing ? 'Đổi tên thư mục' : `Thư mục: ${folderName}`}
        snapPointHeight={isEditing ? 0.35 : 0.28}
      >
        <View style={styles.container}>
          {isEditing ? (
            <View style={styles.form}>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  },
                ]}
                placeholder="Tên thư mục mới..."
                placeholderTextColor={colors.textMuted}
                value={newName}
                onChangeText={setNewName}
                autoFocus
                maxLength={40}
              />
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnCancel, { borderColor: colors.border }]}
                  onPress={() => setIsEditing(false)}
                  disabled={loading}
                >
                  <Text variant="body" weight="medium" style={{ color: colors.textSecondary }}>
                    Hủy
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.btnSave, { backgroundColor: colors.primary }]}
                  onPress={handleRenameSubmit}
                  disabled={loading || !newName.trim()}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text variant="body" weight="bold" style={{ color: '#fff' }}>
                      Lưu
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.menu}>
              <TouchableOpacity
                style={[styles.menuItem, { borderBottomColor: colors.border + '30' }]}
                onPress={() => setIsEditing(true)}
              >
                <Ionicons name="pencil-outline" size={18} color={colors.textSecondary} />
                <Text variant="body" weight="medium" color="text">
                  Đổi tên thư mục
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuItem, styles.deleteItem]}
                onPress={() => setDeleteConfirmVisible(true)}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                <Text variant="body" weight="medium" style={{ color: '#EF4444' }}>
                  Xóa thư mục và các video
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </BottomSheet>

      {/* Warning delete dialog */}
      <ConfirmDialog
        visible={deleteConfirmVisible}
        onClose={() => setDeleteConfirmVisible(false)}
        title="Xóa thư mục?"
        message={`Bạn có chắc muốn xóa thư mục "${folderName}" không? Toàn bộ các video custom trong thư mục này sẽ bị xóa vĩnh viễn và không thể khôi phục.`}
        variant="destructive"
        primaryAction={{
          title: 'Xóa thư mục',
          onPress: handleDeleteSubmit,
        }}
        secondaryAction={{
          title: 'Hủy bỏ',
          onPress: () => setDeleteConfirmVisible(false),
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  menu: {
    gap: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  deleteItem: {
    borderBottomWidth: 0,
  },
  form: {
    gap: 16,
  },
  input: {
    height: 48,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
    height: 44,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancel: {
    borderWidth: 1,
  },
  btnSave: {},
});
