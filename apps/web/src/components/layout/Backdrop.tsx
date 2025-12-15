/**
 * ARCHIVO: Backdrop.tsx
 * FUNCION: Overlay oscuro para sidebar móvil que cierra el menú al hacer clic
 * IMPLEMENTACION: Renderizado condicional basado en isMobileOpen del store UI
 * DEPENDENCIAS: useUIStore
 * EXPORTS: export default Backdrop
 */
'use client';
import React from 'react';
import { useUIStore } from '@/stores/uiStore';
const Backdrop: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useUIStore();
  if (!isMobileOpen) return null;
  return (
    <div
      className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
      onClick={toggleMobileSidebar}
    />
  );
};
export default Backdrop;
