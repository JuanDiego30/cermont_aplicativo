/**
 * ARCHIVO: ejecucion/client.tsx
 * FUNCION: Dashboard de ejecución con columnas Kanban (progreso/pausadas/finalizadas)
 * IMPLEMENTACION: Agrupa ejecuciones por estado, acciones pausar/reanudar/finalizar
 * DEPENDENCIAS: next/navigation, @/features/ejecucion (hooks y componentes)
 * EXPORTS: EjecucionDashboard
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

export function EjecucionDashboard() {
  const router = useRouter();
  const { data, isLoading } = useMisEjecuciones();
  const pausarMutation = usePausarEjecucion();
  const reanudarMutation = useReanudarEjecucion();
  const finalizarMutation = useFinalizarEjecucion();

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-500">
        Cargando ejecuciones...
      </div>
    );
  }

  const ejecuciones = data || [];
  const enProgreso = ejecuciones.filter(e => e.estado === 'en_progreso');
  const pausadas = ejecuciones.filter(e => e.estado === 'pausada');
  const finalizadas = ejecuciones.filter(e => e.estado === 'completada');

  if (ejecuciones.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-gray-500 mb-2">Sin ejecuciones activas</p>
        <p className="text-sm text-gray-400">
          Las órdenes en ejecución aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* En Progreso */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          En Progreso ({enProgreso.length})
        </h3>
        <div className="space-y-4">
          {enProgreso.map((ejecucion) => (
            <EjecucionCard
              key={ejecucion.id}
              ejecucion={ejecucion}
              onPause={() => pausarMutation.mutate({ id: ejecucion.id, motivo: 'Pausado por usuario' })}
              onFinish={() => finalizarMutation.mutate(ejecucion.id)}
              onView={() => router.push(`/dashboard/ejecucion/${ejecucion.id}`)}
            />
          ))}
          {enProgreso.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">Sin órdenes</p>
          )}
        </div>
      </div>

      {/* Pausadas */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-500" />
          Pausadas ({pausadas.length})
        </h3>
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
            <p className="text-sm text-gray-400 text-center py-4">Sin órdenes</p>
          )}
        </div>
      </div>

      {/* Finalizadas hoy */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Finalizadas Hoy ({finalizadas.length})
        </h3>
        <div className="space-y-4">
          {finalizadas.slice(0, 5).map((ejecucion) => (
            <EjecucionCard
              key={ejecucion.id}
              ejecucion={ejecucion}
              onView={() => router.push(`/dashboard/ejecucion/${ejecucion.id}`)}
            />
          ))}
          {finalizadas.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">Sin órdenes</p>
          )}
        </div>
      </div>
    </div>
  );
}
