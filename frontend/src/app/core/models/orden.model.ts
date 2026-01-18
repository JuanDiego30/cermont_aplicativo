/**
 * Enums - Imported from @cermont/shared-types
 *
 * These are canonical enum definitions aligned with Prisma schema.
 */

// Import enums directly
import { OrderStatus, OrderPriority } from '@cermont/shared-types';

// Re-export with local names for backward compatibility
export const OrdenEstado = OrderStatus;
export const Prioridad = OrderPriority;

// Type exports for convenience
export type OrdenEstado = OrderStatus;
export type Prioridad = OrderPriority;

export interface Orden {
  id: string;
  numeroOrden: string;
  descripcion: string;
  cliente: string;
  clienteId?: string;
  estado: OrdenEstado;
  prioridad: Prioridad;
  fechaInicio: string;
  fechaFin?: string | null;
  fechaFinEstimada?: string | null;
  fechaRealInicio?: string | null;
  fechaRealFin?: string | null;
  presupuestoEstimado?: number | null;
  costoEstimado?: number | null;
  costoReal?: number | null;
  ubicacion?: string | null;
  notas?: string | null;
  asignadoId?: string | null;
  tecnicoId?: string | null;
  requiereHES?: boolean;
  tecnico?: TecnicoBasico | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface TecnicoBasico {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
}

export interface CreateOrdenDto {
  numeroOrden?: string;
  descripcion: string;
  cliente?: string;
  clienteId?: string;
  prioridad?: Prioridad;
  fechaInicio?: string;
  fechaFinEstimada?: string;
  presupuestoEstimado?: number;
  costoEstimado?: number;
  ubicacion?: string;
  notas?: string;
  asignadoId?: string;
  tecnicoId?: string;
  requiereHES?: boolean;
}

export interface UpdateOrdenDto extends Partial<CreateOrdenDto> {
  fechaRealInicio?: string;
  fechaRealFin?: string;
  costoReal?: number;
}

export interface ChangeEstadoOrdenDto {
  nuevoEstado: OrdenEstado;
  motivo?: string;
  usuarioId?: string;
  observaciones?: string;
}

export interface AsignarTecnicoOrdenDto {
  tecnicoId: string;
  fechaInicio?: string;
  instrucciones?: string;
  motivoAsignacion?: string;
}

export interface ListOrdenesQuery {
  page?: number;
  limit?: number;
  estado?: OrdenEstado;
  prioridad?: Prioridad;
  search?: string;
  buscar?: string;
  cliente?: string;
  clienteId?: string;
  asignadoId?: string;
  tecnicoId?: string;
  creadorId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  soloVencidas?: boolean;
  soloSinAsignar?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedOrdenes {
  items: Orden[];
  data?: Orden[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore?: boolean;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface HistorialEstado {
  id: string;
  orderId: string;
  estadoAnterior: OrdenEstado;
  estadoNuevo: OrdenEstado;
  motivo?: string | null;
  changedById: string;
  changedAt: string;
}

export interface OrdenesStats {
  total: number;
  porEstado: Record<OrdenEstado, number>;
  porPrioridad: Record<Prioridad, number>;
}
