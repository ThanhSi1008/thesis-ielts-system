import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';
import { postsApi } from '@/services';
import { timeAgo } from '@/utils/timeAgo';
import type { Comment } from '@/types';
import { Avatar } from './Avatar';

export function CommentSection({
  postId,
  currentUserId,
  onCommentAdded,
}: {
  postId: string;
  currentUserId?: string;
  onCommentAdded: () => void;
}) {
  const { colors } = useTheme();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});
  const [mockLikes, setMockLikes] = useState<Record<string, number>>({});

  const toggleLike = (id: string) => {
    const wasLiked = !!likedComments[id];
    setLikedComments((prev) => ({ ...prev, [id]: !wasLiked }));
    setMockLikes((prev) => {
      const current = prev[id] ?? (id ? id.charCodeAt(0) % 3 : 0);
      const next = wasLiked ? current - 1 : current + 1;
      return { ...prev, [id]: Math.max(0, next) };
    });
  };

  const fetchComments = useCallback(async () => {
    try {
      const post = await postsApi.getPost(postId);
      setComments(post.comments ?? []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const submit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await postsApi.createComment(postId, { body: text.trim(), parentId: replyTo?.id });
      setText('');
      setReplyTo(null);
      fetchComments();
      onCommentAdded();
    } catch {
      Alert.alert('Error', 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId && c.parentId !== commentId));
    try {
      await postsApi.deleteComment(commentId);
      fetchComments();
      onCommentAdded();
    } catch {
      fetchComments();
    }
  };

  const styles = makeStyles(colors);

  const renderComment = (c: Comment, isReply = false) => {
    const name = [c.author.firstName, c.author.lastName].filter(Boolean).join(' ') || 'Anonymous';
    const isLiked = !!likedComments[c.id];
    const likeCount = mockLikes[c.id] ?? (c.id ? c.id.charCodeAt(0) % 3 : 0);
    return (
      <View key={c.id} style={[styles.commentRow, isReply && { marginLeft: 44, marginTop: 10 }]}>
        <Avatar name={name} avatar={c.author.avatar} size={36} />
        <View style={{ flex: 1 }}>
          <View style={styles.commentBubble}>
            <Text style={styles.commentAuthor}>{name}</Text>
            <Text style={styles.commentBody}>{c.body}</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              marginTop: 4,
              marginLeft: 4,
            }}
          >
            <Text style={styles.commentTime}>{timeAgo(c.createdAt)}</Text>

            <TouchableOpacity
              onPress={() => toggleLike(c.id)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}
            >
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={13}
                color={isLiked ? '#ef4444' : '#9ca3af'}
              />
              <Text style={[styles.commentTime, isLiked && { color: '#ef4444' }]}>
                {likeCount > 0 ? `${likeCount} ` : ''}Like
              </Text>
            </TouchableOpacity>

            {!isReply && (
              <TouchableOpacity onPress={() => setReplyTo({ id: c.id, name })}>
                <Text style={[styles.commentTime, { color: COLORS.primary }]}>Reply</Text>
              </TouchableOpacity>
            )}
            {c.authorId === currentUserId && (
              <TouchableOpacity onPress={() => handleDelete(c.id)}>
                <Text style={[styles.commentTime, { color: '#ef4444' }]}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
          {c.replies?.map((r) => renderComment(r, true))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.commentSection}>
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 8 }} />
      ) : comments.length === 0 ? (
        <Text
          style={{
            fontFamily: FONTS.regular,
            fontSize: 13,
            color: colors.textMuted,
            textAlign: 'center',
            paddingVertical: 12,
          }}
        >
          No comments yet. Be the first!
        </Text>
      ) : (
        comments.map((c) => renderComment(c))
      )}
      {replyTo && (
        <View style={styles.replyBanner}>
          <Text style={{ fontFamily: FONTS.medium, fontSize: 13, color: COLORS.primary }}>
            Replying to {replyTo.name}
          </Text>
          <TouchableOpacity onPress={() => setReplyTo(null)}>
            <Ionicons name="close" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.commentInputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={replyTo ? 'Write a reply…' : 'Write a comment…'}
          placeholderTextColor={colors.textMuted}
          style={styles.commentInput}
          returnKeyType="send"
          onSubmitEditing={submit}
        />
        <TouchableOpacity
          onPress={submit}
          disabled={!text.trim() || submitting}
          style={[styles.sendBtn, (!text.trim() || submitting) && { opacity: 0.45 }]}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <Ionicons name="send" size={18} color={colors.text} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    commentSection: {
      backgroundColor: colors.card,
      marginTop: -10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 20,
      borderBottomLeftRadius: 18,
      borderBottomRightRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    commentRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 18,
    },
    commentBubble: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      paddingHorizontal: 16,
      paddingVertical: 12,
      alignSelf: 'flex-start',
      maxWidth: '100%',
    },
    commentAuthor: {
      fontFamily: FONTS.bold,
      fontSize: 15,
      color: colors.text,
      marginBottom: 4,
    },
    commentBody: {
      fontFamily: FONTS.regular,
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 22,
    },
    commentTime: {
      fontFamily: FONTS.medium,
      fontSize: 13,
      color: colors.textMuted,
    },
    commentInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 12,
    },
    commentInput: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 28,
      paddingHorizontal: 18,
      paddingVertical: 13,
      fontFamily: FONTS.regular,
      fontSize: 15,
      color: colors.text,
      minHeight: 48,
    },
    sendBtn: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: COLORS.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    replyBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: COLORS.primary + '18',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      marginBottom: 10,
    },
  });
}
