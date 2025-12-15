/**
 * ARCHIVO: layout.tsx (Dashboard Layout)
 * FUNCION: Layout raíz del dashboard que envuelve todas las páginas protegidas
 * IMPLEMENTACION: Combina ProtectedRoute, SidebarProvider, AppHeader, AppSidebar,
 *                 AsistenteIA, OfflineIndicator y ClickSpark con transiciones responsivas
 * DEPENDENCIAS: React, Next.js dynamic, SidebarContext, ProtectedRoute, layout components
 * EXPORTS: DashboardLayout (default)
 */
"use client";
import React from "react";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import dynamic from "next/dynamic";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import ClickSpark from "@/components/ClickSpark";

// Importar componentes dinámicos para evitar SSR
const AsistenteIA = dynamic(
  () => import("@/components/chat/AsistenteIA"),
  { ssr: false }
);

const OfflineIndicator = dynamic(
  () => import("@/components/offline/OfflineIndicator"),
  { ssr: false }
);

const QuickDock = dynamic(
  () => import("@/components/navigation/QuickDock").then(mod => ({ default: mod.QuickDock })),
  { ssr: false }
);

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

  return (
    <ClickSpark
      sparkColor="#3B82F6"
      sparkSize={8}
      sparkRadius={20}
      sparkCount={10}
      duration={350}
      easing="ease-out"
      extraScale={1.2}
    >
      <div className="min-h-screen xl:flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
        <AppSidebar />
        <Backdrop />
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
        >
          <AppHeader />
          <main className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
            {children}
          </main>
        </div>
        
        {/* Componentes globales flotantes */}
        <AsistenteIA />
        <OfflineIndicator />
        <QuickDock />
      </div>
    </ClickSpark>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
