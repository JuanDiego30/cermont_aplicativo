/**
 * @file client.tsx
 * @description Componentes client para informes
 */

'use client';

import { useState } from 'react';
import { 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Users, 
  HardHat, 
  BarChart3,
  Shield,
  Package,
  Plus,
} from 'lucide-react';
import { 
  useInformes, 
  InformeCard,
  TipoInforme,
  TIPO_INFORME_CONFIG,
  InformeCardSkeleton,
} from '@/features/informes';
import { useGenerarInforme, useDescargarInforme, useEliminarInforme } from '@/features/informes';
import { toast } from 'sonner';

const PLANTILLAS: { tipo: TipoInforme; icon: typeof FileText }[] = [
  { tipo: 'ORDENES_ESTADO', icon: FileText },
  { tipo: 'COSTOS_MENSUALES', icon: DollarSign },
  { tipo: 'PRODUCTIVIDAD', icon: TrendingUp },
  { tipo: 'CLIENTES', icon: Users },
  { tipo: 'TECNICOS', icon: HardHat },
  { tipo: 'TENDENCIAS', icon: BarChart3 },
  { tipo: 'HES', icon: Shield },
  { tipo: 'INVENTARIO', icon: Package },
];

const colorClasses: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
  pink: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 border-pink-200 dark:border-pink-800',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  teal: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800',
};

export function InformesDashboard() {
  const { data: informesData, isLoading } = useInformes();
  const generarMutation = useGenerarInforme();
  const descargarMutation = useDescargarInforme();
  const eliminarMutation = useEliminarInforme();

  const informes = informesData?.data || [];

  const handleGenerar = (tipo: TipoInforme) => {
    generarMutation.mutate({
      tipo,
      formato: 'PDF',
    });
    toast.success('Informe en cola de generación');
  };

  const handleDescargar = (id: string, nombre: string) => {
    descargarMutation.mutate({ id, nombre });
  };

  const handleEliminar = (id: string) => {
    if (confirm('¿Eliminar este informe?')) {
      eliminarMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Plantillas disponibles */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Generar Nuevo Informe
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANTILLAS.map(({ tipo, icon: Icon }) => {
            const config = TIPO_INFORME_CONFIG[tipo];
            return (
              <button
                key={tipo}
                onClick={() => handleGenerar(tipo)}
                disabled={generarMutation.isPending}
                className={`p-4 rounded-xl border text-left hover:shadow-md transition-all ${colorClasses[config.color]} hover:scale-[1.02] disabled:opacity-50`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-white/50 dark:bg-gray-900/50`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{config.label}</h3>
                    <p className="text-xs mt-1 opacity-80 line-clamp-2">{config.descripcion}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Historial de informes */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Historial de Informes
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <InformeCardSkeleton key={i} />
            ))}
          </div>
        ) : informes.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No hay informes generados</p>
            <p className="text-sm text-gray-400">Selecciona una plantilla para generar tu primer informe</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {informes.map((informe) => (
              <InformeCard
                key={informe.id}
                informe={informe}
                onDescargar={() => handleDescargar(informe.id, informe.nombre || 'informe')}
                onEliminar={() => handleEliminar(informe.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
