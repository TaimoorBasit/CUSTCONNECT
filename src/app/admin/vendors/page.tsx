'use client';

import { useState, useEffect } from 'react';
import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';
import MapIcon from '@heroicons/react/24/outline/MapIcon';
import CheckIcon from '@heroicons/react/24/outline/CheckIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import toast from 'react-hot-toast';
import { adminService } from '@/services/adminService';

interface Vendor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Array<{ name: string }>;
  cafes?: Array<{ id: string; name: string }>;
  busRoutes?: Array<{ id: string; name: string }>;
  isActive: boolean;
}

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [roles, setRoles] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    fetchVendors();
    fetchRoles();
  }, []);

  const fetchVendors = async () => {
    try {
      const vendors = await adminService.getVendors();
      setVendors(vendors.map((v: any) => ({
        ...v,
        roles: v.roles?.map((ur: any) => ({ name: ur.role.name })) || [],
        cafes: v.ownedCafes || []
      })));
      setLoading(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load vendors');
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const rolesData = await adminService.getRoles();
      // Filter to only vendor roles
      const vendorRoles = rolesData.filter((r: any) => 
        r.name === 'CAFE_OWNER' || r.name === 'BUS_OPERATOR' || r.name === 'PRINTER_SHOP_OWNER'
      );
      setRoles(vendorRoles);
    } catch (error) {
      console.error('Failed to load roles');
    }
  };

  const handleApproveVendor = async (vendorId: string) => {
    try {
      await adminService.approveVendor(vendorId);
      toast.success('Vendor approved successfully');
      fetchVendors();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve vendor');
    }
  };

  const handleCreate = () => {
    setShowModal(true);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-900">Loading...</div>;
  }

  if (vendors.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Vendor Management</h1>
          <p className="text-gray-500">Approve vendors and manage their portal access.</p>
        </div>
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No vendors yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Assign vendor roles to users from the Users page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Vendor Management</h1>
          <p className="text-gray-500">Create vendors, assign business roles, and manage their portal access.</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <PlusIcon className="mr-2 h-5 w-5" />
          Create Vendor
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {vendors.map((vendor) => {
          const isCafeOwner = vendor.roles.some(r => r.name === 'CAFE_OWNER');
          const isBusOperator = vendor.roles.some(r => r.name === 'BUS_OPERATOR');

          return (
            <div key={vendor.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {vendor.firstName} {vendor.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{vendor.email}</p>
                  <div className="mt-2 flex gap-2">
                    {vendor.roles.map((role) => (
                      <span
                        key={role.name}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                      >
                        {role.name.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
                <span
                  className={`ml-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    vendor.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {vendor.isActive ? 'Active' : 'Pending'}
                </span>
              </div>

              {isCafeOwner && vendor.cafes && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500 mb-2">Cafés:</p>
                  <div className="flex gap-2">
                    {vendor.cafes.map((cafe) => (
                      <span
                        key={cafe.id}
                        className="inline-flex items-center px-2 py-1 rounded text-xs bg-yellow-50 text-yellow-700"
                      >
                        <BuildingStorefrontIcon className="mr-1 h-3 w-3" />
                        {cafe.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {isBusOperator && vendor.busRoutes && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500 mb-2">Bus Routes:</p>
                  <div className="flex gap-2">
                    {vendor.busRoutes.map((route) => (
                      <span
                        key={route.id}
                        className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-50 text-green-700"
                      >
                        <MapIcon className="mr-1 h-3 w-3" />
                        {route.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {!vendor.isActive && (
                <div className="mt-4">
                  <button
                    onClick={() => handleApproveVendor(vendor.id)}
                    className="w-full inline-flex justify-center items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                  >
                    <CheckIcon className="mr-2 h-4 w-4" />
                    Approve Vendor
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showModal && (
        <CreateVendorModal
          roles={roles}
          onClose={() => {
            setShowModal(false);
          }}
          onSave={fetchVendors}
        />
      )}
    </div>
  );
}

function CreateVendorModal({
  roles,
  onClose,
  onSave,
}: {
  roles: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    roleId: '',
    universityId: '',
  });
  const [universities, setUniversities] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const universitiesData = await adminService.getUniversities();
      setUniversities(universitiesData);
    } catch (error) {
      console.error('Failed to load universities');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create user first
      const user = await adminService.createUser({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        universityId: formData.universityId || undefined,
        isActive: true,
        isVerified: true,
      });

      // Assign vendor role
      if (formData.roleId) {
        await adminService.assignRole(user.id, formData.roleId);
      }

      toast.success('Vendor created successfully');
      onSave();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create vendor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Create Vendor</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                minLength={6}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Role *</label>
                <select
                  required
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                >
                  <option value="">Select role...</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name === 'PRINTER_SHOP_OWNER' ? 'Printer Shop Owner' : role.name.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                <select
                  value={formData.universityId}
                  onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                >
                  <option value="">Select university...</option>
                  {universities.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Creating...' : 'Create Vendor'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

