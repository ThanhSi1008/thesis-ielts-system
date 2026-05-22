import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  DeviceEventEmitter,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useTabBarVisibility } from '@/hooks';
import { postsApi } from '@/services';
import type { Post, PostType } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Avatar,
  PostCard,
  CreatePostModal,
  CommentSheet,
  LeaderboardView,
  DataScreen,
  PostCardSkeleton,
  EmptyState,
  TabPill,
  Text,
} from '@/components';
import { EmptyStates } from '@/assets/empty-states';

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
  
  const { handleScroll } = useTabBarVisibility();
  const postsScrollViewRef = useRef<ScrollView>(null);
  const leaderboardScrollViewRef = useRef<ScrollView>(null);

  // Scroll to top on active tab double press
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(
      'SCROLL_TO_TOP',
      ({ target }: { target: string }) => {
        if (target === 'community') {
          if (activeTab === 'leaderboard') {
            leaderboardScrollViewRef.current?.scrollTo({ y: 0, animated: true });
          } else {
            postsScrollViewRef.current?.scrollTo({ y: 0, animated: true });
          }
        }
      }
    );
    return () => listener.remove();
  }, [activeTab]);

  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [openedCommentPostId, setOpenedCommentPostId] = useState<string | null>(null);

  const handleOpenComments = (postId: string) => {
    setOpenedCommentPostId(postId);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View
        style={{
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          paddingTop: 8,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingBottom: 12,
          }}
        >
          <View>
            <Text
              variant="caption"
              weight="bold"
              style={{
                color: colors.textMuted,
                letterSpacing: 1,
              }}
            >
              LEXON
            </Text>
            <Text variant="display" weight="bold" style={{ color: colors.text }}>
              Community
            </Text>
          </View>
        </View>

        {/* TabPill Category Filters */}
        <TabPill
          tabs={TABS}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </View>

      {/* Content */}
      {activeTab === 'leaderboard' ? (
        <ScrollView
          ref={leaderboardScrollViewRef}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <LeaderboardView currentUserId={user?.id} refreshTrigger={refreshing} />
        </ScrollView>
      ) : (
        <ScrollView
          ref={postsScrollViewRef}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
          onScroll={(event) => {
            handleScroll(event);
            const { nativeEvent: e } = event;
            const near =
              e.layoutMeasurement.height + e.contentOffset.y >= e.contentSize.height - 200;
            if (near) loadMore();
          }}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          {/* Share Box Card */}
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
            <Avatar name={authorName} avatar={user?.avatar} size="sm" />
            <Text
              variant="body"
              style={{ flex: 1, color: colors.textMuted }}
            >
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
              <Text variant="label" weight="bold" style={{ color: '#212529' }}>POST</Text>
            </View>
          </TouchableOpacity>

          <DataScreen
            loading={loading}
            error={null}
            empty={posts.length === 0}
            onRetry={onRefresh}
            skeleton={
              <View style={{ gap: 12, marginTop: 12 }}>
                <PostCardSkeleton />
                <PostCardSkeleton />
                <PostCardSkeleton />
              </View>
            }
            emptyState={
              <EmptyState
                illustration={EmptyStates.search}
                title="No posts yet"
                description="Be the first to share something with the community!"
                primaryAction={{
                  title: 'Create Post',
                  onPress: () => setShowCreate(true),
                }}
              />
            }
          >
            {posts.map((post) => (
              <View key={post.id} style={{ marginBottom: 12 }}>
                <PostCard
                  post={post}
                  currentUserId={user?.id}
                  onLike={handleLike}
                  onBookmark={handleBookmark}
                  onDelete={handleDelete}
                  onOpenComments={handleOpenComments}
                />
              </View>
            ))}
          </DataScreen>

          {loadingMore && (
            <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 12 }} />
          )}
        </ScrollView>
      )}

      {/* Floating Create Post FAB (Stacked safely above global Lexon AI FAB in bottom-right) */}
      <TouchableOpacity
        onPress={() => setShowCreate(true)}
        style={{
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 175 : 155,
          right: 20,
          zIndex: 99,
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#FFE082', '#FFC600', '#FFA000']}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Ionicons name="create" size={24} color="#212529" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Comment Section Sheet Modal */}
      <CommentSheet
        visible={openedCommentPostId !== null}
        postId={openedCommentPostId || ''}
        currentUserId={user?.id}
        onClose={() => setOpenedCommentPostId(null)}
        onCommentAdded={() => {
          if (openedCommentPostId) {
            handleCommentAdded(openedCommentPostId);
          }
        }}
      />

      {/* Create Post Sheet Modal */}
      <CreatePostModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleCreated}
        user={user}
      />
    </SafeAreaView>
  );
}
