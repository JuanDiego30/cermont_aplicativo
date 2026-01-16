import { ApiProperty } from '@nestjs/swagger';

export interface DashboardStatsDto {
  ordenes: {
    total: number;
    planeacion: number;
    ejecucion: number;
    completadas: number;
    canceladas: number;
    porcentajePlaneacion?: number;
    porcentajeEjecucion?: number;
    porcentajeCompletadas?: number;
  };
  financiero: {
    ingresosEstimados: number;
    ingresosReales: number;
    costosEstimados: number;
    costosReales: number;
    margenEstimado: number;
    margenReal: number;
  };
  hes: {
    ordenesConHES: number;
    cumplimiento: number;
    equiposAsignados: number;
    inspeccionesPendientes: number;
  };
  cierre: {
    actasPendientes: number;
    sesPendientes: number;
    facturasPendientes: number;
    promedioTiempoCierre: number; // días
  };
}

export interface TendenciaDto {
  fecha: Date | string;
  ordenes: number;
  ingresos: number;
  gastos: number;
  margen?: number;
}

export interface OrdenResumenDto {
  id: string;
  numero: string;
  cliente: string;
  descripcion: string;
  estado: string;
  subEstado: string;
  prioridad: string;
  asignado?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  fechaInicio?: Date;
  cumplimientoHES: boolean;
  diasTranscurridos?: number;
}

export interface DashboardResponse {
  stats: DashboardStatsDto;
  tendencia: TendenciaDto[];
  ultimasOrdenes: OrdenResumenDto[];
  metadata?: {
    generadoEn: string;
    diasTendencia: number;
    ordenesRecientes: number;
  };
}
