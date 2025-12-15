/**
 * ARCHIVO: OrderStats.tsx
 * FUNCION: Dashboard de estadísticas de órdenes (total, pendientes, en progreso, completadas)
 * IMPLEMENTACION: Usa useOrderStats hook, renderiza grid de StatCards con colores
 * DEPENDENCIAS: useOrderStats hook
 * EXPORTS: OrderStats (componente React)
 */
'use client';
import { useOrderStats } from '../hooks/use-orders';

interface StatCardProps {
  label: string;
  value: number;
  color: string;
  icon?: React.ReactNode;
}

function StatCard({ label, value, color, icon }: StatCardProps) {
  return (
    <div className={`p-4 rounded-lg border-l-4 ${color} bg-white dark:bg-gray-800 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
    </div>
  );
}

export function OrderStats() {
  const { data: stats, isLoading, error } = useOrderStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        No se pudieron cargar las estadísticas
      </div>
    );
  }

  const defaultStats = {
    total: 0,
    pendientes: 0,
    enProgreso: 0,
    completadas: 0,
    ...stats,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        label="Total Órdenes"
        value={defaultStats.total}
        color="border-gray-400"
      />
      <StatCard
        label="Pendientes"
        value={defaultStats.pendientes}
        color="border-yellow-400"
      />
      <StatCard
        label="En Progreso"
        value={defaultStats.enProgreso}
        color="border-blue-400"
      />
      <StatCard
        label="Completadas"
        value={defaultStats.completadas}
        color="border-green-400"
      />
    </div>
  );
}
