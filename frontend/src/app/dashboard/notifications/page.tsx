'use client';

import { useState, useEffect } from 'react';
import BellIcon from '@heroicons/react/24/outline/BellIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import { useNotifications } from '@/contexts/NotificationContext';
import { Notification } from '@/types';
import toast from 'react-hot-toast';

const getNotificationStyles = (type: string): string => {
  switch (type) {
    case 'WARNING':
      return 'border-orange-200 bg-orange-50 text-orange-900';
    case 'ERROR':
      return 'border-red-200 bg-red-50 text-red-900';
    case 'SUCCESS':
      return 'border-green-200 bg-green-50 text-green-900';
    case 'BUS_ALERT':
      return 'border-blue-200 bg-blue-50 text-blue-900';
    case 'EVENT_UPDATE':
      return 'border-purple-200 bg-purple-50 text-purple-900';
    default:
      return 'border-gray-200 bg-gray-50 text-gray-900';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, refreshNotifications, isLoading } = useNotifications();
  const [hasRefreshed, setHasRefreshed] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Only refresh once when component mounts
  useEffect(() => {
    if (!hasRefreshed) {
      setHasRefreshed(true);
      refreshNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation(); // Prevent triggering the notification click
    
    if (!confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      setDeletingId(notificationId);
      await deleteNotification(notificationId);
      toast.success('Notification deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete notification:', error);
      toast.error(error.message || 'Failed to delete notification');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-blue-700">
          <BellIcon className="h-5 w-5" />
          <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
          {notifications.filter(n => !n.isRead).length > 0 && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {notifications.filter(n => !n.isRead).length} unread
            </span>
          )}
        </div>
        {notifications.filter(n => !n.isRead).length > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12">
          <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-gray-500">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`rounded-xl border p-5 shadow-sm cursor-pointer transition-all hover:shadow-md relative ${
                notification.isRead 
                  ? getNotificationStyles(notification.type || 'INFO')
                  : `${getNotificationStyles(notification.type || 'INFO')} ring-2 ring-blue-300`
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-8">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">{notification.title}</h3>
                    {!notification.isRead && (
                      <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                    )}
                  </div>
                  <p className="mt-2 text-sm">{notification.message}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDeleteNotification(e, notification.id)}
                  disabled={deletingId === notification.id}
                  className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                  title="Delete notification"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


