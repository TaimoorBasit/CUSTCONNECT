'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { BellIcon, Bars3Icon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

type HeaderProps = { onMenuClick?: () => void };

export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const router = useRouter();

  const userRoles = user?.roles?.map(r => r.name) || [];
  const isSuperAdmin = userRoles.includes('SUPER_ADMIN');

  return (
    <header
      className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-neutral-100"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex items-center justify-between h-14 px-5">
        {/* Left — menu + wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-1 rounded-lg text-neutral-500 hover:bg-neutral-100 transition active:scale-90"
          >
            <Bars3Icon className="w-5 h-5 stroke-2" />
          </button>
          <div>
            <span className="text-[10px] font-bold text-neutral-400 tracking-[0.15em] uppercase block leading-none mb-0.5">
              {isSuperAdmin ? 'Admin' : 'Student'} Hub
            </span>
            <span className="text-lg font-bold tracking-tight text-neutral-900 leading-none">
              Cust<span className="text-indigo-700">Connect</span>
            </span>
          </div>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => router.push('/dashboard/feed/search')}
            className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 transition active:scale-90"
          >
            <MagnifyingGlassIcon className="w-5 h-5 stroke-2" />
          </button>

          <button
            onClick={() => router.push('/dashboard/notifications')}
            className="relative p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 transition active:scale-90"
          >
            <BellIcon className="w-5 h-5 stroke-2" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
            )}
          </button>

          <button
            onClick={() => router.push('/dashboard/settings')}
            className="ml-0.5 w-8 h-8 rounded-lg bg-indigo-700 flex items-center justify-center text-xs font-bold text-white transition hover:bg-indigo-800 active:scale-90"
          >
            {user?.firstName?.[0]}
          </button>
        </div>
      </div>
    </header>
  );
}
