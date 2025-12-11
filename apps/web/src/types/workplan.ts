// Work plan types

export interface WorkPlan {
  id: string;
  nombre: string;
  descripcion?: string;
  ordenId: string;
  estado: WorkPlanStatus;
  fechaInicio: string;
  fechaFin: string;
  tareas: WorkPlanTask[];
  costos: CostItem[];
  createdAt: string;
  updatedAt: string;
}

export type WorkPlanStatus = 'borrador' | 'activo' | 'completado' | 'cancelado';

export interface WorkPlanTask {
  id: string;
  titulo: string;
  descripcion?: string;
  estado: TaskStatus;
  asignadoId?: string;
  asignado?: {
    id: string;
    nombre: string;
  };
  orden: number;
  estimacionHoras?: number;
  horasReales?: number;
  fechaInicio?: string;
  fechaFin?: string;
  completadoAt?: string;
}

export type TaskStatus = 'pendiente' | 'en_progreso' | 'completada' | 'bloqueada';

export interface CostItem {
  id: string;
  concepto: string;
  categoria: CostCategory;
  cantidad: number;
  valorUnitario: number;
  valorTotal: number;
  notas?: string;
}

export type CostCategory = 'material' | 'mano_obra' | 'transporte' | 'equipo' | 'otros';

export interface WorkPlanCreate {
  nombre: string;
  descripcion?: string;
  ordenId: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface WorkPlanUpdate extends Partial<WorkPlanCreate> {
  estado?: WorkPlanStatus;
}

export interface WorkPlanFilters {
  ordenId?: string;
  estado?: WorkPlanStatus;
  fechaDesde?: string;
  fechaHasta?: string;
}
