import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '@/constants';
import { timeAgo } from '@/utils/timeAgo';
import type { Post, PostType } from '@/types';
import { Avatar } from './Avatar';

// ─── TypePill ──────────────────────────────────────────────────
function TypePill({ type }: { type: PostType }) {
  if (type === 'STUDY_TIP')
    return (
      <View style={[styles.pill, { backgroundColor: 'rgba(255,198,0,.18)' }]}>
        <Ionicons name="bulb" size={10} color="#92650a" />
        <Text style={[styles.pillText, { color: '#92650a' }]}>STUDY TIP</Text>
      </View>
    );
  if (type === 'SCORE_ACHIEVEMENT')
    return (
      <View style={[styles.pill, { backgroundColor: 'rgba(76,175,80,.12)' }]}>
        <Ionicons name="trophy" size={10} color="#2e7d32" />
        <Text style={[styles.pillText, { color: '#2e7d32' }]}>ACHIEVEMENT</Text>
      </View>
    );
  return null;
}

export function PostCard({
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
  const authorName =
    [post.author.firstName, post.author.lastName].filter(Boolean).join(' ') || 'Anonymous';
  const isOwner = post.authorId === currentUserId;
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
            onPress={() =>
              Alert.alert('Delete Post?', '', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => onDelete(post.id) },
              ])
            }
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>

      {post.title ? <Text style={styles.postTitle}>{post.title}</Text> : null}
      <Text style={styles.postBody}>{post.body}</Text>

      {post.imageUrls?.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
          {post.imageUrls.map((url, i) => (
            <Image
              key={i}
              source={{ uri: url }}
              style={{ width: 200, height: 140, borderRadius: 12, marginRight: 8 }}
            />
          ))}
        </ScrollView>
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
          style={styles.actionBtn}
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
          style={styles.actionBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chatbubble-outline" size={23} color="#9ca3af" />
          {post.commentCount > 0 && <Text style={styles.actionText}>{post.commentCount}</Text>}
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          onPress={() => onBookmark(post.id)}
          style={styles.actionBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={post.isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={23}
            color={post.isBookmarked ? COLORS.primary : '#9ca3af'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  authorName: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#212529',
  },
  timeText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  postTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#212529',
    marginBottom: 6,
  },
  postBody: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 10,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#64748b',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginRight: 4,
  },
  actionText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#9ca3af',
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
});
