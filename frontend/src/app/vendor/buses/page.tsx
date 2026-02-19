'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { vendorService } from '@/services/vendorService';
import MapIcon from '@heroicons/react/24/outline/MapIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import toast from 'react-hot-toast';

interface BusRoute {
  id: string;
  name: string;
  number: string;
  busNumber?: string;
  driverContactNumber?: string;
  description?: string;
  isActive: boolean;
  schedules: Array<{
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    createdAt: string;
  }>;
}

export default function VendorBusesPage() {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const routesData = await vendorService.getMyBusRoutes();
      setRoutes(routesData);
    } catch (error: any) {
      console.error('Failed to fetch bus routes:', error);
      toast.error(error.message || 'Failed to load bus routes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-900">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Bus Routes</h1>
          <p className="text-gray-500">Manage your bus routes, schedules, and notifications.</p>
        </div>
      </div>

      {routes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <MapIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No bus routes yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Contact super admin to get your bus routes added to the platform.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {routes.map((route) => (
            <div key={route.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{route.name}</h3>
                    <span className="text-sm text-gray-500">({route.number})</span>
                  </div>
                  {route.description && (
                    <p className="mt-1 text-sm text-gray-600">{route.description}</p>
                  )}
                </div>
                <span
                  className={`ml-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    route.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {route.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="mt-6">
                <p className="text-sm font-medium text-gray-500 mb-2">Schedule</p>
                <div className="space-y-1">
                  {route.schedules.map((schedule) => (
                    <div key={schedule.id} className="text-sm text-gray-600">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][schedule.dayOfWeek]}:{' '}
                      {schedule.startTime} - {schedule.endTime}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bus Details */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {route.busNumber && (
                    <div>
                      <p className="text-gray-500">Bus Number</p>
                      <p className="text-gray-900 font-medium">{route.busNumber}</p>
                    </div>
                  )}
                  {route.driverContactNumber && (
                    <div>
                      <p className="text-gray-500">Driver Contact</p>
                      <p className="text-gray-900 font-medium">{route.driverContactNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setSelectedRoute(route);
                    setShowDetailsModal(true);
                  }}
                  className="flex-1 inline-flex justify-center items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  <PencilIcon className="mr-2 h-4 w-4" />
                  Edit Details
                </button>
                <button
                  onClick={() => {
                    setSelectedRoute(route);
                    setShowScheduleModal(true);
                  }}
                  className="flex-1 inline-flex justify-center items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <PencilIcon className="mr-2 h-4 w-4" />
                  Manage Schedule
                </button>
                <button
                  onClick={() => {
                    setSelectedRoute(route);
                    setShowNotificationModal(true);
                  }}
                  className="flex-1 inline-flex justify-center items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Send Alert
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Management Modal */}
      {showScheduleModal && selectedRoute && (
        <ScheduleManagementModal
          route={selectedRoute}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedRoute(null);
          }}
          onSave={fetchRoutes}
        />
      )}

      {/* Bus Details Modal */}
      {showDetailsModal && selectedRoute && (
        <BusDetailsModal
          route={selectedRoute}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedRoute(null);
          }}
          onSave={fetchRoutes}
        />
      )}

      {/* Notification Modal */}
      {showNotificationModal && selectedRoute && (
        <NotificationModal
          route={selectedRoute}
          onClose={() => {
            setShowNotificationModal(false);
            setSelectedRoute(null);
          }}
          onSave={fetchRoutes}
        />
      )}
    </div>
  );
}

// Bus Details Modal
function BusDetailsModal({
  route,
  onClose,
  onSave,
}: {
  route: BusRoute;
  onClose: () => void;
  onSave: () => void;
}) {
  const [busNumber, setBusNumber] = useState(route.busNumber || '');
  const [driverContactNumber, setDriverContactNumber] = useState(route.driverContactNumber || '');
  const [description, setDescription] = useState(route.description || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      await vendorService.updateBusRoute(route.id, {
        busNumber: busNumber || undefined,
        driverContactNumber: driverContactNumber || undefined,
        description: description || undefined,
      });
      toast.success('Bus details updated successfully');
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Failed to update bus details:', error);
      toast.error(error.message || 'Failed to update bus details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Edit Bus Details - {route.name}</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bus Number / Plate</label>
              <input
                type="text"
                value={busNumber}
                onChange={(e) => setBusNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., ABC-1234"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Driver Contact Number</label>
              <input
                type="text"
                value={driverContactNumber}
                onChange={(e) => setDriverContactNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., +92 300 1234567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Route description..."
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Schedule Management Modal
function ScheduleManagementModal({
  route,
  onClose,
  onSave,
}: {
  route: BusRoute;
  onClose: () => void;
  onSave: () => void;
}) {
  const [schedules, setSchedules] = useState(route.schedules);
  const [newSchedule, setNewSchedule] = useState({
    dayOfWeek: 0,
    startTime: '',
    endTime: '',
  });

  const handleAddSchedule = () => {
    if (!newSchedule.startTime || !newSchedule.endTime) {
      toast.error('Please fill all fields');
      return;
    }
    setSchedules([
      ...schedules,
      {
        id: `temp-${Date.now()}`,
        ...newSchedule,
      },
    ]);
    setNewSchedule({ dayOfWeek: 0, startTime: '', endTime: '' });
  };

  const handleRemoveSchedule = (id: string) => {
    setSchedules(schedules.filter(s => s.id !== id));
  };

  const handleSave = async () => {
    try {
      await vendorService.updateBusSchedule(route.id, schedules.map(s => ({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime
      })));
      toast.success('Schedule updated successfully');
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Failed to update schedule:', error);
      toast.error(error.message || 'Failed to update schedule');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Manage Schedule - {route.name}</h2>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-3 text-gray-900">Add Schedule</h3>
            <div className="grid grid-cols-3 gap-4">
              <select
                value={newSchedule.dayOfWeek}
                onChange={(e) => setNewSchedule({ ...newSchedule, dayOfWeek: parseInt(e.target.value) })}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
              >
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, idx) => (
                  <option key={idx} value={idx} className="text-gray-900">{day}</option>
                ))}
              </select>
              <input
                type="time"
                value={newSchedule.startTime}
                onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
              />
              <input
                type="time"
                value={newSchedule.endTime}
                onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
              />
            </div>
            <button
              onClick={handleAddSchedule}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Schedule
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="flex items-center justify-between p-3 border-b">
                <div>
                  <span className="font-medium text-gray-900">
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][schedule.dayOfWeek]}
                  </span>
                  <span className="ml-3 text-gray-700">
                    {schedule.startTime} - {schedule.endTime}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveSchedule(schedule.id)}
                  className="ml-4 text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Notification Modal
function NotificationModal({
  route,
  onClose,
  onSave,
}: {
  route: BusRoute;
  onClose: () => void;
  onSave: () => void;
}) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('INFO');

  const handleSend = async () => {
    if (!title || !message) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      await vendorService.sendBusNotification(route.id, {
        title,
        message,
        type: type as 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'
      });
      toast.success('Notification sent successfully');
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Failed to send notification:', error);
      toast.error(error.message || 'Failed to send notification');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Send Alert - {route.name}</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                placeholder="e.g., Route Delayed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                rows={4}
                placeholder="Enter notification message..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
              >
                <option value="INFO" className="text-gray-900">Info</option>
                <option value="WARNING" className="text-gray-900">Warning</option>
                <option value="ERROR" className="text-gray-900">Error</option>
                <option value="SUCCESS" className="text-gray-900">Success</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Send Alert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

