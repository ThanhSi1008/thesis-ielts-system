import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, RefreshControl, Modal,
  KeyboardAvoidingView, Platform, Image, Pressable,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { postsApi, gamificationApi } from '@/services/posts.api';
import { timeAgo } from '@/utils/timeAgo';
import type { Post, PostType, LeaderboardEntry } from '@/types';

// ─── Avatar ────────────────────────────────────────────────────
function Avatar({ name, avatar, color, size = 38 }: { name?: string; avatar?: string | null; color?: string; size?: number }) {
  if (avatar) {
    return <Image source={{ uri: avatar }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  const bg = color ?? '#4CAF50';
  const initial = name ? name[0].toUpperCase() : '?';
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg + '22', borderColor: bg + '44', borderWidth: 2, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: 'Farro-Bold', fontSize: size * 0.38, color: bg }}>{initial}</Text>
    </View>
  );
}

// ─── TypePill ──────────────────────────────────────────────────
function TypePill({ type }: { type: PostType }) {
  if (type === 'STUDY_TIP') return (
    <View style={[s.pill, { backgroundColor: 'rgba(255,198,0,.18)' }]}>
      <Ionicons name="bulb" size={10} color="#92650a" />
      <Text style={[s.pillText, { color: '#92650a' }]}>STUDY TIP</Text>
    </View>
  );
  if (type === 'SCORE_ACHIEVEMENT') return (
    <View style={[s.pill, { backgroundColor: 'rgba(76,175,80,.12)' }]}>
      <Ionicons name="trophy" size={10} color="#2e7d32" />
      <Text style={[s.pillText, { color: '#2e7d32' }]}>ACHIEVEMENT</Text>
    </View>
  );
  return null;
}

