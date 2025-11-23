import apiClient from './client';
import { User, CreateUserDTO, UpdateUserDTO, UserFilters, UsersResponse } from '../types/user';

export const usersApi = {
  getAll: async (filters?: UserFilters): Promise<UsersResponse> => {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.active !== undefined) params.append('active', String(filters.active));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const response = await apiClient.get<UsersResponse>(`/users?${params.toString()}`);
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get<{ success: boolean; data: User }>(`/users/${id}`);
    return response.data.data;
  },

  create: async (data: CreateUserDTO): Promise<User> => {
    const response = await apiClient.post<{ success: boolean; data: User }>('/users', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateUserDTO): Promise<User> => {
    const response = await apiClient.put<{ success: boolean; data: User }>(`/users/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  activate: async (id: string): Promise<User> => {
    const response = await apiClient.post<{ success: boolean; data: User }>(`/users/${id}/activate`);
    return response.data.data;
  },

  deactivate: async (id: string): Promise<User> => {
    const response = await apiClient.post<{ success: boolean; data: User }>(`/users/${id}/deactivate`);
    return response.data.data;
  },
};
