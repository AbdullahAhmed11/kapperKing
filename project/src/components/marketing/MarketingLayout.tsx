import React from 'react';
import { Outlet } from 'react-router-dom';
import MarketingNavbar from './MarketingNavbar';
import MarketingFooter from './MarketingFooter';

function MarketingLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNavbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <MarketingFooter />
    </div>
  );
}

export default MarketingLayout;