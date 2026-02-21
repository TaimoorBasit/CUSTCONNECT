'use client';

import { useState, useEffect } from 'react';
import MapIcon from '@heroicons/react/24/outline/MapIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import IdentificationIcon from '@heroicons/react/24/outline/IdentificationIcon';
import UsersIcon from '@heroicons/react/24/outline/UsersIcon';
import SignalIcon from '@heroicons/react/24/outline/SignalIcon';
import BuildingLibraryIcon from '@heroicons/react/24/outline/BuildingLibraryIcon';
import toast from 'react-hot-toast';
import { adminService } from '@/services/adminService';

interface BusRoute {
  id: string;
  name: string;
  number: string;
  busNumber?: string;
  driverContactNumber?: string;
  description?: string;
  isActive: boolean;
  university?: { id: string; name: string };
  _count?: { schedules: number; subscriptions: number; notifications: number };
}

export default function AdminBusesPage() {
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);
  const [universities, setUniversities] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchRoutes(), fetchUniversities()]);
      setLoading(false);
    };
    init();
  }, []);

  const fetchRoutes = async () => {
    try {
      const routesData = await adminService.getBusRoutes();
      setRoutes(routesData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load bus routes');
    }
  };

  const fetchUniversities = async () => {
    try {
      const universitiesData = await adminService.getUniversities();
      setUniversities(universitiesData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load universities');
    }
  };

  const handleCreate = () => {
    setSelectedRoute(null);
    setShowModal(true);
  };

  const handleEdit = (route: BusRoute) => {
    setSelectedRoute(route);
    setShowModal(true);
  };

  const handleDelete = async (routeId: string) => {
    if (!confirm('Are you sure you want to decommission this transport route?')) return;
    try {
      await adminService.deleteBusRoute(routeId);
      toast.success('Route decommissioned successfully');
      fetchRoutes();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete bus route');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse text-xs uppercase tracking-widest">Synchronizing logistical data...</p>
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
              <MapIcon className="w-3.5 h-3.5" />
              Logistics Coordination
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
              Transit <span className="text-indigo-400">Routes</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-xl leading-relaxed">
              Managing the university's skeletal transport network. Monitor route occupancy, schedule adherence, and operational status.
            </p>
          </div>

          <button
            onClick={handleCreate}
            className="flex items-center gap-3 px-8 py-5 bg-indigo-600 hover:bg-black text-white rounded-[24px] font-black shadow-xl shadow-indigo-600/20 transition-all active:scale-95 whitespace-nowrap uppercase text-xs tracking-widest"
          >
            <PlusIcon className="h-5 w-5 stroke-[3]" />
            Establish Route
          </button>
        </div>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {routes.map((route) => (
          <div key={route.id} className="group relative bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm transition-all duration-500 hover:shadow-2xl hover:border-black/5 flex flex-col">
            <div className="flex items-start justify-between mb-8">
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 group-hover:bg-black group-hover:text-white transition-all duration-500">
                <MapIcon className="h-8 w-8 stroke-[2]" />
              </div>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${route.isActive
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  : 'bg-gray-50 text-gray-400 border-gray-100'
                }`}>
                {route.isActive ? 'In Service' : 'Halted'}
              </span>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors uppercase">{route.name}</h3>
                <span className="px-2 py-1 bg-gray-900 text-white text-[10px] font-black rounded-lg">#{route.number}</span>
              </div>
              {route.university && (
                <div className="flex items-center gap-1.5 text-gray-400">
                  <BuildingLibraryIcon className="w-3.5 h-3.5" />
                  <p className="text-xs font-bold uppercase tracking-wider">{route.university.name}</p>
                </div>
              )}
            </div>

            {route.description && (
              <p className="text-sm text-gray-500 font-medium line-clamp-2 mb-8 italic leading-relaxed">
                "{route.description}"
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 mb-10 mt-auto">
              <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all group-hover:border-indigo-500/10">
                <div className="flex items-center gap-2 mb-1.5">
                  <IdentificationIcon className="w-3.5 h-3.5 text-gray-300" />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Protocol ID</p>
                </div>
                <p className="text-lg font-black text-gray-900 tracking-tighter">{route.busNumber || 'UNASSIGNED'}</p>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all group-hover:border-indigo-500/10">
                <div className="flex items-center gap-2 mb-1.5">
                  <UsersIcon className="w-3.5 h-3.5 text-gray-300" />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Personnel</p>
                </div>
                <p className="text-lg font-black text-gray-900 tracking-tighter">{route._count?.subscriptions || 0}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleEdit(route)}
                className="flex-1 flex items-center justify-center gap-2 py-4.5 rounded-2xl bg-black text-white text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-indigo-600 active:scale-95 transition-all outline-none"
              >
                <PencilIcon className="h-4 w-4 stroke-[3]" />
                RECONFIGURE
              </button>
              <button
                onClick={() => handleDelete(route.id)}
                className="w-16 flex items-center justify-center rounded-2xl bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-sm shadow-rose-500/5"
              >
                <TrashIcon className="h-5 w-5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <BusRouteModal
          route={selectedRoute}
          universities={universities}
          onClose={() => {
            setShowModal(false);
            setSelectedRoute(null);
          }}
          onSave={fetchRoutes}
        />
      )}
    </div>
  );
}

function BusRouteModal({
  route,
  universities,
  onClose,
  onSave,
}: {
  route: BusRoute | null;
  universities: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    name: route?.name || '',
    number: route?.number || '',
    busNumber: route?.busNumber || '',
    description: route?.description || '',
    universityId: route?.university?.id || '',
    isActive: route?.isActive ?? true,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (route) {
        await adminService.updateBusRoute(route.id, formData);
        toast.success('Route configuration synced');
      } else {
        await adminService.createBusRoute(formData);
        toast.success('Route deployment initialized');
      }
      onSave();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Data transmission failure');
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
                {route ? 'Route Parameters' : 'Deploy New Route'}
              </h2>
              <p className="text-gray-400 font-medium italic text-sm">Strategic transport infrastructure</p>
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
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Route Designation *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 font-black text-gray-900 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-gray-300"
                    placeholder="ALPHA-LINE"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Route Index *</label>
                  <input
                    type="text"
                    required
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 font-black text-gray-900 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-gray-300"
                    placeholder="R7-X"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Asset ID (Bus Number)</label>
                  <input
                    type="text"
                    value={formData.busNumber}
                    onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                    className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 font-bold text-gray-900 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-gray-300"
                    placeholder="BS-2201"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Regional Authority *</label>
                  <select
                    required
                    value={formData.universityId}
                    onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}
                    className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-[18px] font-bold text-gray-900 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select Campus</option>
                    {universities.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Route Intelligence</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 font-bold text-gray-700 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-gray-300"
                  rows={3}
                  placeholder="Primary stops and operational details..."
                />
              </div>

              <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-3xl flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-black text-emerald-900 uppercase text-xs tracking-widest">Service Permission</p>
                  <p className="text-[10px] font-bold text-emerald-600/60 leading-none">Enable/Disable route operational status</p>
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
                {submitting ? 'PROCESSING...' : route ? 'SYNC PARAMETERS' : 'INITIALIZE DEPLOYMENT'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

