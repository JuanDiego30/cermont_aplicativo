/**
 * Orden Model - Sincronizado con backend NestJS
 * @see apps/api/src/modules/ordenes/dto/orden.dto.ts
 */

export enum OrderPriority {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
  URGENTE = 'urgente'
}

export enum OrderEstado {
  PLANEACION = 'planeacion',
  EJECUCION = 'ejecucion',
  PAUSADA = 'pausada',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
  ARCHIVADA = 'archivada'
}

export enum OrderType {
  INSTALACION = 'instalacion',
  MANTENIMIENTO = 'mantenimiento',
  REPARACION = 'reparacion',
  INSPECCION = 'inspeccion'
}

export interface Orden {
  id: string;
  numero: string;
  descripcion: string;
  cliente: string;
  contactoCliente?: string;
  telefonoCliente?: string;
  direccion?: string;
  prioridad: OrderPriority;
  estado: OrderEstado;
  creadorId?: string;
  asignadoId?: string;
  asignado?: {
    id: string;
    name: string;
  };
  creador?: {
    id: string;
    name: string;
  };
  fechaInicio?: string; // ISO string
  fechaFin?: string; // ISO string
  fechaFinEstimada?: string; // ISO string
  presupuestoEstimado?: number;
  costoReal?: number;
  observaciones?: string;
  requiereHES?: boolean;
  cumplimientoHES?: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface HistorialEstado {
  id: string;
  ordenId: string;
  estadoAnterior?: OrderEstado;
  estadoNuevo: OrderEstado;
  motivo: string;
  observaciones?: string;
  usuarioId?: string;
  createdAt: string; // ISO string
}

export interface CreateOrdenDto {
  descripcion: string;
  cliente: string;
  contactoCliente?: string;
  telefonoCliente?: string;
  direccion?: string;
  prioridad?: OrderPriority;
  asignadoId?: string;
  fechaFinEstimada?: string; // ISO string
  presupuestoEstimado?: number;
  requiereHES?: boolean;
  observaciones?: string;
}

export interface UpdateOrdenDto {
  descripcion?: string;
  cliente?: string;
  contactoCliente?: string;
  telefonoCliente?: string;
  direccion?: string;
  prioridad?: OrderPriority;
  estado?: OrderEstado;
  asignadoId?: string;
  fechaInicio?: string; // ISO string
  fechaFin?: string; // ISO string
  fechaFinEstimada?: string; // ISO string
  presupuestoEstimado?: number;
  costoReal?: number;
  margenUtilidad?: number;
  impuestosAplicables?: number;
  requiereHES?: boolean;
  observaciones?: string;
}

export interface ChangeEstadoOrdenDto {
  nuevoEstado: OrderEstado;
  motivo: string;
  usuarioId?: string;
  observaciones?: string;
}

export interface AsignarTecnicoOrdenDto {
  tecnicoId: string;
  fechaInicio?: string; // ISO string
  instrucciones?: string;
  motivoAsignacion?: string;
}

export interface ListOrdenesQuery {
  page?: number;
  limit?: number;
  estado?: OrderEstado;
  prioridad?: OrderPriority;
  search?: string;
  cliente?: string;
  asignadoId?: string;
  creadorId?: string;
  fechaDesde?: string; // ISO string
  fechaHasta?: string; // ISO string
  soloVencidas?: boolean;
  soloSinAsignar?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}


