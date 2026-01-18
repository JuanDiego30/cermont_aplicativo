/**
 * Reportes Model - TypeScript interfaces for reports
 * @see apps/api/src/modules/reportes/
 */

export interface ReporteQueryDto {
  fechaInicio?: string;
  fechaFin?: string;
  estado?: string;
  tecnicoId?: string;
  clienteId?: string;
  formato?: 'json' | 'pdf' | 'excel';
}

export interface ReporteOrdenResumen {
  id: string;
  numeroOrden: string;
  cliente: string;
  estado: string;
  fechaInicio: string;
  fechaFin?: string;
  tecnico?: string;
  duracionDias?: number;
  costoEstimado?: number;
  costoReal?: number;
}

export interface ReporteOrdenes {
  items: ReporteOrdenResumen[];
  total: number;
  resumen: {
    totalOrdenes: number;
    ordenesCompletadas: number;
    ordenesPendientes: number;
    costoTotalEstimado: number;
    costoTotalReal: number;
    tiempoPromedioCompletado?: number;
  };
  generadoEn: string;
}

export interface ReporteOrdenDetalle {
  orden: {
    id: string;
    numeroOrden: string;
    descripcion: string;
    cliente: string;
    estado: string;
    prioridad: string;
    fechaInicio: string;
    fechaFin?: string;
    costoEstimado?: number;
    costoReal?: number;
  };
  planeacion?: {
    estado: string;
    actividades: number;
    recursos: number;
  };
  ejecucion?: {
    progreso: number;
    actividadesCompletadas: number;
    actividadesTotales: number;
  };
  evidencias?: {
    total: number;
    fotos: number;
    videos: number;
    documentos: number;
  };
  historialEstados: {
    estado: string;
    fecha: string;
    usuario: string;
  }[];
  generadoEn: string;
}
