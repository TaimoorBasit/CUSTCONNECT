'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/authService';
import Link from 'next/link';
import {
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
} from '@heroicons/react/24/outline';

type SidebarProps = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

const studentNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Squares2X2Icon },
  { name: 'Campus Feed', href: '/dashboard/feed', icon: UserGroupIcon },
  { name: 'Social Hub', href: '/dashboard/connections', icon: UsersIcon },
  { name: 'Direct Messages', href: '/dashboard/messages', icon: ChatBubbleLeftRightIcon },
  { name: 'Tools & Docs', href: '/dashboard/tools', icon: DocumentTextIcon },
  { name: 'Bus Tracking', href: '/dashboard/bus', icon: MapIcon },
  { name: 'University Cafes', href: '/dashboard/cafes', icon: BuildingStorefrontIcon },
  { name: 'Print Center', href: '/dashboard/print', icon: PrinterIcon },
  { name: 'Lost Explorer', href: '/dashboard/lost-found', icon: MagnifyingGlassIcon },
  { name: 'Resource Bank', href: '/dashboard/resources', icon: BookOpenIcon },
  { name: 'GPA Master', href: '/dashboard/gpa', icon: AcademicCapIcon },
  { name: 'Campus Events', href: '/dashboard/events', icon: CalendarIcon },
  { name: 'Activity Log', href: '/dashboard/notifications', icon: BellIcon },
  { name: 'Profile Settings', href: '/dashboard/settings', icon: CogIcon },
];

const adminNavigation = [
  { name: 'Control Center', href: '/admin', icon: Squares2X2Icon },
  { name: 'Identity Labs', href: '/admin/users', icon: UsersIcon },
  { name: 'Business Registry', href: '/admin/vendors', icon: BuildingStorefrontIcon },
  { name: 'Moderation Hub', href: '/admin/posts', icon: UserGroupIcon },
  { name: 'Intelligence Core', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Asset Retrieval', href: '/admin/lost-found', icon: MagnifyingGlassIcon },
  { name: 'Cafe Network', href: '/admin/cafes', icon: BuildingStorefrontIcon },
  { name: 'Transit Routes', href: '/admin/buses', icon: MapIcon },
  { name: 'Emergency Protocol', href: '/admin/emergencies', icon: ExclamationTriangleIcon },
  { name: 'Printer Network', href: '/admin/printer-shops', icon: PrinterIcon },
  { name: 'Resource Lab', href: '/admin/resources', icon: BookOpenIcon },
  { name: 'Campus Hub', href: '/admin/events', icon: CalendarIcon },
  { name: 'Broadcast Center', href: '/admin/notifications', icon: BellIcon },
  { name: 'Grading Calibration', href: '/admin/grading', icon: AcademicCapIcon },
  { name: 'Intelligence Logs', href: '/admin/audit', icon: DocumentMagnifyingGlassIcon },
  { name: 'Secure Messenger', href: '/admin/messages', icon: ChatBubbleLeftRightIcon },
  { name: 'System Settings', href: '/admin/settings', icon: CogIcon },
];

const cafeOwnerNavigation = [
  { name: 'Cafe Control', href: '/dashboard', icon: BuildingStorefrontIcon },
  { name: 'My Menu', href: '/dashboard/cafes', icon: DocumentTextIcon },
  { name: 'Cafe Feed', href: '/dashboard/feed', icon: UserGroupIcon },
  { name: 'Messages', href: '/dashboard/messages', icon: ChatBubbleLeftRightIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: CogIcon },
];

const busOperatorNavigation = [
  { name: 'Transit Control', href: '/dashboard', icon: MapIcon },
  { name: 'Route Analytics', href: '/dashboard/bus', icon: ChartBarIcon },
  { name: 'Fleet Feed', href: '/dashboard/feed', icon: UserGroupIcon },
  { name: 'Messages', href: '/dashboard/messages', icon: ChatBubbleLeftRightIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: CogIcon },
];

const printerOwnerNavigation = [
  { name: 'Print Hub', href: '/dashboard', icon: PrinterIcon },
  { name: 'Job Queue', href: '/dashboard/print', icon: DocumentTextIcon },
  { name: 'Hub Feed', href: '/dashboard/feed', icon: UserGroupIcon },
  { name: 'Messages', href: '/dashboard/messages', icon: ChatBubbleLeftRightIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: CogIcon },
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

  const userRoles = user?.roles?.map(r => r.name) || [];
  const isSuperAdmin = userRoles.includes('SUPER_ADMIN');
  const isCafeOwner = userRoles.includes('CAFE_OWNER');
  const isBusOperator = userRoles.includes('BUS_OPERATOR');
  const isPrinterOwner = userRoles.includes('PRINTER_SHOP_OWNER');

  let navigation = studentNavigation;
  let roleDisplay = 'Active Student';

  if (isSuperAdmin) {
    navigation = adminNavigation;
    roleDisplay = 'Super Admin';
  } else if (isCafeOwner) {
    navigation = cafeOwnerNavigation;
    roleDisplay = 'Cafe Proprietor';
  } else if (isBusOperator) {
    navigation = busOperatorNavigation;
    roleDisplay = 'Transit Operator';
  } else if (isPrinterOwner) {
    navigation = printerOwnerNavigation;
    roleDisplay = 'Print Hub Owner';
  }

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-md transition-all duration-500 md:hidden ${mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onMobileClose}
      />

      {/* Sidebar Drawer */}
      <div className={`fixed inset-y-0 left-0 z-[70] w-[85%] max-w-sm bg-[#1a1b3b] border-r border-white/5 transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) md:translate-x-0 md:w-72 ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full" style={{ paddingTop: 'env(safe-area-inset-top, 24px)' }}>
          {/* Brand Header */}
          <div className="p-8 pb-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white/40 tracking-[0.2em] uppercase mb-1">Navigation</span>
              <h2 className="text-2xl font-black text-white tracking-tighter">Menu<span className="text-indigo-400 italic">.</span></h2>
            </div>
            <button onClick={onMobileClose} className="md:hidden p-3 rounded-2xl bg-white/5 active:scale-90 transition-transform">
              <XMarkIcon className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto no-scrollbar px-6 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href + '/'));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onMobileClose}
                  className={`flex items-center gap-4 px-5 py-4 rounded-[24px] text-[14px] font-black transition-all group ${isActive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 scale-[1.02]' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                >
                  <div className={`transition-all duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'group-hover:scale-110'}`}>
                    <item.icon className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-6 mt-auto border-t border-white/5">
            <div className="bg-white/5 p-4 rounded-[28px] border border-white/5 hover:bg-white/10 transition-all group">
              <div className="flex items-center justify-between">
                <Link href={`/dashboard/profile?id=${user?.id}`} className="flex items-center gap-3 cursor-pointer">
                  <div className="w-12 h-12 rounded-[18px] bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px] shadow-lg group-hover:scale-110 transition-transform duration-500">
                    <div className="w-full h-full rounded-[16px] bg-[#1a1b3b] flex items-center justify-center font-black text-white text-lg border-2 border-white/10 overflow-hidden">
                      {user?.profileImage ? (
                        <img src={user.profileImage} className="w-full h-full object-cover" alt="" />
                      ) : (
                        user?.firstName?.[0]
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-black text-white leading-tight group-hover:text-indigo-400 transition-colors">{user?.firstName} {user?.lastName}</span>
                    <span className="text-[11px] text-white/40 font-bold mt-0.5 tracking-tight uppercase">{roleDisplay}</span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-3 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all active:scale-90"
                  title="Logout"
                >
                  <ArrowRightOnRectangleIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
