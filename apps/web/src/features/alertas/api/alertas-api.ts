/**
 * @file alertas-api.ts
 * @description API client para Alertas Automáticas
 */

import { apiClient } from '@/lib/api';

export interface Alerta {
  id: string;
  tipo: string;
  prioridad: 'info' | 'warning' | 'error' | 'critical';
  ordenId: string;
  titulo: string;
  mensaje: string;
  usuarioId?: string;
  leida: boolean;
  resuelta: boolean;
  resueltaPor?: string;
  metadata?: any;
  createdAt: string;
  leidaAt?: string;
  resueltaAt?: string;
}

export interface ResumenAlertas {
  total: number;
  pendientes: number;
  criticas: number;
  porTipo: Record<string, number>;
}

export const alertasApi = {
  /**
   * Obtener alertas del usuario actual
   */
  getMisAlertas: async (): Promise<{ data: Alerta[] }> => {
    return apiClient.get<{ data: Alerta[] }>('/alertas/mis-alertas');
  },

  /**
   * Obtener todas las alertas pendientes (admin)
   */
  getTodasAlertas: async (): Promise<{ data: Alerta[] }> => {
    return apiClient.get<{ data: Alerta[] }>('/alertas/todas');
  },

  /**
   * Obtener resumen de alertas para dashboard
   */
  getResumen: async (): Promise<ResumenAlertas> => {
    return apiClient.get<ResumenAlertas>('/alertas/resumen');
  },

  /**
   * Marcar alerta como leída
   */
  marcarLeida: async (id: string): Promise<{ message: string; data: Alerta }> => {
    return apiClient.post<{ message: string; data: Alerta }>(`/alertas/${id}/leer`);
  },

  /**
   * Marcar alerta como resuelta
   */
  marcarResuelta: async (id: string): Promise<{ message: string; data: Alerta }> => {
    return apiClient.post<{ message: string; data: Alerta }>(`/alertas/${id}/resolver`);
  },

  /**
   * Ejecutar verificación manual de alertas (admin)
   */
  ejecutarVerificacion: async (): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/alertas/ejecutar-verificacion');
  },
};
