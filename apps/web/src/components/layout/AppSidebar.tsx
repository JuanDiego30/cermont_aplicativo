/**
 * ARCHIVO: AppSidebar.tsx
 * FUNCION: Sidebar de navegación expandible/colapsable con submenús y hover
 * IMPLEMENTACION: Renderiza navItems con soporte de submenús, hover expansion y responsive
 * DEPENDENCIAS: useUIStore, usePathname, next/link, next/image, iconos personalizados
 * EXPORTS: export default AppSidebar
 * @deprecated Usar app-sidebar.tsx en su lugar (versión con RBAC)
 */
'use client';
import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/stores/uiStore';
import {
  GridIcon,
  OrdersIcon,
  CalendarIcon,
  ExecutionIcon,
  CostsIcon,
  ReportsIcon,
  EvidenceIcon,
  SettingsIcon,
  ChevronDownIcon,
  HorizontalDotsIcon,
} from '@/components/icons';

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: 'Dashboard',
    path: '/dashboard',
  },
  {
    icon: <OrdersIcon />,
    name: 'Órdenes',
    path: '/dashboard/ordenes',
  },
  {
    icon: <CalendarIcon />,
    name: 'Planeación',
    path: '/dashboard/planeacion',
  },
  {
    icon: <ExecutionIcon />,
    name: 'Ejecución',
    path: '/dashboard/ejecucion',
  },
  {
    icon: <CalendarIcon />,
    name: 'Calendario',
    path: '/dashboard/calendario',
  },
  {
    icon: <CostsIcon />,
    name: 'Costos',
    path: '/dashboard/costos',
  },
  {
    icon: <ReportsIcon />,
    name: 'Informes',
    path: '/dashboard/informes',
  },
  {
    icon: <EvidenceIcon />,
    name: 'Evidencias',
    path: '/dashboard/evidencias',
  },
];

const othersItems: NavItem[] = [
  {
    icon: <SettingsIcon />,
    name: 'Configuración',
    path: '/dashboard/config',
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useUIStore();
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<{
    type: 'main' | 'others';
    index: number;
  } | null>(null);

  const isActive = useCallback((path: string) => pathname === path, [pathname]);

  const handleSubmenuToggle = (index: number, menuType: 'main' | 'others') => {
    setOpenSubmenu((prev) =>
      prev?.type === menuType && prev?.index === index
        ? null
        : { type: menuType, index }
    );
  };

  const renderMenuItems = (navItems: NavItem[], menuType: 'main' | 'others') => (
    <ul className="flex flex-col gap-2">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <>
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5'
                  } ${!isExpanded && !isHovered ? 'lg:justify-center' : 'lg:justify-start'}`}
              >
                <span className="w-6 h-6">{nav.icon}</span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <>
                    <span className="flex-1">{nav.name}</span>
                    <ChevronDownIcon
                      className={`w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType && openSubmenu?.index === index
                        ? 'rotate-180'
                        : ''
                        }`}
                    />
                  </>
                )}
              </button>
              {(isExpanded || isHovered || isMobileOpen) && openSubmenu?.type === menuType && openSubmenu?.index === index && (
                <ul className="mt-1 ml-6 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                  {nav.subItems.map((subItem) => (
                    <li key={subItem.name}>
                      <Link
                        href={subItem.path}
                        className={`block px-4 py-2 rounded-lg text-sm transition-colors ${isActive(subItem.path)
                          ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10'
                          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white'
                          }`}
                      >
                        {subItem.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(nav.path)
                  ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5'
                  } ${!isExpanded && !isHovered ? 'lg:justify-center' : 'lg:justify-start'}`}
              >
                <span className="w-6 h-6">{nav.icon}</span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span>{nav.name}</span>
                )}
              </Link>
            )
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-4 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen ? 'w-70' : isHovered ? 'w-70' : 'w-20'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div className={`py-6 flex ${!isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'}`}>
        <Link href="/dashboard" className="flex items-center gap-3">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex items-center gap-2">
              <div className="relative w-10 h-10">
                <Image
                  src="/logo.svg"
                  alt="Cermont Logo"
                  fill
                  priority
                  className="object-contain"
                  style={{ width: 'auto', height: 'auto' }}
                />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Cermont</span>
            </div>
          ) : (
            <div className="relative w-10 h-10">
              <Image
                src="/logo.svg"
                alt="Cermont Logo"
                fill
                priority
                className="object-contain"
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar">
        <nav className="flex-1">
          <div className="space-y-6">
            {/* Main Menu */}
            <div>
              <h2 className={`mb-3 px-4 text-xs uppercase font-semibold text-gray-400 ${!isExpanded && !isHovered ? 'lg:text-center' : ''}`}>
                {isExpanded || isHovered || isMobileOpen ? 'Menú' : <HorizontalDotsIcon className="w-5 h-5 mx-auto" />}
              </h2>
              {renderMenuItems(navItems, 'main')}
            </div>

            {/* Others Menu */}
            <div>
              <h2 className={`mb-3 px-4 text-xs uppercase font-semibold text-gray-400 ${!isExpanded && !isHovered ? 'lg:text-center' : ''}`}>
                {isExpanded || isHovered || isMobileOpen ? 'Otros' : <HorizontalDotsIcon className="w-5 h-5 mx-auto" />}
              </h2>
              {renderMenuItems(othersItems, 'others')}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
