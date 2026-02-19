'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import RoleBasedSidebar from '@/components/layout/RoleBasedSidebar';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (!loading && user) {
      const userRoles = user.roles?.map(r => r.name) || [];
      const isSuperAdmin = userRoles.includes('SUPER_ADMIN');
      const isCafeOwner = userRoles.includes('CAFE_OWNER');
      const isBusOperator = userRoles.includes('BUS_OPERATOR');
      const isVendor = isCafeOwner || isBusOperator;
      const isStudent = !isSuperAdmin && !isVendor;

      // Redirect based on role
      if (isSuperAdmin && pathname && !pathname.startsWith('/admin') && pathname !== '/dashboard' && !pathname.startsWith('/dashboard/')) {
        router.push('/admin');
      } else if (isVendor && pathname && !pathname.startsWith('/vendor') && !pathname.startsWith('/admin') && pathname !== '/dashboard' && !pathname.startsWith('/dashboard/')) {
        router.push('/vendor');
      } else if (isStudent && pathname === '/dashboard') {
        // Redirect students from /dashboard to /dashboard/feed
        router.push('/dashboard/feed');
      } else if (!isSuperAdmin && !isVendor && pathname && (pathname.startsWith('/admin') || pathname.startsWith('/vendor'))) {
        router.push('/dashboard/feed');
      }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <RoleBasedSidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="md:pl-72 flex flex-col min-h-screen transition-all duration-300">
        {/* Header */}
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}