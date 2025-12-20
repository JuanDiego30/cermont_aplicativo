/**
 * @file kpis-api.ts
 * @description API client para KPIs
 */

import { apiClient } from '@/lib/api';

export interface DashboardKPIs {
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
}

export interface OrdenKPIs {
  ordenId: string;
  numero: string;
  kpis: {
    avance: number;
    eficiencia: number;
    costoReal: number;
    costoEstimado: number;
    varianza: number;
    tiempoTranscurrido: number;
    tiempoEstimado: number;
  };
}

export const kpisApi = {
  /**
   * Obtener KPIs principales del dashboard
   */
  getDashboardKPIs: async (): Promise<DashboardKPIs> => {
    return apiClient.get<DashboardKPIs>('/kpis/dashboard');
  },

  /**
   * Obtener KPIs de una orden específica
   */
  getOrdenKPIs: async (ordenId: string): Promise<OrdenKPIs> => {
    return apiClient.get<OrdenKPIs>(`/kpis/orden/${ordenId}`);
  },
};
