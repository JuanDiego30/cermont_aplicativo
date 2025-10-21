/**
 * Tipos de base de datos para Cermont Web
 */

import type { Role } from './roles';

// Tipo JSON compatible con Supabase (json/jsonb)
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// ===== USUARIOS =====

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: Role;
  empresa?: string;
  telefono?: string;
  avatar_url?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

// ===== CLIENTES =====

export interface Cliente {
  id: string;
  // En DB suele ser nombre_empresa; mantener 'nombre' como alias opcional
  nombre_empresa: string;
  nombre?: string;
  nit: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  contacto_principal?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

// ===== EQUIPOS =====

export type TipoEquipo = 'CCTV' | 'Radio Enlace' | 'Torre' | 'Otro';

export interface Equipo {
  id: string;
  cliente_id: string;
  tipo: TipoEquipo;
  marca?: string;
  modelo?: string;
  numero_serie?: string;
  serial?: string;
  ubicacion?: string;
  fecha_instalacion?: string;
  estado: 'activo' | 'inactivo' | 'en_mantenimiento' | 'retirado';
  especificaciones?: Json;
  notas?: string;
  fecha_creacion?: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  cliente?: Cliente;
}

// ===== ÓRDENES DE TRABAJO =====

export type TipoOrden = 'Mantenimiento Preventivo' | 'Mantenimiento Correctivo' | 'Instalación' | 'Diagnóstico';
export type EstadoOrden = 'pendiente' | 'asignada' | 'en_progreso' | 'completada' | 'cancelada' | 'aprobada';
export type PrioridadOrden = 'baja' | 'normal' | 'alta' | 'urgente';

export interface OrdenTrabajo {
  id: string;
  numero_orden: string;
  cliente_id: string;
  equipo_id?: string;
  tecnico_asignado_id?: string;
  coordinador_id?: string;
  
  tipo_orden: TipoOrden;
  tipo_equipo: TipoEquipo;
  
  titulo: string;
  descripcion?: string;
  ubicacion?: string;
  fecha_programada?: string;
  fecha_inicio?: string;
  fecha_finalizacion?: string;
  fecha_creacion?: string;
  
  estado: EstadoOrden;
  prioridad: PrioridadOrden;
  
  datos_tecnicos?: Json;
  observaciones?: string;
  recomendaciones?: string;
  
  created_at: string;
  updated_at: string;
  
  // Relaciones
  cliente?: Cliente;
  equipo?: Equipo;
  tecnico_asignado?: Usuario;
  coordinador?: Usuario;
  evidencias?: Evidencia[];
  historial?: HistorialOrden[];
}

// ===== EVIDENCIAS =====

export type TipoEvidencia = 'antes' | 'durante' | 'despues' | 'camara' | 'equipo' | 'otro';

export interface Evidencia {
  id: string;
  orden_id: string;
  tipo: TipoEvidencia;
  url: string;
  descripcion?: string;
  tomada_por?: string;
  fecha_captura: string;
  created_at: string;
  // Relaciones
  usuario?: Usuario;
}

// ===== HISTORIAL =====

export type AccionHistorial = 
  | 'creada' 
  | 'asignada' 
  | 'reasignada' 
  | 'actualizada' 
  | 'completada' 
  | 'aprobada' 
  | 'rechazada' 
  | 'cancelada';

export interface HistorialOrden {
  id: string;
  orden_id: string;
  usuario_id: string;
  accion: AccionHistorial;
  estado_anterior?: EstadoOrden;
  estado_nuevo?: EstadoOrden;
  cambios?: Json;
  timestamp: string;
  // Relaciones
  usuario?: Usuario;
}

// ===== PLANTILLAS =====

export interface PlantillaMantenimiento {
  id: string;
  nombre: string;
  tipo_equipo: TipoEquipo;
  descripcion?: string;
  checklist?: string[];
  campos_requeridos?: Json;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  creador?: Usuario;
}

// ===== HERRAMIENTAS PARA ACTIVIDADES =====

export type CriticidadHerramienta = 'baja' | 'media' | 'alta';

export interface ActividadHerramienta {
  id: string;
  tipo_orden: TipoOrden;
  tipo_equipo: TipoEquipo;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  unidad?: string;
  cantidad_sugerida?: number | null;
  criticidad: CriticidadHerramienta;
  activo: boolean;
  notas?: string;
  created_at: string;
  updated_at: string;
}

// ===== TIPOS PARA FORMULARIOS =====

export interface CrearOrdenInput {
  cliente_id: string;
  equipo_id?: string;
  tipo_orden: TipoOrden;
  tipo_equipo?: TipoEquipo;
  titulo: string;
  descripcion?: string;
  ubicacion?: string;
  fecha_programada?: string;
  prioridad?: PrioridadOrden;
  datos_tecnicos?: Json;
}

export interface ActualizarOrdenInput {
  titulo?: string;
  descripcion?: string;
  ubicacion?: string;
  fecha_programada?: string;
  fecha_inicio?: string;
  fecha_finalizacion?: string;
  estado?: EstadoOrden;
  prioridad?: PrioridadOrden;
  datos_tecnicos?: Json;
  observaciones?: string;
  recomendaciones?: string;
}

export interface AsignarOrdenInput {
  orden_id: string;
  tecnico_id: string;
  coordinador_id?: string;
  fecha_programada?: string;
  notas?: string;
}

// ===== TIPOS PARA RESPUESTAS DE API =====

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ===== FILTROS Y BÚSQUEDA =====

export interface FiltrosOrden {
  cliente_id?: string;
  tecnico_id?: string;
  estado?: EstadoOrden[];
  tipo_orden?: TipoOrden[];
  prioridad?: PrioridadOrden[];
  fecha_desde?: string;
  fecha_hasta?: string;
  busqueda?: string;
  page?: number;
  pageSize?: number;
  ordenar_por?: 'fecha_programada' | 'fecha_creacion' | 'prioridad';
  orden?: 'asc' | 'desc';
}

export interface FiltrosCliente {
  activo?: boolean;
  busqueda?: string;
  page?: number;
  pageSize?: number;
}

export interface FiltrosEquipo {
  cliente_id?: string;
  tipo?: TipoEquipo[];
  estado?: string[];
  busqueda?: string;
  page?: number;
  pageSize?: number;
}
