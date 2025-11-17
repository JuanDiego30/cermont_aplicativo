import apiClient from './client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  mfaEnabled: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  name: string;
  role: string;
}

export interface UpdateUserDTO {
  name?: string;
  role?: string;
  mfaEnabled?: boolean;
}

export const usersApi = {
  async list(params?: { page?: number; limit?: number; role?: string; active?: boolean }): Promise<any> {
    const { data } = await apiClient.get('/users', { params });
    return data;
  },

  async getById(id: string): Promise<User> {
    const { data } = await apiClient.get(`/users/${id}`);
    return data.data;
  },

  async create(userData: CreateUserDTO): Promise<User> {
    const { data } = await apiClient.post('/users', userData);
    return data.data;
  },

  async update(id: string, userData: UpdateUserDTO): Promise<User> {
    const { data } = await apiClient.put(`/users/${id}`, userData);
    return data.data;
  },

  async changePassword(id: string, newPassword: string): Promise<void> {
    await apiClient.post(`/users/${id}/change-password`, { newPassword });
  },

  async activate(id: string): Promise<User> {
    const { data } = await apiClient.post(`/users/${id}/activate`);
    return data.data;
  },

  async deactivate(id: string): Promise<User> {
    const { data } = await apiClient.post(`/users/${id}/deactivate`);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },
};
