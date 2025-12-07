'use client';

import { AppSidebar, AppHeader, Backdrop } from '@/components/layout';
import { useUIStore, useInitializeTheme } from '@/stores/uiStore';
import { useEffect } from 'react';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useUIStore();
  
  // Initialize theme on mount
  useInitializeTheme();

  // Dynamic margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? 'ml-0'
    : isExpanded || isHovered
    ? 'lg:ml-[280px]'
    : 'lg:ml-[80px]';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppSidebar />
      <Backdrop />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
        <AppHeader />
        <main className="p-4 md:p-6 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardContent>{children}</DashboardContent>;
}
