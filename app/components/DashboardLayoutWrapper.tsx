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
        style={{ background: 'linear-gradient(180deg, #FDF8F3 0%, #F9F1E8 100%)' }}
      >
        {/* Soft pastel ambient background blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div 
            className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full opacity-30 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(242, 181, 200, 0.4) 0%, rgba(253, 222, 207, 0.2) 60%, transparent 80%)' }} 
          />
          <div 
            className="absolute bottom-10 left-0 w-[450px] h-[450px] rounded-full opacity-30 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(149, 197, 178, 0.4) 0%, rgba(126, 181, 214, 0.2) 60%, transparent 80%)' }} 
          />
        </div>

        <Sidebar />

        <div className={isChatRoute ? "flex-1 flex flex-col h-full overflow-hidden relative z-10" : "flex-1 flex flex-col min-h-screen overflow-x-hidden relative z-10"}>
          {children}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
