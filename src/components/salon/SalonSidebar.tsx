import React from 'react';
import { Link, useLocation } from 'react-router-dom';
// Removed duplicate import below
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  CreditCard, // Import CreditCard icon
  UserCircle,
  MessageSquare,
  BarChart,
  Settings,
  LogOut,
  Globe,
  Package, // Keep Package icon
  Star // Import Star icon
} from 'lucide-react';
import { Logo } from '@/components/marketing/Logo'; // Keep one Logo import
import { useAuth } from '@/lib/auth';
import { useCurrentSalonStore } from '@/lib/store/currentSalon'; // Import salon store

const navigation = [
  { name: 'Dashboard', href: '/salon', icon: LayoutDashboard },
  { name: 'Appointments', href: '/salon/appointments', icon: Calendar },
  { name: 'Clients', href: '/salon/clients', icon: Users },
  { name: 'Services', href: '/salon/services', icon: Scissors },
  { name: 'Products', href: '/salon/products', icon: Package },
  { name: 'Staff', href: '/salon/staff', icon: UserCircle },
  { name: 'Loyalty', href: '/salon/loyalty', icon: Star }, // Add Loyalty link
  { name: 'Marketing', href: '/salon/marketing', icon: MessageSquare },
  { name: 'Website', href: '/salon/website', icon: Globe },
  { name: 'Reports', href: '/salon/reports', icon: BarChart },
  { name: 'Subscription', href: '/salon/subscription', icon: CreditCard }, // Add Subscription link
  { name: 'Settings', href: '/salon/settings', icon: Settings },
];

function SalonSidebar() {
  const location = useLocation();
  const { logout } = useAuth(); // Use 'logout' instead of 'signOut'
  const { currentSalon } = useCurrentSalonStore(); // Get salon data
  
  return (
    // Use dashboard-primary for background
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:pt-5 lg:pb-4 bg-dashboard-primary">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-6 h-10 mb-5">
          {/* Display Salon Logo or Name */}
          {currentSalon?.logo_url ? (
             <img src={currentSalon.logo_url} alt={currentSalon.name} className="h-10 w-auto" />
          ) : currentSalon?.name ? (
             <span className="text-white text-xl font-bold">{currentSalon.name}</span>
          ) : (
             <Logo size="sm"/> // Removed colorScheme prop
          )}
        </div>
        <nav className="mt-8 flex-1 flex flex-col">
          <div className="px-3 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md
                    ${isActive
                      ? 'bg-black/20 text-white' // Use subtle background for active
                      : 'text-indigo-100 hover:text-white hover:bg-black/10' // Adjust text/hover colors
                    }
                  `}
                >
                  <item.icon
                    className={`
                      mr-3 flex-shrink-0 h-5 w-5
                      ${isActive ? 'text-white' : 'text-indigo-100 group-hover:text-white'} {/* Adjust inactive icon color */}
                    `}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
        <div className="px-3 mt-auto">
          <button
            onClick={logout} // Call logout
            className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-indigo-100 hover:bg-indigo-800 hover:text-white w-full"
          >
            <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-indigo-100 group-hover:text-white" /> {/* Adjust icon color */}
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default SalonSidebar;