/**
 * ARCHIVO: ResumenEjecucion.tsx
 * FUNCION: Dashboard visual de resumen de planeación y ejecución de órdenes
 * IMPLEMENTACION: Cards con métricas, barras de progreso y cronograma
 * DEPENDENCIAS: react, @/components/ui/Card, @/components/ui/Badge
 * EXPORTS: ResumenEjecucion, ResumenEjecucionData (interface)
 */
'use client';
import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

// Tipos para el resumen
export interface ResumenEjecucionData {
  planeacion: {
    id: string;
    ordenNumero: string;
    empresa: string;
    ubicacion: string;
    estado: string;
    fechas: {
      inicio: string | null;
      fin: string | null;
    };
    items: {
      materiales: number;
      herramientas: number;
      equipos: number;
      seguridad: number;
    };
    descripcionTrabajo?: string;
  };
  ejecucion?: {
    id: string;
    estado: string;
    avancePercentaje: number;
    horasActuales: number;
    horasEstimadas: number;
    fechaInicio?: string;
    fechaTermino?: string;
  };
}

interface ResumenEjecucionProps {
  data: ResumenEjecucionData;
  className?: string;
}

// Colores por estado
const ESTADO_COLORS: Record<string, { bg: string; text: string }> = {
  borrador: { bg: 'bg-gray-100', text: 'text-gray-800' },
  en_revision: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  aprobada: { bg: 'bg-blue-100', text: 'text-blue-800' },
  en_ejecucion: { bg: 'bg-purple-100', text: 'text-purple-800' },
  completada: { bg: 'bg-green-100', text: 'text-green-800' },
  cancelada: { bg: 'bg-red-100', text: 'text-red-800' },
  // Estados de ejecución
  NO_INICIADA: { bg: 'bg-gray-100', text: 'text-gray-800' },
  EN_PROGRESO: { bg: 'bg-blue-100', text: 'text-blue-800' },
  PAUSADA: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  COMPLETADA: { bg: 'bg-green-100', text: 'text-green-800' },
  CANCELADA: { bg: 'bg-red-100', text: 'text-red-800' },
};

// Etiquetas de estado
const ESTADO_LABELS: Record<string, string> = {
  borrador: 'Borrador',
  en_revision: 'En Revisión',
  aprobada: 'Aprobada',
  en_ejecucion: 'En Ejecución',
  completada: 'Completada',
  cancelada: 'Cancelada',
  NO_INICIADA: 'No Iniciada',
  EN_PROGRESO: 'En Progreso',
  PAUSADA: 'Pausada',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
};

// Componente de tarjeta métrica
function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = 'blue' 
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string; 
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
  };

  return (
    <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium opacity-80">{title}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {subtitle && <div className="text-xs opacity-70 mt-1">{subtitle}</div>}
    </div>
  );
}

// Componente de barra de progreso
function ProgressBar({ value, max, label }: { value: number; max: number; label?: string }) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">{label}</span>
          <span className="font-medium">{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-linear-to-r from-blue-500 to-blue-600 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function ResumenEjecucion({ data, className = '' }: ResumenEjecucionProps) {
  const { planeacion, ejecucion } = data;

  // Calcular totales
  const totalItems = useMemo(() => {
    return (
      planeacion.items.materiales +
      planeacion.items.herramientas +
      planeacion.items.equipos +
      planeacion.items.seguridad
    );
  }, [planeacion.items]);

  // Formatear fecha
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'No definida';
    return new Date(dateStr).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Obtener estilos de estado
  const getEstadoStyle = (estado: string) => {
    return ESTADO_COLORS[estado] || ESTADO_COLORS.borrador;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Orden {planeacion.ordenNumero}
            </h2>
            <p className="text-gray-600 mt-1">{planeacion.empresa}</p>
            <p className="text-gray-500 text-sm">{planeacion.ubicacion}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge 
              className={`${getEstadoStyle(planeacion.estado).bg} ${getEstadoStyle(planeacion.estado).text}`}
            >
              Planeación: {ESTADO_LABELS[planeacion.estado] || planeacion.estado}
            </Badge>
            {ejecucion && (
              <Badge 
                className={`${getEstadoStyle(ejecucion.estado).bg} ${getEstadoStyle(ejecucion.estado).text}`}
              >
                Ejecución: {ESTADO_LABELS[ejecucion.estado] || ejecucion.estado}
              </Badge>
            )}
          </div>
        </div>
        
        {planeacion.descripcionTrabajo && (
          <p className="mt-4 text-gray-600 text-sm border-t pt-4">
            {planeacion.descripcionTrabajo}
          </p>
        )}
      </Card>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Materiales"
          value={planeacion.items.materiales}
          icon={<span className="text-xl">📦</span>}
          color="blue"
        />
        <MetricCard
          title="Herramientas"
          value={planeacion.items.herramientas}
          icon={<span className="text-xl">🔧</span>}
          color="green"
        />
        <MetricCard
          title="Equipos"
          value={planeacion.items.equipos}
          icon={<span className="text-xl">⚙️</span>}
          color="purple"
        />
        <MetricCard
          title="Seguridad"
          value={planeacion.items.seguridad}
          icon={<span className="text-xl">🦺</span>}
          color="orange"
        />
      </div>

      {/* Progreso de ejecución */}
      {ejecucion && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Progreso de Ejecución</h3>
          
          <div className="space-y-4">
            {/* Avance general */}
            <ProgressBar 
              value={ejecucion.avancePercentaje} 
              max={100}
              label="Avance General"
            />
            
            {/* Horas */}
            <ProgressBar 
              value={ejecucion.horasActuales} 
              max={ejecucion.horasEstimadas}
              label={`Horas (${ejecucion.horasActuales.toFixed(1)} / ${ejecucion.horasEstimadas.toFixed(1)}h estimadas)`}
            />
            
            {/* Información adicional */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <span className="text-sm text-gray-500">Fecha Inicio</span>
                <p className="font-medium">{formatDate(ejecucion.fechaInicio || null)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Fecha Término</span>
                <p className="font-medium">{formatDate(ejecucion.fechaTermino || null)}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Fechas de planeación */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Cronograma</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-sm text-gray-500">Inicio Estimado</span>
            <p className="font-medium">{formatDate(planeacion.fechas.inicio)}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Fin Estimado</span>
            <p className="font-medium">{formatDate(planeacion.fechas.fin)}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Total Items</span>
            <p className="font-medium text-xl">{totalItems}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Cumplimiento</span>
            <div className="flex items-center gap-2">
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500"
                  style={{ 
                    width: ejecucion 
                      ? `${ejecucion.avancePercentaje}%` 
                      : '0%' 
                  }}
                />
              </div>
              <span className="font-medium">
                {ejecucion ? `${ejecucion.avancePercentaje}%` : '0%'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Resumen de items por categoría */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Distribución de Items</h3>
        
        <div className="space-y-3">
          {[
            { label: 'Materiales', value: planeacion.items.materiales, color: 'bg-blue-500' },
            { label: 'Herramientas', value: planeacion.items.herramientas, color: 'bg-green-500' },
            { label: 'Equipos', value: planeacion.items.equipos, color: 'bg-purple-500' },
            { label: 'Seguridad', value: planeacion.items.seguridad, color: 'bg-orange-500' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className="flex-1 text-gray-700">{item.label}</span>
              <span className="font-medium">{item.value}</span>
              <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${item.color}`}
                  style={{ 
                    width: totalItems > 0 
                      ? `${(item.value / totalItems) * 100}%` 
                      : '0%' 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default ResumenEjecucion;
