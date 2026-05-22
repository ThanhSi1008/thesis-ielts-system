import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '@/constants';
import { postsApi } from '@/services';
import type { Post, PostType } from '@/types';
import { Avatar } from './Avatar';

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
  const [type, setType] = useState<PostType>('GENERAL');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<{ uri: string; name: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

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
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 4 - images.length,
    });
    if (!result.canceled) {
      const picked = result.assets.map((a) => ({
        uri: a.uri,
        name: a.fileName ?? `photo_${Date.now()}.jpg`,
      }));
      setImages((prev) => [...prev, ...picked].slice(0, 4));
    }
  };

  const removeImage = (idx: number) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const submit = async () => {
    if (!body.trim()) return;
    setLoading(true);
    try {
      // Upload images first
      let imageUrls: string[] = [];
      if (images.length > 0) {
        setUploading(true);
        const uploads = await Promise.all(
          images.map((img) => {
            const fd = new FormData();
            fd.append('file', { uri: img.uri, name: img.name, type: 'image/jpeg' } as any);
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
      onCreated(post);
      reset();
      onClose();
    } catch {
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const authorName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Me';
  const canPost = body.trim().length > 0 && !loading;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#fff' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          {/* ── Header ── */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                reset();
                onClose();
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Post</Text>
            <TouchableOpacity
              onPress={submit}
              disabled={!canPost}
              style={[styles.postBtn, !canPost && { opacity: 0.45 }]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#212529" />
              ) : (
                <Text style={styles.postBtnText}>{uploading ? 'Uploading…' : 'POST'}</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Author row ── */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Avatar name={authorName} avatar={user?.avatar} size={44} />
              <View>
                <Text style={{ fontFamily: FONTS.bold, fontSize: 15, color: '#212529' }}>
                  {authorName}
                </Text>
                <Text style={{ fontFamily: FONTS.medium, fontSize: 12, color: '#9ca3af' }}>
                  Public post
                </Text>
              </View>
            </View>

            {/* ── Post type chips ── */}
            <Text style={styles.sectionLabel}>Post type</Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {POST_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.value}
                  onPress={() => setType(t.value)}
                  style={[
                    styles.typeChip,
                    type === t.value && {
                      backgroundColor: COLORS.primary,
                      borderColor: COLORS.primary,
                    },
                  ]}
                >
                  <Text style={[styles.typeChipText, type === t.value && { color: '#212529' }]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── Title ── */}
            <Text style={styles.sectionLabel}>
              Title{' '}
              <Text style={{ color: '#9ca3af', fontFamily: FONTS.regular }}>(optional)</Text>
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Give your post a title…"
              placeholderTextColor="#9ca3af"
              style={[styles.fieldInput, { marginBottom: 16 }]}
            />

            {/* ── Body ── */}
            <Text style={styles.sectionLabel}>
              Content <Text style={{ color: '#ef4444' }}>*</Text>
            </Text>
            <TextInput
              value={body}
              onChangeText={setBody}
              multiline
              placeholder="What's on your mind? Share tips, ask questions…"
              placeholderTextColor="#9ca3af"
              style={[styles.bodyInput, { marginBottom: 16 }]}
            />

            {/* ── Image previews ── */}
            {images.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {images.map((img, i) => (
                  <View key={i} style={{ position: 'relative' }}>
                    <Image
                      source={{ uri: img.uri }}
                      style={{ width: 100, height: 100, borderRadius: 12 }}
                    />
                    <TouchableOpacity
                      onPress={() => removeImage(i)}
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        backgroundColor: 'rgba(0,0,0,0.55)',
                        borderRadius: 10,
                        padding: 2,
                      }}
                    >
                      <Ionicons name="close" size={14} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
                {images.length < 4 && (
                  <TouchableOpacity onPress={pickImages} style={styles.addImageBox}>
                    <Ionicons name="add" size={28} color="#9ca3af" />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* ── Tags ── */}
            <Text style={styles.sectionLabel}>Topics & Tags</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {TAGS.map((tag) => {
                const active = tags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    onPress={() =>
                      setTags((p) => (active ? p.filter((t) => t !== tag) : [...p, tag]))
                    }
                    style={[
                      styles.tagChip,
                      active && {
                        backgroundColor: COLORS.primary + '22',
                        borderColor: COLORS.primary,
                      },
                    ]}
                  >
                    <Text style={[styles.tagChipText, active && { color: COLORS.primary }]}>{tag}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* ── Bottom toolbar ── */}
          <View style={styles.modalToolbar}>
            <TouchableOpacity
              onPress={pickImages}
              disabled={images.length >= 4}
              style={[styles.toolbarBtn, images.length >= 4 && { opacity: 0.4 }]}
            >
              <Ionicons name="image-outline" size={22} color={COLORS.primary} />
              <Text style={styles.toolbarBtnText}>
                Photo{images.length > 0 ? ` (${images.length}/4)` : ''}
              </Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <Text
              style={{
                fontFamily: FONTS.medium,
                fontSize: 12,
                color: body.length > 1000 ? '#ef4444' : '#9ca3af',
              }}
            >
              {body.length}/1000
            </Text>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: '#212529',
  },
  postBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  postBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#212529',
  },
  bodyInput: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: '#212529',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  typeChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  typeChipText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#64748b',
  },
  tagChip: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tagChipText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#64748b',
  },
  sectionLabel: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#374151',
    marginBottom: 8,
  },
  fieldInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: '#212529',
  },
  addImageBox: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  modalToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  toolbarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toolbarBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.primary,
  },
});
