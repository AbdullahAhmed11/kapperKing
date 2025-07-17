import React, { useState , useEffect} from 'react';
import { Link } from 'react-router-dom';
// import { Logo } from './Logo'; // Remove Logo component import
import { useThemeStore } from '@/lib/theme';
// Import icons for navigation
import { Menu, X, Sparkles, Tag, Info, Mail } from 'lucide-react';

function MarketingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // const logoUrl = useThemeStore((state) => state.currentTheme.logoUrl); // Get logoUrl from store

  // Add icons to navigation data
  const navigation = [
    { name: 'Features', href: '/features', icon: Sparkles },
    { name: 'Pricing', href: '/pricing', icon: Tag },
    { name: 'About', href: '/about', icon: Info },
    { name: 'Contact', href: '/contact', icon: Mail },
  ];


  const [logoUrl, setLogoUrl] = useState<string | null>(null);

   useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await fetch('https://kapperking.runasp.net/api/SuperAdmin/GetBranding');
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const branding = await res.json();
        console.log('Branding API response:', branding);
        if (branding.logo) {
          setLogoUrl(branding.logo);
        }
      } catch (err) {
        console.error('Failed to fetch branding:', err);
      }
    };

    fetchBranding();
  }, []);

  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main flex container */}
        <div className="flex justify-between h-16">
          {/* Left side: Brand + Nav Links */}
          <div className="flex items-center">
            {/* Home/Brand Link with specific colors */}
     
             <Link to="/" className="flex items-center mr-10">
              {logoUrl ? (
                <img src={logoUrl} alt="Brand logo" className="h-8 w-auto" />
              ) : (
                <span className="text-xl font-bold font-heading hover:opacity-80 transition-opacity">
                  <span className="text-primary">Kapper</span>
                  <span className="text-gray-500">King</span>
                </span>
              )}
            </Link>
            {/* Navigation Links */}
            <div className="hidden lg:flex lg:items-center lg:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  // Add flex, items-center and icon
                  className="flex items-center text-sm font-semibold leading-6 text-gray-600 hover:text-gray-900"
                >
                  <item.icon className="h-4 w-4 mr-1.5" aria-hidden="true" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          {/* Right side: Action Buttons (kept from previous step) */}
          <div className="flex items-center">
            <div className="hidden lg:flex lg:items-center lg:space-x-6">
              {/* Restyled Sign in Button */}
              <Link
                to="/login"
                className="text-sm font-semibold leading-6 text-gray-700 hover:text-gray-900 px-3 py-1.5" // Adjusted padding/size
              >
                Log in <span aria-hidden="true">&rarr;</span> {/* Clearer Text */}
              </Link>
              {/* Restyled Start Trial Button - Link to Pricing Page */}
              <Link
                to="/pricing" // Link to pricing page instead of generic signup
                className="inline-flex items-center px-4 py-1.5 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary" // Use theme primary, adjusted padding/size
              >
                View Plans & Start Trial {/* Clearer Text */}
              </Link>
            </div>
            <div className="flex lg:hidden">
              <button
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {/* Mobile Home/Brand Link with specific colors */}
            <Link
              to="/"
              className="block px-3 py-2 text-lg font-bold font-heading hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)} // Close menu on click
            >
               <span className="text-primary">Kapper</span><span className="text-gray-500">King</span>
            </Link>
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                // Add flex, items-center and icon to mobile links
                className="flex items-center rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                onClick={() => setMobileMenuOpen(false)} // Close menu on click
              >
                 <item.icon className="h-5 w-5 mr-3 text-gray-500" aria-hidden="true" /> {/* Slightly larger icon for mobile */}
                 {item.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="space-y-1">
              <Link
                to="/login"
                className="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              >
                Sign in
              </Link>
              {/* Mobile Start Trial Button - Link to Pricing Page */}
              <Link
                to="/pricing" // Link to pricing page
                className="block px-3 py-2 text-base font-medium text-primary hover:text-primary/80 hover:bg-gray-50" // Use theme primary
                onClick={() => setMobileMenuOpen(false)} // Close menu
              >
                View Plans & Start Trial {/* Clearer Text */}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default MarketingNavbar;