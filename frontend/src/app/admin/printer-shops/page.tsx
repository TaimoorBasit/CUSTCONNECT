'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import PrinterIcon from '@heroicons/react/24/outline/PrinterIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import EnvelopeIcon from '@heroicons/react/24/outline/EnvelopeIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://custconnect-backend-production.up.railway.app/api';

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

      const response = await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const message = selectedShop
          ? 'Network node updated'
          : 'New printer hub established';
        toast.success(message);
        setShowModal(false);
        fetchShops();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (shop: PrinterShop) => {
    if (!confirm(`Confirm decommissioning of "${shop.name}"? This action is irreversible.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/admin/printer-shops/${shop.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Node decommissioned');
        fetchShops();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Decommissioning failed');
    }
  };


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Scanning network for active hubs...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 px-4 sm:px-0">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#1a1b3b] to-indigo-900 p-8 md:p-12 shadow-2xl transition-all duration-700">
        <div className="absolute top-0 right-0 -m-12 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -m-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white line-clamp-1">
              Printer <span className="text-blue-400">Network</span>
            </h1>
            <p className="text-blue-100/60 font-medium max-w-xl leading-relaxed">
              Managing high-performance printing hubs and distributed document fulfillment nodes across the campus.
            </p>
          </div>

          <button
            onClick={handleCreate}
            className="flex items-center gap-3 px-8 py-5 bg-blue-500 hover:bg-blue-600 text-white rounded-[24px] font-black shadow-xl shadow-blue-500/20 transition-all active:scale-95 whitespace-nowrap"
          >
            <PlusIcon className="h-6 w-6" />
            Establish Hub
          </button>
        </div>
      </div>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Network Hubs', value: shops.length, icon: PrinterIcon, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Operational Nodes', value: shops.filter(s => s.isActive).length, icon: CheckCircleIcon, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Throughput (Total)', value: shops.reduce((sum, s) => sum + (s._count?.printRequests || 0), 0), icon: DocumentTextIcon, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-8 h-8 stroke-[2.5]" />
              </div>
              <div className="text-[10px] font-black text-gray-400 tracking-widest uppercase">REAL-TIME</div>
            </div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-gray-900 tracking-tighter">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {shops.length === 0 ? (
        <div className="py-24 bg-white rounded-[40px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center space-y-6">
          <div className="p-8 bg-blue-50 rounded-full">
            <PrinterIcon className="h-16 w-16 text-blue-200" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">No Active Hubs</h3>
            <p className="text-gray-400 font-medium max-w-xs mx-auto">The printer network is currently offline. Establish your first hub to begin operations.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {shops.map((shop) => (
            <div key={shop.id} className="group relative bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm transition-all duration-500 hover:shadow-2xl hover:border-blue-500/20 flex flex-col">
              <div className="flex items-start justify-between mb-6">
                <div className="space-y-1.5">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors uppercase">{shop.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${shop.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                      {shop.isActive ? 'Operational' : 'Disabled'}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
                  <PrinterIcon className="w-6 h-6 stroke-[2.5]" />
                </div>
              </div>

              {shop.description && (
                <p className="text-sm text-gray-500 font-medium mb-6 line-clamp-2 italic">
                  "{shop.description}"
                </p>
              )}

              <div className="space-y-4 mb-8 flex-grow">
                {[
                  { icon: MapPinIcon, value: shop.location, label: 'Coordinates' },
                  { icon: PhoneIcon, value: shop.phone, label: 'Direct Line' },
                  { icon: EnvelopeIcon, value: shop.email, label: 'Digital Mail' },
                  { icon: UserIcon, value: shop.owner ? `${shop.owner.firstName} ${shop.owner.lastName}` : null, label: 'Authorized Admin' },
                  { icon: DocumentTextIcon, value: `${shop._count?.printRequests || 0} fulfillments`, label: 'Hub Throughput' },
                ].map((item, i) => item.value && (
                  <div key={i} className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest -mb-0.5">{item.label}</p>
                      <p className="text-xs font-bold text-gray-700">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-50">
                <button
                  onClick={() => handleEdit(shop)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-gray-100 bg-gray-50 text-xs font-black text-gray-600 hover:bg-black hover:text-white hover:border-black transition-all active:scale-95 uppercase tracking-widest"
                >
                  <PencilIcon className="w-4 h-4" />
                  RECONFIGURE
                </button>
                <button
                  onClick={() => handleDelete(shop)}
                  className="inline-flex items-center justify-center p-3.5 rounded-2xl border border-red-50 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="fixed inset-0 bg-[#1a1b3b]/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-[40px] shadow-2xl max-w-2xl w-full overflow-hidden border border-white/20 text-gray-900">
              <div className="absolute top-0 right-0 -m-8 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>

              <div className="flex items-center justify-between p-8 md:p-10 border-b border-gray-50">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                    {selectedShop ? 'Reconfigure Node' : 'Establish Network Hub'}
                  </h2>
                  <p className="text-gray-400 font-medium italic text-sm">Automated infrastructure deployment</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 hover:scale-110 transition-all"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Hub Designation *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 font-black text-gray-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-300"
                      placeholder="e.g. ALPHA DOCUMENT CENTER"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Operational Summary</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                      className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 font-bold text-gray-700 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-300"
                      placeholder="Specify Hub capabilities..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Deployment Coordinates</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 font-bold text-gray-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all mr-4"
                        placeholder="Building/Zone"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Direct Communication</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 font-bold text-gray-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                        placeholder="Contact number"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Hub Digital Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 font-bold text-gray-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                      placeholder="corporate@network.com"
                    />
                  </div>
                </div>

                {!selectedShop && (
                  <div className="pt-8 border-t border-gray-50 space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Administrative Credentials</h3>
                      <p className="text-xs text-gray-400 font-medium">Define the authorized hub superintendent</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Agent Given Name *</label>
                        <input
                          type="text"
                          required={!selectedShop}
                          value={formData.ownerFirstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, ownerFirstName: e.target.value }))}
                          className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 font-bold text-gray-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Agent Surname *</label>
                        <input
                          type="text"
                          required={!selectedShop}
                          value={formData.ownerLastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, ownerLastName: e.target.value }))}
                          className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 font-bold text-gray-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Professional Email *</label>
                        <input
                          type="email"
                          required={!selectedShop}
                          value={formData.ownerEmail}
                          onChange={(e) => setFormData(prev => ({ ...prev, ownerEmail: e.target.value }))}
                          className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 font-bold text-gray-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Security Key *</label>
                        <input
                          type="password"
                          required={!selectedShop}
                          value={formData.ownerPassword}
                          onChange={(e) => setFormData(prev => ({ ...prev, ownerPassword: e.target.value }))}
                          placeholder="8+ characters"
                          className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 font-black text-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-5 bg-gray-50 text-gray-400 rounded-[24px] font-black hover:bg-gray-100 hover:text-gray-900 transition-all active:scale-[0.98] uppercase tracking-widest text-xs"
                  >
                    ABORT
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-[2] py-5 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-[24px] font-black shadow-2xl shadow-blue-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-widest text-xs"
                  >
                    {submitting ? 'PROCESSING...' : selectedShop ? 'UPDATE CONFIG' : 'INITIALIZE HUB'}
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



