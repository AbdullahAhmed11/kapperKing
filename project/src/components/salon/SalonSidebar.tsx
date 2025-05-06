import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Scissors, 
  UserCircle,
  MessageSquare,
  BarChart,
  Settings,
  LogOut,
  Globe
} from 'lucide-react';
import { Logo } from '@/components/marketing/Logo';
import { useAuth } from '@/lib/auth';

const navigation = [
  { name: 'Dashboard', href: '/salon', icon: LayoutDashboard },
  { name: 'Appointments', href: '/salon/appointments', icon: Calendar },
  { name: 'Clients', href: '/salon/clients', icon: Users },
  { name: 'Services', href: '/salon/services', icon: Scissors },
  { name: 'Staff', href: '/salon/staff', icon: UserCircle },
  { name: 'Marketing', href: '/salon/marketing', icon: MessageSquare },
  { name: 'Website', href: '/salon/website', icon: Globe },
  { name: 'Reports', href: '/salon/reports', icon: BarChart },
  { name: 'Settings', href: '/salon/settings', icon: Settings },
];

function SalonSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();
  
  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-grow bg-indigo-900 pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <Logo className="text-white" />
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
                      ? 'bg-indigo-800 text-white' 
                      : 'text-indigo-100 hover:bg-indigo-800 hover:text-white'
                    }
                  `}
                >
                  <item.icon
                    className={`
                      mr-3 flex-shrink-0 h-5 w-5
                      ${isActive ? 'text-white' : 'text-indigo-300 group-hover:text-white'}
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
            onClick={() => signOut()}
            className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-indigo-100 hover:bg-indigo-800 hover:text-white w-full"
          >
            <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-indigo-300 group-hover:text-white" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default SalonSidebar;