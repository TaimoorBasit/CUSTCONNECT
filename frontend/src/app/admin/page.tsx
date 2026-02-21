'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { adminService } from '@/services/adminService';
import {
  UserGroupIcon,
  BuildingStorefrontIcon,
  MapIcon,
  ChartBarIcon,
  DocumentTextIcon,
  BellIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  BookOpenIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  QueueListIcon,
  CheckBadgeIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalCafes: 0,
    totalBusRoutes: 0,
    totalPosts: 0,
    totalEvents: 0,
    totalResources: 0,
    totalNotifications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const analytics = await adminService.getAnalytics();
      setStats({
        totalUsers: analytics.totalUsers || 0,
        totalVendors: analytics.totalVendors || 0,
        totalCafes: analytics.totalCafes || 0,
        totalBusRoutes: analytics.totalBusRoutes || 0,
        totalPosts: analytics.totalPosts || 0,
        totalEvents: analytics.totalEvents || 0,
        totalResources: analytics.totalResources || 0,
        totalNotifications: analytics.totalNotifications || 0,
      });
    } catch (error) {
      console.error('Failed to load stats', error);
    } finally {
      setLoading(false);
    }
  };

  const adminStats = [
    { name: 'Active Users', value: stats.totalUsers, icon: UserGroupIcon, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { name: 'Portal Vendors', value: stats.totalVendors, icon: CheckBadgeIcon, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    { name: 'Live Cafés', value: stats.totalCafes, icon: BuildingStorefrontIcon, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    { name: 'Active Routes', value: stats.totalBusRoutes, icon: MapIcon, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  ];

  const secondaryStats = [
    { name: 'Feed Pulse', value: stats.totalPosts, icon: RocketLaunchIcon, color: 'text-indigo-600', href: '/admin/posts' },
    { name: 'Events Booked', value: stats.totalEvents, icon: CalendarIcon, color: 'text-pink-600', href: '/admin/events' },
    { name: 'Resourcelab', value: stats.totalResources, icon: BookOpenIcon, color: 'text-violet-600', href: '/admin/resources' },
    { name: 'Alerts Sent', value: stats.totalNotifications, icon: BellIcon, color: 'text-orange-600', href: '/admin/notifications' },
  ];

  const quickActions = [
    {
      name: 'Identity Labs',
      href: '/admin/users',
      icon: UserGroupIcon,
      description: 'Orchestrate user identities, verify credentials, and calibrate access permissions.',
      color: 'text-blue-600',
      bg: 'bg-blue-50/50'
    },
    {
      name: 'Business Registry',
      href: '/admin/vendors',
      icon: CheckBadgeIcon,
      description: 'Approve commercial entities and manage institutional vendor partnerships.',
      color: 'text-purple-600',
      bg: 'bg-purple-50/50'
    },
    {
      name: 'Platform Analytics',
      href: '/admin/analytics',
      icon: ChartBarIcon,
      description: 'Deep-dive into student engagement metrics and operational throughput.',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50/50'
    },
    {
      name: 'Governance Logs',
      href: '/admin/audit',
      icon: QueueListIcon,
      description: 'Review the immutable record of administrative actions and system events.',
      color: 'text-black',
      bg: 'bg-gray-50/50'
    },
    {
      name: 'Emergency Center',
      href: '/admin/emergencies',
      icon: ExclamationTriangleIcon,
      description: 'Monitor high-priority incidents and coordinate institutional response protocols.',
      color: 'text-rose-600',
      bg: 'bg-rose-50/50'
    },
    {
      name: 'Control Hub',
      href: '/admin/settings',
      icon: ComputerDesktopIcon,
      description: 'Calibrate platform parameters and manage global system configurations.',
      color: 'text-slate-600',
      bg: 'bg-slate-50/50'
    }
  ];

  const operationalHub = [
    { name: 'Café Network', href: '/admin/cafes', icon: BuildingStorefrontIcon, count: stats.totalCafes, color: 'text-amber-500', label: 'Nodes' },
    { name: 'Transit Routes', href: '/admin/buses', icon: MapIcon, count: stats.totalBusRoutes, color: 'text-emerald-500', label: 'Lines' },
    { name: 'Printer Network', href: '/admin/printer-shops', icon: RocketLaunchIcon, count: stats.totalResources, color: 'text-blue-500', label: 'Hubs' },
    { name: 'Campus Hub', href: '/admin/events', icon: CalendarIcon, count: stats.totalEvents, color: 'text-pink-500', label: 'Live' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-black animate-pulse text-[10px] uppercase tracking-[0.2em]">Synchronizing Control Center...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12 px-4 sm:px-0 font-sans animate-in fade-in duration-700">
      {/* Premium Welcome Header */}
      <div className="relative overflow-hidden rounded-[48px] bg-gradient-to-br from-[#0f172a] to-[#334155] p-10 md:p-16 shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 -m-16 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 -m-12 w-80 h-80 bg-slate-400/10 rounded-full blur-[100px]"></div>

        <div className="relative z-10 max-w-3xl space-y-8">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] shadow-inner">
            <ShieldCheckIcon className="w-4 h-4 text-indigo-400" />
            L5 Authorization Active
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-7xl font-black tracking-tight text-white leading-tight">
              Control <span className="text-slate-400">Center</span>
            </h1>
            <p className="text-xl text-slate-400 font-medium leading-relaxed">
              Welcome back, Administrator. Centralized governance for the CustConnect ecosystem.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <div className="px-6 py-3 bg-white/5 rounded-[20px] border border-white/5 backdrop-blur-sm">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Status</p>
              <p className="text-sm font-black text-white uppercase tracking-tighter flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Nominal
              </p>
            </div>
            <div className="px-6 py-3 bg-white/5 rounded-[20px] border border-white/5 backdrop-blur-sm">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Identity</p>
              <p className="text-sm font-black text-white uppercase tracking-tighter">{user?.firstName} {user?.lastName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Hub */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-6 border-l-4 border-indigo-500">
          <h3 className="text-xl font-black tracking-tight text-gray-900 uppercase">
            Operational <span className="text-gray-400">Hub</span>
          </h3>
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 italic">High Priority Management</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {operationalHub.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm transition-all hover:shadow-2xl hover:border-black/5 flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className={`p-5 rounded-[24px] bg-gray-50 ${item.color} mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                <item.icon className="w-10 h-10 stroke-[1.5]" />
              </div>
              <h4 className="text-xl font-black text-gray-900 mb-1">{item.name}</h4>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.count} {item.label} ACTIVE</p>

              <div className="mt-8 px-6 py-2 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-lg shadow-black/20">
                Manage Node
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminStats.map((stat) => (
          <div key={stat.name} className="group relative bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm transition-all hover:shadow-2xl hover:border-black/5">
            <div className={`inline-flex p-4 rounded-[24px] ${stat.bg} ${stat.color} mb-6 transition-transform group-hover:scale-110 shadow-sm border ${stat.border}`}>
              <stat.icon className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.name}</p>
              <h3 className="text-4xl font-black tracking-tighter text-gray-900 group-hover:text-indigo-600 transition-colors">
                {stat.value.toLocaleString()}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Pulse */}
      <div className="bg-gray-50/50 rounded-[40px] p-10 border border-gray-100/50">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {secondaryStats.map((stat) => (
            <Link key={stat.name} href={stat.href} className="flex items-center gap-5 group">
              <div className={`p-4 rounded-2xl bg-white shadow-sm ${stat.color} transition-all group-hover:scale-110 group-hover:rotate-12`}>
                <stat.icon className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{stat.name}</p>
                <p className="text-xl font-black text-gray-900 tracking-tighter italic group-hover:text-indigo-600 transition-colors">{stat.value.toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Governance Modules */}
      <div className="space-y-8 pt-6">
        <div className="flex items-center justify-between px-6 border-l-4 border-black">
          <h3 className="text-xl font-black tracking-tight text-gray-900 uppercase">
            Governance <span className="text-gray-400">Modules</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className="group flex flex-col gap-6 bg-white p-8 md:p-10 rounded-[48px] border border-gray-100 shadow-sm transition-all hover:shadow-2xl hover:border-black/5 hover:-translate-y-2 relative overflow-hidden"
            >
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gray-50 rounded-full -z-0 group-hover:scale-150 transition-transform duration-700"></div>

              <div className="relative z-10 flex items-center justify-between">
                <div className={`p-6 rounded-[32px] ${action.bg} ${action.color} shadow-sm transition-all duration-500 group-hover:bg-slate-900 group-hover:text-white`}>
                  <action.icon className="w-9 h-9 stroke-[1.5]" />
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                  <ArrowRightIcon className="w-6 h-6 text-slate-900" />
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
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 group-hover:text-slate-900 transition-colors">
                  Initialize Module
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

