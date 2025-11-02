'use client';

import { useMemo, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Video,
  ClipboardList,
  Users,
  FileText,
  LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { cn } from '@/lib/utils';

interface NavItem {
  key: string;
  href: string;
  label: string;
  icon: LucideIcon;
}

const ROLE_PERMISSIONS: Record<string, string[]> = {
  root: ['dashboard', 'orders', 'cctv', 'workplans', 'users', 'reports'],
  admin: ['dashboard', 'orders', 'cctv', 'workplans', 'users', 'reports'],
  coordinator: ['dashboard', 'orders', 'cctv', 'workplans', 'reports'],
  supervisor: ['dashboard', 'orders', 'cctv', 'workplans'],
  engineer: ['dashboard', 'orders', 'cctv', 'workplans'],
  user: ['dashboard', 'orders'],
} as const;

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'orders', href: '/orders', label: 'Órdenes', icon: Package },
  { key: 'cctv', href: '/cctv', label: 'CCTV', icon: Video },
  { key: 'workplans', href: '/workplans', label: 'Planes de Trabajo', icon: ClipboardList },
  { key: 'users', href: '/users', label: 'Usuarios', icon: Users },
  { key: 'reports', href: '/reports', label: 'Reportes', icon: FileText },
];

interface SidebarLinkProps {
  item: NavItem;
  isActive: boolean;
}

const SidebarLink = memo(function SidebarLink({ item, isActive }: SidebarLinkProps) {
  const Icon = item.icon;
  
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{item.label}</span>
    </Link>
  );
});

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Memoizar los items permitidos según el rol del usuario
  const allowedItems = useMemo(() => {
    const userRole = user?.rol ?? 'user';
    const allowedKeys = ROLE_PERMISSIONS[userRole] ?? ROLE_PERMISSIONS.user;
    return NAV_ITEMS.filter((item) => allowedKeys.includes(item.key));
  }, [user?.rol]);

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card/50 p-4 backdrop-blur-sm md:block">
      <nav className="space-y-1">
        {allowedItems.map((item) => (
          <SidebarLink
            key={item.key}
            item={item}
            isActive={pathname === item.href}
          />
        ))}
      </nav>
    </aside>
  );
}