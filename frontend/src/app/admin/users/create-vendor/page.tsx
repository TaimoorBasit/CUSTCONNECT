'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { adminService } from '@/services/adminService';

export default function CreateVendorPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'CAFE_OWNER', // CAFE_OWNER, BUS_OPERATOR, or PRINTER_SHOP_OWNER
    restaurantName: '', // For cafe owners
    busCompanyName: '', // For bus operators
    printerShopName: '', // For printer shop owners
    universityId: '',
  });
  const [universities, setUniversities] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const data = await adminService.getUniversities();
      setUniversities(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load universities');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate temporary password if not provided
      const tempPassword = formData.password || generateTempPassword();

      // Create user account
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/vendors/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(localStorage.getItem('cc_token') || localStorage.getItem('token'))?.trim()}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: tempPassword,
          role: formData.role,
          restaurantName: formData.restaurantName,
          busCompanyName: formData.busCompanyName,
          printerShopName: formData.printerShopName,
          universityId: formData.universityId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create vendor account');
      }

      toast.success(`Vendor account created successfully! Temporary password: ${tempPassword}`);
      router.push('/admin/vendors');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create vendor account');
    } finally {
      setLoading(false);
    }
  };

  const generateTempPassword = () => {
    return `Temp${Math.random().toString(36).slice(-8)}!`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Create Vendor Account</h1>
        <p className="text-gray-500">Create a new vendor account (Cafe Owner, Bus Operator, or Printer Shop Owner).</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Temporary Password</label>
            <input
              type="text"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Leave empty to auto-generate"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <p className="mt-1 text-xs text-gray-500">Leave empty to auto-generate a temporary password</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
            <select
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="CAFE_OWNER">Cafe Owner</option>
              <option value="BUS_OPERATOR">Bus Operator</option>
              <option value="PRINTER_SHOP_OWNER">Printer Shop Owner</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">University *</label>
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
        </div>

        {formData.role === 'CAFE_OWNER' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name *</label>
            <input
              type="text"
              required={formData.role === 'CAFE_OWNER'}
              value={formData.restaurantName}
              onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
              placeholder="e.g., Kite Kitchen"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        )}

        {formData.role === 'BUS_OPERATOR' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bus Company Name *</label>
            <input
              type="text"
              required={formData.role === 'BUS_OPERATOR'}
              value={formData.busCompanyName}
              onChange={(e) => setFormData({ ...formData, busCompanyName: e.target.value })}
              placeholder="e.g., City Bus Service"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        )}

        {formData.role === 'PRINTER_SHOP_OWNER' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Printer Shop Name *</label>
            <input
              type="text"
              required={formData.role === 'PRINTER_SHOP_OWNER'}
              value={formData.printerShopName}
              onChange={(e) => setFormData({ ...formData, printerShopName: e.target.value })}
              placeholder="e.g., Burhan Book Shop"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Vendor Account'}
          </button>
        </div>
      </form>
    </div>
  );
}

