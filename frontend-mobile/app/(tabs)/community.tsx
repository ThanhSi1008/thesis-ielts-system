import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  DeviceEventEmitter,
  Platform,
  Animated,
  Pressable,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '@/constants';
import { toast } from '@/components/ui/index';
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
const FEED_TABS = [
  { id: 'all', icon: 'albums-outline', label: 'All Posts' },
  { id: 'tips', icon: 'bulb-outline', label: 'Study Tips' },
  { id: 'achievements', icon: 'trophy-outline', label: 'Achievements' },
] as const;

const ACTIVITY_TABS = [
  { id: 'my_posts', icon: 'person-outline', label: 'My Posts' },
  { id: 'saved', icon: 'bookmark-outline', label: 'Saved' },
] as const;

const SIDEBAR_ITEMS = [
  { id: 'feed', icon: 'albums-outline', label: 'Feed' },
  { id: 'activity', icon: 'person-outline', label: 'Activity' },
  { id: 'rank', icon: 'medal-outline', label: 'Rank' },
] as const;

type SidebarTab = (typeof SIDEBAR_ITEMS)[number]['id'];

const TAB_TYPE_MAP: Record<string, PostType | undefined> = {
  tips: 'STUDY_TIP',
  achievements: 'SCORE_ACHIEVEMENT',
};

