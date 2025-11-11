import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import type { Consultation, CreateConsultationData } from '../../types';

export const consultationsApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
    professorId?: string;
    courseId?: string;
    status?: string;
    upcoming?: boolean;
  }): Promise<Consultation[]> => {
    const { data } = await apiClient.get<Consultation[]>(
      API_ENDPOINTS.consultations.list,
      { params }
    );
    return data;
  },

  getById: async (id: string): Promise<Consultation> => {
    const { data } = await apiClient.get<Consultation>(
      API_ENDPOINTS.consultations.detail(id)
    );
    return data;
  },

  create: async (payload: CreateConsultationData): Promise<Consultation> => {
    const { data } = await apiClient.post<Consultation>(
      API_ENDPOINTS.consultations.create,
      payload
    );
    return data;
  },

  update: async (
    id: string,
    payload: Partial<CreateConsultationData>
  ): Promise<Consultation> => {
    const { data } = await apiClient.put<Consultation>(
      API_ENDPOINTS.consultations.update(id),
      payload
    );
    return data;
  },

  delete: async (id: string): Promise<{ message: string; id: string }> => {
    const { data } = await apiClient.delete<{ message: string; id: string }>(
      API_ENDPOINTS.consultations.delete(id)
    );
    return data;
  },

  register: async (id: string): Promise<Consultation> => {
    const { data } = await apiClient.post<Consultation>(
      API_ENDPOINTS.consultations.register(id)
    );
    return data;
  },

  unregister: async (id: string): Promise<Consultation> => {
    const { data } = await apiClient.post<Consultation>(
      API_ENDPOINTS.consultations.unregister(id)
    );
    return data;
  },
};
