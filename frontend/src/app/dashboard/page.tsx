'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { adminService } from '@/services/adminService';
import {
  UserGroupIcon,
  BuildingStorefrontIcon,
  BookOpenIcon,
  CalculatorIcon,
  CalendarIcon,
  BellIcon,
  MapIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const quickActions = [
  { name: 'Campus Feed', href: '/dashboard/feed', icon: UserGroupIcon, description: 'Connect with your university community.', color: 'text-blue-500', bg: 'bg-blue-50' },
  { name: 'Bus Tracking', href: '/dashboard/bus', icon: MapIcon, description: 'Live transit updates and schedules.', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { name: 'Gastro Hub', href: '/dashboard/cafes', icon: BuildingStorefrontIcon, description: 'Explore menus and claim student deals.', color: 'text-amber-500', bg: 'bg-amber-50' },
  { name: 'Resource Lab', href: '/dashboard/resources', icon: BookOpenIcon, description: 'Access academic materials and notes.', color: 'text-violet-500', bg: 'bg-violet-50' },
  { name: 'GPA Master', href: '/dashboard/gpa', icon: CalculatorIcon, description: 'Calibrate your academic performance.', color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { name: 'Campus Events', href: '/dashboard/events', icon: CalendarIcon, description: 'Discover what is happening on campus.', color: 'text-pink-500', bg: 'bg-pink-50' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [realStats, setRealStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const userRoles = user.roles?.map(r => r.name) || [];
      const isSuperAdmin = userRoles.includes('SUPER_ADMIN');

      const isCafeOwner = userRoles.includes('CAFE_OWNER');
      const isBusOperator = userRoles.includes('BUS_OPERATOR');
      const isVendor = isCafeOwner || isBusOperator;

      // Only fetch admin stats for super admins
      if (isSuperAdmin) {
        router.push('/admin');
        return;
      }

      // For students and vendors, we don't fetch admin analytics to avoid 403
      // We could fetch public stats here if we had a non-admin route for them
      setLoading(false);
    }
  }, [user, router]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAnalytics();
      setRealStats(data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = [
    { name: 'Global Feed', value: realStats?.totalPosts || 0, icon: UserGroupIcon, color: 'text-blue-500', bg: 'bg-blue-50' },
    { name: 'Bus Lines', value: realStats?.totalBusRoutes || 0, icon: MapIcon, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { name: 'Campus Dining', value: realStats?.totalCafes || 0, icon: BuildingStorefrontIcon, color: 'text-amber-500', bg: 'bg-amber-50' },
    { name: 'Academic Docs', value: realStats?.totalResources || 0, icon: BookOpenIcon, color: 'text-violet-500', bg: 'bg-violet-50' },
  ];

  if (loading && !realStats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-black animate-pulse text-[10px] uppercase tracking-[0.2em]">Synchronizing Campus Pulse...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12 px-4 font-sans animate-in fade-in duration-700">
      {/* Premium Welcome Header */}
      <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-8 md:p-12 shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 -m-12 w-80 h-80 bg-primary/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -m-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary-foreground/60 text-[10px] font-black uppercase tracking-[0.2em]">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Campus Pulse Active
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
              Welcome back, <span className="text-primary">{user?.firstName}</span>! 👋
            </h1>
            <p className="text-lg text-slate-400 font-medium">
              Everything happening at <span className="text-white font-bold">{user?.university?.name}</span> today.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map((stat) => (
          <div key={stat.name} className="group bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:border-black/5">
            <div className={`p-4 rounded-[20px] ${stat.bg} ${stat.color} mb-4 transition-transform group-hover:scale-110 shadow-sm inline-block`}>
              <stat.icon className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{stat.name}</p>
              <h3 className="text-2xl font-black tracking-tighter text-gray-900 group-hover:text-primary transition-colors">
                {stat.value.toLocaleString()}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4 border-l-4 border-primary">
          <h3 className="text-xl font-black tracking-tight text-gray-900 uppercase">
            Quick <span className="text-gray-400">Actions</span>
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className="group flex items-center gap-6 bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:border-black/5 hover:-translate-y-1"
            >
              <div className={`p-5 rounded-[24px] ${action.bg} ${action.color} group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm`}>
                <action.icon className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-black text-gray-900 group-hover:text-primary transition-colors leading-none mb-1">{action.name}</h4>
                <p className="text-xs text-gray-400 font-medium">{action.description}</p>
              </div>
              <div className="p-3 text-gray-200 group-hover:text-primary transition-all group-hover:translate-x-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Activity Section */}
      <div className="relative group bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden p-12 text-center transition-all hover:shadow-xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
        <div className="inline-flex p-6 rounded-[32px] bg-secondary/30 mb-6 group-hover:scale-110 transition-transform">
          <BellIcon className="h-10 w-10 text-gray-300 group-hover:text-primary transition-colors" />
        </div>
        <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">No Recent Alerts</h4>
        <p className="text-gray-400 font-medium max-w-xs mx-auto text-sm leading-relaxed">Your campus timeline is currently peaceful. New notifications will arrive here.</p>
      </div>
    </div>
  );
}
