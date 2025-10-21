import { api } from './client';

export type Severidad = 'baja' | 'media' | 'alta';
export type TipoEquipo = 'CCTV' | 'Radio Enlace' | 'Torre' | 'Otro';

export interface Falla {
  id: string;
  codigo: string;
  nombre: string;
  tipo_equipo: TipoEquipo;
  severidad: Severidad;
  descripcion?: string;
  causas_probables?: string;
  acciones_sugeridas?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface FailuresFilters {
  page?: number;
  limit?: number;
  tipo_equipo?: TipoEquipo;
  severidad?: Severidad;
  activo?: boolean;
  search?: string;
}

export const failuresAPI = {
  list: (filters?: FailuresFilters) => api.get<{ data: Falla[] }>('/failures', (filters || {}) as unknown as Record<string, unknown>),
  get: (id: string) => api.get<{ data: Falla }>(`/failures/${id}`),
  create: (payload: Partial<Falla>) => api.post<{ data: Falla }>(`/failures`, payload),
  update: (id: string, payload: Partial<Falla>) => api.patch<{ data: Falla }>(`/failures/${id}`, payload),
  remove: (id: string) => api.delete<{ data: Falla }>(`/failures/${id}`),
  assignToOrder: (orden_id: string, falla_ids: string[]) => api.post<{ message: string }>(`/failures/assign`, { orden_id, falla_ids }),
  listByOrder: (ordenId: string) => api.get<{ data: Falla[] }>(`/failures/by-order/${ordenId}`),
};
