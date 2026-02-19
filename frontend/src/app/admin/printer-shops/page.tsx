'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import PrinterIcon from '@heroicons/react/24/outline/PrinterIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface PrinterShop {
  id: string;
  name: string;
  description?: string;
  location?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  ownerId?: string;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  _count?: {
    printRequests: number;
  };
}

export default function PrinterShopsPage() {
  const [shops, setShops] = useState<PrinterShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedShop, setSelectedShop] = useState<PrinterShop | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    phone: '',
    email: '',
    ownerId: '',
    ownerFirstName: '',
    ownerLastName: '',
    ownerEmail: '',
    ownerPassword: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/printer-shops`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setShops(response.data.shops || []);
      }
    } catch (error: any) {
      console.error('Error fetching printer shops:', error);
      toast.error('Failed to load printer shops');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedShop(null);
    setFormData({
      name: '',
      description: '',
      location: '',
      phone: '',
      email: '',
      ownerId: '',
      ownerFirstName: '',
      ownerLastName: '',
      ownerEmail: '',
      ownerPassword: ''
    });
    setShowModal(true);
  };

  const handleEdit = (shop: PrinterShop) => {
    setSelectedShop(shop);
    setFormData({
      name: shop.name,
      description: shop.description || '',
      location: shop.location || '',
      phone: shop.phone || '',
      email: shop.email || '',
      ownerId: shop.ownerId || '',
      ownerFirstName: shop.owner?.firstName || '',
      ownerLastName: shop.owner?.lastName || '',
      ownerEmail: shop.owner?.email || '',
      ownerPassword: ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const url = selectedShop
        ? `${API_URL}/admin/printer-shops/${selectedShop.id}`
        : `${API_URL}/admin/printer-shops`;
      
      const method = selectedShop ? 'put' : 'post';

      // Log form data for debugging
      if (!selectedShop) {
        console.log('📝 Submitting printer shop with owner data:', {
          name: formData.name,
          ownerFirstName: formData.ownerFirstName,
          ownerLastName: formData.ownerLastName,
          ownerEmail: formData.ownerEmail,
          hasPassword: !!formData.ownerPassword
        });
      }

      const response = await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const message = selectedShop 
          ? 'Printer shop updated successfully' 
          : response.data.ownerCreated 
            ? 'Printer shop and owner account created successfully' 
            : 'Printer shop created successfully';
        toast.success(message);
        setShowModal(false);
        fetchShops();
      }
    } catch (error: any) {
      console.error('Error saving printer shop:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save printer shop';
      toast.error(errorMessage);
      console.error('Full error response:', error.response?.data);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (shop: PrinterShop) => {
    if (!confirm(`Are you sure you want to delete "${shop.name}"? This will also delete all associated print requests.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/admin/printer-shops/${shop.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Printer shop deleted successfully');
        fetchShops();
      }
    } catch (error: any) {
      console.error('Error deleting printer shop:', error);
      toast.error(error.response?.data?.message || 'Failed to delete printer shop');
    }
  };


  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading printer shops...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Printer Shops</h1>
          <p className="text-gray-500">Manage printer shops and their administrators</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCreate}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            Add Printer Shop
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Shops</p>
              <p className="text-2xl font-bold text-gray-900">{shops.length}</p>
            </div>
            <PrinterIcon className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Shops</p>
              <p className="text-2xl font-bold text-green-600">
                {shops.filter(s => s.isActive).length}
              </p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Requests</p>
              <p className="text-2xl font-bold text-blue-600">
                {shops.reduce((sum, shop) => sum + (shop._count?.printRequests || 0), 0)}
              </p>
            </div>
            <PrinterIcon className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Shops List */}
      {shops.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <PrinterIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No printer shops</h3>
          <p className="mt-1 text-sm text-gray-500">Create a printer shop to get started.</p>
          <button
            onClick={handleCreate}
            className="mt-4 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            Add Printer Shop
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <div key={shop.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{shop.name}</h3>
                  {shop.description && (
                    <p className="text-sm text-gray-500 mt-1">{shop.description}</p>
                  )}
                </div>
                <span
                  className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    shop.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {shop.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2 text-sm mb-4">
                {shop.location && (
                  <div>
                    <span className="text-gray-500">Location: </span>
                    <span className="text-gray-900">{shop.location}</span>
                  </div>
                )}
                {shop.phone && (
                  <div>
                    <span className="text-gray-500">Phone: </span>
                    <span className="text-gray-900">{shop.phone}</span>
                  </div>
                )}
                {shop.email && (
                  <div>
                    <span className="text-gray-500">Email: </span>
                    <span className="text-gray-900">{shop.email}</span>
                  </div>
                )}
                {shop.owner && (
                  <div>
                    <span className="text-gray-500">Owner: </span>
                    <span className="text-gray-900">{shop.owner.firstName} {shop.owner.lastName}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Total Requests: </span>
                  <span className="text-gray-900 font-medium">{shop._count?.printRequests || 0}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEdit(shop)}
                  className="flex-1 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <PencilIcon className="mr-2 h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(shop)}
                  className="inline-flex items-center justify-center rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedShop ? 'Edit Printer Shop' : 'Create Printer Shop'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Owner Information Section */}
                {!selectedShop && (
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Owner Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Owner First Name *
                        </label>
                        <input
                          type="text"
                          required={!selectedShop}
                          value={formData.ownerFirstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, ownerFirstName: e.target.value }))}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Owner Last Name *
                        </label>
                        <input
                          type="text"
                          required={!selectedShop}
                          value={formData.ownerLastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, ownerLastName: e.target.value }))}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Owner Email *
                        </label>
                        <input
                          type="email"
                          required={!selectedShop}
                          value={formData.ownerEmail}
                          onChange={(e) => setFormData(prev => ({ ...prev, ownerEmail: e.target.value }))}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Owner Password *
                        </label>
                        <input
                          type="password"
                          required={!selectedShop}
                          value={formData.ownerPassword}
                          onChange={(e) => setFormData(prev => ({ ...prev, ownerPassword: e.target.value }))}
                          placeholder="Set initial password"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">Owner can change password after first login</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : selectedShop ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



