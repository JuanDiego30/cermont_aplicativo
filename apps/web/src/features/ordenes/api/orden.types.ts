/**
 * @file orden.types.ts
 * @description Tipos TypeScript para el módulo de órdenes de trabajo
 */

// ============================================
// ENUMS
// ============================================

export type EstadoOrden = 
  | 'planeacion' 
  | 'ejecucion' 
  | 'completada' 
  | 'pausada' 
  | 'cancelada';

export type PrioridadOrden = 
  | 'urgente' 
  | 'alta' 
  | 'media' 
  | 'baja';

export type TipoOrden = 
  | 'Mantenimiento preventivo' 
  | 'Mantenimiento correctivo' 
  | 'Inspección técnica' 
  | 'Instalación de equipos' 
  | 'Reparación correctiva' 
  | 'Auditoría de seguridad';

// ============================================
// ENTITIES
// ============================================

export interface Orden {
  id: string;
  numero: string;
  clienteId: string;
  cliente: string;
  ubicacion: string;
  tecnicoId: string | null;
  tecnico: string | null;
  estado: EstadoOrden;
  prioridad: PrioridadOrden;
  tipo: TipoOrden;
  descripcion?: string;
  fechaProgramada: string;
  fechaInicio?: string;
  fechaFin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrdenDetalle extends Orden {
  planeacion?: {
    id: string;
    materiales: number;
    herramientas: number;
    personal: number;
  };
  evidencias?: {
    id: string;
    tipo: string;
    url: string;
  }[];
  actividades?: {
    id: string;
    descripcion: string;
    completada: boolean;
  }[];
}

// ============================================
// API RESPONSES
// ============================================

export interface OrdenesResponse {
  data: Orden[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrdenStats {
  total: number;
  enEjecucion: number;
  completadas: number;
  urgentes: number;
  planeacion: number;
  pausadas: number;
}

// ============================================
// FILTERS & INPUTS
// ============================================

export interface OrdenFilters {
  search?: string;
  estado?: EstadoOrden | 'todos';
  prioridad?: PrioridadOrden | 'todos';
  tecnicoId?: string;
  clienteId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  limit?: number;
}

export interface CreateOrdenInput {
  clienteId: string;
  ubicacion: string;
  tecnicoId?: string;
  tipo: TipoOrden;
  prioridad: PrioridadOrden;
  descripcion?: string;
  fechaProgramada: string;
}

export interface UpdateOrdenInput extends Partial<CreateOrdenInput> {
  estado?: EstadoOrden;
}

// ============================================
// CONFIG HELPERS
// ============================================

export const estadoConfig: Record<EstadoOrden, { label: string; color: string }> = {
  completada: { 
    label: 'Completada', 
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
  },
  ejecucion: { 
    label: 'En Ejecución', 
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' 
  },
  planeacion: { 
    label: 'Planeación', 
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' 
  },
  pausada: { 
    label: 'Pausada', 
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400' 
  },
  cancelada: { 
    label: 'Cancelada', 
    color: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' 
  },
};

export const prioridadConfig: Record<PrioridadOrden, { label: string; color: string }> = {
  urgente: { 
    label: 'Urgente', 
    color: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' 
  },
  alta: { 
    label: 'Alta', 
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' 
  },
  media: { 
    label: 'Media', 
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' 
  },
  baja: { 
    label: 'Baja', 
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400' 
  },
};
