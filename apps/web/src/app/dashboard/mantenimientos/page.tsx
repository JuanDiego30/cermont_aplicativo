
/**
 * @file page.tsx
 * @description Página de mantenimientos - Server Component
 */

import { Suspense } from 'react';
import { MantenimientosDashboard } from '@/features/mantenimientos/components/MantenimientosDashboard';

export const metadata = {
  title: 'Mantenimientos | Cermont',
  description: 'Gestión de mantenimientos preventivos y correctivos',
};

export default function MantenimientosPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <MantenimientosDashboard />
    </Suspense>
  );
}
