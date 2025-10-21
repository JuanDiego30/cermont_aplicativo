/**
 * API Client para el catálogo de herramientas por actividad
 */

import { api } from './client';
import type { ActividadHerramienta, TipoEquipo, TipoOrden } from '@/lib/types/database';

export interface ToolFilters extends Record<string, unknown> {
  tipo_orden?: TipoOrden;
  tipo_equipo?: TipoEquipo;
  categoria?: string;
  activo?: boolean;
  search?: string;
}

export interface ToolListResponse {
  data: ActividadHerramienta[];
}

export interface ToolResponse {
  data: ActividadHerramienta;
  message?: string;
}

export const toolsAPI = {
  list: async (filters?: ToolFilters) => {
  return api.get<ToolListResponse>('/tools', filters);
  },

  create: async (payload: Partial<ActividadHerramienta>) => {
    return api.post<ToolResponse>('/tools', payload);
  },

  update: async (id: string, payload: Partial<ActividadHerramienta>) => {
    return api.patch<ToolResponse>(`/tools/${id}`, payload);
  },

  deactivate: async (id: string) => {
    return api.delete<ToolResponse>(`/tools/${id}`);
  },
};
