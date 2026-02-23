'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Notification } from '@/types';
import toast from 'react-hot-toast';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => Promise<void>;
  addNotification: (notification: Notification) => void;
  refreshNotifications: () => Promise<void>;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { socket } = useSocket();
  const { user } = useAuth();
  const hasFetchedRef = useRef(false);

  // Fetch notifications from API - memoized with useCallback
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('cc_token') || localStorage.getItem('token');
      if (!token || !user) return;

      setIsLoading(true);
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          page: 1,
          limit: 50
        }
      });

      if (response.data.success && response.data.notifications) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Helper function to get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return '✅';
      case 'WARNING':
        return '⚠️';
      case 'ERROR':
        return '❌';
      case 'BUS_ALERT':
        return '🚌';
      case 'EVENT_UPDATE':
        return '📅';
      case 'NEW_MESSAGE':
        return '💬';
      default:
        return 'ℹ️';
    }
  };

  // Listen to Socket.io notifications
  useEffect(() => {
    if (!socket || !user?.id) return;

    const handleNotification = (notification: Notification) => {
      // Add notification to the list
      setNotifications(prev => {
        // Check if notification already exists
        const exists = prev.find(n => n.id === notification.id);
        if (exists) return prev;
        return [notification, ...prev];
      });

      // Show toast notification
      toast(notification.message, {
        icon: getNotificationIcon(notification.type),
        duration: 5000,
      });
    };

    socket.on('notification', handleNotification);

    // Join user's room for targeted notifications
    if (socket.connected) {
      socket.emit('join-room', user.id);
    } else {
      socket.once('connect', () => {
        socket.emit('join-room', user.id);
      });
    }

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket, user]);

  // Fetch notifications on mount and when user changes (only once per user)
  useEffect(() => {
    if (user && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchNotifications();
    } else if (!user) {
      hasFetchedRef.current = false;
      setNotifications([]);
    }
  }, [user, fetchNotifications]);

  useEffect(() => {
    // Calculate unread count whenever notifications change
    const unread = notifications.filter(n => !n.isRead).length;
    setUnreadCount(unread);
  }, [notifications]);

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('cc_token') || localStorage.getItem('token');
      if (!token) return;

      await axios.put(`${API_URL}/notifications/${id}/read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('cc_token') || localStorage.getItem('token');
      if (!token) return;

      await axios.put(`${API_URL}/notifications/read-all`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const token = localStorage.getItem('cc_token') || localStorage.getItem('token');
      if (!token) return;

      await axios.delete(`${API_URL}/notifications/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setNotifications(prev =>
        prev.filter(notification => notification.id !== id)
      );
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  };

  const addNotification = (notification: Notification) => {
    setNotifications(prev => {
      const exists = prev.find(n => n.id === notification.id);
      if (exists) return prev;
      return [notification, ...prev];
    });

    // Show toast notification
    toast(notification.message, {
      icon: getNotificationIcon(notification.type),
    });
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    refreshNotifications: fetchNotifications,
    isLoading,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}