// ─── PostCard ──────────────────────────────────────────────────
function PostCard({ post, currentUserId, onLike, onBookmark, onDelete }: {
  post: Post; currentUserId?: string;
  onLike: (id: string) => void; onBookmark: (id: string) => void; onDelete: (id: string) => void;
}) {
  const authorName = [post.author.firstName, post.author.lastName].filter(Boolean).join(' ') || 'Anonymous';
  const isOwner = post.authorId === currentUserId;
  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Avatar name={authorName} avatar={post.author.avatar} size={38} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Text style={s.authorName}>{authorName}</Text>
            {post.type !== 'GENERAL' && <TypePill type={post.type} />}
          </View>
          <Text style={s.timeText}>{timeAgo(post.createdAt)}</Text>
        </View>
        {isOwner && (
          <TouchableOpacity onPress={() => Alert.alert('Delete Post?', '', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => onDelete(post.id) },
          ])}>
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>

      {post.title ? <Text style={s.postTitle}>{post.title}</Text> : null}
      <Text style={s.postBody}>{post.body}</Text>

      {post.imageUrls?.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
          {post.imageUrls.map((url, i) => (
            <Image key={i} source={{ uri: url }} style={{ width: 200, height: 140, borderRadius: 12, marginRight: 8 }} />
          ))}
        </ScrollView>
      )}

      {post.tags?.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {post.tags.map(tag => (
            <View key={tag} style={s.tag}><Text style={s.tagText}>#{tag}</Text></View>
          ))}
        </View>
      )}

      <View style={s.actions}>
        <TouchableOpacity onPress={() => onLike(post.id)} style={s.actionBtn}>
          <Ionicons name={post.isLiked ? 'heart' : 'heart-outline'} size={18} color={post.isLiked ? '#ef4444' : '#9ca3af'} />
          {post.likeCount > 0 && <Text style={[s.actionText, post.isLiked && { color: '#ef4444' }]}>{post.likeCount}</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtn}>
          <Ionicons name="chatbubble-outline" size={17} color="#9ca3af" />
          {post.commentCount > 0 && <Text style={s.actionText}>{post.commentCount}</Text>}
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => onBookmark(post.id)} style={s.actionBtn}>
          <Ionicons name={post.isBookmarked ? 'bookmark' : 'bookmark-outline'} size={18} color={post.isBookmarked ? COLORS.primary : '#9ca3af'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── CreatePostModal ───────────────────────────────────────────
const TAGS = ['Listening', 'Reading', 'Writing', 'Speaking', 'Grammar', 'Pronunciation', 'TOEIC', 'IELTS'];
const POST_TYPES: { value: PostType; label: string }[] = [
  { value: 'GENERAL', label: 'General' },
  { value: 'STUDY_TIP', label: 'Study Tip' },
  { value: 'SCORE_ACHIEVEMENT', label: 'Achievement' },
];

function CreatePostModal({ visible, onClose, onCreated, user }: {
  visible: boolean; onClose: () => void;
  onCreated: (p: Post) => void; user: any;
}) {
  const [type, setType] = useState<PostType>('GENERAL');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<{ uri: string; name: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const reset = () => { setType('GENERAL'); setTitle(''); setBody(''); setTags([]); setImages([]); };

  const pickImages = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission required', 'Please allow access to your photo library.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 4 - images.length,
    });
    if (!result.canceled) {
      const picked = result.assets.map(a => ({ uri: a.uri, name: a.fileName ?? `photo_${Date.now()}.jpg` }));
      setImages(prev => [...prev, ...picked].slice(0, 4));
    }
  };

  const removeImage = (idx: number) => setImages(prev => prev.filter((_, i) => i !== idx));

  const submit = async () => {
    if (!body.trim()) return;
    setLoading(true);
    try {
      // Upload images first
      let imageUrls: string[] = [];
      if (images.length > 0) {
        setUploading(true);
        const uploads = await Promise.all(images.map(img => {
          const fd = new FormData();
          fd.append('file', { uri: img.uri, name: img.name, type: 'image/jpeg' } as any);
          return postsApi.uploadImage(fd);
        }));
        imageUrls = uploads.map(r => r.url);
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
    } finally { setLoading(false); setUploading(false); }
  };

  const authorName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Me';
  const canPost = body.trim().length > 0 && !loading;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>

          {/* ── Header ── */}
          <View style={s.modalHeader}>
            <TouchableOpacity onPress={() => { reset(); onClose(); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={s.modalTitle}>New Post</Text>
            <TouchableOpacity onPress={submit} disabled={!canPost}
              style={[s.postBtn, !canPost && { opacity: 0.45 }]}>
              {loading
                ? <ActivityIndicator size="small" color="#212529" />
                : <Text style={s.postBtnText}>{uploading ? 'Uploading…' : 'POST'}</Text>}
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
                <Text style={{ fontFamily: 'Farro-Bold', fontSize: 15, color: '#212529' }}>{authorName}</Text>
                <Text style={{ fontFamily: 'Farro-Medium', fontSize: 12, color: '#9ca3af' }}>Public post</Text>
              </View>
            </View>

            {/* ── Post type chips ── */}
            <Text style={s.sectionLabel}>Post type</Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {POST_TYPES.map(t => (
                <TouchableOpacity key={t.value} onPress={() => setType(t.value)}
                  style={[s.typeChip, type === t.value && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}>
                  <Text style={[s.typeChipText, type === t.value && { color: '#212529' }]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── Title ── */}
            <Text style={s.sectionLabel}>Title <Text style={{ color: '#9ca3af', fontFamily: 'Farro-Regular' }}>(optional)</Text></Text>
            <TextInput
              value={title} onChangeText={setTitle}
              placeholder="Give your post a title…"
              placeholderTextColor="#9ca3af"
              style={[s.fieldInput, { marginBottom: 16 }]}
            />

            {/* ── Body ── */}
            <Text style={s.sectionLabel}>Content <Text style={{ color: '#ef4444' }}>*</Text></Text>
            <TextInput
              value={body} onChangeText={setBody} multiline
              placeholder="What's on your mind? Share tips, ask questions…"
              placeholderTextColor="#9ca3af"
              style={[s.bodyInput, { marginBottom: 16 }]}
            />

            {/* ── Image previews ── */}
            {images.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {images.map((img, i) => (
                  <View key={i} style={{ position: 'relative' }}>
                    <Image source={{ uri: img.uri }} style={{ width: 100, height: 100, borderRadius: 12 }} />
                    <TouchableOpacity onPress={() => removeImage(i)}
                      style={{ position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 10, padding: 2 }}>
                      <Ionicons name="close" size={14} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
                {images.length < 4 && (
                  <TouchableOpacity onPress={pickImages} style={s.addImageBox}>
                    <Ionicons name="add" size={28} color="#9ca3af" />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* ── Tags ── */}
            <Text style={s.sectionLabel}>Topics & Tags</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {TAGS.map(tag => {
                const active = tags.includes(tag);
                return (
                  <TouchableOpacity key={tag}
                    onPress={() => setTags(p => active ? p.filter(t => t !== tag) : [...p, tag])}
                    style={[s.tagChip, active && { backgroundColor: COLORS.primary + '22', borderColor: COLORS.primary }]}>
                    <Text style={[s.tagChipText, active && { color: COLORS.primary }]}>{tag}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* ── Bottom toolbar ── */}
          <View style={s.modalToolbar}>
            <TouchableOpacity onPress={pickImages} disabled={images.length >= 4}
              style={[s.toolbarBtn, images.length >= 4 && { opacity: 0.4 }]}>
              <Ionicons name="image-outline" size={22} color={COLORS.primary} />
              <Text style={s.toolbarBtnText}>Photo{images.length > 0 ? ` (${images.length}/4)` : ''}</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <Text style={{ fontFamily: 'Farro-Medium', fontSize: 12, color: body.length > 1000 ? '#ef4444' : '#9ca3af' }}>
              {body.length}/1000
            </Text>
          </View>

        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── LeaderboardView ───────────────────────────────────────────

function LeaderboardView({ currentUserId }: { currentUserId?: string }) {
  const [type, setType] = useState<'xp_weekly' | 'streak'>('xp_weekly');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    gamificationApi.getLeaderboard(type, 10)
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [type]);

  const RANK_COLOR: Record<number, string> = { 1: '#FFC600', 2: '#94a3b8', 3: '#cd7f32' };

  return (
    <View style={s.card}>
      <View style={{ flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 10, padding: 4, marginBottom: 14 }}>
        {(['xp_weekly', 'streak'] as const).map(t => (
          <TouchableOpacity key={t} onPress={() => setType(t)} style={[{ flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' }, type === t && { backgroundColor: '#fff' }]}>
            <Text style={{ fontFamily: 'Farro-Bold', fontSize: 13, color: type === t ? '#212529' : '#64748b' }}>
              {t === 'xp_weekly' ? 'XP This Week' : 'Streak'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} />
      ) : entries.length === 0 ? (
        <Text style={{ textAlign: 'center', color: '#9ca3af', fontFamily: 'Farro-Medium', padding: 20 }}>No data yet</Text>
      ) : entries.map((entry, idx) => {
        const isMe = entry.userId === currentUserId;
        const col = RANK_COLOR[idx + 1];
        return (
          <View key={entry.userId} style={[s.rankRow, isMe && { backgroundColor: 'rgba(255,198,0,.08)', borderColor: 'rgba(255,198,0,.4)' }]}>
            <Text style={[s.rankNum, col && { color: col }]}>
              {idx < 3 ? ['🥇','🥈','🥉'][idx] : `#${entry.rank}`}
            </Text>
            <Avatar name={entry.name} avatar={entry.avatar} size={34} />
            <Text style={[s.rankName, isMe && { color: COLORS.primary }]}>{entry.name}{isMe ? ' (You)' : ''}</Text>
            <View style={{ flex: 1 }} />
            <Text style={s.rankScore}>
              {entry.value} {type === 'streak' ? '🔥' : 'XP'}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────
const TABS = [
  { id: 'all', icon: 'albums-outline', label: 'All Posts' },
  { id: 'tips', icon: 'bulb-outline', label: 'Study Tips' },
  { id: 'achievements', icon: 'trophy-outline', label: 'Achievements' },
  { id: 'leaderboard', icon: 'bar-chart-outline', label: 'Leaderboard' },
] as const;
type TabId = typeof TABS[number]['id'];

const TAB_TYPE_MAP: Record<string, PostType | undefined> = {
  tips: 'STUDY_TIP',
  achievements: 'SCORE_ACHIEVEMENT',
};

export default function CommunityScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const fetchPosts = useCallback(async (cursor?: string) => {
    const type = TAB_TYPE_MAP[activeTab];
    try {
      const res = await postsApi.listPosts({ type, cursor });
      if (cursor) {
        setPosts(prev => [...prev, ...res.items]);
      } else {
        setPosts(res.items);
      }
      setNextCursor(res.nextCursor);
    } catch {
      Alert.alert('Error', 'Failed to load posts');
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'leaderboard') return;
    setLoading(true);
    fetchPosts().finally(() => setLoading(false));
  }, [activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    await fetchPosts(nextCursor);
    setLoadingMore(false);
  };

  const handleLike = async (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId
      ? { ...p, isLiked: !p.isLiked, likeCount: p.likeCount + (p.isLiked ? -1 : 1) }
      : p
    ));
    try { await postsApi.toggleLike(postId); } catch {
      setPosts(prev => prev.map(p => p.id === postId
        ? { ...p, isLiked: !p.isLiked, likeCount: p.likeCount + (p.isLiked ? -1 : 1) }
        : p
      ));
    }
  };

  const handleBookmark = async (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId
      ? { ...p, isBookmarked: !p.isBookmarked }
      : p
    ));
    try { await postsApi.toggleBookmark(postId); } catch {
      setPosts(prev => prev.map(p => p.id === postId
        ? { ...p, isBookmarked: !p.isBookmarked }
        : p
      ));
    }
  };

  const handleDelete = async (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    try { await postsApi.deletePost(postId); } catch {
      Alert.alert('Error', 'Failed to delete post');
    }
  };

  const handleCreated = (post: Post) => {
    setPosts(prev => [post, ...prev]);
    setActiveTab('all');
  };

  const authorName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Me';

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <View>
            <Text style={s.headerSub}>LEXON</Text>
            <Text style={s.headerTitle}>Community</Text>
          </View>
          <TouchableOpacity onPress={() => setShowCreate(true)} style={[s.iconBtn, { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}>
            <Ionicons name="create" size={20} color="#212529" />
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabBar}>
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            return (
              <TouchableOpacity key={tab.id} onPress={() => setActiveTab(tab.id)}
                style={[s.tabBtn, active && s.tabBtnActive]}>
                <Ionicons name={tab.icon as any} size={14} color={active ? '#212529' : '#64748b'} />
                <Text style={[s.tabText, active && s.tabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      {activeTab === 'leaderboard' ? (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <LeaderboardView currentUserId={user?.id} />
        </ScrollView>
      ) : loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 10 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          onScroll={({ nativeEvent: e }) => {
            const near = e.layoutMeasurement.height + e.contentOffset.y >= e.contentSize.height - 200;
            if (near) loadMore();
          }}
          scrollEventThrottle={400}
        >
          {/* Create box */}
          <TouchableOpacity style={s.createBox} onPress={() => setShowCreate(true)}>
            <Avatar name={authorName} avatar={user?.avatar} size={34} />
            <Text style={s.createPlaceholder}>Share with the community…</Text>
            <View style={s.postBtn}><Text style={s.postBtnText}>POST</Text></View>
          </TouchableOpacity>

          {posts.length === 0 ? (
            <View style={{ alignItems: 'center', padding: 40 }}>
              <Ionicons name="albums-outline" size={48} color="#d1d5db" />
              <Text style={{ fontFamily: 'Farro-Medium', color: '#9ca3af', marginTop: 12 }}>No posts yet. Be the first!</Text>
            </View>
          ) : posts.map(post => (
            <PostCard key={post.id} post={post} currentUserId={user?.id}
              onLike={handleLike} onBookmark={handleBookmark} onDelete={handleDelete} />
          ))}

          {loadingMore && <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 12 }} />}
        </ScrollView>
      )}

      <CreatePostModal visible={showCreate} onClose={() => setShowCreate(false)} onCreated={handleCreated} user={user} />
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { backgroundColor: 'rgba(248,249,250,0.97)', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  headerSub: { fontFamily: 'Farro-Bold', fontSize: 10, color: '#9ca3af', letterSpacing: 1 },
  headerTitle: { fontFamily: 'Farro-Bold', fontSize: 24, color: '#212529' },
  iconBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  tabBar: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  tabBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#f0f0f0' },
  tabBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { fontFamily: 'Farro-Bold', fontSize: 13, color: '#64748b' },
  tabTextActive: { color: '#212529' },
  createBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#f0f0f0' },
  createPlaceholder: { flex: 1, fontFamily: 'Farro-Medium', fontSize: 14, color: '#9ca3af' },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#f0f0f0' },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  authorName: { fontFamily: 'Farro-Bold', fontSize: 15, color: '#212529' },
  timeText: { fontFamily: 'Farro-Medium', fontSize: 12, color: '#9ca3af', marginTop: 2 },
  postTitle: { fontFamily: 'Farro-Bold', fontSize: 16, color: '#212529', marginBottom: 6 },
  postBody: { fontFamily: 'Farro-Regular', fontSize: 15, color: '#374151', lineHeight: 22, marginBottom: 10 },
  tag: { backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { fontFamily: 'Farro-Medium', fontSize: 12, color: '#64748b' },
  actions: { flexDirection: 'row', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f9fafb' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, marginRight: 14 },
  actionText: { fontFamily: 'Farro-Bold', fontSize: 13, color: '#9ca3af' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 3, paddingHorizontal: 8, borderRadius: 12 },
  pillText: { fontFamily: 'Farro-Bold', fontSize: 10, letterSpacing: 0.5 },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#f0f0f0', marginBottom: 6 },
  rankNum: { width: 28, textAlign: 'center', fontFamily: 'Farro-Bold', fontSize: 14, color: '#9ca3af' },
  rankName: { fontFamily: 'Farro-Bold', fontSize: 14, color: '#212529' },
  rankScore: { fontFamily: 'Farro-Bold', fontSize: 15, color: '#212529' },
  // Modal
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', backgroundColor: '#fff' },
  modalCancel: { fontFamily: 'Farro-Medium', fontSize: 15, color: '#64748b' },
  modalTitle: { fontFamily: 'Farro-Bold', fontSize: 17, color: '#212529' },
  postBtn: { backgroundColor: COLORS.primary, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  postBtnText: { fontFamily: 'Farro-Bold', fontSize: 12, color: '#212529' },
  bodyInput: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb', padding: 14, fontFamily: 'Farro-Regular', fontSize: 15, color: '#212529', minHeight: 120, textAlignVertical: 'top' },
  typeChip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' },
  typeChipText: { fontFamily: 'Farro-Bold', fontSize: 12, color: '#64748b' },
  tagChip: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  tagChipText: { fontFamily: 'Farro-Medium', fontSize: 12, color: '#64748b' },
  // Modal extra
  sectionLabel: { fontFamily: 'Farro-Bold', fontSize: 13, color: '#374151', marginBottom: 8 },
  fieldInput: { backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'Farro-Regular', fontSize: 15, color: '#212529' },
  addImageBox: { width: 100, height: 100, borderRadius: 12, borderWidth: 1.5, borderColor: '#d1d5db', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' },
  modalToolbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0', backgroundColor: '#fff' },
  toolbarBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  toolbarBtnText: { fontFamily: 'Farro-Bold', fontSize: 14, color: COLORS.primary },
});
