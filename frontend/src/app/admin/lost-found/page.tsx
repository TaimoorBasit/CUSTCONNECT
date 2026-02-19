'use client';

import { useState, useEffect } from 'react';
import { lostFoundService, LostFoundItem } from '@/services/lostFoundService';
import { MagnifyingGlassIcon, CheckCircleIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminLostFoundPage() {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'Lost' | 'Found'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'ACTIVE' | 'RESOLVED' | 'CLOSED'>('all');
  const [selectedItem, setSelectedItem] = useState<LostFoundItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [selectedCategory, selectedStatus]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }
      const data = await lostFoundService.getItems(params);
      setItems(data);
    } catch (error: any) {
      console.error('Error fetching items:', error);
      toast.error(error.response?.data?.message || 'Failed to load lost & found items');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (itemId: string) => {
    if (!confirm('Mark this item as resolved?')) return;

    try {
      await lostFoundService.resolveItem(itemId);
      toast.success('Item marked as resolved');
      fetchItems();
      if (selectedItem?.id === itemId) {
        setShowDetailModal(false);
      }
    } catch (error: any) {
      console.error('Error resolving item:', error);
      toast.error(error.response?.data?.message || 'Failed to resolve item');
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) return;

    try {
      await lostFoundService.deleteItem(itemId);
      toast.success('Item deleted successfully');
      fetchItems();
      if (selectedItem?.id === itemId) {
        setShowDetailModal(false);
      }
    } catch (error: any) {
      console.error('Error deleting item:', error);
      toast.error(error.response?.data?.message || 'Failed to delete item');
    }
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL.replace('/api', '')}${imagePath}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Lost & Found Management</h1>
          <p className="text-gray-600 mt-1">Monitor and help manage lost & found items across the platform</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Items</p>
            <p className="text-2xl font-bold text-gray-900">{items.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Active Lost</p>
            <p className="text-2xl font-bold text-red-600">
              {items.filter(i => i.category === 'Lost' && i.status === 'ACTIVE').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Active Found</p>
            <p className="text-2xl font-bold text-green-600">
              {items.filter(i => i.category === 'Found' && i.status === 'ACTIVE').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Resolved</p>
            <p className="text-2xl font-bold text-blue-600">
              {items.filter(i => i.isResolved).length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Categories
            </button>
            <button
              onClick={() => setSelectedCategory('Lost')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === 'Lost'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Lost
            </button>
            <button
              onClick={() => setSelectedCategory('Found')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === 'Found'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Found
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-gray-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setSelectedStatus('ACTIVE')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedStatus === 'ACTIVE'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setSelectedStatus('RESOLVED')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedStatus === 'RESOLVED'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Resolved
            </button>
            <button
              onClick={() => setSelectedStatus('CLOSED')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedStatus === 'CLOSED'
                  ? 'bg-gray-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Closed
            </button>
          </div>
        </div>

        {/* Items Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading items...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No items found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posted By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.imageUrl && (
                          <div className="h-10 w-10 rounded-lg overflow-hidden mr-3 bg-gray-200">
                            <img
                              src={getImageUrl(item.imageUrl) || ''}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.title}</div>
                          {item.itemType && (
                            <div className="text-sm text-gray-500">{item.itemType}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          item.category === 'Lost'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.user.firstName} {item.user.lastName}
                      <div className="text-xs text-gray-500">{item.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.isResolved ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Resolved
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        {!item.isResolved && (
                          <button
                            onClick={() => handleResolve(item.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Resolve
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Item Details</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedItem(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {selectedItem.imageUrl && (
                <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={getImageUrl(selectedItem.imageUrl) || ''}
                    alt={selectedItem.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedItem.category === 'Lost'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {selectedItem.category}
                </span>
                {selectedItem.isResolved && (
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                    Resolved
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{selectedItem.title}</h3>
              {selectedItem.description && (
                <p className="text-gray-700">{selectedItem.description}</p>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedItem.itemType && (
                  <div>
                    <span className="font-semibold text-gray-700">Type:</span>
                    <span className="ml-2 text-gray-600">{selectedItem.itemType}</span>
                  </div>
                )}
                {selectedItem.location && (
                  <div>
                    <span className="font-semibold text-gray-700">Location:</span>
                    <span className="ml-2 text-gray-600">{selectedItem.location}</span>
                  </div>
                )}
                <div>
                  <span className="font-semibold text-gray-700">Posted by:</span>
                  <span className="ml-2 text-gray-600">
                    {selectedItem.user.firstName} {selectedItem.user.lastName}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Email:</span>
                  <span className="ml-2 text-gray-600">{selectedItem.user.email}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Posted:</span>
                  <span className="ml-2 text-gray-600">{formatDate(selectedItem.createdAt)}</span>
                </div>
                {selectedItem.isResolved && selectedItem.resolvedAt && (
                  <div>
                    <span className="font-semibold text-gray-700">Resolved:</span>
                    <span className="ml-2 text-gray-600">{formatDate(selectedItem.resolvedAt)}</span>
                  </div>
                )}
              </div>
              {selectedItem.contactInfo && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Contact Information:</p>
                  <p className="text-blue-600">{selectedItem.contactInfo}</p>
                </div>
              )}
              {selectedItem.university && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-1">University:</p>
                  <p className="text-gray-600">{selectedItem.university.name}</p>
                </div>
              )}
              <div className="flex gap-4 pt-4">
                {!selectedItem.isResolved && (
                  <button
                    onClick={() => {
                      handleResolve(selectedItem.id);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Mark as Resolved
                  </button>
                )}
                <button
                  onClick={() => {
                    handleDelete(selectedItem.id);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





