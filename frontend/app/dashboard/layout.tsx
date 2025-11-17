// app/dashboard/layout.tsx
'use client';

// ============================================================================
// IMPORTS
// ============================================================================
import React, { useState, type ReactNode } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';

// ============================================================================
// TYPES
// ============================================================================
type DashboardLayoutProps = {
  children: ReactNode;
};

// ============================================================================
// LAYOUT COMPONENT
// ============================================================================
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // ------------------------------------
  // State
  // ------------------------------------
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ------------------------------------
  // Handlers
  // ------------------------------------
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-900">
      {/* ========================================
          SECTION: Navbar
      ========================================== */}
      <Navbar onToggleSidebar={toggleSidebar} />

      <div className="flex flex-1">
        {/* ========================================
            SECTION: Desktop Sidebar
        ========================================== */}
        <div className="hidden md:block">
          <Sidebar variant="desktop" />
        </div>

        {/* ========================================
            SECTION: Mobile Sidebar
        ========================================== */}
        <Sidebar variant="mobile" isOpen={isSidebarOpen} onClose={closeSidebar} />

        {/* ========================================
            SECTION: Main Content
        ========================================== */}
        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto max-w-7xl px-6 py-8 md:px-8 md:py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}






