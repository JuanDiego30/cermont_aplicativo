/**
 * Users API Service
 */

import apiClient from '@/core/api/client';
import { User, CreateUserDTO, UpdateUserDTO, UserFilters, UsersResponse } from '../types';

export const usersApi = {
  getAll: async (filters?: UserFilters): Promise<UsersResponse> => {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.active !== undefined) params.append('active', String(filters.active));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    return apiClient.get<UsersResponse>(`/users?${params.toString()}`);
  },

  getById: async (id: string): Promise<User> => {
    return apiClient.get<User>(`/users/${id}`);
  },

  create: async (data: CreateUserDTO): Promise<User> => {
    return apiClient.post<User>('/users', data);
  },

  update: async (id: string, data: UpdateUserDTO): Promise<User> => {
    return apiClient.put<User>(`/users/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  activate: async (id: string): Promise<User> => {
    return apiClient.post<User>(`/users/${id}/activate`);
  },

  deactivate: async (id: string): Promise<User> => {
    return apiClient.post<User>(`/users/${id}/deactivate`);
  },

  changePassword: async (id: string, newPassword: string): Promise<void> => {
    await apiClient.post(`/users/${id}/change-password`, { newPassword });
  },
};
