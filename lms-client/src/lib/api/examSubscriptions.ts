import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import type { ExamSubscription, Grade } from '../../types';

export interface ExamSubscriptionListParams {
  exam?: string;
  student?: string;
  status?: 'subscribed' | 'graded' | 'passed' | 'failed';
}

export interface GradeExamData {
  points: number;
  grade?: number;
  comment?: string;
}

export const examSubscriptionsApi = {
  list: async (
    params?: ExamSubscriptionListParams
  ): Promise<ExamSubscription[]> => {
    const { data } = await apiClient.get<ExamSubscription[]>(
      API_ENDPOINTS.examSubscriptions.list,
      {
        params,
      }
    );
    return data;
  },

  getById: async (id: string): Promise<ExamSubscription> => {
    const { data } = await apiClient.get<ExamSubscription>(
      API_ENDPOINTS.examSubscriptions.detail(id)
    );
    return data;
  },

  subscribe: async (examId: string): Promise<ExamSubscription> => {
    const { data } = await apiClient.post<ExamSubscription>(
      API_ENDPOINTS.examSubscriptions.subscribe(examId)
    );
    return data;
  },

  unsubscribe: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete<{ message: string }>(
      API_ENDPOINTS.examSubscriptions.unsubscribe(id)
    );
    return data;
  },

  grade: async (
    id: string,
    gradeData: GradeExamData
  ): Promise<{ subscription: ExamSubscription; grade: Grade }> => {
    const { data } = await apiClient.post<{
      subscription: ExamSubscription;
      grade: Grade;
    }>(API_ENDPOINTS.examSubscriptions.grade(id), gradeData);
    return data;
  },
};
