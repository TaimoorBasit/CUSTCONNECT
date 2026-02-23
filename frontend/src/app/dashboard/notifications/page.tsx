'use client';

import { useState, useEffect } from 'react';
import BellIcon from '@heroicons/react/24/outline/BellIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import { useNotifications } from '@/contexts/NotificationContext';
import { Notification } from '@/types';
import toast from 'react-hot-toast';

const getNotificationStyles = (type: string): { card: string; dot: string } => {
  switch (type) {
    case 'WARNING':
      return { card: 'border-orange-100 bg-orange-50', dot: 'bg-orange-400' };
    case 'ERROR':
      return { card: 'border-[#A51C30]/20 bg-[#FFF5F5]', dot: 'bg-[#A51C30]' };
    case 'SUCCESS':
      return { card: 'border-emerald-100 bg-emerald-50', dot: 'bg-emerald-500' };
    case 'BUS_ALERT':
      return { card: 'border-sky-100 bg-sky-50', dot: 'bg-sky-500' };
    case 'EVENT_UPDATE':
      return { card: 'border-purple-100 bg-purple-50', dot: 'bg-purple-500' };
    default:
      return { card: 'border-gray-100 bg-white', dot: 'bg-gray-400' };
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

  useEffect(() => {
    if (!hasRefreshed) {
      setHasRefreshed(true);
      refreshNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) await markAsRead(notification.id);
  };

  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    if (!confirm('Delete this notification?')) return;
    try {
      setDeletingId(notificationId);
      await deleteNotification(notificationId);
      toast.success('Notification deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete notification');
    } finally {
      setDeletingId(null);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Page title row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] flex items-center justify-center">
            <BellIcon className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1a2744]">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-xs text-gray-500">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFF5F5] text-[#A51C30] border border-[#A51C30]/20">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm font-semibold text-[#1a2744] hover:text-[#A51C30] transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
          <div className="w-7 h-7 border-2 border-[#A51C30] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading notifications…</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF7ED] flex items-center justify-center">
            <BellIcon className="h-8 w-8 text-orange-300" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-700">All caught up!</p>
            <p className="text-sm text-gray-400 mt-1">No notifications to show</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const style = getNotificationStyles(notification.type || 'INFO');
            return (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`relative rounded-2xl border p-4 cursor-pointer transition-all hover:shadow-sm ${style.card} ${!notification.isRead ? 'shadow-sm' : 'opacity-75'
                  }`}
              >
                <div className="flex items-start gap-3 pr-8">
                  <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${!notification.isRead ? style.dot : 'bg-gray-300'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-gray-900">{notification.title}</h3>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">{notification.message}</p>
                    <p className="mt-1.5 text-xs text-gray-400">{formatDate(notification.createdAt)}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteNotification(e, notification.id)}
                  disabled={deletingId === notification.id}
                  className="absolute top-3.5 right-3.5 p-1.5 text-gray-300 hover:text-[#A51C30] rounded-lg hover:bg-[#FFF5F5] transition-colors disabled:opacity-50"
                  title="Delete notification"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
