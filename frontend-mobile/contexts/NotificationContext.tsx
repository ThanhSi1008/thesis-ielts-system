import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { notificationsApi } from '@/services';
import { toast } from '@/components/ui/Toaster';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

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
  permissionStatus: Notifications.PermissionStatus | null;
  showPermissionBanner: boolean;
  pushToken: string | null;
  fetchNotifications: (page?: number, append?: boolean) => Promise<Notification[]>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  dismissPermissionBanner: () => Promise<void>;
  requestPushPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Set default notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false, // Don't show system alert in foreground - we use custom Toast
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: false,
    shouldShowList: false,
  }),
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // Push notifications state
  const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus | null>(
    null,
  );
  const [showPermissionBanner, setShowPermissionBanner] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);

  const prevUnreadCountRef = useRef(0);
  const toastedIdsRef = useRef<Set<string>>(new Set());
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

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
  const fetchNotifications = useCallback(
    async (page = 1, append = false) => {
      if (!user) return [];
      setLoading(true);
      try {
        const res = await notificationsApi.getNotifications(page, 20);
        const newItems: Notification[] = res.notifications ?? [];

        setNotifications((prev) => {
          if (append) {
            // Filter duplicates
            const prevIds = new Set(prev.map((item) => item.id));
            const filteredNew = newItems.filter((item) => !prevIds.has(item.id));
            return [...prev, ...filteredNew];
          }
          return newItems;
        });

        return newItems;
      } catch (e) {
        console.error('Failed to fetch notifications:', e);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  // Helper to check for new notifications and show toasts
  const checkForNewNotifications = async () => {
    try {
      const res = await notificationsApi.getNotifications(1, 5);
      const latestNotifications: Notification[] = res.notifications ?? [];

      // Find unread notifications that haven't been toasted yet
      const newUnread = latestNotifications.filter(
        (n) => !n.isRead && !toastedIdsRef.current.has(n.id),
      );

      // Toast the newest ones (in reverse order, so the absolute newest shows last/top)
      newUnread.reverse().forEach((n) => {
        toastedIdsRef.current.add(n.id);
        toast.info(n.title || 'New Notification', n.body || 'You have a new notification.', () => {
          if (n.link) {
            router.push(n.link as any);
          } else {
            router.push('/notification');
          }
        });
      });
    } catch (e) {
      console.error('Failed to check for new notifications:', e);
    }
  };

  // Actions
  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    prevUnreadCountRef.current = Math.max(0, prevUnreadCountRef.current - 1);

    try {
      await notificationsApi.markAsRead(id);
    } catch (e) {
      console.error('Failed to mark notification as read:', e);
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

  // Register push token with backend
  const registerPushToken = useCallback(async () => {
    try {
      if (!Device.isDevice) {
        console.log('Must use physical device for Push Notifications');
        return;
      }

      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      if (!projectId) {
        console.warn('EAS Project ID not found. Skipping push token registration.');
        return;
      }

      const tokenResult = await Notifications.getExpoPushTokenAsync({ projectId });
      const token = tokenResult.data;

      await notificationsApi.addPushToken(token, Platform.OS);
      setPushToken(token);
      console.log('Push token registered successfully:', token);
    } catch (error) {
      console.error('Error registering push token:', error);
    }
  }, []);

  // Dismiss permission banner soft prompt
  const dismissPermissionBanner = async () => {
    setShowPermissionBanner(false);
    const now = Date.now().toString();
    await AsyncStorage.setItem('notif-soft-dismissed-at', now);

    const countStr = (await AsyncStorage.getItem('notif-soft-dismiss-count')) ?? '0';
    const newCount = parseInt(countStr, 10) + 1;
    await AsyncStorage.setItem('notif-soft-dismiss-count', newCount.toString());
    console.log(`Push banner soft dismissed. Total dismiss count: ${newCount}`);
  };

  // Request system push permissions
  const requestPushPermission = async (): Promise<boolean> => {
    setShowPermissionBanner(false);
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionStatus(status);

      if (status === 'granted') {
        await registerPushToken();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to request push permissions:', error);
      return false;
    }
  };

  // Handle logout: clear local state
  useEffect(() => {
    if (!user && pushToken) {
      setPushToken(null);
    }
  }, [user, pushToken]);

  // Set up notifications, listeners and soft-prompt timer
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setNotifications([]);
      prevUnreadCountRef.current = 0;
      toastedIdsRef.current.clear();
      setShowPermissionBanner(false);

      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    // 1. Initial fetches
    fetchUnreadCount();

    // 2. Setup 60s polling for fallback
    pollingIntervalRef.current = setInterval(() => {
      fetchUnreadCount();
    }, 60000);

    // 3. Setup listeners
    // Foreground listener
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      const { title, body, data } = notification.request.content;

      // Custom inside-app Toast UI on foreground push
      toast.info(title || 'New Notification', body || 'You have a new message.', () => {
        if (data?.link) {
          router.push(data.link as any);
        } else {
          router.push('/notification');
        }
      });

      // Update unread badge/lists
      fetchUnreadCount();
    });

    // Tap/Interaction response listener (when tapping background push notifications)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.link) {
        router.push(data.link as any);
      } else {
        router.push('/notification');
      }
    });

    // 4. Soft-prompt permission timing logic (2 minutes delay)
    let bannerTimer: NodeJS.Timeout;

    const checkShouldShowBanner = async () => {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        setPermissionStatus(status);

        if (status === 'granted') {
          registerPushToken();
          return;
        }

        if (status === 'denied') {
          return; // Skip banner if explicitly denied
        }

        // Check AsyncStorage rules for re-prompt
        const lastDismissedStr = await AsyncStorage.getItem('notif-soft-dismissed-at');
        const dismissCountStr = (await AsyncStorage.getItem('notif-soft-dismiss-count')) ?? '0';
        const dismissCount = parseInt(dismissCountStr, 10);

        if (dismissCount >= 3) {
          console.log('Soft-prompt dismissed 3 times. Silencing banner.');
          return;
        }

        if (lastDismissedStr) {
          const lastDismissed = parseInt(lastDismissedStr, 10);
          const sevenDays = 7 * 24 * 60 * 60 * 1000;
          if (Date.now() - lastDismissed < sevenDays) {
            console.log('Soft-prompt banner in cooldown.');
            return;
          }
        }

        // Delay active prompt by 2 minutes
        console.log('Scheduling soft-prompt banner in 2 minutes...');
        bannerTimer = setTimeout(() => {
          setShowPermissionBanner(true);
        }, 120000);
      } catch (e) {
        console.error('Error during permission banner check:', e);
      }
    };

    checkShouldShowBanner();

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
      if (bannerTimer) {
        clearTimeout(bannerTimer);
      }
    };
  }, [user, fetchUnreadCount, registerPushToken, router]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        loading,
        permissionStatus,
        showPermissionBanner,
        pushToken,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        dismissPermissionBanner,
        requestPushPermission,
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
