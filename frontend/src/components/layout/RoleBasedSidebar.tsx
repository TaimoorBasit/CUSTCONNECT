'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/authService';
import Link from 'next/link';
import { getImageUrl, getUiAvatarUrl } from '@/utils/url';
import {
  UserGroupIcon,
  BuildingStorefrontIcon,
  BookOpenIcon,
  CalculatorIcon,
  CalendarIcon,
  BellIcon,
  MapIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  PrinterIcon,
  DocumentTextIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  DocumentMagnifyingGlassIcon,
  Squares2X2Icon,
  AcademicCapIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

type SidebarProps = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

const studentNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Squares2X2Icon, section: null },
  { name: 'Campus Feed', href: '/dashboard/feed', icon: UserGroupIcon, section: 'Social' },
  { name: 'Social Hub', href: '/dashboard/connections', icon: UsersIcon, section: 'Social' },
  { name: 'Direct Messages', href: '/dashboard/messages', icon: ChatBubbleLeftRightIcon, section: 'Social' },
  { name: 'Bus Tracking', href: '/dashboard/bus', icon: MapIcon, section: 'Campus Life' },
  { name: 'University Cafes', href: '/dashboard/cafes', icon: BuildingStorefrontIcon, section: 'Campus Life' },
  { name: 'Print Centre', href: '/dashboard/print', icon: PrinterIcon, section: 'Campus Life' },
  { name: 'Lost & Found', href: '/dashboard/lost-found', icon: MagnifyingGlassIcon, section: 'Campus Life' },
  { name: 'Campus Events', href: '/dashboard/events', icon: CalendarIcon, section: 'Campus Life' },
  { name: 'Resource Bank', href: '/dashboard/resources', icon: BookOpenIcon, section: 'Academics' },
  { name: 'GPA Calculator', href: '/dashboard/gpa', icon: AcademicCapIcon, section: 'Academics' },
  { name: 'Tools & Docs', href: '/dashboard/tools', icon: DocumentTextIcon, section: 'Academics' },
  { name: 'Activity Log', href: '/dashboard/notifications', icon: BellIcon, section: 'Account' },
  { name: 'Profile Settings', href: '/dashboard/settings', icon: Cog6ToothIcon, section: 'Account' },
];

const adminNavigation = [
  { name: 'Control Centre', href: '/admin', icon: Squares2X2Icon, section: null },
  { name: 'Users', href: '/admin/users', icon: UsersIcon, section: 'Management' },
  { name: 'Vendors', href: '/admin/vendors', icon: BuildingStorefrontIcon, section: 'Management' },
  { name: 'Posts', href: '/admin/posts', icon: UserGroupIcon, section: 'Management' },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon, section: 'Management' },
  { name: 'Lost & Found', href: '/admin/lost-found', icon: MagnifyingGlassIcon, section: 'Operations' },
  { name: 'Cafes', href: '/admin/cafes', icon: BuildingStorefrontIcon, section: 'Operations' },
  { name: 'Bus Routes', href: '/admin/buses', icon: MapIcon, section: 'Operations' },
  { name: 'Emergencies', href: '/admin/emergencies', icon: ExclamationTriangleIcon, section: 'Operations' },
  { name: 'Print Shops', href: '/admin/printer-shops', icon: PrinterIcon, section: 'Operations' },
  { name: 'Resources', href: '/admin/resources', icon: BookOpenIcon, section: 'Content' },
  { name: 'Events', href: '/admin/events', icon: CalendarIcon, section: 'Content' },
  { name: 'Notifications', href: '/admin/notifications', icon: BellIcon, section: 'Content' },
  { name: 'Grading', href: '/admin/grading', icon: AcademicCapIcon, section: 'Content' },
  { name: 'Audit Logs', href: '/admin/audit', icon: DocumentMagnifyingGlassIcon, section: 'System' },
  { name: 'Messages', href: '/admin/messages', icon: ChatBubbleLeftRightIcon, section: 'System' },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon, section: 'System' },
];

const cafeOwnerNavigation = [
  { name: 'My Cafe', href: '/vendor', icon: BuildingStorefrontIcon, section: null },
  { name: 'Manage Menu', href: '/vendor/cafes', icon: DocumentTextIcon, section: null },
  { name: 'Campus Feed', href: '/dashboard/feed', icon: UserGroupIcon, section: null },
  { name: 'Messages', href: '/dashboard/messages', icon: ChatBubbleLeftRightIcon, section: null },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon, section: null },
];

