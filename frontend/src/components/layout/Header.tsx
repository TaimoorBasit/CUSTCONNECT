'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { BellIcon, Bars3Icon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { getImageUrl, getUiAvatarUrl } from '@/utils/url';

type HeaderProps = { onMenuClick?: () => void };

export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const router = useRouter();

  const userRoles = user?.roles?.map((r) => r.name) || [];
  const isSuperAdmin = userRoles.includes('SUPER_ADMIN');

  return (
    <header
      className="sticky top-0 z-40 w-full bg-white border-b border-gray-200"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left — hamburger (mobile) + wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-1 rounded-lg text-gray-500 hover:bg-gray-100 transition"
          >
            <Bars3Icon className="w-5 h-5" strokeWidth={2} />
          </button>
          {/* Shown only on mobile (desktop has sidebar brand) */}
          <div className="md:hidden flex items-center gap-2">
            <img src="/logo.png" alt="CustConnect" className="h-7 w-7 rounded-md object-contain" />
            <span className="text-[15px] font-bold text-[#1a2744] tracking-tight">
              Cust<span className="text-[#A51C30]">Connect</span>
            </span>
          </div>

          {/* Breadcrumb-style label on desktop */}
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
            <span className="font-medium">
              {isSuperAdmin ? 'Admin Portal' : `${user?.university?.name || 'University'} Portal`}
            </span>
          </div>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push('/dashboard/feed/search')}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
            title="Search"
          >
            <MagnifyingGlassIcon className="w-5 h-5" strokeWidth={2} />
          </button>

          <button
            onClick={() => router.push('/dashboard/notifications')}
            className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
            title="Notifications"
          >
            <BellIcon className="w-5 h-5" strokeWidth={2} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#A51C30] rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Avatar button */}
          <button
            onClick={() => router.push('/dashboard/settings')}
            className="ml-1 w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center text-xs font-bold text-white flex-shrink-0 transition hover:opacity-90"
            style={{ background: '#1a2744' }}
            title="My Profile"
          >
            {user?.profileImage ? (
              <img
                src={getImageUrl(user.profileImage) || ''}
                className="w-full h-full object-cover"
                alt=""
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getUiAvatarUrl(user.firstName, user.lastName);
                }}
              />
            ) : (
              user?.firstName?.[0]
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
