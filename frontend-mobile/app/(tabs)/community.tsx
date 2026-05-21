import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
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
import { useTheme } from '@/contexts/ThemeContext';
import { postsApi } from '@/services';
import type { Post, PostType } from '@/types';
import { Avatar, PostCard, CreatePostModal, CommentSection, LeaderboardView } from '@/components';

// ─── Main Screen ───────────────────────────────────────────────
const TABS = [
  { id: 'all', icon: 'albums-outline', label: 'All Posts' },
  { id: 'tips', icon: 'bulb-outline', label: 'Study Tips' },
  { id: 'achievements', icon: 'trophy-outline', label: 'Achievements' },
  { id: 'my_posts', icon: 'person-outline', label: 'My Posts' },
  { id: 'saved', icon: 'bookmark-outline', label: 'Saved' },
  { id: 'leaderboard', icon: 'bar-chart-outline', label: 'Leaderboard' },
] as const;
type TabId = (typeof TABS)[number]['id'];

const TAB_TYPE_MAP: Record<string, PostType | undefined> = {
  tips: 'STUDY_TIP',
  achievements: 'SCORE_ACHIEVEMENT',
};

export default function CommunityScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
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
        let res;
        if (activeTab === 'saved') {
          res = await postsApi.getBookmarks({ cursor });
        } else if (activeTab === 'my_posts') {
          res = await postsApi.listPosts({ authorId: user?.id, cursor });
        } else {
          res = await postsApi.listPosts({ type, cursor });
        }

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
    [activeTab, user?.id],
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 10,
          }}
        >
          <View>
            <Text style={{ fontFamily: FONTS.bold, fontSize: 10, color: colors.textMuted, letterSpacing: 1 }}>
              LEXON
            </Text>
            <Text style={{ fontFamily: FONTS.bold, fontSize: 24, color: colors.text }}>Community</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowCreate(true)}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: COLORS.primary,
              borderWidth: 1,
              borderColor: COLORS.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="create" size={20} color="#212529" />
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, gap: 8 }}
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 20,
                  backgroundColor: active ? COLORS.primary : colors.card,
                  borderWidth: 1,
                  borderColor: active ? COLORS.primary : colors.border,
                }}
              >
                <Ionicons name={tab.icon as any} size={14} color={active ? '#212529' : colors.textSecondary} />
                <Text
                  style={{
                    fontFamily: FONTS.bold,
                    fontSize: 13,
                    color: active ? '#212529' : colors.textSecondary,
                  }}
                >
                  {tab.label}
                </Text>
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
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 14,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            onPress={() => setShowCreate(true)}
          >
            <Avatar name={authorName} avatar={user?.avatar} size={34} />
            <Text style={{ flex: 1, fontFamily: FONTS.medium, fontSize: 14, color: colors.textMuted }}>
              Share with the community…
            </Text>
            <View
              style={{
                backgroundColor: COLORS.primary,
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 20,
              }}
            >
              <Text style={{ fontFamily: FONTS.bold, fontSize: 12, color: '#212529' }}>POST</Text>
            </View>
          </TouchableOpacity>

          {posts.length === 0 ? (
            <View style={{ alignItems: 'center', padding: 40 }}>
              <Ionicons name="albums-outline" size={48} color={colors.border} />
              <Text style={{ fontFamily: FONTS.medium, color: colors.textMuted, marginTop: 12 }}>
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
