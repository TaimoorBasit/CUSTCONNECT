'use client';

import { useState, useEffect } from 'react';
import BellIcon from '@heroicons/react/24/outline/BellIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import UserCircleIcon from '@heroicons/react/24/outline/UserCircleIcon';
import AcademicCapIcon from '@heroicons/react/24/outline/AcademicCapIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
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
      toast.success('Broadcast sent successfully');
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
      toast.success('Notification removed');
      setShowDeleteModal(false);
      setSelectedNotification(null);
      fetchNotifications();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete notification');
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'INFO':
        return 'bg-blue-100 text-blue-700 ring-1 ring-blue-700/10';
      case 'WARNING':
        return 'bg-amber-100 text-amber-700 ring-1 ring-amber-700/10';
      case 'SUCCESS':
        return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-700/10';
      case 'ERROR':
        return 'bg-rose-100 text-rose-700 ring-1 ring-rose-700/10';
      default:
        return 'bg-gray-100 text-gray-700 ring-1 ring-gray-700/10';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Scanning broadcast logs...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 px-4 sm:px-0">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#1a1b3b] to-indigo-900 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -m-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-0 left-0 -m-12 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-white mb-2">
              Broadcast <span className="text-indigo-400">Center</span>
            </h1>
            <p className="text-indigo-100/60 font-medium max-w-md">
              Deploy system bulletins, emergency alerts, and community updates to your entire campus network.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="group flex items-center justify-center gap-3 px-8 py-5 bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white rounded-[24px] font-black transition-all border border-white/10 shadow-xl active:scale-95"
          >
            <PlusIcon className="h-6 w-6 text-indigo-400 group-hover:rotate-90 transition-transform duration-300" />
            Launch Broadcast
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <h2 className="text-lg font-black text-gray-900 tracking-tight">Recent Dispatches</h2>
          <span className="px-3 py-1 bg-white rounded-xl text-xs font-black text-gray-500 shadow-sm border border-gray-100 uppercase tracking-widest">
            {notifications.length} Sent
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {notifications.length === 0 ? (
            <div className="px-8 py-20 text-center flex flex-col items-center space-y-4">
              <div className="p-6 bg-gray-50 rounded-full">
                <BellIcon className="h-12 w-12 text-gray-200" />
              </div>
              <p className="text-gray-400 font-medium tracking-tight text-lg">Airwaves are clear. No recent broadcasts.</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="group px-8 py-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-3 font-black tracking-tight">
                      <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 group-hover:border-indigo-100 group-hover:bg-indigo-50 transition-colors">
                        <BellIcon className="h-5 w-5 text-gray-400 group-hover:text-indigo-500" />
                      </div>
                      <h3 className="text-lg text-gray-900 leading-tight truncate max-w-md">
                        {notification.title}
                      </h3>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-[0.1em] ${getTypeStyle(notification.type)}`}>
                        {notification.type}
                      </span>
                    </div>

                    <p className="text-gray-500 font-medium leading-relaxed max-w-3xl">
                      {notification.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-xs text-gray-400 font-bold">
                      <div className="flex items-center gap-2 group/author">
                        <UserCircleIcon className="h-4 w-4 text-gray-300 group-hover/author:text-indigo-400" />
                        <span className="group-hover/author:text-gray-600 transition-colors truncate max-w-[150px]">
                          {notification.user.firstName} {notification.user.lastName}
                        </span>
                      </div>

                      {notification.user.university && (
                        <div className="flex items-center gap-2">
                          <AcademicCapIcon className="h-4 w-4 text-gray-300" />
                          <span className="truncate max-w-[120px]">{notification.user.university.name}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-4 w-4 text-gray-300" />
                        <span>{new Date(notification.createdAt).toLocaleString(undefined, {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}</span>
                      </div>

                      {notification.isRead && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md">
                          <CheckCircleIcon className="h-3.5 w-3.5" />
                          <span className="uppercase tracking-tighter text-[9px]">Viewed</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedNotification(notification);
                      setShowDeleteModal(true);
                    }}
                    className="flex-shrink-0 p-3 bg-rose-50 text-rose-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white shadow-sm"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Broadcast Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div
              className="fixed inset-0 bg-[#1a1b3b]/80 backdrop-blur-md transition-opacity"
              onClick={() => setShowCreateModal(false)}
            />

            <div className="relative bg-white rounded-[40px] shadow-2xl max-w-2xl w-full p-8 overflow-hidden transform transition-all border border-white/20">
              <div className="absolute top-0 right-0 -m-12 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>

              <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Launch Broadcast</h2>
                    <p className="text-gray-400 font-medium italic">Compose a message to your community</p>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Campaign Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-[24px] font-black text-gray-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:bg-gray-50 transition-all outline-none"
                      placeholder="e.g. System Maintenance Update"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Detailed Message</label>
                    <textarea
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-[24px] font-medium text-gray-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:bg-gray-50 transition-all outline-none resize-none"
                      rows={4}
                      placeholder="Compose your bulletin here..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Dispatch Level</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-[24px] font-black text-gray-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 appearance-none outline-none"
                    >
                      <option value="INFO">INFORMATION</option>
                      <option value="WARNING">WARNING ALERT</option>
                      <option value="SUCCESS">NETWORK SUCCESS</option>
                      <option value="ERROR">SYSTEM ERROR</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Network Scope</label>
                    <select
                      value={formData.universityId}
                      onChange={(e) => setFormData({ ...formData, universityId: e.target.value, userId: '' })}
                      className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-[24px] font-black text-gray-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 appearance-none outline-none"
                    >
                      <option value="">ALL UNIVERSITIES</option>
                      {universities.map((u) => (
                        <option key={u.id} value={u.id}>{u.name.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={handleCreate}
                    className="w-full py-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-[24px] font-black shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Deploy Dispatch
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedNotification && (
        <div className="fixed inset-0 z-[70] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-[#1a1b3b]/80 backdrop-blur-md transition-opacity"
              onClick={() => setShowDeleteModal(false)}
            />

            <div className="relative bg-white rounded-[40px] shadow-2xl max-w-md w-full p-8 overflow-hidden transform transition-all border border-white/20">
              <div className="absolute top-0 right-0 -m-8 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl"></div>

              <div className="relative z-10 text-center space-y-6">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-rose-100 shadow-inner">
                  <ExclamationTriangleIcon className="h-10 w-10 text-rose-600" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Archive Dispatch?</h3>
                  <p className="text-gray-500 font-medium leading-relaxed">
                    You are removing the broadcast <span className="text-gray-900 font-black">"{selectedNotification.title}"</span>.
                    This record will be permanently deleted from the logs.
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <button
                    onClick={handleDelete}
                    className="w-full py-4 bg-rose-500 text-white rounded-[20px] font-black shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-[0.98]"
                  >
                    Confirm Deletion
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="w-full py-4 bg-gray-100 text-gray-600 rounded-[20px] font-black hover:bg-gray-200 transition-all"
                  >
                    Keep Record
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

