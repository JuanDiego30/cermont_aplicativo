/**
 * @file page.tsx
 * @description Página de formularios - Server Component
 */

import { Suspense } from 'react';
import { FileText } from 'lucide-react';
import { PlantillaCardSkeleton } from '@/features/formularios';
import { FormulariosDashboard } from './client';

export const metadata = {
  title: 'Formularios | Cermont',
  description: 'Gestión de formularios dinámicos',
};

export default async function FormulariosPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Formularios
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Diseño y gestión de formularios dinámicos
          </p>
        </div>
      </div>

      {/* Dashboard interactivo */}
      <Suspense fallback={<FormulariosLoadingSkeleton />}>
        <FormulariosDashboard />
      </Suspense>
    </div>
  );
}

function FormulariosLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        ))}
      </div>
      
      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <PlantillaCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
