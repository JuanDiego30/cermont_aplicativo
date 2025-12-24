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
  prioridad: OrderPriority;
  estado: OrderEstado;
  asignadoId?: string;
  asignado?: {
    id: string;
    nombre: string;
    email: string;
  };
  fechaInicio?: Date;
  fechaFinEstimada?: Date;
  fechaFinReal?: Date;
  presupuestoEstimado?: number;
  costoReal?: number;
  requiereHES?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrdenDto {
  descripcion: string;
  cliente: string;
  prioridad?: OrderPriority;
  asignadoId?: string;
  fechaFinEstimada?: Date;
  presupuestoEstimado?: number;
  requiereHES?: boolean;
}

export interface UpdateOrdenDto {
  descripcion?: string;
  cliente?: string;
  prioridad?: OrderPriority;
  estado?: OrderEstado;
  asignadoId?: string;
  fechaFinEstimada?: Date;
  presupuestoEstimado?: number;
  costoReal?: number;
  requiereHES?: boolean;
}

export interface ListOrdenesQuery {
  page?: number;
  limit?: number;
  search?: string;
  estado?: OrderEstado;
  prioridad?: OrderPriority;
  asignadoId?: string;
}


