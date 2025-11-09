import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import type { Exam } from '../../types';

export interface CreateExamData {
  course: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  maxPoints: number;
  passingPoints: number;
  type: 'preliminary' | 'finishing';
  subscriptionDeadline: string;
  isActive?: boolean;
}

export interface UpdateExamData {
  title?: string;
  description?: string;
  date?: string;
  location?: string;
  maxPoints?: number;
  passingPoints?: number;
  type?: 'preliminary' | 'finishing';
  subscriptionDeadline?: string;
  isActive?: boolean;
}

export interface ExamListParams {
  course?: string;
  professor?: string;
  isActive?: boolean;
}

export const examsApi = {
  list: async (params?: ExamListParams): Promise<Exam[]> => {
    const { data } = await apiClient.get<Exam[]>(API_ENDPOINTS.exams.list, {
      params,
    });
    return data;
  },

  getById: async (id: string): Promise<Exam> => {
    const { data } = await apiClient.get<Exam>(API_ENDPOINTS.exams.detail(id));
    return data;
  },

  create: async (examData: CreateExamData): Promise<Exam> => {
    const { data } = await apiClient.post<Exam>(
      API_ENDPOINTS.exams.create,
      examData
    );
    return data;
  },

  update: async (id: string, examData: UpdateExamData): Promise<Exam> => {
    const { data } = await apiClient.put<Exam>(
      API_ENDPOINTS.exams.update(id),
      examData
    );
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete<{ message: string }>(
      API_ENDPOINTS.exams.delete(id)
    );
    return data;
  },
};
