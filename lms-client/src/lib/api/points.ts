import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import type { Point } from '../../types';

export interface CreatePointData {
  student: string;
  course: string;
  points: number;
  maxPoints: number;
  title: string;
  description?: string;
  date?: string;
}

export interface UpdatePointData {
  points?: number;
  maxPoints?: number;
  title?: string;
  description?: string;
  date?: string;
}

export interface PointListParams {
  student?: string;
  course?: string;
  professor?: string;
}

export const pointsApi = {
  list: async (params?: PointListParams): Promise<Point[]> => {
    const { data } = await apiClient.get<Point[]>(API_ENDPOINTS.points.list, {
      params,
    });
    return data;
  },

  getById: async (id: string): Promise<Point> => {
    const { data } = await apiClient.get<Point>(
      API_ENDPOINTS.points.detail(id)
    );
    return data;
  },

  create: async (pointData: CreatePointData): Promise<Point> => {
    const { data } = await apiClient.post<Point>(
      API_ENDPOINTS.points.create,
      pointData
    );
    return data;
  },

  update: async (id: string, pointData: UpdatePointData): Promise<Point> => {
    const { data } = await apiClient.put<Point>(
      API_ENDPOINTS.points.update(id),
      pointData
    );
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete<{ message: string }>(
      API_ENDPOINTS.points.delete(id)
    );
    return data;
  },
};
