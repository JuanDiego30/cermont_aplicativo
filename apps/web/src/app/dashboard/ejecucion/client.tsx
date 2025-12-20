/**
 * @file client.tsx
 * @description Componentes client para ejecución
 */

'use client';

import { useRouter } from 'next/navigation';
import {
  useMisEjecuciones,
  EjecucionCard,
  usePausarEjecucion,
  useReanudarEjecucion,
  useFinalizarEjecucion
} from '@/features/ejecucion';
import { Card } from '@/components/ui/Card';
import { Play } from 'lucide-react';

export function EjecucionDashboard() {
  const router = useRouter();
  const { data, isLoading } = useMisEjecuciones();
  const pausarMutation = usePausarEjecucion();
  const reanudarMutation = useReanudarEjecucion();
  const finalizarMutation = useFinalizarEjecucion();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  const ejecuciones = data || [];
  const enProgreso = ejecuciones.filter(e => e.estado === 'en_progreso');
  const pausadas = ejecuciones.filter(e => e.estado === 'pausada');
  const finalizadas = ejecuciones.filter(e => e.estado === 'completada');

  if (ejecuciones.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <Play className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Sin ejecuciones activas
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Las órdenes en ejecución aparecerán aquí cuando se inicien trabajos en campo
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* En Progreso */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            En Progreso ({enProgreso.length})
          </h3>
        </div>
        <div className="space-y-4">
          {enProgreso.map((ejecucion) => (
            <EjecucionCard
              key={ejecucion.id}
              ejecucion={ejecucion}
              onPause={() => pausarMutation.mutate({ id: ejecucion.id, motivo: 'Pausado por usuario' })}
              onFinish={() => finalizarMutation.mutate({ id: ejecucion.id })}
              onView={() => router.push(`/dashboard/ejecucion/${ejecucion.id}`)}
            />
          ))}
          {enProgreso.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-sm text-gray-400">Sin órdenes en progreso</p>
            </Card>
          )}
        </div>
      </div>

      {/* Pausadas */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Pausadas ({pausadas.length})
          </h3>
        </div>
        <div className="space-y-4">
          {pausadas.map((ejecucion) => (
            <EjecucionCard
              key={ejecucion.id}
              ejecucion={ejecucion}
              onResume={() => reanudarMutation.mutate(ejecucion.id)}
              onView={() => router.push(`/dashboard/ejecucion/${ejecucion.id}`)}
            />
          ))}
          {pausadas.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-sm text-gray-400">Sin órdenes pausadas</p>
            </Card>
          )}
        </div>
      </div>

      {/* Finalizadas hoy */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Finalizadas Hoy ({finalizadas.length})
          </h3>
        </div>
        <div className="space-y-4">
          {finalizadas.slice(0, 5).map((ejecucion) => (
            <EjecucionCard
              key={ejecucion.id}
              ejecucion={ejecucion}
              onView={() => router.push(`/dashboard/ejecucion/${ejecucion.id}`)}
            />
          ))}
          {finalizadas.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-sm text-gray-400">Sin órdenes finalizadas hoy</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
