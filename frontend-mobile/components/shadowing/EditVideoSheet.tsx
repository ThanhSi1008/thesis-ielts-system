import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { SPACING, RADIUS, FONT_SIZES, FONTS } from '@/constants';
import BottomSheet from '../organisms/BottomSheet';
import Text from '../atoms/Text';
import FolderPicker from './FolderPicker';

interface EditVideoSheetProps {
  visible: boolean;
  onClose: () => void;
  video: { id: string; title: string; folder?: string; category?: string } | null;
  onSave: (id: string, dto: { title?: string; folder?: string; category?: string }) => Promise<void> | void;
}

export default function EditVideoSheet({
  visible,
  onClose,
  video,
  onSave,
}: EditVideoSheetProps) {
  const { colors } = useTheme();

  const [title, setTitle] = useState('');
  const [folder, setFolder] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && video) {
      setTitle(video.title || '');
      setFolder(video.folder || 'General');
      setCategory(video.category || 'YouTube');
      setLoading(false);
    }
  }, [visible, video]);

  const handleSave = async () => {
    if (!video || !title.trim()) return;
    setLoading(true);
    try {
      await onSave(video.id, {
        title: title.trim(),
        folder: folder.trim(),
        category: category.trim(),
      });
      onClose();
    } catch (e) {
      // Error is toasted inside the handler
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Chỉnh sửa video"
      snapPointHeight={0.6}
    >
      <View style={styles.container}>
        <View style={styles.form}>
          {/* Title Input */}
          <View style={styles.inputGroup}>
            <Text variant="body" weight="bold" style={[styles.label, { color: colors.text }]}>
              Tiêu đề video
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              placeholder="Nhập tiêu đề video..."
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
              maxLength={150}
            />
          </View>

          {/* Reusable Folder Picker */}
          <FolderPicker selectedFolder={folder} onSelectFolder={setFolder} />

          {/* Category Input */}
          <View style={styles.inputGroup}>
            <Text variant="body" weight="bold" style={[styles.label, { color: colors.text }]}>
              Danh mục
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              placeholder="Nhập danh mục..."
              placeholderTextColor={colors.textMuted}
              value={category}
              onChangeText={setCategory}
              maxLength={40}
            />
          </View>

          {/* Action buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.btn, styles.btnCancel, { borderColor: colors.border }]}
              onPress={onClose}
              disabled={loading}
            >
              <Text variant="body" weight="medium" style={{ color: colors.textSecondary }}>
                Hủy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnSave, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              disabled={loading || !title.trim()}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text variant="body" weight="bold" style={{ color: '#fff' }}>
                  Lưu thay đổi
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: SPACING.xs,
  },
  label: {
    fontSize: 12,
  },
  input: {
    height: 48,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  btn: {
    flex: 1,
    height: 46,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancel: {
    borderWidth: 1,
  },
  btnSave: {},
});
