import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, SPACING } from '@/constants';
import { shadowingApi } from '@/services/features.api';
import { toast } from '../ui/Toaster';
import FolderPicker from './FolderPicker';

interface AddVideoModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_CATEGORIES = [
  'General',
  'TED Talk',
  'IELTS Speaking',
  'Movie & TV',
  'Music / Song',
  'Podcast',
  'Business / Tech',
];

export default function AddVideoModal({ visible, onClose, onSuccess }: AddVideoModalProps) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [folder, setFolder] = useState('General');
  const [loading, setLoading] = useState(false);
  const [youtubeId, setYoutubeId] = useState<string | null>(null);

  // Parse YouTube URL to extract Video ID
  const extractYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\/shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  useEffect(() => {
    const id = extractYouTubeId(youtubeUrl);
    setYoutubeId(id);
  }, [youtubeUrl]);

  useEffect(() => {
    if (visible) {
      setYoutubeUrl('');
      setTitle('');
      setCategory('General');
      setFolder('General');
      setYoutubeId(null);
    }
  }, [visible]);

  const handleSubmit = async () => {
    const trimmedUrl = youtubeUrl.trim();
    const trimmedTitle = title.trim();

    if (!trimmedUrl) {
      toast.error('Error', 'Please enter a YouTube URL');
      return;
    }

    if (!youtubeId) {
      toast.error('Invalid URL', 'Please enter a valid YouTube link');
      return;
    }

    if (!trimmedTitle) {
      toast.error('Error', 'Please enter a video title');
      return;
    }

    setLoading(true);
    try {
      // Trigger import on backend
      const response = await shadowingApi.importVideo({
        youtubeUrl: trimmedUrl,
        title: trimmedTitle,
        folder: folder || 'General',
      });

      toast.info('Importing Video', `Transcribing "${trimmedTitle}" in the background… ETA ~1min.`);

      onSuccess();
      onClose();
    } catch (e: any) {
      console.error('Failed to import YouTube video', e);
      toast.error('Import Failed', e.message || 'Something went wrong while importing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalContent}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Import from YouTube</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={22} color={COLORS.gray[500]} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* 1. YouTube Link input */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>YouTube URL</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="logo-youtube"
                      size={18}
                      color="#FF0000"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Paste YouTube link here..."
                      placeholderTextColor={COLORS.gray[400]}
                      value={youtubeUrl}
                      onChangeText={setYoutubeUrl}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                {/* Video Preview (Displays if YouTube ID is valid) */}
                {youtubeId && (
                  <View style={styles.previewContainer}>
                    <View style={styles.thumbnailWrapper}>
                      <Image
                        source={{ uri: `https://img.youtube.com/vi/${youtubeId}/0.jpg` }}
                        style={styles.thumbnail}
                        resizeMode="cover"
                      />
                      <View style={styles.playOverlay}>
                        <Ionicons name="play-circle" size={36} color="rgba(255,255,255,0.85)" />
                      </View>
                    </View>
                    <Text style={styles.previewLabel}>Video detected successfully! ✨</Text>
                  </View>
                )}

                {/* 2. Title Input */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Video Title</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="document-text-outline"
                      size={18}
                      color={COLORS.gray[500]}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Give this video a memorable title..."
                      placeholderTextColor={COLORS.gray[400]}
                      value={title}
                      onChangeText={setTitle}
                    />
                  </View>
                </View>

                {/* 3. Folder Management Integration */}
                <FolderPicker selectedFolder={folder} onSelectFolder={setFolder} />

                {/* 4. Category Pills Selector */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Category</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryPills}
                  >
                    {PRESET_CATEGORIES.map((cat) => {
                      const isActive = category === cat;
                      return (
                        <TouchableOpacity
                          key={cat}
                          style={[styles.pill, isActive && styles.pillActive]}
                          onPress={() => setCategory(cat)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.btn, styles.btnCancel]}
                    onPress={onClose}
                    disabled={loading}
                  >
                    <Text style={styles.btnTextCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, styles.btnSubmit]}
                    onPress={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color={COLORS.text} />
                    ) : (
                      <>
                        <Text style={styles.btnTextSubmit}>Import Video</Text>
                        <Ionicons
                          name="cloud-download"
                          size={16}
                          color={COLORS.text}
                          style={{ marginLeft: 6 }}
                        />
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.xl * 2,
    borderTopRightRadius: RADIUS.xl * 2,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.text,
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  formGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    height: 48,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.text,
  },
  previewContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  thumbnailWrapper: {
    width: '100%',
    height: 140,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewLabel: {
    fontFamily: FONTS.semibold,
    fontSize: 11,
    color: COLORS.success,
    marginTop: SPACING.xs,
  },
  categoryPills: {
    gap: 6,
    paddingVertical: SPACING.xs,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  pillTextActive: {
    color: COLORS.text,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: SPACING.lg,
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: RADIUS.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancel: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btnSubmit: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnTextCancel: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  btnTextSubmit: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.text,
  },
});
