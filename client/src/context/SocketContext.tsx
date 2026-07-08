import React, { createContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import apiClient from '../api/apiClient';
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
const usePolling = import.meta.env.VITE_USE_POLLING === 'true';

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
  const queryClient = useQueryClient();

  useEffect(() => {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications.slice(0, 50)));
  }, [notifications]);

  useEffect(() => {
    if (usePolling) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setIsConnected(false);
      return;
    }

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

    const invalidateDashboardQueries = () => {
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['managerDashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['employeeDashboardStats'] });
    };

    const invalidateProductQueries = () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['managerProducts'] });
      queryClient.invalidateQueries({ queryKey: ['employeeProducts'] });
      invalidateDashboardQueries();
    };

    const invalidateCustomerQueries = () => {
      queryClient.invalidateQueries({ queryKey: ['adminCustomers'] });
      queryClient.invalidateQueries({ queryKey: ['managerCustomers'] });
      invalidateDashboardQueries();
    };

    const invalidateSaleQueries = () => {
      queryClient.invalidateQueries({ queryKey: ['adminSales'] });
      queryClient.invalidateQueries({ queryKey: ['managerSales'] });
      queryClient.invalidateQueries({ queryKey: ['employeeSales'] });
      invalidateProductQueries();
      invalidateCustomerQueries();
    };

    const invalidateUserQueries = () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    };

    const refreshCurrentUser = async () => {
      try {
        await apiClient.get('/auth/me');
        window.dispatchEvent(new Event('auth:refresh'));
      } catch {
        // Existing auth flow will handle expired sessions on the next guarded request.
      }
    };

    newSocket.on('sale-created', invalidateSaleQueries);
    newSocket.on('sale-updated', invalidateSaleQueries);
    newSocket.on('sale-canceled', invalidateSaleQueries);
    newSocket.on('sale-deleted', invalidateSaleQueries);
    newSocket.on('sale-changed', invalidateSaleQueries);
    newSocket.on('product-created', invalidateProductQueries);
    newSocket.on('product-updated', invalidateProductQueries);
    newSocket.on('product-deleted', invalidateProductQueries);
    newSocket.on('customer-created', invalidateCustomerQueries);
    newSocket.on('customer-updated', invalidateCustomerQueries);
    newSocket.on('customer-deleted', invalidateCustomerQueries);
    newSocket.on('user-created', invalidateUserQueries);
    newSocket.on('user-updated', invalidateUserQueries);
    newSocket.on('user-deleted', invalidateUserQueries);
    newSocket.on('role-created', () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      refreshCurrentUser();
    });
    newSocket.on('role-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      refreshCurrentUser();
    });
    newSocket.on('role-deleted', () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      refreshCurrentUser();
    });
    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, queryClient]);

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


