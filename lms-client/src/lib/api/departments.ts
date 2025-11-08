import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import type { Department } from '../../types';

export interface CreateDepartmentData {
  name: string;
  description?: string;
}

export interface UpdateDepartmentData {
  name?: string;
  description?: string;
}

export interface DepartmentListParams {
  name?: string;
}

export const departmentsApi = {
  list: async (params?: DepartmentListParams): Promise<Department[]> => {
    const { data } = await apiClient.get<Department[]>(
      API_ENDPOINTS.departments.list,
      { params }
    );
    return data;
  },

  getById: async (id: string): Promise<Department> => {
    const { data } = await apiClient.get<Department>(
      API_ENDPOINTS.departments.detail(id)
    );
    return data;
  },

  create: async (
    departmentData: CreateDepartmentData
  ): Promise<Department> => {
    const { data } = await apiClient.post<Department>(
      API_ENDPOINTS.departments.create,
      departmentData
    );
    return data;
  },

  update: async (
    id: string,
    departmentData: UpdateDepartmentData
  ): Promise<Department> => {
    const { data } = await apiClient.put<Department>(
      API_ENDPOINTS.departments.update(id),
      departmentData
    );
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete<{ message: string }>(
      API_ENDPOINTS.departments.delete(id)
    );
    return data;
  },
};
