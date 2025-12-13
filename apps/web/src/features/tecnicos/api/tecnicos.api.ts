/**
 * @file tecnicos.api.ts
 * @description API client para el feature de Técnicos usando axios
 */

import axios from 'axios';
import type {
  Tecnico,
  TecnicoFilters,
  TecnicoStats,
  CreateTecnicoInput,
  UpdateTecnicoInput,
  PaginatedTecnicos,
} from './tecnicos.types';

// Configuración del cliente API
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

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

    const response = await api.get<PaginatedTecnicos>(`/api/tecnicos?${params}`);
    return response.data;
  },

  /**
   * Obtiene un técnico por ID
   */
  async getById(id: string): Promise<Tecnico> {
    const response = await api.get<Tecnico>(`/api/tecnicos/${id}`);
    return response.data;
  },

  /**
   * Obtiene estadísticas de técnicos
   */
  async getStats(): Promise<TecnicoStats> {
    const response = await api.get<TecnicoStats>('/api/tecnicos/stats');
    return response.data;
  },

  /**
   * Crea nuevo técnico
   */
  async create(input: CreateTecnicoInput): Promise<Tecnico> {
    const response = await api.post<Tecnico>('/api/tecnicos', input);
    return response.data;
  },

  /**
   * Actualiza técnico
   */
  async update(id: string, input: UpdateTecnicoInput): Promise<Tecnico> {
    const response = await api.put<Tecnico>(`/api/tecnicos/${id}`, input);
    return response.data;
  },

  /**
   * Elimina técnico
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/api/tecnicos/${id}`);
  },

  /**
   * Cambia disponibilidad del técnico
   */
  async toggleDisponibilidad(id: string, disponible: boolean): Promise<Tecnico> {
    const response = await api.patch<Tecnico>(`/api/tecnicos/${id}/disponibilidad`, {
      disponible,
    });
    return response.data;
  },
};

export default tecnicosApi;
