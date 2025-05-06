import React, { useEffect } from 'react'; // Import useEffect
import { Outlet } from 'react-router-dom';
import SalonNavbar from './SalonNavbar';
import SalonSidebar from './SalonSidebar';
import { useAuth } from '@/lib/auth'; // Import useAuth
import { useCurrentSalonStore } from '@/lib/store/currentSalon'; // Import the new store

function SalonLayout() {
  const { user, loading: authLoading } = useAuth(); // Get user and auth loading state
  // Get salon data including dashboard colors
  const { currentSalon, fetchCurrentSalon, clearCurrentSalon, loading: salonLoading } = useCurrentSalonStore(
     (state) => ({
        currentSalon: state.currentSalon, // Get the salon object
        fetchCurrentSalon: state.fetchCurrentSalon,
        clearCurrentSalon: state.clearCurrentSalon,
        loading: state.loading
     })
  );
  // Removed duplicate declaration below

  useEffect(() => {
    // Only fetch if auth is not loading anymore
    if (!authLoading) {
      if (user?.id) {
        console.log(`SalonLayout: Auth loaded, fetching salon for user ${user.id}`);
        fetchCurrentSalon(user.id);
      } else {
        // Clear salon if user logs out or is not available after auth check
        console.log("SalonLayout: Auth loaded, clearing current salon (no user)");
        clearCurrentSalon();
      }
    }
  }, [authLoading, user?.id, fetchCurrentSalon, clearCurrentSalon]);

  // Apply dashboard theme colors as CSS variables
  useEffect(() => {
     const root = document.documentElement;
     const primaryColor = currentSalon?.dashboard_primary_color || '#4f46e5'; // Default Indigo
     const secondaryColor = currentSalon?.dashboard_secondary_color || '#ec4899'; // Default Pink
     
     root.style.setProperty('--dashboard-primary', primaryColor);
     root.style.setProperty('--dashboard-secondary', secondaryColor);
     
     // TODO: Potentially generate text contrast color based on primary?
     // For now, assume light text on dark primary, dark text on light primary
     // This is a complex problem, might need a library or simpler approach
     // Example: Basic check (adjust threshold as needed)
     // const primaryIsDark = isColorDark(primaryColor);
     // root.style.setProperty('--dashboard-primary-text', primaryIsDark ? '#FFFFFF' : '#111827');

  }, [currentSalon?.dashboard_primary_color, currentSalon?.dashboard_secondary_color]);

  // Optional: Show loading indicator
  // if (authLoading || salonLoading) {
  //    return <div className="min-h-screen flex items-center justify-center">Loading Salon Data...</div>;
  // }
  return (
    // Apply a class to the root div if needed for scoping theme variables
    <div className="min-h-screen bg-gray-50 salon-dashboard-theme">
      {/* Left Sidebar */}
      <SalonSidebar />

      {/* Main Content */}
      <div className="lg:pl-64">
        <SalonNavbar />
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default SalonLayout;