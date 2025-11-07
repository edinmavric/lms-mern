import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import type { Grade } from '../../types';

export interface CreateGradeData {
  student: string;
  course: string;
  value: number;
  comment?: string;
  attempt?: number;
}

export interface UpdateGradeData {
  value?: number;
  comment?: string;
}

export interface GradeListParams {
  student?: string;
  course?: string;
  professor?: string;
  attempt?: number;
}

export const gradesApi = {
  list: async (params?: GradeListParams): Promise<Grade[]> => {
    const { data } = await apiClient.get<Grade[]>(API_ENDPOINTS.grades.list, {
      params,
    });
    return data;
  },

  getById: async (id: string): Promise<Grade> => {
    const { data } = await apiClient.get<Grade>(API_ENDPOINTS.grades.detail(id));
    return data;
  },

  create: async (gradeData: CreateGradeData): Promise<Grade> => {
    const { data } = await apiClient.post<Grade>(
      API_ENDPOINTS.grades.create,
      gradeData
    );
    return data;
  },

  update: async (id: string, gradeData: UpdateGradeData): Promise<Grade> => {
    const { data } = await apiClient.put<Grade>(
      API_ENDPOINTS.grades.update(id),
      gradeData
    );
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete<{ message: string }>(
      API_ENDPOINTS.grades.delete(id)
    );
    return data;
  },
};
