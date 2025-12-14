/**
 * ARCHIVO: users.service.ts
 * FUNCION: Gestiona operaciones CRUD sobre usuarios y asignacion de roles
 * IMPLEMENTACION: Patron Service Layer con paginacion y filtros avanzados
 * DEPENDENCIAS: @/lib/api (apiClient), @/types/user
 * EXPORTS: usersService, PaginatedUsers, ListUsersParams, CreateUserInput, UpdateUserInput
 */
import { apiClient } from '@/lib/api';
import type { User, UserRole } from '@/types/user';

export interface PaginatedUsers {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  active?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  phone?: string;
}

export interface UpdateUserInput {
  name?: string;
  role?: UserRole;
  phone?: string;
  avatar?: string;
  active?: boolean;
}

export const usersService = {
  /**
   * Listar usuarios con filtros y paginación
   */
  list: async (params?: ListUsersParams): Promise<PaginatedUsers> => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }

    const query = queryParams.toString();
    return apiClient.get<PaginatedUsers>(`/users${query ? `?${query}` : ''}`);
  },

  /**
   * Obtener usuario por ID
   */
  getById: async (id: string): Promise<User> => {
    return apiClient.get<User>(`/users/${id}`);
  },

  /**
   * Crear nuevo usuario
   */
  create: async (data: CreateUserInput): Promise<User> => {
    return apiClient.post<User>('/users', data);
  },

  /**
   * Actualizar usuario
   */
  update: async (id: string, data: UpdateUserInput): Promise<User> => {
    return apiClient.patch<User>(`/users/${id}`, data);
  },

  /**
   * Eliminar usuario (soft delete)
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  /**
   * Activar/desactivar usuario
   */
  toggleActive: async (id: string, active: boolean): Promise<User> => {
    return apiClient.patch<User>(`/users/${id}/active`, { active });
  },

  /**
   * Cambiar rol de usuario
   */
  changeRole: async (id: string, role: UserRole): Promise<User> => {
    return apiClient.patch<User>(`/users/${id}/role`, { role });
  },

  /**
   * Obtener técnicos disponibles (para asignar órdenes)
   */
  getTechnicians: async (): Promise<User[]> => {
    const response = await apiClient.get<PaginatedUsers>('/users?role=tecnico&active=true');
    return response.data;
  },
};
