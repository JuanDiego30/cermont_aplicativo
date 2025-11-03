'use client';
import Image from 'next/image';
import { useAuth } from '@/features/auth/components/AuthContext';
import { Button } from '@/components/ui/button';

export default function Header() {
const { user, logout } = useAuth();
  return (
<header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-white/90 px-4 backdrop-blur">
<div className="flex items-center gap-3">
      <Image src="/logo-cermont.png" alt="CERMONT" width={160} height={40} className="h-8 w-auto sm:h-9" priority />
<span className="hidden text-sm text-gray-500 md:inline">ATG · Sistema de Gestión</span>
</div>
<div className="flex items-center gap-3">
<div className="text-right">
<p className="text-sm font-semibold">{user?.nombre}</p>
<p className="text-xs text-gray-500 uppercase">{user?.rol}</p>
</div>
<Button variant="outline" onClick={logout}>Cerrar sesión</Button>
</div>
</header>
);
}