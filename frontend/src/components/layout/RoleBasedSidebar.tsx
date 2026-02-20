'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/authService';
import Link from 'next/link';
import Image from 'next/image';
import {
  HomeIcon,
  UserGroupIcon,
  BuildingStorefrontIcon,
  BookOpenIcon,
  CalculatorIcon,
  CalendarIcon,
  BellIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  MapIcon,
  XMarkIcon,
  ChartBarIcon,
  UserCircleIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';

type SidebarProps = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

// Student Navigation (Dashboard hidden for students)
const studentNavigation = [
  { name: 'Social Feed', href: '/dashboard/feed', icon: UserGroupIcon },
  { name: 'Messages', href: '/dashboard/messages', icon: ChatBubbleLeftRightIcon },
  { name: 'Assignment Tools', href: '/dashboard/tools', icon: DocumentTextIcon },
  { name: 'Bus Service', href: '/dashboard/bus', icon: MapIcon },
  { name: 'Cafés', href: '/dashboard/cafes', icon: BuildingStorefrontIcon },
  { name: 'Print Service', href: '/dashboard/print', icon: PrinterIcon },
  { name: 'Lost & Found', href: '/dashboard/lost-found', icon: MagnifyingGlassIcon },
  { name: 'Resources', href: '/dashboard/resources', icon: BookOpenIcon },
  { name: 'GPA Calculator', href: '/dashboard/gpa', icon: CalculatorIcon },
  { name: 'Events', href: '/dashboard/events', icon: CalendarIcon },
  { name: 'Notifications', href: '/dashboard/notifications', icon: BellIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: CogIcon },
];

// Vendor Navigation (Cafe Owner / Bus Operator)
const vendorNavigation = [
  { name: 'Dashboard', href: '/vendor', icon: HomeIcon },
  { name: 'Messages', href: '/vendor/messages', icon: ChatBubbleLeftRightIcon },
  { name: 'My Cafés', href: '/vendor/cafes', icon: BuildingStorefrontIcon, roles: ['CAFE_OWNER'] },
  { name: 'Orders', href: '/vendor/orders', icon: ClipboardDocumentListIcon, roles: ['CAFE_OWNER'] },
  { name: 'My Bus Routes', href: '/vendor/buses', icon: MapIcon, roles: ['BUS_OPERATOR'] },
  { name: 'Emergency Reports', href: '/vendor/emergencies', icon: ExclamationTriangleIcon, roles: ['BUS_OPERATOR'] },
  { name: 'Print Requests', href: '/vendor/print-requests', icon: PrinterIcon, roles: ['PRINTER_SHOP_OWNER'] },
  { name: 'Analytics', href: '/vendor/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/vendor/settings', icon: CogIcon },
];

// Super Admin Navigation
const adminNavigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Messages', href: '/admin/messages', icon: ChatBubbleLeftRightIcon },
  { name: 'Users', href: '/admin/users', icon: UserCircleIcon },
  { name: 'Social Feed', href: '/admin/posts', icon: ChatBubbleLeftRightIcon },
  { name: 'Lost & Found', href: '/admin/lost-found', icon: MagnifyingGlassIcon },
  { name: 'Vendors', href: '/admin/vendors', icon: BuildingStorefrontIcon },
  { name: 'Cafés', href: '/admin/cafes', icon: BuildingStorefrontIcon },
  { name: 'Bus Routes', href: '/admin/buses', icon: MapIcon },
  { name: 'Emergency Reports', href: '/admin/emergencies', icon: ExclamationTriangleIcon },
  { name: 'Printer Shops', href: '/admin/printer-shops', icon: PrinterIcon },
  { name: 'Resources', href: '/admin/resources', icon: BookOpenIcon },
  { name: 'Events', href: '/admin/events', icon: CalendarIcon },
  { name: 'Notifications', href: '/admin/notifications', icon: BellIcon },
  { name: 'Grading System', href: '/admin/grading', icon: ClipboardDocumentListIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Audit Logs', href: '/admin/audit', icon: DocumentTextIcon },
  { name: 'Settings', href: '/admin/settings', icon: CogIcon },
];

export default function RoleBasedSidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Ignore errors - logout should always succeed locally
    }
    logout();
    router.push('/auth/login');
  };

  // Determine user role and navigation
  const userRoles = user?.roles?.map(r => r.name) || [];
  const isSuperAdmin = userRoles.includes('SUPER_ADMIN');
  const isCafeOwner = userRoles.includes('CAFE_OWNER');
  const isBusOperator = userRoles.includes('BUS_OPERATOR');
  const isPrinterShopOwner = userRoles.includes('PRINTER_SHOP_OWNER');
  const isVendor = isCafeOwner || isBusOperator || isPrinterShopOwner;

  // Get appropriate navigation
  let navigation = studentNavigation;
  if (isSuperAdmin) {
    navigation = adminNavigation;
  } else if (isVendor) {
    navigation = vendorNavigation.filter(item => {
      if (!item.roles) return true;
      return item.roles.some(role => userRoles.includes(role));
    });
  }

  const renderNav = (isDesktop = false) => (
    <>
      <div className="flex h-16 shrink-0 items-center px-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="CustConnect"
            width={160}
            height={40}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 mt-4">
        {navigation.map((item) => {
          // Precise active state detection
          let isActive = false;
          if (item.href === '/dashboard' || item.href === '/admin' || item.href === '/vendor') {
            isActive = pathname === item.href;
          } else {
            isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') ?? false);
          }

          const handleClick = () => {
            if (!isDesktop && onMobileClose) {
              onMobileClose();
            }
          };

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleClick}
              className={`
                group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
                ${isActive
                  ? 'bg-indigo-500/20 text-indigo-300'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <item.icon
                className={`
                  mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200
                  ${isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-white'}
                `}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </>
  );

  const renderUserBlock = () => (
    <div className="border-t border-white/10 p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10 overflow-hidden ring-2 ring-white/5">
          <span className="text-sm font-medium text-white">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-100 truncate">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-zinc-500 truncate">
            {isSuperAdmin ? 'Super Admin' : isCafeOwner ? 'Cafe Owner' : isBusOperator ? 'Bus Operator' : isPrinterShopOwner ? 'Printer Shop Owner' : user?.university?.name || 'Student'}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
          title="Logout"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar overlay */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-all duration-300 ${mobileOpen ? 'bg-black/50 backdrop-blur-sm' : 'bg-transparent pointer-events-none'
          }`}
        onClick={onMobileClose}
      />

      {/* Mobile sidebar */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex h-full flex-col bg-gradient-to-b from-[#1e1b4b] to-[#0f1016] border-r border-white/10 shadow-2xl">
          <div className="absolute top-0 right-0 -mr-12 pt-4">
            <button
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-white"
              onClick={onMobileClose}
            >
              <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto px-4 py-4">
            {renderNav()}
          </div>
          {renderUserBlock()}
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-40 bg-gradient-to-b from-[#1e1b4b] to-[#0f1016] border-r border-white/10">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 flex flex-col overflow-y-auto px-4 py-4">
            {renderNav(true)}
          </div>
          {renderUserBlock()}
        </div>
      </div>
    </>
  );
}
