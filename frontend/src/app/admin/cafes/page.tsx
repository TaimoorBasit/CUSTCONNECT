'use client';

import { useState, useEffect } from 'react';
import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
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
    const init = async () => {
      await Promise.all([fetchCafes(), fetchUniversities(), fetchCafeOwners()]);
      setLoading(false);
    };
    init();
  }, []);

  const fetchCafes = async () => {
    try {
      const cafesData = await adminService.getCafes();
      setCafes(cafesData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load cafés');
    }
  };

  const fetchUniversities = async () => {
    try {
      const unis = await adminService.getUniversities();
      setUniversities(unis);
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
    if (!confirm('Are you sure you want to decommission this establishment?')) return;
    try {
      await adminService.deleteCafe(cafeId);
      toast.success('Establishment decommissioned');
      fetchCafes();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete café');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse text-xs uppercase tracking-widest">Synchronizing gastro-intelligence...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 px-4 sm:px-0">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-8 md:p-12 shadow-2xl transition-all duration-700">
        <div className="absolute top-0 right-0 -m-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -m-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
              <BuildingStorefrontIcon className="w-3.5 h-3.5" />
              Establishment Control
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
              Café <span className="text-indigo-400">Network</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-xl leading-relaxed">
              Managing high-traffic university dining nodes. Oversee operational status, menu distribution, and strategic vendor placements.
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedCafe(null);
              setShowModal(true);
            }}
            className="flex items-center gap-3 px-8 py-5 bg-indigo-600 hover:bg-black text-white rounded-[24px] font-black shadow-xl shadow-indigo-600/20 transition-all active:scale-95 whitespace-nowrap uppercase text-xs tracking-widest"
          >
            <PlusIcon className="h-5 w-5 stroke-[3]" />
            Establish Node
          </button>
        </div>
      </div>

      {/* Cafes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cafes.map((cafe) => (
          <div key={cafe.id} className="group relative bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm transition-all duration-500 hover:shadow-2xl hover:border-black/5 flex flex-col">
            <div className="flex items-start justify-between mb-8">
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 group-hover:bg-black group-hover:text-white transition-all duration-500">
                <BuildingStorefrontIcon className="h-8 w-8 stroke-[2]" />
              </div>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${cafe.isActive
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  : 'bg-gray-50 text-gray-400 border-gray-100'
                }`}>
                {cafe.isActive ? 'Operational' : 'Deactivated'}
              </span>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors uppercase mb-1">{cafe.name}</h3>
              <div className="flex items-center gap-1.5 text-gray-400">
                <MapPinIcon className="w-3.5 h-3.5" />
                <p className="text-xs font-bold uppercase tracking-wider">{cafe.location}</p>
              </div>
              {cafe.university && (
                <p className="text-[10px] font-black text-black/20 mt-2 uppercase tracking-[0.2em]">{cafe.university.name}</p>
              )}
            </div>

            {cafe.owner && (
              <div className="mb-8 p-6 bg-gray-50 rounded-3xl border border-gray-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 group-hover:text-indigo-600 shadow-sm">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Administrator</p>
                    <p className="text-sm font-black text-gray-900">{cafe.owner.firstName} {cafe.owner.lastName}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-10 mt-auto">
              <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all group-hover:border-indigo-500/10">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Menus</p>
                <p className="text-2xl font-black text-gray-900 tracking-tighter">{cafe._count?.menus || 0}</p>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all group-hover:border-indigo-500/10">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Deals</p>
                <p className="text-2xl font-black text-gray-900 tracking-tighter">{cafe._count?.deals || 0}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleEdit(cafe)}
                className="flex-1 flex items-center justify-center gap-2 py-4.5 rounded-2xl bg-black text-white text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-indigo-600 active:scale-95 transition-all"
              >
                <PencilIcon className="h-4 w-4 stroke-[3]" />
                RECONFIGURE
              </button>
              <button
                onClick={() => handleDelete(cafe.id)}
                className="w-16 flex items-center justify-center rounded-2xl bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-sm shadow-rose-500/5"
              >
                <TrashIcon className="h-5 w-5 stroke-[2.5]" />
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
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (cafe) {
        await adminService.updateCafe(cafe.id, formData);
        toast.success('Configuration updated');
      } else {
        await adminService.createCafe(formData);
        toast.success('Establishment activated');
      }
      onSave();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Transmission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <div className="fixed inset-0 bg-[#0f172a]/90 backdrop-blur-md" onClick={onClose} />
        <div className="relative bg-white rounded-[40px] shadow-2xl max-w-2xl w-full overflow-hidden border border-white/20 text-gray-900">
          <div className="absolute top-0 right-0 -m-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>

          <div className="flex items-center justify-between p-8 md:p-10 border-b border-gray-50">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
                {cafe ? 'Establishment Config' : 'Node Initialization'}
              </h2>
              <p className="text-gray-400 font-medium italic text-sm">Strategic campus dining infrastructure</p>
            </div>
            <button
              onClick={onClose}
              className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 hover:scale-110 transition-all"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Establishment Brand Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 font-black text-gray-900 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-gray-300"
                  placeholder="e.g. CAFFEINE ALPHA"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Operational Zone *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 font-bold text-gray-900 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-gray-300"
                    placeholder="Building/Level"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Campus Association *</label>
                  <select
                    required
                    value={formData.universityId}
                    onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}
                    className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-[18px] font-bold text-gray-900 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select Region</option>
                    {universities.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Superintendent Assignment</label>
                <select
                  value={formData.ownerId}
                  onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                  className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-[18px] font-bold text-gray-900 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">No Active Assignment</option>
                  {cafeOwners.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.firstName} {o.lastName} ({o.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Service Narrative</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 font-bold text-gray-700 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-gray-300"
                  rows={2}
                  placeholder="Atmosphere and service summary..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Direct Contact</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 font-bold text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Digital Mail</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 font-bold text-gray-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Mission Hours</label>
                <div className="relative">
                  <ClockIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                  <input
                    type="text"
                    value={formData.openingHours}
                    onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                    placeholder="e.g., 07:00 - 22:00"
                    className="w-full rounded-2xl bg-gray-50 border border-gray-100 pl-14 pr-6 py-4 font-black text-gray-900 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-gray-200"
                  />
                </div>
              </div>

              <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-3xl flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-black text-emerald-900 uppercase text-xs tracking-widest">Operational Status</p>
                  <p className="text-[10px] font-bold text-emerald-600/60 leading-none">Enable/Disable establishment visibility</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${formData.isActive ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ${formData.isActive ? 'translate-x-7' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-5 bg-gray-50 text-gray-400 rounded-[24px] font-black hover:bg-gray-100 hover:text-gray-900 transition-all active:scale-[0.98] uppercase tracking-widest text-xs"
              >
                ABORT
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-[2] py-5 bg-black text-white rounded-[24px] font-black shadow-2xl shadow-black/20 hover:bg-indigo-600 active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-widest text-xs"
              >
                {submitting ? 'PROCESSING...' : cafe ? 'SYNC CONFIG' : 'INITIALIZE NODE'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

