'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const dashboardRoutes = [
    '/dashboard',
    '/lessons',
    '/learn-with-ai',
    '/exercises',
    '/placement-test',
    '/reviews',
    '/challenges',
    '/games',
    '/attar-game',
    '/badges',
    '/virtual-class',
    '/library',
    '/parent',
  ];

  const showSidebar = dashboardRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  if (showSidebar) {
    const isChatRoute = pathname.startsWith('/learn-with-ai');

    return (
      <div 
        className={isChatRoute ? "h-screen w-screen flex flex-col md:flex-row relative overflow-hidden" : "min-h-screen flex flex-col md:flex-row relative"} 
        style={{ background: 'linear-gradient(180deg, var(--color-bg) 0%, var(--color-bg2) 100%)' }}
      >
        {/* Background decorative blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5"
            style={{ background: 'radial-gradient(circle, #7C3AED, transparent)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-5"
            style={{ background: 'radial-gradient(circle, #06B6D4, transparent)', transform: 'translate(-30%, 30%)' }} />
        </div>

        <Sidebar />

        <div className={isChatRoute ? "flex-1 flex flex-col h-full overflow-hidden relative" : "flex-1 flex flex-col min-h-screen overflow-x-hidden"}>
          {children}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
