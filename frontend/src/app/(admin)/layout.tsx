"use client";

import { useSidebar } from "@/core/providers";
import { useAuth } from "@/features/auth";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import dynamic from "next/dynamic";

// Lazy load floating widgets
const FloatingAssistant = dynamic(
  () => import("@/components/ui/FloatingAssistant"),
  { ssr: false }
);
const FloatingWeather = dynamic(
  () => import("@/components/ui/FloatingWeather"),
  { ssr: false }
);
const OfflineIndicator = dynamic(
  () => import("@/components/ui/OfflineIndicator"),
  { ssr: false }
);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { isAuthenticated, isLoading, isInitialized } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/signin');
    }
  }, [isInitialized, isAuthenticated, router]);

  // Show loading state while checking authentication
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render the layout
  if (!isAuthenticated) {
    return null;
  }

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <main id="main-content" className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          {children}
        </main>
      </div>

      {/* Floating Widgets */}
      <FloatingWeather />
      <FloatingAssistant />
      
      {/* Offline Status Indicator */}
      <OfflineIndicator />
    </div>
  );
}
