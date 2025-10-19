/**
 * Cliente API para gestión de usuarios
 */

import { api } from './client';

// Tipos
export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  rol?: 'admin' | 'coordinador' | 'tecnico' | 'gerente' | 'cliente';
  activo?: boolean;
  [key: string]: unknown;
}

export interface CreateUserInput {
  email: string;
  password: string;
  nombre: string;
  rol: 'admin' | 'coordinador' | 'tecnico' | 'gerente' | 'cliente';
  telefono?: string;
  empresa?: string;
  activo?: boolean;
}

export interface UpdateUserInput {
  nombre?: string;
  telefono?: string;
  empresa?: string;
  avatar_url?: string;
  activo?: boolean;
  rol?: 'admin' | 'coordinador' | 'tecnico' | 'gerente' | 'cliente';
}

export interface User {
  id: string;
  email: string;
  nombre: string;
  rol: 'admin' | 'coordinador' | 'tecnico' | 'gerente' | 'cliente';
  empresa: string | null;
  telefono: string | null;
  avatar_url: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface UsersListResponse {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserResponse {
  data: User;
  message?: string;
}

// API Client
export const usersAPI = {
  /**
   * Listar usuarios con filtros y paginación
   */
  list: (filters?: UserFilters) => {
    return api.get<UsersListResponse>('/users', filters);
  },

  /**
   * Obtener un usuario por ID
   */
  get: (id: string) => {
    return api.get<UserResponse>(`/users/${id}`);
  },

  /**
   * Crear un nuevo usuario
   */
  create: (data: CreateUserInput) => {
    return api.post<UserResponse>('/users', data);
  },

  /**
   * Actualizar un usuario
   */
  update: (id: string, data: UpdateUserInput) => {
    return api.patch<UserResponse>(`/users/${id}`, data);
  },

  /**
   * Eliminar (desactivar) un usuario
   */
  delete: (id: string) => {
    return api.delete<{ message: string }>(`/users/${id}`);
  },

  /**
   * Actualizar rol de usuario
   */
  updateRole: (id: string, rol: User['rol']) => {
    return api.patch<UserResponse>(`/users/${id}`, { rol });
  },
};
