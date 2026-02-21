'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import {
  BuildingStorefrontIcon,
  MapIcon,
  ChartBarIcon,
  TicketIcon,
  ChartPieIcon,
  ExclamationTriangleIcon,
  CogIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function VendorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    cafes: 0,
    busRoutes: 0,
    totalViews: 0,
    activeDeals: 0,
  });

  const userRoles = user?.roles?.map(r => r.name) || [];

  const statsConfig = [
    { key: 'cafes', name: 'My Establishments', icon: BuildingStorefrontIcon, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100', role: 'CAFE_OWNER' },
    { key: 'busRoutes', name: 'Active Fleet', icon: MapIcon, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', role: 'BUS_OPERATOR' },
    { key: 'activeDeals', name: 'Live Promotions', icon: TicketIcon, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100', role: 'CAFE_OWNER' },
    { key: 'totalViews', name: 'Market Reach', icon: ChartBarIcon, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
  ];

  const quickActions = [
    {
      name: 'Establishment Hub',
      href: '/vendor/cafes',
      icon: BuildingStorefrontIcon,
      description: 'Synchronize menus, activate deals, and manage node operations.',
      color: 'text-amber-600',
      bg: 'bg-amber-50/50',
      role: 'CAFE_OWNER'
    },
    {
      name: 'Transit Logistics',
      href: '/vendor/buses',
      icon: MapIcon,
      description: 'Calibrate schedules, track fleet movement, and update routes.',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50/50',
      role: 'BUS_OPERATOR'
    },
    {
      name: 'Revenue Intelligence',
      href: '/vendor/analytics',
      icon: ChartPieIcon,
      description: 'Analyze student engagement trends and business throughput.',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50/50'
    },
    {
      name: 'Crisis Protocol',
      href: '/vendor/emergencies',
      icon: ExclamationTriangleIcon,
      description: 'Report incidents and coordinate emergency transit alerts.',
      color: 'text-rose-600',
      bg: 'bg-rose-50/50',
      role: 'BUS_OPERATOR'
    },
    {
      name: 'Enterprise Settings',
      href: '/vendor/settings',
      icon: CogIcon,
      description: 'Manage brand identity and operational configurations.',
      color: 'text-slate-600',
      bg: 'bg-slate-50/50'
    }
  ];

  useEffect(() => {
    // Fetch vendor stats
    // TODO: Implement API call
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12 px-4 sm:px-0 font-sans animate-in fade-in duration-700">
      {/* Premium Welcome Header */}
      <div className="relative overflow-hidden rounded-[48px] bg-gradient-to-br from-[#1a1b3b] to-[#312e81] p-10 md:p-16 shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 -m-16 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -m-12 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[80px]"></div>

        <div className="relative z-10 space-y-8">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em] shadow-inner">
            <BuildingStorefrontIcon className="w-4 h-4" />
            Vendor Partnership Active
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-7xl font-black tracking-tight text-white leading-tight">
              Vendor <span className="text-indigo-300">Portal</span>
            </h1>
            <p className="text-xl text-indigo-100/60 font-medium leading-relaxed max-w-xl">
              Welcome back, {user?.firstName}. Orchestrating your business operations at {user?.university?.name}.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <button className="px-8 py-4 bg-white text-indigo-900 rounded-[22px] font-black shadow-xl shadow-indigo-950/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs uppercase tracking-widest">
              Live Overview
            </button>
            <button className="px-8 py-4 bg-indigo-600/30 text-white border border-indigo-400/20 rounded-[22px] font-black hover:bg-white/10 transition-all text-xs uppercase tracking-widest backdrop-blur-sm">
              Support Center
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsConfig.map((stat) => {
          if (stat.role && !userRoles.includes(stat.role)) return null;
          return (
            <div key={stat.key} className="group relative bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm transition-all hover:shadow-2xl hover:border-black/5 overflow-hidden">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-gray-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
              <div className={`relative z-10 inline-flex p-4 rounded-[24px] ${stat.bg} ${stat.color} mb-6 transition-transform group-hover:scale-110 shadow-sm border ${stat.border}`}>
                <stat.icon className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.name}</p>
                <h3 className="text-4xl font-black tracking-tighter text-gray-900">
                  {stats[stat.key as keyof typeof stats].toLocaleString()}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Command Actions */}
      <div className="space-y-8 pt-6">
        <div className="flex items-center justify-between px-6 border-l-4 border-indigo-600">
          <h3 className="text-2xl font-black tracking-tight text-gray-900 uppercase">
            Operational <span className="text-gray-400">Hub</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {quickActions.map((action) => {
            if (action.role && !userRoles.includes(action.role)) return null;
            return (
              <Link
                key={action.name}
                href={action.href}
                className="group flex flex-col gap-6 bg-white p-8 md:p-10 rounded-[48px] border border-gray-100 shadow-sm transition-all hover:shadow-2xl hover:border-black/5 hover:-translate-y-2 relative overflow-hidden"
              >
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gray-50 rounded-full -z-0 group-hover:scale-150 transition-transform duration-700"></div>

                <div className="relative z-10 flex items-center justify-between">
                  <div className={`p-6 rounded-[32px] ${action.bg} ${action.color} shadow-sm transition-all duration-500 group-hover:bg-indigo-600 group-hover:text-white`}>
                    <action.icon className="w-9 h-9 stroke-[1.5]" />
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                    <ArrowRightIcon className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>

                <div className="relative z-10 space-y-3">
                  <h3 className="text-2xl font-black text-gray-900 leading-none">
                    {action.name}
                  </h3>
                  <p className="text-sm text-gray-400 font-medium leading-relaxed">
                    {action.description}
                  </p>
                </div>

                <div className="relative z-10 pt-4 mt-auto">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 group-hover:text-indigo-900 transition-colors">
                    Access Infrastructure →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
