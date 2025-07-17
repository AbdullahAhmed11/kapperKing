import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Store, 
  CreditCard, 
  Settings, // Keep Settings icon for Platform Settings
  User, // Add User icon for Account Settings
  Users,
  MessageSquare,
  Palette,
  Globe,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
// import { Logo } from '@/components/marketing/Logo'; // Remove Logo import
import { useAuth } from '@/lib/auth';
import { useThemeStore } from '@/lib/theme'; // Import theme store
import axios from 'axios';
import { get } from 'http';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
const navigation = [
  { name: 'Dashboard', href: '/platform', icon: LayoutDashboard },
  { name: 'Salons', href: '/platform/salons', icon: Store },
  { name: 'Clients', href: '/platform/clients', icon: Users },
  { name: 'Subscriptions', href: '/platform/subscriptions', icon: CreditCard },
  { name: 'Marketing', href: '/platform/marketing', icon: MessageSquare },
  { name: 'Website', href: '/platform/website', icon: Globe },
  { name: 'Appearance', href: '/platform/appearance', icon: Palette },
  { name: 'Account', href: '/platform/account', icon: User }, // Add Account link
  { name: 'Platform Settings', href: '/platform/settings', icon: Settings }, // Rename Settings
];

interface PlatformSidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

function PlatformSidebar({ isCollapsed, toggleSidebar }: PlatformSidebarProps) {
    const navigate = useNavigate()
  
  const location = useLocation();
  const { signOut } = useAuth();
  const { dashboardSidebarColor, dashboardLogoUrl, dashboardSidebarTextColor } = useThemeStore((state) => state.currentTheme);
  interface Branding {
    sideBarLogo?: string;
    // Add other branding properties if needed
  }
  interface ColorPalette {
    dashboardSidebarBG?: string;
  }
  const [branding, setBranding] = useState<Branding | null>(null)
  const [colorPalette, setColorPalette] = useState<ColorPalette | null>(null);

  const GetBranding = async () => {
    try {
      const response = await axios.get(`https://kapperking.runasp.net/api/SuperAdmin/GetBranding`)
      setBranding(response.data);
    }catch (error) {
      console.error('Error fetching branding:', error);
    }
  }

  const GetColorPalette = async () => {
    try {
      const response =  await axios.get(`https://kapperking.runasp.net/api/SuperAdmin/GetColorPalette`)
      setColorPalette(response.data);
    }catch (error) {
      console.error('Error fetching color palette:', error);
    }
   }

  useEffect(() => {
    GetBranding();
    GetColorPalette();
  },[])
   const handleLogout = async () => {
    try {
      Cookies.remove('salonUser'); // Remove salonUser cookie
      navigate('/login'); // Redirect to login page
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
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
      {/* Apply dynamic background color via inline style */}
      <div
        className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto"
        style={{ backgroundColor: colorPalette?.dashboardSidebarBG || '#1F2937' }} // Fallback color
      >
        {/* Adjust container: Add fixed height, center when collapsed */}
        {/* Adjust container: Add fixed height, center items */}
        <div className={`flex items-center h-16 px-4 ${isCollapsed ? 'justify-center' : 'justify-start'}`}> {/* Changed justify-between to justify-start */}
          {/* Logo Wrapper - Takes full width in its area, hidden when collapsed */}
          <div className={`w-full pr-4 ${isCollapsed ? 'hidden' : 'block'}`}> {/* Added w-full, pr-4 to give space for button */}
             <img
               src={branding?.sideBarLogo || '/logos/dashboard-logo.png'}
               alt="Dashboard Logo11"
               // Style for responsive, contained logo:
               className="block w-full max-h-12 object-contain mx-auto"
             />
          </div>
          {/* Toggle Button - Always visible now for collapsing */}
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
                      ? 'bg-indigo-800 text-white' // Keep active state distinct for now
                      : 'hover:bg-indigo-800 hover:text-white' // Remove default text color
                    }
                  `}
                  style={!isActive ? { color: dashboardSidebarTextColor || '#D1D5DB' } : {}} // Apply dynamic text color to icon if not active
                  title={isCollapsed ? item.name : ''}
                >
                  <item.icon
                    className={`
                      flex-shrink-0 h-5 w-5
                      ${isCollapsed ? 'mx-auto' : 'mr-3'}
                      {/* Active icon remains white, inactive uses sidebar text color */}
                      ${isActive ? 'text-white' : 'group-hover:text-white'}
                    `}
                  />
                  {!isCollapsed && <span style={!isActive ? { color: dashboardSidebarTextColor || '#D1D5DB' } : {}}>{item.name}</span>} {/* Apply color to text */}
                </Link>
              );
            })}
          </div>
        </nav>
        <div className="px-3 mt-auto">
          <button
            onClick={handleLogout}
            className="group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-indigo-800 hover:text-white w-full" // Remove default text color
            style={{ color: dashboardSidebarTextColor || '#D1D5DB' }} // Apply dynamic text color
            title={isCollapsed ? 'Sign Out' : ''}
          >
            <LogOut
              className={`flex-shrink-0 h-5 w-5 group-hover:text-white ${isCollapsed ? 'mx-auto' : 'mr-3'}`}
              style={{ color: dashboardSidebarTextColor || '#D1D5DB' }} // Apply dynamic text color to icon
            />
            {!isCollapsed && <span style={{ color: dashboardSidebarTextColor || '#D1D5DB' }}>Sign Out</span>} {/* Apply color to text */}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlatformSidebar;