// ============================================
// MANTENIMIENTOS TYPES - Cermont FSM
// Tipos para el módulo de mantenimientos
// ============================================

import { z } from 'zod';

// ============================================
// ENUMS
// ============================================

export enum TipoMantenimiento {
  PREVENTIVO = 'PREVENTIVO',
  CORRECTIVO = 'CORRECTIVO',
  PREDICTIVO = 'PREDICTIVO',
}

export enum EstadoMantenimiento {
  PROGRAMADO = 'PROGRAMADO',
  EN_PROGRESO = 'EN_PROGRESO',
  COMPLETADO = 'COMPLETADO',
  CANCELADO = 'CANCELADO',
  PENDIENTE = 'PENDIENTE',
}

export enum PrioridadMantenimiento {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  CRITICA = 'CRITICA',
}

// ============================================
// ZOD SCHEMAS
// ============================================

export const crearMantenimientoSchema = z.object({
  equipoId: z.string().uuid('ID de equipo inválido'),
  tipo: z.nativeEnum(TipoMantenimiento),
  prioridad: z.nativeEnum(PrioridadMantenimiento).default(PrioridadMantenimiento.MEDIA),
  titulo: z.string().min(3, 'Título debe tener al menos 3 caracteres').max(200),
  descripcion: z.string().optional(),
  fechaProgramada: z.string().datetime().or(z.date()),
  tecnicoAsignadoId: z.string().uuid().optional(),
  estimacionHoras: z.number().positive().optional(),
  notas: z.string().optional(),
  // Recurrencia para mantenimientos preventivos
  esRecurrente: z.boolean().default(false),
  frecuenciaDias: z.number().int().positive().optional(),
});

export const actualizarMantenimientoSchema = z.object({
  estado: z.nativeEnum(EstadoMantenimiento).optional(),
  prioridad: z.nativeEnum(PrioridadMantenimiento).optional(),
  titulo: z.string().min(3).max(200).optional(),
  descripcion: z.string().optional(),
  fechaProgramada: z.string().datetime().or(z.date()).optional(),
  tecnicoAsignadoId: z.string().uuid().nullable().optional(),
  horasReales: z.number().positive().optional(),
  costoTotal: z.number().nonnegative().optional(),
  notas: z.string().optional(),
  observaciones: z.string().optional(),
});

export const completarMantenimientoSchema = z.object({
  horasReales: z.number().positive('Horas reales debe ser positivo'),
  costoMateriales: z.number().nonnegative().default(0),
  costoManoObra: z.number().nonnegative().default(0),
  observaciones: z.string().optional(),
  trabajoRealizado: z.string().min(10, 'Describa el trabajo realizado'),
  repuestosUtilizados: z.array(z.object({
    nombre: z.string(),
    cantidad: z.number().positive(),
    costoUnitario: z.number().nonnegative(),
  })).optional(),
});

export const crearEquipoSchema = z.object({
  codigo: z.string().min(1, 'Código requerido').max(50),
  nombre: z.string().min(3, 'Nombre requerido').max(200),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  serie: z.string().optional(),
  ubicacion: z.string().optional(),
  fechaAdquisicion: z.string().datetime().or(z.date()).optional(),
  fechaUltimoMantenimiento: z.string().datetime().or(z.date()).optional(),
  intervaloMantenimientoDias: z.number().int().positive().optional(),
  activo: z.boolean().default(true),
  notas: z.string().optional(),
});

// ============================================
// INTERFACES
// ============================================

export interface Equipo {
  id: string;
  codigo: string;
  nombre: string;
  marca?: string;
  modelo?: string;
  serie?: string;
  ubicacion?: string;
  fechaAdquisicion?: Date;
  fechaUltimoMantenimiento?: Date;
  intervaloMantenimientoDias?: number;
  activo: boolean;
  notas?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Mantenimiento {
  id: string;
  equipoId: string;
  equipo?: Equipo;
  tipo: TipoMantenimiento;
  estado: EstadoMantenimiento;
  prioridad: PrioridadMantenimiento;
  titulo: string;
  descripcion?: string;
  fechaProgramada: Date;
  fechaInicio?: Date;
  fechaFin?: Date;
  tecnicoAsignadoId?: string;
  tecnicoAsignado?: { id: string; name: string };
  estimacionHoras?: number;
  horasReales?: number;
  costoTotal?: number;
  notas?: string;
  observaciones?: string;
  trabajoRealizado?: string;
  esRecurrente: boolean;
  frecuenciaDias?: number;
  mantenimientoPadreId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MantenimientoResumen {
  totalProgramados: number;
  totalEnProgreso: number;
  totalCompletados: number;
  totalPendientes: number;
  porcentajeCumplimiento: number;
  proximosMantenimientos: Mantenimiento[];
  alertasVencidos: Mantenimiento[];
}

export interface FiltrosMantenimiento {
  equipoId?: string;
  tipo?: TipoMantenimiento;
  estado?: EstadoMantenimiento;
  prioridad?: PrioridadMantenimiento;
  tecnicoId?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  busqueda?: string;
  page?: number;
  limit?: number;
}

export type CrearMantenimientoInput = z.infer<typeof crearMantenimientoSchema>;
export type ActualizarMantenimientoInput = z.infer<typeof actualizarMantenimientoSchema>;
export type CompletarMantenimientoInput = z.infer<typeof completarMantenimientoSchema>;
export type CrearEquipoInput = z.infer<typeof crearEquipoSchema>;
