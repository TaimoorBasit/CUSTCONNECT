'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
    HomeIcon,
    ChatBubbleLeftRightIcon,
    MapIcon,
    UserIcon,
    Squares2X2Icon,
    UsersIcon,
    BuildingStorefrontIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import {
    HomeIcon as HomeSolid,
    ChatBubbleLeftRightIcon as ChatSolid,
    MapIcon as MapSolid,
    UserIcon as UserSolid,
    Squares2X2Icon as SquaresSolid,
    UsersIcon as UsersSolid,
    BuildingStorefrontIcon as BuildingSolid,
    ChartBarIcon as ChartSolid
} from '@heroicons/react/24/solid';

export default function MobileNav() {
    const pathname = usePathname();
    const { user } = useAuth();

    const userRoles = user?.roles?.map(r => r.name) || [];
    const isSuperAdmin = userRoles.includes('SUPER_ADMIN');
    const isCafeOwner = userRoles.includes('CAFE_OWNER');
    const isBusOperator = userRoles.includes('BUS_OPERATOR');
    const isPrinterOwner = userRoles.includes('PRINTER_SHOP_OWNER');
    const isVendor = isCafeOwner || isBusOperator || isPrinterOwner;

    const studentNavigation = [
        { name: 'Feed', href: '/dashboard/feed', icon: HomeIcon, activeIcon: HomeSolid },
        { name: 'Bus', href: '/dashboard/bus', icon: MapIcon, activeIcon: MapSolid },
        { name: 'Explore', href: '/dashboard', icon: Squares2X2Icon, activeIcon: SquaresSolid },
        { name: 'Social', href: '/dashboard/connections', icon: UsersIcon, activeIcon: UsersSolid },
        { name: 'Profile', href: '/dashboard/settings', icon: UserIcon, activeIcon: UserSolid },
    ];

    const vendorNavigation = [
        { name: 'Terminal', href: '/vendor', icon: Squares2X2Icon, activeIcon: SquaresSolid },
        { name: 'Feed', href: '/dashboard/feed', icon: HomeIcon, activeIcon: HomeSolid },
        { name: 'Direct', href: '/dashboard/messages', icon: ChatBubbleLeftRightIcon, activeIcon: ChatSolid },
        { name: 'Profile', href: '/dashboard/settings', icon: UserIcon, activeIcon: UserSolid },
    ];

    const adminNavigation = [
        { name: 'Control', href: '/admin', icon: Squares2X2Icon, activeIcon: SquaresSolid },
        { name: 'Users', href: '/admin/users', icon: UsersIcon, activeIcon: UsersSolid },
        { name: 'Vendors', href: '/admin/vendors', icon: BuildingStorefrontIcon, activeIcon: BuildingSolid },
        { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon, activeIcon: ChartSolid },
        { name: 'Profile', href: '/admin/settings', icon: UserIcon, activeIcon: UserSolid },
    ];

    let navItems = studentNavigation;
    if (isSuperAdmin) navItems = adminNavigation;
    else if (isVendor) navItems = vendorNavigation;

    if (pathname === '/auth/login' || pathname === '/auth/register' || pathname === '/') return null;

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border-t border-gray-200/50 transition-all duration-500 rounded-t-[32px] shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.1)]" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 12px) + 8px)' }}>
            <div className="flex justify-around items-center h-20 px-6">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/admin' && pathname?.startsWith(item.href));
                    const Icon = isActive ? item.activeIcon : item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center h-full transition-all duration-300 relative group`}
                        >
                            <div className={`p-3 rounded-[20px] transition-all duration-500 relative ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' : 'text-gray-400 group-hover:bg-gray-50 group-hover:text-gray-600'}`}>
                                <Icon className={`w-6 h-6 transition-transform duration-500`} />
                                {isActive && (
                                    <div className="absolute inset-0 rounded-[20px] bg-white/20 animate-pulse" />
                                )}
                            </div>
                            <span className={`text-[9px] font-black mt-1.5 uppercase transition-all duration-500 tracking-tighter ${isActive ? 'text-indigo-600 opacity-100 scale-100' : 'text-gray-400 opacity-0 scale-75'}`}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
