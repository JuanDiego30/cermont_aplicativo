/**
 * ARCHIVO: QuickDock.tsx
 * FUNCION: Dock de navegación rápida estilo macOS para móviles
 * IMPLEMENTACION: Client Component usando Dock de react-bits, visible solo en móvil/tablet
 * DEPENDENCIAS: @/components/Dock, lucide-react, next/navigation
 * EXPORTS: QuickDock
 */
'use client';

import { useRouter } from 'next/navigation';
import Dock from '@/components/Dock';
import {
  Home,
  ClipboardList,
  Calendar,
  Wrench,
  Users,
  BarChart3,
  Package,
  Settings,
} from 'lucide-react';

export function QuickDock() {
  const router = useRouter();

  const dockItems = [
    {
      icon: <Home className="w-5 h-5 text-white" />,
      label: 'Inicio',
      onClick: () => router.push('/dashboard'),
    },
    {
      icon: <ClipboardList className="w-5 h-5 text-white" />,
      label: 'Órdenes',
      onClick: () => router.push('/dashboard/ordenes'),
    },
    {
      icon: <Calendar className="w-5 h-5 text-white" />,
      label: 'Planeación',
      onClick: () => router.push('/dashboard/planeacion'),
    },
    {
      icon: <Wrench className="w-5 h-5 text-white" />,
      label: 'Ejecución',
      onClick: () => router.push('/dashboard/mantenimientos'),
    },
    {
      icon: <Package className="w-5 h-5 text-white" />,
      label: 'Kits',
      onClick: () => router.push('/dashboard/kits'),
    },
    {
      icon: <Users className="w-5 h-5 text-white" />,
      label: 'Técnicos',
      onClick: () => router.push('/dashboard/tecnicos'),
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-white" />,
      label: 'Reportes',
      onClick: () => router.push('/dashboard/reportes'),
    },
    {
      icon: <Settings className="w-5 h-5 text-white" />,
      label: 'Config',
      onClick: () => router.push('/dashboard/config'),
    },
  ];

  return (
    <>
      {/* Dock visible solo en móvil y tablet (lg hacia abajo) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 lg:hidden">
        <Dock
          items={dockItems}
          panelHeight={60}
          baseItemSize={42}
          magnification={58}
          distance={100}
          spring={{ mass: 0.1, stiffness: 150, damping: 12 }}
          className="backdrop-blur-xl bg-gray-900/90 dark:bg-gray-800/95 border border-gray-700/50 rounded-2xl shadow-2xl px-3"
        />
      </div>
      {/* Espaciador para que el contenido no quede debajo del dock en móvil */}
      <div className="h-20 lg:hidden" />
    </>
  );
}
