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
  { name: 'Create Post', href: '/dashboard/feed', icon: UserGroupIcon, description: 'Share something with your university community' },
  { name: 'Check Bus Schedule', href: '/dashboard/bus', icon: MapIcon, description: 'View bus routes and schedules' },
  { name: 'Find Café', href: '/dashboard/cafes', icon: BuildingStorefrontIcon, description: 'Discover campus cafés and menus' },
  { name: 'Upload Resource', href: '/dashboard/resources', icon: BookOpenIcon, description: 'Share study materials and notes' },
  { name: 'Calculate GPA', href: '/dashboard/gpa', icon: CalculatorIcon, description: 'Calculate your semester and cumulative GPA' },
  { name: 'Create Event', href: '/dashboard/events', icon: CalendarIcon, description: 'Organize university or student events' },
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
      const isStudent = !isSuperAdmin && !isVendor;

      // Redirect students away from dashboard page
      if (isStudent) {
        router.push('/dashboard/feed');
      } else {
        fetchStats();
      }
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
    {
      name: 'Total Posts',
      value: realStats?.totalPosts?.toLocaleString() || '0',
      icon: UserGroupIcon,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      name: 'Bus Routes',
      value: realStats?.totalBusRoutes?.toLocaleString() || '0',
      icon: MapIcon,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      name: 'Cafés',
      value: realStats?.totalCafes?.toLocaleString() || '0',
      icon: BuildingStorefrontIcon,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    },
    {
      name: 'Resources',
      value: realStats?.totalResources?.toLocaleString() || '0',
      icon: BookOpenIcon,
      color: 'text-violet-500',
      bg: 'bg-violet-500/10'
    },
    {
      name: 'Events',
      value: realStats?.totalEvents?.toLocaleString() || '0',
      icon: CalendarIcon,
      color: 'text-pink-500',
      bg: 'bg-pink-500/10'
    },
    {
      name: 'Notifications',
      value: realStats?.totalNotifications?.toLocaleString() || '0',
      icon: BellIcon,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10'
    },
  ];

  // If user is a student, don't render anything (will redirect)
  if (user) {
    const userRoles = user.roles?.map(r => r.name) || [];
    const isSuperAdmin = userRoles.includes('SUPER_ADMIN');
    const isCafeOwner = userRoles.includes('CAFE_OWNER');
    const isBusOperator = userRoles.includes('BUS_OPERATOR');
    const isVendor = isCafeOwner || isBusOperator;
    const isStudent = !isSuperAdmin && !isVendor;

    if (isStudent) {
      return null; // Will redirect
    }
  }

  return (
    <div className="space-y-8 p-6">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-primary/10 border border-primary/10 p-8">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Here's what's happening at {user?.university?.name} today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(loading ? Array(6).fill({}) : dashboardStats).map((stat, idx) => (
          <div key={stat.name || idx} className={`group relative overflow-hidden bg-card rounded-2xl border border-border/50 p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20 ${loading ? 'animate-pulse' : ''}`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg || 'bg-gray-100'} ${stat.color || 'text-gray-400'} ring-1 ring-inset ring-black/5`}>
                {stat.icon ? <stat.icon className="h-6 w-6" aria-hidden="true" /> : <div className="h-6 w-6" />}
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {stat.name || <div className="h-4 w-20 bg-gray-200 rounded" />}
                </dt>
                <dd className="text-2xl font-bold tracking-tight text-foreground">
                  {stat.value || <div className="h-8 w-12 bg-gray-200 rounded mt-1" />}
                </dd>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground px-1">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className="group relative flex flex-col gap-3 bg-card p-6 rounded-2xl border border-border/50 shadow-sm transition-all hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex p-3 rounded-xl bg-secondary text-primary ring-1 ring-inset ring-black/5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <action.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="text-muted-foreground/50 group-hover:text-primary/50 transition-colors">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                  {action.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <h3 className="text-lg font-semibold text-foreground">
            Recent Activity
          </h3>
        </div>
        <div className="p-12 text-center text-muted-foreground">
          <div className="inline-flex p-4 rounded-full bg-secondary mb-4">
            <BellIcon className="h-8 w-8 opacity-20" />
          </div>
          <p>No recent activity found on your account.</p>
        </div>
      </div>
    </div>
  );
}
