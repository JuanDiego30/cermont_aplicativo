/**
 * ARCHIVO: evidencias/page.tsx
 * FUNCION: Server Component para gestión de evidencias fotográficas
 * IMPLEMENTACION: Renderiza header y carga dashboard con Suspense boundary
 * DEPENDENCIAS: React Suspense, lucide-react, @/features/evidencias, ./client
 * EXPORTS: EvidenciasPage (default), EvidenciasGridSkeleton
 */
import { Suspense } from 'react';
import { Camera } from 'lucide-react';
import { EvidenciaCardSkeleton } from '@/features/evidencias';
import { EvidenciasDashboard } from './client';

export const metadata = {
  title: 'Evidencias | Cermont',
  description: 'Gestión de evidencias fotográficas',
};

export default async function EvidenciasPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center">
          <Camera className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Evidencias
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestión de fotografías y documentación de trabajos
          </p>
        </div>
      </div>

      {/* Dashboard interactivo */}
      <Suspense fallback={<EvidenciasGridSkeleton />}>
        <EvidenciasDashboard />
      </Suspense>
    </div>
  );
}

function EvidenciasGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <EvidenciaCardSkeleton key={i} />
      ))}
    </div>
  );
}
