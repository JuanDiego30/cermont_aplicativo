/**
 * @file dashboard-api.ts
 * @description API client completo para Dashboard
 */

import { apiClient } from '@/lib/api';

export interface DashboardStats {
  ordenes: {
    total: number;
    activas: number;
    completadas: number;
    canceladas: number;
  };
  tecnicos: {
    total: number;
    activos: number;
  };
  clientes: {
    total: number;
  };
}

export interface DashboardMetricas {
  tiempoPromedio: number;
  costoPromedio: number;
  eficiencia: number;
  ordenesPorMes: number;
}

export interface OrdenReciente {
  id: string;
  numero: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  cliente: string;
  createdAt: string;
}

export interface DashboardOverview {
  operativos: {
    ordenesCompletadas: number;
    ordenesEnProgreso: number;
    eficiencia: number;
    tiempoPromedio: number;
  };
  financieros: {
    ingresos: number;
    costos: number;
    margen: number;
    varianza: number;
  };
  tecnicos: {
    horasTrabajadas: number;
    horasEstimadas: number;
    productividad: number;
  };
  alertas: {
    pendientes: number;
    criticas: number;
  };
}

export interface CostosBreakdown {
  ordenId: string;
  numero: string;
  costos: {
    material: number;
    manoObra: number;
    equipo: number;
    transporte: number;
    otros: number;
    total: number;
  };
}

export interface PerformanceTrends {
  ordenes_completadas: Array<{ fecha: string; cantidad: number }>;
  costos: Array<{ fecha: string; total: number }>;
  eficiencia: Array<{ fecha: string; porcentaje: number }>;
}

export const dashboardApi = {
  /**
   * Estadísticas básicas (cached 5min)
   */
  getStats: async (): Promise<DashboardStats> => {
    return apiClient.get<DashboardStats>('/dashboard/stats');
  },

  /**
   * Métricas generales
   */
  getMetricas: async (): Promise<DashboardMetricas> => {
    return apiClient.get<DashboardMetricas>('/dashboard/metricas');
  },

  /**
   * Órdenes recientes (últimas 10)
   */
  getOrdenesRecientes: async (): Promise<{ data: OrdenReciente[] }> => {
    return apiClient.get<{ data: OrdenReciente[] }>('/dashboard/ordenes-recientes');
  },

  /**
   * Overview consolidado con KPIs (solo supervisor/admin)
   */
  getOverview: async (): Promise<DashboardOverview> => {
    return apiClient.get<DashboardOverview>('/dashboard/overview');
  },

  /**
   * Forzar recálculo de KPIs (solo supervisor/admin)
   */
  refreshKPIs: async (): Promise<{ message: string; data: any; meta: any }> => {
    return apiClient.get<{ message: string; data: any; meta: any }>('/dashboard/kpis/refresh');
  },

  /**
   * Desglose de costos (solo supervisor/admin)
   */
  getCostosBreakdown: async (): Promise<{ data: CostosBreakdown[] }> => {
    return apiClient.get<{ data: CostosBreakdown[] }>('/dashboard/costs/breakdown');
  },

  /**
   * Tendencias de performance (solo supervisor/admin)
   */
  getPerformanceTrends: async (params: {
    desde: string;
    hasta: string;
    granularidad?: 'DIA' | 'SEMANA' | 'MES';
  }): Promise<PerformanceTrends> => {
    const searchParams = new URLSearchParams();
    searchParams.append('desde', params.desde);
    searchParams.append('hasta', params.hasta);
    if (params.granularidad) {
      searchParams.append('granularidad', params.granularidad);
    }
    return apiClient.get<PerformanceTrends>(`/dashboard/performance/trends?${searchParams.toString()}`);
  },

  /**
   * Endpoint DDD (use case)
   */
  getDashboardStats: async (filters?: Record<string, any>): Promise<any> => {
    const searchParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return apiClient.get(`/dashboard${query ? `?${query}` : ''}`);
  },
};
