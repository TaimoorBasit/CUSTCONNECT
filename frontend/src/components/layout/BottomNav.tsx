'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    HomeIcon,
    ChatBubbleLeftRightIcon,
    AcademicCapIcon,
    UserIcon,
    BellIcon
} from '@heroicons/react/24/outline';
import {
    HomeIcon as HomeSolid,
    ChatBubbleLeftRightIcon as ChatSolid,
    AcademicCapIcon as CapSolid,
    UserIcon as UserSolid,
    BellIcon as BellSolid
} from '@heroicons/react/24/solid';

const navItems = [
    { name: 'Home', href: '/dashboard', icon: HomeIcon, activeIcon: HomeSolid },
    { name: 'GPA', href: '/dashboard/gpa', icon: AcademicCapIcon, activeIcon: CapSolid },
    { name: 'Messages', href: '/dashboard/messages', icon: ChatBubbleLeftRightIcon, activeIcon: ChatSolid },
    { name: 'Alerts', href: '/dashboard/notifications', icon: BellIcon, activeIcon: BellSolid },
    { name: 'Profile', href: '/dashboard/settings', icon: UserIcon, activeIcon: UserSolid },
];

export default function BottomNav() {
    const pathname = usePathname();

    // Only show on dashboard routes
    if (!pathname?.startsWith('/dashboard')) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-zinc-200 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto px-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = isActive ? item.activeIcon : item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 w-16 ${isActive ? 'text-[#A51C30]' : 'text-zinc-400'
                                }`}
                        >
                            <div className={`p-1.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-[#A51C30]/5 scale-110' : ''
                                }`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <span className={`text-[10px] font-bold tracking-tight ${isActive ? 'opacity-100' : 'opacity-70'
                                }`}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
