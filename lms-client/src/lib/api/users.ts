import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import type { User } from '../../types';

export interface CreateUserData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'professor' | 'student';
  status?: 'active' | 'pending' | 'disabled';
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: 'admin' | 'professor' | 'student';
  status?: 'active' | 'pending' | 'disabled';
  password?: string;
}

export interface UserListParams {
  role?: 'admin' | 'professor' | 'student';
  status?: 'active' | 'pending' | 'disabled';
  email?: string;
}

export const usersApi = {
  list: async (params?: UserListParams): Promise<User[]> => {
    const { data } = await apiClient.get<User[]>(API_ENDPOINTS.users.list, {
      params,
    });
    return data;
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await apiClient.get<User>(API_ENDPOINTS.users.detail(id));
    return data;
  },

  create: async (userData: CreateUserData): Promise<User> => {
    const { data } = await apiClient.post<User>(
      API_ENDPOINTS.users.create,
      userData
    );
    return data;
  },

  update: async (id: string, userData: UpdateUserData): Promise<User> => {
    const { data } = await apiClient.put<User>(
      API_ENDPOINTS.users.update(id),
      userData
    );
    return data;
  },

  delete: async (id: string): Promise<{ message: string; id: string }> => {
    const { data } = await apiClient.delete<{ message: string; id: string }>(
      API_ENDPOINTS.users.delete(id)
    );
    return data;
  },

  approve: async (id: string): Promise<User> => {
    const { data } = await apiClient.patch<User>(
      API_ENDPOINTS.users.approve(id)
    );
    return data;
  },
};
