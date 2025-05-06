import React from 'react';
import { Outlet } from 'react-router-dom';
import SalonNavbar from './SalonNavbar';
import SalonSidebar from './SalonSidebar';

function SalonLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
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