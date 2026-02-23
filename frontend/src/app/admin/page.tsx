'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { adminService } from '@/services/adminService';
import {
  UserGroupIcon,
  BuildingStorefrontIcon,
  MapIcon,
  ChartBarIcon,
  BellIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  BookOpenIcon,
  ArrowRightIcon,
  CheckBadgeIcon,
  PrinterIcon,
  DocumentMagnifyingGlassIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const quickActions = [
  { name: 'User Management', href: '/admin/users', icon: UserGroupIcon, description: 'Manage users, roles, and permissions', color: '#1a2744', bgLight: '#F0F3FA' },
  { name: 'Vendor Registry', href: '/admin/vendors', icon: CheckBadgeIcon, description: 'Approve and manage institutional vendors', color: '#A51C30', bgLight: '#FFF5F5' },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon, description: 'Platform growth and engagement metrics', color: '#059669', bgLight: '#ECFDF5' },
  { name: 'Audit Logs', href: '/admin/audit', icon: DocumentMagnifyingGlassIcon, description: 'Immutable record of admin actions', color: '#374151', bgLight: '#F9FAFB' },
  { name: 'Emergencies', href: '/admin/emergencies', icon: ExclamationTriangleIcon, description: 'Monitor and respond to critical incidents', color: '#DC2626', bgLight: '#FEF2F2' },
  { name: 'System Settings', href: '/admin/settings', icon: Cog6ToothIcon, description: 'Platform configuration and parameters', color: '#7C3AED', bgLight: '#F5F3FF' },
];

const operationalLinks = [
  { name: 'Campus Cafes', href: '/admin/cafes', icon: BuildingStorefrontIcon, color: '#D97706', bgLight: '#FFFBEB' },
  { name: 'Bus Routes', href: '/admin/buses', icon: MapIcon, color: '#059669', bgLight: '#ECFDF5' },
  { name: 'Print Shops', href: '/admin/printer-shops', icon: PrinterIcon, color: '#7C3AED', bgLight: '#F5F3FF' },
  { name: 'Events', href: '/admin/events', icon: CalendarIcon, color: '#A51C30', bgLight: '#FFF5F5' },
  { name: 'Resources', href: '/admin/resources', icon: BookOpenIcon, color: '#1a2744', bgLight: '#F0F3FA' },
  { name: 'Posts', href: '/admin/posts', icon: ChatBubbleLeftRightIcon, color: '#0369A1', bgLight: '#F0F9FF' },
  { name: 'Lost & Found', href: '/admin/lost-found', icon: MagnifyingGlassIcon, color: '#D97706', bgLight: '#FFFBEB' },
  { name: 'Notifications', href: '/admin/notifications', icon: BellIcon, color: '#059669', bgLight: '#ECFDF5' },
  { name: 'Messages', href: '/admin/messages', icon: ChatBubbleLeftRightIcon, color: '#1a2744', bgLight: '#F0F3FA' },
  { name: 'Grading', href: '/admin/grading', icon: BookOpenIcon, color: '#A51C30', bgLight: '#FFF5F5' },
];

function getDayInfo() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0, totalVendors: 0, totalCafes: 0,
    totalBusRoutes: 0, totalPosts: 0, totalEvents: 0,
    totalResources: 0, totalNotifications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
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

  const statCards = [
    { name: 'Total Users', value: stats.totalUsers, icon: UserGroupIcon, color: '#1a2744', bgLight: '#F0F3FA', href: '/admin/users' },
    { name: 'Vendors', value: stats.totalVendors, icon: CheckBadgeIcon, color: '#A51C30', bgLight: '#FFF5F5', href: '/admin/vendors' },
    { name: 'Campus Cafes', value: stats.totalCafes, icon: BuildingStorefrontIcon, color: '#D97706', bgLight: '#FFFBEB', href: '/admin/cafes' },
    { name: 'Bus Routes', value: stats.totalBusRoutes, icon: MapIcon, color: '#059669', bgLight: '#ECFDF5', href: '/admin/buses' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F4]">

      {/* ── HERO BANNER ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-[#1a2744] px-6 pt-10 pb-14 md:px-12 md:pt-14 md:pb-20">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: `repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 24px)` }}
        />
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#A51C30]" />

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/50 text-xs font-semibold tracking-wide mb-6">
            <ClockIcon className="w-3.5 h-3.5" />
            {mounted ? getDayInfo() : ''}
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-white/50 text-sm font-medium mb-1">Welcome back,</p>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                {user?.firstName} {user?.lastName}
              </h1>
              <div className="flex items-center gap-2 mt-3 text-white/40 text-sm font-medium">
                <MapPinIcon className="w-4 h-4" />
                Admin Control Centre
                <span className="ml-2 flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse inline-block" />
                  All Systems Operational
                </span>
              </div>
            </div>
            <Link href="/admin/analytics" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#A51C30] text-white text-sm font-semibold hover:bg-[#8b1526] transition-colors shadow-lg shadow-[#A51C30]/30">
              <ChartBarIcon className="w-4 h-4" />
              View Analytics
            </Link>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS (pulled up over banner) ──────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statCards.map((s) => (
            <Link key={s.name} href={s.href} className="group bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border border-white/80 flex flex-col gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: s.bgLight, color: s.color }}>
                <s.icon className="w-6 h-6" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium leading-none">{s.name}</p>
                <p className="text-2xl font-bold mt-1 tracking-tight" style={{ color: s.color }}>
                  {loading ? '—' : s.value.toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 mt-10 space-y-10 pb-16">

        {/* Primary admin actions */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-[#1a2744] tracking-tight">Administration</h2>
              <p className="text-sm text-gray-400 mt-0.5">Core management modules</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickActions.map((a) => (
              <Link key={a.name} href={a.href} className="group flex items-start gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all hover:-translate-y-0.5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110" style={{ background: a.bgLight, color: a.color }}>
                  <a.icon className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-none">{a.name}</p>
                  <p className="text-[11px] text-gray-400 mt-1 leading-snug">{a.description}</p>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-gray-300 group-hover:text-[#A51C30] group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
              </Link>
            ))}
          </div>
        </section>

        {/* Operational links */}
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-[#1a2744] tracking-tight">Operations</h2>
            <p className="text-sm text-gray-400 mt-0.5">Campus services and content management</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {operationalLinks.map((a) => (
              <Link key={a.name} href={a.href} className="group flex flex-col items-center gap-2.5 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all hover:-translate-y-0.5 text-center">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110" style={{ background: a.bgLight, color: a.color }}>
                  <a.icon className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <p className="text-xs font-semibold text-gray-700 leading-tight">{a.name}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Secondary stats strip */}
        <section>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="text-sm font-bold text-gray-900">Platform Overview</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
              {[
                { name: 'Total Posts', value: stats.totalPosts, icon: ChatBubbleLeftRightIcon, color: '#1a2744' },
                { name: 'Campus Events', value: stats.totalEvents, icon: CalendarIcon, color: '#A51C30' },
                { name: 'Resources', value: stats.totalResources, icon: BookOpenIcon, color: '#059669' },
                { name: 'Notifications Sent', value: stats.totalNotifications, icon: BellIcon, color: '#D97706' },
              ].map((s) => (
                <div key={s.name} className="px-6 py-5 flex items-center gap-3">
                  <s.icon className="w-5 h-5 flex-shrink-0" style={{ color: s.color }} strokeWidth={1.8} />
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{s.name}</p>
                    <p className="text-xl font-bold text-gray-900 tracking-tight">{loading ? '—' : s.value.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
