import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import type { LessonMaterial } from '../../types';

export interface CreateLessonMaterialData {
  lesson: string;
  name: string;
  description?: string;
  type:
    | 'pdf'
    | 'video'
    | 'presentation'
    | 'link'
    | 'document'
    | 'image'
    | 'other';
  url: string;
  storageKey?: string;
}

export interface UpdateLessonMaterialData {
  name?: string;
  description?: string;
  type?:
    | 'pdf'
    | 'video'
    | 'presentation'
    | 'link'
    | 'document'
    | 'image'
    | 'other';
  url?: string;
  storageKey?: string;
}

export interface LessonMaterialListParams {
  lesson?: string;
  course?: string;
  professor?: string;
}

export const lessonMaterialsApi = {
  list: async (
    params?: LessonMaterialListParams
  ): Promise<LessonMaterial[]> => {
    const { data } = await apiClient.get<LessonMaterial[]>(
      API_ENDPOINTS.lessonMaterials.list,
      {
        params,
      }
    );
    return data;
  },

  getById: async (id: string): Promise<LessonMaterial> => {
    const { data } = await apiClient.get<LessonMaterial>(
      API_ENDPOINTS.lessonMaterials.detail(id)
    );
    return data;
  },

  create: async (
    materialData: CreateLessonMaterialData
  ): Promise<LessonMaterial> => {
    const { data } = await apiClient.post<LessonMaterial>(
      API_ENDPOINTS.lessonMaterials.create,
      materialData
    );
    return data;
  },

  update: async (
    id: string,
    materialData: UpdateLessonMaterialData
  ): Promise<LessonMaterial> => {
    const { data } = await apiClient.put<LessonMaterial>(
      API_ENDPOINTS.lessonMaterials.update(id),
      materialData
    );
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete<{ message: string }>(
      API_ENDPOINTS.lessonMaterials.delete(id)
    );
    return data;
  },
};
