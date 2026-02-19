'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { lostFoundService, LostFoundItem } from '@/services/lostFoundService';
import { PlusIcon, MagnifyingGlassIcon, PhotoIcon, CheckCircleIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function LostFoundPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'Lost' | 'Found'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'ACTIVE' | 'RESOLVED'>('all');
  const [selectedItem, setSelectedItem] = useState<LostFoundItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Lost' as 'Lost' | 'Found',
    itemType: 'Other',
    location: '',
    contactInfo: '',
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const itemTypes = ['Phone', 'Wallet', 'Keys', 'Bag', 'Laptop', 'Book', 'ID Card', 'Other'];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      setSubmitting(true);
      const newItem = await lostFoundService.createItem({
        title: formData.title,
        description: formData.description || undefined,
        category: formData.category,
        itemType: formData.itemType,
        location: formData.location || undefined,
        contactInfo: formData.contactInfo || undefined,
      });

      // Upload image if provided
      if (imageFile && newItem.id) {
        try {
          setUploadingImage(true);
          await lostFoundService.uploadImage(newItem.id, imageFile);
        } catch (error: any) {
          console.error('Error uploading image:', error);
          toast.error('Item created but image upload failed');
        } finally {
          setUploadingImage(false);
        }
      }

      toast.success(`${formData.category} item posted successfully!`);
      setShowModal(false);
      resetForm();
      fetchItems();
    } catch (error: any) {
      console.error('Error creating item:', error);
      toast.error(error.response?.data?.message || 'Failed to post item');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Lost',
      itemType: 'Other',
      location: '',
      contactInfo: '',
    });
    setImageFile(null);
  };

  const handleResolve = async (itemId: string) => {
    if (!confirm('Mark this item as resolved?')) return;

    try {
      await lostFoundService.resolveItem(itemId);
      toast.success('Item marked as resolved');
      fetchItems();
    } catch (error: any) {
      console.error('Error resolving item:', error);
      toast.error(error.response?.data?.message || 'Failed to resolve item');
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await lostFoundService.deleteItem(itemId);
      toast.success('Item deleted successfully');
      fetchItems();
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
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lost & Found</h1>
            <p className="text-gray-600 mt-1">Report lost items or share found items to help others</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Post Item
          </button>
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
              All
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
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading items...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No items found. Be the first to post!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedItem(item);
                  setShowDetailModal(true);
                }}
              >
                {item.imageUrl && (
                  <div className="h-48 bg-gray-200 relative">
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
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        item.category === 'Lost'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {item.category}
                    </span>
                    {item.isResolved && (
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                  {item.description && (
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
                    {item.itemType && <span>Type: {item.itemType}</span>}
                    {item.location && <span>• {item.location}</span>}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>By {item.user.firstName} {item.user.lastName}</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Item Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Post Lost or Found Item</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Lost"
                      checked={formData.category === 'Lost'}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as 'Lost' | 'Found' })}
                      className="mr-2"
                    />
                    <span className="text-red-600 font-semibold">Lost</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Found"
                      checked={formData.category === 'Found'}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as 'Lost' | 'Found' })}
                      className="mr-2"
                    />
                    <span className="text-green-600 font-semibold">Found</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="e.g., Lost iPhone 13"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Type
                </label>
                <select
                  value={formData.itemType}
                  onChange={(e) => setFormData({ ...formData, itemType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  {itemTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Describe the item, its condition, distinctive features..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Where was it lost/found?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Information
                </label>
                <input
                  type="text"
                  value={formData.contactInfo}
                  onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Phone or email (defaults to your email)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo (Optional)
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <PhotoIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">Choose Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error('Image size must be less than 5MB');
                            return;
                          }
                          setImageFile(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {imageFile && (
                    <span className="text-sm text-gray-600">{imageFile.name}</span>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Posting...' : uploadingImage ? 'Uploading...' : 'Post Item'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  <span className="font-semibold text-gray-700">Posted:</span>
                  <span className="ml-2 text-gray-600">{formatDate(selectedItem.createdAt)}</span>
                </div>
              </div>
              {selectedItem.contactInfo && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Contact Information:</p>
                  <p className="text-blue-600">{selectedItem.contactInfo}</p>
                </div>
              )}
              <div className="flex gap-4 pt-4">
                {selectedItem.userId === user?.id && !selectedItem.isResolved && (
                  <button
                    onClick={() => {
                      handleResolve(selectedItem.id);
                      setShowDetailModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Mark as Resolved
                  </button>
                )}
                {selectedItem.userId === user?.id && (
                  <button
                    onClick={() => {
                      handleDelete(selectedItem.id);
                      setShowDetailModal(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





