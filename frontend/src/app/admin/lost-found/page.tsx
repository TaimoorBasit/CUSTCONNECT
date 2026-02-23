'use client';

import { useState, useEffect } from 'react';
import { lostFoundService, LostFoundItem } from '@/services/lostFoundService';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XMarkIcon,
  TrashIcon,
  EyeIcon,
  ArchiveBoxIcon,
  ExclamationCircleIcon,
  MapPinIcon,
  CalendarDaysIcon,
  UserCircleIcon,
  EnvelopeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

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
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedStatus !== 'all') params.status = selectedStatus;

      const data = await lostFoundService.getItems(params);
      setItems(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to sync inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (itemId: string) => {
    if (!confirm('Mark this asset as recovered/resolved?')) return;

    try {
      await lostFoundService.resolveItem(itemId);
      toast.success('Asset status updated');
      fetchItems();
      if (selectedItem?.id === itemId) setShowDetailModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Resolution failed');
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Decommission this record? Memory erasure is permanent.')) return;

    try {
      await lostFoundService.deleteItem(itemId);
      toast.success('Record purged');
      fetchItems();
      if (selectedItem?.id === itemId) setShowDetailModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Purge failed');
    }
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL.replace('/api', '')}${imagePath}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Scanning global inventory...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 px-4 sm:px-0">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-8 md:p-12 shadow-2xl transition-all duration-700">
        <div className="absolute top-0 right-0 -m-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -m-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
              <ArchiveBoxIcon className="w-3.5 h-3.5" />
              Asset Retrieval System
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
              Inventory <span className="text-indigo-400">Control</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-xl leading-relaxed">
              Managing the ecosystem of displaced objects. Facilitating recovery and maintaining historical records of platform logistics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchItems}
              className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 transition-all"
            >
              <ArrowPathIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'System Total', value: items.length, icon: ArchiveBoxIcon, color: 'text-slate-500', bg: 'bg-slate-50' },
          { label: 'Active Reports', value: items.filter(i => i.status === 'ACTIVE').length, icon: ExclamationCircleIcon, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Found Assets', value: items.filter(i => i.category === 'Found' && i.status === 'ACTIVE').length, icon: CheckCircleIcon, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Recovered', value: items.filter(i => i.isResolved).length, icon: EyeIcon, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6 stroke-[2.5]" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black text-gray-900 tracking-tighter mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filtering & Listing */}
      <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 md:p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between gap-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'Lost', 'Found'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat as any)}
                className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat
                  ? 'bg-black text-white shadow-lg'
                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
              >
                {cat === 'all' ? 'All Units' : cat}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {['all', 'ACTIVE', 'RESOLVED'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status as any)}
                className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedStatus === status
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-4">
            <div className="p-8 bg-gray-50 rounded-full">
              <MagnifyingGlassIcon className="w-16 h-16 text-gray-200" />
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No matching telemetry found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Designation</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Classification</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Origin Agent</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item) => (
                  <tr key={item.id} className="group hover:bg-gray-50/80 transition-all cursor-default text-gray-900">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm group-hover:scale-105 transition-transform">
                          {item.imageUrl ? (
                            <img src={getImageUrl(item.imageUrl) || ''} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ArchiveBoxIcon className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-gray-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors truncate">{item.title}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{item.itemType || 'Unclassified'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${item.category === 'Lost'
                        ? 'bg-rose-50 text-rose-600 border-rose-100'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-bold text-sm text-gray-900 leading-none">{item.user.firstName} {item.user.lastName}</p>
                      <p className="text-[11px] font-medium text-gray-400 mt-1">{item.user.email}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${item.isResolved
                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                        : 'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse'
                        }`}>
                        {item.isResolved ? 'Recovered' : 'Active'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => { setSelectedItem(item); setShowDetailModal(true); }}
                          className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-black hover:text-white transition-all"
                        >
                          <EyeIcon className="w-4 h-4 stroke-[2.5]" />
                        </button>
                        {!item.isResolved && (
                          <button
                            onClick={() => handleResolve(item.id)}
                            className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-emerald-600 hover:text-white transition-all"
                          >
                            <CheckCircleIcon className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-rose-600 hover:text-white transition-all text-rose-500"
                        >
                          <TrashIcon className="w-4 h-4 stroke-[2.5]" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-[#0f172a]/95 backdrop-blur-xl" onClick={() => setShowDetailModal(false)} />
          <div className="relative bg-white rounded-[40px] max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl overflow-hidden border border-white/20 text-gray-900">
            <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left: Image/Overview */}
              <div className="space-y-8">
                <div className="aspect-square bg-gray-50 rounded-[32px] overflow-hidden border border-gray-100 shadow-inner group">
                  {selectedItem.imageUrl ? (
                    <img
                      src={getImageUrl(selectedItem.imageUrl) || ''}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-200">
                      <ArchiveBoxIcon className="w-24 h-24 mb-4" />
                      <p className="font-black uppercase tracking-widest text-[10px]">No visual capture</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[140px] p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Time Logic</p>
                    <p className="font-bold text-gray-900 text-sm">{formatDate(selectedItem.createdAt)}</p>
                  </div>
                  <div className="flex-1 min-w-[140px] p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Coordinates</p>
                    <p className="font-bold text-gray-900 text-sm line-clamp-1">{selectedItem.location || 'Unknown'}</p>
                  </div>
                </div>
              </div>

              {/* Right: Intelligence */}
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedItem.category === 'Lost' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                    {selectedItem.category} Unit
                  </span>
                  <button onClick={() => setShowDetailModal(false)} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 transition-all">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-10">
                  <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-4 uppercase">{selectedItem.title}</h2>
                  <p className="text-lg text-gray-500 font-medium leading-relaxed italic">
                    "{selectedItem.description || 'No detailed intelligence provided for this object.'}"
                  </p>
                </div>

                <div className="space-y-6 flex-grow">
                  <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">Origin Agent Intelligence</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-400 shadow-sm">
                          <UserCircleIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-900 leading-none">{selectedItem.user.firstName} {selectedItem.user.lastName}</p>
                          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Primary Contact</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-400 shadow-sm">
                          <EnvelopeIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-900 leading-none">{selectedItem.user.email}</p>
                          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Comm Link</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedItem.contactInfo && (
                    <div className="p-6 bg-slate-900 rounded-3xl text-white">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Secure Comm Keys</p>
                      <p className="font-bold text-sm tracking-wide">{selectedItem.contactInfo}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-10">
                  {!selectedItem.isResolved && (
                    <button
                      onClick={() => handleResolve(selectedItem.id)}
                      className="flex-1 py-5 bg-indigo-600 text-white rounded-[24px] font-black shadow-2xl shadow-indigo-900/20 hover:bg-black transition-all active:scale-[0.98] uppercase tracking-widest text-xs"
                    >
                      AUTHORIZE RECOVERY
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(selectedItem.id)}
                    className="p-5 bg-rose-50 text-rose-500 rounded-[24px] font-black hover:bg-rose-500 hover:text-white transition-all active:scale-[0.98]"
                  >
                    <TrashIcon className="w-6 h-6" />
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





