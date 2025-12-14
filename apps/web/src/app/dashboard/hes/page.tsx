/**
 * @file page.tsx
 * @description Página de seguridad en alturas (HES) - Server Component
 */

import { Suspense } from 'react';
import { Shield } from 'lucide-react';
import { EquipoHESCardSkeleton } from '@/features/hes';
import { HESDashboard } from './client';

export const metadata = {
  title: 'Seguridad en Alturas (HES) | Cermont',
  description: 'Gestión de inspecciones y equipos de seguridad',
};

export default async function HESPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Seguridad en Alturas (HES)
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestión de inspecciones y equipos de seguridad
          </p>
        </div>
      </div>

      {/* Dashboard interactivo */}
      <Suspense fallback={<HESLoadingSkeleton />}>
        <HESDashboard />
      </Suspense>
    </div>
  );
}

function HESLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Módulos skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        ))}
      </div>
      
      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <EquipoHESCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
