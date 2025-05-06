import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Store, 
  CreditCard, 
  Settings,
  Users,
  MessageSquare,
  Palette,
  Globe,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Logo } from '@/components/marketing/Logo';
import { useAuth } from '@/lib/auth';

const navigation = [
  { name: 'Dashboard', href: '/platform', icon: LayoutDashboard },
  { name: 'Salons', href: '/platform/salons', icon: Store },
  { name: 'Clients', href: '/platform/clients', icon: Users },
  { name: 'Subscriptions', href: '/platform/subscriptions', icon: CreditCard },
  { name: 'Marketing', href: '/platform/marketing', icon: MessageSquare },
  { name: 'Website', href: '/platform/website', icon: Globe },
  { name: 'Appearance', href: '/platform/appearance', icon: Palette },
  { name: 'Settings', href: '/platform/settings', icon: Settings },
];

interface PlatformSidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

function PlatformSidebar({ isCollapsed, toggleSidebar }: PlatformSidebarProps) {
  const location = useLocation();
  const { signOut } = useAuth();
  
  return (
    <div 
      className={`
        fixed inset-y-0 left-0 z-20 flex flex-col 
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-64'} 
        transform lg:translate-x-0
        ${isCollapsed ? '-translate-x-full' : 'translate-x-0'} lg:static
      `}
    >
      <div className="flex flex-col flex-grow bg-indigo-900 pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center justify-between px-4">
          {!isCollapsed && <Logo className="text-white" />}
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded-md text-indigo-200 hover:bg-indigo-800 hover:text-white focus:outline-none"
          >
            {isCollapsed ? 
              <ChevronRight className="h-5 w-5" /> : 
              <ChevronLeft className="h-5 w-5" />
            }
          </button>
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
                    transition-all duration-200
                    ${isActive
                      ? 'bg-indigo-800 text-white'
                      : 'text-indigo-100 hover:bg-indigo-800 hover:text-white'
                    }
                  `}
                  title={isCollapsed ? item.name : ''}
                >
                  <item.icon
                    className={`
                      flex-shrink-0 h-5 w-5
                      ${isCollapsed ? 'mx-auto' : 'mr-3'}
                      ${isActive ? 'text-white' : 'text-indigo-300 group-hover:text-white'}
                    `}
                  />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>
        </nav>
        <div className="px-3 mt-auto">
          <button
            onClick={() => signOut()}
            className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-indigo-100 hover:bg-indigo-800 hover:text-white w-full"
            title={isCollapsed ? 'Sign Out' : ''}
          >
            <LogOut className={`flex-shrink-0 h-5 w-5 text-indigo-300 group-hover:text-white ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlatformSidebar;