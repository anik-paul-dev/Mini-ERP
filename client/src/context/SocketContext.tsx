import React, { createContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { NotificationItem } from '../types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: NotificationItem[];
  unreadNotifications: number;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

const NOTIFICATIONS_STORAGE_KEY = 'erp_notifications';

const loadNotifications = (): NotificationItem[] => {
  try {
    return JSON.parse(localStorage.getItem(NOTIFICATIONS_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(loadNotifications);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications.slice(0, 50)));
  }, [notifications]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', () => {
      setIsConnected(false);
    });

    newSocket.on('notification', (data: { type?: string; message?: string; title?: string }) => {
      const notification: NotificationItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type: data.type || 'general',
        title: data.title || (data.type === 'low_stock' ? 'Low Stock Alert' : 'Notification'),
        message: data.message || 'You have a new notification',
        read: false,
        createdAt: new Date().toISOString(),
      };

      setNotifications((prev) => [notification, ...prev].slice(0, 50));

      if (notification.type === 'low_stock') {
        toast.error(`${notification.title}: ${notification.message}`, { duration: 5000 });
      } else {
        toast(notification.message);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated]);

  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        notifications,
        unreadNotifications,
        markAllNotificationsRead,
        clearNotifications,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
