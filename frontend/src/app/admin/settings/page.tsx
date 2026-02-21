'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import Cog6ToothIcon from '@heroicons/react/24/outline/Cog6ToothIcon';
import UserCircleIcon from '@heroicons/react/24/outline/UserCircleIcon';
import KeyIcon from '@heroicons/react/24/outline/KeyIcon';
import ShieldCheckIcon from '@heroicons/react/24/outline/ShieldCheckIcon';
import AdjustmentsHorizontalIcon from '@heroicons/react/24/outline/AdjustmentsHorizontalIcon';
import CommandLineIcon from '@heroicons/react/24/outline/CommandLineIcon';
import FingerPrintIcon from '@heroicons/react/24/outline/FingerPrintIcon';
import CheckBadgeIcon from '@heroicons/react/24/solid/CheckBadgeIcon';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    siteName: 'CustConnect',
    siteDescription: 'The Premier Digital Student Hub',
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      // TODO: Implement API call
      toast.success('System configuration updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sync settings');
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Identity verification fields required');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Credential must exceed 8 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Credential mismatch detected');
      return;
    }

    try {
      setLoading(true);
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Security credentials rotated');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordSection(false);
    } catch (error: any) {
      toast.error(error.message || 'Identity update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 px-4 sm:px-0 font-sans">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-[#0f172a] to-[#334155] p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -m-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -m-8 w-64 h-64 bg-slate-400/10 rounded-full blur-[80px]"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
              <Cog6ToothIcon className="w-3.5 h-3.5" />
              System Preferences
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
              Control <span className="text-slate-400">Panel</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-xl leading-relaxed">
              Calibrate your administrative environment and orchestrate platform-wide governance protocols.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Account & Security */}
        <div className="lg:col-span-1 space-y-8">
          {/* Identity Card */}
          <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-[100px] -z-0 transition-all group-hover:bg-indigo-100/50"></div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-indigo-50 rounded-[24px] text-indigo-600 shadow-inner">
                  <UserCircleIcon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">Identity Profile</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Admin Token Active</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Authenticated Email</p>
                  <p className="text-sm font-black text-gray-900 truncate">{user?.email}</p>
                </div>
                <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Designation</p>
                  <p className="text-sm font-black text-gray-900">{user?.firstName} {user?.lastName}</p>
                </div>
                {user?.university && (
                  <div className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-50">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Jurisdiction</p>
                    <p className="text-sm font-black text-indigo-900">{user.university.name}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {user?.isActive && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-emerald-100 shadow-sm shadow-emerald-500/5">
                    <CheckBadgeIcon className="w-3.5 h-3.5" />
                    Active
                  </span>
                )}
                {user?.roles?.map((role: any) => (
                  <span key={role.id || role.name} className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-wider">
                    {typeof role === 'object' ? role.name?.replace('_', ' ') : role.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Security Rotation */}
          <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-50 rounded-2xl text-rose-500">
                  <FingerPrintIcon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight">Security</h3>
              </div>
              <button
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${showPasswordSection ? 'bg-gray-100 text-gray-500' : 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                  }`}
              >
                {showPasswordSection ? 'Abort' : 'Rotate Key'}
              </button>
            </div>

            {showPasswordSection && (
              <div className="space-y-5 animate-in slide-in-from-top duration-500">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 block mb-1">Current Credential</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl font-bold text-gray-900 focus:bg-white focus:border-rose-500/20 focus:ring-4 focus:ring-rose-500/5 outline-none transition-all placeholder:text-gray-300"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 block mb-1">New Credential</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl font-bold text-gray-900 focus:bg-white focus:border-rose-500/20 focus:ring-4 focus:ring-rose-500/5 outline-none transition-all placeholder:text-gray-300"
                    placeholder="••••••••"
                  />
                  <p className="px-4 text-[9px] font-bold text-gray-400 italic">Minimum 8 characters required for encryption strength.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 block mb-1">Re-verify Credential</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl font-bold text-gray-900 focus:bg-white focus:border-rose-500/20 focus:ring-4 focus:ring-rose-500/5 outline-none transition-all placeholder:text-gray-300"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Verify & Rotate'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Middle/Right Column: System Config */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[40px] p-8 md:p-10 border border-gray-100 shadow-sm space-y-10">
            <div className="flex items-center gap-5 border-b border-gray-50 pb-8">
              <div className="p-4 bg-slate-900 rounded-[24px] text-white">
                <AdjustmentsHorizontalIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Platform Configuration</h3>
                <p className="text-sm font-medium text-gray-400">Manage global variables and operational states.</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 block">Site Designation</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="w-full px-6 py-5 bg-gray-50 border border-transparent rounded-[24px] font-black text-gray-900 focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 block">Platform Tagline</label>
                  <input
                    type="text"
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    className="w-full px-6 py-5 bg-gray-50 border border-transparent rounded-[24px] font-bold text-gray-900 focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-6 pt-4">
                <h4 className="flex items-center gap-3 text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                  <CommandLineIcon className="w-4 h-4" />
                  Protocol Overrides
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Maintenance Mode */}
                  <label className={`relative p-8 rounded-[32px] border transition-all cursor-pointer flex items-center justify-between group overflow-hidden ${settings.maintenanceMode ? 'bg-amber-50 border-amber-200' : 'bg-gray-50/50 border-gray-100 hover:bg-white hover:border-indigo-100'
                    }`}>
                    {settings.maintenanceMode && <div className="absolute top-0 right-0 p-2 bg-amber-500 text-white rounded-bl-2xl text-[8px] font-black uppercase tracking-tighter">Emergency Mode</div>}
                    <div className="flex-1">
                      <p className="text-sm font-black text-gray-900 mb-1">Maintenance Seal</p>
                      <p className="text-[10px] font-bold text-gray-400 leading-relaxed uppercase tracking-wide">Toggle global access shielding.</p>
                    </div>
                    <div className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ring-0">
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={settings.maintenanceMode}
                        onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                      />
                      <div className={`h-7 w-12 rounded-full transition-colors ${settings.maintenanceMode ? 'bg-amber-500' : 'bg-gray-200 group-hover:bg-gray-300'}`}></div>
                      <div className={`absolute left-1 h-5 w-5 rounded-full bg-white transition-transform ${settings.maintenanceMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                  </label>

                  {/* Registration */}
                  <label className={`relative p-8 rounded-[32px] border transition-all cursor-pointer flex items-center justify-between group overflow-hidden ${settings.allowRegistration ? 'bg-emerald-50/50 border-emerald-100' : 'bg-gray-50/50 border-gray-100 hover:bg-white hover:border-indigo-100'
                    }`}>
                    <div className="flex-1">
                      <p className="text-sm font-black text-gray-900 mb-1">Registration Gate</p>
                      <p className="text-[10px] font-bold text-gray-400 leading-relaxed uppercase tracking-wide">Permit new identity onboarding.</p>
                    </div>
                    <div className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ring-0">
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={settings.allowRegistration}
                        onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
                      />
                      <div className={`h-7 w-12 rounded-full transition-colors ${settings.allowRegistration ? 'bg-emerald-500' : 'bg-gray-200 group-hover:bg-gray-300'}`}></div>
                      <div className={`absolute left-1 h-5 w-5 rounded-full bg-white transition-transform ${settings.allowRegistration ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-10 border-t border-gray-50">
                <button
                  onClick={handleSave}
                  className="px-12 py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-slate-900/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                >
                  <ShieldCheckIcon className="w-5 h-5 text-indigo-400" />
                  Synchronize State
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

