/**
 * ARCHIVO: app-sidebar.tsx
 * FUNCION: Sidebar de navegación con control de acceso basado en roles (RBAC)
 * IMPLEMENTACION: Filtra MENU_ITEMS según rol del usuario, incluye backdrop móvil integrado
 * DEPENDENCIAS: useUIStore, useAuth, usePathname, next/link, cn utility
 * EXPORTS: export function AppSidebar
 */
'use client';
import { useUIStore } from '@/stores';
import { useAuth } from '@/features/auth/hooks/use-auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

const MENU_ITEMS = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊', roles: ['admin', 'supervisor', 'tecnico'] },
    { label: 'Órdenes', href: '/dashboard/ordenes', icon: '📋', roles: ['admin', 'supervisor', 'tecnico'] },
    { label: 'Planeación', href: '/dashboard/planeacion', icon: '📅', roles: ['admin', 'supervisor'] },
    { label: 'Ejecución', href: '/dashboard/ejecucion', icon: '🔧', roles: ['tecnico', 'supervisor'] },
    { label: 'Evidencias', href: '/dashboard/evidencias', icon: '📸', roles: ['tecnico', 'supervisor'] },
    { label: 'Analytics', href: '/dashboard/analytics', icon: '📈', roles: ['admin', 'supervisor'] },
    { label: 'Kits Típicos', href: '/dashboard/kits', icon: '🛠️', roles: ['admin'] },
];

export function AppSidebar() {
    const { isMobileOpen, closeMobileSidebar } = useUIStore();
    const { user } = useAuth();
    const pathname = usePathname();

    const visibleItems = MENU_ITEMS.filter((item) =>
        user?.role ? item.roles.includes(user.role) : false
    );

    return (
        <>
            {/* Backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={closeMobileSidebar}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed inset-y-16 left-0 z-40 w-64 border-r border-gray-200 bg-white transition-transform duration-200 md:relative md:inset-auto md:translate-x-0',
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                )}
            >
                <nav className="space-y-1 p-4">
                    {visibleItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                                pathname === item.href
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                            )}
                        >
                            <span className="text-xl">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>
        </>
    );
}
