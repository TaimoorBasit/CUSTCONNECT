'use client';

import { useState, useEffect } from 'react';
import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import toast from 'react-hot-toast';
import { adminService } from '@/services/adminService';

interface Cafe {
  id: string;
  name: string;
  description?: string;
  location: string;
  phone?: string;
  email?: string;
  openingHours?: string;
  isActive: boolean;
  university?: { id: string; name: string };
  owner?: { id: string; firstName: string; lastName: string; email: string };
  _count?: { menus: number; deals: number };
}

export default function AdminCafesPage() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [universities, setUniversities] = useState<Array<{ id: string; name: string }>>([]);
  const [cafeOwners, setCafeOwners] = useState<Array<{ id: string; firstName: string; lastName: string; email: string }>>([]);

  useEffect(() => {
    fetchCafes();
    fetchUniversities();
    fetchCafeOwners();
  }, []);

  const fetchCafes = async () => {
    try {
      const cafesData = await adminService.getCafes();
      setCafes(cafesData);
      setLoading(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load cafés');
      setLoading(false);
    }
  };

  const fetchUniversities = async () => {
    try {
      // TODO: Fetch from admin service
    } catch (error) {
      console.error('Failed to load universities');
    }
  };

  const fetchCafeOwners = async () => {
    try {
      const vendors = await adminService.getVendors();
      setCafeOwners(vendors.filter((v: any) => 
        v.roles?.some((r: any) => r.role?.name === 'CAFE_OWNER')
      ));
    } catch (error) {
      console.error('Failed to load cafe owners');
    }
  };

  const handleEdit = (cafe: Cafe) => {
    setSelectedCafe(cafe);
    setShowModal(true);
  };

  const handleDelete = async (cafeId: string) => {
    if (!confirm('Are you sure you want to delete this café?')) return;
    try {
      await adminService.deleteCafe(cafeId);
      toast.success('Café deleted successfully');
      fetchCafes();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete café');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-900">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Café Management</h1>
          <p className="text-gray-500">View all cafés managed by vendors. Cafés are created and managed by cafe owners themselves.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {cafes.map((cafe) => (
          <div key={cafe.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{cafe.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{cafe.location}</p>
                {cafe.university && (
                  <p className="mt-1 text-xs text-gray-400">{cafe.university.name}</p>
                )}
                {cafe.owner && (
                  <p className="mt-2 text-sm text-gray-600">
                    Owner: {cafe.owner.firstName} {cafe.owner.lastName}
                  </p>
                )}
                {cafe._count && (
                  <div className="mt-2 flex gap-4 text-sm text-gray-500">
                    <span>{cafe._count.menus} menu items</span>
                    <span>{cafe._count.deals} deals</span>
                  </div>
                )}
              </div>
              <span
                className={`ml-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  cafe.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {cafe.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleEdit(cafe)}
                className="flex-1 inline-flex justify-center items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <PencilIcon className="mr-2 h-4 w-4" />
                View Details
              </button>
              <button
                onClick={() => handleDelete(cafe.id)}
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
        <CafeModal
          cafe={selectedCafe}
          universities={universities}
          cafeOwners={cafeOwners}
          onClose={() => {
            setShowModal(false);
            setSelectedCafe(null);
          }}
          onSave={fetchCafes}
        />
      )}
    </div>
  );
}

function CafeModal({
  cafe,
  universities,
  cafeOwners,
  onClose,
  onSave,
}: {
  cafe: Cafe | null;
  universities: Array<{ id: string; name: string }>;
  cafeOwners: Array<{ id: string; firstName: string; lastName: string; email: string }>;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    name: cafe?.name || '',
    description: cafe?.description || '',
    location: cafe?.location || '',
    phone: cafe?.phone || '',
    email: cafe?.email || '',
    openingHours: cafe?.openingHours || '',
    universityId: cafe?.university?.id || '',
    ownerId: cafe?.owner?.id || '',
    isActive: cafe?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (cafe) {
        await adminService.updateCafe(cafe.id, formData);
        toast.success('Café updated successfully');
      } else {
        await adminService.createCafe(formData);
        toast.success('Café created successfully');
      }
      onSave();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save café');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">
            {cafe ? 'Café Details' : 'Create Café'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                <select
                  value={formData.ownerId}
                  onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">No owner</option>
                  {cafeOwners.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.firstName} {o.lastName} ({o.email})
                    </option>
                  ))}
                </select>
              </div>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opening Hours</label>
              <input
                type="text"
                value={formData.openingHours}
                onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                placeholder="e.g., 7:00 AM - 10:00 PM"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                {cafe ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

