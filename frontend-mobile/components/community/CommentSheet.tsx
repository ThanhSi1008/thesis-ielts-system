import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';
import { postsApi } from '@/services';
import { timeAgo } from '@/utils/timeAgo';
import type { Comment } from '@/types';
import { Avatar } from './Avatar';
import Text from '../atoms/Text';
import BottomSheet from '../organisms/BottomSheet';

export interface CommentSheetProps {
  visible: boolean;
  postId: string;
  currentUserId?: string;
  onClose: () => void;
  onCommentAdded: () => void;
}

export function CommentSheet({
  visible,
  postId,
  currentUserId,
  onClose,
  onCommentAdded,
}: CommentSheetProps) {
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
    if (!postId) return;
    try {
      setLoading(true);
      const post = await postsApi.getPost(postId);
      setComments(post.comments ?? []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (visible && postId) {
      fetchComments();
    } else {
      setComments([]);
      setText('');
      setReplyTo(null);
    }
  }, [visible, postId, fetchComments]);

  const submit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await postsApi.createComment(postId, { body: text.trim(), parentId: replyTo?.id });
      setText('');
      setReplyTo(null);
      await fetchComments();
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
      await fetchComments();
      onCommentAdded();
    } catch {
      await fetchComments();
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
            <Text variant="body" weight="bold" style={styles.commentAuthor}>{name}</Text>
            <Text variant="body" style={styles.commentBody}>{c.body}</Text>
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
            <Text variant="caption" style={styles.commentTime}>{timeAgo(c.createdAt)}</Text>

            <TouchableOpacity
              onPress={() => toggleLike(c.id)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}
            >
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={13}
                color={isLiked ? '#ef4444' : colors.textMuted}
              />
              <Text variant="caption" style={[styles.commentTime, isLiked && { color: '#ef4444' }]}>
                {likeCount > 0 ? `${likeCount} ` : ''}Like
              </Text>
            </TouchableOpacity>

            {!isReply && (
              <TouchableOpacity onPress={() => setReplyTo({ id: c.id, name })}>
                <Text variant="caption" style={[styles.commentTime, { color: COLORS.primary }]}>Reply</Text>
              </TouchableOpacity>
            )}
            {c.authorId === currentUserId && (
              <TouchableOpacity onPress={() => handleDelete(c.id)}>
                <Text variant="caption" style={[styles.commentTime, { color: '#ef4444' }]}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
          {c.replies?.map((r) => renderComment(r, true))}
        </View>
      </View>
    );
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Comments"
      snapPointHeight={0.65}
    >
      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            {comments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text variant="body" style={{ color: colors.textMuted }}>
                  No comments yet. Be the first to reply!
                </Text>
              </View>
            ) : (
              comments.map((c) => renderComment(c))
            )}
          </ScrollView>
        )}

        {replyTo && (
          <View style={styles.replyBanner}>
            <Text variant="label" style={{ color: COLORS.primary }}>
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
              <ActivityIndicator size="small" color="#212529" />
            ) : (
              <Ionicons name="send" size={18} color="#212529" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    scrollContainer: {
      paddingVertical: 12,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40,
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
      color: colors.text,
      marginBottom: 4,
    },
    commentBody: {
      color: colors.textSecondary,
      lineHeight: 22,
    },
    commentTime: {
      color: colors.textMuted,
    },
    commentInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.bgElevated || colors.card,
    },
    commentInput: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 24,
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontFamily: FONTS.regular,
      fontSize: 15,
      color: colors.text,
      minHeight: 44,
    },
    sendBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
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
      paddingVertical: 8,
      borderRadius: 12,
      marginBottom: 8,
    },
  });
}
