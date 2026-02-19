'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
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

const stats = [
  { name: 'Total Posts', value: '1,234', icon: UserGroupIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { name: 'Bus Routes', value: '5', icon: MapIcon, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { name: 'Cafés', value: '11', icon: BuildingStorefrontIcon, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { name: 'Resources', value: '89', icon: BookOpenIcon, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  { name: 'Events', value: '23', icon: CalendarIcon, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  { name: 'Notifications', value: '7', icon: BellIcon, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
];

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
      }
    }
  }, [user, router]);

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
        {stats.map((stat) => (
          <div key={stat.name} className="group relative overflow-hidden bg-card rounded-2xl border border-border/50 p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} ring-1 ring-inset ring-black/5`}>
                <stat.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  {stat.name}
                </dt>
                <dd className="text-2xl font-bold tracking-tight text-foreground">
                  {stat.value}
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

      {/* Recent Activity */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <h3 className="text-lg font-semibold text-foreground">
            Recent Activity
          </h3>
        </div>
        <div className="p-6">
          <div className="flow-root">
            <ul className="-mb-8">
              <li>
                <div className="relative pb-8">
                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border" aria-hidden="true" />
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center ring-4 ring-background">
                        <UserGroupIcon className="h-4 w-4 text-emerald-500" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-foreground">
                          You posted a new update in the social feed
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-muted-foreground">
                        <time dateTime="2024-01-15">2 hours ago</time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="relative pb-8">
                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border" aria-hidden="true" />
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center ring-4 ring-background">
                        <BookOpenIcon className="h-4 w-4 text-blue-500" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-foreground">
                          You uploaded a new study resource
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-muted-foreground">
                        <time dateTime="2024-01-14">1 day ago</time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="relative">
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center ring-4 ring-background">
                        <CalendarIcon className="h-4 w-4 text-amber-500" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-foreground">
                          You RSVP'd to "Programming Workshop" event
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-muted-foreground">
                        <time dateTime="2024-01-13">2 days ago</time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
