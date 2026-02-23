'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  UserGroupIcon,
  BuildingStorefrontIcon,
  BookOpenIcon,
  CalculatorIcon,
  CalendarIcon,
  MapIcon,
  PrinterIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ArrowRightIcon,
  AcademicCapIcon,
  ClockIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

const services = [
  {
    name: 'Campus Feed',
    href: '/dashboard/feed',
    icon: UserGroupIcon,
    description: 'Connect with your university community',
    color: '#A51C30',      // Harvard crimson
    bgLight: '#FFF5F5',
  },
  {
    name: 'Bus Tracking',
    href: '/dashboard/bus',
    icon: MapIcon,
    description: 'Live transit updates and schedules',
    color: '#1a2744',      // Oxford navy
    bgLight: '#F0F3FA',
  },
  {
    name: 'Campus Cafes',
    href: '/dashboard/cafes',
    icon: BuildingStorefrontIcon,
    description: 'Explore menus and student deals',
    color: '#D97706',      // Amber
    bgLight: '#FFFBEB',
  },
  {
    name: 'Resource Bank',
    href: '/dashboard/resources',
    icon: BookOpenIcon,
    description: 'Academic materials and notes',
    color: '#1a2744',
    bgLight: '#F0F3FA',
  },
  {
    name: 'GPA Calculator',
    href: '/dashboard/gpa',
    icon: AcademicCapIcon,
    description: 'Track your academic performance',
    color: '#A51C30',
    bgLight: '#FFF5F5',
  },
  {
    name: 'Campus Events',
    href: '/dashboard/events',
    icon: CalendarIcon,
    description: 'Discover what\'s happening on campus',
    color: '#059669',      // Emerald
    bgLight: '#ECFDF5',
  },
  {
    name: 'Print Centre',
    href: '/dashboard/print',
    icon: PrinterIcon,
    description: 'Submit and manage print requests',
    color: '#7C3AED',      // Violet
    bgLight: '#F5F3FF',
  },
  {
    name: 'Lost & Found',
    href: '/dashboard/lost-found',
    icon: MagnifyingGlassIcon,
    description: 'Report or find lost items on campus',
    color: '#0369A1',      // Sky blue
    bgLight: '#F0F9FF',
  },
  {
    name: 'Direct Messages',
    href: '/dashboard/messages',
    icon: ChatBubbleLeftRightIcon,
    description: 'Chat with peers and faculty',
    color: '#A51C30',
    bgLight: '#FFF5F5',
  },
  {
    name: 'Social Hub',
    href: '/dashboard/connections',
    icon: UserGroupIcon,
    description: 'Expand your campus network',
    color: '#1a2744',
    bgLight: '#F0F3FA',
  },
  {
    name: 'Tools & Docs',
    href: '/dashboard/tools',
    icon: DocumentTextIcon,
    description: 'Useful academic tools and documents',
    color: '#D97706',
    bgLight: '#FFFBEB',
  },
  {
    name: 'Notifications',
    href: '/dashboard/notifications',
    icon: BellIcon,
    description: 'Stay updated with campus alerts',
    color: '#059669',
    bgLight: '#ECFDF5',
  },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getDayInfo() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) {
      const roles = user.roles?.map((r) => r.name) || [];
      if (roles.includes('SUPER_ADMIN')) router.push('/admin');
    }
  }, [user, router]);

  // highlighted tiles (first 4 shown as featured)
  const featured = services.slice(0, 4);
  const rest = services.slice(4);

  return (
    <div className="min-h-screen bg-[#F8F7F4] pb-20">

      {/* ── TOP HERO BANNER ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-[#1a2744] px-6 pt-10 pb-14 md:px-12 md:pt-14 md:pb-20">
        {/* decorative pattern */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              #fff 0px,
              #fff 1px,
              transparent 1px,
              transparent 24px
            )`,
          }}
        />
        {/* crimson accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#A51C30]" />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* date pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/50 text-xs font-semibold tracking-wide mb-6">
            <ClockIcon className="w-3.5 h-3.5" />
            {mounted ? getDayInfo() : ''}
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-white/50 text-sm font-medium mb-1">
                {getGreeting()},
              </p>
              <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                {user?.firstName} {user?.lastName}
              </h1>
              {user?.university?.name && (
                <div className="flex items-center gap-2 mt-3 text-white/40 text-sm font-medium">
                  <MapPinIcon className="w-4 h-4" />
                  {user.university.name}
                  {user.university.city && ` · ${user.university.city}`}
                </div>
              )}
            </div>

            <Link
              href="/dashboard/settings"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#A51C30] text-white text-sm font-semibold hover:bg-[#8b1526] transition-colors shadow-lg shadow-[#A51C30]/30"
            >
              <Cog6ToothIcon className="w-4 h-4" />
              My Profile
            </Link>
          </div>
        </div>
      </div>

      {/* ── FEATURE STRIP (4 key services pulled up over banner) ──────── */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {featured.map((s) => (
            <Link
              key={s.name}
              href={s.href}
              className="group bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border border-white/80 flex flex-col gap-3"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: s.bgLight, color: s.color }}
              >
                <s.icon className="w-6 h-6" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 leading-tight">{s.name}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-snug line-clamp-2">{s.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 mt-10 space-y-10">

        {/* Section: All Campus Services */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-[#1a2744] tracking-tight">All Services</h2>
              <p className="text-sm text-gray-400 mt-0.5">Everything available on your CustConnect portal</p>
            </div>
            <span className="text-xs font-semibold text-[#A51C30] bg-[#FFF5F5] px-3 py-1 rounded-full border border-[#A51C30]/10">
              {services.length} available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {rest.map((s) => (
              <Link
                key={s.name}
                href={s.href}
                className="group flex items-center gap-4 bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all hover:-translate-y-0.5"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                  style={{ background: s.bgLight, color: s.color }}
                >
                  <s.icon className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-none">{s.name}</p>
                  <p className="text-[11px] text-gray-400 mt-1 leading-snug truncate">{s.description}</p>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-gray-300 group-hover:text-[#A51C30] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </Link>
            ))}
          </div>
        </section>

        {/* Section: Quick Tips / Announcements */}
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-[#1a2744] tracking-tight">Campus Notice</h2>
            <p className="text-sm text-gray-400 mt-0.5">Important updates and reminders</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tip 1 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#FFF5F5] flex items-center justify-center flex-shrink-0">
                  <AcademicCapIcon className="w-5 h-5 text-[#A51C30]" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Track Your Academic Progress</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Use the GPA Calculator to monitor your semester performance and plan your upcoming courses.
                  </p>
                  <Link href="/dashboard/gpa" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#A51C30] hover:underline">
                    Open GPA Calculator <ArrowRightIcon className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Tip 2 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F0F3FA] flex items-center justify-center flex-shrink-0">
                  <CalendarIcon className="w-5 h-5 text-[#1a2744]" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Upcoming Campus Events</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Don't miss out on seminars, fairs, and social events happening across campus this week.
                  </p>
                  <Link href="/dashboard/events" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#1a2744] hover:underline">
                    Browse Events <ArrowRightIcon className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Tip 3 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] flex items-center justify-center flex-shrink-0">
                  <BookOpenIcon className="w-5 h-5 text-[#059669]" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Share Study Resources</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Upload your notes and past papers to the Resource Bank and help your fellow students succeed.
                  </p>
                  <Link href="/dashboard/resources" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#059669] hover:underline">
                    Go to Resource Bank <ArrowRightIcon className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Tip 4 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#FFF5F5] flex items-center justify-center flex-shrink-0">
                  <BellIcon className="w-5 h-5 text-[#A51C30]" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Stay in the Loop</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Enable notifications so you never miss a campus announcement, event update, or message.
                  </p>
                  <Link href="/dashboard/notifications" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#A51C30] hover:underline">
                    View Activity Log <ArrowRightIcon className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer badge */}
        <div className="flex items-center justify-center gap-3 py-6 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#A51C30] animate-pulse" />
            <span className="text-xs text-gray-400 font-medium">Campus Pulse Active</span>
          </div>
          <span className="text-gray-200">·</span>
          <span className="text-xs text-gray-400 font-medium">
            {user?.university?.name || 'CustConnect University Portal'}
          </span>
        </div>

      </div>
    </div>
  );
}
