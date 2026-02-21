'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { BellIcon, Bars3Icon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

type HeaderProps = {
  onMenuClick?: () => void;
};

export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const router = useRouter();

  const userRoles = user?.roles?.map(r => r.name) || [];
  const isSuperAdmin = userRoles.includes('SUPER_ADMIN');

  return (
    <div className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100/50" style={{ paddingTop: 'env(safe-area-inset-top, 24px)', paddingBottom: '8px' }}>
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2.5 rounded-2xl bg-gray-50 text-gray-900 border border-gray-100 transition-all active:scale-90"
          >
            <Bars3Icon className="w-6 h-6 stroke-2" />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-indigo-500/60 tracking-[0.2em] uppercase leading-none mb-1">
              {isSuperAdmin ? 'ADMIN' : 'STUDENT'} HUB
            </span>
            <h1 className="text-xl font-black tracking-tighter text-gray-900 leading-none">
              Cust<span className="text-indigo-600 italic">Connect</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="p-2.5 rounded-2xl bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100 transition-all active:scale-90"
            onClick={() => router.push('/dashboard/feed/search')}
          >
            <MagnifyingGlassIcon className="w-5 h-5 stroke-2" />
          </button>

          <button
            onClick={() => router.push('/dashboard/notifications')}
            className="relative p-2.5 rounded-2xl bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100 transition-all active:scale-90"
          >
            <BellIcon className="w-5 h-5 stroke-2" />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-red-500 rounded-full ring-4 ring-white" />
            )}
          </button>

          <button
            onClick={() => router.push('/dashboard/settings')}
            className="ml-1 group relative p-0.5 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 transition-all active:scale-95 overflow-hidden"
          >
            <div className="w-10 h-10 rounded-[14px] bg-white flex items-center justify-center text-xs font-black text-indigo-600 border border-white/20">
              {user?.firstName?.[0]}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
