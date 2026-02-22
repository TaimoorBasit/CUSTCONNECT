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

    const studentNav = [
        { name: 'Feed', href: '/dashboard/feed', icon: HomeIcon, activeIcon: HomeSolid },
        { name: 'Bus', href: '/dashboard/bus', icon: MapIcon, activeIcon: MapSolid },
        { name: 'Explore', href: '/dashboard', icon: Squares2X2Icon, activeIcon: SquaresSolid },
        { name: 'Social', href: '/dashboard/connections', icon: UsersIcon, activeIcon: UsersSolid },
        { name: 'Profile', href: '/dashboard/settings', icon: UserIcon, activeIcon: UserSolid },
    ];
    const vendorNav = [
        { name: 'Terminal', href: '/vendor', icon: Squares2X2Icon, activeIcon: SquaresSolid },
        { name: 'Feed', href: '/dashboard/feed', icon: HomeIcon, activeIcon: HomeSolid },
        { name: 'Messages', href: '/dashboard/messages', icon: ChatBubbleLeftRightIcon, activeIcon: ChatSolid },
        { name: 'Profile', href: '/dashboard/settings', icon: UserIcon, activeIcon: UserSolid },
    ];
    const adminNav = [
        { name: 'Control', href: '/admin', icon: Squares2X2Icon, activeIcon: SquaresSolid },
        { name: 'Users', href: '/admin/users', icon: UsersIcon, activeIcon: UsersSolid },
        { name: 'Vendors', href: '/admin/vendors', icon: BuildingStorefrontIcon, activeIcon: BuildingSolid },
        { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon, activeIcon: ChartSolid },
        { name: 'Profile', href: '/admin/settings', icon: UserIcon, activeIcon: UserSolid },
    ];

    let navItems = studentNav;
    if (isSuperAdmin) navItems = adminNav;
    else if (isVendor) navItems = vendorNav;

    if (pathname === '/auth/login' || pathname === '/auth/register' || pathname === '/') return null;

    return (
        <nav
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-100"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
            <div className="flex justify-around items-stretch h-16 px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/dashboard' && item.href !== '/admin' && pathname?.startsWith(item.href));
                    const Icon = isActive ? item.activeIcon : item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center justify-center flex-1 gap-1 py-2 transition-all"
                        >
                            <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-indigo-700' : 'text-neutral-400'}`} />
                            <span className={`text-[10px] font-semibold transition-colors ${isActive ? 'text-indigo-700' : 'text-neutral-400'}`}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
