/**
 * Mantenimiento Model - Sincronizado con backend NestJS
 */

export enum MantenimientoTipo {
  PREVENTIVO = 'preventivo',
  CORRECTIVO = 'correctivo',
  PREDICTIVO = 'predictivo',
  PROGRAMADO = 'programado'
}

export enum MantenimientoEstado {
  PROGRAMADO = 'programado',
  EN_EJECUCION = 'en_ejecucion',
  COMPLETADO = 'completado',
  CANCELADO = 'cancelado',
  VENCIDO = 'vencido'
}

export enum MantenimientoPrioridad {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
  CRITICA = 'critica'
}

export interface Mantenimiento {
  id: string;
  equipoId: string;
  tipo: MantenimientoTipo;
  descripcion: string;
  fechaProgramada: string; // ISO string
  estado: MantenimientoEstado;
  prioridad: MantenimientoPrioridad;
  duracionEstimada?: number;
  horasReales?: number;
  tecnicoAsignadoId?: string;
  tecnicoAsignado?: {
    id: string;
    name: string;
  };
  materialesRequeridos?: string[];
  materialesUtilizados?: string[];
  observaciones?: string;
  trabajoRealizado?: string;
  costoMateriales?: number;
  costoManoObra?: number;
  costoTotal?: number;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface CreateMantenimientoDto {
  equipoId: string;
  tipo: MantenimientoTipo;
  descripcion: string;
  fechaProgramada: string; // ISO string
  prioridad?: MantenimientoPrioridad;
  duracionEstimada?: number;
  materialesRequeridos?: string[];
  tecnicoAsignadoId?: string;
}

export interface UpdateMantenimientoDto {
  descripcion?: string;
  fechaProgramada?: string; // ISO string
  estado?: MantenimientoEstado;
  prioridad?: MantenimientoPrioridad;
  duracionEstimada?: number;
  tecnicoAsignadoId?: string;
  materialesRequeridos?: string[];
  observaciones?: string;
}

export interface EjecutarMantenimientoDto {
  observaciones?: string;
  materialesUtilizados?: string[];
  horasReales: number;
  costoMateriales?: number;
  costoManoObra?: number;
  trabajoRealizado?: string;
}

export interface ProgramarMantenimientoDto {
  fechaProgramada: string; // ISO string
  tecnicoAsignadoId?: string;
  observaciones?: string;
}

export interface QueryMantenimientosDto {
  equipoId?: string;
  tipo?: MantenimientoTipo;
  estado?: MantenimientoEstado;
  fechaDesde?: string; // ISO string
  fechaHasta?: string; // ISO string
  page?: number;
  limit?: number;
}

export interface PaginatedMantenimientos {
  data: Mantenimiento[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

