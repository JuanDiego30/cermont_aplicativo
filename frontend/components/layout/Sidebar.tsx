// components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Package,
  CheckSquare,
  Users,
  Settings,
  X,
} from 'lucide-react';

type SidebarProps = {
  variant: 'desktop' | 'mobile';
  isOpen?: boolean;
  onClose?: () => void;
};

const menuItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Órdenes', href: '/orders', icon: FileText },
  { label: 'Kits', href: '/kits', icon: Package },
  { label: 'Checklists', href: '/checklists', icon: CheckSquare },
  { label: 'Usuarios', href: '/users', icon: Users },
  { label: 'Configuración', href: '/settings', icon: Settings },
];

export function Sidebar({ variant, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <nav className="flex flex-col gap-2 p-4">
      {menuItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={variant === 'mobile' ? onClose : undefined}
            className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              isActive
                ? 'bg-primary-500 text-white shadow-lg'
                : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
            }`}
          >
            <Icon
              className={`h-5 w-5 ${
                isActive ? 'text-white' : 'text-neutral-600 dark:text-neutral-400'
              }`}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  // Desktop Sidebar
  if (variant === 'desktop') {
    return (
      <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        {sidebarContent}
      </aside>
    );
  }

  // Mobile Sidebar
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-64 transform border-r border-neutral-200 bg-white transition-transform dark:border-neutral-800 dark:bg-neutral-950 md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-4 dark:border-neutral-800">
          <span className="font-bold text-neutral-900 dark:text-neutral-50">Menú</span>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {sidebarContent}
      </aside>
    </>
  );
}




