/**
 * HES (Hoja de Entrada de Servicio) Model - Sincronizado con backend NestJS
 * @see apps/api/src/modules/hes/application/dto/
 */

export enum TipoServicio {
  MANTENIMIENTO_PREVENTIVO = 'MANTENIMIENTO_PREVENTIVO',
  REPARACION = 'REPARACION',
  INSTALACION = 'INSTALACION',
  INSPECCION = 'INSPECCION',
  OTRO = 'OTRO'
}

export enum PrioridadHES {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  URGENTE = 'URGENTE'
}

export enum EstadoHES {
  BORRADOR = 'BORRADOR',
  COMPLETADO = 'COMPLETADO',
  ANULADO = 'ANULADO'
}

export enum NivelRiesgo {
  BAJO = 'BAJO',
  MEDIO = 'MEDIO',
  ALTO = 'ALTO',
  CRITICO = 'CRITICO'
}

export interface ClienteInfo {
  nombre: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  direccion?: Direccion;
}

export interface Direccion {
  calle?: string;
  ciudad?: string;
  departamento?: string;
  codigoPostal?: string;
  coordenadas?: CoordenadasGPS;
}

export interface CoordenadasGPS {
  latitud: number;
  longitud: number;
}

export interface CondicionesEntrada {
  temperatura?: number;
  humedad?: number;
  presion?: number;
  observaciones?: string;
  fotos?: string[];
}

export interface DiagnosticoPreliminar {
  descripcion: string;
  causasPosibles?: string[];
  recomendaciones?: string;
  fotos?: string[];
}

export interface RequerimientosSeguridad {
  nivelRiesgo: NivelRiesgo;
  eppRequerido?: string[];
  medidasPreventivas?: string[];
  checklist?: { item: string; cumplido: boolean }[];
}

export interface FirmaDigital {
  imagen: string; // base64
  nombre: string;
  documento: string;
  fecha: Date;
  tipo: 'CLIENTE' | 'TECNICO';
}

export interface HES {
  id: string;
  numero: string; // HES-YYYY-0001
  ordenId?: string;
  tipoServicio: TipoServicio;
  prioridad: PrioridadHES;
  estado: EstadoHES;
  cliente: ClienteInfo;
  condicionesEntrada?: CondicionesEntrada;
  diagnosticoPreliminar?: DiagnosticoPreliminar;
  requerimientosSeguridad?: RequerimientosSeguridad;
  firmaCliente?: FirmaDigital;
  firmaTecnico?: FirmaDigital;
  tecnicoId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHESDto {
  ordenId?: string;
  tipoServicio: TipoServicio;
  prioridad?: PrioridadHES;
  cliente: ClienteInfo;
  condicionesEntrada?: CondicionesEntrada;
}

export interface SignHESDto {
  tipo: 'CLIENTE' | 'TECNICO';
  imagen: string; // base64
  nombre: string;
  documento: string;
}