export default function CommunityScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('feed');
  const [feedFilter, setFeedFilter] = useState<'all' | 'tips' | 'achievements'>('all');
  const [activityFilter, setActivityFilter] = useState<'my_posts' | 'saved'>('my_posts');
  const [posts, setPosts] = useState<Post[]>([]);

  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const DRAWER_WIDTH = Math.min(windowWidth * 0.82, 300);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-300)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.spring(drawerAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
      Animated.timing(backdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.spring(drawerAnim, {
        toValue: -DRAWER_WIDTH,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }),
      Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setDrawerOpen(false));
  };

  const { handleScroll } = useTabBarVisibility();
  const postsScrollViewRef = useRef<ScrollView>(null);
  const leaderboardScrollViewRef = useRef<ScrollView>(null);

  // Scroll to top on active tab double press
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(
      'SCROLL_TO_TOP',
      ({ target }: { target: string }) => {
        if (target === 'community') {
          if (activeSidebarTab === 'rank') {
            leaderboardScrollViewRef.current?.scrollTo({ y: 0, animated: true });
          } else {
            postsScrollViewRef.current?.scrollTo({ y: 0, animated: true });
          }
        }
      }
    );
    return () => listener.remove();
  }, [activeSidebarTab]);

  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [openedCommentPostId, setOpenedCommentPostId] = useState<string | null>(null);

  const handleOpenComments = useCallback((postId: string) => {
    setOpenedCommentPostId(postId);
  }, []);

  const handleCommentAdded = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p)),
    );
  }, []);

  const fetchPosts = useCallback(
    async (cursor?: string) => {
      try {
        let res;
        if (activeSidebarTab === 'activity') {
          if (activityFilter === 'saved') {
            res = await postsApi.getBookmarks({ cursor });
          } else {
            res = await postsApi.listPosts({ authorId: user?.id, cursor });
          }
        } else {
          // activeSidebarTab === 'feed'
          const type = TAB_TYPE_MAP[feedFilter];
          res = await postsApi.listPosts({ type, cursor });
        }

        if (cursor) {
          setPosts((prev) => [...prev, ...res.items]);
        } else {
          setPosts(res.items);
        }
        setNextCursor(res.nextCursor);
      } catch {
        toast.error('Error', 'Failed to load posts');
      }
    },
    [activeSidebarTab, feedFilter, activityFilter, user?.id],
  );

  useEffect(() => {
    if (activeSidebarTab === 'rank') return;
    setLoading(true);
    fetchPosts().finally(() => setLoading(false));
  }, [activeSidebarTab, feedFilter, activityFilter, fetchPosts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (activeSidebarTab === 'rank') {
      await new Promise((resolve) => setTimeout(resolve, 800));
    } else {
      await fetchPosts();
    }
    setRefreshing(false);
  }, [activeSidebarTab, fetchPosts]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    await fetchPosts(nextCursor);
    setLoadingMore(false);
  }, [nextCursor, loadingMore, fetchPosts]);

  const handleLike = useCallback(async (postId: string) => {
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
  }, []);

  const handleBookmark = useCallback(async (postId: string) => {
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
  }, []);

  const handleDelete = useCallback(async (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    try {
      await postsApi.deletePost(postId);
    } catch {
      toast.error('Error', 'Failed to delete post');
    }
  }, []);

  const handleCreated = useCallback((post: Post) => {
    setPosts((prev) => [post, ...prev]);
    setActiveSidebarTab('feed');
    setFeedFilter('all');
  }, []);

  const handleSidebarItemPress = (tabId: SidebarTab) => {
    setActiveSidebarTab(tabId);
    closeDrawer();
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
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingBottom: 12,
            gap: 12,
          }}
        >
          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            onPress={openDrawer}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Open community menu drawer"
          >
            <Ionicons name="menu-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
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
        {activeSidebarTab === 'feed' && (
          <TabPill
            tabs={FEED_TABS}
            activeTab={feedFilter}
            onChange={setFeedFilter}
          />
        )}
        {activeSidebarTab === 'activity' && (
          <TabPill
            tabs={ACTIVITY_TABS}
            activeTab={activityFilter}
            onChange={setActivityFilter}
          />
        )}
      </View>

      {/* Content */}
      {activeSidebarTab === 'rank' ? (
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

      {/* Drawer backdrop overlay */}
      {drawerOpen && (
        <Animated.View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            zIndex: 999,
            opacity: backdropAnim,
          }}
        >
          <Pressable style={{ flex: 1 }} onPress={closeDrawer} />
        </Animated.View>
      )}

      {/* Drawer Sidebar Container */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: DRAWER_WIDTH,
          backgroundColor: colors.background,
          zIndex: 1000,
          borderRightWidth: 1,
          borderColor: colors.border,
          paddingTop: insets.top + 16,
          transform: [
            {
              translateX: drawerAnim.interpolate({
                inputRange: [-DRAWER_WIDTH, 0],
                outputRange: [-DRAWER_WIDTH, 0],
              }),
            },
          ],
          shadowColor: '#000000',
          shadowOffset: { width: 4, height: 0 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 16,
        }}
      >
        {/* User profile details header */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name={authorName} avatar={user?.avatar} size="md" />
          <View style={{ flex: 1 }}>
            <Text variant="body" weight="bold" color="text" numberOfLines={1}>
              {authorName}
            </Text>
            <Text variant="caption" style={{ color: colors.textMuted }}>
              Lexon Student
            </Text>
          </View>
        </View>

        {/* Sidebar list items */}
        <ScrollView style={{ flex: 1, paddingTop: 16 }} showsVerticalScrollIndicator={false}>
          <Text variant="caption" weight="bold" style={{ color: colors.textMuted, marginHorizontal: 16, marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>
            COMMUNITY NAVIGATION
          </Text>
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = activeSidebarTab === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  marginHorizontal: 8,
                  borderRadius: 12,
                  backgroundColor: isActive ? colors.primary + '15' : 'transparent',
                  borderLeftWidth: 4,
                  borderLeftColor: isActive ? colors.primary : 'transparent',
                }}
                onPress={() => handleSidebarItemPress(item.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={isActive ? colors.primary : colors.textSecondary}
                />
                <Text
                  variant="body"
                  weight={isActive ? 'bold' : 'medium'}
                  style={{
                    marginLeft: 12,
                    color: isActive ? colors.text : colors.textSecondary,
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Version Footer */}
        <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: colors.border, alignItems: 'center' }}>
          <Text variant="caption" style={{ color: colors.textMuted }}>
            Lexon Community v1.2
          </Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