const busOperatorNavigation = [
  { name: 'Transit Hub', href: '/vendor', icon: MapIcon, section: null },
  { name: 'Route Management', href: '/vendor/bus', icon: ChartBarIcon, section: null },
  { name: 'Campus Feed', href: '/dashboard/feed', icon: UserGroupIcon, section: null },
  { name: 'Messages', href: '/dashboard/messages', icon: ChatBubbleLeftRightIcon, section: null },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon, section: null },
];

const printerOwnerNavigation = [
  { name: 'Print Hub', href: '/vendor', icon: PrinterIcon, section: null },
  { name: 'Job Queue', href: '/vendor/print', icon: DocumentTextIcon, section: null },
  { name: 'Campus Feed', href: '/dashboard/feed', icon: UserGroupIcon, section: null },
  { name: 'Messages', href: '/dashboard/messages', icon: ChatBubbleLeftRightIcon, section: null },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon, section: null },
];

export default function RoleBasedSidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    logout();
    authService.logout().catch(() => { });
    router.push('/auth/login');
  };

  const userRoles = user?.roles?.map((r) => r.name) || [];
  const isSuperAdmin = userRoles.includes('SUPER_ADMIN');
  const isCafeOwner = userRoles.includes('CAFE_OWNER');
  const isBusOperator = userRoles.includes('BUS_OPERATOR');
  const isPrinterOwner = userRoles.includes('PRINTER_SHOP_OWNER');

  let navigation = studentNavigation;
  let roleDisplay = 'Student';
  let roleColor = '#A51C30';

  if (isSuperAdmin) {
    navigation = adminNavigation;
    roleDisplay = 'Administrator';
    roleColor = '#1a2744';
  } else if (isCafeOwner) {
    navigation = cafeOwnerNavigation;
    roleDisplay = 'Cafe Owner';
    roleColor = '#D97706';
  } else if (isBusOperator) {
    navigation = busOperatorNavigation;
    roleDisplay = 'Transit Operator';
    roleColor = '#059669';
  } else if (isPrinterOwner) {
    navigation = printerOwnerNavigation;
    roleDisplay = 'Print Hub Owner';
    roleColor = '#7C3AED';
  }

  // Group nav items by section
  const sections: Record<string, typeof navigation> = {};
  const topItems: typeof navigation = [];
  for (const item of navigation) {
    if (!item.section) {
      topItems.push(item);
    } else {
      if (!sections[item.section]) sections[item.section] = [];
      sections[item.section].push(item);
    }
  }

  const NavItem = ({ item }: { item: typeof navigation[0] }) => {
    const isActive = pathname === item.href ||
      (item.href !== '/dashboard' && item.href !== '/admin' && item.href !== '/vendor' && pathname?.startsWith(item.href + '/'));
    return (
      <Link
        href={item.href}
        onClick={onMobileClose}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all group ${isActive
          ? 'bg-[#A51C30] text-white shadow-sm'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        style={isActive ? { backgroundColor: roleColor } : {}}
      >
        <item.icon className={`w-[18px] h-[18px] flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-400'}`} strokeWidth={isActive ? 2 : 1.8} />
        <span className="truncate">{item.name}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-all duration-300 md:hidden ${mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onMobileClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-[70] w-[82%] max-w-[280px] bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 md:translate-x-0 md:w-64 ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        {/* Logo / Brand */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="CustConnect" className="h-8 w-8 rounded-lg object-contain flex-shrink-0" />
            <div>
              <p className="text-[15px] font-bold text-[#1a2744] leading-none tracking-tight">CustConnect</p>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">University Portal</p>
            </div>
          </div>
          <button
            onClick={onMobileClose}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 space-y-0.5">
          {/* Top level items (no section) */}
          {topItems.map((item) => <NavItem key={item.name} item={item} />)}

          {/* Grouped sections */}
          {Object.entries(sections).map(([sectionName, items]) => (
            <div key={sectionName} className="pt-4">
              <p className="px-3 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {sectionName}
              </p>
              {items.map((item) => <NavItem key={item.name} item={item} />)}
            </div>
          ))}
        </nav>

        {/* User Profile Footer */}
        <div className="px-3 py-4 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
            <Link href={`/dashboard/profile?id=${user?.id}`} className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm overflow-hidden flex-shrink-0 shadow-sm"
                style={{ background: roleColor }}
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
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate leading-none">{user?.firstName} {user?.lastName}</p>
                <p className="text-[11px] font-medium mt-0.5" style={{ color: roleColor }}>{roleDisplay}</p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
              title="Sign out"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
