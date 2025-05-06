import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import PlatformNavbar from './PlatformNavbar';
import PlatformSidebar from './PlatformSidebar';

function PlatformLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <PlatformSidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      {/* Main Content Wrapper - Use flex-1 to fill remaining space */}
      <div className="flex-1 flex flex-col">
        <PlatformNavbar toggleSidebar={toggleSidebar} />
        <main className="py-6 pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default PlatformLayout;