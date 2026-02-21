'use client';

import { useState, useEffect } from 'react';
import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';
import MapIcon from '@heroicons/react/24/outline/MapIcon';
import CheckIcon from '@heroicons/react/24/outline/CheckIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import ShieldCheckIcon from '@heroicons/react/24/outline/ShieldCheckIcon';
import AcademicCapIcon from '@heroicons/react/24/outline/AcademicCapIcon';
import ArrowPathIcon from '@heroicons/react/24/outline/ArrowPathIcon';
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
      setLoading(true);
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
      toast.success('Vendor access granted');
      fetchVendors();
    } catch (error: any) {
      toast.error(error.message || 'Approval failed');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Syncing business directory...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 px-4 sm:px-0">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#1a1b3b] to-indigo-900 p-8 shadow-2xl transition-all duration-700">
        <div className="absolute top-0 right-0 -m-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -m-12 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white line-clamp-1">
              Business <span className="text-indigo-400">Registry</span>
            </h1>
            <p className="text-indigo-100/60 font-medium max-w-xl leading-relaxed">
              Verify vendor credentials, manage operational authorization, and monitor service distributions.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={fetchVendors}
              className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 transition-all"
            >
              <ArrowPathIcon className="h-6 w-6 text-indigo-300" />
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-3 px-8 py-5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-[24px] font-black shadow-xl shadow-indigo-500/20 transition-all active:scale-95 whitespace-nowrap"
            >
              <PlusIcon className="h-6 w-6" />
              Onboard Partner
            </button>
          </div>
        </div>
      </div>

      {vendors.length === 0 ? (
        <div className="py-32 bg-white rounded-[40px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center space-y-6">
          <div className="p-8 bg-indigo-50 rounded-full animate-bounce">
            <BuildingStorefrontIcon className="h-16 w-16 text-indigo-200" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Ecosystem is Empty</h3>
            <p className="text-gray-400 font-medium max-w-xs mx-auto">Start by onboarding your first commercial partner or service provider.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vendors.map((vendor) => {
            const isCafeOwner = vendor.roles.some(r => r.name === 'CAFE_OWNER');
            const isBusOperator = vendor.roles.some(r => r.name === 'BUS_OPERATOR');

            return (
              <div
                key={vendor.id}
                className="group relative bg-white rounded-[32px] p-6 md:p-8 border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-2xl hover:border-indigo-500/10 overflow-hidden"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                      <BuildingStorefrontIcon className="w-8 h-8 stroke-[2.5]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                        {vendor.firstName} {vendor.lastName}
                      </h3>
                      <p className="text-xs text-gray-400 font-black uppercase tracking-widest">{vendor.email}</p>
                    </div>
                  </div>
                  <span
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border border-transparent ${vendor.isActive
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                      }`}
                  >
                    {vendor.isActive ? 'OPERATIONAL' : 'VERIFICATION PENDING'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  {vendor.roles.map((role) => (
                    <span
                      key={role.name}
                      className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-gray-50 text-gray-500 border border-gray-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors"
                    >
                      {role.name.replace('_', ' ')}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {isCafeOwner && vendor.cafes && vendor.cafes.length > 0 && (
                    <div className="p-5 bg-[#fff8eb] rounded-2xl border border-[#fee9c3]">
                      <div className="flex items-center gap-2 mb-3">
                        <BuildingStorefrontIcon className="h-4 w-4 text-[#b45309]" />
                        <p className="text-[10px] font-black text-[#b45309] uppercase tracking-widest">Portfolio: Cafés</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {vendor.cafes.map((cafe) => (
                          <span key={cafe.id} className="px-3 py-1 bg-white rounded-lg text-xs font-black text-[#92400e] border border-[#fde68a] shadow-sm">
                            {cafe.name.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {isBusOperator && vendor.busRoutes && vendor.busRoutes.length > 0 && (
                    <div className="p-5 bg-[#f0fdf4] rounded-2xl border border-[#bbf7d0]">
                      <div className="flex items-center gap-2 mb-3">
                        <MapIcon className="h-4 w-4 text-[#15803d]" />
                        <p className="text-[10px] font-black text-[#15803d] uppercase tracking-widest">Operations: Routes</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {vendor.busRoutes.map((route) => (
                          <span key={route.id} className="px-3 py-1 bg-white rounded-lg text-xs font-black text-[#166534] border border-[#86efac] shadow-sm">
                            {route.name.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {!vendor.isActive && (
                  <div className="mt-8 pt-8 border-t border-gray-50">
                    <button
                      onClick={() => handleApproveVendor(vendor.id)}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-indigo-600 text-white font-black shadow-xl shadow-indigo-600/20 hover:bg-black transition-all active:scale-[0.98]"
                    >
                      <ShieldCheckIcon className="h-6 w-6 stroke-[2.5]" />
                      AUTHORIZE ACCESS
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <CreateVendorModal
          roles={roles}
          onClose={() => setShowModal(false)}
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
      const user = await adminService.createUser({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        universityId: formData.universityId || undefined,
        isActive: true,
        isVerified: true,
      });

      if (formData.roleId) {
        await adminService.assignRole(user.id, formData.roleId);
      }

      toast.success('Strategy partner onboarded');
      onSave();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Onboarding failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="fixed inset-0 bg-[#1a1b3b]/80 backdrop-blur-md" onClick={onClose} />
        <div className="relative bg-white rounded-[40px] shadow-2xl max-w-2xl w-full p-8 md:p-10 border border-white/20 overflow-hidden text-gray-900">
          <div className="absolute top-0 right-0 -m-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 space-y-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Onboard Strategic Partner</h2>
              <p className="text-gray-400 font-medium italic mt-1 text-sm">Automated ecosystem integration</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Authorized Agent Name</label>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      required
                      placeholder="First"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:ring-4 focus:ring-indigo-500/10 outline-none"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Last"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:ring-4 focus:ring-indigo-500/10 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Corporate Intelligence</label>
                  <input
                    type="email"
                    required
                    placeholder="partner@corporate.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-900 focus:ring-4 focus:ring-indigo-500/10 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Secure Access Key</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 8 chars"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-indigo-600 focus:ring-4 focus:ring-indigo-500/10 outline-none"
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Partner Tier</label>
                  <select
                    required
                    value={formData.roleId}
                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-indigo-500/10 outline-none appearance-none cursor-pointer"
                  >
                    <option value="">SELECT SEGMENT...</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name === 'PRINTER_SHOP_OWNER' ? 'PRINTSHOP OWNER' : role.name.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Organizational Jurisdiction</label>
                  <select
                    value={formData.universityId}
                    onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-indigo-500/10 outline-none appearance-none cursor-pointer"
                  >
                    <option value="">GLOBAL JURISDICTION (NO ORG)</option>
                    {universities.map((u) => (
                      <option key={u.id} value={u.id}>{u.name.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-5 bg-gray-50 text-gray-400 rounded-[24px] font-black hover:bg-gray-100 hover:text-gray-900 transition-all active:scale-[0.98]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-5 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-[24px] font-black shadow-2xl shadow-indigo-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? 'SYNCHRONIZING...' : 'ESTABLISH PARTNERSHIP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

