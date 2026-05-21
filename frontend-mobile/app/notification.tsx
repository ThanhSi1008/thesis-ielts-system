import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api-client';
import { useRouter } from 'expo-router';

// ── Types ──────────────────────────────────────────────────────────────────────
type NotificationType =
  | 'STREAK_MILESTONE'
  | 'DICTATION_COMPLETE'
  | 'EXAM_GRADED'
  | 'SYSTEM_ANNOUNCEMENT'
  | 'PRONUNCIATION_RESULT'
  | string;

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotifResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
}

// ── API calls ──────────────────────────────────────────────────────────────────
const notifApi = {
  getAll: (page = 1, limit = 20) =>
    apiClient.get<NotifResponse>(`/notifications?page=${page}&limit=${limit}`),
  getUnreadCount: () => apiClient.get<{ count: number }>('/notifications/unread-count'),
  markAsRead: (id: string) => apiClient.patch<void>(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.patch<void>('/notifications/read-all'),
  delete: (id: string) => apiClient.delete<void>(`/notifications/${id}`),
};

// ── Icon & colour per type ─────────────────────────────────────────────────────
const TYPE_META: Record<string, { icon: string; color: string; bg: string }> = {
  STREAK_MILESTONE: { icon: 'flame', color: '#f97316', bg: '#fff7ed' },
  DICTATION_COMPLETE: { icon: 'headset', color: '#3b82f6', bg: '#eff6ff' },
  EXAM_GRADED: { icon: 'document-text', color: '#8b5cf6', bg: '#f5f3ff' },
  PRONUNCIATION_RESULT: { icon: 'mic', color: '#10b981', bg: '#ecfdf5' },
  SYSTEM_ANNOUNCEMENT: { icon: 'megaphone', color: '#FFC600', bg: '#fffbeb' },
};

const getMeta = (type: NotificationType) =>
  TYPE_META[type] ?? { icon: 'notifications', color: '#6b7280', bg: '#f3f4f6' };

function formatTime(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── NotificationItem ───────────────────────────────────────────────────────────
function NotificationItem({
  item,
  onRead,
  onDelete,
}: {
  item: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const meta = getMeta(item.type);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleDelete = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(() => onDelete(item.id));
  };

  return (
    <Animated.View style={[styles.item, { opacity: fadeAnim }, !item.isRead && styles.itemUnread]}>
      <TouchableOpacity
        style={styles.itemInner}
        activeOpacity={0.7}
        onPress={() => {
          if (!item.isRead) onRead(item.id);
        }}
      >
        {/* Icon */}
        <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
          <Ionicons name={meta.icon as any} size={20} color={meta.color} />
        </View>

        {/* Content */}
        <View style={styles.itemContent}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.itemTitle, !item.isRead && styles.itemTitleUnread]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.itemBody} numberOfLines={2}>
            {item.body}
          </Text>
          <Text style={styles.itemTime}>{formatTime(item.createdAt)}</Text>
        </View>

        {/* Delete */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleDelete}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={16} color="#9ca3af" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────────────
export default function NotificationScreen() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const router = useRouter();

  const LIMIT = 20;

  const fetchNotifications = useCallback(
    async (p = 1, append = false) => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const res = await notifApi.getAll(p, LIMIT);
        const newItems = res.notifications ?? [];
        setNotifications((prev) => (append ? [...prev, ...newItems] : newItems));
        setHasMore(newItems.length === LIMIT);
        setPage(p);
      } catch {
        /* silent */
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [user],
  );

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await notifApi.getUnreadCount();
      setUnreadCount(res.count ?? 0);
    } catch {
      /* silent */
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications(1);
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications(1);
    fetchUnreadCount();
  };

  const onLoadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    fetchNotifications(page + 1, true);
  };

  const handleRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await notifApi.markAsRead(id);
    } catch {
      /* silent */
    }
  };

  const handleDelete = async (id: string) => {
    const target = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (target && !target.isRead) setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await notifApi.delete(id);
    } catch {
      /* silent */
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    setMarkingAll(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await notifApi.markAllAsRead();
    } catch {
      /* silent */
    } finally {
      setMarkingAll(false);
    }
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyWrap}>
        <View style={styles.emptyIcon}>
          <Ionicons name="notifications-off-outline" size={48} color="#d1d5db" />
        </View>
        <Text style={styles.emptyTitle}>All caught up!</Text>
        <Text style={styles.emptySubtitle}>
          You have no notifications right now.{'\n'}We'll notify you when something happens.
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return <ActivityIndicator style={{ paddingVertical: 16 }} color="#FFC600" />;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color="#111" />
          </TouchableOpacity>
          <View>
            <Text style={styles.eyebrow}>Lexon</Text>
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={handleMarkAllRead}
            disabled={markingAll}
          >
            {markingAll ? (
              <ActivityIndicator size="small" color="#FFC600" />
            ) : (
              <>
                <Ionicons name="checkmark-done" size={14} color="#FFC600" />
                <Text style={styles.markAllText}>Mark all read</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Unread badge pill */}
      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Ionicons name="ellipse" size={8} color="#FFC600" />
          <Text style={styles.unreadBannerText}>
            {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Guest state */}
      {!user ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIcon}>
            <Ionicons name="lock-closed-outline" size={48} color="#d1d5db" />
          </View>
          <Text style={styles.emptyTitle}>Sign in to see notifications</Text>
          <Text style={styles.emptySubtitle}>
            Log in to receive updates about your progress, streaks, and more.
          </Text>
        </View>
      ) : loading ? (
        <View style={styles.centerLoad}>
          <ActivityIndicator size="large" color="#FFC600" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem item={item} onRead={handleRead} onDelete={handleDelete} />
          )}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFC600" />
          }
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={notifications.length === 0 ? { flex: 1 } : { paddingBottom: 30 }}
        />
      )}
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  centerLoad: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    fontFamily: 'Farro-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: '#9ca3af',
  },
  headerTitle: {
    fontFamily: 'Farro-Bold',
    fontSize: 22,
    color: '#111',
    letterSpacing: -0.25,
    lineHeight: 26,
  },

  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,198,0,0.1)',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,198,0,0.3)',
  },
  markAllText: { fontFamily: 'Farro-Bold', fontSize: 12, color: '#FFC600' },

  unreadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,198,0,0.06)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,198,0,0.15)',
  },
  unreadBannerText: { fontFamily: 'Farro-Bold', fontSize: 11, color: '#92400e' },

  item: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    overflow: 'hidden',
  },
  itemUnread: {
    borderLeftWidth: 3,
    borderLeftColor: '#FFC600',
    backgroundColor: '#fffdf5',
  },
  itemInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    gap: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  itemContent: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  itemTitle: { fontFamily: 'Farro-Medium', fontSize: 13.5, color: '#374151', flex: 1 },
  itemTitleUnread: { fontFamily: 'Farro-Bold', color: '#111' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFC600', flexShrink: 0 },
  itemBody: { fontFamily: 'Farro-Regular', fontSize: 12.5, color: '#6b7280', lineHeight: 18 },
  itemTime: { fontFamily: 'Farro-Regular', fontSize: 11, color: '#9ca3af', marginTop: 5 },

  deleteBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    flexShrink: 0,
  },

  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: 'Farro-Bold',
    fontSize: 18,
    color: '#111',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: 'Farro-Regular',
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
});
