'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { href: '/dashboard', label: 'Inicio', icon: '🏠' },
  { href: '/dashboard/ordenes', label: 'Órdenes', icon: '📋' },
  { href: '/dashboard/planeacion', label: 'Planeación', icon: '📅' },
  { href: '/dashboard/ejecucion', label: 'Ejecución', icon: '🔧' },
  { href: '/dashboard/evidencias', label: 'Evidencias', icon: '📷' },
  { href: '/dashboard/costos', label: 'Costos', icon: '💰' },
  { href: '/dashboard/informes', label: 'Informes', icon: '📊' },
  { href: '/dashboard/config', label: 'Configuración', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden lg:block">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-blue-600">Cermont</h1>
        <p className="text-xs text-gray-500">Sistema de Gestión</p>
      </div>
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
