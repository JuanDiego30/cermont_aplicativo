/**
 * Dashboard Model - Sincronizado con backend NestJS
 * @see apps/api/src/modules/dashboard/
 */

export interface DashboardStats {
  totalOrdenes: number;
  ordenesPendientes: number;
  ordenesEnProceso: number;
  ordenesCompletadas: number;
  totalTecnicos: number;
  totalClientes: number;
}

export interface DashboardMetricas {
  tiempoPromedioEjecucion: number; // minutos
  eficiencia: number; // porcentaje
  costoTotal: number;
  costoPromedio: number;
  ordenesCompletadasMes: number;
  ordenesPendientesMes: number;
}

export interface OrdenReciente {
  id: string;
  numero: string;
  descripcion: string;
  cliente: string;
  prioridad: string;
  estado: string;
  fechaCreacion: Date;
}

export interface KPIConsolidado {
  operativos: {
    ordenesCompletadas: number;
    eficiencia: number;
    tiempoPromedio: number;
  };
  financieros: {
    ingresos: number;
    costos: number;
    margen: number;
  };
  tecnicos: {
    tecnicosActivos: number;
    ordenesPorTecnico: number;
    satisfaccion: number;
  };
}

export interface CostoBreakdown {
  ordenId: string;
  numero: string;
  costoMateriales: number;
  costoManoObra: number;
  costoEquipos: number;
  costoTotal: number;
}

export interface PerformanceTrend {
  fecha: Date;
  ordenesCompletadas: number;
  tiempoPromedio: number;
  eficiencia: number;
}
