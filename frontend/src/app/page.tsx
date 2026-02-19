'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        const userRoles = user.roles?.map(r => r.name) || [];
        const isSuperAdmin = userRoles.includes('SUPER_ADMIN');
        const isCafeOwner = userRoles.includes('CAFE_OWNER');
        const isBusOperator = userRoles.includes('BUS_OPERATOR');
        const isVendor = isCafeOwner || isBusOperator;
        const isStudent = !isSuperAdmin && !isVendor;

        // Redirect based on role
        if (isSuperAdmin) {
          router.push('/admin');
        } else if (isVendor) {
          router.push('/vendor');
        } else if (isStudent) {
          router.push('/dashboard/feed');
        } else {
          router.push('/dashboard');
        }
      } else {
        router.push('/auth/login');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return null;
}