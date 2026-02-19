'use client';

import { useState, useEffect } from 'react';
import MapIcon from '@heroicons/react/24/outline/MapIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import toast from 'react-hot-toast';
import { adminService } from '@/services/adminService';

interface BusRoute {
  id: string;
  name: string;
  number: string;
  busNumber?: string;
  driverContactNumber?: string;
  description?: string;
  isActive: boolean;
  university?: { id: string; name: string };
  _count?: { schedules: number; subscriptions: number; notifications: number };
}

export default function AdminBusesPage() {
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);
  const [universities, setUniversities] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    fetchRoutes();
    fetchUniversities();
  }, []);

  const fetchRoutes = async () => {
    try {
      const routesData = await adminService.getBusRoutes();
      setRoutes(routesData);
      setLoading(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load bus routes');
      setLoading(false);
    }
  };

  const fetchUniversities = async () => {
    try {
      const universitiesData = await adminService.getUniversities();
      setUniversities(universitiesData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load universities');
    }
  };

  const handleCreate = () => {
    setSelectedRoute(null);
    setShowModal(true);
  };

  const handleEdit = (route: BusRoute) => {
    setSelectedRoute(route);
    setShowModal(true);
  };

  const handleDelete = async (routeId: string) => {
    if (!confirm('Are you sure you want to delete this bus route?')) return;
    try {
      await adminService.deleteBusRoute(routeId);
      toast.success('Bus route deleted successfully');
      fetchRoutes();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete bus route');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-900">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Bus Route Management</h1>
          <p className="text-gray-500">View all bus routes managed by bus operators. Routes are created and managed by bus operators themselves.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {routes.map((route) => (
          <div key={route.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">{route.name}</h3>
                  <span className="text-sm text-gray-500">({route.number})</span>
                </div>
                {route.university && (
                  <p className="mt-1 text-sm text-gray-500">{route.university.name}</p>
                )}
                {route.description && (
                  <p className="mt-2 text-sm text-gray-600">{route.description}</p>
                )}
                {/* Bus Details */}
                {(route.busNumber || route.driverContactNumber) && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {route.busNumber && (
                        <div>
                          <span className="text-gray-500">Bus Number: </span>
                          <span className="text-gray-900 font-medium">{route.busNumber}</span>
                        </div>
                      )}
                      {route.driverContactNumber && (
                        <div>
                          <span className="text-gray-500">Driver Contact: </span>
                          <span className="text-gray-900 font-medium">{route.driverContactNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {route._count && (
                  <div className="mt-2 flex gap-4 text-sm text-gray-500">
                    <span>{route._count.schedules} schedules</span>
                    <span>{route._count.subscriptions} subscribers</span>
                    <span>{route._count.notifications} notifications</span>
                  </div>
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
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleEdit(route)}
                className="flex-1 inline-flex justify-center items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <PencilIcon className="mr-2 h-4 w-4" />
                View Details
              </button>
              <button
                onClick={() => handleDelete(route.id)}
                className="inline-flex justify-center items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                title="Delete (for issue resolution only)"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <BusRouteModal
          route={selectedRoute}
          universities={universities}
          onClose={() => {
            setShowModal(false);
            setSelectedRoute(null);
          }}
          onSave={fetchRoutes}
        />
      )}
    </div>
  );
}

function BusRouteModal({
  route,
  universities,
  onClose,
  onSave,
}: {
  route: BusRoute | null;
  universities: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    name: route?.name || '',
    number: route?.number || '',
    description: route?.description || '',
    universityId: route?.university?.id || '',
    isActive: route?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (route) {
        await adminService.updateBusRoute(route.id, formData);
        toast.success('Bus route updated successfully');
      } else {
        await adminService.createBusRoute(formData);
        toast.success('Bus route created successfully');
      }
      onSave();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save bus route');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">
            {route ? 'Bus Route Details' : 'Create Bus Route'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number *</label>
                <input
                  type="text"
                  required
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">University *</label>
              <select
                required
                value={formData.universityId}
                onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select university...</option>
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600"
              />
              <label className="ml-2 text-sm text-gray-700">Active</label>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {route ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

