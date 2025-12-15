/**
 * ARCHIVO: PlaneacionTimeline.tsx
 * FUNCION: Componente visual de timeline para planes de trabajo
 * IMPLEMENTACION: Renderiza lista vertical con indicadores de estado y progreso
 * DEPENDENCIAS: @/types/workplan (WorkPlan)
 * EXPORTS: PlaneacionTimeline
 */
'use client';
import type { WorkPlan } from '@/types/workplan';

interface PlaneacionTimelineProps {
  workPlans: WorkPlan[];
  onSelect?: (plan: WorkPlan) => void;
}

export function PlaneacionTimeline({ workPlans, onSelect }: PlaneacionTimelineProps) {
  if (workPlans.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No hay planes de trabajo</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
      
      <div className="space-y-6">
        {workPlans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => onSelect?.(plan)}
            className="relative pl-10 cursor-pointer"
          >
            {/* Timeline dot */}
            <div
              className={`absolute left-2.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${
                plan.estado === 'completado'
                  ? 'bg-green-500'
                  : plan.estado === 'activo'
                  ? 'bg-blue-500'
                  : plan.estado === 'cancelado'
                  ? 'bg-red-500'
                  : 'bg-gray-400'
              }`}
            />
            
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{plan.nombre}</h4>
                  {plan.descripcion && (
                    <p className="text-sm text-gray-500 mt-1">{plan.descripcion}</p>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(plan.fechaInicio).toLocaleDateString()}
                </span>
              </div>
              
              {plan.tareas && plan.tareas.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">
                    {plan.tareas.filter((t) => t.completadoAt).length}/{plan.tareas.length} tareas
                  </p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{
                        width: `${(plan.tareas.filter((t) => t.completadoAt).length / plan.tareas.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
