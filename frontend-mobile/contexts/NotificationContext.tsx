import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NotificationContextType {
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    // Placeholder
  };

  return (
    <NotificationContext.Provider value={{ unreadCount, fetchNotifications }}>
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
