'use client';

import { useState, useEffect } from 'react';
import BellIcon from '@heroicons/react/24/outline/BellIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import UserCircleIcon from '@heroicons/react/24/outline/UserCircleIcon';
import toast from 'react-hot-toast';
import { adminService } from '@/services/adminService';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string | null;
    username?: string | null;
    university?: {
      name: string;
    };
  };
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [universities, setUniversities] = useState<Array<{ id: string; name: string }>>([]);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'INFO',
    userId: '',
    universityId: '',
  });

  useEffect(() => {
    fetchNotifications();
    fetchUniversities();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await adminService.getNotifications({ page: 1, limit: 100 });
      setNotifications(data.notifications || []);
      setLoading(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load notifications');
      setLoading(false);
    }
  };

  const fetchUniversities = async () => {
    try {
      const data = await adminService.getUniversities();
      setUniversities(data);
    } catch (error: any) {
      console.error('Failed to load universities');
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.message) {
      toast.error('Title and message are required');
      return;
    }

    try {
      await adminService.createNotification({
        title: formData.title,
        message: formData.message,
        type: formData.type,
        userId: formData.userId || undefined,
        universityId: formData.universityId || undefined,
      });
      toast.success('Notification(s) sent successfully');
      setShowCreateModal(false);
      setFormData({
        title: '',
        message: '',
        type: 'INFO',
        userId: '',
        universityId: '',
      });
      fetchNotifications();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send notification');
    }
  };

  const handleDelete = async () => {
    if (!selectedNotification) return;
    try {
      await adminService.deleteNotification(selectedNotification.id);
      toast.success('Notification deleted successfully');
      setShowDeleteModal(false);
      setSelectedNotification(null);
      fetchNotifications();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete notification');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INFO':
        return 'bg-blue-100 text-blue-800';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800';
      case 'SUCCESS':
        return 'bg-green-100 text-green-800';
      case 'ERROR':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-900">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Notifications Management</h1>
          <p className="text-gray-500">View and send notifications to users.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <PlusIcon className="mr-2 h-5 w-5" />
          Send Notification
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {notifications.length === 0 ? (
            <li className="px-4 py-8 text-center text-gray-500">
              No notifications found
            </li>
          ) : (
            notifications.map((notification) => (
              <li key={notification.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <BellIcon className="h-6 w-6 text-gray-400" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-medium text-gray-900">{notification.title}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                            {notification.type}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <UserCircleIcon className="h-4 w-4" />
                            <span>{notification.user.firstName} {notification.user.lastName} ({notification.user.email || notification.user.username || 'No contact info'})</span>
                          </div>
                          {notification.user.university && (
                            <span>({notification.user.university.name})</span>
                          )}
                          <span>• {new Date(notification.createdAt).toLocaleString()}</span>
                          {notification.isRead && (
                            <span className="text-green-600">✓ Read</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedNotification(notification);
                      setShowDeleteModal(true);
                    }}
                    className="ml-4 inline-flex items-center px-3 py-1 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowCreateModal(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Send Notification</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Notification title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={4}
                    placeholder="Notification message"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="INFO">Info</option>
                    <option value="WARNING">Warning</option>
                    <option value="SUCCESS">Success</option>
                    <option value="ERROR">Error</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">University (optional)</label>
                    <select
                      value={formData.universityId}
                      onChange={(e) => setFormData({ ...formData, universityId: e.target.value, userId: '' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Send to all users</option>
                      {universities.map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">Leave empty to send to all users</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User ID (optional)</label>
                    <input
                      type="text"
                      value={formData.userId}
                      onChange={(e) => setFormData({ ...formData, userId: e.target.value, universityId: '' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Specific user ID"
                    />
                    <p className="mt-1 text-xs text-gray-500">Leave empty to send to all</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Send Notification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedNotification && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowDeleteModal(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Confirm Delete Notification</h2>
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete this notification sent to{' '}
                <span className="font-semibold">{selectedNotification.user.firstName} {selectedNotification.user.lastName}</span>?
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

