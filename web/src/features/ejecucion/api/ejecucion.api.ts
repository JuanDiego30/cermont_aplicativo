// ============================================
// EJECUCIÓN API - Cermont FSM
// Cliente API para ejecución de órdenes
// ============================================

import { apiClient } from '@/lib/api';

export interface Ejecucion {
  id: string;
  ordenId: string;
  planeacionId: string;
  estado: EjecucionEstado;
  fechaInicioReal?: string;
  fechaFinReal?: string;
  progreso: number;
  ubicacionInicio?: UbicacionGPS;
  ubicacionFin?: UbicacionGPS;
  observaciones?: string;
  ejecutorId: string;
  tareas: TareaEjecucion[];
  checklists: ChecklistEjecucion[];
  createdAt: string;
  updatedAt: string;
}

export type EjecucionEstado = 
  | 'pendiente'
  | 'en_progreso'
  | 'pausada'
  | 'completada'
  | 'cancelada';

export interface TareaEjecucion {
  id: string;
  ejecucionId: string;
  descripcion: string;
  estado: 'pendiente' | 'en_progreso' | 'completada';
  orden: number;
  tiempoEstimado?: number;
  tiempoReal?: number;
  observaciones?: string;
  completadaAt?: string;
}

export interface ChecklistEjecucion {
  id: string;
  ejecucionId: string;
  descripcion: string;
  completado: boolean;
  obligatorio: boolean;
  orden: number;
  completadoAt?: string;
  completadoPor?: string;
}

export interface UbicacionGPS {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: string;
}

export interface IniciarEjecucionInput {
  ordenId: string;
  ubicacion?: UbicacionGPS;
  observaciones?: string;
}

export interface ActualizarProgresoInput {
  progreso?: number;
  observaciones?: string;
  ubicacion?: UbicacionGPS;
}

export interface CompletarTareaInput {
  observaciones?: string;
  tiempoReal?: number;
}

export const ejecucionApi = {
  /**
   * Obtener ejecución por orden ID
   */
  getByOrdenId: async (ordenId: string): Promise<Ejecucion> => {
    const response = await apiClient.get<{ status: string; data: Ejecucion }>(
      `/ejecucion/orden/${ordenId}`
    );
    return response.data;
  },

  /**
   * Obtener ejecución por ID
   */
  getById: async (id: string): Promise<Ejecucion> => {
    const response = await apiClient.get<{ status: string; data: Ejecucion }>(
      `/ejecucion/${id}`
    );
    return response.data;
  },

  /**
   * Iniciar ejecución
   */
  iniciar: async (data: IniciarEjecucionInput): Promise<Ejecucion> => {
    const response = await apiClient.post<{ status: string; data: Ejecucion }>(
      '/ejecucion/iniciar',
      data
    );
    return response.data;
  },

  /**
   * Actualizar progreso
   */
  actualizarProgreso: async (id: string, data: ActualizarProgresoInput): Promise<Ejecucion> => {
    const response = await apiClient.patch<{ status: string; data: Ejecucion }>(
      `/ejecucion/${id}/progreso`,
      data
    );
    return response.data;
  },

  /**
   * Pausar ejecución
   */
  pausar: async (id: string, motivo?: string): Promise<Ejecucion> => {
    const response = await apiClient.post<{ status: string; data: Ejecucion }>(
      `/ejecucion/${id}/pausar`,
      { motivo }
    );
    return response.data;
  },

  /**
   * Reanudar ejecución
   */
  reanudar: async (id: string): Promise<Ejecucion> => {
    const response = await apiClient.post<{ status: string; data: Ejecucion }>(
      `/ejecucion/${id}/reanudar`
    );
    return response.data;
  },

  /**
   * Completar ejecución
   */
  completar: async (id: string, ubicacion?: UbicacionGPS): Promise<Ejecucion> => {
    const response = await apiClient.post<{ status: string; data: Ejecucion }>(
      `/ejecucion/${id}/completar`,
      { ubicacion }
    );
    return response.data;
  },

  /**
   * Completar tarea
   */
  completarTarea: async (
    ejecucionId: string, 
    tareaId: string, 
    data?: CompletarTareaInput
  ): Promise<TareaEjecucion> => {
    const response = await apiClient.patch<{ status: string; data: TareaEjecucion }>(
      `/ejecucion/${ejecucionId}/tareas/${tareaId}/completar`,
      data
    );
    return response.data;
  },

  /**
   * Marcar checklist
   */
  marcarChecklist: async (
    ejecucionId: string, 
    checklistId: string, 
    completado: boolean
  ): Promise<ChecklistEjecucion> => {
    const response = await apiClient.patch<{ status: string; data: ChecklistEjecucion }>(
      `/ejecucion/${ejecucionId}/checklist/${checklistId}`,
      { completado }
    );
    return response.data;
  },

  /**
   * Obtener ejecuciones activas del usuario
   */
  getMisEjecuciones: async (): Promise<Ejecucion[]> => {
    const response = await apiClient.get<{ status: string; data: Ejecucion[] }>(
      '/ejecucion/mis-ejecuciones'
    );
    return response.data;
  },

  /**
   * Registrar ubicación GPS
   */
  registrarUbicacion: async (id: string, ubicacion: UbicacionGPS): Promise<void> => {
    await apiClient.post(`/ejecucion/${id}/ubicacion`, ubicacion);
  },
};
