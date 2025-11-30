'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  ClipboardList, 
  FolderOpen, 
  User,
  Plus
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Inicio',
    icon: <LayoutDashboard className="w-6 h-6" />,
  },
  {
    href: '/orders',
    label: 'Órdenes',
    icon: <ClipboardList className="w-6 h-6" />,
  },
  {
    href: '/orders/new',
    label: 'Nueva',
    icon: <Plus className="w-6 h-6" />,
  },
  {
    href: '/workplans',
    label: 'Planes',
    icon: <FolderOpen className="w-6 h-6" />,
  },
  {
    href: '/profile',
    label: 'Perfil',
    icon: <User className="w-6 h-6" />,
  },
];

export function BottomNavigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    if (href === '/orders/new') {
      return pathname === '/orders/new';
    }
    return pathname.startsWith(href) && href !== '/orders/new';
  };

  return (
    <>
      {/* Spacer para evitar que el contenido quede debajo del nav */}
      <div className="h-16 md:hidden" />
      
      {/* Bottom Navigation - Solo visible en móviles */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const isNewButton = item.href === '/orders/new';
            
            if (isNewButton) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center -mt-6"
                >
                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-brand-500 text-white shadow-lg hover:bg-brand-600 active:scale-95 transition-all">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-medium text-brand-600 dark:text-brand-400 mt-1">
                    {item.label}
                  </span>
                </Link>
              );
            }
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
                  active 
                    ? 'text-brand-600 dark:text-brand-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className={`relative ${active ? 'scale-110' : ''} transition-transform`}>
                  {item.icon}
                  {active && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-500" />
                  )}
                </div>
                <span className={`text-[10px] font-medium mt-1 ${active ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export default BottomNavigation;
