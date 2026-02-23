'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { lostFoundService, LostFoundItem } from '@/services/lostFoundService';
import { PlusIcon, MagnifyingGlassIcon, PhotoIcon, CheckCircleIcon, XMarkIcon, TrashIcon, MapPinIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import axios from 'axios';
import { getImageUrl } from '@/utils/url';
import PageHeader from '@/components/dashboard/PageHeader';

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
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedStatus !== 'all') params.status = selectedStatus;
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
    if (!formData.title.trim()) { toast.error('Title is required'); return; }
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
      toast.success(`${formData.category} item posted!`);
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
    setFormData({ title: '', description: '', category: 'Lost', itemType: 'Other', location: '', contactInfo: '' });
    setImageFile(null);
  };

  const handleResolve = async (itemId: string) => {
    if (!confirm('Mark this item as resolved?')) return;
    try {
      await lostFoundService.resolveItem(itemId);
      toast.success('Item marked as resolved');
      fetchItems();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resolve item');
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await lostFoundService.deleteItem(itemId);
      toast.success('Item deleted');
      fetchItems();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete item');
    }
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
    <div className="min-h-screen bg-[#F8F7F4]">
      <PageHeader
        title="Lost &amp; Found"
        subtitle="Report lost items or share found ones to help the campus community"
        icon={MagnifyingGlassIcon}
        iconColor="#D97706"
        iconBg="#FFFBEB"
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#A51C30] hover:bg-[#8b1526] transition-colors shadow-sm"
          >
            <PlusIcon className="w-4 h-4" strokeWidth={2.5} />
            Post Item
          </button>
        }
      />
      <div className="max-w-5xl mx-auto px-4 md:px-8 pb-16">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          {(['all', 'Lost', 'Found'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${selectedCategory === cat
                  ? cat === 'Lost'
                    ? 'bg-[#A51C30] text-white border-[#A51C30]'
                    : cat === 'Found'
                      ? 'bg-[#059669] text-white border-[#059669]'
                      : 'bg-[#1a2744] text-white border-[#1a2744]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
          <div className="w-px bg-gray-200 self-stretch" />
          {(['all', 'ACTIVE', 'RESOLVED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${selectedStatus === status
                  ? 'bg-[#1a2744] text-white border-[#1a2744]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
            >
              {status === 'all' ? 'All Status' : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
            <div className="w-8 h-8 border-2 border-[#A51C30] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400 font-medium">Loading items…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#FFFBEB] flex items-center justify-center">
              <MagnifyingGlassIcon className="w-8 h-8 text-[#D97706]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-semibold text-gray-700">No items found</p>
              <p className="text-sm text-gray-400 mt-1">Be the first to post a lost or found item</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#A51C30] hover:bg-[#8b1526] transition-colors"
            >
              <PlusIcon className="w-4 h-4" strokeWidth={2.5} />
              Post Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all overflow-hidden cursor-pointer"
                onClick={() => { setSelectedItem(item); setShowDetailModal(true); }}
              >
                {/* Category indicator bar */}
                <div className={`h-1.5 ${item.category === 'Lost' ? 'bg-[#A51C30]' : 'bg-[#059669]'}`} />
                {item.imageUrl && (
                  <div className="h-44 bg-gray-100 relative overflow-hidden">
                    <img
                      src={getImageUrl(item.imageUrl) || ''}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${item.category === 'Lost' ? 'bg-[#FFF5F5] text-[#A51C30]' : 'bg-[#ECFDF5] text-[#059669]'
                      }`}>
                      {item.category}
                    </span>
                    {item.isResolved && (
                      <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg bg-[#ECFDF5] text-[#059669]">
                        Resolved
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1.5 group-hover:text-[#1a2744] transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2 leading-relaxed">{item.description}</p>
                  )}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-400 mb-3">
                    {item.itemType && <span className="font-medium">{item.itemType}</span>}
                    {item.location && (
                      <span className="flex items-center gap-0.5">
                        <MapPinIcon className="w-3 h-3" />{item.location}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-50">
                    <span className="font-medium">{item.user.firstName} {item.user.lastName}</span>
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1a2744]">Post Lost or Found Item</h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category *</label>
                <div className="flex gap-3">
                  {(['Lost', 'Found'] as const).map((cat) => (
                    <label key={cat} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${formData.category === cat
                        ? cat === 'Lost'
                          ? 'border-[#A51C30] bg-[#FFF5F5] text-[#A51C30]'
                          : 'border-[#059669] bg-[#ECFDF5] text-[#059669]'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                      }`}>
                      <input
                        type="radio"
                        value={cat}
                        checked={formData.category === cat}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as 'Lost' | 'Found' })}
                        className="sr-only"
                      />
                      <span className="font-semibold text-sm">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744]/30 transition"
                  placeholder="e.g., Lost iPhone 13"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Item Type</label>
                <select
                  value={formData.itemType}
                  onChange={(e) => setFormData({ ...formData, itemType: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744]/30 transition"
                >
                  {itemTypes.map((type) => (<option key={type} value={type}>{type}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744]/30 transition resize-none"
                  placeholder="Describe the item, its condition, distinctive features..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744]/30 transition"
                  placeholder="Where was it lost/found?"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Contact Info</label>
                <input
                  type="text"
                  value={formData.contactInfo}
                  onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744]/30 transition"
                  placeholder="Phone or email (defaults to your email)"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Photo (Optional)</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors bg-gray-50">
                    <PhotoIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Choose Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
                          setImageFile(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {imageFile && <span className="text-xs text-gray-500 font-medium">{imageFile.name}</span>}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#A51C30] hover:bg-[#8b1526] disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Posting…' : uploadingImage ? 'Uploading…' : 'Post Item'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1a2744]">Item Details</h2>
              <button
                onClick={() => { setShowDetailModal(false); setSelectedItem(null); }}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {selectedItem.imageUrl && (
                <div className="w-full h-64 bg-gray-100 rounded-2xl overflow-hidden">
                  <img
                    src={getImageUrl(selectedItem.imageUrl) || ''}
                    alt={selectedItem.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-lg ${selectedItem.category === 'Lost' ? 'bg-[#FFF5F5] text-[#A51C30]' : 'bg-[#ECFDF5] text-[#059669]'
                  }`}>
                  {selectedItem.category}
                </span>
                {selectedItem.isResolved && (
                  <span className="text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-lg bg-[#ECFDF5] text-[#059669]">
                    Resolved
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-[#1a2744]">{selectedItem.title}</h3>
              {selectedItem.description && (
                <p className="text-gray-600 text-sm leading-relaxed">{selectedItem.description}</p>
              )}
              <div className="grid grid-cols-2 gap-3">
                {selectedItem.itemType && (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Type</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedItem.itemType}</p>
                  </div>
                )}
                {selectedItem.location && (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Location</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedItem.location}</p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Posted by</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedItem.user.firstName} {selectedItem.user.lastName}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Posted</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(selectedItem.createdAt)}</p>
                </div>
              </div>
              {selectedItem.contactInfo && (
                <div className="bg-[#F0F3FA] p-4 rounded-xl border border-[#1a2744]/10">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Contact</p>
                  <p className="text-sm font-semibold text-[#1a2744]">{selectedItem.contactInfo}</p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                {selectedItem.userId === user?.id && !selectedItem.isResolved && (
                  <button
                    onClick={() => { handleResolve(selectedItem.id); setShowDetailModal(false); }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#059669] hover:bg-[#047857] transition-colors"
                  >
                    Mark as Resolved
                  </button>
                )}
                {selectedItem.userId === user?.id && (
                  <button
                    onClick={() => { handleDelete(selectedItem.id); setShowDetailModal(false); }}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#A51C30] hover:bg-[#8b1526] transition-colors flex items-center gap-1.5"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete
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
