/**
 * ARCHIVO: tecnicos.api.ts
 * FUNCION: API client para el feature de Técnicos
 * IMPLEMENTACION: Usa apiClient centralizado para evitar double /api prefix
 * DEPENDENCIAS: @/lib/api (apiClient), tipos locales
 * EXPORTS: tecnicosApi
 */

import { apiClient } from '@/lib/api';
import type {
  Tecnico,
  TecnicoFilters,
  TecnicoStats,
  CreateTecnicoInput,
  UpdateTecnicoInput,
  PaginatedTecnicos,
} from './tecnicos.types';

export const tecnicosApi = {
  /**
   * Obtiene lista paginada de técnicos
   */
  async getAll(filters: TecnicoFilters = {}): Promise<PaginatedTecnicos> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', String(filters.page));
    if (filters.pageSize) params.append('pageSize', String(filters.pageSize || 12));
    if (filters.search) params.append('search', filters.search);
    if (filters.disponible && filters.disponible !== 'todos') {
      params.append('disponible', filters.disponible === 'disponible' ? 'true' : 'false');
    }
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.ubicacion) params.append('ubicacion', filters.ubicacion);
    if (filters.especialidad) params.append('especialidad', filters.especialidad);

    // ✅ CORRECTO: Sin /api al inicio (apiClient ya tiene el baseURL correcto)
    return apiClient.get<PaginatedTecnicos>(`/tecnicos?${params}`);
  },

  /**
   * Obtiene un técnico por ID
   */
  async getById(id: string): Promise<Tecnico> {
    return apiClient.get<Tecnico>(`/tecnicos/${id}`);
  },

  /**
   * Obtiene estadísticas de técnicos
   */
  async getStats(): Promise<TecnicoStats> {
    return apiClient.get<TecnicoStats>('/tecnicos/stats');
  },

  /**
   * Crea nuevo técnico
   */
  async create(input: CreateTecnicoInput): Promise<Tecnico> {
    return apiClient.post<Tecnico>('/tecnicos', input);
  },

  /**
   * Actualiza técnico
   */
  async update(id: string, input: UpdateTecnicoInput): Promise<Tecnico> {
    return apiClient.put<Tecnico>(`/tecnicos/${id}`, input);
  },

  /**
   * Elimina técnico
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/tecnicos/${id}`);
  },

  /**
   * Cambia disponibilidad del técnico
   */
  async toggleDisponibilidad(id: string, disponible: boolean): Promise<Tecnico> {
    return apiClient.patch<Tecnico>(`/tecnicos/${id}/disponibilidad`, {
      disponible,
    });
  },
};

export default tecnicosApi;
