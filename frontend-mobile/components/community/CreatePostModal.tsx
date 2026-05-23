import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { toast } from '@/components/ui/index';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { postsApi } from '@/services';
import type { Post, PostType } from '@/types';
import Avatar from '../atoms/Avatar';
import Text from '../atoms/Text';
import Button from '../atoms/Button';
import Chip from '../atoms/Chip';
import BottomSheet from '../organisms/BottomSheet';
import * as Haptics from 'expo-haptics';

const TAGS = [
  'Listening',
  'Reading',
  'Writing',
  'Speaking',
  'Grammar',
  'Pronunciation',
  'TOEIC',
  'IELTS',
];

const POST_TYPES: { value: PostType; label: string }[] = [
  { value: 'GENERAL', label: 'General' },
  { value: 'STUDY_TIP', label: 'Study Tip' },
  { value: 'SCORE_ACHIEVEMENT', label: 'Achievement' },
];

export function CreatePostModal({
  visible,
  onClose,
  onCreated,
  user,
}: {
  visible: boolean;
  onClose: () => void;
  onCreated: (p: Post) => void;
  user: any;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const [type, setType] = useState<PostType>('GENERAL');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<{ uri: string; name: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [visible]);

  const reset = () => {
    setType('GENERAL');
    setTitle('');
    setBody('');
    setTags([]);
    setImages([]);
  };

  const pickImages = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      toast.info('Permission required', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.5,
      selectionLimit: 4 - images.length,
    });
    if (!result.canceled) {
      const picked = result.assets.map((a, idx) => {
        const ext = a.uri.split('.').pop()?.toLowerCase() || 'jpg';
        return {
          uri: a.uri,
          name: `photo_${Date.now()}_${idx}.${ext}`,
        };
      });
      setImages((prev) => [...prev, ...picked].slice(0, 4));
    }
  };

  const removeImage = (idx: number) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const submit = async () => {
    if (!body.trim()) return;
    setLoading(true);
    try {
      let imageUrls: string[] = [];
      if (images.length > 0) {
        setUploading(true);
        const uploads = await Promise.all(
          images.map((img) => {
            const fd = new FormData();
            const ext = img.name.split('.').pop()?.toLowerCase() || 'jpeg';
            const mimeType = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'image/jpeg';
            
            fd.append('file', { uri: img.uri, name: img.name, type: mimeType } as any);
            return postsApi.uploadImage(fd);
          }),
        );
        imageUrls = uploads.map((r) => r.url);
        setUploading(false);
      }
      const post = await postsApi.createPost({
        type,
        title: title.trim() || undefined,
        body: body.trim(),
        tags,
        imageUrls,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onCreated(post);
      reset();
      onClose();
    } catch (err: any) {
      if (__DEV__) console.error('[CreatePost] Failed to create post:', err);
      const msg = err?.message ?? 'Failed to create post. Please try again.';
      toast.error('Error', msg);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const authorName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Me';
  const canPost = body.trim().length > 0 && !loading;

  return (
    <BottomSheet
      visible={visible}
      onClose={() => {
        reset();
        onClose();
      }}
      title="New Post"
      snapPointHeight={0.9}
    >
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Author row */}
          <View style={styles.authorRow}>
            <Avatar name={authorName} avatar={user?.avatar} size="md" />
            <View>
              <Text variant="body" weight="bold" style={{ color: colors.text }}>
                {authorName}
              </Text>
              <Text variant="caption" style={{ color: colors.textMuted }}>
                Public post
              </Text>
            </View>
          </View>

          {/* Post type chips */}
          <Text variant="label" weight="bold" style={styles.sectionLabel}>Post type</Text>
          <View style={styles.chipRow}>
            {POST_TYPES.map((t) => (
              <Chip
                key={t.value}
                label={t.label}
                active={type === t.value}
                onPress={() => setType(t.value)}
              />
            ))}
          </View>

          {/* Title */}
          <Text variant="label" weight="bold" style={styles.sectionLabel}>
            Title <Text variant="caption" style={{ color: colors.textMuted }}>(optional)</Text>
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Give your post a title…"
            placeholderTextColor={colors.textMuted}
            style={styles.fieldInput}
          />

          {/* Body */}
          <Text variant="label" weight="bold" style={styles.sectionLabel}>
            Content <Text style={{ color: '#ef4444' }}>*</Text>
          </Text>
          <TextInput
            value={body}
            onChangeText={setBody}
            multiline
            placeholder="What's on your mind? Share tips, ask questions…"
            placeholderTextColor={colors.textMuted}
            style={styles.bodyInput}
          />

          {/* Image previews */}
          {images.length > 0 && (
            <View style={styles.imageGrid}>
              {images.map((img, i) => (
                <View key={i} style={{ position: 'relative' }}>
                  <Image
                    source={{ uri: img.uri }}
                    style={styles.previewImage}
                  />
                  <TouchableOpacity
                    onPress={() => removeImage(i)}
                    style={styles.removeImageBtn}
                  >
                    <Ionicons name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < 4 && (
                <TouchableOpacity onPress={pickImages} style={styles.addImageBox}>
                  <Ionicons name="add" size={28} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Tags */}
          <Text variant="label" weight="bold" style={styles.sectionLabel}>Topics & Tags</Text>
          <View style={styles.tagGrid}>
            {TAGS.map((tag) => {
              const active = tags.includes(tag);
              return (
                <Chip
                  key={tag}
                  label={`#${tag}`}
                  active={active}
                  onPress={() =>
                    setTags((p) => (active ? p.filter((t) => t !== tag) : [...p, tag]))
                  }
                />
              );
            })}
          </View>
        </ScrollView>

        {/* Bottom toolbar & Actions */}
        <View style={styles.modalToolbar}>
          <TouchableOpacity
            onPress={pickImages}
            disabled={images.length >= 4}
            style={[styles.toolbarBtn, images.length >= 4 && { opacity: 0.4 }]}
          >
            <Ionicons name="image-outline" size={22} color={COLORS.primary} />
            <Text variant="label" weight="bold" style={{ color: COLORS.primary }}>
              Photo{images.length > 0 ? ` (${images.length}/4)` : ''}
            </Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <Text
            variant="caption"
            style={{
              color: body.length > 1000 ? '#ef4444' : colors.textMuted,
              marginRight: 12,
            }}
          >
            {body.length}/1000
          </Text>
          <Button
            title={uploading ? 'Uploading…' : 'POST'}
            disabled={!canPost}
            onPress={submit}
            loading={loading}
            size="sm"
          />
        </View>
      </View>
    </BottomSheet>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    authorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    sectionLabel: {
      color: colors.text,
      marginTop: 12,
      marginBottom: 8,
    },
    chipRow: {
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
      marginBottom: 12,
    },
    tagGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
      marginBottom: 12,
    },
    fieldInput: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontFamily: FONTS.regular,
      fontSize: 15,
      color: colors.text,
      marginBottom: 12,
    },
    bodyInput: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      fontFamily: FONTS.regular,
      fontSize: 15,
      color: colors.text,
      minHeight: 120,
      textAlignVertical: 'top',
      marginBottom: 12,
    },
    imageGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    previewImage: {
      width: 80,
      height: 80,
      borderRadius: 12,
    },
    removeImageBtn: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: 'rgba(0,0,0,0.55)',
      borderRadius: 10,
      padding: 2,
    },
    addImageBox: {
      width: 80,
      height: 80,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
    },
    modalToolbar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.bgElevated || colors.card,
    },
    toolbarBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
  });
}
