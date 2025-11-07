import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import type { Lesson, LessonMaterial } from '../../types';

export interface CreateLessonData {
  course: string;
  title: string;
  content?: string;
  materials?: LessonMaterial[];
}

export interface UpdateLessonData {
  title?: string;
  content?: string;
  materials?: LessonMaterial[];
}

export interface LessonListParams {
  course?: string;
}

export const lessonsApi = {
  list: async (params?: LessonListParams): Promise<Lesson[]> => {
    const { data } = await apiClient.get<Lesson[]>(API_ENDPOINTS.lessons.list, {
      params,
    });
    return data;
  },

  getById: async (id: string): Promise<Lesson> => {
    const { data } = await apiClient.get<Lesson>(API_ENDPOINTS.lessons.detail(id));
    return data;
  },

  create: async (lessonData: CreateLessonData): Promise<Lesson> => {
    const { data } = await apiClient.post<Lesson>(
      API_ENDPOINTS.lessons.create,
      lessonData
    );
    return data;
  },

  update: async (id: string, lessonData: UpdateLessonData): Promise<Lesson> => {
    const { data } = await apiClient.put<Lesson>(
      API_ENDPOINTS.lessons.update(id),
      lessonData
    );
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete<{ message: string }>(
      API_ENDPOINTS.lessons.delete(id)
    );
    return data;
  },
};
