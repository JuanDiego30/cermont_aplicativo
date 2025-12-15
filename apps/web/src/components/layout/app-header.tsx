/**
 * ARCHIVO: app-header.tsx
 * FUNCION: Header principal simplificado con logo, toggle sidebar y botón logout
 * IMPLEMENTACION: Componente stateless que usa hooks de auth y UI store
 * DEPENDENCIAS: useAuth, useUIStore, Button, next/link
 * EXPORTS: export function AppHeader
 */
'use client';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useUIStore } from '@/stores';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export function AppHeader() {
    const { user, logout } = useAuth();
    const { toggleSidebar } = useUIStore();

    return (
        <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6">
                {/* Left */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 hover:bg-gray-100 rounded-lg md:hidden"
                        aria-label="Toggle sidebar"
                    >
                        ☰
                    </button>
                    <Link href="/dashboard" className="font-bold text-xl text-blue-600">
                        CERMONT
                    </Link>
                </div>

                {/* Right */}
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                        {user?.name}
                    </div>

                    <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                        {user?.name?.charAt(0)}
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => logout()}
                    >
                        Salir
                    </Button>
                </div>
            </div>
        </header>
    );
}
