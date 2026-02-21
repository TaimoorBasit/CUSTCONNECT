'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import RoleBasedSidebar from '@/components/layout/RoleBasedSidebar';
import LoadingSpinner from '@/components/LoadingSpinner';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';

export default function VendorLayout({
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
      const isPrinterShopOwner = userRoles.includes('PRINTER_SHOP_OWNER');
      const isVendor = isCafeOwner || isBusOperator || isPrinterShopOwner;

      // Only allow vendors and super admins
      if (!isVendor && !isSuperAdmin) {
        router.push('/dashboard');
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
    <div className="min-h-screen bg-background overflow-hidden flex">
      {/* Infrastructure Sidebar */}
      <RoleBasedSidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden md:pl-72">
        {/* Modern Nav Bridge */}
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />

        {/* Operational Viewport */}
        <main className="flex-1 overflow-y-auto no-scrollbar relative focus:outline-none">
          <div className="py-8 md:py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-8">
              {children}
            </div>
          </div>

          <div className="pb-12 px-8">
            <Footer />
          </div>
        </main>
      </div>

      {/* Vendor Mobile Nav */}
      <MobileNav />
    </div>
  );
}

