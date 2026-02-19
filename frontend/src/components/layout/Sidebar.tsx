import Image from 'next/image';
import HomeIcon from '@heroicons/react/24/outline/HomeIcon';
import UserGroupIcon from '@heroicons/react/24/outline/UserGroupIcon';
import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';
import BookOpenIcon from '@heroicons/react/24/outline/BookOpenIcon';
import CalculatorIcon from '@heroicons/react/24/outline/CalculatorIcon';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import BellIcon from '@heroicons/react/24/outline/BellIcon';
import CogIcon from '@heroicons/react/24/outline/CogIcon';
import ArrowRightOnRectangleIcon from '@heroicons/react/24/outline/ArrowRightOnRectangleIcon';
import MapIcon from '@heroicons/react/24/outline/MapIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon';
import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
import PrinterIcon from '@heroicons/react/24/outline/PrinterIcon';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Social Feed', href: '/dashboard/feed', icon: UserGroupIcon },
  { name: 'Messages', href: '/dashboard/messages', icon: ChatBubbleLeftRightIcon },
  { name: 'Assignment Tools', href: '/dashboard/tools', icon: DocumentTextIcon },
  { name: 'Bus Service', href: '/dashboard/bus', icon: MapIcon },
  { name: 'Cafés', href: '/dashboard/cafes', icon: BuildingStorefrontIcon },
  { name: 'Print Service', href: '/dashboard/print', icon: PrinterIcon },
  { name: 'Resources', href: '/dashboard/resources', icon: BookOpenIcon },
  { name: 'GPA Calculator', href: '/dashboard/gpa', icon: CalculatorIcon },
  { name: 'Events', href: '/dashboard/events', icon: CalendarIcon },
  { name: 'Notifications', href: '/dashboard/notifications', icon: BellIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: CogIcon },
];

type SidebarProps = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const renderNav = (isDesktop = false) => (
    <>
      <div className="flex items-center flex-shrink-0 px-4">
        <Image
          src="/logo.png"
          alt="CustConnect"
          width={150}
          height={40}
          className="h-10 w-auto object-contain"
          priority
        />
      </div>
      <nav className="mt-5 flex-1 px-2 space-y-1">
        {navigation.map((item) => {
          // More precise active state detection
          let isActive = false;
          if (item.href === '/dashboard') {
            // For root dashboard, only match exact path
            isActive = pathname === item.href;
          } else {
            // For other routes, match exact or starts with
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
              className={`${isActive
                ? 'text-white border-l-4 border-white bg-white bg-opacity-10'
                : 'text-white hover:bg-white hover:bg-opacity-10'
                } group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200`}
            >
              <item.icon
                className={`text-white mr-3 flex-shrink-0 h-6 w-6 transition-colors duration-200`}
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
    <div className="flex-shrink-0 flex border-t border-white border-opacity-20 p-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center border-2 border-white border-opacity-30">
            <span className="text-sm font-medium text-white">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </span>
          </div>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-white">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-white text-opacity-80">{user?.university?.name}</p>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="ml-auto flex-shrink-0 p-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all duration-200"
        title="Logout"
      >
        <span className="sr-only">Logout</span>
        <ArrowRightOnRectangleIcon className="h-5 w-5 text-white" aria-hidden="true" />
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
          }`}
        aria-hidden={!mobileOpen}
      >
        <div
          className={`fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity ${mobileOpen ? 'opacity-100' : 'opacity-0'
            }`}
          onClick={onMobileClose}
        />
        <div
          className={`relative flex w-64 flex-1 flex-col bg-gray-800 h-full shadow-xl transition-transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={onMobileClose}
            >
              <span className="sr-only">Close sidebar</span>
              <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            {renderNav()}
          </div>
          {renderUserBlock()}
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40">
        <div className="flex-1 flex flex-col min-h-0 bg-gray-800">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            {renderNav(true)}
          </div>
          {renderUserBlock()}
        </div>
      </div>
    </>
  );
}