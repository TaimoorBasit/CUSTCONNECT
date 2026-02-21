'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import RoleBasedSidebar from '@/components/layout/RoleBasedSidebar';
import LoadingSpinner from '@/components/LoadingSpinner';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';

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

      // Primary Redirect Logic
      if (isSuperAdmin && !pathname?.startsWith('/admin')) {
        router.push('/admin');
      } else if (isVendor && !pathname?.startsWith('/vendor')) {
        router.push('/vendor');
      } else if (isStudent && pathname === '/dashboard') {
        router.push('/dashboard/feed');
      }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) return null;

  const userRoles = user.roles?.map(r => r.name) || [];
  const isSuperAdmin = userRoles.includes('SUPER_ADMIN');
  const isCafeOwner = userRoles.includes('CAFE_OWNER');
  const isBusOperator = userRoles.includes('BUS_OPERATOR');
  const isVendor = isCafeOwner || isBusOperator;

  // If high-privilege user is in student area, suppress render and allow redirect to take over
  if ((isSuperAdmin && !pathname?.startsWith('/admin')) || (isVendor && !pathname?.startsWith('/vendor'))) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Dynamic Header */}
      <Header onMenuClick={() => setMobileSidebarOpen(true)} />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <RoleBasedSidebar
            mobileOpen={mobileSidebarOpen}
            onMobileClose={() => setMobileSidebarOpen(false)}
          />
        </div>

        {/* Main Feed/Content Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-20 md:pb-0 md:pl-72">
          <div className="max-w-4xl mx-auto min-h-full">
            {children}

            {/* Footer only on desktop */}
            <div className="hidden md:block py-8 mt-auto">
              <Footer />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar (Drawer) */}
      <RoleBasedSidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Native-style Mobile Nav */}
      <MobileNav />
    </div>
  );
}