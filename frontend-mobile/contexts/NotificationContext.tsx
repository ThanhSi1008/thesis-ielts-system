import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { notificationsApi } from '@/services';
import { toast } from '@/components/ui/Toaster';
import { useRouter } from 'expo-router';

export type NotificationType =
  | 'STREAK_MILESTONE'
  | 'DICTATION_COMPLETE'
  | 'EXAM_GRADED'
  | 'SYSTEM_ANNOUNCEMENT'
  | 'PRONUNCIATION_RESULT'
  | string;

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextType {
  unreadCount: number;
  notifications: Notification[];
  loading: boolean;
  fetchNotifications: (page?: number, append?: boolean) => Promise<Notification[]>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const prevUnreadCountRef = useRef(0);
  const toastedIdsRef = useRef<Set<string>>(new Set());
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch unread count from backend
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await notificationsApi.getUnreadCount();
      const newCount = res.count ?? 0;
      
      // If the unread count has increased, check for new notifications to toast
      if (newCount > prevUnreadCountRef.current) {
        checkForNewNotifications();
      }
      
      prevUnreadCountRef.current = newCount;
      setUnreadCount(newCount);
    } catch (e) {
      console.error('Failed to fetch unread count:', e);
    }
  }, [user]);

  // Fetch full notification list
  const fetchNotifications = useCallback(async (page = 1, append = false) => {
    if (!user) return [];
    setLoading(true);
    try {
      const res = await notificationsApi.getNotifications(page, 20);
      const newItems: Notification[] = res.notifications ?? [];
      
      setNotifications((prev) => {
        if (append) {
          // Filter duplicates
          const prevIds = new Set(prev.map(item => item.id));
          const filteredNew = newItems.filter(item => !prevIds.has(item.id));
          return [...prev, ...filteredNew];
        }
        return newItems;
      });

      // Update unread count based on active page 1 fetch
      if (page === 1) {
        const count = newItems.filter(n => !n.isRead).length;
        // Keep in sync
        if (unreadCount !== count) {
          // Only sync if counts significantly mismatch (e.g. from local update)
          // Actually, let's trust getUnreadCount from backend, but update if local changes
        }
      }
      return newItems;
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Helper to check for new notifications and show toasts
  const checkForNewNotifications = async () => {
    try {
      const res = await notificationsApi.getNotifications(1, 5);
      const latestNotifications: Notification[] = res.notifications ?? [];
      
      // Find unread notifications that haven't been toasted yet
      const newUnread = latestNotifications.filter(
        n => !n.isRead && !toastedIdsRef.current.has(n.id)
      );

      // Toast the newest ones (in reverse order, so the absolute newest shows last/top)
      newUnread.reverse().forEach((n) => {
        toastedIdsRef.current.add(n.id);
        toast.info(
          n.title || 'New Notification',
          n.body || 'You have a new notification.',
          () => {
            // Navigate to notifications tab or specific link if exists
            if (n.link) {
              // Handle deep link or fallback to notifications list
              router.push('/notification');
            } else {
              router.push('/notification');
            }
          }
        );
      });
    } catch (e) {
      console.error('Failed to check for new notifications:', e);
    }
  };

  // Actions
  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    prevUnreadCountRef.current = Math.max(0, prevUnreadCountRef.current - 1);

    try {
      await notificationsApi.markAsRead(id);
    } catch (e) {
      console.error('Failed to mark notification as read:', e);
      // Rollback not strictly necessary for unread count in this simple state,
      // but fetchUnreadCount will fix it on next poll anyway.
    }
  };

  const markAllAsRead = async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    prevUnreadCountRef.current = 0;

    try {
      await notificationsApi.markAllAsRead();
    } catch (e) {
      console.error('Failed to mark all notifications as read:', e);
    }
  };

  const deleteNotification = async (id: string) => {
    const target = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    
    if (target && !target.isRead) {
      setUnreadCount((c) => Math.max(0, c - 1));
      prevUnreadCountRef.current = Math.max(0, prevUnreadCountRef.current - 1);
    }

    try {
      await notificationsApi.deleteNotification(id);
    } catch (e) {
      console.error('Failed to delete notification:', e);
    }
  };

  // Set up polling and initial fetch when user logs in/changes
  useEffect(() => {
    if (user) {
      // Fetch unread count immediately
      fetchUnreadCount();

      // Poll every 60 seconds
      pollingIntervalRef.current = setInterval(() => {
        fetchUnreadCount();
      }, 60000);
    } else {
      // Reset state on logout
      setUnreadCount(0);
      setNotifications([]);
      prevUnreadCountRef.current = 0;
      toastedIdsRef.current.clear();
      
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [user, fetchUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        loading,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
