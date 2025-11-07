import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import type { Enrollment } from '../../types';

export interface CreateEnrollmentData {
  student: string;
  course: string;
  status?: 'active' | 'completed' | 'cancelled' | 'paused';
}

export interface UpdateEnrollmentData {
  status?: 'active' | 'completed' | 'cancelled' | 'paused';
}

export interface AddPaymentData {
  amount: number;
  date?: string;
}

export interface EnrollmentListParams {
  student?: string;
  course?: string;
  status?: 'active' | 'completed' | 'cancelled' | 'paused';
}

export const enrollmentsApi = {
  list: async (params?: EnrollmentListParams): Promise<Enrollment[]> => {
    const { data } = await apiClient.get<Enrollment[]>(
      API_ENDPOINTS.enrollments.list,
      { params }
    );
    return data;
  },

  getById: async (id: string): Promise<Enrollment> => {
    const { data } = await apiClient.get<Enrollment>(
      API_ENDPOINTS.enrollments.detail(id)
    );
    return data;
  },

  create: async (enrollmentData: CreateEnrollmentData): Promise<Enrollment> => {
    const { data } = await apiClient.post<Enrollment>(
      API_ENDPOINTS.enrollments.create,
      enrollmentData
    );
    return data;
  },

  update: async (
    id: string,
    enrollmentData: UpdateEnrollmentData
  ): Promise<Enrollment> => {
    const { data } = await apiClient.put<Enrollment>(
      API_ENDPOINTS.enrollments.update(id),
      enrollmentData
    );
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete<{ message: string }>(
      API_ENDPOINTS.enrollments.delete(id)
    );
    return data;
  },

  addPayment: async (
    id: string,
    paymentData: AddPaymentData
  ): Promise<Enrollment> => {
    const { data } = await apiClient.post<Enrollment>(
      API_ENDPOINTS.enrollments.addPayment(id),
      paymentData
    );
    return data;
  },
};
