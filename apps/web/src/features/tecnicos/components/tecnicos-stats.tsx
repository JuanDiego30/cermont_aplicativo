/**
 * ARCHIVO: tecnicos-stats.tsx
 * FUNCION: Componente que muestra estadísticas de técnicos en grid de cards
 * IMPLEMENTACION: Server Component - Renderiza 4 StatCards con iconos lucide-react
 * DEPENDENCIAS: lucide-react, StatCard, TecnicoStats
 * EXPORTS: TecnicosStats, TecnicosStatsSkeleton
 */
import { Shield, CheckCircle, Clock, Star } from 'lucide-react';
import { StatCard } from './stat-card';
import type { TecnicoStats } from '../api/tecnicos.types';

interface TecnicosStatsProps {
  stats: TecnicoStats;
}

export function TecnicosStats({ stats }: TecnicosStatsProps) {
  const statsData = [
    {
      label: 'Total Técnicos',
      value: stats.total,
      icon: <Shield className="w-5 h-5 text-blue-500" />,
    },
    {
      label: 'Disponibles',
      value: stats.disponibles,
      icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    },
    {
      label: 'En Servicio',
      value: stats.enServicio,
      icon: <Clock className="w-5 h-5 text-amber-500" />,
    },
    {
      label: 'Calificación Prom.',
      value: stats.calificacionPromedio.toFixed(1),
      icon: <Star className="w-5 h-5 text-yellow-500" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}

// Skeleton para loading
export function TecnicosStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
