import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { postsApi } from '@/services';
import type { Post, PostType } from '@/types';
import { Avatar, PostCard, CreatePostModal, CommentSection, LeaderboardView } from '@/components';

// ─── Main Screen ───────────────────────────────────────────────
const TABS = [
  { id: 'all', icon: 'albums-outline', label: 'All Posts' },
  { id: 'tips', icon: 'bulb-outline', label: 'Study Tips' },
  { id: 'achievements', icon: 'trophy-outline', label: 'Achievements' },
  { id: 'leaderboard', icon: 'bar-chart-outline', label: 'Leaderboard' },
] as const;
type TabId = (typeof TABS)[number]['id'];

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
  const [openedCommentPostId, setOpenedCommentPostId] = useState<string | null>(null);

  const handleOpenComments = (postId: string) => {
    setOpenedCommentPostId((prev) => (prev === postId ? null : postId));
  };

  const handleCommentAdded = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p)),
    );
  };

  const fetchPosts = useCallback(
    async (cursor?: string) => {
      const type = TAB_TYPE_MAP[activeTab];
      try {
        const res = await postsApi.listPosts({ type, cursor });
        if (cursor) {
          setPosts((prev) => [...prev, ...res.items]);
        } else {
          setPosts(res.items);
        }
        setNextCursor(res.nextCursor);
      } catch {
        Alert.alert('Error', 'Failed to load posts');
      }
    },
    [activeTab],
  );

  useEffect(() => {
    if (activeTab === 'leaderboard') return;
    setLoading(true);
    fetchPosts().finally(() => setLoading(false));
  }, [activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'leaderboard') {
      // LeaderboardView fetches automatically when refreshing/refreshTrigger transitions
      await new Promise((resolve) => setTimeout(resolve, 800));
    } else {
      await fetchPosts();
    }
    setRefreshing(false);
  };

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    await fetchPosts(nextCursor);
    setLoadingMore(false);
  };

  const handleLike = async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likeCount: p.likeCount + (p.isLiked ? -1 : 1) }
          : p,
      ),
    );
    try {
      await postsApi.toggleLike(postId);
    } catch {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, isLiked: !p.isLiked, likeCount: p.likeCount + (p.isLiked ? -1 : 1) }
            : p,
        ),
      );
    }
  };

  const handleBookmark = async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p)),
    );
    try {
      await postsApi.toggleBookmark(postId);
    } catch {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p)),
      );
    }
  };

  const handleDelete = async (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    try {
      await postsApi.deletePost(postId);
    } catch {
      Alert.alert('Error', 'Failed to delete post');
    }
  };

  const handleCreated = (post: Post) => {
    setPosts((prev) => [post, ...prev]);
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
          <TouchableOpacity
            onPress={() => setShowCreate(true)}
            style={[s.iconBtn, { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}
          >
            <Ionicons name="create" size={20} color="#212529" />
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.tabBar}
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={[s.tabBtn, active && s.tabBtnActive]}
              >
                <Ionicons name={tab.icon as any} size={14} color={active ? '#212529' : '#64748b'} />
                <Text style={[s.tabText, active && s.tabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      {activeTab === 'leaderboard' ? (
        <ScrollView
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
        >
          <LeaderboardView currentUserId={user?.id} refreshTrigger={refreshing} />
        </ScrollView>
      ) : loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
          onScroll={({ nativeEvent: e }) => {
            const near =
              e.layoutMeasurement.height + e.contentOffset.y >= e.contentSize.height - 200;
            if (near) loadMore();
          }}
          scrollEventThrottle={400}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          {/* Create box */}
          <TouchableOpacity style={s.createBox} onPress={() => setShowCreate(true)}>
            <Avatar name={authorName} avatar={user?.avatar} size={34} />
            <Text style={s.createPlaceholder}>Share with the community…</Text>
            <View style={s.postBtn}>
              <Text style={s.postBtnText}>POST</Text>
            </View>
          </TouchableOpacity>

          {posts.length === 0 ? (
            <View style={{ alignItems: 'center', padding: 40 }}>
              <Ionicons name="albums-outline" size={48} color="#d1d5db" />
              <Text style={{ fontFamily: FONTS.medium, color: '#9ca3af', marginTop: 12 }}>
                No posts yet. Be the first!
              </Text>
            </View>
          ) : (
            posts.map((post) => (
              <View key={post.id}>
                <PostCard
                  post={post}
                  currentUserId={user?.id}
                  onLike={handleLike}
                  onBookmark={handleBookmark}
                  onDelete={handleDelete}
                  onOpenComments={handleOpenComments}
                />
                {openedCommentPostId === post.id && (
                  <CommentSection
                    postId={post.id}
                    currentUserId={user?.id}
                    onCommentAdded={() => handleCommentAdded(post.id)}
                  />
                )}
              </View>
            ))
          )}

          {loadingMore && (
            <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 12 }} />
          )}
        </ScrollView>
      )}

      <CreatePostModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleCreated}
        user={user}
      />
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    backgroundColor: 'rgba(248,249,250,0.97)',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerSub: { fontFamily: FONTS.bold, fontSize: 10, color: '#9ca3af', letterSpacing: 1 },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 24, color: '#212529' },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  tabBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { fontFamily: FONTS.bold, fontSize: 13, color: '#64748b' },
  tabTextActive: { color: '#212529' },
  createBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  createPlaceholder: { flex: 1, fontFamily: FONTS.medium, fontSize: 14, color: '#9ca3af' },
  postBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  postBtnText: { fontFamily: FONTS.bold, fontSize: 12, color: '#212529' },
});
