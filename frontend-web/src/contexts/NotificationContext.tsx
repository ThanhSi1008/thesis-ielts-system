'use client';

import {
  createContext, useContext, useState, useEffect,
  useCallback, useRef, ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from './AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  icon?: string;
  thumbnail?: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  isDropdownOpen: boolean;
  isLoading: boolean;
  toggleDropdown: () => void;
  closeDropdown: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 60_000; // 60 seconds

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading]         = useState(false);
  const dropdownLoadedRef = useRef(false);

  // ── Fetch unread count (lightweight, runs on interval) ──────────────────────
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get<{ count: number }>('/notifications/unread-count');
      setUnreadCount(res.data.count);
    } catch {
      // silently ignore polling errors
    }
  }, [user]);

  // ── Fetch full notification list (only when dropdown opens) ──────────────────
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await api.get<{ notifications: AppNotification[] }>('/notifications?limit=15');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.notifications.filter(n => !n.isRead).length);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // ── Initial + route change: reset dropdown, refresh count ───────────────────
  useEffect(() => {
    dropdownLoadedRef.current = false;
    setIsDropdownOpen(false);
    fetchUnreadCount();
  }, [pathname, fetchUnreadCount]);

  // ── Poll unread count every 60 s ────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [user, fetchUnreadCount]);

  // ── Toggle dropdown — load notifications the first time it opens ─────────────
  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen(prev => {
      const next = !prev;
      if (next && !dropdownLoadedRef.current) {
        dropdownLoadedRef.current = true;
        fetchNotifications();
      }
      return next;
    });
  }, [fetchNotifications]);

  const closeDropdown = useCallback(() => setIsDropdownOpen(false), []);

  const refreshNotifications = useCallback(() => {
    dropdownLoadedRef.current = true;
    fetchNotifications();
  }, [fetchNotifications]);

  // ── Mark one as read ────────────────────────────────────────────────────────
  const markAsRead = useCallback(async (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n),
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch { /* ignore */ }
  }, []);

  // ── Mark all as read ────────────────────────────────────────────────────────
  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await api.patch('/notifications/read-all');
    } catch { /* ignore */ }
  }, []);

  // ── Delete one notification ──────────────────────────────────────────────────
  const deleteNotification = useCallback(async (id: string) => {
    setNotifications(prev => {
      const target = prev.find(n => n.id === id);
      if (target && !target.isRead) setUnreadCount(c => Math.max(0, c - 1));
      return prev.filter(n => n.id !== id);
    });
    try {
      await api.delete(`/notifications/${id}`);
    } catch { /* ignore */ }
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isDropdownOpen,
        isLoading,
        toggleDropdown,
        closeDropdown,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
