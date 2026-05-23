import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import ConfirmDialog from '../organisms/ConfirmDialog';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import ImageViewer from 'react-native-image-zoom-viewer';
import { COLORS, FONTS } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';
import { timeAgo } from '@/utils/timeAgo';
import Avatar from '../atoms/Avatar';
import { TextWithLookup } from '../global/TextWithLookup';
import type { Post, PostType } from '@/types';

// ─── TypePill ──────────────────────────────────────────────────
function TypePill({ type }: { type: PostType }) {
  if (type === 'STUDY_TIP')
    return (
      <View style={[staticStyles.pill, { backgroundColor: 'rgba(255,198,0,.18)' }]}>
        <Ionicons name="bulb" size={10} color="#92650a" />
        <Text style={[staticStyles.pillText, { color: '#92650a' }]}>STUDY TIP</Text>
      </View>
    );
  if (type === 'SCORE_ACHIEVEMENT')
    return (
      <View style={[staticStyles.pill, { backgroundColor: 'rgba(76,175,80,.12)' }]}>
        <Ionicons name="trophy" size={10} color="#2e7d32" />
        <Text style={[staticStyles.pillText, { color: '#2e7d32' }]}>ACHIEVEMENT</Text>
      </View>
    );
  return null;
}

export const PostCard = React.memo(function PostCard({
  post,
  currentUserId,
  onLike,
  onBookmark,
  onDelete,
  onOpenComments,
}: {
  post: Post;
  currentUserId?: string;
  onLike: (id: string) => void;
  onBookmark: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenComments: (id: string) => void;
}) {
  const { colors } = useTheme();
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const authorName =
    [post.author.firstName, post.author.lastName].filter(Boolean).join(' ') || 'Anonymous';
  const isOwner = post.authorId === currentUserId;

  const styles = makeStyles(colors);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Avatar name={authorName} avatar={post.author.avatar} size={38} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Text style={styles.authorName}>{authorName}</Text>
            {post.type !== 'GENERAL' && <TypePill type={post.type} />}
          </View>
          <Text style={styles.timeText}>{timeAgo(post.createdAt)}</Text>
        </View>
        {isOwner && (
          <TouchableOpacity
            onPress={() => setShowDeleteConfirm(true)}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>

      {post.title ? <TextWithLookup style={styles.postTitle} content={post.title} /> : null}
      <TextWithLookup style={styles.postBody} content={post.body} />

      {post.imageUrls?.length > 0 && (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 10 }}
          >
            {post.imageUrls.map((url, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedImageIndex(i);
                  setViewerVisible(true);
                }}
              >
                <Image
                  source={{ uri: url }}
                  cachePolicy="memory-disk"
                  style={{ width: 200, height: 140, borderRadius: 12, marginRight: 8 }}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Modal
            visible={viewerVisible}
            transparent={true}
            onRequestClose={() => setViewerVisible(false)}
            animationType="fade"
          >
            <ImageViewer
              imageUrls={post.imageUrls.map((url) => ({ url }))}
              index={selectedImageIndex}
              onCancel={() => setViewerVisible(false)}
              enableSwipeDown={true}
              renderHeader={() => (
                <TouchableOpacity
                  style={staticStyles.closeButton}
                  onPress={() => setViewerVisible(false)}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                  <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>
              )}
            />
          </Modal>
        </>
      )}

      {post.tags?.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {post.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => onLike(post.id)}
          style={staticStyles.actionBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={post.isLiked ? 'heart' : 'heart-outline'}
            size={24}
            color={post.isLiked ? '#ef4444' : '#9ca3af'}
          />
          {post.likeCount > 0 && (
            <Text style={[styles.actionText, post.isLiked && { color: '#ef4444' }]}>
              {post.likeCount}
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onOpenComments(post.id)}
          style={staticStyles.actionBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chatbubble-outline" size={23} color="#9ca3af" />
          {post.commentCount > 0 && <Text style={styles.actionText}>{post.commentCount}</Text>}
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          onPress={() => onBookmark(post.id)}
          style={staticStyles.actionBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={post.isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={23}
            color={post.isBookmarked ? COLORS.primary : '#9ca3af'}
          />
        </TouchableOpacity>
      </View>
      <ConfirmDialog
        visible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        variant="destructive"
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        primaryAction={{
          title: 'Delete',
          onPress: () => onDelete(post.id),
        }}
        secondaryAction={{
          title: 'Cancel',
          onPress: () => setShowDeleteConfirm(false),
        }}
      />
    </View>
  );
});

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 10,
    },
    authorName: {
      fontFamily: FONTS.bold,
      fontSize: 15,
      color: colors.text,
    },
    timeText: {
      fontFamily: FONTS.medium,
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    postTitle: {
      fontFamily: FONTS.bold,
      fontSize: 16,
      color: colors.text,
      marginBottom: 6,
    },
    postBody: {
      fontFamily: FONTS.regular,
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 22,
      marginBottom: 10,
    },
    tag: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    tagText: {
      fontFamily: FONTS.medium,
      fontSize: 12,
      color: colors.textSecondary,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 4,
    },
    actionText: {
      fontFamily: FONTS.bold,
      fontSize: 15,
      color: '#9ca3af',
    },
  });
}

// Static styles that don't depend on theme
const staticStyles = StyleSheet.create({
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginRight: 4,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  pillText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 99,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
});
