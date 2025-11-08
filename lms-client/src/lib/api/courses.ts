import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import type { Course } from '../../types';

export interface CreateCourseData {
  name: string;
  description?: string;
  professor: string;
  department?: string;
  students?: string[];
  price?: number;
  enrollmentPassword?: string;
  schedule?: {
    days: string[];
    startTime: string;
    endTime: string;
  };
}

export interface UpdateCourseData {
  name?: string;
  description?: string;
  professor?: string;
  department?: string;
  students?: string[];
  price?: number;
  enrollmentPassword?: string;
  schedule?: {
    days: string[];
    startTime: string;
    endTime: string;
  };
}

export interface CourseListParams {
  professor?: string;
  department?: string;
  name?: string;
}

export const coursesApi = {
  list: async (params?: CourseListParams): Promise<Course[]> => {
    const { data } = await apiClient.get<Course[]>(API_ENDPOINTS.courses.list, {
      params,
    });
    return data;
  },

  getById: async (id: string): Promise<Course> => {
    const { data } = await apiClient.get<Course>(API_ENDPOINTS.courses.detail(id));
    return data;
  },

  create: async (courseData: CreateCourseData): Promise<Course> => {
    const { data } = await apiClient.post<Course>(
      API_ENDPOINTS.courses.create,
      courseData
    );
    return data;
  },

  update: async (id: string, courseData: UpdateCourseData): Promise<Course> => {
    const { data } = await apiClient.put<Course>(
      API_ENDPOINTS.courses.update(id),
      courseData
    );
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete<{ message: string }>(
      API_ENDPOINTS.courses.delete(id)
    );
    return data;
  },
};
