/**
 * ARCHIVO: report.ts
 * FUNCION: Define tipos para reportes y estadísticas del dashboard
 * IMPLEMENTACION: Interfaces TypeScript para Reports, DashboardStats y OrderStats
 * DEPENDENCIAS: Ninguna (tipos puros)
 * EXPORTS: Report, ReportType, ReportFormat, ReportStatus, ReportRequest, DashboardStats, OrderStats
 */
export interface Report {
  id: string;
  tipo: ReportType;
  nombre: string;
  descripcion?: string;
  parametros: Record<string, unknown>;
  generadoPor: string;
  generadoAt: string;
  formato: ReportFormat;
  url?: string;
  estado: ReportStatus;
}

export type ReportType = 
  | 'ordenes'
  | 'costos'
  | 'productividad'
  | 'clientes'
  | 'tecnicos'
  | 'general';

export type ReportFormat = 'pdf' | 'excel' | 'csv';
export type ReportStatus = 'generando' | 'listo' | 'error';

export interface ReportRequest {
  tipo: ReportType;
  fechaDesde?: string;
  fechaHasta?: string;
  formato: ReportFormat;
  filtros?: Record<string, unknown>;
}

export interface DashboardStats {
  ordenes: {
    total: number;
    porEstado: Record<string, number>;
    porUrgencia: Record<string, number>;
    completadasHoy: number;
    enProgreso: number;
  };
  costos: {
    totalPresupuestado: number;
    totalEjecutado: number;
    ahorros: number;
  };
  productividad: {
    ordenesCompletadasMes: number;
    tiempoPromedioEjecucion: number;
    satisfaccionCliente: number;
  };
  tecnicos: {
    activos: number;
    enCampo: number;
    disponibles: number;
  };
}

export interface OrderStats {
  total: number;
  porEstado: {
    recibida: number;
    asignada: number;
    planificada: number;
    ejecucion: number;
    completada: number;
    cerrada: number;
    cancelada: number;
  };
  porUrgencia: {
    baja: number;
    media: number;
    alta: number;
    critica: number;
  };
  tendencia: {
    fecha: string;
    recibidas: number;
    completadas: number;
  }[];
}
